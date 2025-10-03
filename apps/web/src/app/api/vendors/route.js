import _db from "@repo/lib/db";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";

await _db();

// Get Public Vendors (only approved vendors for public display)
export const GET = async () => {
  try {
    // Only fetch approved vendors with selected fields for public display
    const vendors = await VendorModel.find({ 
      status: 'Approved' 
    }).select(
      'businessName firstName lastName city state category subCategories profileImage description rating clientCount revenue createdAt'
    ).limit(20); // Limit to 20 vendors for performance

    return Response.json({
      success: true,
      vendors,
      count: vendors.length
    });
  } catch (error) {
    console.error('Error fetching public vendors:', error);
    return Response.json(
      { 
        success: false, 
        message: "Failed to fetch vendors",
        vendors: []
      },
      { status: 500 }
    );
  }
};