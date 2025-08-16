import _db from "../../../../../../../packages/lib/src/db.js";
import { ReferralModel, C2CSettingsModel, C2VSettingsModel, V2VSettingsModel } from "../../../../../../../packages/lib/src/models/admin/Reffer.model.js";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

// Helper function to validate bonus
const validateBonus = (bonus, prefix = '') => {
  if (!['discount', 'amount'].includes(bonus.bonusType)) {
    return `${prefix} bonus type is invalid`;
  }
  if (typeof bonus.bonusValue !== 'number' || bonus.bonusValue < 0) {
    return `${prefix} bonus value is invalid`;
  }
  if (!bonus.creditTime) {
    return `${prefix} credit time is required`;
  }
  return null;
};

// Helper function to validate referral settings
const validateSettings = (settings) => {
  const referrerError = validateBonus(settings.referrerBonus, 'Referrer');
  if (referrerError) return referrerError;

  if (settings.refereeBonus.enabled) {
    const refereeError = validateBonus(settings.refereeBonus, 'Referee');
    if (refereeError) return refereeError;
  }

  if (!['unlimited', 'manual'].includes(settings.usageLimit)) {
    return "Invalid usage limit";
  }
  if (settings.usageLimit === 'manual' && (typeof settings.usageCount !== 'number' || settings.usageCount < 0)) {
    return "Invalid usage count";
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
export const GET = authMiddlewareAdmin(
  async (req) => {
    const url = new URL(req.url);
    const referralType = url.searchParams.get('referralType');
    const isSettings = url.searchParams.get('settings') === 'true';

    if (isSettings) {
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
      return Response.json(settings || {});
    } else {
      const query = referralType ? { referralType } : {};
      const referrals = await ReferralModel.find(query);
      return Response.json(referrals);
    }
  },
  ["superadmin", "admin"]
);

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