import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import _db from "@repo/lib/db";
import OtpModel from "@repo/lib/models/user/Otp.model.js";
import UserModel from '@repo/lib/models/user';
import { sendEmail } from "@repo/lib/emailService";
import SmsService from "@repo/lib/services/SmsService";
import {
  normalizeDialCode,
  cleanLocalNumber,
  buildE164,
  validateDialCode,
  validateLocalNumber,
} from "@repo/lib/utils/phoneUtils";

export async function POST(request) {
  try {
    await _db();
    const body = await request.json();
    const { email, phone, countryCode } = body;

    // Determine OTP type
    const isPhone = !!phone;
    const isEmail = !!email;

    if (!isPhone && !isEmail) {
      return NextResponse.json(
        { success: false, message: "Email or phone number is required" },
        { status: 400 }
      );
    }

    let identifier;      // stored in DB — full E.164 number or email
    let e164Number;      // full number passed to SMS provider
    let otpType;

    if (isPhone) {
      // Validate country code
      const dialCode = normalizeDialCode(countryCode || '91'); // default India
      const codeValidation = validateDialCode(dialCode);
      if (!codeValidation.valid) {
        return NextResponse.json(
          { success: false, message: codeValidation.error },
          { status: 400 }
        );
      }

      // Validate local number
      const localNumber = cleanLocalNumber(phone);
      const phoneValidation = validateLocalNumber(localNumber, dialCode);
      if (!phoneValidation.valid) {
        return NextResponse.json(
          { success: false, message: phoneValidation.error },
          { status: 400 }
        );
      }

      // Build full international number (no + prefix)
      e164Number = buildE164(dialCode, localNumber);
      identifier = e164Number;
      otpType = "phone";

    } else {
      if (!/\S+@\S+\.\S+/.test(email)) {
        return NextResponse.json(
          { success: false, message: "Please enter a valid email address" },
          { status: 400 }
        );
      }
      // Check if email already registered
      const existingUser = await UserModel.findOne({ emailAddress: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Email already registered. Please log in." },
          { status: 400 }
        );
      }
      identifier = email.toLowerCase();
      otpType = "email";
    }

    // Rate limiting: prevent re-send within 60 seconds
    const recentOtp = await OtpModel.findOne({ identifier, type: otpType }).lean();
    if (recentOtp) {
      const secondsSinceCreated = Math.floor((Date.now() - new Date(recentOtp.createdAt).getTime()) / 1000);
      if (secondsSinceCreated < 60) {
        const remaining = 60 - secondsSinceCreated;
        return NextResponse.json(
          { success: false, message: `Please wait ${remaining} seconds before requesting a new OTP` },
          { status: 429 }
        );
      }
    }

    // Generate secure 6-digit OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP for secure storage
    const hashedOtp = await bcrypt.hash(rawOtp, 10);

    // Set 5-minute expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Upsert OTP record (replace old one if exists)
    await OtpModel.findOneAndUpdate(
      { identifier, type: otpType },
      {
        otp: hashedOtp,
        expiresAt,
        failedAttempts: 0,
        verified: false,
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Deliver OTP
    if (otpType === "phone") {
      const smsResult = await SmsService.sendOtp(e164Number, rawOtp);
      console.log("[Web SendOTP] SMS delivery result:", smsResult);
      if (!smsResult.success && !smsResult.mock) {
        console.error("[Web SendOTP] SMS delivery failed:", smsResult.error);
        await OtpModel.deleteOne({ identifier, type: otpType });
        return NextResponse.json(
          { success: false, message: "Failed to send OTP via SMS. Please try again." },
          { status: 500 }
        );
      }
    } else {
      const emailResult = await sendEmail({
        to: identifier,
        subject: 'Registration OTP - GlowVita',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
            <h2 style="color: #8b5cf6;">GlowVita - Email Verification</h2>
            <p style="font-size: 16px; color: #555;">Your OTP for creating a GlowVita account is:</p>
            <div style="margin: 20px 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #8b5cf6;">
              ${rawOtp}
            </div>
            <p style="font-size: 14px; color: #777;">This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
            <p style="font-size: 14px; color: #777;">Thanks,<br/>The GlowVita Team</p>
          </div>
        `
      });

      if (!emailResult.success) {
        console.error('[Web SendOTP] Email sending failed:', emailResult.error);
        await OtpModel.deleteOne({ identifier, type: otpType });
        return NextResponse.json(
          { success: false, message: "Failed to send OTP to email. Please try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: otpType === "phone"
        ? "OTP sent to your mobile number"
        : "OTP sent to your email"
    });

  } catch (error) {
    console.error("[Web SendOTP] Error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
