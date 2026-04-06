import { NextResponse } from 'next/server';
import AdminUserModel from '@repo/lib/models/admin/AdminUser';
import _db from '@repo/lib/db';

export async function POST(request) {
  try {
    await _db();
    const { token, email } = await request.json();

    if (!token || !email) {
      return NextResponse.json({ isValid: false, error: "Token and email are required" }, { status: 400 });
    }

    // Find admin user with the reset token
    const user = await AdminUserModel.findOne({
      emailAddress: email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json({ isValid: false, error: "Password reset token is invalid or has expired." });
    }

    return NextResponse.json({ isValid: true });
  } catch (error) {
    console.error("Validate reset token error:", error);
    return NextResponse.json({ isValid: false, error: "Something went wrong" }, { status: 500 });
  }
}
