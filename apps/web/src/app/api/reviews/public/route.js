import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import Review from '@repo/lib/models/Review/Review.model';
import User from '@repo/lib/models/user';

import ProductModel from '@repo/lib/models/Vendor/Product.model';

// Connect to database
await _db();

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// GET - Fetch approved public reviews for testimonials display
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Fetch approved reviews, newest first, with user info
    const reviews = await Review.find({ isApproved: true, entityType: 'product' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: 'userId',
        model: User,
        select: 'firstName lastName city state profileImage',
      })
      .lean();

    // Fetch product names for mapping
    const productIds = [...new Set(reviews.map(r => r.entityId ? r.entityId.toString() : null).filter(Boolean))];
    const products = await ProductModel.find({ _id: { $in: productIds } }).select('productName').lean();
    const productNameMap = new Map(products.map(p => [p._id.toString(), p.productName]));

    const formatted = reviews.map((review) => {
      const user = review.userId;
      const name =
        user
          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
          : review.userName || 'Anonymous';

      let location = 'India';
      if (user?.city && user?.state) {
        location = `${user.city}, ${user.state}`;
      } else if (user?.city) {
        location = user.city;
      }

      return {
        id: review._id.toString(),
        quote: review.comment,
        name,
        location,
        rating: review.rating,
        profileImage: user?.profileImage || null,
        createdAt: review.createdAt,
        productName: review.entityId ? (productNameMap.get(review.entityId.toString()) || null) : null,
      };
    });

    return NextResponse.json({ success: true, reviews: formatted });
  } catch (error) {
    console.error('Error fetching public reviews:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
