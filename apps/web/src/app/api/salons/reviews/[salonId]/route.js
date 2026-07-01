import _db from "@repo/lib/db";
import ReviewModel from "@repo/lib/models/Review/Review.model";
import VendorServicesModel from "@repo/lib/models/Vendor/VendorServices.model";

await _db();

// Handle CORS preflight
export const OPTIONS = async (request) => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    },
  });
};

// Get reviews for a salon
export const GET = async (request, { params }) => {
  try {
    const { salonId } = params;
    
    if (!salonId) {
      return Response.json({
        success: false,
        message: "Salon ID is required"
      }, { status: 400 });
    }

    const salonReviews = await ReviewModel.find({
      entityId: salonId,
      entityType: 'salon',
      isApproved: true,
    }).sort({ createdAt: -1 });

    const vendorServicesDoc = await VendorServicesModel.findOne({
      vendor: salonId,
    });

    let serviceReviews = [];
    if (vendorServicesDoc?.services?.length) {
      const serviceIds = vendorServicesDoc.services.map((service) => service._id);
      if (serviceIds.length > 0) {
        serviceReviews = await ReviewModel.find({
          entityId: { $in: serviceIds },
          entityType: 'service',
          isApproved: true,
        }).sort({ createdAt: -1 });
      }
    }

    const serviceNameMap = new Map(
      (vendorServicesDoc?.services || []).map((service) => [service._id?.toString(), service.name])
    );

    const reviews = [...salonReviews, ...serviceReviews]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((review) => {
        const reviewObject = review.toObject ? review.toObject() : { ...review };

        if (review.entityType === 'service') {
          reviewObject.serviceName = serviceNameMap.get(review.entityId?.toString()) || 'Service';
          reviewObject.entityLabel = 'Service Review';
        } else {
          reviewObject.entityLabel = 'Salon Review';
        }

        return reviewObject;
      });

    return Response.json({
      success: true,
      reviews,
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error("Error fetching salon reviews:", error);
    return Response.json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
};
