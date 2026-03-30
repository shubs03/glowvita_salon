import { NextResponse } from "next/server";
import AdminPaymentSettingsModel from "@repo/lib/models/admin/AdminPaymentSettings.model";
import _db from "@repo/lib/db";
import { authMiddlewareCrm } from "@/middlewareCrm.js";

await _db();

/**
 * GET /api/crm/payment-settings
 * Fetch admin's payment details (UPI QR + bank) for vendor reference
 * Used by vendors to know where to send payment to admin
 */
export const GET = authMiddlewareCrm(
  async (req) => {
    try {
      const settings = await AdminPaymentSettingsModel.findOne()
        .select(
          "upiId upiQrCodeUrl upiHolderName bankName accountNumber ifscCode accountHolder branchName paymentInstructions"
        )
        .lean();

      return NextResponse.json({
        success: true,
        data: settings || null,
      });
    } catch (error) {
      console.error("[CRM PaymentSettings] GET error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error", error: error.message },
        { status: 500 }
      );
    }
  },
  ["vendor", "staff"]
);
