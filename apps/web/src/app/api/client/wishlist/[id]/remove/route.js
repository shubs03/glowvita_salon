import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import { verifyJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';
import UserWishlistModel from '@repo/lib/models/user/UserWishlist.model';

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

// DELETE: Remove a specific product from the user's wishlist
export async function DELETE(req, { params }) {
  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
    }

    const { id: productId } = params;

    if (!productId) {
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }

    const updatedWishlist = await UserWishlistModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    );

    return NextResponse.json({ 
      success: true, 
      data: updatedWishlist || { userId, items: [] }, 
      message: 'Product removed from wishlist' 
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to remove item from wishlist', error: error.message }, { status: 500 });
  }
}