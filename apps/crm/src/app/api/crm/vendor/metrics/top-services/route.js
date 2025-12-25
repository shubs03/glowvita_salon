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
    // All time (last 7 months)
    startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
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

// Helper function to get top services for a vendor
async function getTopServicesHandler(request) {
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
    
    // Try querying with string vendorId first
    let matchCondition = {
      vendorId: vendorId,
      $or: [
        { status: 'completed' },
        { paymentStatus: 'completed' },
        { paymentStatus: 'paid' }
      ],
      date: { $gte: startDate, $lte: endDate }
    };
    
    // Aggregate to get top services based on completed appointments
    let topServices = await AppointmentModel.aggregate([
      {
        $match: matchCondition
      },
      {
        $unwind: "$serviceItems"
      },
      {
        $group: {
          _id: "$serviceItems.serviceName",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: "$count"
        }
      }
    ]);
    
    // Log the results for debugging
    console.log("Top services data:", JSON.stringify(topServices, null, 2));
    
    // If no services found with string vendorId, try with ObjectId
    if (topServices.length === 0) {
      try {
        const mongoose = require('mongoose');
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        matchCondition.vendorId = vendorObjectId;
        
        topServices = await AppointmentModel.aggregate([
          {
            $match: matchCondition
          },
          {
            $unwind: "$serviceItems"
          },
          {
            $group: {
              _id: "$serviceItems.serviceName",
              count: { $sum: 1 }
            }
          },
          {
            $sort: { count: -1 }
          },
          {
            $limit: 10
          },
          {
            $project: {
              _id: 0,
              name: "$_id",
              value: "$count"
            }
          }
        ]);
        
        // Log the results for debugging
        console.log("Top services data (ObjectId):", JSON.stringify(topServices, null, 2));
      } catch (objectIdError) {
        console.log("Could not convert vendorId to ObjectId:", objectIdError.message);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: topServices
    });
    
  } catch (error) {
    console.error("Error fetching top services:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Wrap the handler with auth middleware
export const GET = authMiddlewareCrm(getTopServicesHandler);