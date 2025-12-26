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

// Helper function to get sales data based on filter period
async function getSalesDataHandler(request) {
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
    
    // Aggregate to get monthly sales data
    let salesData = await AppointmentModel.aggregate([
      {
        $match: matchCondition
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          totalSales: { $sum: "$finalAmount" },
          appointmentCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalSales: 1,
          appointmentCount: 1
        }
      }
    ]);
    
    // If no data found with string vendorId, try with ObjectId
    if (salesData.length === 0) {
      try {
        const mongoose = require('mongoose');
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        matchCondition.vendorId = vendorObjectId;
        
        salesData = await AppointmentModel.aggregate([
          {
            $match: matchCondition
          },
          {
            $group: {
              _id: {
                year: { $year: "$date" },
                month: { $month: "$date" }
              },
              totalSales: { $sum: "$finalAmount" },
              appointmentCount: { $sum: 1 }
            }
          },
          {
            $sort: { "_id.year": 1, "_id.month": 1 }
          },
          {
            $project: {
              _id: 0,
              year: "$_id.year",
              month: "$_id.month",
              totalSales: 1,
              appointmentCount: 1
            }
          }
        ]);
      } catch (objectIdError) {
        console.log("Could not convert vendorId to ObjectId:", objectIdError.message);
      }
    }
    
    // Format the data for the chart
    const formattedData = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // For day filter, we show today's data
    if (period === 'day') {
      // Get today's date
      const today = new Date();
      const todayData = salesData.filter(d => 
        d.year === today.getFullYear() && 
        d.month === (today.getMonth() + 1)
      );
      
      formattedData.push({
        name: "Today",
        sales: todayData.reduce((sum, d) => sum + Math.round(d.totalSales), 0),
        appointments: todayData.reduce((sum, d) => sum + d.appointmentCount, 0)
      });
    } 
    // For month filter, we show daily data for the current month
    else if (period === 'month') {
      // For simplicity, we'll still show monthly data but label it as current month
      formattedData.push({
        name: monthNames[new Date().getMonth()],
        sales: salesData.reduce((sum, d) => sum + Math.round(d.totalSales), 0),
        appointments: salesData.reduce((sum, d) => sum + d.appointmentCount, 0)
      });
    }
    // For custom date range, we aggregate all data
    else if (startDateParam && endDateParam) {
      // For custom date ranges, we show aggregated data
      formattedData.push({
        name: "Selected Period",
        sales: salesData.reduce((sum, d) => sum + Math.round(d.totalSales), 0),
        appointments: salesData.reduce((sum, d) => sum + d.appointmentCount, 0)
      });
    }
    // For year or all time, we show monthly data
    else {
      // Create an array of the last 7 months (for all time) or current year months
      const monthsToShow = period === 'all' ? 7 : 12;
      const currentDate = new Date();
      
      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = period === 'all' 
          ? new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
          : new Date(currentDate.getFullYear(), i, 1);
          
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        // Find data for this month or default to 0
        const monthData = salesData.find(d => d.year === year && d.month === month);
        
        formattedData.push({
          name: monthNames[month - 1],
          sales: monthData ? Math.round(monthData.totalSales) : 0,
          appointments: monthData ? monthData.appointmentCount : 0
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      data: formattedData
    });
    
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Wrap the handler with auth middleware
export const GET = authMiddlewareCrm(getSalesDataHandler);