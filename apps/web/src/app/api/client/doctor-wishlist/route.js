import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import { verifyJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';
import UserDoctorWishlistModel from '@repo/lib/models/user/UserDoctorWishlist.model';
import DoctorModel from '@repo/lib/models/Vendor/Docters.model';
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

// GET: Fetch the user's doctor wishlist
export async function GET(req) {
  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
    }

    let wishlist = await UserDoctorWishlistModel.findOne({ userId }).lean();
    
    if (!wishlist) {
      // If no wishlist exists, create an empty one
      wishlist = { userId, items: [] };
    }
    
    return NextResponse.json({ success: true, data: wishlist });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch doctor wishlist', error: error.message }, { status: 500 });
  }
}

// POST: Add a doctor to the wishlist
export async function POST(req) {
  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
    }

    const { doctorId } = await req.json();

    if (!doctorId) {
      return NextResponse.json({ success: false, message: 'Doctor ID is required' }, { status: 400 });
    }

    // Validate if doctorId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return NextResponse.json({ success: false, message: 'Invalid doctor ID format' }, { status: 400 });
    }

    // Check if doctor exists (removed status check - users can wishlist any doctor)
    const doctor = await DoctorModel.findOne({ 
      _id: doctorId
    });
    
    if (!doctor) {
      console.log('Doctor not found with ID:', doctorId);
      return NextResponse.json({ success: false, message: 'Doctor not found' }, { status: 404 });
    }

    // Check if user already has this doctor in wishlist
    const existingWishlist = await UserDoctorWishlistModel.findOne({ 
      userId, 
      'items.doctorId': doctorId 
    });

    // If doctor already exists in wishlist, return success
    if (existingWishlist) {
      return NextResponse.json({ success: true, message: 'Doctor already in wishlist' });
    }

    // Add doctor to wishlist
    const wishlistItem = {
      doctorId: doctor._id,
      doctorName: doctor.name,
      doctorImage: doctor.profileImage || '',
      specialty: doctor.specialties?.[0] || doctor.doctorType || 'General Physician',
      experience: parseInt(doctor.experience) || 0,
      rating: 4.5, // Default rating, could be enhanced with actual reviews
      consultationFee: doctor.consultationFee || 0,
      clinicName: doctor.clinicName || '',
      city: doctor.city || '',
      state: doctor.state || ''
    };

    const updatedWishlist = await UserDoctorWishlistModel.findOneAndUpdate(
      { userId },
      { 
        $push: { items: wishlistItem },
        $setOnInsert: { userId: userId }
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ success: true, data: updatedWishlist, message: 'Doctor added to wishlist' });
  } catch (error) {
    console.error('Error adding doctor to wishlist:', error);
    return NextResponse.json({ success: false, message: 'Failed to add doctor to wishlist', error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a doctor from the wishlist
export async function DELETE(req) {
  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
    }

    const { doctorId } = await req.json();

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