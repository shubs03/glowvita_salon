import { NextResponse } from "next/server";
import validator from "validator";
import bcrypt from "bcryptjs";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";
import StaffModel from "@repo/lib/models/Vendor/Staff.model";
import SubscriptionPlan from "@repo/lib/models/admin/SubscriptionPlan.model";
import { ReferralModel, V2VSettingsModel } from "../../../../../../../../packages/lib/src/models/admin/Reffer.model.js";
import _db from "@repo/lib/db";
import mongoose from "mongoose";

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

// Function to automatically create staff member from vendor data
const createOwnerAsStaff = async (vendor, plainTextPassword) => {
  try {
    console.log(`=== CREATE OWNER AS STAFF FUNCTION ===`);
    console.log(`Vendor ID: ${vendor._id} (type: ${typeof vendor._id})`);
    console.log(`Vendor email: ${vendor.email}`);
    console.log(`Vendor name: ${vendor.firstName} ${vendor.lastName}`);
    console.log(`Vendor ID is valid ObjectId: ${mongoose.Types.ObjectId.isValid(vendor._id)}`);

    // Ensure we have a proper ObjectId for the vendor
    let vendorObjectId;
    if (vendor._id instanceof mongoose.Types.ObjectId) {
      vendorObjectId = vendor._id;
    } else if (typeof vendor._id === 'string') {
      if (mongoose.Types.ObjectId.isValid(vendor._id)) {
        vendorObjectId = new mongoose.Types.ObjectId(vendor._id);
      } else {
        console.error('Invalid vendor ID string:', vendor._id);
        return null;
      }
    } else {
      console.error('Unexpected vendor ID type:', typeof vendor._id, vendor._id);
      return null;
    }

    console.log(`Vendor ObjectId: ${vendorObjectId} (type: ${typeof vendorObjectId})`);

    // Check if staff member already exists for this vendor using multiple approaches
    console.log('Checking if staff member already exists...');

    // Approach 1: Direct query
    let existingStaff = await StaffModel.findOne({
      vendorId: vendorObjectId,
      emailAddress: vendor.email
    });
    console.log(`Approach 1 - Direct query: ${!!existingStaff}`);

    // Approach 2: If not found, try string conversion
    if (!existingStaff) {
      try {
        existingStaff = await StaffModel.findOne({
          vendorId: vendorObjectId.toString(),
          emailAddress: vendor.email
        });
        console.log(`Approach 2 - String conversion: ${!!existingStaff}`);
      } catch (err) {
        console.error('String conversion approach failed:', err);
      }
    }

    // Approach 3: If still not found, try with original vendor ID
    if (!existingStaff && vendor._id !== vendorObjectId) {
      try {
        existingStaff = await StaffModel.findOne({
          vendorId: vendor._id,
          emailAddress: vendor.email
        });
        console.log(`Approach 3 - Original vendor ID: ${!!existingStaff}`);
      } catch (err) {
        console.error('Original vendor ID approach failed:', err);
      }
    }

    if (existingStaff) {
      console.log(`Staff member already exists for vendor ${vendor._id}`);
      console.log(`Existing staff ID: ${existingStaff._id}`);
      console.log(`Existing staff vendorId: ${existingStaff.vendorId} (type: ${typeof existingStaff.vendorId})`);
      console.log(`Existing staff email: ${existingStaff.emailAddress}`);
      return existingStaff;
    }

    // Hash the password before creating staff member
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(plainTextPassword, 10);
    console.log('Password hashed successfully');

    // Create staff member using vendor details
    const staffData = {
      vendorId: vendorObjectId, // Use the properly converted ObjectId
      userType: 'Vendor',
      fullName: `${vendor.firstName} ${vendor.lastName}`,
      position: 'Owner',
      mobileNo: vendor.phone,
      emailAddress: vendor.email,
      photo: vendor.profileImage || null,
      description: vendor.description || `Owner of ${vendor.businessName}`,
      salary: 0,
      startDate: new Date(),
      yearOfExperience: 0,
      clientsServed: 0,
      commission: false,
      password: hashedPassword, // Use the hashed password
      role: 'staff',
      permissions: ['all'], // Owner gets all permissions
      status: 'Active',
      // Default availability (can be updated later)
      mondayAvailable: true,
      mondaySlots: [{ startTime: '09:00', endTime: '18:00', startMinutes: 540, endMinutes: 1080 }],
      tuesdayAvailable: true,
      tuesdaySlots: [{ startTime: '09:00', endTime: '18:00', startMinutes: 540, endMinutes: 1080 }],
      wednesdayAvailable: true,
      wednesdaySlots: [{ startTime: '09:00', endTime: '18:00', startMinutes: 540, endMinutes: 1080 }],
      thursdayAvailable: true,
      thursdaySlots: [{ startTime: '09:00', endTime: '18:00', startMinutes: 540, endMinutes: 1080 }],
      fridayAvailable: true,
      fridaySlots: [{ startTime: '09:00', endTime: '18:00', startMinutes: 540, endMinutes: 1080 }],
      saturdayAvailable: true,
      saturdaySlots: [{ startTime: '09:00', endTime: '18:00', startMinutes: 540, endMinutes: 1080 }],
      sundayAvailable: false,
      sundaySlots: [],
      timezone: 'UTC'
    };

    console.log('Staff data to create:', JSON.stringify(staffData, null, 2));
    console.log('Creating staff member...');

    // Create staff member with validation bypass for salon owner
    // We need to bypass validation because vendor working hours aren't set up yet
    const newStaff = new StaffModel(staffData);
    newStaff.$locals.skipValidation = true; // Bypass validation for salon owner
    await newStaff.save();

    console.log(`Successfully created staff member for vendor ${vendor._id}:`, newStaff._id);
    console.log(`New staff vendorId: ${newStaff.vendorId} (type: ${typeof newStaff.vendorId})`);
    console.log(`New staff email: ${newStaff.emailAddress}`);

    // Verify the staff member was created correctly using multiple approaches
    console.log('Verifying created staff member...');

    // Approach 1: Direct query
    let verifiedStaff = await StaffModel.findById(newStaff._id);
    console.log(`Verification approach 1 - Direct query: ${!!verifiedStaff}`);

    // Approach 2: Query by vendorId and email
    if (!verifiedStaff) {
      verifiedStaff = await StaffModel.findOne({
        vendorId: vendorObjectId,
        emailAddress: vendor.email
      });
      console.log(`Verification approach 2 - VendorId and email: ${!!verifiedStaff}`);
    }

    if (verifiedStaff) {
      console.log(`Verified staff member - ID: ${verifiedStaff._id}, vendorId: ${verifiedStaff.vendorId}, email: ${verifiedStaff.emailAddress}`);
    } else {
      console.log('Could not verify staff member was created');
    }

    console.log(`=== END CREATE OWNER AS STAFF FUNCTION ===`);
    return newStaff;
  } catch (error) {
    console.error("Error creating staff member for vendor:", error);
    return null;
  }
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
      gstNo: incomingGstNo,
      referralCode: incomingReferralCode,
    } = body;

    const gstNo = incomingGstNo || '';
    const referralCode = incomingReferralCode || '';

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

    // 5️⃣ Assign a default trial plan
    const trialPlan = await SubscriptionPlan.findOne({ name: 'Trial Plan' });
    if (!trialPlan) {
      return NextResponse.json({ message: "Default trial plan for vendors not found." }, { status: 500 });
    }
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + trialPlan.duration);

    // 6️⃣ Auto-Assign Region based on City/State/Location
    // Ensure location has proper default values
    const locationData = location || { lat: 0, lng: 0 };

    const { assignRegion } = await import("@repo/lib/utils/assignRegion.js");
    // Pass locationData for geospatial matching
    const regionId = await assignRegion(city, state, locationData);

    // 7️⃣ Create vendor with minimal required data + any other data provided

    const newVendor = await VendorModel.create({
      firstName,
      lastName,
      businessName: businessName || `${firstName}'s Salon`,
      email,
      phone,
      password: hashedPassword,
      referralCode: referralCode,
      gstNo: String(gstNo || ''),
      // Include other fields if they are passed, with defaults
      state: state || 'N/A',
      city: city || 'N/A',
      pincode: pincode || '000000',
      address: address || 'N/A',
      category: category || 'unisex',
      subCategories: subCategories && subCategories.length > 0 ? subCategories : ['shop'],
      location: locationData,
      // Add baseLocation with default values to satisfy the required fields
      baseLocation: locationData,
      description: description || null,
      profileImage: profileImage || null,
      website: website || null,
      regionId, // <--- Assigned Region
      subscription: {
        plan: trialPlan._id,
        status: 'Active',
        endDate: subscriptionEndDate,
        history: [],
      }
    });

    // Reload the vendor to ensure we have the proper _id
    console.log(`Vendor created with ID: ${newVendor._id}`);
    const reloadedVendor = await VendorModel.findById(newVendor._id);
    console.log(`Vendor reloaded with ID: ${reloadedVendor._id} (type: ${typeof reloadedVendor._id})`);

    // 7️⃣ Automatically create staff member from vendor data
    console.log(`=== CREATING STAFF MEMBER FOR NEW VENDOR ===`);
    console.log(`Vendor ID: ${reloadedVendor._id} (type: ${typeof reloadedVendor._id})`);
    console.log(`Vendor email: ${reloadedVendor.email}`);
    console.log(`Vendor name: ${reloadedVendor.firstName} ${reloadedVendor.lastName}`);

    const staffResult = await createOwnerAsStaff(reloadedVendor, password);
    console.log(`Staff creation result:`, staffResult);

    // Verify the staff member was created
    if (staffResult && staffResult._id) {
      console.log(`Verifying staff member was created with ID: ${staffResult._id}`);
      const verifiedStaff = await StaffModel.findById(staffResult._id);
      console.log(`Verified staff member exists: ${!!verifiedStaff}`);
      if (verifiedStaff) {
        console.log(`Verified staff vendorId: ${verifiedStaff.vendorId} (type: ${typeof verifiedStaff.vendorId})`);
        console.log(`Verified staff email: ${verifiedStaff.emailAddress}`);
      }

      // Also check by vendorId and email
      console.log('Checking staff by vendorId and email...');
      // Make sure to use the reloaded vendor ID for verification
      const staffByVendorAndEmail = await StaffModel.findOne({
        vendorId: reloadedVendor._id,
        emailAddress: reloadedVendor.email
      });
      console.log(`Found staff by vendorId and email: ${!!staffByVendorAndEmail}`);
      if (staffByVendorAndEmail) {
        console.log(`Staff found by vendorId and email - ID: ${staffByVendorAndEmail._id}`);
      }
    } else {
      console.log('Staff creation may have failed, checking if staff exists anyway...');
      const existingStaff = await StaffModel.findOne({
        vendorId: reloadedVendor._id,
        emailAddress: reloadedVendor.email
      });
      console.log(`Existing staff found: ${!!existingStaff}`);
      if (existingStaff) {
        console.log(`Existing staff ID: ${existingStaff._id}`);
      }
    }

    console.log(`=== END STAFF CREATION PROCESS ===`);

    // 8️⃣ Handle referral if a code was provided
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

    // 9️⃣ Remove password before returning
    const vendorData = newVendor.toObject();
    delete vendorData.password;

    // The user is now registered. They will be logged in and then can proceed with onboarding.
    return NextResponse.json({ message: "Account created successfully. Proceed to onboarding.", vendor: vendorData }, { status: 201 });
  } catch (err) {
    console.error("Vendor Registration Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}