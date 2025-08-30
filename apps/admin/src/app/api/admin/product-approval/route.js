import mongoose from 'mongoose';
import ProductModel from '../../../../../../../packages/lib/src/models/Vendor/Product.model'; // Adjust path to your ProductModel
import {authMiddlewareAdmin} from '../../../../middlewareAdmin'; // Adjust path to your middleware
import VendorModel from '../../../../../../../packages/lib/src/models/Vendor/Vendor.model';
import ProductCategoryModel from '../../../../../../../packages/lib/src/models/admin/ProductCategory.model';
// Get Products (with optional filtering by status)
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status'); // Optional query parameter for status

    const query = status ? { status } : {};
    const products = await ProductModel.find(query)
      .populate('vendorId', 'name email') // Populate vendor details
      .populate('category', 'name') // Populate category details
      .select('-__v'); // Exclude version key

    return Response.json({
      message: 'Products retrieved successfully',
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return Response.json(
      { message: 'Server error while fetching products' },
      { status: 500 }
    );
  }
}, ['superadmin']);

// Approve or Reject Product
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

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('vendorId', 'name email')
      .populate('category', 'name')
      .select('-__v');

    if (!updatedProduct) {
      return Response.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return Response.json({
      message: `Product ${status} successfully`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product status:', error);
    return Response.json(
      { message: 'Server error while updating product status' },
      { status: 500 }
    );
  }
}, ['superadmin']);