import _db from "@repo/lib/db";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";

// Handle CORS preflight
export const OPTIONS = async () => {
  const response = new Response(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

// Get Public Vendors (only approved vendors for public display)
export const GET = async () => {
  try {
    const db = await _db();
    
    // If database connection is not available, return an error
    if (!db) {
      const response = Response.json(
        { 
          success: false, 
          message: "Service temporarily unavailable",
          vendors: []
        },
        { status: 503 }
      );
      
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return response;
    }
    
    // Only fetch approved vendors with selected fields for public display
    const vendors = await VendorModel.find({ 
      status: 'Approved' 
    }).select(
      'businessName firstName lastName city state category subCategories profileImage description rating clientCount revenue createdAt'
    ).limit(20); // Limit to 20 vendors for performance

    const response = Response.json({
      success: true,
      vendors,
      count: vendors.length
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  } catch (error) {
    console.error('Error fetching public vendors:', error);
    const response = Response.json(
      { 
        success: false, 
        message: "Failed to fetch vendors",
        vendors: []
      },
      { status: 500 }
    );

    // Add CORS headers to error response
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  }
};