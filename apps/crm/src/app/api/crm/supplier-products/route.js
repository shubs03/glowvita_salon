import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import ProductCategoryModel from '../../../../../../../packages/lib/src/models/admin/ProductCategory.model.js';
import { authMiddlewareCrm } from '@/middlewareCrm';

await _db();

// GET - Fetch all products from suppliers for vendors to browse or suppliers to manage their own products
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const userId = req.user.userId.toString();
    const userRole = req.user.role;
    
    // Build query based on user role
    let query = { origin: 'Supplier' };
    
    // If user is a supplier, only fetch their own products
    if (userRole === 'supplier') {
      query.vendorId = userId;
      // For suppliers, fetch all statuses (pending, approved, disapproved)
    } else {
      // For vendors browsing supplier products, only show approved ones
      query.status = 'approved';
    }
    
    const products = await ProductModel.find(query)
      .populate({
        path: 'vendorId',
        model: 'Supplier', // Explicitly specify the Supplier model for population
        select: 'shopName email'
      })
      .populate('category', 'name description')
      .sort({ createdAt: -1 })
      .lean();

    const transformedProducts = products.map(p => ({
        ...p,
        supplierName: p.vendorId?.shopName,
        supplierEmail: p.vendorId?.email,
        // Ensure category is a string to match vendor products structure
        category: p.category?.name || 'Uncategorized',
        categoryDescription: p.category?.description || p.categoryDescription || '',
        // Transform status to match vendor products format
        status: p.status === 'rejected' ? 'disapproved' : p.status,
    }));

    // Return in the same format as vendor products API
    return NextResponse.json({
      success: true,
      data: transformedProducts
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching supplier products:", error);
    return NextResponse.json({ 
      success: false,
      message: "Failed to fetch supplier products",
      error: error.message
    }, { status: 500 });
  }
}, ['vendor', 'supplier']);