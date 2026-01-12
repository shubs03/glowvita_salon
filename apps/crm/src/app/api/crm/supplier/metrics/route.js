import { NextResponse } from "next/server";
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import ClientOrder from '@repo/lib/models/user/ClientOrder.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

// Helper function to calculate date ranges based on filter period
const getDateRanges = (period) => {
  const now = new Date();
  
  let startDate, endDate;
  
  if (period === 'day') {
    // Today only
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (period === 'month') {
    // Current month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === 'year') {
    // Current year
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else {
    // All time (last year for testing purposes)
    startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }
  
  return { startDate, endDate };
};

// Helper function to parse custom date ranges from query parameters
const getCustomDateRanges = (startDateStr, endDateStr) => {
  let startDate, endDate;
  
  if (startDateStr && endDateStr) {
    // Parse the custom date range
    startDate = new Date(startDateStr);
    endDate = new Date(endDateStr);
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);
  }
  
  return { startDate, endDate };
};

// Main handler function for the supplier metrics endpoint
async function getSupplierMetricsHandler(request) {
  try {
    console.log("Full user object:", JSON.stringify(request.user, null, 2));
    // Use userId and convert to string based on other routes in the app
    const supplierId = (request.user.userId || request.user.id).toString();
    console.log("Fetching metrics for supplier ID:", supplierId);
    
    // Get filter parameters from query parameters
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'all';
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');
    
    console.log("Filter period:", period);
    console.log("Custom date range:", startDateParam, "to", endDateParam);
    
    // Determine date ranges based on parameters
    let startDate, endDate;
    if (startDateParam && endDateParam) {
      // Use custom date range
      const customDates = getCustomDateRanges(startDateParam, endDateParam);
      startDate = customDates.startDate;
      endDate = customDates.endDate;
      console.log("Using custom date range:", startDate, "to", endDate);
    } else {
      // Use preset period
      const presetDates = getDateRanges(period);
      startDate = presetDates.startDate;
      endDate = presetDates.endDate;
      console.log("Using preset date range:", startDate, "to", endDate);
    }
    
    // Also log the supplierId type to check if it's an ObjectId
    console.log("Supplier ID type:", typeof supplierId);

    // Try querying with the supplierId as a string first
    let supplierProductCount = await ProductModel.countDocuments({ vendorId: supplierId });
    console.log("Total products for this supplier (string query):", supplierProductCount);
    
    // If that doesn't work, try converting to ObjectId
    if (supplierProductCount === 0) {
      try {
        const mongoose = require('mongoose');
        const supplierObjectId = new mongoose.Types.ObjectId(supplierId);
        supplierProductCount = await ProductModel.countDocuments({ vendorId: supplierObjectId });
        console.log("Total products for this supplier (ObjectId query):", supplierProductCount);
      } catch (objectIdError) {
        console.log("Could not convert supplierId to ObjectId:", objectIdError.message);
      }
    }

    // 1. Total Revenue from delivered orders containing supplier's products
    // Try with string supplierId first
    let totalRevenue = 0;
    let totalOrders = 0;
    
    // Find products belonging to this supplier
    let supplierProducts = await ProductModel.find({ vendorId: supplierId }, { _id: 1 });
    
    // If that doesn't work, try with ObjectId
    if (supplierProducts.length === 0) {
      try {
        const mongoose = require('mongoose');
        const supplierObjectId = new mongoose.Types.ObjectId(supplierId);
        supplierProducts = await ProductModel.find({ vendorId: supplierObjectId }, { _id: 1 });
      } catch (error) {
        console.log("Error converting supplierId to ObjectId for products query:", error.message);
      }
    }

    if (supplierProducts.length > 0) {
      const productIds = supplierProducts.map(p => p._id.toString());

      // Calculate revenue from orders containing supplier's products
      // Try with string IDs first
      let supplierOrderAggregation = await ClientOrder.aggregate([
        {
          $match: {
            'items.productId': { $in: productIds },
            status: 'Delivered',
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $unwind: "$items"
        },
        {
          $match: {
            'items.productId': { $in: productIds }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
            totalOrders: { $sum: 1 }
          }
        }
      ]);

      if (supplierOrderAggregation.length === 0) {
        // Try with ObjectId for product IDs
        try {
          const mongoose = require('mongoose');
          const objectIdProductIds = productIds.map(id => new mongoose.Types.ObjectId(id));
          
          supplierOrderAggregation = await ClientOrder.aggregate([
            {
              $match: {
                'items.productId': { $in: objectIdProductIds },
                status: 'Delivered',
                createdAt: { $gte: startDate, $lte: endDate }
              }
            },
            {
              $unwind: "$items"
            },
            {
              $match: {
                'items.productId': { $in: objectIdProductIds }
              }
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                totalOrders: { $sum: 1 }
              }
            }
          ]);
        } catch (error) {
          console.log("Error with ObjectId conversion for orders aggregation:", error.message);
        }
      }

      if (supplierOrderAggregation.length > 0) {
        totalRevenue = supplierOrderAggregation[0].totalRevenue || 0;
        totalOrders = supplierOrderAggregation[0].totalOrders || 0;
      }
    }

    console.log("Total revenue from supplier's products:", totalRevenue);
    console.log("Total orders containing supplier's products:", totalOrders);

    // 2. Total Products Count
    const totalProducts = supplierProductCount;

    // 3. Order Status Counts
    let pendingOrders = 0;
    let shippedOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;

    if (supplierProducts.length > 0) {
      const productIds = supplierProducts.map(p => p._id.toString());

      // Count pending orders with supplier's products
      // Try with string IDs first
      pendingOrders = await ClientOrder.countDocuments({
        'items.productId': { $in: productIds },
        status: 'Pending',
        createdAt: { $gte: startDate, $lte: endDate }
      });

      shippedOrders = await ClientOrder.countDocuments({
        'items.productId': { $in: productIds },
        status: 'Shipped',
        createdAt: { $gte: startDate, $lte: endDate }
      });

      deliveredOrders = await ClientOrder.countDocuments({
        'items.productId': { $in: productIds },
        status: 'Delivered',
        createdAt: { $gte: startDate, $lte: endDate }
      });

      cancelledOrders = await ClientOrder.countDocuments({
        'items.productId': { $in: productIds },
        status: 'Cancelled',
        createdAt: { $gte: startDate, $lte: endDate }
      });

      // If no results with string IDs, try with ObjectId
      if (pendingOrders === 0 && shippedOrders === 0 && deliveredOrders === 0 && cancelledOrders === 0) {
        try {
          const mongoose = require('mongoose');
          const objectIdProductIds = productIds.map(id => new mongoose.Types.ObjectId(id));

          pendingOrders = await ClientOrder.countDocuments({
            'items.productId': { $in: objectIdProductIds },
            status: 'Pending',
            createdAt: { $gte: startDate, $lte: endDate }
          });

          shippedOrders = await ClientOrder.countDocuments({
            'items.productId': { $in: objectIdProductIds },
            status: 'Shipped',
            createdAt: { $gte: startDate, $lte: endDate }
          });

          deliveredOrders = await ClientOrder.countDocuments({
            'items.productId': { $in: objectIdProductIds },
            status: 'Delivered',
            createdAt: { $gte: startDate, $lte: endDate }
          });

          cancelledOrders = await ClientOrder.countDocuments({
            'items.productId': { $in: objectIdProductIds },
            status: 'Cancelled',
            createdAt: { $gte: startDate, $lte: endDate }
          });
        } catch (error) {
          console.log("Error with ObjectId conversion for order counts:", error.message);
        }
      }
    }

    console.log("Order status counts - Pending:", pendingOrders, "Shipped:", shippedOrders, "Delivered:", deliveredOrders, "Cancelled:", cancelledOrders);

    // 4. Average Order Value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 5. Inventory Value (based on stock and price of products)
    let inventoryValue = 0;
    if (supplierProducts.length > 0) {
      // Calculate inventory value based on stock and price
      // Try with string IDs first
      const inventoryAggregation = await ProductModel.aggregate([
        {
          $match: {
            _id: { $in: supplierProducts.map(p => p._id) }
          }
        },
        {
          $group: {
            _id: null,
            totalInventoryValue: { $sum: { $multiply: ["$stock", "$price"] } }
          }
        }
      ]);

      if (inventoryAggregation.length > 0) {
        inventoryValue = inventoryAggregation[0].totalInventoryValue || 0;
      }
    }

    console.log("Inventory value:", inventoryValue);

    // Compile final metrics
    const metrics = {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      totalProducts,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      inventoryValue: parseFloat(inventoryValue.toFixed(2)),
      topSellingProducts: [], // Will implement if needed
      recentOrders: [] // Will implement if needed
    };

    console.log("Final supplier metrics:", JSON.stringify(metrics, null, 2));
    
    return NextResponse.json({
      success: true,
      data: metrics
    });
    
  } catch (error) {
    console.error("Error fetching supplier dashboard metrics:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Wrap the handler with auth middleware
export const GET = authMiddlewareCrm(getSupplierMetricsHandler);