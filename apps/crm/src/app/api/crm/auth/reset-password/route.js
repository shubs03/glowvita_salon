import { NextResponse } from 'next/server';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import DoctorModel from '@repo/lib/models/Vendor/Docters.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import StaffModel from '@repo/lib/models/Vendor/Staff.model';
import _db from '@repo/lib/db';
import bcrypt from 'bcryptjs';

await _db();

// Role to model mapping
const roleToModelMap = {
  vendor: VendorModel,
  doctor: DoctorModel,
  supplier: SupplierModel,
  staff: StaffModel,
};

export async function POST(request) {
  try {
    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters long" }, { status: 400 });
    }

    // Find user across all models with the reset token
    let user = null;
    let userType = null;
    let Model = null;

    const userRoles = [
      { model: VendorModel, type: 'vendor' },
      { model: DoctorModel, type: 'doctor' },
      { model: SupplierModel, type: 'supplier' },
      { model: StaffModel, type: 'staff' },
    ];

    for (const roleInfo of userRoles) {
      const foundUser = await roleInfo.model.findOne({ 
        email,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });
      if (foundUser) {
        user = foundUser;
        userType = roleInfo.type;
        Model = roleInfo.model;
        break;
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "Password reset token is invalid or has expired." }, { status: 400 });
    }

    // Immediately clear the reset token to prevent reuse
    try {
      await Model.findByIdAndUpdate(user._id, {
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined
      });
      console.log('Reset token cleared for user:', user.email);
    } catch (clearError) {
      console.error('Error clearing reset token:', clearError);
      return NextResponse.json({ 
        success: false, 
        error: "Failed to process reset request. Please try again later." 
      }, { status: 500 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await Model.findByIdAndUpdate(user._id, {
      password: hashedPassword
    });

    return NextResponse.json({ 
      success: true, 
      message: "Password reset successfully. You can now log in with your new password." 
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}