import mongoose from 'mongoose';
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import { authMiddlewareAdmin } from '../../../../../middlewareAdmin';
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
      .populate('vendorId', 'name email shopName businessRegistrationNo') // Populate supplier details
      .populate('category', 'name') // Populate category details
      .select('-__v'); // Exclude version key

    // Transform products to include supplier name field
    const transformedProducts = products.map(product => {
      const supplierInfo = product.vendorId || {};
      return {
        ...product.toObject(),
        supplierName: supplierInfo.shopName || supplierInfo.name || 'N/A',
      };
    });

    return Response.json({
      message: 'Supplier products retrieved successfully',
      products: transformedProducts,
    });
  } catch (error) {
    console.error('Error fetching supplier products:', error);
    return Response.json(
      { message: 'Server error while fetching supplier products' },
      { status: 500 }
    );
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);

// Approve or Reject Supplier Product
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

    // Find and update the product, ensuring it's a supplier product
    const updatedProduct = await ProductModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(productId), origin: 'Supplier' },
      { $set: updateData },
      { new: true, runValidators: false }
    )
      .populate('vendorId', 'name email shopName businessRegistrationNo')
      .populate('category', 'name')
      .select('-__v');
    
    // Transform the updated product to include supplier name
    let transformedUpdatedProduct = updatedProduct;
    if (updatedProduct && updatedProduct.vendorId) {
      transformedUpdatedProduct = {
        ...updatedProduct.toObject(),
        supplierName: updatedProduct.vendorId.shopName || updatedProduct.vendorId.name || 'N/A',
      };
    }

    if (!updatedProduct) {
      return Response.json(
        { message: 'Supplier product not found' },
        { status: 404 }
      );
    }

    return Response.json({
      message: `Supplier product ${status} successfully`,
      product: transformedUpdatedProduct,
    });
  } catch (error) {
    console.error('Error updating supplier product status:', error);
    return Response.json(
      { message: 'Server error while updating supplier product status' },
      { status: 500 }
    );
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);