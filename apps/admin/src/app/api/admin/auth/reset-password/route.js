import { NextResponse } from 'next/server';
import AdminUserModel from '@repo/lib/models/admin/AdminUser';
import _db from '@repo/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await _db();
    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters long" }, { status: 400 });
    }

    // Find admin user with the reset token
    const user = await AdminUserModel.findOne({
      emailAddress: email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Password reset token is invalid or has expired." }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    const updateData = {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined
    };

    await AdminUserModel.findByIdAndUpdate(user._id, updateData);

    console.log('Password updated and token cleared for admin:', user.emailAddress);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password."
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
