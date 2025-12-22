import _db from "@repo/lib/db";
import VendorModel from "@repo/lib/models/Vendor.model";
import VendorServicesModel from "@repo/lib/models/Vendor/VendorServices.model";
import CategoryModel from "@repo/lib/models/admin/Category.model";

const setCorsHeaders = (response) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

export const OPTIONS = async () => {
  return setCorsHeaders(new Response(null, { status: 200 }));
};

export const GET = async () => {
  try {
    const db = await _db();
    if (!db) {
      return setCorsHeaders(
        Response.json({ success: false, message: "Service unavailable", vendors: [] }, { status: 503 })
      );
    }

    // ✅ Clean and efficient query for approved vendors
    const vendors = await VendorModel.find(
      { status: "Approved" },
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
        createdAt: 1,
        subscription: 1, // Include subscription data for expiry check
      }
    )
      .lean()
      .limit(10) // safe to increase
      .maxTimeMS(2000) // increased timeout
      .exec();

    // Get vendor IDs for fetching services
    const vendorIds = vendors.map(vendor => vendor._id);

    // Fetch services for all vendors in one query
    const vendorServices = await VendorServicesModel.find({
      vendor: { $in: vendorIds },
      "services.status": "approved"
    }).populate('services.category', 'name');

    // Create a map of vendor ID to services for easy lookup
    const servicesMap = {};
    vendorServices.forEach(vendorService => {
      servicesMap[vendorService.vendor.toString()] = vendorService.services
        .filter(service => service.status === 'approved')
        .map(service => ({
          _id: service._id,
          name: service.name,
          category: service.category ? {
            _id: service.category._id,
            name: service.category.name
          } : null,
          price: service.price,
          duration: service.duration,
          description: service.description
        }));
    });

    // Attach services to each vendor
    const vendorsWithServices = vendors.map(vendor => ({
      ...vendor,
      services: servicesMap[vendor._id.toString()] || []
    }));

    // Fetch all categories for reference
    const categories = await CategoryModel.find({});

    return setCorsHeaders(
      Response.json({
        success: true,
        vendors: vendorsWithServices,
        categories: categories,
        count: vendorsWithServices.length,
      })
    );
  } catch (error) {
    console.error("Error fetching public vendors:", error);
    return setCorsHeaders(
      Response.json({ success: false, message: "Failed to fetch vendors", vendors: [], categories: [] }, { status: 500 })
    );
  }
};