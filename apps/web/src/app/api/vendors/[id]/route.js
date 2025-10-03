
import _db from "@repo/lib/db";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";
import VendorServicesModel from "@repo/lib/models/Vendor/VendorServices.model";

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

    // Fetch approved vendor
    const vendor = await VendorModel.findOne({ 
      _id: id,
      status: 'Approved' 
    }).select(
      'businessName firstName lastName city state category subCategories profileImage gallery description rating clientCount revenue createdAt'
    ).lean();

    if (!vendor) {
      return Response.json(
        { 
          success: false, 
          message: "Vendor not found",
        },
        { status: 404 }
      );
    }

    // Fetch services separately and attach them
    const vendorServices = await VendorServicesModel.findOne({ vendor: id })
      .populate('services.category', 'name')
      .lean();

    // Attach services to the vendor object
    vendor.services = vendorServices ? vendorServices.services.filter(s => s.status === 'approved') : [];

    return Response.json({
      success: true,
      vendor: vendor
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
