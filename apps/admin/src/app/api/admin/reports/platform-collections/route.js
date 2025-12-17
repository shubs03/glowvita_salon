import _db from "@repo/lib/db";
import OrderModel from "@repo/lib/models/Vendor/Order.model";
import TaxFeeSettings from "@repo/lib/models/admin/TaxFeeSettings.model";
import { authMiddlewareAdmin } from '../../../../../../../middlewareAdmin';

await _db();

// GET - Fetch platform collections report for product orders
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    // Get all supplier orders (orders where supplierId exists)
    const orders = await OrderModel.find({
      supplierId: { $exists: true, $ne: null }
    })
    .sort({ createdAt: -1 })
    .populate({
      path: 'vendorId',
      select: 'shopName email'
    })
    .populate({
      path: 'supplierId',
      select: 'shopName email'
    })
    .populate({
      path: 'items.productId',
      select: 'productName price'
    });

    // Get the latest tax fee settings
    const taxSettings = await TaxFeeSettings.findOne().sort({ updatedAt: -1 });
    
    // Process orders to calculate platform collections
    const processedOrders = orders.map(order => {
      // Calculate item-level details
      const itemDetails = order.items.map(item => {
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 0;
        const itemTotal = itemPrice * itemQuantity;
        
        // Calculate GST on item (if enabled)
        let itemGST = 0;
        let itemGSTAmount = 0;
        if (taxSettings && taxSettings.productGSTEnabled) {
          itemGST = taxSettings.productGST || 0;
          itemGSTAmount = taxSettings.productGSTType === 'percentage' 
            ? (itemTotal * itemGST) / 100 
            : itemGST;
        }
        
        // Calculate platform fee on item (if enabled)
        let itemPlatformFee = 0;
        let itemPlatformFeeAmount = 0;
        if (taxSettings && taxSettings.productPlatformFeeEnabled) {
          itemPlatformFee = taxSettings.productPlatformFee || 0;
          itemPlatformFeeAmount = taxSettings.productPlatformFeeType === 'percentage' 
            ? (itemTotal * itemPlatformFee) / 100 
            : itemPlatformFee;
        }
        
        return {
          productId: item.productId?._id || item.productId,
          productName: item.productName || item.productId?.productName || 'Unknown Product',
          quantity: itemQuantity,
          unitPrice: itemPrice,
          itemTotal: itemTotal,
          gstRate: itemGST,
          gstAmount: itemGSTAmount,
          platformFeeRate: itemPlatformFee,
          platformFeeAmount: itemPlatformFeeAmount,
          totalWithFees: itemTotal + itemGSTAmount + itemPlatformFeeAmount
        };
      });
      
      // Calculate order totals
      const orderSubtotal = itemDetails.reduce((sum, item) => sum + item.itemTotal, 0);
      const orderGST = itemDetails.reduce((sum, item) => sum + item.gstAmount, 0);
      const orderPlatformFee = itemDetails.reduce((sum, item) => sum + item.platformFeeAmount, 0);
      
      return {
        orderId: order.orderId,
        orderDate: order.createdAt,
        orderStatus: order.status,
        vendorName: order.vendorId?.shopName || 'Unknown Vendor',
        supplierName: order.supplierId?.shopName || 'Unknown Supplier',
        items: itemDetails,
        subtotal: orderSubtotal,
        gstTotal: orderGST,
        platformFeeTotal: orderPlatformFee,
        orderTotal: order.totalAmount || 0,
        totalCollected: orderSubtotal + orderGST + orderPlatformFee
      };
    });
    
    // Calculate summary statistics
    const totalOrders = processedOrders.length;
    const totalRevenue = processedOrders.reduce((sum, order) => sum + order.orderTotal, 0);
    const totalGSTCollected = processedOrders.reduce((sum, order) => sum + order.gstTotal, 0);
    const totalPlatformFeesCollected = processedOrders.reduce((sum, order) => sum + order.platformFeeTotal, 0);
    
    return Response.json({
      success: true,
      data: {
        orders: processedOrders,
        summary: {
          totalOrders,
          totalRevenue,
          totalGSTCollected,
          totalPlatformFeesCollected,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        }
      },
      message: "Platform collections report fetched successfully"
    }, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error("Error fetching platform collections report:", error);
    return Response.json({
      success: false,
      message: "Failed to fetch platform collections report",
      error: error.message
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
});