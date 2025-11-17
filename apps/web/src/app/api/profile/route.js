import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@repo/lib/auth';
import dbConnect from '@repo/lib/db';
import User from '@repo/lib/models/user';
import bcrypt from 'bcryptjs';

export async function GET(req) {
  const db = await dbConnect();
  
  // If database connection is not available, return an error
  if (!db) {
    return NextResponse.json({ message: 'Service temporarily unavailable' }, { status: 503 });
  }
  
  const token = cookies().get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await verifyJwt(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { password, ...userWithoutPassword } = user.toObject();

    return NextResponse.json({ user: userWithoutPassword }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req) {
  const db = await dbConnect();
  
  // If database connection is not available, return an error
  if (!db) {
    return NextResponse.json({ message: 'Service temporarily unavailable' }, { status: 503 });
  }
  
  const token = cookies().get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await verifyJwt(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    
    // Handle password change
    if (body.currentPassword && body.newPassword) {
      // Verify current password
      const isMatch = await bcrypt.compare(body.currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
      }
      
      // Validate new password
      if (body.newPassword.length < 6) {
        return NextResponse.json({ message: 'New password must be at least 6 characters long' }, { status: 400 });
      }
      
      if (body.newPassword !== body.confirmPassword) {
        return NextResponse.json({ message: 'New passwords do not match' }, { status: 400 });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(body.newPassword, 10);
      
      // Update password
      await User.findByIdAndUpdate(payload.userId, { password: hashedPassword });
      
      return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
    }
    
    // Handle profile update (excluding password fields)
    const updateData = {};
    const allowedFields = ['firstName', 'lastName', 'mobileNo', 'state', 'city', 'pincode'];
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });
    
    if (Object.keys(updateData).length > 0) {
      await User.findByIdAndUpdate(payload.userId, updateData);
    }
    
    // Fetch updated user data
    const updatedUser = await User.findById(payload.userId);
    const { password, ...userWithoutPassword } = updatedUser.toObject();
    
    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: userWithoutPassword
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}