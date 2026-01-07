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
    const baseQuery = {
      vendorId: vendorId,
      date: { $gte: startDate, $lte: endDate },
      status: 'completed' // Only include completed appointments in sales reports
    };
    
    // Log the query for debugging
    console.log('Top Services Query:', JSON.stringify(baseQuery, null, 2));
    
    // Fetch all appointments within date range
    let allAppointments = await AppointmentModel.find(baseQuery)
      .populate({
        path: 'service',
        select: 'name',
        strictPopulate: false // Prevent errors if population fails
      })
      .populate({
        path: 'serviceItems.service',
        select: 'name',
        strictPopulate: false // Prevent errors if population fails
      });
    
    // Log the number of appointments found
    console.log('Number of appointments found:', allAppointments.length);
    
    // Sales by service with enhanced financial details
    const salesByService = {};
    
    allAppointments.forEach(appt => {
      // Handle multi-service appointments
      if (appt.isMultiService && appt.serviceItems && appt.serviceItems.length > 0) {
        // Add each service item to the sales summary
        appt.serviceItems.forEach(item => {
          const serviceName = item.service?.name || item.serviceName || 'Unknown Service';
          if (!salesByService[serviceName]) {
            salesByService[serviceName] = {
              serviceSold: 0,
              grossSale: 0,
              discounts: 0,
              offers: 0,
              netSale: 0,
              tax: 0,
              totalSales: 0
            };
          }
          
          // For multi-service appointments, count each service item separately
          salesByService[serviceName].serviceSold += 1;
          salesByService[serviceName].grossSale += item.amount || 0;
          // For individual service items, we don't have separate discount/offer data
          // So we'll aggregate at the appointment level
          salesByService[serviceName].totalSales += item.amount || 0;
        });
      } else {
        // Handle single-service appointments
        const serviceName = appt.service?.name || appt.serviceName || 'Unknown Service';
        if (!salesByService[serviceName]) {
          salesByService[serviceName] = {
            serviceSold: 0,
            grossSale: 0,
            discounts: 0,
            offers: 0,
            netSale: 0,
            tax: 0,
            totalSales: 0
          };
        }
        
        salesByService[serviceName].serviceSold += 1;
        salesByService[serviceName].grossSale += appt.amount || 0;
        salesByService[serviceName].discounts += appt.discountAmount || 0;
        // Assuming offers are represented by discountAmount for now
        salesByService[serviceName].offers += appt.discountAmount || 0;
        salesByService[serviceName].netSale += (appt.amount - (appt.discountAmount || 0)) || 0;
        salesByService[serviceName].tax += appt.serviceTax || 0;
        salesByService[serviceName].totalSales += appt.totalAmount || 0;
      }
    });
    
    // Adjust for multi-service appointments by distributing appointment-level values
    allAppointments.forEach(appt => {
      if (appt.isMultiService && appt.serviceItems && appt.serviceItems.length > 0) {
        // Distribute appointment-level financials proportionally across service items
        const totalItemAmount = appt.serviceItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        
        appt.serviceItems.forEach(item => {
          const serviceName = item.service?.name || item.serviceName || 'Unknown Service';
          const itemProportion = totalItemAmount > 0 ? (item.amount || 0) / totalItemAmount : 0;
          
          // Distribute appointment-level values proportionally
          salesByService[serviceName].discounts += (appt.discountAmount || 0) * itemProportion;
          salesByService[serviceName].offers += (appt.discountAmount || 0) * itemProportion;
          salesByService[serviceName].netSale += ((item.amount || 0) - ((appt.discountAmount || 0) * itemProportion)) || 0;
          salesByService[serviceName].tax += (appt.serviceTax || 0) * itemProportion;
        });
      }
    });
    
    // Convert to array and sort by total sales amount
    const salesByServiceArray = Object.keys(salesByService).map(serviceName => ({
      service: serviceName,
      serviceSold: salesByService[serviceName].serviceSold,
      grossSale: parseFloat(salesByService[serviceName].grossSale.toFixed(2)),
      discounts: parseFloat(salesByService[serviceName].discounts.toFixed(2)),
      offers: parseFloat(salesByService[serviceName].offers.toFixed(2)),
      netSale: parseFloat(salesByService[serviceName].netSale.toFixed(2)),
      tax: parseFloat(salesByService[serviceName].tax.toFixed(2)),
      totalSales: parseFloat(salesByService[serviceName].totalSales.toFixed(2))
    })).sort((a, b) => b.totalSales - a.totalSales);
    
    // Return top 5 services
    const topServices = salesByServiceArray.slice(0, 5);
    
    // Log the results for debugging
    console.log('Top Services data:', JSON.stringify(topServices, null, 2));
    
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