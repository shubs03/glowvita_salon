import { NextResponse } from "next/server";
import _db from '@repo/lib/db';
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import ProductCategoryModel from '@repo/lib/models/admin/ProductCategory';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

// GET - Fetch category-wise product report with aggregated data
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const vendorId = req.user.userId.toString();
    const { searchParams } = new URL(req.url);
    
    // Get filter parameters
    const productFilter = searchParams.get('product');
    const categoryFilter = searchParams.get('category');
    const brandFilter = searchParams.get('brand');
    
    // Base query for products
    const baseQuery = {
      vendorId: vendorId
    };
    
    // Apply filters if provided
    if (productFilter && productFilter !== '') {
      baseQuery.productName = { $regex: productFilter, $options: 'i' };
    }
    
    if (brandFilter && brandFilter !== '') {
      baseQuery.brand = { $regex: brandFilter, $options: 'i' };
    }
    
    // Fetch all products for this vendor
    let products = await ProductModel.find(baseQuery)
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    
    // Apply category filter after population
    if (categoryFilter && categoryFilter !== '') {
      products = products.filter(product => 
        product.category && product.category.name && 
        product.category.name.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }
    
    // Aggregate products by category
    const categoryWiseData = {};
    
    products.forEach(product => {
      const categoryName = product.category?.name || 'Uncategorized';
      const categoryId = product.category?._id || 'uncategorized';
      
      if (!categoryWiseData[categoryId]) {
        categoryWiseData[categoryId] = {
          categoryName: categoryName,
          numberOfProducts: 0,
          activeProducts: 0,
          totalPrice: 0,
          totalSalePrice: 0,
          productCount: 0
        };
      }
      
      // Increment counters
      categoryWiseData[categoryId].numberOfProducts += 1;
      categoryWiseData[categoryId].productCount += 1;
      
      // Count active products
      if (product.isActive) {
        categoryWiseData[categoryId].activeProducts += 1;
      }
      
      // Add prices for averaging
      if (product.price && typeof product.price === 'number') {
        categoryWiseData[categoryId].totalPrice += product.price;
      }
      
      if (product.salePrice && typeof product.salePrice === 'number') {
        categoryWiseData[categoryId].totalSalePrice += product.salePrice;
      }
    });
    
    // Calculate averages
    const aggregatedData = Object.values(categoryWiseData).map(category => ({
      categoryName: category.categoryName,
      numberOfProducts: category.numberOfProducts,
      activeProducts: category.activeProducts,
      averagePrice: category.numberOfProducts > 0 ? parseFloat((category.totalPrice / category.numberOfProducts).toFixed(2)) : 0,
      averageSalePrice: category.numberOfProducts > 0 ? parseFloat((category.totalSalePrice / category.numberOfProducts).toFixed(2)) : 0
    }));
    
    const responseData = {
      categories: aggregatedData
    };
    
    return NextResponse.json({
      success: true,
      data: responseData,
      filters: {
        product: productFilter || null,
        category: categoryFilter || null,
        brand: brandFilter || null
      }
    });
    
  } catch (error) {
    console.error("Error fetching category-wise product report:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
});