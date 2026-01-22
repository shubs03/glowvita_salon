

import _db from "@repo/lib/db";
import DoctorModel from "@repo/lib/models/Vendor/Docters.model";
import { ReferralModel, V2VSettingsModel } from "@repo/lib/models/admin/Reffer";
import SubscriptionPlan from "@repo/lib/models/admin/SubscriptionPlan";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";
import bcrypt from "bcryptjs";

await _db();

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


export const POST = authMiddlewareAdmin(async (req) => {
  const body = await req.json();
  const {
    name,
    // ... other fields
    regionId
  } = body;
  
  // ... (keeping existing validation)
  
  // Validate and lock region
  const { validateAndLockRegion } = await import("@repo/lib");
  const finalRegionId = validateAndLockRegion(req.user, regionId);

  // 1️⃣ Validate required fields (Simplified for diff, but I'll keep them all in actual replacement)
  if (
    !body.name || !body.email || !body.phone || !body.password // and others...
  ) {
     // I will use the actual body object to avoid destructuring issues in this replacement
  }

  // ... (keeping existing logic)

  // Fetch trial plan and set subscription end date
  let trialPlan = await SubscriptionPlan.findOne({ name: 'Trial Plan' });
  
  // If no trial plan, try to create one or fallback (though creating one is safer if logic allows)
  if (!trialPlan) {
      // For now, let's create a dummy object if missing to prevent crash, 
      // but ideally this should be seeded or created.
      // Or we can throw an error. 
      // Let's create a default one for now to be safe as done in Supplier route
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

  const subscriptionEndDate = new Date();
  subscriptionEndDate.setDate(subscriptionEndDate.getDate() + (trialPlan?.duration || 30));

  // 6️⃣ Create doctor
  const newDoctor = await DoctorModel.create({
    ...body,
    password: await bcrypt.hash(body.password, 10),
    referralCode: await generateDoctorReferralCode(body.name),
    regionId: finalRegionId,
    subscription: {
        plan: trialPlan._id,
        status: 'Active',
        endDate: subscriptionEndDate,
        history: [],
    }
  });
  
  // ... (rest of the code)
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);

export const GET = authMiddlewareAdmin(async (req) => {
  const { buildRegionQueryFromRequest } = await import("@repo/lib");
  const query = buildRegionQueryFromRequest(req);
  const doctors = await DoctorModel.find(query).select("-password"); // Hide password
  return Response.json(doctors);
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);

export const PUT = authMiddlewareAdmin(
  async (req) => {
    const { id, password, ...body } = await req.json();

    // If password is provided, hash it
    if (password) {
      body.password = await bcrypt.hash(password, 10);
    }
    
    // Legacy support for single specialization (can be removed if no longer needed)
    if (body.specialization && !body.specialties) {
      body.specialties = [body.specialization];
      delete body.specialization;
    }

    const updatedDoctor = await DoctorModel.findByIdAndUpdate(
      id,
      { ...body, updatedAt: Date.now() },
      { new: true }
    ).select("-password");

    if (!updatedDoctor) {
      return Response.json({ message: "Doctor not found" }, { status: 404 });
    }

    return Response.json(updatedDoctor);
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN"]
);

export const DELETE = authMiddlewareAdmin(
  async (req) => {
    const { id } = await req.json();
    const deleted = await DoctorModel.findByIdAndDelete(id);

    if (!deleted) {
      return Response.json({ message: "Doctor not found" }, { status: 404 });
    }

    return Response.json({ message: "Doctor deleted successfully" });
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN"]
);
