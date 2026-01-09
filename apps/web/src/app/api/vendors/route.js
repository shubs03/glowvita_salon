import _db from "@repo/lib/db";
import VendorServicesModel from "@repo/lib/models/Vendor/VendorServices.model";
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
    const city = searchParams.get("city")?.trim();
    const categoryIdsStr = searchParams.get("categoryIds");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    /* ---------------- Parse Category IDs safely ---------------- */
    let categoryIds = [];
    if (categoryIdsStr) {
      categoryIds = categoryIdsStr
        .split(",")
        .map((id) => id.trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    /* ---------------- Aggregation Pipeline ---------------- */
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

    /* 2️⃣ Vendor-level filtering (STRICT) */
    pipeline.push({
      $match: {
        "vendorData.status": "Approved",
        ...(city && city !== "Current Location" && {
          "vendorData.city": city, // EXACT match (no regex leakage)
        }),
      },
    });

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
            { "vendorData.businessName": { $regex: new RegExp(serviceName, "i") } },
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
        city: { $first: "$vendorData.city" },
        state: { $first: "$vendorData.state" },
        category: { $first: "$vendorData.category" },
        subCategories: { $first: "$vendorData.subCategories" },
        profileImage: { $first: "$vendorData.profileImage" },
        description: { $first: "$vendorData.description" },
        location: { $first: "$vendorData.location" },
        createdAt: { $first: "$vendorData.createdAt" },
        subscription: { $first: "$vendorData.subscription" },
        services: { $push: "$services" },
      },
    });

    /* 7️⃣ Safety net: remove vendors with NO services */
    pipeline.push({
      $match: {
        services: { $ne: [] },
      },
    });

    /* 8️⃣ Sort + Pagination */
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: limit });

    const vendors = await VendorServicesModel.aggregate(pipeline).exec();

    return setCorsHeaders(
      Response.json({
        success: true,
        vendors,
        count: vendors.length,
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
