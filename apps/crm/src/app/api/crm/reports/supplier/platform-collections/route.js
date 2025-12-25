import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import OrderModel from "@repo/lib/models/Vendor/Order.model";
import TaxFeeSettings from "@repo/lib/models/admin/TaxFeeSettings";
import { authMiddlewareCrm } from "../../../../../../middlewareCrm";

await _db();

// GET - Fetch platform collections report for supplier
export const GET = authMiddlewareCrm(async (request) => {
  try {
    const supplierId = request.user.userId;
    
    // Get all orders where this supplier is the seller
    const orders = await OrderModel.find({
      supplierId: supplierId
    })
    .sort({ createdAt: -1 })
    .populate({
      path: 'vendorId',
      select: 'shopName email'
    })
    .populate({
      path: 'customerId',
      select: 'firstName lastName email'
    });

    // Get the latest tax fee settings
    const taxSettings = await TaxFeeSettings.findOne().sort({ updatedAt: -1 });
    
    // Calculate summary statistics and enhance order data
    const totalOrders = orders.length;
    let totalRevenue = 0;
    let totalPlatformFees = 0;
    let totalGST = 0;
    
    // Enhance each order with calculated fields
    const enhancedOrders = orders.map(order => {
      const orderAmount = order.totalAmount || 0;
      totalRevenue += orderAmount;
      
      // Calculate platform fee for this order
      let platformFeeTotal = 0;
      if (taxSettings && taxSettings.productPlatformFeeEnabled) {
        platformFeeTotal = taxSettings.productPlatformFeeType === 'percentage'
          ? (orderAmount * taxSettings.productPlatformFee) / 100
          : taxSettings.productPlatformFee;
        totalPlatformFees += platformFeeTotal;
      }
      
      // Calculate GST for this order
      let gstTotal = 0;
      if (taxSettings && taxSettings.productGSTEnabled) {
        gstTotal = taxSettings.productGSTType === 'percentage'
          ? (orderAmount * taxSettings.productGST) / 100
          : taxSettings.productGST;
        totalGST += gstTotal;
      }
      
      // Calculate subtotal (total amount before taxes and fees)
      const subtotal = orderAmount - gstTotal;
      
      // Extract customer name
      let customerName = 'N/A';
      if (order.customerId) {
        if (typeof order.customerId === 'object' && order.customerId.firstName) {
          customerName = `${order.customerId.firstName} ${order.customerId.lastName || ''}`.trim();
        } else {
          customerName = order.customerName || 'N/A';
        }
      }
      
      // Return enhanced order object
      return {
        ...order.toObject(),
        customerName,
        city: order.shippingAddress || 'N/A',
        orderStatus: order.status,
        subtotal,
        gstTotal,
        platformFeeTotal
      };
    });
    
    // Group orders by status
    const statusCounts = {
      Pending: 0,
      Processing: 0,
      Packed: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0
    };
    
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: enhancedOrders,
        summary: {
          totalOrders,
          totalRevenue,
          totalGSTCollected: totalGST,
          totalPlatformFeesCollected: totalPlatformFees,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
          statusCounts,
          taxSettings: taxSettings ? {
            gstRate: taxSettings.productGST,
            gstType: taxSettings.productGSTType,
            gstEnabled: taxSettings.productGSTEnabled,
            platformFeeRate: taxSettings.productPlatformFee,
            platformFeeType: taxSettings.productPlatformFeeType,
            platformFeeEnabled: taxSettings.productPlatformFeeEnabled
          } : null
        }
      },
      message: "Supplier platform collections report fetched successfully"
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching supplier platform collections report:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch supplier platform collections report",
      error: error.message
    }, { status: 500 });
  }
}, ['supplier']);