import { NextResponse } from 'next/server';
import UserModel from '@repo/lib/models/user';
import _db from "@repo/lib/db";
import { hashPassword } from "@repo/lib/hashing";

export async function POST(request) {
  try {
    console.log('Reset password endpoint called');

    // Connect to database
    try {
      await _db();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
    }

    const { token, email, password } = await request.json();
    console.log('Reset password request for email:', email);
    console.log('Token received:', token);
    console.log('Current time:', new Date());

    if (!token || !email || !password) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters long" }, { status: 400 });
    }

    // Find user with the reset token
    let user = null;
    try {
      console.log(`Searching in User model for email field emailAddress:`, email);
      const now = Date.now();
      console.log('Current time for query:', now);

      user = await UserModel.findOne({
        emailAddress: email,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: now }
      });

      if (user) {
        console.log(`User found in User model:`, user.emailAddress);
        console.log('User resetPasswordExpires:', user.resetPasswordExpires);
        console.log('Token expiry comparison:', {
          expires: user.resetPasswordExpires,
          now: now,
          isValid: user.resetPasswordExpires > now
        });
      }
    } catch (modelError) {
      console.error(`Error searching in User model:`, modelError);
    }

    if (!user) {
      console.log('Invalid or expired token for email:', email);
      return NextResponse.json({
        success: false,
        error: "Password reset token is invalid or has expired."
      }, { status: 400 });
    }

    console.log('User found:', user.emailAddress);

    // Immediately clear the reset token to prevent reuse
    try {
      await UserModel.findByIdAndUpdate(user._id, {
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined
      });
      console.log('Reset token cleared for user:', user.emailAddress);
    } catch (clearError) {
      console.error('Error clearing reset token:', clearError);
      return NextResponse.json({
        success: false,
        error: "Failed to process reset request. Please try again later."
      }, { status: 500 });
    }

    // Hash the new password
    let hashedPassword;
    try {
      hashedPassword = await hashPassword(password);
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      return NextResponse.json({
        success: false,
        error: "Failed to process password. Please try again later."
      }, { status: 500 });
    }

    // Update user's password
    try {
      await UserModel.findByIdAndUpdate(user._id, {
        password: hashedPassword
      });
      console.log('Password updated for user:', user.emailAddress);
    } catch (saveError) {
      console.error('Error updating password:', saveError);
      return NextResponse.json({
        success: false,
        error: "Failed to update password. Please try again later."
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password."
    });
  } catch (error) {
    console.error("Reset password error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}