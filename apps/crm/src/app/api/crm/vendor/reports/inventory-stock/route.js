import { NextResponse } from "next/server";
import _db from '@repo/lib/db';
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import { withSubscriptionCheck } from '@/middlewareCrm';

await _db();

// GET - Fetch inventory/stock report with specific fields
export const GET = withSubscriptionCheck(async (req) => {
  try {
    const vendorId = (req.user.vendorId || req.user.userId).toString();
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

    if (categoryFilter && categoryFilter !== '') {
      baseQuery.category = categoryFilter;
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

    // Transform products to include only the required fields for inventory/stock report
    const inventoryStockData = products.map(product => {
      // Determine stock status
      let stockStatus;
      if (product.stock === 0) {
        stockStatus = "Out of Stock";
      } else if (product.stock < 5) {
        stockStatus = "Low Stock";
      } else {
        stockStatus = "In Stock";
      }

      // Create example insight
      let exampleInsight = "";
      if (stockStatus === "Low Stock") {
        exampleInsight = `"${product.productName}: Low Stock (${product.stock} units remaining)"`;
      } else if (stockStatus === "Out of Stock") {
        exampleInsight = `"${product.productName}: Out of Stock"`;
      }

      return {
        productName: product.productName || 'N/A',
        stockAvailable: product.stock || 0,
        stockStatus: stockStatus,
        exampleInsight: exampleInsight
      };
    });

    const responseData = {
      products: inventoryStockData
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
    console.error("Error fetching inventory/stock report:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
});