import { NextResponse } from "next/server";
import AdminPaymentSettingsModel from "@repo/lib/models/admin/AdminPaymentSettings.model";
import _db from "@repo/lib/db";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

/**
 * GET /api/admin/payment-settings
 * Fetch admin's UPI & bank payment details (singleton document)
 */
export const GET = authMiddlewareAdmin(
  async (req) => {
    try {
      const settings = await AdminPaymentSettingsModel.findOne().lean();
      return NextResponse.json({
        success: true,
        data: settings || null,
      });
    } catch (error) {
      console.error("[AdminPaymentSettings] GET error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error", error: error.message },
        { status: 500 }
      );
    }
  },
  ["admin", "SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"],
  "payout:view"
);

/**
 * PUT /api/admin/payment-settings
 * Upsert admin's UPI & bank payment details
 */
export const PUT = authMiddlewareAdmin(
  async (req) => {
    try {
      const body = await req.json();
      const {
        upiId,
        upiQrCodeUrl,
        upiHolderName,
        bankName,
        accountNumber,
        confirmAccountNumber,
        ifscCode,
        accountHolder,
        branchName,
        paymentInstructions,
      } = body;

      // If both account numbers are provided, verify they match
      if (accountNumber && confirmAccountNumber && accountNumber !== confirmAccountNumber) {
        return NextResponse.json(
          { success: false, message: "Account numbers do not match" },
          { status: 400 }
        );
      }

      const updateData = {
        upiId: upiId || null,
        upiQrCodeUrl: upiQrCodeUrl || null,
        upiHolderName: upiHolderName || null,
        bankName: bankName || null,
        accountNumber: accountNumber || null,
        confirmAccountNumber: confirmAccountNumber || null,
        ifscCode: ifscCode ? ifscCode.toUpperCase() : null,
        accountHolder: accountHolder || null,
        branchName: branchName || null,
        paymentInstructions: paymentInstructions || null,
        updatedBy: req.user.userId,
      };

      const settings = await AdminPaymentSettingsModel.findOneAndUpdate(
        {},
        { $set: updateData },
        { upsert: true, new: true, lean: true }
      );

      return NextResponse.json({
        success: true,
        message: "Payment settings saved successfully",
        data: settings,
      });
    } catch (error) {
      console.error("[AdminPaymentSettings] PUT error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error", error: error.message },
        { status: 500 }
      );
    }
  },
  ["admin", "SUPER_ADMIN"],
  "payout:edit"
);
