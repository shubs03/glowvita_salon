
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import VendorModel from "../../../../../../../../packages/lib/src/models/Vendor/Vendor.model.js";
import SubscriptionPlan from "../../../../../../../../packages/lib/src/models/admin/SubscriptionPlan.model.js";
import { ReferralModel, V2VSettingsModel } from "../../../../../../../../packages/lib/src/models/admin/Reffer.model.js";
import _db from "../../../../../../../../packages/lib/src/db.js";
import validator from "validator";

await _db();

// Function to generate a unique referral code
const generateReferralCode = async (businessName) => {
  let referralCode;
  let isUnique = false;
  // Use a more robust prefix generation
  const namePrefix = (businessName || "VENDOR").replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 4);
  
  while (!isUnique) {
    const randomNumbers = Math.floor(1000 + Math.random() * 9000); // Generates 4-digit number
    referralCode = `${namePrefix}${randomNumbers}`;
    
    // Check if code already exists
    const existingVendor = await VendorModel.findOne({ referralCode });
    if (!existingVendor) {
      isUnique = true;
    }
  }
  return referralCode;
};

// This endpoint is public for new registrations.
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
      location,
      referredByCode,
    } = body;

    // 1️⃣ Validate required fields for initial account creation
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json({ error: "Name, email, phone, and password are required" }, { status: 400 });
    }

    // Validation checks...
    if (!validator.isEmail(email)) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    if (!validator.isMobilePhone(phone, "any")) return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    // 2️⃣ Check if email or phone already exists
    const existingVendor = await VendorModel.findOne({ $or: [{ email }, { phone }] });
    if (existingVendor) {
      return NextResponse.json({ error: "An account with this email or phone number already exists." }, { status: 409 });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 4️⃣ Generate unique referral code
    const referralCode = await generateReferralCode(businessName);

    // 5️⃣ Assign a default trial plan
    const trialPlan = await SubscriptionPlan.findOne({ planType: 'trial', userTypes: 'vendor' });
    if (!trialPlan) {
        return NextResponse.json({ message: "Default trial plan for vendors not found." }, { status: 500 });
    }
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + trialPlan.duration);

    // 6️⃣ Create vendor with minimal required data + any other data provided
    const newVendor = await VendorModel.create({
      firstName, 
      lastName, 
      businessName: businessName || `${firstName}'s Salon`,
      email, 
      phone, 
      password: hashedPassword, 
      referralCode,
      // Include other fields if they are passed, with defaults
      state: state || 'N/A',
      city: city || 'N/A',
      pincode: pincode || '000000',
      address: address || 'N/A',
      category: category || 'unisex',
      subCategories: subCategories && subCategories.length > 0 ? subCategories : ['shop'],
      location: location || { lat: 0, lng: 0 },
      description: description || null,
      profileImage: profileImage || null, 
      website: website || null,
      subscription: {
        plan: trialPlan._id,
        status: 'Active',
        endDate: subscriptionEndDate,
        history: [],
      }
    });

    // 7️⃣ Handle referral if a code was provided
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
          referrer: referringVendor.businessName,
          referee: newVendor.businessName,
          date: new Date(),
          status: 'Completed',
          bonus: String(bonusValue), // Use the dynamic bonus value
        });
      }
    }

    // 8️⃣ Remove password before returning
    const vendorData = newVendor.toObject();
    delete vendorData.password;

    // The user is now registered. They will be logged in and then can proceed with onboarding.
    return NextResponse.json({ message: "Account created successfully. Proceed to onboarding.", vendor: vendorData }, { status: 201 });
  } catch (err) {
    console.error("Vendor Registration Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
