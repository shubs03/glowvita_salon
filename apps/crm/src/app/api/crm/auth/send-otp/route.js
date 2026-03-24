import { NextResponse } from "next/server";
import mongoose from "mongoose";
import _db from "@repo/lib/db";
import OtpModel from "@repo/lib/models/user/Otp.model.js";
import { sendEmail } from "@repo/lib/emailService";

await _db();

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in DB (update if exists)
    await OtpModel.findOneAndUpdate(
      { email },
      { otp, expiresAt, verified: false },
      { upsert: true, new: true }
    );

    // Send via email
    const emailResult = await sendEmail({
      to: email,
      subject: "Your GlowVita Verification Code",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h2 style="color: #8b5cf6; text-align: center;">GlowVita Salon</h2>
          <hr style="border: 0; border-top: 1px solid #e1e1e1; margin: 20px 0;">
          <p>Hello,</p>
          <p>Your verification code for GlowVita registration is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code is valid for 10 minutes. Please do not share this code with anyone.</p>
          <p>Best regards,<br>The GlowVita Team</p>
        </div>
      `,
    });

    if (!emailResult.success) {
      console.error("[SendOTP] Email sending failed:", emailResult.error);
      return NextResponse.json(
        { success: false, message: "Failed to send email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to your email",
    });

  } catch (error) {
    console.error("[SendOTP] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
