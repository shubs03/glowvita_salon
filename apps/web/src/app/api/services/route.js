import _db from "@repo/lib/db";
import VendorServicesModel from "@repo/lib/models/Vendor/VendorServices.model";
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

// Get all approved services across all vendors (public endpoint)
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
    
    // Pagination
    pipeline.push(
      { $skip: (page - 1) * limit },
      { $limit: limit }
    );
    
    // Execute aggregation
    const result = await VendorServicesModel.aggregate(pipeline);
    
    // Transform the results
    const services = result.map(item => ({
      ...item.services,
      vendorId: item.vendor
    }));
    
    const response = Response.json({
      success: true,
      services: services,
      count: services.length,
      page: page,
      limit: limit
    });

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