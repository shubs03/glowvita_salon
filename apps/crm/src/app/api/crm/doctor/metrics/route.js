import { NextResponse } from "next/server";
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import DoctorModel from '@repo/lib/models/Vendor/Docters.model';
import ReviewModel from '@repo/lib/models/Review/Review.model';
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
    // All time (last year for testing purposes)
    startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
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

// Main handler function for the doctor metrics endpoint
async function getDoctorMetricsHandler(request) {
  try {
    console.log("Full user object:", JSON.stringify(request.user, null, 2));
    // Use userId and convert to string based on other routes in the app
    const doctorId = (request.user.userId || request.user.id).toString();
    console.log("Fetching metrics for doctor ID:", doctorId);
    
    // Get filter parameters from query parameters
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'all';
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');
    
    console.log("Filter period:", period);
    console.log("Custom date range:", startDateParam, "to", endDateParam);
    
    // Determine date ranges based on parameters
    let startDate, endDate;
    if (startDateParam && endDateParam) {
      // Use custom date range
      const customDates = getCustomDateRanges(startDateParam, endDateParam);
      startDate = customDates.startDate;
      endDate = customDates.endDate;
      console.log("Using custom date range:", startDate, "to", endDate);
    } else {
      // Use preset period
      const presetDates = getDateRanges(period);
      startDate = presetDates.startDate;
      endDate = presetDates.endDate;
      console.log("Using preset date range:", startDate, "to", endDate);
    }
    
    // Also log the doctorId type to check if it's an ObjectId
    console.log("Doctor ID type:", typeof doctorId);

    // Try querying with the doctorId as a string first
    let doctorAppointmentCount = await AppointmentModel.countDocuments({ doctorId: doctorId });
    console.log("Total appointments for this doctor (string query):", doctorAppointmentCount);
    
    // If that doesn't work, try converting to ObjectId
    if (doctorAppointmentCount === 0) {
      try {
        const mongoose = require('mongoose');
        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
        doctorAppointmentCount = await AppointmentModel.countDocuments({ doctorId: doctorObjectId });
        console.log("Total appointments for this doctor (ObjectId query):", doctorAppointmentCount);
      } catch (objectIdError) {
        console.log("Could not convert doctorId to ObjectId:", objectIdError.message);
      }
    }

    // 1. Total Patients (unique clients who had appointments with this doctor)
    // Try with string doctorId first
    let totalPatientsResult = await AppointmentModel.aggregate([
      {
        $match: {
          doctorId: doctorId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$clientId"
        }
      },
      {
        $count: "totalPatients"
      }
    ]);

    // If that doesn't work, try with ObjectId
    if (totalPatientsResult.length === 0) {
      try {
        const mongoose = require('mongoose');
        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
        
        totalPatientsResult = await AppointmentModel.aggregate([
          {
            $match: {
              doctorId: doctorObjectId,
              date: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: "$clientId"
            }
          },
          {
            $count: "totalPatients"
          }
        ]);
      } catch (error) {
        console.log("Error converting doctorId to ObjectId for total patients query:", error.message);
      }
    }

    const totalPatients = totalPatientsResult.length > 0 ? totalPatientsResult[0].totalPatients : 0;
    console.log("Total unique patients:", totalPatients);

    // 2. Total Appointments
    // Already calculated above as doctorAppointmentCount, but let's recalculate with date range
    // Try with string doctorId first
    let totalAppointments = await AppointmentModel.countDocuments({
      doctorId: doctorId,
      date: { $gte: startDate, $lte: endDate }
    });

    // If that doesn't work, try with ObjectId
    if (totalAppointments === 0) {
      try {
        const mongoose = require('mongoose');
        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
        totalAppointments = await AppointmentModel.countDocuments({
          doctorId: doctorObjectId,
          date: { $gte: startDate, $lte: endDate }
        });
      } catch (error) {
        console.log("Error converting doctorId to ObjectId for total appointments query:", error.message);
      }
    }

    console.log("Total appointments:", totalAppointments);

    // 3. Completed Appointments
    // Try with string doctorId first
    let completedAppointments = await AppointmentModel.countDocuments({
      doctorId: doctorId,
      status: 'completed',
      date: { $gte: startDate, $lte: endDate }
    });

    // If that doesn't work, try with ObjectId
    if (completedAppointments === 0) {
      try {
        const mongoose = require('mongoose');
        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
        completedAppointments = await AppointmentModel.countDocuments({
          doctorId: doctorObjectId,
          status: 'completed',
          date: { $gte: startDate, $lte: endDate }
        });
      } catch (error) {
        console.log("Error converting doctorId to ObjectId for completed appointments query:", error.message);
      }
    }

    console.log("Completed appointments:", completedAppointments);

    // 4. Pending Appointments
    // Try with string doctorId first
    let pendingAppointments = await AppointmentModel.countDocuments({
      doctorId: doctorId,
      status: { $in: ['scheduled', 'confirmed'] },
      date: { $gte: startDate, $lte: endDate }
    });

    // If that doesn't work, try with ObjectId
    if (pendingAppointments === 0) {
      try {
        const mongoose = require('mongoose');
        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
        pendingAppointments = await AppointmentModel.countDocuments({
          doctorId: doctorObjectId,
          status: { $in: ['scheduled', 'confirmed'] },
          date: { $gte: startDate, $lte: endDate }
        });
      } catch (error) {
        console.log("Error converting doctorId to ObjectId for pending appointments query:", error.message);
      }
    }

    console.log("Pending appointments:", pendingAppointments);

    // 5. Cancelled Appointments
    // Try with string doctorId first
    let cancelledAppointments = await AppointmentModel.countDocuments({
      doctorId: doctorId,
      status: 'cancelled',
      date: { $gte: startDate, $lte: endDate }
    });

    // If that doesn't work, try with ObjectId
    if (cancelledAppointments === 0) {
      try {
        const mongoose = require('mongoose');
        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
        cancelledAppointments = await AppointmentModel.countDocuments({
          doctorId: doctorObjectId,
          status: 'cancelled',
          date: { $gte: startDate, $lte: endDate }
        });
      } catch (error) {
        console.log("Error converting doctorId to ObjectId for cancelled appointments query:", error.message);
      }
    }

    console.log("Cancelled appointments:", cancelledAppointments);

    // 6. Total Revenue from completed appointments
    // Try with string doctorId first
    let revenueAggregation = await AppointmentModel.aggregate([
      {
        $match: {
          doctorId: doctorId,
          status: 'completed',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$finalAmount" }
        }
      }
    ]);

    // If that doesn't work, try with ObjectId
    if (revenueAggregation.length === 0) {
      try {
        const mongoose = require('mongoose');
        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
        
        revenueAggregation = await AppointmentModel.aggregate([
          {
            $match: {
              doctorId: doctorObjectId,
              status: 'completed',
              date: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$finalAmount" }
            }
          }
        ]);
      } catch (error) {
        console.log("Error converting doctorId to ObjectId for revenue query:", error.message);
      }
    }

    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue || 0 : 0;
    console.log("Total revenue:", totalRevenue);

    // 7. Today's Revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Try with string doctorId first
    let todayRevenueAggregation = await AppointmentModel.aggregate([
      {
        $match: {
          doctorId: doctorId,
          status: 'completed',
          date: { $gte: todayStart, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: null,
          todayRevenue: { $sum: "$finalAmount" }
        }
      }
    ]);

    // If that doesn't work, try with ObjectId
    if (todayRevenueAggregation.length === 0) {
      try {
        const mongoose = require('mongoose');
        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
        
        todayRevenueAggregation = await AppointmentModel.aggregate([
          {
            $match: {
              doctorId: doctorObjectId,
              status: 'completed',
              date: { $gte: todayStart, $lte: todayEnd }
            }
          },
          {
            $group: {
              _id: null,
              todayRevenue: { $sum: "$finalAmount" }
            }
          }
        ]);
      } catch (error) {
        console.log("Error converting doctorId to ObjectId for today's revenue query:", error.message);
      }
    }

    const todayRevenue = todayRevenueAggregation.length > 0 ? todayRevenueAggregation[0].todayRevenue || 0 : 0;
    console.log("Today's revenue:", todayRevenue);

    // 8. Average Consultation Time (duration field in appointments)
    // Try with string doctorId first
    let avgConsultationTimeAggregation = await AppointmentModel.aggregate([
      {
        $match: {
          doctorId: doctorId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$duration" }
        }
      }
    ]);

    // If that doesn't work, try with ObjectId
    if (avgConsultationTimeAggregation.length === 0) {
      try {
        const mongoose = require('mongoose');
        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
        
        avgConsultationTimeAggregation = await AppointmentModel.aggregate([
          {
            $match: {
              doctorId: doctorObjectId,
              date: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              avgDuration: { $avg: "$duration" }
            }
          }
        ]);
      } catch (error) {
        console.log("Error converting doctorId to ObjectId for avg consultation time query:", error.message);
      }
    }

    const averageConsultationTime = avgConsultationTimeAggregation.length > 0 ? avgConsultationTimeAggregation[0].avgDuration || 0 : 0;
    console.log("Average consultation time:", averageConsultationTime);

    // 9. Patient Satisfaction (average rating from reviews)
    // Try with string doctorId first
    let patientSatisfactionAggregation = await ReviewModel.aggregate([
      {
        $match: {
          doctorId: doctorId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" }
        }
      }
    ]);

    // If that doesn't work, try with ObjectId
    if (patientSatisfactionAggregation.length === 0) {
      try {
        const mongoose = require('mongoose');
        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
        
        patientSatisfactionAggregation = await ReviewModel.aggregate([
          {
            $match: {
              doctorId: doctorObjectId,
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              avgRating: { $avg: "$rating" }
            }
          }
        ]);
      } catch (error) {
        console.log("Error converting doctorId to ObjectId for patient satisfaction query:", error.message);
      }
    }

    const patientSatisfaction = patientSatisfactionAggregation.length > 0 ? patientSatisfactionAggregation[0].avgRating || 0 : 0;
    console.log("Patient satisfaction (avg rating):", patientSatisfaction);

    // 10. Top Services (services with most appointments)
    // Try with string doctorId first
    let topServicesAggregation = await AppointmentModel.aggregate([
      {
        $match: {
          doctorId: doctorId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$serviceId",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$finalAmount" }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // If that doesn't work, try with ObjectId
    if (topServicesAggregation.length === 0) {
      try {
        const mongoose = require('mongoose');
        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
        
        topServicesAggregation = await AppointmentModel.aggregate([
          {
            $match: {
              doctorId: doctorObjectId,
              date: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: "$serviceId",
              count: { $sum: 1 },
              totalRevenue: { $sum: "$finalAmount" }
            }
          },
          {
            $sort: { count: -1 }
          },
          {
            $limit: 5
          }
        ]);
      } catch (error) {
        console.log("Error converting doctorId to ObjectId for top services query:", error.message);
      }
    }

    console.log("Top services aggregation:", JSON.stringify(topServicesAggregation, null, 2));

    // 11. Recent Appointments
    // Try with string doctorId first
    let recentAppointments = await AppointmentModel.find({
      doctorId: doctorId,
      date: { $gte: startDate, $lte: endDate }
    })
    .sort({ date: -1 })
    .limit(5)
    .select('_id clientId serviceId date time status createdAt');

    // If that doesn't work, try with ObjectId
    if (recentAppointments.length === 0) {
      try {
        const mongoose = require('mongoose');
        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
        recentAppointments = await AppointmentModel.find({
          doctorId: doctorObjectId,
          date: { $gte: startDate, $lte: endDate }
        })
        .sort({ date: -1 })
        .limit(5)
        .select('_id clientId serviceId date time status createdAt');
      } catch (error) {
        console.log("Error converting doctorId to ObjectId for recent appointments query:", error.message);
      }
    }

    console.log("Recent appointments count:", recentAppointments.length);

    // Compile final metrics
    const metrics = {
      totalPatients,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      todayRevenue: parseFloat(todayRevenue.toFixed(2)),
      averageConsultationTime: parseFloat(averageConsultationTime.toFixed(2)),
      patientSatisfaction: parseFloat(patientSatisfaction.toFixed(2)),
      topServices: topServicesAggregation,
      recentAppointments: recentAppointments.map(app => ({
        id: app._id.toString(),
        patient: app.clientId, // In a real implementation, you'd populate client details
        service: app.serviceId, // In a real implementation, you'd populate service details
        date: app.date,
        time: app.time,
        status: app.status
      }))
    };

    console.log("Final doctor metrics:", JSON.stringify(metrics, null, 2));
    
    return NextResponse.json({
      success: true,
      data: metrics
    });
    
  } catch (error) {
    console.error("Error fetching doctor dashboard metrics:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Wrap the handler with auth middleware
export const GET = authMiddlewareCrm(getDoctorMetricsHandler);