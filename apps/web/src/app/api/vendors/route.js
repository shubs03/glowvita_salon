import _db from "@repo/lib/db";
import VendorServicesModel from "@repo/lib/models/Vendor/VendorServices.model";
import RegionModel from "@repo/lib/models/admin/Region.model";
// CRMOfferModel and AdminOfferModel will be dynamically imported
import ReviewModel from "@repo/lib/models/Review/Review.model";
import AppointmentModel from "@repo/lib/models/Appointment/Appointment.model.js";
import ClientModel from "@repo/lib/models/Vendor/Client.model.js";
import mongoose from "mongoose";
import { assignRegion } from "@repo/lib/utils/assignRegion.js";

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
      const detectedRegionId = await assignRegion(city, null, { lat, lng });

      if (detectedRegionId) {
        regionId = detectedRegionId;
      } else if (city && city !== "Current Location" && city !== "") {
        useCityFallback = true;
        cityLegacy = city.split(',')[0].trim();
      }
    }

    let offerVendorIds = null;
    let offerRegionId = null;
    let offerSpecialties = [];
    let offerCategories = [];
    let offerServices = [];
    let offerServiceCategories = [];
    let mainSalonCategories = [];
    let serviceCategoryIdsFromNames = [];

    if (offerCode) {
      // Dynamically import offer models to prevent circular dependencies
      const CRMOfferModel = (await import("@repo/lib/models/Vendor/CRMOffer.model.js")).default;
      const AdminOfferModel = (await import("@repo/lib/models/admin/AdminOffers.model.js")).default;

      // 1. Try CRM Offers (Vendor Specific)
      const crmOffer = await CRMOfferModel.findOne({
        code: new RegExp(`^${offerCode}$`, "i"),
        status: { $ne: "Expired" }
      }).lean();

      if (crmOffer) {
        offerVendorIds = [crmOffer.businessId];
        offerServices = crmOffer.applicableServices || [];
        offerServiceCategories = crmOffer.applicableServiceCategories || [];
        offerSpecialties = (crmOffer.applicableSpecialties || []).filter(s => s !== "");
        offerCategories = (crmOffer.applicableCategories || []).filter(s => s !== "");

        console.log(`[SearchAPI] Filtering by CRM offer: ${offerCode} for vendor: ${crmOffer.businessId}`);
      } else {
        // 2. Try Admin Offers (Regional / Global)
        const adminOffer = await AdminOfferModel.findOne({
          code: new RegExp(`^${offerCode}$`, "i"),
          status: { $ne: "Expired" },
          isActive: { $ne: false }
        }).lean();

        if (adminOffer) {
          offerSpecialties = (adminOffer.applicableSpecialties || []).filter(s => s !== "");
          offerCategories = (adminOffer.applicableCategories || []).filter(s => s !== "");

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

      // Process categories into main salon categories vs service categories
      if (offerCategories && offerCategories.length > 0) {
        const mainSet = new Set(["unisex", "men", "women"]);
        const serviceCategoryNames = [];
        offerCategories.forEach(cat => {
          const lowerCat = cat.toLowerCase();
          if (mainSet.has(lowerCat)) {
            mainSalonCategories.push(lowerCat);
          } else {
            serviceCategoryNames.push(cat);
          }
        });

        if (serviceCategoryNames.length > 0) {
          try {
            const CategoryModel = (await import("@repo/lib/models/admin/Category.model.js")).default;
            const matchedCats = await CategoryModel.find({
              name: { $in: serviceCategoryNames.map(name => new RegExp(`^${name}$`, "i")) }
            }).select("_id").lean();
            serviceCategoryIdsFromNames = matchedCats.map(cat => cat._id);
          } catch (err) {
            console.error("Error looking up service category names:", err);
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
      vendorMatch["vendorData._id"] = { $in: offerVendorIds.map(id => new mongoose.Types.ObjectId(id.toString())) };
    }
    // Priority 2: Offer-based Region Filter OR Explicit Region Filter
    else if (offerRegionId || regionId) {
      const targetRegionId = new mongoose.Types.ObjectId(offerRegionId || regionId);

      // Look up region name for city-fallback
      const region = await RegionModel.findById(targetRegionId).lean();
      const regionName = region?.name || "";

      // If the search string (city) contains a specific area like "College Road",
      // and it's different from the general city/region name, we filter by area.
      vendorMatch.$or = [
        { "vendorData.regionId": targetRegionId },
        { "vendorData.city": { $regex: new RegExp(regionName, "i") } }
      ];
    }
    // Priority 3: City Fallback (Legacy)
    else if (useCityFallback && cityLegacy) {
      vendorMatch.$or = [
        { "vendorData.city": { $regex: new RegExp(cityLegacy, "i") } },
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

        // 🟢 Offer-based filtering: Only show services included in the offer
        ...((offerServices.length > 0 || offerServiceCategories.length > 0 || serviceCategoryIdsFromNames.length > 0 || offerSpecialties.length > 0) && {
          $or: [
            ...(offerServices.length > 0 ? [{ "services._id": { $in: offerServices.map(id => new mongoose.Types.ObjectId(id.toString())) } }] : []),
            ...(offerServiceCategories.length > 0 ? [{ "services.category": { $in: offerServiceCategories.map(id => new mongoose.Types.ObjectId(id.toString())) } }] : []),
            ...(serviceCategoryIdsFromNames.length > 0 ? [{ "services.category": { $in: serviceCategoryIdsFromNames } }] : []),
            ...(offerSpecialties.length > 0 ? [{ "services.name": { $in: offerSpecialties.map(s => new RegExp(s, "i")) } }] : []),
          ]
        }),
        ...(mainSalonCategories.length > 0 && {
          "vendorData.category": { $in: mainSalonCategories }
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

    pipeline.push({
      $lookup: {
        from: "weddingpackages",
        localField: "vendor",
        foreignField: "vendorId",
        as: "weddingPackageList",
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
        vendorType: { $first: "$vendorData.vendorType" },
        services: { $push: "$services" },
        isHomeService: {
          $max: {
            $or: [
              { $in: ["$vendorData.vendorType", ["hybrid", "home-only", "vendor-home-travel"]] },
              { $in: ["at-home", { $ifNull: ["$vendorData.subCategories", []] }] },
              { $eq: ["$services.homeService.available", true] },
              { $eq: ["$services.serviceHomeService.available", true] }
            ]
          }
        },
        isWeddingService: {
          $max: {
            $or: [
              { $eq: ["$services.weddingService.available", true] },
              { $eq: ["$services.serviceWeddingService.available", true] },
              {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: { $ifNull: ["$weddingPackageList", []] },
                        as: "pkg",
                        cond: { $eq: ["$$pkg.isActive", true] }
                      }
                    }
                  },
                  0
                ]
              }
            ]
          }
        },
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

        // Fetch dynamic happy clients count (Online + Offline)
        const [clientPhones, appointmentPhones] = await Promise.all([
          ClientModel.distinct('phone', {
            vendorId: vendor._id,
            phone: { $ne: '', $ne: null }
          }),
          AppointmentModel.distinct('clientPhone', {
            vendorId: vendor._id,
            clientPhone: { $ne: '', $ne: null }
          })
        ]);

        const uniquePhones = new Set([...clientPhones, ...appointmentPhones]);
        const dynamicClientCount = uniquePhones.size || 0;

        return {
          ...vendor,
          rating:
            ratingStats.length > 0
              ? ratingStats[0].averageRating.toFixed(1)
              : "0.0",
          reviewCount:
            ratingStats.length > 0 ? ratingStats[0].reviewCount : 0,
          clientCount: dynamicClientCount,
          dynamicClientCount: dynamicClientCount,
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
