import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import mongoose from 'mongoose';
if (mongoose.models.ClientOrder) {
  delete mongoose.models.ClientOrder;
}
import ClientOrder from '@repo/lib/models/user/ClientOrder.model';
import UserModel from '@repo/lib/models/user/User.model';
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import InventoryTransactionModel from '@repo/lib/models/Vendor/InventoryTransaction.model';
import { withSubscriptionCheck } from '@/middlewareCrm';

// Initialize DB connection
const initDb = async () => {
  await _db();
};
initDb();

// GET Online Customer Orders for the logged-in vendor
export const GET = withSubscriptionCheck(async (req) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    // Only vendors and suppliers can fetch their customer orders
    if (role !== 'vendor' && role !== 'supplier') {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Fetch online customer orders, populated with real customer info from User model
    const clientOrders = await ClientOrder.find({ vendorId: userId })
      .populate('userId', 'firstName lastName emailAddress mobileNo')
      .sort({ createdAt: -1 });

    return NextResponse.json(clientOrders, { status: 200 });
  } catch (error) {
    console.error("Error fetching client orders:", error);
    return NextResponse.json({ message: "Failed to fetch client orders", error: error.message }, { status: 500 });
  }
}, ['vendor', 'supplier']);

// PATCH - Update ClientOrder status
export const PATCH = withSubscriptionCheck(async (req) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const { orderId, status, trackingNumber, courier, cancellationReason } = await req.json();

    console.log("=== CLIENT ORDER UPDATE DEBUG INFO ===");
    console.log("User ID:", userId);
    console.log("User Role:", role);
    console.log("Order ID:", orderId);
    console.log("Status:", status);
    console.log("Tracking Number:", trackingNumber);
    console.log("Courier:", courier);
    console.log("=====================================");

    if (!orderId || !status) {
      return NextResponse.json({ message: "Order ID and status are required" }, { status: 400 });
    }

    // Validate status is one of the allowed values
    const validStatuses = ['Pending', 'Packed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      console.log("Invalid status provided:", status);
      return NextResponse.json({ message: "Invalid status value" }, { status: 400 });
    }

    // Find the client order
    const order = await ClientOrder.findById(orderId);

    if (!order) {
      console.log("Order not found with ID:", orderId);
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    console.log("Found order:", {
      _id: order._id,
      vendorId: order.vendorId,
      currentStatus: order.status
    });

    // Security check: Only the vendor who owns this order can update it
    if (order.vendorId.toString() !== userId.toString()) {
      console.log("Authorization failed. Order vendorId:", order.vendorId, "User ID:", userId);
      return NextResponse.json({ message: "You are not authorized to update this order" }, { status: 403 });
    }

    // Update order status
    console.log("Updating order status from", order.status, "to", status);
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courier) order.courier = courier;
    if (status === 'Cancelled') {
      if (cancellationReason) order.cancellationReason = cancellationReason;
      order.cancelledAt = new Date();
      order.cancelledBy = role === 'vendor' ? 'Vendor' : (role === 'supplier' ? 'Supplier' : 'User');
    }
    order.updatedAt = new Date();

    console.log("Saving order with updated data:", {
      status: order.status,
      trackingNumber: order.trackingNumber,
      courier: order.courier,
      updatedAt: order.updatedAt
    });

    await order.save();

    // Stock Refund: Increment stock for each product if order is cancelled
    if (status === 'Cancelled' && order.items && order.items.length > 0) {
      console.log("Cancelling order, performing stock refund for items:", order.items.length);
      for (const item of order.items) {
        if (item.productId) {
          try {
            const product = await ProductModel.findById(item.productId);
            if (product) {
              const previousStock = product.stock;
              const newStock = previousStock + item.quantity;

              await ProductModel.findByIdAndUpdate(
                item.productId,
                { $set: { stock: newStock } },
                { new: true }
              );
              console.log(`Refunded stock for product ${item.productId}: +${item.quantity}`);

              // Create inventory transaction record
              const transaction = new InventoryTransactionModel({
                productId: item.productId,
                vendorId: order.vendorId,
                productCategory: product.category,
                type: 'IN',
                quantity: item.quantity,
                previousStock,
                newStock,
                reason: `B2C Order #${order._id.toString().substring(0, 8)} cancelled. Reason: ${cancellationReason || 'N/A'}`,
                reference: order._id.toString(),
                performedBy: userId
              });
              await transaction.save();
            }
          } catch (refundError) {
            console.error(`Error refunding stock for product ${item.productId}:`, refundError);
            // Non-blocking
          }
        }
      }
    }

    console.log("Order saved successfully:", order._id);
    return NextResponse.json(order, { status: 200 });

  } catch (error) {
    console.error("Error updating client order status:", error);
    return NextResponse.json({ message: "Failed to update order status", error: error.message }, { status: 500 });
  }
}, ['vendor', 'supplier']);