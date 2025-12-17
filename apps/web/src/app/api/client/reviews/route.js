import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@repo/lib/auth';
import dbConnect from '@repo/lib/db';
import User from '@repo/lib/models/user';
import Review from '@repo/lib/models/Review/Review.model';
import Product from '@repo/lib/models/Vendor/Product.model';
import VendorServices from '@repo/lib/models/Vendor/VendorServices.model';
import Vendor from '@repo/lib/models/Vendor/Vendor.model';

// Connect to database
await dbConnect();

// GET - Fetch user reviews (only approved ones)
export async function GET(req) {
  try {
    // Get token from cookies
    const token = cookies().get('token')?.value;
    
    // Check if user is authenticated
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify JWT token
    let payload;
    try {
      payload = await verifyJwt(token);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Get user from database
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Fetch user's approved reviews only
    const reviews = await Review.find({ 
      userId: user._id,
      isApproved: true  // Only fetch approved reviews
    })
      .sort({ createdAt: -1 })
      .lean();
    
    // Transform reviews for the frontend
    const transformedReviews = await Promise.all(reviews.map(async (review) => {
      let itemName = `Item ${review.entityId}`;
      
      try {
        if (review.entityType === 'product') {
          const product = await Product.findById(review.entityId);
          if (product) {
            itemName = product.productName || product.name || itemName;
          }
        } else if (review.entityType === 'service') {
          // For services, we need to find the service in the VendorServices collection
          const vendorServiceDoc = await VendorServices.findOne({
            "services._id": review.entityId
          });
          
          if (vendorServiceDoc) {
            const service = vendorServiceDoc.services.find(
              s => s._id.toString() === review.entityId.toString()
            );
            
            if (service) {
              itemName = service.name || itemName;
            }
          }
        } else if (review.entityType === 'salon') {
          const vendor = await Vendor.findById(review.entityId);
          if (vendor) {
            itemName = vendor.businessName || vendor.name || itemName;
          }
        }
      } catch (error) {
        console.error('Error fetching entity name:', error);
      }
      
      return {
        id: review._id.toString(),
        type: review.entityType,
        item: itemName,
        rating: review.rating,
        review: review.comment,
        date: review.createdAt
      };
    }));
    
    return NextResponse.json(
      { 
        success: true, 
        reviews: transformedReviews
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}