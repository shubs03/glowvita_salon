import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import _db from "@repo/lib/db";
import OtpModel from "@repo/lib/models/user/Otp.model.js";
import { sendEmail } from "@repo/lib/emailService";
import SmsService from "@repo/lib/services/SmsService";
import {
  normalizeDialCode,
  cleanLocalNumber,
  buildE164,
  validateDialCode,
  validateLocalNumber,
} from "@repo/lib/utils/phoneUtils.js";

await _db();

export async function POST(req) {
  try {
    const body = await req.json();
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

    let identifier;
    let e164Number;
    let otpType;

    if (isPhone) {
      // Validate country code
      const dialCode = normalizeDialCode(countryCode || '91');
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

      e164Number = buildE164(dialCode, localNumber);
      identifier = e164Number;
      otpType = "phone";

    } else {
      if (!/\S+@\S+\.\S+/.test(email)) {
        return NextResponse.json(
          { success: false, message: "Invalid email address" },
          { status: 400 }
        );
      }

      // Check across all CRM entity types for existing email
      const VendorModel = (await import("@repo/lib/models/Vendor/Vendor.model")).default;
      const DoctorModel = (await import("@repo/lib/models/Vendor/Docters.model")).default;
      const SupplierModel = (await import("@repo/lib/models/Vendor/Supplier.model")).default;
      const StaffModel = (await import("@repo/lib/models/Vendor/Staff.model")).default;
      const UserModel = (await import("@repo/lib/models/user/User.model")).default;

      const [existingVendor, existingDoctor, existingSupplier, existingStaff, existingUser] = await Promise.all([
        VendorModel.findOne({ email }).lean(),
        DoctorModel.findOne({ email }).lean(),
        SupplierModel.findOne({ email }).lean(),
        StaffModel.findOne({ emailAddress: email }).lean(),
        UserModel.findOne({ emailAddress: email }).lean()
      ]);

      if (existingVendor || existingDoctor || existingSupplier || existingStaff || existingUser) {
        return NextResponse.json(
          { success: false, message: "Email already registered" },
          { status: 400 }
        );
      }
      identifier = email.toLowerCase().trim();
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

    // Upsert OTP record
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
      if (!smsResult.success && !smsResult.mock) {
        console.error("[CRM SendOTP] SMS delivery failed:", smsResult.error);
        await OtpModel.deleteOne({ identifier, type: otpType });
        return NextResponse.json(
          { success: false, message: "Failed to send OTP via SMS. Please try again." },
          { status: 500 }
        );
      }
    } else {
      const emailResult = await sendEmail({
        to: identifier,
        subject: "Your GlowVita Verification Code",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
            <h2 style="color: #8b5cf6; text-align: center;">GlowVita Salon</h2>
            <hr style="border: 0; border-top: 1px solid #e1e1e1; margin: 20px 0;">
            <p>Hello,</p>
            <p>Your verification code for GlowVita registration is:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${rawOtp}</span>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This code is valid for <strong>5 minutes</strong>. Please do not share this code with anyone.</p>
            <p>Best regards,<br>The GlowVita Team</p>
          </div>
        `,
      });

      if (!emailResult.success) {
        console.error("[CRM SendOTP] Email sending failed:", emailResult.error);
        await OtpModel.deleteOne({ identifier, type: otpType });
        return NextResponse.json(
          { success: false, message: "Failed to send email. Please try again later." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: otpType === "phone"
        ? "OTP sent to your mobile number"
        : "OTP sent successfully to your email",
    });

  } catch (error) {
    console.error("[CRM SendOTP] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
