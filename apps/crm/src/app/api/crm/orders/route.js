import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import OrderModel from '@repo/lib/models/Vendor/Order.model';
import { authMiddlewareCrm } from '@/middlewareCrm';
import mongoose from 'mongoose';

await _db();

// GET Orders for the logged-in user (Vendor or Supplier)
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let query = {};
    if (role === 'vendor' || role === 'staff') {
      // Vendors see orders they placed (to suppliers) and orders they received (from customers)
      query = {
        $or: [
          { vendorId: userId }, // B2B orders placed by this vendor
          { vendorId: userId, customerId: { $exists: true } } // B2C orders for this vendor
        ]
      };
    } else if (role === 'supplier') {
      // Suppliers see orders they received from vendors
      query = { supplierId: userId };
    }

    const orders = await OrderModel.find(query).sort({ createdAt: -1 });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}, ['vendor', 'supplier', 'staff']);


// POST - Create a new Order (Vendor purchasing from Supplier)
export const POST = authMiddlewareCrm(async (req) => {
  try {
    const vendorId = req.user.userId;
    const { items, supplierId, totalAmount, shippingAddress } = await req.json();

    if (!items || items.length === 0 || !supplierId || !totalAmount || !shippingAddress) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Validate minimum order value for supplier
    const SupplierModel = (await import("@repo/lib/models/Vendor/Supplier.model")).default;
    const supplier = await SupplierModel.findById(supplierId);

    if (supplier && supplier.minOrderValue > 0 && totalAmount < supplier.minOrderValue) {
      return NextResponse.json({
        message: `Order total must be at least ₹${supplier.minOrderValue} for this supplier.`
      }, { status: 400 });
    }

    const orderId = `B2B-${Date.now()}`; // Generate a unique order ID

    const newOrder = new OrderModel({
      orderId,
      vendorId,
      supplierId,
      items,
      totalAmount,
      shippingAddress,
      status: 'Pending',
      statusHistory: [{ status: 'Pending', notes: 'Order placed by vendor.' }]
    });

    await newOrder.save();
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ message: "Failed to create order" }, { status: 500 });
  }
}, ['vendor', 'staff']);


// PATCH - Update order status and tracking
export const PATCH = authMiddlewareCrm(async (req) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const { orderId, status, trackingNumber, courier } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ message: "Order ID and status are required" }, { status: 400 });
    }

    // Try to find order by _id first (MongoDB ID)
    // Only use findById if orderId is a valid MongoDB ObjectId
    let order = null;

    // Check if orderId is a valid MongoDB ObjectId format
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      console.log("orderId is a valid MongoDB ObjectId, attempting findById");
      order = await OrderModel.findById(orderId);
      console.log("Found order by _id:", order ? "Yes" : "No");
      if (order) {
        console.log("Order found by _id:", order._id, order.orderId);
      }
    } else {
      console.log("orderId is not a valid MongoDB ObjectId, skipping findById");
    }

    // If not found, try to find by the human-readable orderId field
    if (!order) {
      console.log("Attempting to find order by orderId field");
      order = await OrderModel.findOne({ orderId: orderId });
      console.log("Found order by orderId field:", order ? "Yes" : "No");
      if (order) {
        console.log("Order found by orderId field:", order._id, order.orderId);
      }
    }

    // Log the order details if found
    if (order) {
      console.log("Order details:", {
        _id: order._id,
        orderId: order.orderId,
        supplierId: order.supplierId,
        vendorId: order.vendorId,
        customerId: order.customerId,
        status: order.status
      });
    }

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Security check: Only the seller (supplier or vendor) can update the order status
    let isAuthorized = false;

    // Helper function to safely compare IDs
    const compareIds = (id1, id2) => {
      if (!id1 || !id2) return false;
      // Convert both to strings for comparison
      return id1.toString() === id2.toString();
    };

    if (role === 'supplier') {
      // Suppliers can update orders where they are the supplier
      isAuthorized = compareIds(order.supplierId, userId);
    } else if (role === 'vendor') {
      // Vendors can update:
      // 1. Orders they placed (where they are the vendorId)
      // 2. Orders they received (where they are the customerId) - for customer orders
      const isB2BOrderTheyPlaced = compareIds(order.vendorId, userId);
      const isB2COrderForCustomer = compareIds(order.customerId, userId);

      isAuthorized = isB2BOrderTheyPlaced || isB2COrderForCustomer;
    }

    if (!isAuthorized) {
      return NextResponse.json({ message: "You are not authorized to update this order" }, { status: 403 });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courier) order.courier = courier;

    order.statusHistory.push({
      status: status,
      notes: `Order status updated to ${status}.`
    });

    await order.save();

    return NextResponse.json(order, { status: 200 });

  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ message: "Failed to update order status" }, { status: 500 });
  }
}, ['vendor', 'supplier', 'staff']);