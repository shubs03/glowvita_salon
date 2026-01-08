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
    
    // Build query
    const query = {};
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      query.category = new mongoose.Types.ObjectId(categoryId);
    }
    
    // Fetch master services from admin's ServiceModel
    // This provides a clean list of service types for the user to pick from
    const services = await ServiceModel.find(query)
      .populate("category", "name")
      .lean()
      .exec();
    
    const response = Response.json({
      success: true,
      services: services,
      count: services.length
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
