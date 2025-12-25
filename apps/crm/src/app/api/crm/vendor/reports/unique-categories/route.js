import { NextResponse } from "next/server";
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import ProductCategoryModel from '@repo/lib/models/admin/ProductCategory';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

// GET - Fetch unique categories for filter dropdown
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const vendorId = req.user.userId.toString();
    
    // Fetch unique category IDs from products
    const uniqueCategoryIds = await ProductModel.distinct('category', { vendorId: vendorId });
    
    // Fetch category names from ProductCategory collection
    const categories = await ProductCategoryModel.find({
      _id: { $in: uniqueCategoryIds }
    }).select('name');
    
    // Extract category names and sort alphabetically
    const uniqueCategoryNames = categories.map(category => category.name);
    uniqueCategoryNames.sort();
    
    return NextResponse.json({
      success: true,
      data: uniqueCategoryNames
    });
    
  } catch (error) {
    console.error("Error fetching unique categories:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
});