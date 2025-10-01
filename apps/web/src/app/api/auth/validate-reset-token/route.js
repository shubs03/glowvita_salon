import { NextResponse } from 'next/server';
import UserModel from '@repo/lib/models/user';
import _db from "@repo/lib/db";

export async function POST(request) {
  try {
    console.log('Validate reset token endpoint called');
    
    // Connect to database
    try {
      await _db();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ isValid: false, error: "Database connection failed" }, { status: 500 });
    }

    const { token, email } = await request.json();
    console.log('Validate reset token request for email:', email);
    console.log('Token received:', token);

    if (!token || !email) {
      return NextResponse.json({ isValid: false, error: "Token and email are required" }, { status: 400 });
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
        console.log(`Valid user found in User model:`, user.emailAddress);
        console.log('User resetPasswordExpires:', user.resetPasswordExpires);
        
        // Immediately invalidate the token upon first access
        try {
          await UserModel.findByIdAndUpdate(user._id, {
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined
          });
          console.log('Reset token invalidated for user:', user.emailAddress);
        } catch (invalidateError) {
          console.error('Error invalidating reset token:', invalidateError);
        }
        
        return NextResponse.json({ isValid: true });
      } else {
        console.log('Invalid or expired token for email:', email);
        return NextResponse.json({ isValid: false, error: "Password reset token is invalid or has expired." });
      }
    } catch (modelError) {
      console.error(`Error searching in User model:`, modelError);
      return NextResponse.json({ isValid: false, error: "Failed to validate token" }, { status: 500 });
    }
  } catch (error) {
    console.error("Validate reset token error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json({ isValid: false, error: "Something went wrong" }, { status: 500 });
  }
}