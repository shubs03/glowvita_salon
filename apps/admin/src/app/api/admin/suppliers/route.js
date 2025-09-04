// route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import _db from "../../../../../../../packages/lib/src/db.js";
import SupplierModel from "../../../../../../../packages/lib/src/models/Vendor/Supplier.model.js";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

// Initialize database connection (assuming _db is a promise-based connection function)
const initDb = async () => {
  try {
    await _db();
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
};

// Helper to validate supplier data
const validateSupplierData = (data) => {
  const { firstName, lastName, email, mobile, shopName, country, state, city, pincode, address, supplierType, password } = data;
  if (!firstName || !lastName || !email || !mobile || !shopName || !country || !state || !city || !pincode || !address || !supplierType || !password) {
    return "Missing required fields";
  }
  if (!/^\d{10}$/.test(mobile)) {
    return "Mobile number must be 10 digits";
  }
  if (!/^\d{6}$/.test(pincode)) {
    return "Pincode must be 6 digits";
  }
  return null;
};

// GET all suppliers
export const GET = async (req) => {
  try {
    await initDb(); // Initialize DB connection
    const suppliers = await SupplierModel.find({});
    return NextResponse.json(suppliers, { status: 200 });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json({ message: "Error fetching suppliers", error: error.message }, { status: 500 });
  }
};

// POST a new supplier
export const POST = async (req) => {
  try {
    await initDb(); // Initialize DB connection
    const body = await req.json();
    console.log("Received body:", JSON.stringify(body, null, 2));
    const { licenseFiles, password, ...supplierData } = body;

    const validationError = validateSupplierData({ password, ...supplierData });
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    // Store base64 data directly instead of uploading to remote server
    let licenseFileData = [];
    console.log("Processing license files:", licenseFiles);
    if (licenseFiles && Array.isArray(licenseFiles)) {
      for (const file of licenseFiles) {
        if (file && file.startsWith("data:")) {
          licenseFileData.push(file);
        }
      }
    }
    console.log("License file base64 data:", licenseFileData);

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newSupplier = await SupplierModel.create({
      ...supplierData,
      password: hashedPassword,
      licenseFiles: licenseFileData, // Store array of base64 data
    });

    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { message: "Error creating supplier", error: error.message },
      { status: 500 }
    );
  }
};

// PUT (update) a supplier
export const PUT = authMiddlewareAdmin(async (req) => {
  try {
    await initDb(); // Initialize DB connection
    const { id, licenseFiles, removedLicenseFiles, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID is required for update" }, { status: 400 });
    }

    // Server-side validation for updates
    if (updateData.mobile && !/^\d{10}$/.test(updateData.mobile)) {
      return NextResponse.json({ message: "Mobile number must be 10 digits" }, { status: 400 });
    }
    if (updateData.pincode && !/^\d{6}$/.test(updateData.pincode)) {
      return NextResponse.json({ message: "Pincode must be 6 digits" }, { status: 400 });
    }

    const existingSupplier = await SupplierModel.findById(id);
    if (!existingSupplier) {
      return NextResponse.json({ message: "Supplier not found" }, { status: 404 });
    }

    let finalLicenseFiles = existingSupplier.licenseFiles || [];
    console.log("Debug backend - Initial existing files count:", finalLicenseFiles.length);

    // Remove files that were marked for deletion
    if (removedLicenseFiles && Array.isArray(removedLicenseFiles)) {
      console.log("Debug backend - Files to remove:", removedLicenseFiles.length);
      finalLicenseFiles = finalLicenseFiles.filter((file) => !removedLicenseFiles.includes(file));
      console.log("Debug backend - Files after removal:", finalLicenseFiles.length);
    }

    // Handle new license files
    if (licenseFiles && Array.isArray(licenseFiles)) {
      console.log("Debug backend - New files to add:", licenseFiles.length);
      for (const file of licenseFiles) {
        if (file && file.startsWith("data:")) {
          finalLicenseFiles.push(file);
        }
      }
      console.log("Debug backend - Final files count:", finalLicenseFiles.length);
    }

    const updatedSupplier = await SupplierModel.findByIdAndUpdate(
      id,
      { ...updateData, licenseFiles: finalLicenseFiles },
      { new: true }
    );

    return NextResponse.json(updatedSupplier, { status: 200 });
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json({ message: "Error updating supplier", error: error.message }, { status: 500 });
  }
}, ["superadmin"]);

// DELETE a supplier
export const DELETE = authMiddlewareAdmin(async (req) => {
  try {
    await initDb(); // Initialize DB connection
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID is required for deletion" }, { status: 400 });
    }

    const deletedSupplier = await SupplierModel.findByIdAndDelete(id);

    if (!deletedSupplier) {
      return NextResponse.json({ message: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Supplier deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json({ message: "Error deleting supplier", error: error.message }, { status: 500 });
  }
}, ["superadmin"]);