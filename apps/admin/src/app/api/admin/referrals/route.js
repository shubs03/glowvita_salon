
import _db from "@repo/lib/db";
import { ReferralModel, C2CSettingsModel, C2VSettingsModel, V2VSettingsModel, S2SSettingsModel, D2DSettingsModel } from "@repo/lib/models/admin/Reffer.model";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";
import { getRegionQuery } from "@repo/lib/utils/regionQuery";
import jwt from "jsonwebtoken";

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
    const { referrer, referee, status, bonus, regionId } = body;
    const referralType = body.referralType || body.type;

    if (!['C2C', 'C2V', 'V2V', 'S2S', 'D2D'].includes(referralType) || !referrer || !referee || !status || !bonus) {
      return Response.json(
        { message: "Required fields missing" },
        { status: 400 }
      );
    }

    // Validate and lock region
    const { validateAndLockRegion } = await import("@repo/lib");
    const finalRegionId = validateAndLockRegion(req.user, regionId);

    const newReferral = await ReferralModel.create({
      referralType,
      referrer,
      referee,
      status,
      bonus,
      regionId: finalRegionId
    });

    return Response.json(
      { message: "Referral created successfully", referral: newReferral },
      { status: 201 }
    );
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN"],
  "referral:edit"
);

// Get Referrals or Settings
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    const url = new URL(req.url);
    const referralType = url.searchParams.get('referralType') || url.searchParams.get('type');
    const regionId = url.searchParams.get('regionId');
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
        case 'S2S': Model = S2SSettingsModel; break;
        case 'D2D': Model = D2DSettingsModel; break;
        default: return Response.json({ message: "Invalid referral type" }, { status: 400 });
      }

      // If regional admin or filtering by region
      if (req.user.roleName !== "SUPER_ADMIN" && req.user.roleName !== "superadmin") {
        // Regional Admin: find specific or global
        const userRegion = req.user.assignedRegions?.[0];
        const settings = await Model.findOne({ 
          $or: [
            { regionId: userRegion },
            { regionId: null }
          ]
        }).sort({ regionId: -1 }); // Priority to region-specific (not null)

        // Check if global is disabled for this region
        if (settings && !settings.regionId && settings.disabledRegions?.includes(userRegion)) {
          return Response.json({
            referrerBonus: { bonusType: 'amount', bonusValue: 0, creditTime: '7 days' },
            refereeBonus: { enabled: false },
            usageLimit: 'unlimited',
            usageCount: null,
            minOrders: null,
            minBookings: null,
            minPayoutCycle: null,
            status: 'Disabled'
          });
        }

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
        // Super Admin: query by provided region or all
        const query = regionId ? { regionId } : { regionId: null };
        const settings = await Model.findOne(query);
        return Response.json(settings || {
          referrerBonus: { bonusType: 'amount', bonusValue: 0, creditTime: '7 days' },
          refereeBonus: { enabled: false },
          usageLimit: 'unlimited',
          usageCount: null,
          minOrders: null,
          minBookings: null,
          minPayoutCycle: null,
        });
      }
    } else {
      const regionQuery = getRegionQuery(req.user, regionId);
      const query = { ...regionQuery };
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
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"], "referral:view");

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
  ["SUPER_ADMIN", "REGIONAL_ADMIN"],
  "referral:edit"
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
  ["SUPER_ADMIN", "REGIONAL_ADMIN"],
  "referral:delete"
);

// Update Referral Settings
export const PATCH = authMiddlewareAdmin(
  async (req) => {
    const body = await req.json();
    const { settings } = body;
    const referralType = body.referralType || body.type;

    if (!['C2C', 'C2V', 'V2V', 'S2S', 'D2D'].includes(referralType)) {
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
      case 'C2C': Model = C2CSettingsModel; break;
      case 'C2V': Model = C2VSettingsModel; break;
      case 'V2V': Model = V2VSettingsModel; break;
      case 'S2S': Model = S2SSettingsModel; break;
      case 'D2D': Model = D2DSettingsModel; break;
    }

    const { validateAndLockRegion } = await import("@repo/lib");
    const finalRegionId = validateAndLockRegion(req.user, body.regionId);

    // If disabling/enabling a global plan for a region
    if (body.action === 'toggle_global' && !finalRegionId) {
        return Response.json({ message: "Region ID required to toggle global settings" }, { status: 400 });
    }

    const updateData = { ...settings, updatedAt: Date.now() };
    if (finalRegionId) {
        updateData.regionId = finalRegionId;
    }

    // Check if we are updating an existing regional setting or creating new
    const query = finalRegionId ? { regionId: finalRegionId } : { regionId: null };
    
    // Special case: Regional Admin disabling Super Admin setting
    if (body.action === 'disable_global' && finalRegionId) {
       const globalSettings = await Model.findOne({ regionId: null });
       if (globalSettings) {
           await Model.updateOne({ regionId: null }, { $addToSet: { disabledRegions: finalRegionId } });
           return Response.json({ message: "Global settings disabled for your region" });
       }
    }

    const updatedSettings = await Model.findOneAndUpdate(
      query,
      updateData,
      { new: true, upsert: true }
    );

    return Response.json({
      message: `${referralType} settings updated successfully`,
      settings: updatedSettings
    });
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN"],
  "referral:edit"
);
