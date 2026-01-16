import mongoose from 'mongoose';
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import {authMiddlewareAdmin} from '../../../../../middlewareAdmin';
import { getRegionQuery } from "@repo/lib/utils/regionQuery";
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import ProductCategoryModel from '@repo/lib/models/admin/ProductCategory';

// Get Supplier Products (with optional filtering by status)
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status'); // Optional query parameter for status
    const regionId = url.searchParams.get('regionId');

    // Build region query
    const regionQuery = getRegionQuery(req.user, regionId);

    // Build query for supplier products only
    const query = { ...regionQuery, origin: 'Supplier' };
    if (status) {
      query.status = status;
    }

    const products = await ProductModel.find(query)
      .populate('vendorId', 'name email') // Populate vendor details
      .populate('category', 'name') // Populate category details
      .select('-__v'); // Exclude version key

    return Response.json({
      message: 'Supplier products retrieved successfully',
      products,
    });
  } catch (error) {
    console.error('Error fetching supplier products:', error);
    return Response.json(
      { message: 'Server error while fetching supplier products' },
      { status: 500 }
    );
  }
},   ["SUPER_ADMIN", "REGIONAL_ADMIN"]);

// Approve or Reject Supplier Product
export const PATCH = authMiddlewareAdmin(async (req) => {
  try {
    const { productId, status } = await req.json();

    // Validate required fields
    if (!productId || !status) {
      return Response.json(
        { message: 'Product ID and status (approved/rejected/pending) are required' },
        { status: 400 }
      );
    }

    // Validate status value
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return Response.json(
        { message: 'Invalid status value. Must be pending, approved, or rejected' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {
      status,
      updatedAt: new Date(), // Update timestamp
    };

    // Find and update the product, ensuring it's a supplier product
    const updatedProduct = await ProductModel.findOneAndUpdate(
      { _id: productId, origin: 'Supplier' },
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('vendorId', 'name email')
      .populate('category', 'name')
      .select('-__v');

    if (!updatedProduct) {
      return Response.json(
        { message: 'Supplier product not found' },
        { status: 404 }
      );
    }

    return Response.json({
      message: `Supplier product ${status} successfully`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating supplier product status:', error);
    return Response.json(
      { message: 'Server error while updating supplier product status' },
      { status: 500 }
    );
  }
},   ["SUPER_ADMIN", "REGIONAL_ADMIN"]);