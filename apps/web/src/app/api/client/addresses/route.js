import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@repo/lib/auth';
import connectDB from '@repo/lib/db';
import UserModel from '@repo/lib/models/user/User.model';

// GET - Fetch user's registered address
export async function GET(request) {
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

    const user = await UserModel.findById(payload.userId);
    
    if (!user) {
      // Return empty address instead of error for better UX
      return NextResponse.json({
        address: null,
        city: null,
        state: null,
        pincode: null,
        landmark: null,
        coordinates: null,
        savedAddresses: []
      });
    }

    // Return user's registered address AND all saved addresses
    return NextResponse.json({
      address: user.address || null,
      city: user.city || null,
      state: user.state || null,
      pincode: user.pincode || null,
      landmark: user.landmark || null,
      coordinates: user.location || null,
      savedAddresses: user.savedAddresses || []
    });
  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user's registered address
export async function PUT(request) {
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

    const body = await request.json();
    const { address, city, state, pincode, landmark, lat, lng } = body;

    // Validate required fields
    if (!city || !state || !pincode) {
      return NextResponse.json(
        { message: 'Missing required address fields (city, state, pincode)' },
        { status: 400 }
      );
    }

    if (!lat || !lng) {
      return NextResponse.json(
        { message: 'Location coordinates are required' },
        { status: 400 }
      );
    }

    // Prepare update data - only update fields that exist in User model
    const updateData = {
      city,
      state,
      pincode,
      location: { lat: Number(lat), lng: Number(lng) },
      updatedAt: new Date()
    };

    // Add optional fields if they're provided
    if (address) updateData.address = address;
    if (landmark) updateData.landmark = landmark;

    const user = await UserModel.findByIdAndUpdate(
      payload.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Address updated successfully',
      address: {
        address: user.address || address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        landmark: user.landmark || landmark,
        coordinates: user.location
      }
    });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add new address to user's saved addresses
export async function POST(request) {
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

    const body = await request.json();
    const { address, city, state, pincode, landmark, lat, lng, label, isPrimary } = body;

    // Validate required fields
    if (!city || !state || !pincode) {
      return NextResponse.json(
        { message: 'Missing required address fields (city, state, pincode)' },
        { status: 400 }
      );
    }

    if (!lat || !lng) {
      return NextResponse.json(
        { message: 'Location coordinates are required' },
        { status: 400 }
      );
    }

    const newAddress = {
      address: address || '',
      city,
      state,
      pincode,
      landmark: landmark || '',
      location: { lat: Number(lat), lng: Number(lng) },
      label: label || 'Home',
      isPrimary: isPrimary || false,
      createdAt: new Date()
    };

    const user = await UserModel.findById(payload.userId);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const normalizedLat = Number(lat);
    const normalizedLng = Number(lng);
    const normalizedAddress = address || '';

    const alreadySaved = (user.savedAddresses || []).some((saved) => {
      return (
        Number(saved.location?.lat) === normalizedLat &&
        Number(saved.location?.lng) === normalizedLng &&
        (saved.address || '') === normalizedAddress &&
        (saved.city || '') === city &&
        (saved.state || '') === state &&
        (saved.pincode || '') === pincode
      );
    });

    if (alreadySaved) {
      return NextResponse.json({
        message: 'Address already saved',
        savedAddresses: user.savedAddresses
      });
    }

    if (isPrimary) {
      user.savedAddresses = (user.savedAddresses || []).map((saved) => {
        const savedObject = typeof saved?.toObject === 'function' ? saved.toObject() : saved;
        return {
          ...savedObject,
          isPrimary: false
        };
      });
    }

    user.savedAddresses.push(newAddress);
    await user.save();

    return NextResponse.json({
      message: 'Address added successfully',
      savedAddresses: user.savedAddresses
    });
  } catch (error) {
    console.error('Error adding address:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
