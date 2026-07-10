import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import _db from "@repo/lib/db";
import OtpModel from "@repo/lib/models/user/Otp.model.js";
import {
  normalizeDialCode,
  cleanLocalNumber,
  buildE164,
} from "@repo/lib/utils/phoneUtils";

await _db();

const MAX_FAILED_ATTEMPTS = 5;

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, phone, countryCode, otp } = body;

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

    // Update Vendor, Doctor, or Supplier model if already exists
    try {
      const VendorModel = (await import("@repo/lib/models/Vendor/Vendor.model")).default;
      const DoctorModel = (await import("@repo/lib/models/Vendor/Docters.model")).default;
      const SupplierModel = (await import("@repo/lib/models/Vendor/Supplier.model")).default;

      const localPhone = isPhone ? cleanLocalNumber(phone) : null;

      if (otpType === "phone") {
        await Promise.all([
          VendorModel.updateOne(
            { $or: [{ phone: localPhone }, { phone: identifier }] },
            { $set: { isPhoneVerified: true } }
          ),
          DoctorModel.updateOne(
            { $or: [{ phone: localPhone }, { phone: identifier }] },
            { $set: { isPhoneVerified: true } }
          ),
          SupplierModel.updateOne(
            { $or: [{ mobile: localPhone }, { mobile: identifier }] },
            { $set: { isPhoneVerified: true } }
          ),
        ]);
      } else {
        await Promise.all([
          VendorModel.updateOne({ email: identifier }, { $set: { isPhoneVerified: true } }),
          DoctorModel.updateOne({ email: identifier }, { $set: { isPhoneVerified: true } }),
          SupplierModel.updateOne({ email: identifier }, { $set: { isPhoneVerified: true } }),
        ]);
      }
    } catch (dbErr) {
      console.error("[CRM VerifyOTP] Failed to update CRM entity verification state:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully. You can now proceed to registration.",
    });

  } catch (error) {
    console.error("[CRM VerifyOTP] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
