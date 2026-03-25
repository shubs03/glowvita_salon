import _db from "@repo/lib/db";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";
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
          { success: false, message: "Service unavailable" },
          { status: 503 }
        )
      );
    }

    const { searchParams } = new URL(request.url);

    // ── Primary: Coordinate-based filtering ──────────────────────────────────
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");
    const lat = latStr ? parseFloat(latStr) : NaN;
    const lng = lngStr ? parseFloat(lngStr) : NaN;

    // ── Legacy fallback: city-name filtering ─────────────────────────────────
    const city = searchParams.get("city")?.trim();

    const matchStage = { status: "Approved" };

    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      // 1️⃣ Coordinate → Region → RegionId filter
      try {
        const region = await RegionModel.findOne({
          geometry: {
            $geoIntersects: {
              $geometry: {
                type: "Point",
                coordinates: [lng, lat], // GeoJSON order: [lng, lat]
              },
            },
          },
          isActive: true,
        });

        if (region) {
          console.log(`[LandingAPI] Region matched: ${region.name} for [${lat}, ${lng}]`);
          matchStage.regionId = region._id;
        } else {
          // Coordinates given but outside any defined service area
          console.log(`[LandingAPI] No region matched for [${lat}, ${lng}] – returning noServiceArea`);
          return setCorsHeaders(
            Response.json({
              success: true,
              data: {
                recommended: [],
                newlyAdded: [],
                all: [],
                cities: await VendorModel.distinct("city", { status: "Approved" }),
              },
              noServiceArea: true,
            })
          );
        }
      } catch (regionErr) {
        console.error("[LandingAPI] Region lookup error:", regionErr);
      }
    } else if (
      city &&
      city !== "null" &&
      city !== "undefined" &&
      city !== "" &&
      city !== "All Locations"
    ) {
      // 2️⃣ Legacy city-name fallback (case-insensitive)
      matchStage.city = { $regex: new RegExp(`^${city}$`, "i") };
    }
    // 3️⃣ No filter at all → return all vendors

    // ── Shared lookup stages ─────────────────────────────────────────────────
    const lookupReviews = {
      $lookup: {
        from: "reviews",
        let: { vendorId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$entityId", "$$vendorId"] },
                  { $eq: ["$isApproved", true] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              avgRating: { $avg: "$rating" },
              reviewCount: { $sum: 1 },
            },
          },
        ],
        as: "reviewStats",
      },
    };

    const lookupAppointments = {
      $lookup: {
        from: "appointments",
        let: { vendorId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$vendorId", "$$vendorId"] },
                  { $eq: ["$status", "completed"] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              bookingCount: { $sum: 1 },
            },
          },
        ],
        as: "appointmentStats",
      },
    };

    const projectStats = {
      $addFields: {
        rating: {
          $ifNull: [{ $arrayElemAt: ["$reviewStats.avgRating", 0] }, 0],
        },
        reviewCount: {
          $ifNull: [{ $arrayElemAt: ["$reviewStats.reviewCount", 0] }, 0],
        },
        totalBookings: {
          $ifNull: [
            { $arrayElemAt: ["$appointmentStats.bookingCount", 0] },
            0,
          ],
        },
      },
    };

    // ── Aggregation queries ──────────────────────────────────────────────────
    
    // Stage to filter vendors with at least one approved service
    const filterApprovedServices = [
      {
        $lookup: {
          from: "vendorservices", // lowercased collection name for VendorServices
          localField: "_id",
          foreignField: "vendor",
          as: "vendorServicesItems"
        }
      },
      {
        $match: {
          "vendorServicesItems.services.status": "approved"
        }
      }
    ];

    // Recommended: highest rated first, then most booked
    const recommendedSalons = await VendorModel.aggregate([
      { $match: matchStage },
      ...filterApprovedServices,
      lookupReviews,
      lookupAppointments,
      projectStats,
      { $sort: { rating: -1, totalBookings: -1 } },
      { $limit: 8 },
    ]);

    // Newly Added: most recently created first
    const newlyAddedSalons = await VendorModel.aggregate([
      { $match: matchStage },
      ...filterApprovedServices,
      lookupReviews,
      lookupAppointments,
      projectStats,
      { $sort: { createdAt: -1 } },
      { $limit: 8 },
    ]);

    // All Salons: first 6
    const allSalons = await VendorModel.aggregate([
      { $match: matchStage },
      ...filterApprovedServices,
      lookupReviews,
      lookupAppointments,
      projectStats,
      { $limit: 8 },
    ]);

    const cities = await VendorModel.distinct("city", { status: "Approved" });

    return setCorsHeaders(
      Response.json({
        success: true,
        data: {
          recommended: recommendedSalons,
          newlyAdded: newlyAddedSalons,
          all: allSalons,
          cities,
        },
      })
    );
  } catch (error) {
    console.error("Landing page salons error:", error);
    return setCorsHeaders(
      Response.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      )
    );
  }
};
