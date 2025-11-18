import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import { verifyJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';
import UserDoctorWishlistModel from '@repo/lib/models/user/UserDoctorWishlist.model';

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

// GET: Check if a specific doctor is in the user's wishlist
export async function GET(req, { params }) {
  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
    }

    const { id: doctorId } = params;

    if (!doctorId) {
      return NextResponse.json({ success: false, message: 'Doctor ID is required' }, { status: 400 });
    }

    const wishlist = await UserDoctorWishlistModel.findOne({ 
      userId,
      'items.doctorId': doctorId
    });

    const isInWishlist = !!wishlist;
    
    return NextResponse.json({ success: true, isInWishlist });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to check doctor wishlist status', error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a specific doctor from the wishlist
export async function DELETE(req, { params }) {
  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
    }

    const { id: doctorId } = params;

    if (!doctorId) {
      return NextResponse.json({ success: false, message: 'Doctor ID is required' }, { status: 400 });
    }

    const updatedWishlist = await UserDoctorWishlistModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { doctorId } } },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatedWishlist || { userId, items: [] }, message: 'Doctor removed from wishlist' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to remove doctor from wishlist', error: error.message }, { status: 500 });
  }
}