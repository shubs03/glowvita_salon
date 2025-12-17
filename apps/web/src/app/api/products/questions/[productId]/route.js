import _db from "@repo/lib/db";
import ProductQuestion from "@repo/lib/models/Vendor/ProductQuestion.model";
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

// Get published questions for a product
export const GET = async (request, { params }) => {
  try {
    const { productId } = params;
    
    if (!productId) {
      return Response.json({
        success: false,
        message: "Product ID is required"
      }, { status: 400 });
    }

    // Get all published questions for the product
    const questions = await ProductQuestion.find({
      productId,
      isPublished: true,
      isAnswered: true,
    }).sort({ createdAt: -1 });

    return Response.json({
      success: true,
      questions,
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error("Error fetching product questions:", error);
    return Response.json({
      success: false,
      message: "Failed to fetch questions",
      error: error.message
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
};

// Submit a new question
export const POST = async (request) => {
  try {
    // Get token from cookies
    const token = cookies().get('token')?.value;
    
    if (!token) {
      return Response.json({
        success: false,
        message: "Authentication required. Please log in to ask a question."
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
    const { productId, question } = body;

    if (!productId || !question) {
      return Response.json({
        success: false,
        message: "Product ID and question are required"
      }, { status: 400 });
    }

    if (question.trim().length < 10) {
      return Response.json({
        success: false,
        message: "Question must be at least 10 characters long"
      }, { status: 400 });
    }

    // Get product to find vendor
    const product = await ProductModel.findById(productId).select('vendorId');
    
    if (!product) {
      return Response.json({
        success: false,
        message: "Product not found"
      }, { status: 404 });
    }

    // Create new question
    const newQuestion = await ProductQuestion.create({
      productId,
      vendorId: product.vendorId,
      userId: payload.userId,
      userName: payload.name || payload.firstName || 'Anonymous',
      userEmail: payload.email,
      question: question.trim(),
    });

    return Response.json({
      success: true,
      message: "Question submitted successfully. The vendor will answer it soon.",
      question: newQuestion,
    }, {
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error("Error submitting question:", error);
    return Response.json({
      success: false,
      message: "Failed to submit question",
      error: error.message
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
};
