import _db from "@repo/lib/db";
import ReviewModel from "@repo/lib/models/Review/Review.model";
import ProductModel from "@repo/lib/models/Vendor/Product.model";
import SupplierModel from "@repo/lib/models/Vendor/Supplier.model";
import { authMiddlewareAdmin } from '../../../../../../src/middlewareAdmin';
import { buildRegionQueryFromRequest } from "@repo/lib";

await _db();

// GET - Fetch all reviews for supplier products with aggregated data for reporting
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    // Get all supplier products (scoped by region)
    const regionQuery = buildRegionQueryFromRequest(req);
    const supplierProducts = await ProductModel.find({ 
      ...regionQuery,
      origin: 'Supplier' 
    })
      .populate('vendorId', 'shopName firstName lastName email')
      .select('productName productImages price category vendorId reviewCount rating createdAt stock status');

    // Get all supplier product IDs
    const productIds = supplierProducts.map(p => p._id);

    // Get all reviews for supplier products
    const reviews = await ReviewModel.find({
      entityId: { $in: productIds },
      entityType: 'product'
    }).sort({ createdAt: -1 });

    // Group reviews by product
    const reviewsByProduct = {};
    reviews.forEach(review => {
      const productId = review.entityId.toString();
      if (!reviewsByProduct[productId]) {
        reviewsByProduct[productId] = [];
      }
      reviewsByProduct[productId].push(review);
    });

    // Calculate aggregated data for each product
    const productReviewData = supplierProducts.map(product => {
      const productId = product._id.toString();
      const productReviews = reviewsByProduct[productId] || [];
      
      // Calculate average rating
      let avgRating = 0;
      if (productReviews.length > 0) {
        const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
        avgRating = totalRating / productReviews.length;
      } else if (product.rating) {
        // Fallback to product's stored rating if available
        avgRating = product.rating;
      }

      // Count approved reviews
      const approvedReviews = productReviews.filter(r => r.isApproved).length;

      return {
        productId: product._id,
        productName: product.productName,
        supplierName: product.vendorId?.shopName || `${product.vendorId?.firstName || ''} ${product.vendorId?.lastName || ''}`.trim() || 'Unknown Supplier',
        supplierEmail: product.vendorId?.email || '',
        category: product.category || 'Uncategorized',
        price: product.price || 0,
        stock: product.stock || 0,
        status: product.status || 'pending',
        totalReviews: productReviews.length,
        approvedReviews: approvedReviews,
        pendingReviews: productReviews.length - approvedReviews,
        averageRating: parseFloat(avgRating.toFixed(2)),
        createdAt: product.createdAt,
        productImages: product.productImages || []
      };
    });

    // Sort by total reviews (most reviewed first)
    productReviewData.sort((a, b) => b.totalReviews - a.totalReviews);

    // Aggregate overall statistics
    const totalProducts = supplierProducts.length;
    const totalReviewsCount = reviews.length;
    const approvedReviewsCount = reviews.filter(r => r.isApproved).length;
    const pendingReviewsCount = totalReviewsCount - approvedReviewsCount;
    
    // Calculate average rating across all products
    const totalRatingSum = productReviewData.reduce((sum, product) => sum + (product.averageRating * product.totalReviews), 0);
    const overallAverageRating = totalReviewsCount > 0 ? parseFloat((totalRatingSum / totalReviewsCount).toFixed(2)) : 0;

    // Top rated products (with at least 1 review)
    const topRatedProducts = [...productReviewData]
      .filter(p => p.totalReviews > 0)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 10);

    // Most reviewed products
    const mostReviewedProducts = [...productReviewData]
      .sort((a, b) => b.totalReviews - a.totalReviews)
      .slice(0, 10);

    // Suppliers with most products
    const suppliersWithProducts = {};
    supplierProducts.forEach(product => {
      const supplierId = product.vendorId?._id?.toString();
      if (supplierId) {
        if (!suppliersWithProducts[supplierId]) {
          suppliersWithProducts[supplierId] = {
            supplierName: product.vendorId?.shopName || `${product.vendorId?.firstName || ''} ${product.vendorId?.lastName || ''}`.trim() || 'Unknown Supplier',
            supplierEmail: product.vendorId?.email || '',
            productCount: 0,
            totalReviews: 0,
            averageRating: 0
          };
        }
        suppliersWithProducts[supplierId].productCount += 1;
      }
    });

    // Add review data to suppliers
    Object.keys(suppliersWithProducts).forEach(supplierId => {
      const supplierProducts = productReviewData.filter(p => p.productId && p.productId.toString().includes(supplierId.substring(0, 8)));
      const totalReviews = supplierProducts.reduce((sum, p) => sum + p.totalReviews, 0);
      const weightedRatingSum = supplierProducts.reduce((sum, p) => sum + (p.averageRating * p.totalReviews), 0);
      const averageRating = totalReviews > 0 ? parseFloat((weightedRatingSum / totalReviews).toFixed(2)) : 0;
      
      suppliersWithProducts[supplierId].totalReviews = totalReviews;
      suppliersWithProducts[supplierId].averageRating = averageRating;
    });

    // Convert to array and sort by total reviews
    const topSuppliers = Object.values(suppliersWithProducts)
      .sort((a, b) => b.totalReviews - a.totalReviews)
      .slice(0, 10);

    return Response.json({
      success: true,
      data: {
        summary: {
          totalProducts,
          totalReviews: totalReviewsCount,
          approvedReviews: approvedReviewsCount,
          pendingReviews: pendingReviewsCount,
          overallAverageRating
        },
        productReviewData,
        topRatedProducts,
        mostReviewedProducts,
        topSuppliers
      },
      message: 'Supplier product reviews data retrieved successfully'
    }, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error("Error fetching supplier product reviews:", error);
    return Response.json({
      success: false,
      message: "Failed to fetch supplier product reviews",
      error: error.message
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "reports:view");