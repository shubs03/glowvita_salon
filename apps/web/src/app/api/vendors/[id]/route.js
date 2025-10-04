
import _db from "@repo/lib/db";
import VendorModel from "@repo/lib/models/vendor/Vendor.model";
import VendorServicesModel from "@repo/lib/models/vendor/VendorServices.model";

await _db();

// Handle CORS preflight
export const OPTIONS = async () => {
  const response = new Response(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

// Get a single vendor by ID for public display
export const GET = async (req, { params }) => {
  try {
    const { id } = params;

    // Validate ID
    if (!id) {
      const response = Response.json(
        { 
          success: false, 
          message: "Vendor ID is required",
        },
        { status: 400 }
      );

      // Add CORS headers to error response
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return response;
    }

    // Fetch approved vendor
    const vendor = await VendorModel.findOne({ 
      _id: id,
      status: 'Approved' 
    }).select(
      'businessName firstName lastName city state category subCategories profileImage gallery description rating clientCount revenue createdAt'
    ).lean();

    if (!vendor) {
      const response = Response.json(
        { 
          success: false, 
          message: "Vendor not found",
        },
        { status: 404 }
      );

      // Add CORS headers to error response
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return response;
    }

    // Fetch services separately and attach them
    const vendorServices = await VendorServicesModel.findOne({ vendor: id })
      .populate('services.category', 'name')
      .lean();

    // Attach services to the vendor object
    vendor.services = vendorServices ? vendorServices.services.filter(s => s.status === 'approved') : [];

    const response = Response.json({
      success: true,
      vendor: vendor
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  } catch (error) {
    console.error('Error fetching vendor by ID:', error);
    const response = Response.json(
      { 
        success: false, 
        message: "Failed to fetch vendor",
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
