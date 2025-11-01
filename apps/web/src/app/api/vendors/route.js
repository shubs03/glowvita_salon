import _db from "@repo/lib/db";
import VendorModel from "@repo/lib/models/Vendor.model";

// CORS headers helper
const setCorsHeaders = (response) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

// Handle CORS preflight
export const OPTIONS = async () => {
  return setCorsHeaders(new Response(null, { status: 200 }));
};

// Get Public Vendors (only approved vendors for public display)
export const GET = async () => {
  try {
    const db = await _db();
    
    if (!db) {
      return setCorsHeaders(
        Response.json(
          {
            success: false,
            message: "Service temporarily unavailable",
            vendors: []
          },
          { status: 503 }
        )
      );
    }
    
    // CRITICAL OPTIMIZATIONS:
    // 1. Use lean() to get plain JS objects (much faster)
    // 2. Add index hint for status field
    // 3. Use projection in find() instead of select()
    // 4. Limit results early
    const vendors = await VendorModel.find(
      { status: 'Approved' },
      {
        businessName: 1,
        firstName: 1,
        lastName: 1,
        city: 1,
        state: 1,
        category: 1,
        subCategories: 1,
        profileImage: 1,
        description: 1,
        rating: 1,
        clientCount: 1,
        revenue: 1,
        createdAt: 1
      }
    )
    .lean() // Returns plain JS objects (10x faster)
    .limit(4)
    .maxTimeMS(100) // Fail fast if query takes > 100ms
    .hint({ status: 1 }) // Use status index if available
    .exec();

    return setCorsHeaders(
      Response.json({
        success: true,
        vendors,
        count: vendors.length
      })
    );
    
  } catch (error) {
    console.error('Error fetching public vendors:', error);
    
    return setCorsHeaders(
      Response.json(
        {
          success: false,
          message: "Failed to fetch vendors",
          vendors: []
        },
        { status: 500 }
      )
    );
  }
};