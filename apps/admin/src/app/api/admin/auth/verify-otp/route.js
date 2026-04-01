import { NextResponse } from "next/server";
import mongoose from "mongoose";
import _db from "@repo/lib/db";
import OtpModel from "@repo/lib/models/user/Otp.model.js";

export async function POST(req) {
  try {
    await _db();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const otpRecord = await OtpModel.findOne({ email, otp });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }

    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        { success: false, message: "OTP has expired" },
        { status: 400 }
      );
    }

    // Mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error("[Admin VerifyOTP] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
