
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import validator from "validator";
import generateTokens from "../../../../../../../../packages/lib/src/generateTokens.js";
import VendorModel from "../../../../../../../../packages/lib/src/models/Vendor/Vendor.model.js";
import DoctorModel from "../../../../../../../../packages/lib/src/models/Vendor/Docters.model.js";
import SupplierModel from "../../../../../../../../packages/lib/src/models/Vendor/Supplier.model.js";
import StaffModel from "../../../../../../../../packages/lib/src/models/Vendor/Staff.model.js";
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
    let permissions = [];

    // Define search order and corresponding models/roles
    const userRoles = [
      { model: VendorModel, type: 'vendor', selectFields: '+password' },
      { model: DoctorModel, type: 'doctor', selectFields: '+password referralCode' }, // Correctly select password and referralCode
      { model: SupplierModel, type: 'supplier', selectFields: '+password' },
      { model: StaffModel, type: 'staff', selectFields: '+password' },
    ];

    for (const roleInfo of userRoles) {
      const foundUser = await roleInfo.model.findOne({ email }).select(roleInfo.selectFields);
      if (foundUser) {
        user = foundUser;
        userType = roleInfo.type;
        Model = roleInfo.model;
        permissions = foundUser.permissions || [];
        break; // Stop searching once a user is found
      }
    }
    
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // This check prevents the bcrypt error if a user is found but has no password field
    if (!user.password) {
      return NextResponse.json({ success: false, error: "Authentication failed for this user." }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 });
    }

    const { accessToken, refreshToken } = generateTokens(user._id, userType, permissions);

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
      permissions: permissions,
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
