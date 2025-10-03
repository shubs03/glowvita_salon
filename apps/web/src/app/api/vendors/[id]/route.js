import _db from "@repo/lib/db";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";

await _db();

// Get a single vendor by ID for public display
export const GET = async (req, { params }) => {
  try {
    const { id } = params;

    // Validate ID
    if (!id) {
      return Response.json(
        { 
          success: false, 
          message: "Vendor ID is required",
        },
        { status: 400 }
      );
    }

    // Only fetch approved vendors with selected fields for public display
    const vendor = await VendorModel.findOne({ 
      _id: id,
      status: 'Approved' 
    }).select(
      'businessName firstName lastName city state category subCategories profileImage gallery description rating clientCount revenue createdAt workingHours services'
    );

    if (!vendor) {
      return Response.json(
        { 
          success: false, 
          message: "Vendor not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      vendor
    });
  } catch (error) {
    console.error('Error fetching vendor by ID:', error);
    return Response.json(
      { 
        success: false, 
        message: "Failed to fetch vendor",
      },
      { status: 500 }
    );
  }
};