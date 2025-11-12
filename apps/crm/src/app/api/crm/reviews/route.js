import { NextResponse } from "next/server";
import _db from "../../../../../../../packages/lib/src/db.js";
import ReviewModel from "@repo/lib/models/Review/Review.model";
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import { authMiddlewareCrm } from "../../../../middlewareCrm";

await _db();

// GET - Fetch all reviews for vendor's products and services
export const GET = authMiddlewareCrm(async (request) => {
  try {
    const vendorId = request.user.userId;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, approved, pending
    const entityType = searchParams.get('entityType') || 'all'; // all, product, service, salon

    // Build query
    let query = {};
    
    // Filter by approval status
    if (filter === 'approved') {
      query.isApproved = true;
    } else if (filter === 'pending') {
      query.isApproved = false;
    }

    // Filter by entity type
    if (entityType !== 'all') {
      query.entityType = entityType;
    }

    // Get all reviews based on entity type
    let reviews = [];

    if (entityType === 'all' || entityType === 'product') {
      // Get vendor's product IDs
      const vendorProducts = await ProductModel.find({ vendorId }).select('_id');
      const productIds = vendorProducts.map(p => p._id);

      if (productIds.length > 0) {
        const productReviews = await ReviewModel.find({
          ...query,
          entityType: 'product',
          entityId: { $in: productIds }
        })
        .sort({ createdAt: -1 });

        // Populate product details
        for (let review of productReviews) {
          const product = await ProductModel.findById(review.entityId).select('productName productImages price category');
          review._doc.entityDetails = product;
        }

        reviews = [...reviews, ...productReviews];
      }
    }

    if (entityType === 'all' || entityType === 'salon') {
      // Get salon reviews for this vendor
      const salonReviews = await ReviewModel.find({
        ...query,
        entityType: 'salon',
        entityId: vendorId // The salon ID is the vendor ID
      })
      .sort({ createdAt: -1 });

      // Add salon details (use vendor info)
      for (let review of salonReviews) {
        review._doc.entityDetails = {
          _id: vendorId,
          salonName: 'Your Salon', // You can fetch actual salon name from Vendor model if needed
        };
      }

      reviews = [...reviews, ...salonReviews];
    }

    // TODO: Add service reviews when those models are ready
    // Similar logic for services

    return NextResponse.json({
      success: true,
      reviews,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message
    }, { status: 500 });
  }
});
