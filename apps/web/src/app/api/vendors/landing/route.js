import _db from "@repo/lib/db";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";
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
    const city = searchParams.get("city")?.trim();

    const matchStage = {
      status: "Approved",
    };

    if (city && city !== "null" && city !== "undefined" && city !== "" && city !== "All Locations") {
      matchStage.city = { $regex: new RegExp(`^${city}$`, "i") };
    }

    // Common lookup and project stages
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
                  { $eq: ["$isApproved", true] }
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              avgRating: { $avg: "$rating" },
              reviewCount: { $sum: 1 }
            }
          }
        ],
        as: "reviewStats"
      }
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
                  { $eq: ["$status", "completed"] }
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              bookingCount: { $sum: 1 }
            }
          }
        ],
        as: "appointmentStats"
      }
    };

    const projectStats = {
      $addFields: {
        rating: { $ifNull: [{ $arrayElemAt: ["$reviewStats.avgRating", 0] }, 0] },
        reviewCount: { $ifNull: [{ $arrayElemAt: ["$reviewStats.reviewCount", 0] }, 0] },
        totalBookings: { $ifNull: [{ $arrayElemAt: ["$appointmentStats.bookingCount", 0] }, 0] }
      }
    };

    // Recommended: Sort by rating DESC, then totalBookings DESC
    const recommendedSalons = await VendorModel.aggregate([
      { $match: matchStage },
      lookupReviews,
      lookupAppointments,
      projectStats,
      { $sort: { rating: -1, totalBookings: -1 } },
      { $limit: 8 }
    ]);

    // Newly Added: Sort by createdAt DESC
    const newlyAddedSalons = await VendorModel.aggregate([
      { $match: matchStage },
      lookupReviews,
      lookupAppointments,
      projectStats,
      { $sort: { createdAt: -1 } },
      { $limit: 8 }
    ]);

    // All Salons: Limited 8
    const allSalons = await VendorModel.aggregate([
      { $match: matchStage },
      lookupReviews,
      lookupAppointments,
      projectStats,
      { $limit: 8 }
    ]);

    const cities = await VendorModel.distinct("city", { status: "Approved" });

    return setCorsHeaders(
      Response.json({
        success: true,
        data: {
          recommended: recommendedSalons,
          newlyAdded: newlyAddedSalons,
          all: allSalons,
          cities: cities
        }
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
