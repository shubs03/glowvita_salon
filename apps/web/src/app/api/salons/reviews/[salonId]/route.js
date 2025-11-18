import _db from "@repo/lib/db";
import ReviewModel from "@repo/lib/models/Review/Review.model";

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

    // Get all approved reviews for the salon
    const reviews = await ReviewModel.find({
      entityId: salonId,
      entityType: 'salon',
      isApproved: true, // Only show approved reviews
    }).sort({ createdAt: -1 });

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
