import _db from "@repo/lib/db";
import ServiceModel from "@repo/lib/models/admin/Service.model";
import CategoryModel from "@repo/lib/models/admin/Category.model";
import mongoose from "mongoose";

// Handle CORS preflight
export const OPTIONS = async () => {
  const response = new Response(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

// Get all services (public endpoint) - can be filtered by category
export const GET = async (request) => {
  try {
    // Initialize database connection
    await _db();

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const limit = parseInt(searchParams.get('limit')) || 100;
    const page = parseInt(searchParams.get('page')) || 1;

    // Build aggregation pipeline
    const pipeline = [
      // Unwind services array to get individual services
      { $unwind: "$services" },
      // Match only approved services
      { $match: { "services.status": "approved" } }
    ];

    // Add category filter if provided
    if (categoryId) {
      pipeline.push({
        $match: {
          "services.category": new mongoose.Types.ObjectId(categoryId)
        }
      });
    }

    // Lookup to get category details
    pipeline.push(
      {
        $lookup: {
          from: "categories",
          localField: "services.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: {
          path: "$categoryDetails",
          preserveNullAndEmptyArrays: true
        }
      }
    );

    // Add category name to services
    pipeline.push({
      $addFields: {
        "services.categoryName": "$categoryDetails.name"
      }
    });

    // Remove categoryDetails field
    pipeline.push({
      $project: {
        categoryDetails: 0
      }
    });

    pipeline.push({
      $addFields: {
        "services.rawAddOns": "$services.addOns", // Preserve raw
        "services.addOnObjectIds": {
          $map: {
            input: { $ifNull: ["$services.addOns", []] },
            as: "addonId",
            in: { $toObjectId: "$$addonId" }
          }
        }
      }
    });

    // Lookup using the temporary field
    pipeline.push(
      {
        $lookup: {
          from: "addons",
          localField: "services.addOnObjectIds",
          foreignField: "_id",
          as: "addOnDetails",
        },
      },
      {
        $addFields: {
          "services.addOns": "$addOnDetails",
        },
      },
      {
        $project: {
          addOnDetails: 0,
          // "services.addOnObjectIds": 0, // DEBUG: Keep temp field
          // "services.rawAddOns": 0 // DEBUG: Keep debug field
        },
      }
    );

    // Pagination
    pipeline.push(
      { $skip: (page - 1) * limit },
      { $limit: limit }
    );

    // DEBUG: Direct check for the problematic ID
    const sampleAddonId = "695cd38a79c07c3786ecf71d"; // The ID user mentioned
    const directCheck = await AddOnModel.findById(sampleAddonId);
    console.log("DEBUG: Direct AddOn Check:", {
      searchedId: sampleAddonId,
      found: !!directCheck,
      doc: directCheck ? { _id: directCheck._id, name: directCheck.name } : null
    });


    // Execute aggregation
    const result = await VendorServicesModel.aggregate(pipeline);

    // Transform the results
    const services = result.map(item => ({
      ...item.services,
      vendorId: item.vendor,
      // Ensure these are passed through if they exist
      rawAddOns: item.services.rawAddOns,
      addOnObjectIds: item.services.addOnObjectIds
    }));

    const response = Response.json({
      success: true,
      services: services,
      count: services.length,
      page: page,
      limit: limit,
      debug: {
        directAddonCheck: !!directCheck
      }
    });

    // Debug Log
    console.log("Services API Aggregation Result:", JSON.stringify(services.map(s => ({
      name: s.name,
      addOns: s.addOns,
      rawAddOns: s.rawAddOns,
      addOnObjectIds: s.addOnObjectIds,
    })), null, 2));

    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;

  } catch (error) {
    console.error("Error fetching services:", error);

    const response = Response.json({
      success: false,
      message: "Failed to fetch services",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });

    // Set CORS headers even for errors
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  }
};
