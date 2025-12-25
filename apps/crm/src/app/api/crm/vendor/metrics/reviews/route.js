import { NextResponse } from "next/server";
import ReviewModel from '@repo/lib/models/Review/Review.model';
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import VendorServicesModel from '@repo/lib/models/Vendor/VendorServices.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

// Helper function to get all approved reviews for the vendor
async function getClientFeedbackHandler(request) {
  try {
    // Get vendor ID from authenticated user
    const vendorId = (request.user.userId || request.user.id).toString();
    
    // Find all approved reviews for this vendor's entities
    // This includes reviews for products, services, and the salon itself
    let reviews = [];
    
    // Try with string vendorId first
    const reviewQuery = {
      isApproved: true
    };
    
    // Get vendor's products
    const vendorProducts = await ProductModel.find({ vendorId: vendorId }).select('_id');
    const productIds = vendorProducts.map(p => p._id.toString());
    
    // Get vendor's services
    const vendorServicesDoc = await VendorServicesModel.findOne({ vendor: vendorId });
    let serviceIds = [];
    
    if (vendorServicesDoc && vendorServicesDoc.services) {
      serviceIds = vendorServicesDoc.services.map(s => s._id.toString());
    }
    
    // Build query for reviews of vendor's entities
    const entityIdConditions = [
      ...productIds.map(id => ({ entityId: id, entityType: 'product' })),
      ...serviceIds.map(id => ({ entityId: id, entityType: 'service' })),
      { entityId: vendorId, entityType: 'salon' }
    ];
    
    if (entityIdConditions.length > 0) {
      reviews = await ReviewModel.find({
        ...reviewQuery,
        $or: entityIdConditions
      })
      .sort({ createdAt: -1 })
      .limit(10);
    }
    
    // If no reviews found, try with ObjectId
    if (reviews.length === 0) {
      try {
        const mongoose = require('mongoose');
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        
        // Convert IDs to ObjectIds
        const productObjectIds = productIds.map(id => new mongoose.Types.ObjectId(id));
        const serviceObjectIds = serviceIds.map(id => new mongoose.Types.ObjectId(id));
        
        const entityIdConditionsObjectId = [
          ...productObjectIds.map(id => ({ entityId: id, entityType: 'product' })),
          ...serviceObjectIds.map(id => ({ entityId: id, entityType: 'service' })),
          { entityId: vendorObjectId, entityType: 'salon' }
        ];
        
        if (entityIdConditionsObjectId.length > 0) {
          reviews = await ReviewModel.find({
            ...reviewQuery,
            $or: entityIdConditionsObjectId
          })
          .sort({ createdAt: -1 })
          .limit(10);
        }
      } catch (objectIdError) {
        console.log("Could not convert IDs to ObjectIds:", objectIdError.message);
      }
    }
    
    // Format the data for the frontend
    const formattedFeedback = reviews.map(review => {
      // Format date
      const reviewDate = new Date(review.createdAt);
      const formattedDate = reviewDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric'
      });
      
      // Determine entity type for display
      let entityTypeDisplay = '';
      if (review.entityType === 'product') {
        entityTypeDisplay = 'Product';
      } else if (review.entityType === 'service') {
        entityTypeDisplay = 'Service';
      } else if (review.entityType === 'salon') {
        entityTypeDisplay = 'Salon';
      } else {
        entityTypeDisplay = review.entityType.charAt(0).toUpperCase() + review.entityType.slice(1);
      }
      
      return {
        client: review.userName,
        comment: review.comment,
        rating: review.rating,
        date: formattedDate,
        entityType: entityTypeDisplay
      };
    });
    
    return NextResponse.json({
      success: true,
      data: formattedFeedback,
      count: formattedFeedback.length
    });
    
  } catch (error) {
    console.error("Error fetching client feedback:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Wrap the handler with auth middleware
export const GET = authMiddlewareCrm(getClientFeedbackHandler);