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

// GET: Check if a specific product is in the user's wishlist
export async function GET(req, { params }) {
  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
    }

    const { id: productId } = params;

    if (!productId) {
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }

    const wishlist = await UserWishlistModel.findOne({ 
      userId, 
      'items.productId': productId 
    });

    const isInWishlist = !!wishlist;
    
    return NextResponse.json({ success: true, isInWishlist });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to check wishlist status', error: error.message }, { status: 500 });
  }
}