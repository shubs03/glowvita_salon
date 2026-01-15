import { NextResponse } from "next/server";
import _db from '@repo/lib/db';
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import ProductCategoryModel from '@repo/lib/models/admin/ProductCategory';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

// GET - Fetch product summary report with specific fields
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const vendorId = req.user.userId.toString();
    const { searchParams } = new URL(req.url);

    // Get filter parameters
    const productFilter = searchParams.get('product');
    const categoryFilter = searchParams.get('category');
    const brandFilter = searchParams.get('brand');
    const statusFilter = searchParams.get('status');
    const activeFilter = searchParams.get('isActive');
    const regionFilter = searchParams.get('region');

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

    if (statusFilter && statusFilter !== '') {
      baseQuery.status = statusFilter;
    }

    if (activeFilter && activeFilter !== '') {
      baseQuery.isActive = activeFilter === 'true';
    }

    // Fetch all products for this vendor
    // We populate vendorId so we can check the city (region)
    let products = await ProductModel.find(baseQuery)
      .populate('category', 'name')
      .populate({
        path: 'vendorId',
        select: 'city businessName shopName'
      })
      .sort({ createdAt: -1 });

    // Apply category filter after population
    if (categoryFilter && categoryFilter !== '') {
      products = products.filter(product =>
        product.category && product.category.name &&
        product.category.name.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    // Apply region filter (searching within the populated vendorId.city)
    if (regionFilter && regionFilter !== '' && regionFilter !== 'all') {
      products = products.filter(product => {
        const vendorCity = product.vendorId?.city || '';
        return vendorCity.toLowerCase().includes(regionFilter.toLowerCase());
      });
    }

    // Transform products to include only the required fields
    const productSummary = products.map(product => ({
      productName: product.productName || 'N/A',
      brand: product.brand || 'N/A',
      category: product.category?.name || 'N/A',
      productForm: product.productForm || 'N/A',
      price: product.price !== undefined ? parseFloat(product.price.toFixed(2)) : 0,
      salePrice: product.salePrice !== undefined ? parseFloat(product.salePrice.toFixed(2)) : 0,
      stock: product.stock || 0,
      status: product.status || 'N/A',
      isActive: product.isActive !== undefined ? product.isActive : true,
      region: product.vendorId?.city || 'N/A',
      createdAt: product.createdAt || null
    }));

    const responseData = {
      products: productSummary
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      filters: {
        product: productFilter || null,
        category: categoryFilter || null,
        brand: brandFilter || null,
        status: statusFilter || null,
        isActive: activeFilter || null
      }
    });

  } catch (error) {
    console.error("Error fetching product summary report:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
});