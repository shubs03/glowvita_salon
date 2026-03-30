import { NextResponse } from "next/server";
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import _db from '@repo/lib/db';
import { withSubscriptionCheck } from '@/middlewareCrm';

await _db();

// GET - Fetch unique staff for filter dropdown
export const GET = withSubscriptionCheck(async (req) => {
  try {
    const vendorId = (req.user.vendorId || req.user.userId).toString();

    // Fetch unique staff names from both staff and serviceItems fields
    const staffNames = await AppointmentModel.find({ vendorId: vendorId }).distinct('staffName');
    const serviceItemStaffNames = await AppointmentModel.find({ vendorId: vendorId }).distinct('serviceItems.staffName');

    // Combine and deduplicate staff names
    const uniqueStaff = [...new Set([...staffNames, ...serviceItemStaffNames])];

    // Sort alphabetically
    uniqueStaff.sort();

    return NextResponse.json({
      success: true,
      data: uniqueStaff
    });

  } catch (error) {
    console.error("Error fetching unique staff:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
});