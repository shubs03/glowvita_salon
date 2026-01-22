import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import AdminUserModel from "@repo/lib/models/admin/AdminUser";
import _db from "@repo/lib/db";
import validator from "validator";

await _db();

export async function POST(req) {
  try {
    const { fullName, emailAddress, mobileNo, address, designation, profileImage, password, role } = await req.json();

    // Validate required fields
    if (!fullName || !emailAddress || !mobileNo || !address || !designation || !password) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    // Email validation
    if (!validator.isEmail(emailAddress)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Mobile number validation
    if (!validator.isMobilePhone(mobileNo, "any")) {
      return NextResponse.json({ error: "Invalid mobile number" }, { status: 400 });
    }

    // Password length validation
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Check if admin already exists
    const existingAdmin = await AdminUserModel.findOne({ emailAddress });
    if (existingAdmin) {
      return NextResponse.json({ error: "Admin already registered" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const newAdmin = new AdminUserModel({
      fullName,
      emailAddress,
      mobileNo,
      address,
      designation,
      profileImage: profileImage || "", // optional
      password: hashedPassword,
      roleName: role || "REGIONAL_ADMIN", // default role if not provided
    });

    await newAdmin.save();

    return NextResponse.json({ message: "Admin registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Admin Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
