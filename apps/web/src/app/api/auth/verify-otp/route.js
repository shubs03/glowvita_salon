import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import _db from "@repo/lib/db";
import OtpModel from "@repo/lib/models/user/Otp.model.js";
import {
  normalizeDialCode,
  cleanLocalNumber,
  buildE164,
} from "@repo/lib/utils/phoneUtils";

const MAX_FAILED_ATTEMPTS = 5;

export async function POST(request) {
  try {
    await _db();
    const body = await request.json();
    const { email, phone, countryCode, otp } = body;

    // Determine identifier and type
    const isPhone = !!phone;
    const isEmail = !!email;

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { success: false, message: "A valid 6-digit OTP is required" },
        { status: 400 }
      );
    }

    if (!isPhone && !isEmail) {
      return NextResponse.json(
        { success: false, message: "Email or phone number is required" },
        { status: 400 }
      );
    }

    let identifier;
    let otpType;

    if (isPhone) {
      // Reconstruct the same E.164 identifier used during send-otp
      const dialCode = normalizeDialCode(countryCode || '91');
      const localNumber = cleanLocalNumber(phone);
      identifier = buildE164(dialCode, localNumber);
      otpType = "phone";
    } else {
      identifier = email.toLowerCase().trim();
      otpType = "email";
    }

    // Find the OTP record
    const otpRecord = await OtpModel.findOne({ identifier, type: otpType });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "OTP expired or not found. Please request a new one." },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      await OtpModel.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { success: false, message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if too many failed attempts
    if (otpRecord.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      await OtpModel.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { success: false, message: "Too many failed attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    // Verify OTP using bcrypt
    const isMatch = await bcrypt.compare(otp, otpRecord.otp);

    if (!isMatch) {
      // Increment failed attempts
      await OtpModel.updateOne(
        { _id: otpRecord._id },
        { $inc: { failedAttempts: 1 } }
      );

      const remaining = MAX_FAILED_ATTEMPTS - (otpRecord.failedAttempts + 1);
      return NextResponse.json(
        {
          success: false,
          message: remaining > 0
            ? `Invalid OTP. ${remaining} attempt(s) remaining.`
            : "Too many failed attempts. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    // OTP verified — delete the record atomically
    await OtpModel.deleteOne({ _id: otpRecord._id });

    // Update User model if user already exists
    try {
      const UserModel = (await import('@repo/lib/models/user')).default;
      if (otpType === "phone") {
        // identifier is the full E.164 number; match against mobileNo stored as local 10-digit
        const localNumber = cleanLocalNumber(phone);
        await UserModel.updateOne(
          { $or: [{ mobileNo: localNumber }, { mobileNo: identifier }] },
          { $set: { isPhoneVerified: true } }
        );
      } else {
        await UserModel.updateOne(
          { emailAddress: identifier },
          { $set: { isPhoneVerified: true } }
        );
      }
    } catch (dbErr) {
      console.error("[Web VerifyOTP] Failed to update user verification state:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    console.error("[Web VerifyOTP] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify OTP. Please try again." },
      { status: 500 }
    );
  }
}
