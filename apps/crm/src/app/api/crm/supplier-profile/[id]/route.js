import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import SupplierModel from '../../../../../../../../packages/lib/src/models/Vendor/Supplier.model.js';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

// GET a specific supplier's public profile
export const GET = authMiddlewareCrm(async (req, { params }) => {
  try {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ message: "Supplier ID is required" }, { status: 400 });
    }

    const supplier = await SupplierModel.findById(id).select('shopName email country city description profileImage');

    if (!supplier) {
        return NextResponse.json({ message: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json(supplier, { status: 200 });
  } catch (error) {
    console.error("Error fetching supplier profile:", error);
    return NextResponse.json({ message: "Failed to fetch supplier profile" }, { status: 500 });
  }
}, ['vendor']);
