import { NextResponse } from 'next/server';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import DoctorModel from '@repo/lib/models/Vendor/Docters.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import StaffModel from '@repo/lib/models/staffModel';
import _db from '@repo/lib/db';

await _db();

export async function POST(request) {
  try {
    const { token, email } = await request.json();

    if (!token || !email) {
      return NextResponse.json({ isValid: false, error: "Token and email are required" }, { status: 400 });
    }

    // Find user across all models with the reset token
    let user = null;
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
        Model = roleInfo.model;
        break;
      }
    }

    if (!user) {
      return NextResponse.json({ isValid: false, error: "Password reset token is invalid or has expired." });
    }

    // Immediately invalidate the token upon first access
    try {
      await Model.findByIdAndUpdate(user._id, {
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined
      });
      console.log('Reset token invalidated for user:', user.email);
    } catch (invalidateError) {
      console.error('Error invalidating reset token:', invalidateError);
    }

    return NextResponse.json({ isValid: true });
  } catch (error) {
    console.error("Validate reset token error:", error);
    return NextResponse.json({ isValid: false, error: "Something went wrong" }, { status: 500 });
  }
}