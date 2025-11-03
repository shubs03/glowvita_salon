import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import TaxFeeSettings from "@repo/lib/models/admin/TaxFeeSettings";

// Initialize database connection
await _db();

// Helper function to transform settings to frontend format
const transformSettings = (settings) => {
  if (!settings) {
    return {
      platformFee: 15,
      serviceTax: 18,
      platformFeeType: "percentage",
      serviceTaxType: "percentage",
      platformFeeEnabled: true,
      serviceTaxEnabled: true,
    };
  }

  return {
    platformFee: settings.platformFee || 15,
    platformFeeType: settings.platformFeeType || 'percentage',
    platformFeeEnabled: settings.platformFeeEnabled !== false,
    serviceTax: settings.serviceTax || 18, // This is GST
    serviceTaxType: settings.serviceTaxType || 'percentage',
    serviceTaxEnabled: settings.serviceTaxEnabled !== false,
    _id: settings._id
  };
};

// GET all tax fee settings (public endpoint)
export async function GET() {
  try {
    const settings = await TaxFeeSettings.findOne().sort({ updatedAt: -1 });
    return NextResponse.json(transformSettings(settings), { status: 200 });
  } catch (error) {
    console.error("Error fetching tax fee settings:", error);
    return NextResponse.json(
      { message: "Error fetching tax fee settings", error: error.message },
      { status: 500 }
    );
  }
}