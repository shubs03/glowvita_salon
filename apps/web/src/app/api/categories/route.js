import _db from "@repo/lib/db";
import CategoryModel from "@repo/lib/models/admin/Category.model";

// Handle CORS preflight
export const OPTIONS = async () => {
  const response = new Response(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

// Get all categories (public endpoint)
export const GET = async (request) => {
  try {
    // Initialize database connection
    await _db();
    
    // Find all categories
    const categories = await CategoryModel.find({}).sort({ name: 1 });
    
    const response = Response.json({
      success: true,
      categories: categories,
      count: categories.length
    });

    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;

  } catch (error) {
    console.error("Error fetching categories:", error);
    
    const response = Response.json({
      success: false,
      message: "Failed to fetch categories",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });

    // Set CORS headers even for errors
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  }
};