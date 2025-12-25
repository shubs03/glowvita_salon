import { NextResponse } from "next/server";
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

// GET - Fetch unique product names for filter dropdown
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const vendorId = req.user.userId.toString();
    
    // Fetch unique product names
    const uniqueProductNames = await ProductModel.distinct('productName', { vendorId: vendorId });
    
    // Sort alphabetically
    uniqueProductNames.sort();
    
    return NextResponse.json({
      success: true,
      data: uniqueProductNames
    });
    
  } catch (error) {
    console.error("Error fetching unique product names:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
});