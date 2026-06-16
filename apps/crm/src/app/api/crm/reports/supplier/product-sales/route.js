import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import OrderModel from "@repo/lib/models/Vendor/Order.model";
import ProductModel from "@repo/lib/models/Vendor/Product.model";
import ProductCategoryModel from "@repo/lib/models/admin/ProductCategory";
import { authMiddlewareCrm } from "../../../../../../middlewareCrm";

await _db();

export const GET = authMiddlewareCrm(async (request) => {
  try {
    const supplierId = request.user.userId;
    const { searchParams } = new URL(request.url);

    // Get filter parameters
    const productFilter = searchParams.get('product');
    const categoryFilter = searchParams.get('category');
    const brandFilter = searchParams.get('brand');

    // Get all categories to map category IDs to names
    const categories = await ProductCategoryModel.find();
    const categoryMap = {};
    if (categories && categories.length > 0) {
      categories.forEach(cat => {
        categoryMap[cat._id.toString()] = cat.name;
      });
    }

    // Get all products for this supplier
    const productQuery = {
      vendorId: supplierId,
      origin: 'Supplier'
    };

    if (productFilter && productFilter !== '' && productFilter !== 'all') {
      productQuery.productName = { $regex: productFilter, $options: 'i' };
    }

    if (brandFilter && brandFilter !== '' && brandFilter !== 'all') {
      productQuery.brand = brandFilter;
    }

    let products = await ProductModel.find(productQuery)
      .select('productName productImage price stock category createdAt brand')
      .sort({ createdAt: -1 });

    if (categoryFilter && categoryFilter !== '' && categoryFilter !== 'all') {
      const trimmedCategoryFilter = categoryFilter.trim();
      const matchingCategory = await ProductCategoryModel.findOne({
        name: trimmedCategoryFilter
      });

      if (matchingCategory) {
        const matchingCategoryId = matchingCategory._id.toString();
        products = products.filter(product => {
          if (!product.category) return false;
          return product.category.toString().trim() === matchingCategoryId;
        });
      } else {
        products = [];
      }
    }

    // Get all orders for this supplier (both B2C from customers and B2B from vendors) - only delivered
    const orders = await OrderModel.find({
      supplierId: supplierId,
      status: 'Delivered'
    });

    // Fixed rate constants for fee/tax calculation
    const PLATFORM_FEE_RATE = 0.10; // 10%
    const GST_RATE = 0.18;          // 18%

    // Calculate sales statistics for each product
    const productSalesData = products.map(product => {
      // Find all order items containing this product
      let totalQuantitySold = 0;
      let totalRevenue = 0;
      let orderCount = 0;
      let b2cQuantity = 0;
      let b2cRevenue = 0;
      let b2cOrders = 0;
      let b2bQuantity = 0;
      let b2bRevenue = 0;
      let b2bOrders = 0;

      orders.forEach(order => {
        let orderHasProduct = false;
        order.items.forEach(productItem => {
          if (productItem.productId && productItem.productId.toString() === product._id.toString()) {
            const quantity = productItem.quantity || 0;
            const revenue = (productItem.price || 0) * quantity;

            totalQuantitySold += quantity;
            totalRevenue += revenue;
            orderHasProduct = true;

            // Categorize by order type
            if (order.customerId && !order.vendorId) {
              b2cQuantity += quantity;
              b2cRevenue += revenue;
            } else if (order.vendorId && !order.customerId) {
              b2bQuantity += quantity;
              b2bRevenue += revenue;
            }
          }
        });

        if (orderHasProduct) {
          orderCount += 1;
          if (order.customerId && !order.vendorId) {
            b2cOrders += 1;
          } else if (order.vendorId && !order.customerId) {
            b2bOrders += 1;
          }
        }
      });

      // Compute platform fee and GST on net revenue
      const platformFee = parseFloat((totalRevenue * PLATFORM_FEE_RATE).toFixed(2));
      const gstAmount  = parseFloat((totalRevenue * GST_RATE).toFixed(2));
      const totalSales = parseFloat((totalRevenue + platformFee + gstAmount).toFixed(2));

      return {
        productId: product._id,
        productName: product.productName,
        productImage: product.productImage,
        price: product.price,
        stock: product.stock,
        category: categoryMap[product.category?.toString()] || 'N/A',
        brand: product.brand || 'N/A',
        quantitySold: totalQuantitySold,
        grossSales: parseFloat(totalRevenue.toFixed(2)),
        discountAmount: 0,
        netSales: parseFloat(totalRevenue.toFixed(2)),
        platformFee,
        gstAmount,
        taxAmount: 0,
        totalSales,
        totalQuantitySold,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        orderCount,
        b2cSales: { quantity: b2cQuantity, revenue: parseFloat(b2cRevenue.toFixed(2)), orders: b2cOrders },
        b2bSales: { quantity: b2bQuantity, revenue: parseFloat(b2bRevenue.toFixed(2)), orders: b2bOrders },
        createdAt: product.createdAt
      };
    });

    // Sort by total revenue (highest first)
    productSalesData.sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Calculate summary statistics
    const totalProducts = productSalesData.length;
    const totalStockValue = productSalesData.reduce((sum, product) => 
      sum + (product.price * product.stock), 0
    );
    const totalRevenue = productSalesData.reduce((sum, product) => 
      sum + product.totalRevenue, 0
    );
    const totalUnitsSold = productSalesData.reduce((sum, product) => 
      sum + product.totalQuantitySold, 0
    );
    const lowStockProducts = productSalesData.filter(product => 
      product.stock < 10
    ).length;

    // Calculate B2C and B2B totals
    const totalB2CRevenue = productSalesData.reduce((sum, product) => 
      sum + product.b2cSales.revenue, 0
    );
    const totalB2BRevenue = productSalesData.reduce((sum, product) => 
      sum + product.b2bSales.revenue, 0
    );
    const totalB2COrders = productSalesData.reduce((sum, product) => 
      sum + product.b2cSales.orders, 0
    );
    const totalB2BOrders = productSalesData.reduce((sum, product) => 
      sum + product.b2bSales.orders, 0
    );

    return NextResponse.json({
      success: true,
      data: {
        products: productSalesData,
        summary: {
          totalProducts,
          totalStockValue,
          totalRevenue,
          totalUnitsSold,
          lowStockProducts,
          b2cSales: {
            revenue: totalB2CRevenue,
            orders: totalB2COrders,
            percentage: totalRevenue > 0 ? ((totalB2CRevenue / totalRevenue) * 100).toFixed(1) : 0
          },
          b2bSales: {
            revenue: totalB2BRevenue,
            orders: totalB2BOrders,
            percentage: totalRevenue > 0 ? ((totalB2BRevenue / totalRevenue) * 100).toFixed(1) : 0
          }
        }
      },
      message: "Supplier product sales report fetched successfully"
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching supplier product sales report:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch supplier product sales report",
      error: error.message
    }, { status: 500 });
  }
}, ['supplier']);
