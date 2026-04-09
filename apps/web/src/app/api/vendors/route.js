import _db from "@repo/lib/db";
import VendorServicesModel from "@repo/lib/models/Vendor/VendorServices.model";
import RegionModel from "@repo/lib/models/admin/Region.model";
import CRMOfferModel from "@repo/lib/models/Vendor/CRMOffer.model.js";
import AdminOfferModel from "@repo/lib/models/admin/AdminOffers.model.js";
import ReviewModel from "@repo/lib/models/Review/Review.model";
import AppointmentModel from "@repo/lib/models/Appointment/Appointment.model.js";
import mongoose from "mongoose";

const setCorsHeaders = (response) => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
};

export const OPTIONS = async () => {
  return setCorsHeaders(new Response(null, { status: 200 }));
};

export const GET = async (request) => {
  try {
    const db = await _db();
    if (!db) {
      return setCorsHeaders(
        Response.json(
          { success: false, message: "Service unavailable", vendors: [] },
          { status: 503 }
        )
      );
    }

    const { searchParams } = new URL(request.url);
    const serviceName = searchParams.get("serviceName")?.trim() || "";
    const offerCode = searchParams.get("offerCode")?.trim() || "";
    const urlRegionId = searchParams.get("regionId")?.trim();
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");
    const lat = latStr ? parseFloat(latStr) : NaN;
    const lng = lngStr ? parseFloat(lngStr) : NaN;
    const city = searchParams.get("city")?.trim() || searchParams.get("locationLabel")?.trim() || "";

    /* ── Determine region filter ─────────────────────────────────────────── */
    let regionId = urlRegionId && mongoose.Types.ObjectId.isValid(urlRegionId) ? new mongoose.Types.ObjectId(urlRegionId) : null;
    let useCityFallback = false;
    let cityLegacy = null;

    // Only detect region if not explicitly provided via regionId param
    if (!regionId) {
      const { assignRegion } = await import("@repo/lib/utils/assignRegion.js");
      const detectedRegionId = await assignRegion(city, null, { lat, lng });
      
      if (detectedRegionId) {
        regionId = detectedRegionId;
      } else if (city && city !== "Current Location" && city !== "") {
        useCityFallback = true;
        cityLegacy = city.split(',')[0].trim();
      }
    }

    /* ── Handle Offer Filtering ─────────────────────────────────────────── */
    let offerVendorIds = null;
    let offerRegionId = null;

    if (offerCode) {
      // 1. Try CRM Offers (Vendor Specific)
      const crmOffer = await CRMOfferModel.findOne({ 
        code: offerCode, 
        isActive: { $ne: false },
        startDate: { $lte: new Date() },
        $or: [{ expires: null }, { expires: { $gte: new Date() } }]
      }).lean();

      if (crmOffer) {
        offerVendorIds = [crmOffer.businessId];
        console.log(`[SearchAPI] Filtering by CRM offer: ${offerCode} for vendor: ${crmOffer.businessId}`);
      } else {
        // 2. Try Admin Offers (Regional / Global)
        const adminOffer = await AdminOfferModel.findOne({ 
          code: offerCode, 
          isActive: { $ne: false },
          startDate: { $lte: new Date() },
          $or: [{ expires: null }, { expires: { $gte: new Date() } }]
        }).lean();

        if (adminOffer) {
          if (adminOffer.regionId) {
            offerRegionId = adminOffer.regionId;
            console.log(`[SearchAPI] Filtering by Admin Regional offer: ${offerCode} for region: ${offerRegionId}`);
          } else {
            // Global offer - check if any regions are excluded
            console.log(`[SearchAPI] Global Admin offer: ${offerCode} applied.`);
            // No strict region filter for global offers unless specified
          }
        }
      }
    }

    /* ── Parse Category IDs safely ───────────────────────────────────────── */
    const categoryIdsStr = searchParams.get("categoryIds");
    let categoryIds = [];
    if (categoryIdsStr) {
      categoryIds = categoryIdsStr
        .split(",")
        .map((id) => id.trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    /* ── Aggregation Pipeline ────────────────────────────────────────────── */
    const pipeline = [];

    /* 1️⃣ Join vendors */
    pipeline.push({
      $lookup: {
        from: "vendors",
        localField: "vendor",
        foreignField: "_id",
        as: "vendorData",
      },
    });

    pipeline.push({ $unwind: "$vendorData" });

    /* 2️⃣ Vendor-level filtering */
    const vendorMatch = { "vendorData.status": "Approved" };

    // Priority 1: Offer-based Vendor Filter
    if (offerVendorIds && offerVendorIds.length > 0) {
      vendorMatch["vendorData._id"] = { $in: offerVendorIds.map(id => new mongoose.Types.ObjectId(id)) };
    } 
    // Priority 2: Offer-based Region Filter OR Explicit Region Filter
    else if (offerRegionId || regionId) {
      const targetRegionId = new mongoose.Types.ObjectId(offerRegionId || regionId);
      
      // Look up region name for city-fallback
      const region = await RegionModel.findById(targetRegionId).lean();
      const regionName = region?.name || "";

      // If the search string (city) contains a specific area like "College Road",
      // and it's different from the general city/region name, we filter by area.
      const searchParts = city.split(',').map(p => p.trim());
      const specificArea = searchParts[0];
      const isSpecificArea = specificArea && 
                             specificArea.toLowerCase() !== regionName.toLowerCase() && 
                             specificArea !== "Current Location";

      if (isSpecificArea) {
        console.log(`[SearchAPI] Applying neighborhood filter for: ${specificArea} within region: ${regionName}`);
        vendorMatch.$and = [
          {
            $or: [
              { "vendorData.regionId": targetRegionId },
              { "vendorData.city": { $regex: new RegExp(`^${regionName}$`, "i") } }
            ]
          },
          {
            $or: [
              { "vendorData.address": { $regex: new RegExp(specificArea, "i") } },
              { "vendorData.city": { $regex: new RegExp(specificArea, "i") } }
            ]
          }
        ];
      } else {
        vendorMatch.$or = [
          { "vendorData.regionId": targetRegionId },
          { "vendorData.city": { $regex: new RegExp(`^${regionName}$`, "i") } }
        ];
      }
    } 
    // Priority 3: City Fallback (Legacy)
    else if (useCityFallback && cityLegacy) {
      vendorMatch.$or = [
        { "vendorData.city": { $regex: new RegExp(`^${cityLegacy}$`, "i") } },
        { "vendorData.address": { $regex: new RegExp(cityLegacy, "i") } }
      ];
    }

    pipeline.push({ $match: vendorMatch });

    /* 3️⃣ Unwind services */
    pipeline.push({ $unwind: "$services" });

    /* 4️⃣ STRICT service filtering */
    pipeline.push({
      $match: {
        "services.status": "approved",
        ...(categoryIds.length > 0 && {
          "services.category": { $in: categoryIds },
        }),
        ...(serviceName && {
          $or: [
            { "services.name": { $regex: new RegExp(serviceName, "i") } },
            {
              "vendorData.businessName": {
                $regex: new RegExp(serviceName, "i"),
              },
            },
          ],
        }),
      },
    });

    /* 5️⃣ Populate category */
    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "services.category",
        foreignField: "_id",
        as: "services.category",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$services.category",
        preserveNullAndEmptyArrays: true,
      },
    });

    /* 6️⃣ Regroup vendors */
    pipeline.push({
      $group: {
        _id: "$vendorData._id",
        businessName: { $first: "$vendorData.businessName" },
        firstName: { $first: "$vendorData.firstName" },
        lastName: { $first: "$vendorData.lastName" },
        phone: { $first: "$vendorData.phone" },
        city: { $first: "$vendorData.city" },
        state: { $first: "$vendorData.state" },
        category: { $first: "$vendorData.category" },
        subCategories: { $first: "$vendorData.subCategories" },
        profileImage: { $first: "$vendorData.profileImage" },
        description: { $first: "$vendorData.description" },
        location: { $first: "$vendorData.location" },
        regionId: { $first: "$vendorData.regionId" },
        createdAt: { $first: "$vendorData.createdAt" },
        subscription: { $first: "$vendorData.subscription" },
        services: { $push: "$services" },
      },
    });

    /* 7️⃣ Safety net: remove vendors with NO services */
    pipeline.push({ $match: { services: { $ne: [] } } });

    const now = new Date();
    /* Fetch active CRM offers for vendors */
    pipeline.push({
      $lookup: {
        from: "crmoffers",
        let: { vendorId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$businessId", "$$vendorId"] },
                  { $lte: ["$startDate", now] },
                  {
                    $or: [
                      { $eq: ["$expires", null] },
                      { $gte: ["$expires", now] }
                    ]
                  }
                ]
              }
            }
          }
        ],
        as: "offers"
      }
    });

    /* 8️⃣ Sort + Pagination */
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: limit });

    const vendors = await VendorServicesModel.aggregate(pipeline).exec();

    const vendorsWithStats = await Promise.all(
      vendors.map(async (vendor) => {
        const ratingStats = await ReviewModel.aggregate([
          {
            $match: {
              entityId: vendor._id,
              entityType: "salon",
              isApproved: true,
            },
          },
          {
            $group: {
              _id: "$entityId",
              averageRating: { $avg: "$rating" },
              reviewCount: { $sum: 1 },
            },
          },
        ]);

        const clientCountStats = await AppointmentModel.aggregate([
          {
            $match: {
              vendorId: vendor._id,
              status: { $in: ["confirmed", "completed", "scheduled"] },
            },
          },
          {
            $group: {
              _id: "$vendorId",
              uniqueClients: { $addToSet: "$clientPhone" },
            },
          },
          {
            $project: {
              _id: 1,
              clientCount: { $size: "$uniqueClients" },
            },
          },
        ]);

        return {
          ...vendor,
          rating:
            ratingStats.length > 0
              ? ratingStats[0].averageRating.toFixed(1)
              : "0.0",
          reviewCount:
            ratingStats.length > 0 ? ratingStats[0].reviewCount : 0,
          clientCount:
            clientCountStats.length > 0
              ? clientCountStats[0].clientCount
              : 0,
        };
      })
    );

    return setCorsHeaders(
      Response.json({
        success: true,
        vendors: vendorsWithStats,
        count: vendorsWithStats.length,
      })
    );
  } catch (error) {
    console.error("Vendor search error:", error);
    return setCorsHeaders(
      Response.json(
        { success: false, message: "Internal server error", vendors: [] },
        { status: 500 }
      )
    );
  }
};
