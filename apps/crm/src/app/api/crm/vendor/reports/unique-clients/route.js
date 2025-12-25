import { NextResponse } from "next/server";
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

// GET - Fetch unique clients for filter dropdown
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const vendorId = req.user.userId.toString();
    
    // Fetch unique client names
    const uniqueClients = await AppointmentModel.distinct('clientName', { vendorId: vendorId });
    
    // Sort alphabetically
    uniqueClients.sort();
    
    return NextResponse.json({
      success: true,
      data: uniqueClients
    });
    
  } catch (error) {
    console.error("Error fetching unique clients:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
});