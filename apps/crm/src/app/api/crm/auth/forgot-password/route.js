import { NextResponse } from 'next/server';
import VendorModel from '@repo/lib/models/Vendor.model';
import DoctorModel from '@repo/lib/models/Vendor/Docters.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import StaffModel from '@repo/lib/models/staffModel';
import _db from "@repo/lib/db";
import crypto from 'crypto';
import { sendEmail } from "@repo/lib/emailService";

// Role to model mapping with correct email field names
const userRoles = [
  { model: VendorModel, type: 'vendor', emailField: 'email' },
  { model: DoctorModel, type: 'doctor', emailField: 'email' },
  { model: SupplierModel, type: 'supplier', emailField: 'email' },
  { model: StaffModel, type: 'staff', emailField: 'emailAddress' },
];

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

    // Find user across all models
    let user = null;
    let userType = null;
    let Model = null;
    let emailField = null;

    for (const roleInfo of userRoles) {
      try {
        console.log(`Searching in ${roleInfo.type} model for email field ${roleInfo.emailField}:`, email);
        const query = {};
        query[roleInfo.emailField] = email;
        const foundUser = await roleInfo.model.findOne(query);
        if (foundUser) {
          user = foundUser;
          userType = roleInfo.type;
          Model = roleInfo.model;
          emailField = roleInfo.emailField;
          console.log(`User found in ${userType} model:`, user[emailField]);
          break;
        }
      } catch (modelError) {
        console.error(`Error searching in ${roleInfo.type} model:`, modelError);
      }
    }

    if (!user) {
      console.log('User not found for email:', email);
      // For security reasons, we don't reveal if the email exists or not
      return NextResponse.json({ 
        success: true, 
        message: "If your email exists in our system, you will receive a password reset link shortly." 
      });
    }

    console.log('User found:', user[emailField], user.fullName || user.firstName || user.name || user.businessName);

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Set expiration to a very short time (1 minute) since we'll invalidate on first access
    const resetTokenExpiry = Date.now() + 60000; // 1 minute from now
    console.log('Generated reset token for user:', user[emailField]);

    // Save token and expiry to user
    try {
      await Model.findByIdAndUpdate(user._id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry
      });
      console.log('Reset token saved for user:', user[emailField]);
    } catch (saveError) {
      console.error('Error saving reset token:', saveError);
      return NextResponse.json({ 
        success: false, 
        error: "Failed to save reset token. Please try again later." 
      }, { status: 500 });
    }

    // Send email with reset link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3001';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${email}`;
    console.log('Reset URL:', resetUrl);
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${user.fullName || user.firstName || user.name || user.businessName || 'User'},</p>
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
        to: user[emailField],
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