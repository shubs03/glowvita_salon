import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import ProductModel from '../../../../../../../packages/lib/src/models/Vendor/Product.model.js';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

// GET - Fetch all products from suppliers for vendors to browse
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const products = await ProductModel.find({ origin: 'Supplier', status: 'approved' })
      .populate('vendorId', 'shopName email') // 'vendorId' here is the supplier
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    const transformedProducts = products.map(p => ({
        ...p.toObject(),
        supplierName: p.vendorId?.shopName,
        supplierEmail: p.vendorId?.email
    }));

    return NextResponse.json(transformedProducts, { status: 200 });
  } catch (error) {
    console.error("Error fetching supplier products:", error);
    return NextResponse.json({ message: "Failed to fetch supplier products" }, { status: 500 });
  }
}, ['vendor']);
