import { NextResponse } from 'next/server';
import AdminUserModel from '@repo/lib/models/admin/AdminUser';
import _db from "@repo/lib/db";
import crypto from 'crypto';
import { sendEmail } from "@repo/lib/emailService";

export async function POST(request) {
  try {
    console.log('Admin Forgot password endpoint called');
    
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

    // Find admin user
    const user = await AdminUserModel.findOne({ emailAddress: email });

    if (!user) {
      console.log('Admin User not found for email:', email);
      // For security reasons, we don't reveal if the email exists or not
      return NextResponse.json({ 
        success: true, 
        message: "If your email exists in our system, you will receive a password reset link shortly." 
      });
    }

    console.log('User found:', user.emailAddress, user.fullName);

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Set expiration to a short time (10 minutes)
    const resetTokenExpiry = Date.now() + 600000; // 10 minutes from now
    console.log('Generated reset token for admin:', user.emailAddress);

    // Save token and expiry to user
    try {
      await AdminUserModel.findByIdAndUpdate(user._id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry
      });
      console.log('Reset token saved for admin:', user.emailAddress);
    } catch (saveError) {
      console.error('Error saving reset token:', saveError);
      return NextResponse.json({ 
        success: false, 
        error: "Failed to save reset token. Please try again later." 
      }, { status: 500 });
    }

    // Send email with reset link
    // Support reverse proxy headers for correct live domain
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
    
    let baseUrl;
    if (forwardedHost) {
      // Use the first host if it's a comma-separated list
      const host = forwardedHost.split(',')[0].trim();
      baseUrl = `${forwardedProto}://${host}`;
    } else {
      const url = new URL(request.url);
      baseUrl = `${url.protocol}//${url.host}`;
    }
    
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${email}`;
    console.log('Reset URL:', resetUrl);
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Admin Password Reset Request</h2>
        <hr style="border: 0; border-top: 1px solid #e1e1e1; margin: 20px 0;">
        <p>Hello ${user.fullName || 'Admin'},</p>
        <p>We received a request to reset your admin password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #0070f3; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p><strong>Important:</strong> This link is valid for 10 minutes and can only be used once. If you didn't request this, please ignore this email. Your dashboard access will remain secure.</p>
        <p>Thanks,<br/>The GlowVita Team</p>
      </div>
    `;

    try {
      console.log('Attempting to send email...');
      const emailResult = await sendEmail({
        to: user.emailAddress,
        subject: 'Admin Password Reset Request',
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
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
