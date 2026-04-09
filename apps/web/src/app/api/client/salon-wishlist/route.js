import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import { verifyJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';
import UserSalonWishlistModel from '@repo/lib/models/user/UserSalonWishlist.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import ReviewModel from '@repo/lib/models/Review/Review.model';
import mongoose from 'mongoose';

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

// GET: Fetch the user's salon wishlist
export async function GET(req) {
    try {
        const userId = await getUserId(req);

        if (!userId) {
            return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
        }

        let wishlist = await UserSalonWishlistModel.findOne({ userId }).lean();

        if (!wishlist) {
            // If no wishlist exists, create an empty one
            wishlist = { userId, items: [] };
        } else if (wishlist.items && wishlist.items.length > 0) {
            // Fetch dynamic reviews for salons
            const itemIds = wishlist.items.map(item => new mongoose.Types.ObjectId(item.salonId));
            
            const reviews = await ReviewModel.aggregate([
                { $match: { entityId: { $in: itemIds }, entityType: 'salon', isApproved: true } },
                { $group: { _id: '$entityId', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } }
            ]);
            
            const reviewMap = {};
            reviews.forEach(r => {
                reviewMap[r._id.toString()] = { rating: r.averageRating, reviewCount: r.reviewCount };
            });
            
            wishlist.items = wishlist.items.map(item => {
                const reviewData = reviewMap[item.salonId.toString()] || { rating: 0, reviewCount: 0 };
                return {
                    ...item,
                    rating: reviewData.rating ? parseFloat(reviewData.rating.toFixed(1)) : 4.5,
                    reviewCount: reviewData.reviewCount
                };
            });
        }


        return NextResponse.json({ success: true, data: wishlist });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to fetch salon favorites', error: error.message }, { status: 500 });
    }
}

// POST: Add a salon to the wishlist
export async function POST(req) {
    try {
        const userId = await getUserId(req);

        if (!userId) {
            return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
        }

        const { salonId } = await req.json();

        if (!salonId) {
            return NextResponse.json({ success: false, message: 'Salon ID is required' }, { status: 400 });
        }

        // Validate if salonId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(salonId)) {
            return NextResponse.json({ success: false, message: 'Invalid salon ID format' }, { status: 400 });
        }

        // Check if salon exists
        const salon = await VendorModel.findById(salonId);

        if (!salon) {
            return NextResponse.json({ success: false, message: 'Salon not found' }, { status: 404 });
        }

        // Check if user already has this salon in wishlist
        const existingWishlist = await UserSalonWishlistModel.findOne({
            userId,
            'items.salonId': salonId
        });

        // If salon already exists in wishlist, return success
        if (existingWishlist) {
            return NextResponse.json({ success: true, message: 'Salon already in favorites' });
        }

        // Add salon to wishlist
        const wishlistItem = {
            salonId: salon._id,
            salonName: salon.businessName,
            salonImage: salon.profileImage || salon.gallery?.[0] || '',
            rating: salon.rating || 4.5,
            reviewCount: salon.clientCount || 0,
            category: salon.category,
            city: salon.city,
            state: salon.state
        };

        const updatedWishlist = await UserSalonWishlistModel.findOneAndUpdate(
            { userId },
            {
                $push: { items: wishlistItem },
                $setOnInsert: { userId: userId }
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, data: updatedWishlist, message: 'Salon added to favorites' });
    } catch (error) {
        console.error('Error adding salon to favorites:', error);
        return NextResponse.json({ success: false, message: 'Failed to add salon to favorites', error: error.message }, { status: 500 });
    }
}

// DELETE: Remove a salon from the wishlist
export async function DELETE(req) {
    try {
        const userId = await getUserId(req);

        if (!userId) {
            return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
        }

        const { salonId } = await req.json();

        if (!salonId) {
            return NextResponse.json({ success: false, message: 'Salon ID is required' }, { status: 400 });
        }

        const updatedWishlist = await UserSalonWishlistModel.findOneAndUpdate(
            { userId },
            { $pull: { items: { salonId } } },
            { new: true }
        );

        return NextResponse.json({ success: true, data: updatedWishlist || { userId, items: [] }, message: 'Salon removed from favorites' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to remove salon from favorites', error: error.message }, { status: 500 });
    }
}
