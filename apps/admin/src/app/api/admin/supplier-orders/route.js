
import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import ClientOrder from "@repo/lib/models/user/ClientOrder.model";
import SupplierModel from "@repo/lib/models/Vendor/Supplier.model";
import UserModel from "@repo/lib/models/user/User.model";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

// Initialize database connection
const initDb = async () => {
    try {
        await _db();
    } catch (error) {
        console.error("Database connection error:", error);
        throw new Error("Failed to connect to database");
    }
};

export const GET = authMiddlewareAdmin(async (req) => {
    try {
        await initDb();

        // Get regionId from searchParams
        const { searchParams } = new URL(req.url);
        const regionId = searchParams.get('regionId');

        // 1. Get all supplier IDs for the given region (if any)
        const supplierQuery = {};
        if (regionId && regionId !== 'all') {
            supplierQuery.regionId = regionId;
        }

        const suppliers = await SupplierModel.find(supplierQuery).select('_id shopName firstName lastName');
        const supplierIds = suppliers.map(s => s._id);

        // 2. Fetch ClientOrders where vendorId is one of these suppliers
        const orderQuery = { vendorId: { $in: supplierIds } };

        // Also include status filter if provided
        const status = searchParams.get('status');
        if (status && status !== 'all') {
            orderQuery.status = status;
        }

        const orders = await ClientOrder.find(orderQuery)
            .populate({
                path: 'vendorId',
                model: 'Supplier',
                select: 'shopName firstName lastName'
            })
            .populate({
                path: 'userId',
                model: 'User',
                select: 'firstName lastName name'
            })
            .sort({ createdAt: -1 });

        // Transform data to match the expected UI structure if needed, 
        // although the UI can also be updated to match the API response.
        const transformedOrders = orders.map(order => ({
            _id: order._id,
            id: order._id.toString().substring(order._id.toString().length - 8).toUpperCase(), // Short ID for display
            supplierId: order.vendorId ? order.vendorId._id : null,
            supplierName: order.vendorId ? (order.vendorId.shopName || `${order.vendorId.firstName} ${order.vendorId.lastName}`) : 'Unknown Supplier',
            productName: order.items && order.items.length > 0 ? order.items[0].name : 'N/A', // Just one for display in table
            itemCount: order.items ? order.items.length : 0,
            customerName: order.userId ? (order.userId.name || `${order.userId.firstName} ${order.userId.lastName}`) : 'Unknown Customer',
            amount: order.totalAmount,
            status: order.status,
            date: order.createdAt.toISOString().split('T')[0],
            items: order.items,
            shippingAddress: order.shippingAddress,
            contactNumber: order.contactNumber,
            paymentMethod: order.paymentMethod,
            trackingNumber: order.trackingNumber
        }));

        return NextResponse.json({ success: true, data: transformedOrders }, { status: 200 });
    } catch (error) {
        console.error("Error fetching supplier orders:", error);
        return NextResponse.json({ success: false, message: "Error fetching supplier orders", error: error.message }, { status: 500 });
    }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);
