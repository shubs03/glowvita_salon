import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import validator from "validator";
import generateTokens from "../../../../../../../../packages/lib/src/generateTokens.js"; // generates access & refresh tokens
import AdminUserModel from "../../../../../../../../packages/lib/src/models/admin/AdminUser.model"; // your new model
import _db from "../../../../../../../../packages/lib/src/db.js";

await _db();

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate email format
    if (!validator.isEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find admin user by emailAddress field
    const user = await AdminUserModel.findOne({ emailAddress: email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Incorrect password" },
        { status: 401 }
      );
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, "admin");

    // Remove password from response
    const { password: _, ...safeUser } = user.toObject();

    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Login Successful",
      user: safeUser,
      admin_access_token: accessToken,
      admin_refresh_token: refreshToken,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
