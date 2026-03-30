import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@repo/lib/auth';
import connectDB from '@repo/lib/db';
import UserModel from '@repo/lib/models/user/User.model';

// DELETE - Remove a specific saved address
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const token = cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyJwt(token);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { addressId } = params;

    if (!addressId) {
      return NextResponse.json(
        { message: 'Address ID is required' },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(payload.userId);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Find and remove the address with the matching _id
    const initialLength = user.savedAddresses?.length || 0;
    user.savedAddresses = (user.savedAddresses || []).filter(
      (addr) => addr._id.toString() !== addressId
    );

    // Check if any address was actually removed
    if (user.savedAddresses.length === initialLength) {
      return NextResponse.json(
        { message: 'Address not found' },
        { status: 404 }
      );
    }

    await user.save();

    return NextResponse.json({
      message: 'Address deleted successfully',
      savedAddresses: user.savedAddresses
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
// PUT - Update a specific saved address
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const token = cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyJwt(token);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { addressId } = params;
    const body = await request.json();
    const { fullName, mobileNo, address, city, state, pincode, landmark, lat, lng, isPrimary } = body;

    const user = await UserModel.findById(payload.userId);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Find the address to update
    const addressIndex = user.savedAddresses?.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1 || addressIndex === undefined) {
      return NextResponse.json(
        { message: 'Address not found' },
        { status: 404 }
      );
    }

    // Update fields
    const updatedAddr = {
      ...user.savedAddresses[addressIndex].toObject(),
      fullName: fullName || user.savedAddresses[addressIndex].fullName,
      mobileNo: mobileNo || user.savedAddresses[addressIndex].mobileNo,
      address: address || user.savedAddresses[addressIndex].address,
      city: city || user.savedAddresses[addressIndex].city,
      state: state || user.savedAddresses[addressIndex].state,
      pincode: pincode || user.savedAddresses[addressIndex].pincode,
      landmark: landmark || user.savedAddresses[addressIndex].landmark,
      location: (lat !== undefined && lng !== undefined) ? { lat: Number(lat), lng: Number(lng) } : user.savedAddresses[addressIndex].location,
      isPrimary: isPrimary ?? user.savedAddresses[addressIndex].isPrimary,
      updatedAt: new Date()
    };

    if (isPrimary) {
      user.savedAddresses = (user.savedAddresses || []).map((saved, idx) => {
        const savedObject = typeof saved?.toObject === 'function' ? saved.toObject() : saved;
        return {
          ...savedObject,
          isPrimary: idx === addressIndex
        };
      });
    }

    user.savedAddresses[addressIndex] = updatedAddr;
    await user.save();

    return NextResponse.json({
      message: 'Address updated successfully',
      savedAddresses: user.savedAddresses
    });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
