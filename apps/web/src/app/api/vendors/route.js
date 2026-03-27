import _db from "@repo/lib/db";
import VendorServicesModel from "@repo/lib/models/Vendor/VendorServices.model";
import RegionModel from "@repo/lib/models/admin/Region.model";
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
    const categoryIdsStr = searchParams.get("categoryIds");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // ── Coordinate-based location filtering (primary) ──────────────────────
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");
    const lat = latStr ? parseFloat(latStr) : NaN;
    const lng = lngStr ? parseFloat(lngStr) : NaN;

    // ── Legacy city-name fallback ──────────────────────────────────────────
    const city = searchParams.get("city")?.trim();

    /* ── Determine region filter ─────────────────────────────────────────── */
    let regionId = null;
    let useCityFallback = false;
    let cityLegacy = null;

    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      try {
        const region = await RegionModel.findOne({
          geometry: {
            $geoIntersects: {
              $geometry: {
                type: "Point",
                coordinates: [lng, lat], // GeoJSON: [lng, lat]
              },
            },
          },
          isActive: true,
        });

        if (region) {
          regionId = region._id;
          console.log(`[SearchAPI] Region matched: ${region.name} for [${lat}, ${lng}]`);
        } else if (city && city !== "Current Location" && city !== "") {
          // Fallback to city-based matching if coordinates are outside any region
          useCityFallback = true;
          cityLegacy = city;
          console.log(`[SearchAPI] No region for [${lat}, ${lng}] – Falling back to city: ${city}`);
        } else {
          // Coordinates given but outside any defined service area and no city provided
          console.log(`[SearchAPI] No region for [${lat}, ${lng}] and no city fallback – returning noServiceArea`);
          return setCorsHeaders(
            Response.json({
              success: true,
              vendors: [],
              count: 0,
              noServiceArea: true,
              message: "We're not available in this area yet",
            })
          );
        }
      } catch (err) {
        console.error("[SearchAPI] Region lookup error:", err);
      }
    } else if (city && city !== "Current Location" && city !== "") {
      useCityFallback = true;
      cityLegacy = city;
    }

    /* ── Parse Category IDs safely ───────────────────────────────────────── */
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

    if (regionId) {
      // Coordinate-based: filter by regionId on the vendor document
      vendorMatch["vendorData.regionId"] = regionId;
    } else if (useCityFallback && cityLegacy) {
      // Legacy: case-insensitive city match
      vendorMatch["vendorData.city"] = { $regex: new RegExp(`^${cityLegacy}$`, "i") };
    }
    // If neither, no location filter → show all

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
                  { $eq: ["$status", "Active"] }
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
