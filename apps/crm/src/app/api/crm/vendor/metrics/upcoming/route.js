import { NextResponse } from "next/server";
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

// Helper function to calculate date ranges based on filter period
const getDateRanges = (period) => {
  const now = new Date();

  let startDate, endDate;

  if (period === 'day') {
    // Today only
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (period === 'month') {
    // Current month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === 'year') {
    // Current year
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else {
    // All time (next 7 days for upcoming appointments)
    startDate = new Date();
    endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
};

// Helper function to parse custom date ranges from query parameters
const getCustomDateRanges = (startDateStr, endDateStr) => {
  let startDate, endDate;

  if (startDateStr && endDateStr) {
    // Parse the custom date range
    startDate = new Date(startDateStr);
    endDate = new Date(endDateStr);
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
};

// Helper function to get upcoming appointments based on filter period
async function getUpcomingAppointmentsHandler(request) {
  try {
    // Get vendor ID from authenticated user
    const vendorId = (request.user.userId || request.user.id).toString();

    // Get filter parameters from query parameters
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'all';
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');

    // Determine date ranges based on parameters
    let startDate, endDate;
    if (startDateParam && endDateParam) {
      // Use custom date range
      const customDates = getCustomDateRanges(startDateParam, endDateParam);
      startDate = customDates.startDate;
      endDate = customDates.endDate;
    } else {
      // Use preset period
      const presetDates = getDateRanges(period);
      startDate = presetDates.startDate;
      endDate = presetDates.endDate;
    }

    // For upcoming appointments, we always look forward from today or the start date
    const queryStartDate = startDate > new Date() ? startDate : new Date();

    // Try querying with string vendorId first
    let matchCondition = {
      vendorId: vendorId,
      status: { $in: ['scheduled', 'confirmed'] },
      date: { $gte: queryStartDate, $lte: endDate }
    };

    // Find upcoming appointments
    let appointments = await AppointmentModel.find(matchCondition)
      .select('clientName serviceName startTime date duration staffName')
      .sort({ date: 1, startTime: 1 })
      .limit(10);

    // If no appointments found with string vendorId, try with ObjectId
    if (appointments.length === 0) {
      try {
        const mongoose = require('mongoose');
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        matchCondition.vendorId = vendorObjectId;

        appointments = await AppointmentModel.find(matchCondition)
          .select('clientName serviceName startTime date duration staffName')
          .sort({ date: 1, startTime: 1 })
          .limit(10);
      } catch (objectIdError) {
        console.log("Could not convert vendorId to ObjectId:", objectIdError.message);
      }
    }

    // Format the data for the frontend
    const formattedAppointments = appointments.map(appt => {
      // Format the date for display
      const appointmentDate = new Date(appt.date);

      // Format date as "Dec 7, 2025"
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return {
        name: appt.clientName,
        service: appt.serviceName,
        date: formattedDate,
        time: appt.startTime,
        duration: appt.duration,
        staff: appt.staffName
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedAppointments,
      count: formattedAppointments.length
    });

  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Wrap the handler with auth middleware
export const GET = authMiddlewareCrm(getUpcomingAppointmentsHandler);