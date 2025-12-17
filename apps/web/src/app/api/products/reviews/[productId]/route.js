import _db from "@repo/lib/db";
import ReviewModel from "@repo/lib/models/Review/Review.model";
import ProductModel from "@repo/lib/models/Vendor/Product.model";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";
import SupplierModel from "@repo/lib/models/Vendor/Supplier.model";
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

    // Get all approved reviews for the product
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

    // Check if user has already reviewed this product
    const existingReview = await ReviewModel.findOne({
      userId: payload.userId,
      entityId: productId,
      entityType: 'product'
    });

    if (existingReview) {
      return Response.json({
        success: false,
        message: "You have already reviewed this product"
      }, { status: 400 });
    }

    // Get the product to identify the owner
    const product = await ProductModel.findById(productId);
    if (!product) {
      return Response.json({
        success: false,
        message: "Product not found"
      }, { status: 404 });
    }

    // Create new review (initially not approved)
    const newReview = await ReviewModel.create({
      userId: payload.userId,
      userName: payload.name || payload.firstName || 'Anonymous',
      entityId: productId,
      entityType: 'product',
      rating: rating,
      comment: comment.trim(),
      // isApproved defaults to false
    });

    return Response.json({
      success: true,
      message: "Review submitted successfully. It will be visible after approval by the product owner.",
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