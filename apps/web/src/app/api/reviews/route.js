import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@repo/lib/auth';
import _db from '@repo/lib/db';
import User from '@repo/lib/models/user';
import Review from '@repo/lib/models/Review/Review.model';
import Product from '@repo/lib/models/Vendor/Product.model';
import VendorServices from '@repo/lib/models/Vendor/VendorServices.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import DoctorModel from '@repo/lib/models/Vendor/Docters.model';

// Connect to database
await _db();

// Handle CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// POST - Submit a review
export async function POST(req) {
  try {
    // Get token from Authorization header or cookies
    let token = null;
    
    // First, check Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    // If not in header, check cookies
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get('token')?.value;
    }
    
    // Check if user is authenticated
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required. Please login to submit a review.' },
        { status: 401 }
      );
    }
    
    // Verify JWT token
    let payload;
    try {
      payload = await verifyJwt(token);
      if (!payload) {
        return NextResponse.json(
          { success: false, message: 'Invalid or expired token. Please login again.' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token. Please login again.' },
        { status: 401 }
      );
    }
    
    // Get user from database
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found. Please login again.' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { rating, comment, entityId, entityType } = body;
    
    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }
    
    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Review comment is required' },
        { status: 400 }
      );
    }
    
    if (!entityId) {
      return NextResponse.json(
        { success: false, message: 'Entity ID is required' },
        { status: 400 }
      );
    }
    
    if (!entityType) {
      return NextResponse.json(
        { success: false, message: 'Entity type is required' },
        { status: 400 }
      );
    }
    
    // Check if user has already reviewed this entity
    const existingReview = await Review.findOne({
      userId: user._id,
      entityId,
      entityType
    });
    
    if (existingReview) {
      return NextResponse.json(
        { success: false, message: 'You have already submitted a review for this item' },
        { status: 400 }
      );
    }
    
    // Get entity name for better UX
    let entityName = `Item ${entityId}`;
    try {
      if (entityType === 'product') {
        const product = await Product.findById(entityId);
        if (product) {
          entityName = product.productName || product.name || entityName;
        }
      } else if (entityType === 'service') {
        // For services, we need to find the service in the VendorServices collection
        const vendorServiceDoc = await VendorServices.findOne({
          "services._id": entityId
        });
        
        if (vendorServiceDoc) {
          const service = vendorServiceDoc.services.find(
            s => s._id.toString() === entityId.toString()
          );
          
          if (service) {
            entityName = service.name || entityName;
          }
        }
      } else if (entityType === 'salon') {
        const vendor = await VendorModel.findById(entityId);
        if (vendor) {
          entityName = vendor.businessName || vendor.name || entityName;
        }
      } else if (entityType === 'doctor') {
        const doctor = await DoctorModel.findById(entityId);
        if (doctor) {
          entityName = doctor.name || entityName;
        }
      }
    } catch (error) {
      console.error('Error fetching entity name:', error);
    }
    
    // Create and save review
    const review = new Review({
      userId: user._id,
      userName: user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email,
      rating,
      comment: comment.trim(),
      entityId,
      entityType
    });
    
    await review.save();
    
    // Return the review with entity name
    const reviewWithEntity = {
      ...review.toObject(),
      item: entityName
    };
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Review submitted successfully. It will be visible after approval.',
        review: reviewWithEntity
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}