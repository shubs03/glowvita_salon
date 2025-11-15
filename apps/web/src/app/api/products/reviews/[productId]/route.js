import _db from "@repo/lib/db";
import ReviewModel from "@repo/lib/models/Review/Review.model";
import ProductModel from "@repo/lib/models/Vendor/Product.model";
import { verifyJwt } from "@repo/lib/auth";
import { cookies } from 'next/headers';

await _db();

// Handle CORS preflight
export const OPTIONS = async (request) => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    },
  });
};

// Get reviews for a product
export const GET = async (request, { params }) => {
  try {
    const { productId } = params;
    
    if (!productId) {
      return Response.json({
        success: false,
        message: "Product ID is required"
      }, { status: 400 });
    }

    // Get all reviews for the product
    const reviews = await ReviewModel.find({
      entityId: productId,
      entityType: 'product',
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
    console.error("Error fetching product reviews:", error);
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

// Submit a new review
export const POST = async (request) => {
  try {
    // Get token from cookies
    const token = cookies().get('token')?.value;
    
    if (!token) {
      return Response.json({
        success: false,
        message: "Authentication required. Please log in to write a review."
      }, { status: 401 });
    }

    // Verify token
    const payload = await verifyJwt(token);

    if (!payload || !payload.userId) {
      return Response.json({
        success: false,
        message: "Invalid or expired token. Please log in again."
      }, { status: 401 });
    }

    const body = await request.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating || !comment) {
      return Response.json({
        success: false,
        message: "Product ID, rating, and comment are required"
      }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return Response.json({
        success: false,
        message: "Rating must be between 1 and 5"
      }, { status: 400 });
    }

    if (comment.trim().length < 10) {
      return Response.json({
        success: false,
        message: "Review must be at least 10 characters long"
      }, { status: 400 });
    }

    // Check if product exists
    const product = await ProductModel.findById(productId);
    
    if (!product) {
      return Response.json({
        success: false,
        message: "Product not found"
      }, { status: 404 });
    }

    // Check if user has already reviewed this product
    const existingReview = await ReviewModel.findOne({
      userId: payload.userId,
      entityId: productId,
      entityType: 'product',
    });

    if (existingReview) {
      return Response.json({
        success: false,
        message: "You have already reviewed this product"
      }, { status: 400 });
    }

    // Create new review
    const newReview = await ReviewModel.create({
      userId: payload.userId,
      userName: payload.name || payload.firstName || 'Anonymous',
      entityId: productId,
      entityType: 'product',
      rating: rating,
      comment: comment.trim(),
    });

    return Response.json({
      success: true,
      message: "Review submitted successfully. Thank you for your feedback!",
      review: newReview,
    }, {
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error("Error submitting review:", error);
    
    // Handle duplicate review error (unique index violation)
    if (error.code === 11000) {
      return Response.json({
        success: false,
        message: "You have already reviewed this product"
      }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    return Response.json({
      success: false,
      message: "Failed to submit review",
      error: error.message
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
};
