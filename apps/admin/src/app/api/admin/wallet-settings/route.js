import _db from "@repo/lib/db";
import WalletSettingsModel from "@repo/lib/models/admin/WalletSettings.model";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

// Helper function to validate wallet settings
const validateWalletSettings = (settings) => {
  if (!settings || typeof settings !== 'object') {
    return "Settings object is missing or invalid";
  }

  // Validate withdrawal amounts
  if (typeof settings.minWithdrawalAmount !== 'number' || settings.minWithdrawalAmount < 0) {
    return "Minimum withdrawal amount must be a positive number";
  }
  if (typeof settings.maxWithdrawalAmount !== 'number' || settings.maxWithdrawalAmount < 0) {
    return "Maximum withdrawal amount must be a positive number";
  }
  if (settings.minWithdrawalAmount >= settings.maxWithdrawalAmount) {
    return "Minimum withdrawal amount must be less than maximum withdrawal amount";
  }
  if (typeof settings.maxDailyWithdrawalAmount !== 'number' || settings.maxDailyWithdrawalAmount < 0) {
    return "Daily withdrawal limit must be a positive number";
  }
  if (settings.maxDailyWithdrawalAmount < settings.maxWithdrawalAmount) {
    return "Daily withdrawal limit should be greater than or equal to maximum withdrawal amount";
  }

  // Validate withdrawal per day count
  if (typeof settings.maxWithdrawalsPerDay !== 'number' || settings.maxWithdrawalsPerDay < 1) {
    return "Maximum withdrawals per day must be at least 1";
  }

  // Validate add money amounts
  if (typeof settings.minAddMoneyAmount !== 'number' || settings.minAddMoneyAmount < 0) {
    return "Minimum add money amount must be a positive number";
  }
  if (typeof settings.maxAddMoneyAmount !== 'number' || settings.maxAddMoneyAmount < 0) {
    return "Maximum add money amount must be a positive number";
  }
  if (settings.minAddMoneyAmount >= settings.maxAddMoneyAmount) {
    return "Minimum add money amount must be less than maximum add money amount";
  }

  // Validate withdrawal fee
  if (!['fixed', 'percentage', 'none'].includes(settings.withdrawalFeeType)) {
    return "Invalid withdrawal fee type";
  }
  if (typeof settings.withdrawalFeeValue !== 'number' || settings.withdrawalFeeValue < 0) {
    return "Withdrawal fee value must be a positive number";
  }
  if (settings.withdrawalFeeType === 'percentage' && settings.withdrawalFeeValue > 100) {
    return "Withdrawal fee percentage cannot exceed 100%";
  }

  // Validate cooldown period
  if (typeof settings.cooldownPeriodHours !== 'number' || settings.cooldownPeriodHours < 0) {
    return "Cooldown period must be a positive number";
  }

  return null;
};

// GET: Fetch wallet settings
export const GET = authMiddlewareAdmin(
  async (req) => {
    try {
      // Use the getSettings static method to ensure singleton pattern
      const settings = await WalletSettingsModel.getSettings();

      if (!settings) {
        return Response.json(
          { 
            success: false,
            message: "Wallet settings not found" 
          },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        data: {
          minWithdrawalAmount: settings.minWithdrawalAmount,
          maxWithdrawalAmount: settings.maxWithdrawalAmount,
          maxDailyWithdrawalAmount: settings.maxDailyWithdrawalAmount,
          maxWithdrawalsPerDay: settings.maxWithdrawalsPerDay,
          minAddMoneyAmount: settings.minAddMoneyAmount,
          maxAddMoneyAmount: settings.maxAddMoneyAmount,
          withdrawalFeeType: settings.withdrawalFeeType,
          withdrawalFeeValue: settings.withdrawalFeeValue,
          cooldownPeriodHours: settings.cooldownPeriodHours,
          lastUpdatedAt: settings.lastUpdatedAt,
          updatedBy: settings.updatedBy
        }
      });
    } catch (error) {
      console.error("Error fetching wallet settings:", error);
      return Response.json(
        { 
          success: false,
          message: "Failed to fetch wallet settings",
          error: error.message 
        },
        { status: 500 }
      );
    }
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN"]
);

// PUT: Update wallet settings
export const PUT = authMiddlewareAdmin(
  async (req) => {
    try {
      const body = await req.json();
      const { settings } = body;

      // Validate settings
      const validationError = validateWalletSettings(settings);
      if (validationError) {
        return Response.json(
          { 
            success: false,
            message: validationError 
          },
          { status: 400 }
        );
      }

      // Get current settings (creates if doesn't exist)
      const currentSettings = await WalletSettingsModel.getSettings();

      // Update settings
      currentSettings.minWithdrawalAmount = settings.minWithdrawalAmount;
      currentSettings.maxWithdrawalAmount = settings.maxWithdrawalAmount;
      currentSettings.maxDailyWithdrawalAmount = settings.maxDailyWithdrawalAmount;
      currentSettings.maxWithdrawalsPerDay = settings.maxWithdrawalsPerDay;
      currentSettings.minAddMoneyAmount = settings.minAddMoneyAmount;
      currentSettings.maxAddMoneyAmount = settings.maxAddMoneyAmount;
      currentSettings.withdrawalFeeType = settings.withdrawalFeeType;
      currentSettings.withdrawalFeeValue = settings.withdrawalFeeValue;
      currentSettings.cooldownPeriodHours = settings.cooldownPeriodHours;
      currentSettings.updatedBy = req.user?._id || null;
      currentSettings.lastUpdatedAt = new Date();

      await currentSettings.save();

      console.log(`Wallet settings updated by admin: ${req.user?.email || 'Unknown'}`);

      return Response.json({
        success: true,
        message: "Wallet settings updated successfully",
        data: {
          minWithdrawalAmount: currentSettings.minWithdrawalAmount,
          maxWithdrawalAmount: currentSettings.maxWithdrawalAmount,
          maxDailyWithdrawalAmount: currentSettings.maxDailyWithdrawalAmount,
          maxWithdrawalsPerDay: currentSettings.maxWithdrawalsPerDay,
          minAddMoneyAmount: currentSettings.minAddMoneyAmount,
          maxAddMoneyAmount: currentSettings.maxAddMoneyAmount,
          withdrawalFeeType: currentSettings.withdrawalFeeType,
          withdrawalFeeValue: currentSettings.withdrawalFeeValue,
          cooldownPeriodHours: currentSettings.cooldownPeriodHours,
          lastUpdatedAt: currentSettings.lastUpdatedAt,
          updatedBy: currentSettings.updatedBy
        }
      });
    } catch (error) {
      console.error("Error updating wallet settings:", error);
      return Response.json(
        { 
          success: false,
          message: "Failed to update wallet settings",
          error: error.message 
        },
        { status: 500 }
      );
    }
  },
  ["SUPER_ADMIN", "REGIONAL_ADMIN"]
);
