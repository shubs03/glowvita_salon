
import _db from "@repo/lib/db";
import DoctorModel from "@repo/lib/models/Vendor/Docters.model";
import { ReferralModel, V2VSettingsModel } from "@repo/lib/models/admin/Reffer";
import SubscriptionPlan from "@repo/lib/models/admin/SubscriptionPlan";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// Initialize database connection
const initDb = async () => {
  try {
    await _db();
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
};

// Function to generate a unique referral code for a doctor
const generateDoctorReferralCode = async (name) => {
  let referralCode;
  let isUnique = false;
  const namePrefix = name.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 3);

  while (!isUnique) {
    const randomNumbers = Math.floor(100 + Math.random() * 900); // Generates 3-digit number
    referralCode = `DR${namePrefix}${randomNumbers}`;

    const existingDoctor = await DoctorModel.findOne({ referralCode });
    if (!existingDoctor) {
      isUnique = true;
    }
  }
  return referralCode;
};

// POST - Create a new doctor
export const POST = authMiddlewareAdmin(async (req) => {
  try {
    await initDb();
    const body = await req.json();

    // Validate required fields
    const requiredFields = [
      'name', 'email', 'phone', 'gender', 'password',
      'registrationNumber', 'doctorType', 'specialties',
      'experience', 'clinicName', 'clinicAddress',
      'state', 'city', 'pincode', 'location',
      'physicalConsultationStartTime', 'physicalConsultationEndTime',
      'assistantName', 'assistantContact', 'doctorAvailability'
    ];

    console.log("[POST /api/admin/doctors] Received body:", body);
    for (const field of requiredFields) {
      const value = body[field];
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        console.warn(`[POST /api/admin/doctors] Missing or empty field: ${field}`);
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Check for existing email/phone/registration
    const existing = await DoctorModel.findOne({
      $or: [
        { email: body.email.toLowerCase() },
        { phone: body.phone },
        { registrationNumber: body.registrationNumber }
      ]
    });

    if (existing) {
      if (existing.email === body.email.toLowerCase()) return NextResponse.json({ message: "Email already registered" }, { status: 400 });
      if (existing.phone === body.phone) return NextResponse.json({ message: "Phone number already registered" }, { status: 400 });
      if (existing.registrationNumber === body.registrationNumber) return NextResponse.json({ message: "Registration number already exists" }, { status: 400 });
    }

    // Validate and lock region
    const { validateAndLockRegion } = await import("@repo/lib");
    const finalRegionId = validateAndLockRegion(req.user, body.regionId);

    // Fetch trial plan
    let trialPlan = await SubscriptionPlan.findOne({ name: 'Trial Plan', userType: 'doctor' });
    if (!trialPlan) {
      // Fallback: try finding any trial plan or create a default one
      trialPlan = await SubscriptionPlan.findOne({ name: 'Trial Plan' });
      if (!trialPlan) {
        trialPlan = await SubscriptionPlan.create({
          name: 'Trial Plan',
          description: 'Default trial plan',
          price: 0,
          duration: 30,
          features: ['Basic features'],
          userType: 'doctor',
          status: 'active'
        });
      }
    }

    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + (trialPlan?.duration || 30));

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create doctor
    const newDoctor = await DoctorModel.create({
      ...body,
      email: body.email.toLowerCase(),
      password: hashedPassword,
      referralCode: await generateDoctorReferralCode(body.name),
      regionId: finalRegionId,
      subscription: {
        plan: trialPlan._id,
        status: 'Active',
        endDate: subscriptionEndDate,
        history: [],
      }
    });

    return NextResponse.json(newDoctor, { status: 201 });
  } catch (error) {
    console.error("Error creating doctor:", error);
    return NextResponse.json({ message: "Error creating doctor", error: error.message }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);

// GET - List doctors with regional scoping
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    await initDb();
    const { buildRegionQueryFromRequest } = await import("@repo/lib");
    const query = buildRegionQueryFromRequest(req);

    const doctors = await DoctorModel.find(query)
      .populate("subscription.plan", "name")
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json({ message: "Error fetching doctors", error: error.message }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);

// PUT - Update doctor details
export const PUT = authMiddlewareAdmin(async (req) => {
  try {
    await initDb();
    const { id, password, ...body } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID is required for update" }, { status: 400 });
    }

    const existingDoctor = await DoctorModel.findById(id);
    if (!existingDoctor) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData = { ...body, updatedAt: Date.now() };

    // If password is provided, hash it
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedDoctor = await DoctorModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("subscription.plan", "name").select("-password");

    return NextResponse.json(updatedDoctor);
  } catch (error) {
    console.error("Error updating doctor:", error);
    return NextResponse.json({ message: "Error updating doctor", error: error.message }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);

// DELETE - Remove a doctor
export const DELETE = authMiddlewareAdmin(async (req) => {
  try {
    await initDb();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID is required for deletion" }, { status: 400 });
    }

    const deleted = await DoctorModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return NextResponse.json({ message: "Error deleting doctor", error: error.message }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);
