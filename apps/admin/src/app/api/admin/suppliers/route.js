import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import _db from "../../../../../../../packages/lib/src/db.js";
import SupplierModel from "../../../../../../../packages/lib/src/models/Vendor/Supplier.model.js";
import { ReferralModel, V2VSettingsModel } from "../../../../../../../packages/lib/src/models/admin/Reffer.model.js";
import SubscriptionPlan from "../../../../../../../packages/lib/src/models/admin/SubscriptionPlan.model.js";
import { uploadBase64, deleteFile } from "../../../../../../../packages/utils/uploads.js";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

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
}

// GET all suppliers
export const GET = async (req) => {
  try {
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
    const body = await req.json();
    const { licenseFile, password, referredByCode, ...supplierData } = body;

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

    // 🔗 Generate unique referral code
    const referralCode = await generateReferralCode(supplierData.shopName);

    // Assign a default trial plan
    const trialPlan = await SubscriptionPlan.findOne({ planType: 'trial', userTypes: 'supplier' });
    if (!trialPlan) {
        return NextResponse.json({ message: "Default trial plan for suppliers not found." }, { status: 500 });
    }
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + trialPlan.duration);

    const newSupplier = await SupplierModel.create({
      ...supplierData,
      password: hashedPassword, // save hashed password
      licenseFile: licenseFileUrl,
      referralCode,
      subscription: {
          plan: trialPlan._id,
          status: 'Active',
          endDate: subscriptionEndDate,
          history: [],
      }
    });

    // 🎁 Handle referral if a code was provided
    if (referredByCode) {
      // Check if referral code belongs to any user (vendor, doctor, or supplier)
      const VendorModel = (await import("../../../../../../../packages/lib/src/models/Vendor/Vendor.model.js")).default;
      const DoctorModel = (await import("../../../../../../../packages/lib/src/models/Vendor/Docters.model.js")).default;
      
      const referringVendor = await VendorModel.findOne({ referralCode: referredByCode.trim().toUpperCase() });
      const referringDoctor = await DoctorModel.findOne({ referralCode: referredByCode.trim().toUpperCase() });
      const referringSupplier = await SupplierModel.findOne({ referralCode: referredByCode.trim().toUpperCase() });
      
      const referringUser = referringVendor || referringDoctor || referringSupplier;
      
      if (referringUser) {
        // Fetch V2V referral settings to get dynamic bonus
        const v2vSettings = await V2VSettingsModel.findOne({});
        const bonusValue = v2vSettings?.referrerBonus?.bonusValue || 0;

        // Generate referral record
        const referralType = 'V2V';
        const count = await ReferralModel.countDocuments({ referralType });
        const referralId = `${referralType}${String(count + 1).padStart(4, '0')}`;

        const referrerName = referringUser.businessName || referringUser.name || referringUser.shopName;
        const refereeName = `${newSupplier.firstName} ${newSupplier.lastName}`;

        await ReferralModel.create({
          referralId,
          referralType,
          referrer: referrerName,
          referee: refereeName,
          date: new Date(),
          status: 'Pending',
          bonus: `₹${bonusValue}`,
        });
      }
    }

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
