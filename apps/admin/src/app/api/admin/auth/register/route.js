import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import AdminUserModel from "../../../../../../../../packages/lib/src/models/admin/AdminUser.model";
import _db from "../../../../../../../../packages/lib/src/db";
import validator from "validator";

await _db();

export async function POST(req) {
  try {
    const { firstName, lastName, emailAddress, mobileNo, password, role } = await req.json();

    // Validate fields
    if (!firstName || !lastName || !emailAddress || !mobileNo || !password) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    if (!validator.isEmail(emailAddress)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (!validator.isMobilePhone(mobileNo, "any")) {
      return NextResponse.json({ error: "Invalid mobile number" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Check if admin already exists
    const existingAdmin = await AdminUserModel.findOne({ emailAddress });
    if (existingAdmin) {
      return NextResponse.json({ error: "Admin already registered" }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new AdminUserModel({
      firstName,
      lastName,
      emailAddress,
      mobileNo,
      password: hashedPassword,
      role: role || "admin", // Default role if not provided
    });

    await newAdmin.save();

    return NextResponse.json({ message: "Admin registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Admin Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
