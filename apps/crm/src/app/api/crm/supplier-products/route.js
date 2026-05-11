import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import ProductCategoryModel from '@repo/lib/models/admin/ProductCategory';
import ReviewModel from '@repo/lib/models/Review/Review.model';
import { authMiddlewareCrm } from '@/middlewareCrm';

await _db();

// GET - Fetch all products from suppliers for vendors to browse or suppliers to manage their own products
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const userId = req.user.userId.toString();
    const userRole = req.user.role;

    // Build query based on user role
    let query = { origin: 'Supplier' };

    // If user is a supplier, only fetch their own products
    if (userRole === 'supplier') {
      query.vendorId = userId;
      // For suppliers, fetch all statuses (pending, approved, disapproved)
    } else {
      // For vendors browsing supplier products, only show approved ones
      query.status = 'approved';
    }

    const products = await ProductModel.find(query)
      .populate({
        path: 'vendorId',
        model: 'Supplier', // Explicitly specify the Supplier model for population
        select: 'shopName email businessRegistrationNo city state country minOrderValue'
      })
      .populate('category', 'name description')
      .sort({ createdAt: -1 })
      .lean();

    const productIds = products.map(p => p._id);
    const reviews = await ReviewModel.aggregate([
      {
        $match: {
          entityType: 'product',
          entityId: { $in: productIds },
          isApproved: true
        }
      },
      {
        $group: {
          _id: "$entityId",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    const reviewMap = {};
    reviews.forEach(r => {
      reviewMap[r._id.toString()] = {
        rating: Number(r.averageRating.toFixed(1)),
        reviewCount: r.reviewCount
      };
    });

    const transformedProducts = products.map(p => ({
      ...p,
      supplierName: p.vendorId?.shopName,
      supplierEmail: p.vendorId?.email,
      supplierBusinessRegistrationNo: p.vendorId?.businessRegistrationNo,
      supplierCity: p.vendorId?.city,
      supplierState: p.vendorId?.state,
      supplierCountry: p.vendorId?.country,
      minOrderValue: p.vendorId?.minOrderValue || 0,
      // Ensure category is a string to match vendor products structure
      category: p.category?.name || 'Uncategorized',
      categoryDescription: p.category?.description || p.categoryDescription || '',
      // Transform status to match vendor products format
      status: p.status === 'rejected' ? 'disapproved' : p.status,
      rating: reviewMap[p._id.toString()]?.rating || 0,
      reviewCount: reviewMap[p._id.toString()]?.reviewCount || 0,
    }));

    // Return in the same format as vendor products API
    return NextResponse.json({
      success: true,
      data: transformedProducts
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching supplier products:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch supplier products",
      error: error.message
    }, { status: 500 });
  }
}, ['vendor', 'supplier']);