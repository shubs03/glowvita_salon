import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import { verifyJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';
import UserWishlistModel from '@repo/lib/models/user/UserWishlist.model';
import ProductModel from '@repo/lib/models/Vendor/Product.model';

await _db();

// Helper function to get user ID from JWT token
const getUserId = async (req) => {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return null;
    }
    
    const payload = await verifyJwt(token);
    return payload?.userId;
  } catch (error) {
    return null;
  }
};

// GET: Fetch the user's wishlist
export async function GET(req) {
  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
    }

    let wishlist = await UserWishlistModel.findOne({ userId }).lean();
    
    if (!wishlist) {
      // If no wishlist exists, create an empty one
      wishlist = { userId, items: [] };
    }
    
    return NextResponse.json({ success: true, data: wishlist });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch wishlist', error: error.message }, { status: 500 });
  }
}

// POST: Add an item to the wishlist
export async function POST(req) {
  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }

    // Check if product exists
    const product = await ProductModel.findById(productId);
    
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Check if user already has this product in wishlist
    const existingWishlist = await UserWishlistModel.findOne({ 
      userId, 
      'items.productId': productId 
    });

    // If product already exists in wishlist, return success
    if (existingWishlist) {
      return NextResponse.json({ success: true, message: 'Product already in wishlist' });
    }

    // Add product to wishlist
    const wishlistItem = {
      productId: product._id,
      productName: product.productName,
      productImage: product.productImages?.[0] || '', // Use first image from productImages array
      price: product.salePrice || product.price,
      vendorId: product.vendorId,
      supplierName: product.supplierName
    };

    const updatedWishlist = await UserWishlistModel.findOneAndUpdate(
      { userId },
      { 
        $push: { items: wishlistItem },
        $setOnInsert: { userId: userId }
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ success: true, data: updatedWishlist, message: 'Product added to wishlist' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to add item to wishlist', error: error.message }, { status: 500 });
  }
}

// DELETE: Remove an item from the wishlist
export async function DELETE(req) {
  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }

    const updatedWishlist = await UserWishlistModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatedWishlist || { userId, items: [] }, message: 'Product removed from wishlist' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to remove item from wishlist', error: error.message }, { status: 500 });
  }
}