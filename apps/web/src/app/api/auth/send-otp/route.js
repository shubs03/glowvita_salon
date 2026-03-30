import { NextResponse } from 'next/server';
import UserModel from '@repo/lib/models/user';
import _db from "@repo/lib/db";
import { sendEmail } from "@repo/lib/emailService";

// Global store for OTPs
if (!global.otpStore) {
  global.otpStore = new Map();
}

export async function POST(request) {
  try {
    await _db();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ emailAddress: email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Email already registered. Please log in." }, { status: 400 });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in global map
    global.otpStore.set(email, { otp, expiry });

    // Send email
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
        <h2 style="color: #333;">Registration OTP</h2>
        <p style="font-size: 16px; color: #555;">Your OTP for creating an account on GlowVita is:</p>
        <div style="margin: 20px 0; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0070f3;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #777;">This OTP will expire in 10 minutes.</p>
        <p style="font-size: 14px; color: #777;">Thanks,<br/>The GlowVita Team</p>
      </div>
    `;

    const emailResult = await sendEmail({
      to: email,
      subject: 'Registration OTP - GlowVita',
      html: emailContent
    });

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error);
      return NextResponse.json({ success: false, error: "Failed to send OTP to email. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
