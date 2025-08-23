import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import _db from "../../../../../../../packages/lib/src/db.js";
import SupplierModel from "../../../../../../../packages/lib/src/models/Vendor/Supplier.model.js";
import { uploadBase64, deleteFile } from "../../../../../../../packages/utils/uploads.js";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

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
}

// GET all suppliers
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    const suppliers = await SupplierModel.find({});
    return NextResponse.json(suppliers, { status: 200 });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json({ message: "Error fetching suppliers", error: error.message }, { status: 500 });
  }
}, ["superadmin", "admin"]);

// POST a new supplier

export const POST = authMiddlewareAdmin(async (req) => {
  try {
    const body = await req.json();
    const { licenseFile, password, ...supplierData } = body;

    const validationError = validateSupplierData({ password, ...supplierData });
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    let licenseFileUrl = null;
    if (licenseFile && licenseFile.startsWith("data:")) {
      const uploadedUrl = await uploadBase64(
        licenseFile,
        `supplier-license-${supplierData.firstName}`
      );
      if (!uploadedUrl) {
        throw new Error("Failed to upload license file");
      }
      licenseFileUrl = uploadedUrl;
    }

    // 🔑 Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newSupplier = await SupplierModel.create({
      ...supplierData,
      password: hashedPassword, // save hashed password
      licenseFile: licenseFileUrl,
    });

    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { message: "Error creating supplier", error: error.message },
      { status: 500 }
    );
  }
}, ["superadmin"]);


// PUT (update) a supplier  
export const PUT = authMiddlewareAdmin(async (req) => {
  try {
    const { id, licenseFile, ...updateData } = await req.json();

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

    let finalLicenseUrl = existingSupplier.licenseFile;
    // Check if a new license file is being uploaded
    if (licenseFile && licenseFile.startsWith('data:')) {
      // Delete the old file if it exists
      if (existingSupplier.licenseFile) {
        await deleteFile(existingSupplier.licenseFile);
      }
      // Upload the new file
      const uploadedUrl = await uploadBase64(licenseFile, `supplier-license-${updateData.firstName}`);
      if (!uploadedUrl) {
        throw new Error("Failed to upload new license file");
      }
      finalLicenseUrl = uploadedUrl;
    }
    
    const updatedSupplier = await SupplierModel.findByIdAndUpdate(
      id,
      { ...updateData, licenseFile: finalLicenseUrl },
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
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID is required for deletion" }, { status: 400 });
    }

    const deletedSupplier = await SupplierModel.findByIdAndDelete(id);

    if (!deletedSupplier) {
      return NextResponse.json({ message: "Supplier not found" }, { status: 404 });
    }
    
    // Delete associated license file
    if (deletedSupplier.licenseFile) {
      await deleteFile(deletedSupplier.licenseFile);
    }

    return NextResponse.json({ message: "Supplier deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json({ message: "Error deleting supplier", error: error.message }, { status: 500 });
  }
}, ["superadmin"]);
