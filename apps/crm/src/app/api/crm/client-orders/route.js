import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import ClientOrder from '@repo/lib/models/user/ClientOrder.model';
import { withSubscriptionCheck } from '@/middlewareCrm';

await _db();

// GET Online Customer Orders for the logged-in vendor
export const GET = withSubscriptionCheck(async (req) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    // Only vendors and suppliers can fetch their customer orders
    if (role !== 'vendor' && role !== 'supplier') {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Fetch online customer orders for this vendor or supplier
    const clientOrders = await ClientOrder.find({ vendorId: userId }).sort({ createdAt: -1 });

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
    const { orderId, status, trackingNumber, courier } = await req.json();

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
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
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
    order.updatedAt = new Date();

    console.log("Saving order with updated data:", {
      status: order.status,
      trackingNumber: order.trackingNumber,
      courier: order.courier,
      updatedAt: order.updatedAt
    });

    await order.save();

    console.log("Order saved successfully:", order._id);
    return NextResponse.json(order, { status: 200 });

  } catch (error) {
    console.error("Error updating client order status:", error);
    return NextResponse.json({ message: "Failed to update order status", error: error.message }, { status: 500 });
  }
}, ['vendor', 'supplier']);