import { NextResponse } from 'next/server';
import { authMiddlewareCrm } from "../../../../../middlewareCrm";
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import DoctorModel from '@repo/lib/models/Vendor/Docters.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import StaffModel from '@repo/lib/models/Vendor/Staff.model';

// Helper function to get user model based on role
const getUserModel = (role) => {
  switch (role) {
    case 'vendor':
      return VendorModel;
    case 'doctor':
      return DoctorModel;
    case 'supplier':
      return SupplierModel;
    case 'staff':
      return StaffModel;
    default:
      return VendorModel;
  }
};

// Get user profile
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const user = req.user;
    const userId = user.userId;
    const userRole = user.role;

    const Model = getUserModel(userRole);
    
    // Fetch the latest user data from database
    const userData = await Model.findById(userId).select('-password');
    
    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: userData,
      role: userRole
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
},['vendor']);

// Update user profile
export const PUT = authMiddlewareCrm(async (req) => {
  try {
    const user = req.user;
    const userId = user.userId;
    const userRole = user.role;
    const body = await req.json();

    const Model = getUserModel(userRole);
    
    // Remove sensitive fields that shouldn't be updated via profile
    const { password, referralCode, ...updateData } = body;
    
    const updatedUser = await Model.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
},['vendor']);