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
        // Start from the beginning of today to include all of today's appointments
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate.setDate(endDate.getDate() + 7);
        endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
};

// Main handler function for the doctor upcoming metrics endpoint
async function getUpcomingAppointmentsHandler(request) {
    try {
        // Get doctor ID from authenticated user
        const doctorId = (request.user.userId || request.user.id).toString();

        // Get filter parameters from query parameters
        const url = new URL(request.url);
        const period = url.searchParams.get('period') || 'all';
        const startDateParam = url.searchParams.get('startDate');
        const endDateParam = url.searchParams.get('endDate');

        // Determine date ranges based on parameters
        let startDate, endDate;
        if (startDateParam && endDateParam) {
            startDate = new Date(startDateParam);
            endDate = new Date(endDateParam);
            endDate.setHours(23, 59, 59, 999);
        } else {
            const presetDates = getDateRanges(period);
            startDate = presetDates.startDate;
            endDate = presetDates.endDate;
        }

        // For upcoming appointments, we always look forward from today or the start date
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const queryStartDate = startDate > todayStart ? startDate : todayStart;

        // Try both scheduled and confirmed, and include various casing just in case
        const upcomingStatuses = ['scheduled', 'confirmed', 'Scheduled', 'Confirmed'];

        // Try with both string and ObjectId to be safe
        let appointments = [];
        try {
            const mongoose = require('mongoose');
            const doctorObjectId = mongoose.Types.ObjectId.isValid(doctorId)
                ? new mongoose.Types.ObjectId(doctorId)
                : null;

            appointments = await AppointmentModel.find({
                $or: [
                    { doctorId: doctorId },
                    ...(doctorObjectId ? [{ doctorId: doctorObjectId }] : [])
                ],
                status: { $in: upcomingStatuses },
                date: { $gte: queryStartDate, $lte: endDate }
            })
                .sort({ date: 1, startTime: 1 })
                .limit(10)
                .select('clientName serviceName startTime date duration staffName');

        } catch (queryError) {
            console.error("Aggregation error, falling back to simple query:", queryError);
            appointments = await AppointmentModel.find({
                doctorId: doctorId,
                status: { $in: upcomingStatuses },
                date: { $gte: queryStartDate, $lte: endDate }
            })
                .sort({ date: 1, startTime: 1 })
                .limit(10)
                .select('clientName serviceName startTime date duration staffName');
        }

        // Format the appointments for the frontend component
        const formattedAppointments = appointments.map(appt => ({
            name: appt.clientName,
            service: appt.serviceName,
            date: appt.date ? new Date(appt.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }) : 'N/A',
            time: appt.startTime,
            duration: appt.duration,
            staff: appt.staffName
        }));

        return NextResponse.json({
            success: true,
            data: formattedAppointments
        });

    } catch (error) {
        console.error("Error fetching doctor upcoming appointments:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

// Wrap the handler with auth middleware
export const GET = authMiddlewareCrm(getUpcomingAppointmentsHandler);
