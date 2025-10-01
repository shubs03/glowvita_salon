import { NextResponse } from 'next/server';
import UserModel from '@repo/lib/models/user';
import _db from "@repo/lib/db";
import crypto from 'crypto';
import { sendEmail } from "@repo/lib/emailService";

export async function POST(request) {
  try {
    console.log('Forgot password endpoint called');
    
    // Connect to database
    try {
      await _db();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
    }

    const { email } = await request.json();
    console.log('Forgot password request for email:', email);

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // Find user in the User model
    let user = null;
    try {
      console.log(`Searching in User model for email field emailAddress:`, email);
      user = await UserModel.findOne({ emailAddress: email });
      if (user) {
        console.log(`User found in User model:`, user.emailAddress);
      }
    } catch (modelError) {
      console.error(`Error searching in User model:`, modelError);
    }

    if (!user) {
      console.log('User not found for email:', email);
      // For security reasons, we don't reveal if the email exists or not
      return NextResponse.json({ 
        success: true, 
        message: "If your email exists in our system, you will receive a password reset link shortly." 
      });
    }

    console.log('User found:', user.emailAddress, user.firstName || user.lastName);

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Set expiration to a very short time (1 minute) since we'll invalidate on first access
    const resetTokenExpiry = Date.now() + 60000; // 1 minute from now
    console.log('Generated reset token for user:', user.emailAddress);
    console.log('Token expires at:', new Date(resetTokenExpiry));

    // Save token and expiry to user
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(user._id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry
      }, { new: true });
      console.log('Reset token saved for user:', user.emailAddress);
      console.log('User after update:', {
        resetPasswordToken: updatedUser.resetPasswordToken,
        resetPasswordExpires: updatedUser.resetPasswordExpires
      });
    } catch (saveError) {
      console.error('Error saving reset token:', saveError);
      return NextResponse.json({ 
        success: false, 
        error: "Failed to save reset token. Please try again later." 
      }, { status: 500 });
    }

    // Send email with reset link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${email}`;
    console.log('Reset URL:', resetUrl);
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${user.firstName || user.lastName || 'User'},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #0070f3; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p><strong>Important:</strong> This link can only be used once. If you didn't request this, please ignore this email. Your password will not change.</p>
        <p>Thanks,<br/>The GlowVita Team</p>
      </div>
    `;

    try {
      console.log('Attempting to send email...');
      const emailResult = await sendEmail({
        to: user.emailAddress,
        subject: 'Password Reset Request',
        html: emailContent
      });
      
      console.log('Email sending result:', emailResult);
      
      if (emailResult.success) {
        return NextResponse.json({ 
          success: true, 
          message: "If your email exists in our system, you will receive a password reset link shortly." 
        });
      } else {
        console.error('Email sending failed:', emailResult.error);
        // Still return success for security reasons
        return NextResponse.json({ 
          success: true, 
          message: "If your email exists in our system, you will receive a password reset link shortly." 
        });
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Still return success for security reasons
      return NextResponse.json({ 
        success: true, 
        message: "If your email exists in our system, you will receive a password reset link shortly." 
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}