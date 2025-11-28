import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import ClientOrder from '@repo/lib/models/user/ClientOrder.model';
import { authMiddlewareCrm } from '@/middlewareCrm';

await _db();

// GET Online Customer Orders for the logged-in vendor
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    // Only vendors can fetch their customer orders
    if (role !== 'vendor') {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Fetch online customer orders for this vendor
    const clientOrders = await ClientOrder.find({ vendorId: userId }).sort({ createdAt: -1 });

    return NextResponse.json(clientOrders, { status: 200 });
  } catch (error) {
    console.error("Error fetching client orders:", error);
    return NextResponse.json({ message: "Failed to fetch client orders", error: error.message }, { status: 500 });
  }
}, ['vendor']);