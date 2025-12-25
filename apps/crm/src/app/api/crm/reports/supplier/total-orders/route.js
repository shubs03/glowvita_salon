import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import OrderModel from "@repo/lib/models/Vendor/Order.model";
import TaxFeeSettings from "@repo/lib/models/admin/TaxFeeSettings";
import { authMiddlewareCrm } from "../../../../../../middlewareCrm";

await _db();

// GET - Fetch total orders report for supplier
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
    
    // Calculate summary statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Calculate platform fees
    let totalPlatformFees = 0;
    if (taxSettings && taxSettings.productPlatformFeeEnabled) {
      orders.forEach(order => {
        const orderAmount = order.totalAmount || 0;
        const platformFee = taxSettings.productPlatformFeeType === 'percentage'
          ? (orderAmount * taxSettings.productPlatformFee) / 100
          : taxSettings.productPlatformFee;
        totalPlatformFees += platformFee;
      });
    }
    
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
        orders,
        summary: {
          totalOrders,
          totalRevenue,
          totalPlatformFees,
          platformFeeSettings: taxSettings ? {
            rate: taxSettings.productPlatformFee,
            type: taxSettings.productPlatformFeeType,
            enabled: taxSettings.productPlatformFeeEnabled
          } : null,
          statusCounts
        }
      },
      message: "Supplier total orders report fetched successfully"
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching supplier total orders report:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch supplier total orders report",
      error: error.message
    }, { status: 500 });
  }
}, ['supplier']);