
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import VendorModel from "../../../../../../../../packages/lib/src/models/Vendor/Vendor.model.js";
import { ReferralModel, V2VSettingsModel } from "../../../../../../../../packages/lib/src/models/admin/Reffer.model.js";
import _db from "../../../../../../../../packages/lib/src/db.js";
import validator from "validator";

await _db();

// Function to generate a unique referral code
const generateReferralCode = async (businessName) => {
  let referralCode;
  let isUnique = false;
  const namePrefix = businessName.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 3);
  
  while (!isUnique) {
    const randomNumbers = Math.floor(100 + Math.random() * 900); // Generates 3-digit number
    referralCode = `${namePrefix}${randomNumbers}`;
    
    // Check if code already exists
    const existingVendor = await VendorModel.findOne({ referralCode });
    if (!existingVendor) {
      isUnique = true;
    }
  }
  return referralCode;
};

// Removed the authMiddlewareCrm wrapper to make this endpoint public for new registrations.
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
      referredByCode, // New field for referral code input
    } = body;

    // 1️⃣ Validate required fields
    if (
      !firstName || !lastName || !businessName || !email || !phone || !state ||
      !city || !pincode || !category || !subCategories || !address || !password || !location
    ) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 });
    }

    // Validation checks...
    if (!validator.isEmail(email)) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    if (!validator.isMobilePhone(phone, "any")) return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    if (!validator.isPostalCode(pincode, "IN")) return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    // 2️⃣ Check if email or phone already exists
    const existingVendor = await VendorModel.findOne({ $or: [{ email }, { phone }] });
    if (existingVendor) {
      return NextResponse.json({ error: "Email or Phone number already in use" }, { status: 400 });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 4️⃣ Generate unique referral code
    const referralCode = await generateReferralCode(businessName);

    // 5️⃣ Create vendor
    const newVendor = await VendorModel.create({
      firstName, lastName, businessName, email, phone, state, city, pincode,
      category, subCategories, address, description: description || null,
      profileImage: profileImage || null, website: website || null,
      password: hashedPassword, location, referralCode
    });

    // 6️⃣ Handle referral if a code was provided
    if (referredByCode) {
      const referringVendor = await VendorModel.findOne({ referralCode: referredByCode.trim().toUpperCase() });
      if (referringVendor) {
        
        // Fetch V2V referral settings to get dynamic bonus
        const v2vSettings = await V2VSettingsModel.findOne({});
        const bonusValue = v2vSettings?.referrerBonus?.bonusValue || 0; // Default to 0 if not set

        // Explicitly generate the referralId here
        const referralType = 'V2V';
        const count = await ReferralModel.countDocuments({ referralType });
        const referralId = `${referralType}-${String(count + 1).padStart(3, '0')}`;

        await ReferralModel.create({
          referralId,
          referralType,
          referrer: referringVendor.businessName, // Or referringVendor._id
          referee: newVendor.businessName, // Or newVendor._id
          date: new Date(),
          status: 'Completed', // Or 'Pending' until first purchase
          bonus: String(bonusValue),
        });
      }
    }

    // 7️⃣ Remove password before returning
    const vendorData = newVendor.toObject();
    delete vendorData.password;

    return NextResponse.json({ message: "Vendor created successfully", vendor: vendorData }, { status: 201 });
  } catch (err) {
    console.error("Vendor Registration Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
