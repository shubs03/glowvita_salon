import { NextResponse } from "next/server";
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

// GET - Fetch unique brands for filter dropdown
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const vendorId = req.user.userId.toString();
    
    // Fetch unique brands
    const uniqueBrands = await ProductModel.distinct('brand', { 
      vendorId: vendorId,
      brand: { $ne: null }
    });
    
    // Filter out null/undefined values and empty strings
    const filteredBrands = uniqueBrands.filter(brand => brand && brand.trim() !== '');
    
    // Sort alphabetically
    filteredBrands.sort();
    
    return NextResponse.json({
      success: true,
      data: filteredBrands
    });
    
  } catch (error) {
    console.error("Error fetching unique brands:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
});