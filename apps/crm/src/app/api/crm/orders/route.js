import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import OrderModel from '@repo/lib/models/Vendor/Order.model';
import { authMiddlewareCrm } from '@/middlewareCrm';

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

    console.log("=== ORDER UPDATE DEBUG INFO ===");
    console.log("User ID:", userId);
    console.log("User Role:", role);
    console.log("Order ID received:", orderId);
    console.log("Status to update:", status);
    console.log("==============================");

    if (!orderId || !status) {
      return NextResponse.json({ message: "Order ID and status are required" }, { status: 400 });
    }

    // Try to find order by _id first (MongoDB ID)
    let order = await OrderModel.findById(orderId);
    console.log("Found order by _id:", order ? "Yes" : "No");
    
    // If not found, try to find by the human-readable orderId field
    if (!order) {
      order = await OrderModel.findOne({ orderId: orderId });
      console.log("Found order by orderId field:", order ? "Yes" : "No");
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
      // Log all orders in the database for debugging
      const allOrders = await OrderModel.find({}, '_id orderId supplierId vendorId customerId status');
      console.log("All orders in database:", allOrders.map(o => ({
        _id: o._id,
        orderId: o.orderId,
        supplierId: o.supplierId,
        vendorId: o.vendorId,
        customerId: o.customerId,
        status: o.status
      })));
      
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Security check: Only the seller (supplier or vendor) can update the order status
    console.log("Checking authorization...");
    console.log("Role:", role);
    console.log("Order supplierId:", order.supplierId);
    console.log("Order vendorId:", order.vendorId);
    console.log("Order customerId:", order.customerId);
    console.log("User ID:", userId);
    
    let isAuthorized = false;
    
    if (role === 'supplier') {
      // Suppliers can update orders where they are the supplier
      console.log("Checking supplier authorization...");
      console.log("order.supplierId:", order.supplierId);
      console.log("userId:", userId);
      console.log("order.supplierId && order.supplierId.equals(userId):", order.supplierId && order.supplierId.equals ? order.supplierId.equals(userId) : false);
      
      isAuthorized = order.supplierId && order.supplierId.equals && order.supplierId.equals(userId);
    } else if (role === 'vendor') {
      // Vendors can update:
      // 1. Orders they placed (where they are the vendorId)
      // 2. Orders they received (where they are the customerId) - for customer orders
      console.log("Checking vendor authorization...");
      console.log("Order vendorId:", order.vendorId);
      console.log("Order customerId:", order.customerId);
      
      const isB2BOrderTheyPlaced = order.vendorId && order.vendorId.equals && order.vendorId.equals(userId);
      const isB2COrderForCustomer = order.customerId && order.customerId.equals && order.customerId.equals(userId);
      
      console.log("isB2BOrderTheyPlaced:", isB2BOrderTheyPlaced);
      console.log("isB2COrderForCustomer:", isB2COrderForCustomer);
      
      isAuthorized = isB2BOrderTheyPlaced || isB2COrderForCustomer;
    }
    
    console.log("Final authorization result:", isAuthorized);

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
    
    console.log("Order updated successfully:", {
      _id: order._id,
      orderId: order.orderId,
      newStatus: order.status
    });
    
    return NextResponse.json(order, { status: 200 });

  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ message: "Failed to update order status" }, { status: 500 });
  }
}, ['vendor', 'supplier', 'staff']);