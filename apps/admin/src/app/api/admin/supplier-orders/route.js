
import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import ClientOrder from "@repo/lib/models/user/ClientOrder.model";
import SupplierModel from "@repo/lib/models/Vendor/Supplier.model";
import OrderModel from "@repo/lib/models/Vendor/Order.model"; // B2B Order model
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

        const { searchParams } = new URL(req.url);
        const regionId = searchParams.get('regionId');
        const status = searchParams.get('status');

        // 1. Get all supplier IDs for the given region
        const supplierQuery = {};
        if (regionId && regionId !== 'all') {
            supplierQuery.regionId = regionId;
        }

        const suppliers = await SupplierModel.find(supplierQuery).select('_id shopName firstName lastName');
        const supplierIds = suppliers.map(s => s._id);

        // 2. Build queries for both models
        const clientOrderQuery = { vendorId: { $in: supplierIds } };
        const b2bOrderQuery = { supplierId: { $in: supplierIds } };

        if (status && status !== 'all') {
            clientOrderQuery.status = status;
            b2bOrderQuery.status = status;
        }

        // 3. Fetch from both sources in parallel
        const [clientOrders, b2bOrders] = await Promise.all([
            ClientOrder.find(clientOrderQuery)
                .populate({ path: 'vendorId', model: 'Supplier', select: 'shopName firstName lastName' })
                .populate({ path: 'userId', model: 'User', select: 'firstName lastName name' })
                .lean(),
            OrderModel.find(b2bOrderQuery)
                .populate({ path: 'supplierId', model: 'Supplier', select: 'shopName firstName lastName' })
                .populate({ path: 'vendorId', model: 'Vendor', select: 'shopName firstName lastName name' })
                .lean()
        ]);

        // 4. Transform ClientOrders (B2C)
        const transformedClientOrders = clientOrders.map(order => ({
            _id: order._id,
            id: order._id.toString().substring(order._id.toString().length - 8).toUpperCase(),
            supplierId: order.vendorId ? order.vendorId._id.toString() : null,
            supplierName: order.vendorId ? (order.vendorId.shopName || `${order.vendorId.firstName} ${order.vendorId.lastName}`) : 'Unknown Supplier',
            productName: order.items && order.items.length > 0 ? order.items[0].name : 'N/A',
            quantity: order.items && order.items.length > 0 ? order.items[0].quantity : 0,
            itemCount: order.items ? order.items.length : 0,
            customerName: order.userId ? (order.userId.name || `${order.userId.firstName} ${order.userId.lastName}`) : 'Unknown Customer',
            totalAmount: order.totalAmount,
            platformFeeAmount: order.platformFeeAmount || 0,
            gstAmount: order.gstAmount || 0,
            shippingAmount: order.shippingAmount || 0,
            taxAmount: order.taxAmount || 0,
            status: order.status,
            date: order.createdAt ? order.createdAt.toISOString() : new Date().toISOString(),
            items: order.items || [],
            shippingAddress: order.shippingAddress,
            contactNumber: order.contactNumber,
            paymentMethod: order.paymentMethod,
            orderSource: 'B2C',
        }));

        // 5. Transform B2B Orders (from Order.model.js)
        const transformedB2bOrders = b2bOrders.map(order => ({
            _id: order._id,
            id: order.orderId || order._id.toString().substring(order._id.toString().length - 8).toUpperCase(),
            supplierId: order.supplierId ? order.supplierId._id.toString() : null,
            supplierName: order.supplierId ? (order.supplierId.shopName || `${order.supplierId.firstName} ${order.supplierId.lastName}`) : 'Unknown Supplier',
            productName: order.items && order.items.length > 0 ? order.items[0].productName : 'N/A',
            quantity: order.items && order.items.length > 0 ? order.items[0].quantity : 0,
            itemCount: order.items ? order.items.length : 0,
            customerName: order.vendorId ? (order.vendorId.shopName || order.vendorId.name || `${order.vendorId.firstName} ${order.vendorId.lastName}`) : (order.customerName || 'Unknown Vendor'),
            totalAmount: order.totalAmount,
            platformFeeAmount: 0,
            gstAmount: 0,
            shippingAmount: order.shippingCharge || 0,
            taxAmount: 0,
            status: order.status,
            date: order.createdAt ? order.createdAt.toISOString() : new Date().toISOString(),
            items: (order.items || []).map(item => ({
                ...item,
                name: item.productName
            })),
            shippingAddress: order.shippingAddress,
            statusHistory: order.statusHistory || [],
            orderSource: 'B2B',
        }));

        // 6. Combine and Sort by Date
        const allOrders = [...transformedClientOrders, ...transformedB2bOrders].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        return NextResponse.json({ success: true, data: allOrders }, { status: 200 });
    } catch (error) {
        console.error("Error fetching supplier orders:", error);
        return NextResponse.json({ success: false, message: "Error fetching supplier orders", error: error.message }, { status: 500 });
    }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);
