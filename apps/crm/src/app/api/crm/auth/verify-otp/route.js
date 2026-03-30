import { NextResponse } from "next/server";
import mongoose from "mongoose";
import _db from "@repo/lib/db";
import OtpModel from "@repo/lib/models/user/Otp.model.js";

await _db();

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const otpRecord = await OtpModel.findOne({ 
      email: email.toLowerCase(), 
      otp 
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP code" },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        { success: false, message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully. You can now proceed to registration.",
    });

  } catch (error) {
    console.error("[VerifyOTP] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
