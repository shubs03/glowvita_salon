// route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import _db from "@repo/lib/db";
import SupplierModel from "@repo/lib/models/Vendor/Supplier.model";
import { ReferralModel, V2VSettingsModel } from "@repo/lib/models/admin/Reffer";
import SubscriptionPlan from "@repo/lib/models/admin/SubscriptionPlan";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";
import { uploadBase64, deleteFile } from "@repo/lib/utils/upload";

// Initialize database connection (assuming _db is a promise-based connection function)
const initDb = async () => {
  try {
    await _db();
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
};

// Helper to generate unique referral code for suppliers
const generateReferralCode = async (shopName) => {
  let referralCode;
  let isUnique = false;

  while (!isUnique) {
    const namePrefix = shopName.substring(0, 3).toUpperCase();
    const randomNumbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    referralCode = `${namePrefix}${randomNumbers}`;

    // Check if this code already exists for any supplier
    const existingSupplier = await SupplierModel.findOne({ referralCode });
    isUnique = !existingSupplier;
  }

  return referralCode;
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
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    await initDb(); // Initialize DB connection
    const { buildRegionQueryFromRequest } = await import("@repo/lib");
    const query = buildRegionQueryFromRequest(req);
    const suppliers = await SupplierModel.find(query).populate("subscription.plan", "name");
    return NextResponse.json(suppliers, { status: 200 });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json({ message: "Error fetching suppliers", error: error.message }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);

// POST a new supplier
export const POST = async (req) => {
  try {
    await initDb(); // Initialize DB connection
    const body = await req.json();
    const { licenseFiles, password, referredByCode, regionId, ...supplierData } = body;

    const validationError = validateSupplierData({ password, ...supplierData });
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    // Validate and lock region
    let finalRegionId = regionId;
    try {
      if (req.user) {
        const { validateAndLockRegion } = await import("@repo/lib");
        finalRegionId = validateAndLockRegion(req.user, regionId);
      }
    } catch (err) {
      console.warn("Region validation skipped:", err.message);
    }

    // Handle license files
    const finalLicenseFiles = [];
    if (licenseFiles && Array.isArray(licenseFiles)) {
      for (let i = 0; i < licenseFiles.length; i++) {
        const file = licenseFiles[i];
        if (file && file.startsWith("data:")) {
          const fileName = `supplier-${Date.now()}-license-${i}`;
          const fileUrl = await uploadBase64(file, fileName);
          if (fileUrl) {
            finalLicenseFiles.push(fileUrl);
          }
        }
      }
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newSupplier = await SupplierModel.create({
      ...supplierData,
      password: hashedPassword,
      licenseFiles: finalLicenseFiles,
      referralCode: await generateReferralCode(supplierData.shopName),
      regionId: finalRegionId,
      subscription: {
        plan: (await SubscriptionPlan.findOne({ name: 'Trial Plan' }))?._id,
        status: 'Active',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        history: [],
      }
    });

    // Handle referral if code provided
    if (referredByCode) {
      try {
        const referringSupplier = await SupplierModel.findOne({ referralCode: referredByCode.trim().toUpperCase() });
        if (referringSupplier) {
          const v2vSettings = await V2VSettingsModel.findOne({});
          const bonusValue = v2vSettings?.referrerBonus?.bonusValue || 0;
          const referralType = 'S2S'; // Supplier to Supplier
          const count = await ReferralModel.countDocuments({ referralType });
          const referralId = `${referralType}-${String(count + 1).padStart(3, '0')}`;

          await ReferralModel.create({
            referralId,
            referralType,
            referrer: referringSupplier.shopName || referringSupplier.firstName,
            referee: newSupplier.shopName || newSupplier.firstName,
            date: new Date(),
            status: 'Completed',
            bonus: String(bonusValue),
          });
        }
      } catch (err) {
        console.error("Referral creation failed:", err);
      }
    }

    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json({ message: "Error creating supplier", error: error.message }, { status: 500 });
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
      // Delete files from VPS storage
      for (const fileUrl of removedLicenseFiles) {
        if (fileUrl && fileUrl.startsWith('http')) {
          await deleteFile(fileUrl);
        }
      }
      finalLicenseFiles = finalLicenseFiles.filter((file) => !removedLicenseFiles.includes(file));
      console.log("Debug backend - Files after removal:", finalLicenseFiles.length);
    }

    // Handle new license files
    if (licenseFiles && Array.isArray(licenseFiles)) {
      console.log("Debug backend - New files to add:", licenseFiles.length);
      for (let i = 0; i < licenseFiles.length; i++) {
        const file = licenseFiles[i];
        if (file && file.startsWith("data:")) {
          const fileName = `supplier-${Date.now()}-license-${i}`;
          const fileUrl = await uploadBase64(file, fileName);

          if (fileUrl) {
            finalLicenseFiles.push(fileUrl);
          }
        }
      }
      console.log("Debug backend - Final files count:", finalLicenseFiles.length);
    }

    const updatedSupplier = await SupplierModel.findByIdAndUpdate(
      id,
      { ...updateData, licenseFiles: finalLicenseFiles },
      { new: true }
    ).populate("subscription.plan", "name");

    return NextResponse.json(updatedSupplier, { status: 200 });
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json({ message: "Error updating supplier", error: error.message }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);

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

    // Delete license files from VPS storage
    if (deletedSupplier.licenseFiles && Array.isArray(deletedSupplier.licenseFiles)) {
      for (const fileUrl of deletedSupplier.licenseFiles) {
        if (fileUrl && fileUrl.startsWith('http')) {
          await deleteFile(fileUrl);
        }
      }
    }

    return NextResponse.json({ message: "Supplier deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json({ message: "Error deleting supplier", error: error.message }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);