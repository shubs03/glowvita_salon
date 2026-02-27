import mongoose from 'mongoose';
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import { authMiddlewareAdmin } from '../../../../../middlewareAdmin';
import { getRegionQuery } from "@repo/lib/utils/regionQuery";
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import ProductCategoryModel from '@repo/lib/models/admin/ProductCategory';

// Get Vendor Products (with optional filtering by status)
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status'); // Optional query parameter for status
    const regionId = url.searchParams.get('regionId');

    // Build region query
    const regionQuery = getRegionQuery(req.user, regionId);

    // Build query for vendor products only
    const query = { ...regionQuery, origin: 'Vendor' };
    if (status) {
      query.status = status;
    }

    const products = await ProductModel.find(query)
      .populate('vendorId', 'name email') // Populate vendor details
      .populate('category', 'name') // Populate category details
      .select('-__v'); // Exclude version key

    return Response.json({
      message: 'Vendor products retrieved successfully',
      products,
    });
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    return Response.json(
      { message: 'Server error while fetching vendor products' },
      { status: 500 }
    );
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "product-approval:view");

// Approve or Reject Vendor Product
export const PATCH = authMiddlewareAdmin(async (req) => {
  try {
    const { productId, status, rejectionReason } = await req.json();

    // Validate required fields
    if (!productId || !status) {
      return Response.json(
        { message: 'Product ID and status (approved/rejected/disapproved/pending) are required' },
        { status: 400 }
      );
    }

    // Validate status value
    if (!['pending', 'approved', 'rejected', 'disapproved'].includes(status)) {
      return Response.json(
        { message: 'Invalid status value. Must be pending, approved, rejected, or disapproved' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {
      status,
      updatedAt: new Date(), // Update timestamp
    };

    if ((status === 'rejected' || status === 'disapproved') && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    } else if (status === 'approved') {
      updateData.rejectionReason = null;
    }

    // Find and update the product, ensuring it's a vendor product
    const updatedProduct = await ProductModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(productId), origin: 'Vendor' },
      { $set: updateData },
      { new: true, runValidators: false }
    )
      .populate('vendorId', 'name email')
      .populate('category', 'name')
      .select('-__v');

    if (!updatedProduct) {
      return Response.json(
        { message: 'Vendor product not found' },
        { status: 404 }
      );
    }

    return Response.json({
      message: `Vendor product ${status} successfully`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating vendor product status:', error);
    return Response.json(
      { message: 'Server error while updating vendor product status' },
      { status: 500 }
    );
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "product-approval:edit");