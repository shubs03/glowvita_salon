
import _db from "../../../../../../../packages/lib/src/db.js";
import { ReferralModel, C2CSettingsModel, C2VSettingsModel, V2VSettingsModel } from "../../../../../../../packages/lib/src/models/admin/Reffer.model.js";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET_VENDOR } from "../../../../../../../packages/config/config.js";

await _db();

// Helper function to validate bonus
const validateBonus = (bonus, prefix = '') => {
  if (!bonus || typeof bonus !== 'object') {
    return `${prefix} bonus object is missing or invalid`;
  }
  if (!['discount', 'amount'].includes(bonus.bonusType)) {
    return `${prefix} bonus type is invalid`;
  }
  if (typeof bonus.bonusValue !== 'number' || bonus.bonusValue < 0) {
    return `${prefix} bonus value is invalid`;
  }
  if (!bonus.creditTime || typeof bonus.creditTime !== 'string') {
    return `${prefix} credit time is required and must be a string`;
  }
  return null;
};

// Helper function to validate referral settings
const validateSettings = (settings) => {
  if (!settings || typeof settings !== 'object') {
    return "Settings object is missing or invalid";
  }

  // Validate referrerBonus
  const referrerError = validateBonus(settings.referrerBonus, 'Referrer');
  if (referrerError) return referrerError;

  // Validate refereeBonus only if enabled
  if (settings.refereeBonus && typeof settings.refereeBonus === 'object') {
    if (typeof settings.refereeBonus.enabled !== 'boolean') {
      return "Referee bonus enabled field must be a boolean";
    }
    if (settings.refereeBonus.enabled) {
      const refereeError = validateBonus(settings.refereeBonus, 'Referee');
      if (refereeError) return refereeError;
    }
  }

  // Validate usageLimit
  if (!['unlimited', 'manual'].includes(settings.usageLimit)) {
    return "Invalid usage limit";
  }
  if (settings.usageLimit === 'manual') {
    if (settings.usageCount === null || settings.usageCount === undefined) {
      return "Usage count is required for manual usage limit";
    }
    if (typeof settings.usageCount !== 'number' || settings.usageCount < 0) {
      return "Invalid usage count";
    }
  }

  // Validate optional fields
  if (settings.minOrders !== null && settings.minOrders !== undefined && (typeof settings.minOrders !== 'number' || settings.minOrders < 0)) {
    return "Invalid minimum orders";
  }
  if (settings.minBookings !== null && settings.minBookings !== undefined && (typeof settings.minBookings !== 'number' || settings.minBookings < 0)) {
    return "Invalid minimum bookings";
  }
  if (settings.minPayoutCycle !== null && settings.minPayoutCycle !== undefined && (typeof settings.minPayoutCycle !== 'number' || settings.minPayoutCycle < 0)) {
    return "Invalid minimum payout cycle";
  }

  return null;
};

// Create Referral
export const POST = authMiddlewareAdmin(
  async (req) => {
    const body = await req.json();
    const { referralType, referrer, referee, status, bonus } = body;

    if (!['C2C', 'C2V', 'V2V'].includes(referralType) || !referrer || !referee || !status || !bonus) {
      return Response.json(
        { message: "Required fields missing" },
        { status: 400 }
      );
    }

    const newReferral = await ReferralModel.create({
      referralType,
      referrer,
      referee,
      status,
      bonus,
    });

    return Response.json(
      { message: "Referral created successfully", referral: newReferral },
      { status: 201 }
    );
  },
  ["superadmin"]
);

// Get Referrals or Settings
export const GET = async (req) => {
  // const token = req.headers.get("authorization")?.split(" ")[1];
  // if (!token) {
  //   return Response.json({ message: "Unauthorized: No token provided" }, { status: 401 });
  // }

  try {
  //   // This endpoint can be accessed by both admin and vendors, so we need to determine the role
  //   // This is a simplified check; a more robust solution might use different secrets or a public key system.
  //   let decoded;
  //   try {
  //     // Try verifying with admin secret first
  //     decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
  //   } catch (adminError) {
  //     // If admin verification fails, try with vendor secret
  //     try {
  //       decoded = jwt.verify(token, JWT_SECRET_VENDOR);
  //     } catch (vendorError) {
  //       throw new Error("Invalid token for any role");
  //     }
    // }

    const url = new URL(req.url);
    const referralType = url.searchParams.get('referralType');
    const isSettings = url.searchParams.get('settings') === 'true';

    if (isSettings) {
      // if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      //    return Response.json({ message: "Forbidden: You do not have permission to access settings" }, { status: 403 });
      // }
      if (!referralType) {
        return Response.json({ message: "Referral type required for settings" }, { status: 400 });
      }
      let Model;
      switch (referralType) {
        case 'C2C': Model = C2CSettingsModel; break;
        case 'C2V': Model = C2VSettingsModel; break;
        case 'V2V': Model = V2VSettingsModel; break;
        default: return Response.json({ message: "Invalid referral type" }, { status: 400 });
      }
      const settings = await Model.findOne({});
      return Response.json(settings || {
        referrerBonus: { bonusType: 'amount', bonusValue: 0, creditTime: '7 days' },
        refereeBonus: { enabled: false },
        usageLimit: 'unlimited',
        usageCount: null,
        minOrders: null,
        minBookings: null,
        minPayoutCycle: null,
      });
    } else {
      const query = {};
      if (referralType) {
        query.referralType = referralType;
      }
      const referrals = await ReferralModel.find(query);
      return Response.json(referrals);
    }
  } catch (error) {
    console.error("Referral GET error:", error);
    return Response.json({ message: "An error occurred", error: error.message }, { status: 500 });
  }
};


// Update Referral
export const PUT = authMiddlewareAdmin(
  async (req) => {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (updateData.status && !['Pending', 'Completed', 'Approved', 'Paid'].includes(updateData.status)) {
      return Response.json(
        { message: "Invalid status" },
        { status: 400 }
      );
    }

    const updatedReferral = await ReferralModel.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedReferral) {
      return Response.json({ message: "Referral not found" }, { status: 404 });
    }

    return Response.json(updatedReferral);
  },
  ["superadmin"]
);

// Delete Referral
export const DELETE = authMiddlewareAdmin(
  async (req) => {
    const { id } = await req.json();

    const deletedReferral = await ReferralModel.findByIdAndDelete(id);
    if (!deletedReferral) {
      return Response.json({ message: "Referral not found" }, { status: 404 });
    }

    return Response.json({ message: "Referral deleted successfully" });
  },
  ["superadmin"]
);

// Update Referral Settings
export const PATCH = authMiddlewareAdmin(
  async (req) => {
    const body = await req.json();
    const { referralType, settings } = body;

    if (!['C2C', 'C2V', 'V2V'].includes(referralType)) {
      return Response.json(
        { message: "Invalid referral type" },
        { status: 400 }
      );
    }

    const validationError = validateSettings(settings);
    if (validationError) {
      return Response.json(
        { message: validationError },
        { status: 400 }
      );
    }

    let Model;
    switch (referralType) {
      case 'C2C':
        Model = C2CSettingsModel;
        break;
      case 'C2V':
        Model = C2VSettingsModel;
        break;
      case 'V2V':
        Model = V2VSettingsModel;
        break;
    }

    const updatedSettings = await Model.findOneAndUpdate(
      {},
      { ...settings, updatedAt: Date.now() },
      { new: true, upsert: true }
    );

    return Response.json({
      message: `${referralType} settings updated successfully`,
      settings: updatedSettings
    });
  },
  ["superadmin"]
);
