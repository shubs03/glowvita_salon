import _db from "@repo/lib/db";
import VendorServicesModel from "@repo/lib/models/Vendor/VendorServices.model";
import CategoryModel from "../../../../../../../../packages/lib/src/models/admin/Category.model";
import mongoose from "mongoose";

// Handle CORS preflight
export const OPTIONS = async () => {
  const response = new Response(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

// Get Services for a specific vendor
export const GET = async (request, { params }) => {
  try {
    // Initialize database connection
    await _db();
    
    const { id } = params;

    if (!id) {
      return Response.json({
        success: false,
        message: "Vendor ID is required"
      }, { status: 400 });
    }

    // Ensure vendor ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({
        success: false,
        message: "Invalid vendor ID format"
      }, { status: 400 });
    }

    // Find the vendor services document (without populate for now)
    const vendorServices = await VendorServicesModel.findOne({ 
      vendor: new mongoose.Types.ObjectId(id) 
    });
    
    if (!vendorServices || !vendorServices.services || vendorServices.services.length === 0) {
      return Response.json({
        success: true,
        services: [],
        vendorId: id,
        count: 0,
        message: "No services found for this vendor"
      });
    }

    if (vendorServices.services.length > 0) {
    }

    // Filter only approved services
    const approvedServices = vendorServices.services.filter(service => 
      service.status === 'approved'
    );
  
    if (approvedServices.length > 0) {
    } else {
      // If no approved services, log all services for debugging
      vendorServices.services.forEach((service, index) => {
        console.log(`Service ${index + 1}:`, {
          name: service.name,
          status: service.status,
          category: service.category
        });
      });
    }

    // Transform services and resolve category names
    const transformedServices = await Promise.all(
      approvedServices.map(async (service) => {
        let categoryName = 'Other';
        
        // Try to resolve category name if category is an ObjectId
        if (service.category && mongoose.Types.ObjectId.isValid(service.category)) {
          try {
            const category = await CategoryModel.findById(service.category).select('name');
            categoryName = category?.name || 'Other';
          } catch (error) {
            console.log(`Could not resolve category for service ${service.name}:`, error.message);
          }
        } else if (typeof service.category === 'string') {
          categoryName = service.category;
        }

        console.log(`Service ${service.name} has staff array:`, service.staff);

        return {
          _id: service._id,
          name: service.name,
          price: service.price,
          duration: service.duration,
          description: service.description,
          category: categoryName,
          image: service.image,
          status: service.status,
          gender: service.gender,
          staff: service.staff || [], // Ensure staff array is included
          homeService: service.homeService,
          weddingService: service.weddingService,
          onlineBooking: service.onlineBooking
        };
      })
    );

    const response = Response.json({
      success: true,
      services: transformedServices,
      vendorId: id,
      count: transformedServices.length
    });

    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;

  } catch (error) {
    console.error("Error fetching vendor services:", error);
    
    const response = Response.json({
      success: false,
      message: "Failed to fetch vendor services",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });

    // Set CORS headers even for errors
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  }
};