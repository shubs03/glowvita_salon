// Test endpoint for wishlist functionality
import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import UserWishlistModel from '@repo/lib/models/user/UserWishlist.model';

await _db();

export async function GET() {
  try {
    // Test database connection and model
    const count = await UserWishlistModel.countDocuments();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Wishlist API is working!',
      wishlistCount: count
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to test wishlist API',
      error: error.message 
    }, { status: 500 });
  }
}