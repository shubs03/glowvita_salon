import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import VendorModel from "../../../../../../../../packages/lib/src/models/vendor/Vendor.model"; // <-- make sure path is correct
import _db from "../../../../../../../../packages/lib/src/db.js";
import validator from "validator";

await _db();

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      businessName,
      email,
      phone,
      state,
      city,
      pincode,
      category,
      subCategories,
      address,
      password,
      description,
      profileImage,
      website,
      location,    // <-- coordinate object from map
    } = body;

    // 1️⃣ Validate required fields
    if (
      !firstName ||
      !lastName ||
      !businessName ||
      !email ||
      !phone ||
      !state ||
      !city ||
      !pincode ||
      !category ||
      !subCategories ||
      !address ||
      !password ||
      !location
    ) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Email validation
    if (!validator.isEmail(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Phone validation
    if (!validator.isMobilePhone(phone, "any")) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    // Pincode validation
    if (!validator.isPostalCode(pincode, "IN")) {
      return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
    }

    // Password length
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // 2️⃣ Check if email or phone already exists
    const existingVendor = await VendorModel.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingVendor) {
      return NextResponse.json(
        { error: "Email or Phone number already in use" },
        { status: 400 }
      );
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create vendor
    const newVendor = await VendorModel.create({
      firstName,
      lastName,
      businessName,
      email,
      phone,
      state,
      city,
      pincode,
      category,
      subCategories,
      address,
      description: description || null,
      profileImage: profileImage || null,
      website: website || null,
      password: hashedPassword,
      location, // { lat: Number, lng: Number }
    });

    // 5️⃣ Remove password before returning
    const vendorData = newVendor.toObject();
    delete vendorData.password;

    return NextResponse.json(
      { message: "Vendor created successfully", vendor: vendorData },
      { status: 201 }
    );
  } catch (err) {
    console.error("Vendor Registration Error:", err.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
