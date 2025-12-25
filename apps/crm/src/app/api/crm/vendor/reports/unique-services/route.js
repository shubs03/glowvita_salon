import { NextResponse } from "next/server";
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

// GET - Fetch unique services for filter dropdown
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const vendorId = req.user.userId.toString();
    
    // Fetch unique service names from both service and serviceItems fields
    const serviceNames = await AppointmentModel.find({ vendorId: vendorId }).distinct('serviceName');
    const serviceItemNames = await AppointmentModel.find({ vendorId: vendorId }).distinct('serviceItems.serviceName');
    
    // Combine and deduplicate service names
    const uniqueServices = [...new Set([...serviceNames, ...serviceItemNames])];
    
    // Sort alphabetically
    uniqueServices.sort();
    
    return NextResponse.json({
      success: true,
      data: uniqueServices
    });
    
  } catch (error) {
    console.error("Error fetching unique services:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
});