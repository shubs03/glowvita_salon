import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import OrderModel from "@repo/lib/models/Vendor/Order.model";
import ProductModel from "@repo/lib/models/Vendor/Product.model";
import { authMiddlewareCrm } from "../../../../../../middlewareCrm";

await _db();

// GET - Fetch product sales report for supplier
export const GET = authMiddlewareCrm(async (request) => {
  try {
    const supplierId = request.user.userId;
    
    // Get all products for this supplier
    const products = await ProductModel.find({
      supplierId: supplierId
    })
    .select('productName productImage price stock category createdAt')
    .sort({ createdAt: -1 });

    // Get all orders for this supplier (both B2C from customers and B2B from vendors)
    const orders = await OrderModel.find({
      supplierId: supplierId
    });

    // Separate B2C and B2B orders
    const b2cOrders = orders.filter(order => order.customerId && !order.vendorId);
    const b2bOrders = orders.filter(order => order.vendorId && !order.customerId);

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
        const productItem = order.items.find(item => 
          item.productId && item.productId.toString() === product._id.toString()
        );
        
        if (productItem) {
          const quantity = productItem.quantity || 0;
          const revenue = (productItem.price || 0) * quantity;
          
          totalQuantitySold += quantity;
          totalRevenue += revenue;
          orderCount += 1;

          // Categorize by order type
          if (order.customerId && !order.vendorId) {
            // B2C order (web customer)
            b2cQuantity += quantity;
            b2cRevenue += revenue;
            b2cOrders += 1;
          } else if (order.vendorId && !order.customerId) {
            // B2B order (vendor purchase)
            b2bQuantity += quantity;
            b2bRevenue += revenue;
            b2bOrders += 1;
          }
        }
      });

      return {
        productId: product._id,
        productName: product.productName,
        productImage: product.productImage,
        price: product.price,
        stock: product.stock,
        category: product.category,
        totalQuantitySold,
        totalRevenue,
        orderCount,
        b2cSales: {
          quantity: b2cQuantity,
          revenue: b2cRevenue,
          orders: b2cOrders
        },
        b2bSales: {
          quantity: b2bQuantity,
          revenue: b2bRevenue,
          orders: b2bOrders
        },
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
