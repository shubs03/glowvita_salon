
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import validator from "validator";
import generateTokens from "../../../../../../../../packages/lib/src/generateTokens.js";
import VendorModel from "../../../../../../../../packages/lib/src/models/Vendor/Vendor.model.js";
import DoctorModel from "../../../../../../../../packages/lib/src/models/Vendor/Docters.model.js";
import SupplierModel from "../../../../../../../../packages/lib/src/models/Vendor/Supplier.model.js";
import _db from "../../../../../../../../packages/lib/src/db.js";

await _db();

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!validator.isEmail(email)) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    let user = null;
    let userType = null;
    let Model = null;

    // Check Vendor
    user = await VendorModel.findOne({ email }).select('+password');
    if (user) {
      userType = "vendor";
      Model = VendorModel;
    }

    // If not a vendor, check Doctor
    if (!user) {
      user = await DoctorModel.findOne({ email }).select('+password');
      if (user) {
        userType = "doctor";
        Model = DoctorModel;
      }
    }
      
    // If not a vendor or doctor, check Supplier
    if (!user) {
      user = await SupplierModel.findOne({ email }).select('+password');
      if (user) {
        userType = "supplier";
        Model = SupplierModel;
      }
    }


    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 });
    }

    const { accessToken, refreshToken } = generateTokens(user._id, userType);

    const { password: _, ...safeUser } = user.toObject();

    if (Model && Model.findByIdAndUpdate) {
      await Model.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
    }

    const response = NextResponse.json({
      success: true,
      message: "Login Successful",
      user: safeUser,
      access_token: accessToken,
      refresh_token: refreshToken,
      role: userType,
    });

    response.cookies.set('crm_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error("CRM Login error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
