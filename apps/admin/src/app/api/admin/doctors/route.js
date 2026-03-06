
import _db from "@repo/lib/db";
import DoctorModel from "@repo/lib/models/Vendor/Docters.model";
import { ReferralModel, V2VSettingsModel } from "@repo/lib/models/admin/Reffer.model";
import SubscriptionPlan from "@repo/lib/models/admin/SubscriptionPlan.model";
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
export const POST = authMiddlewareAdmin(
  async (req) => {
    try {
      await initDb();
      const body = await req.json();

      // Validate required fields
      const requiredFields = [
        "name", "email", "phone", "gender", "password",
        "registrationNumber", "doctorType", "specialties",
        "experience", "clinicName", "clinicAddress",
        "state", "city", "pincode", "location",
        "physicalConsultationStartTime", "physicalConsultationEndTime",
        "assistantName", "assistantContact", "doctorAvailability"
      ];

      for (const field of requiredFields) {
        if (!body[field]) {
          return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 });
        }
      }

      // Check existence
      const existing = await DoctorModel.findOne({ $or: [{ email: body.email }, { phone: body.phone }, { registrationNumber: body.registrationNumber }] });
      if (existing) {
        return NextResponse.json({ message: "Doctor with this email, phone, or reg number already exists" }, { status: 409 });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(body.password, 10);

      // Generate referral code
      const referralCode = await generateDoctorReferralCode(body.name);

      // Assign region
      const { assignRegion } = await import("@repo/lib/utils/assignRegion.js");
      const regionId = await assignRegion(body.city, body.state, body.location);

      // Create doctor
      const newDoctor = await DoctorModel.create({
        ...body,
        password: hashedPassword,
        referralCode,
        regionId
      });

      // Handle referral if provided
      if (body.referredByCode) {
        try {
          const referringDoctor = await DoctorModel.findOne({ referralCode: body.referredByCode.trim().toUpperCase() });
          if (referringDoctor) {
            const settings = await V2VSettingsModel.findOne({
                $or: [
                  { regionId: newDoctor.regionId },
                  { regionId: null }
                ]
              }).sort({ regionId: -1 });

            const bonusValue = settings?.referrerBonus?.bonusValue || 0;
            const referralId = `REF_D_${Date.now()}`;

            const referral = await ReferralModel.create({
              referralId,
              referralType: 'D2D',
              referrer: referringDoctor._id.toString(),
              referrerType: 'Doctor',
              referee: newDoctor._id.toString(),
              refereeType: 'Doctor',
              regionId: newDoctor.regionId,
              date: new Date(),
              status: 'Pending',
              bonus: `₹${bonusValue}`,
            });

            console.log(`D2D Referral created (Pending): ${referringDoctor.name} refers ${newDoctor.name}`);
          }
        } catch (err) {
          console.error("D2D Referral error:", err);
        }
      }

      return NextResponse.json({ message: "Doctor created successfully", doctor: newDoctor }, { status: 201 });

    } catch (error) {
      console.error("Error creating doctor:", error);
      return NextResponse.json(
        { message: "Error creating doctor", error: error.message },
        { status: 500 }
      );
    }
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"],
  "doctors:edit"
);

// GET - List doctors with regional scoping
export const GET = authMiddlewareAdmin(async (req) => {
  const { buildRegionQueryFromRequest } = await import("@repo/lib");
  const query = buildRegionQueryFromRequest(req);
  const doctors = await DoctorModel.find(query).populate("subscription.plan", "name").select("-password"); // Hide password
  return Response.json(doctors);
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "doctors:view");

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

export const DELETE = authMiddlewareAdmin(
  async (req) => {
    const { id } = await req.json();
    const deleted = await DoctorModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    return Response.json({ message: "Doctor deleted successfully" });
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN"],
  "doctors:delete"
);
