import { NextResponse } from "next/server";
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';
import { parseDate } from '../../../../../../utils/dateParser';

await _db();

// Helper function to calculate date ranges based on filter period
const getDateRanges = (period) => {
  const now = new Date();
  
  let startDate, endDate;
  
  if (period === 'day' || period === 'today') {
    // Today only
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (period === 'yesterday') {
    // Yesterday only
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
  } else if (period === 'week') {
    // Current week
    const dayOfWeek = now.getDay();
    startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek);
    startDate.setHours(0, 0, 0, 0);
    
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else if (period === 'month') {
    // Current month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === 'year') {
    // Current year
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else {
    // All time
    startDate = new Date(2020, 0, 1); // Default to beginning of 2020
    endDate = new Date(now.getFullYear() + 1, 0, 1, 23, 59, 59, 999);
  }
  
  return { startDate, endDate };
};

// GET - Fetch sales by service report
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const vendorId = req.user.userId.toString();
    const { searchParams } = new URL(req.url);
    
    // Get filter parameters
    const period = searchParams.get('period') || 'all';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const clientFilter = searchParams.get('client');
    const serviceFilter = searchParams.get('service');
    const staffFilter = searchParams.get('staff');
    const statusFilter = searchParams.get('status');
    const bookingTypeFilter = searchParams.get('bookingType');
    
    // Determine date range
    let startDate, endDate;
    
    // Handle special periods (today, yesterday) with proper date range
    if (period === 'today' || period === 'yesterday') {
      const dateRange = getDateRanges(period);
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    } else if (startDateParam && endDateParam) {
      // Handle ISO string dates from frontend for custom ranges
      startDate = parseDate(startDateParam);
      endDate = parseDate(endDateParam);
      
      // Ensure we're working with proper date objects
      if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        // Fallback to period-based dates if parsing fails
        const dateRange = getDateRanges(period);
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
      }
      
      // For same-day custom ranges (like today/yesterday sent from frontend),
      // ensure we capture the full day
      if (startDate.toDateString() === endDate.toDateString()) {
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);
      }
    } else {
      const dateRange = getDateRanges(period);
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }
    
    // Base query for appointments - only include completed appointments for sales reporting
    const baseQuery = {
      vendorId: vendorId,
      date: { $gte: startDate, $lte: endDate },
      status: 'completed' // Only include completed appointments in sales reports
    };
    
    // Apply additional filters if provided (except status, as we only want completed)
    if (clientFilter && clientFilter !== '') {
      baseQuery.clientName = clientFilter;
    }
    
    if (bookingTypeFilter && bookingTypeFilter !== '') {
      baseQuery.mode = bookingTypeFilter;
    }
    
    // Fetch all appointments within date range
    let allAppointments = await AppointmentModel.find(baseQuery)
      .populate({
        path: 'service',
        select: 'name',
        strictPopulate: false // Prevent errors if population fails
      })
      .populate({
        path: 'staff',
        select: 'fullName',
        strictPopulate: false // Prevent errors if population fails
      })
      .populate({
        path: 'serviceItems.service',
        select: 'name',
        strictPopulate: false // Prevent errors if population fails
      })
      .populate({
        path: 'serviceItems.staff',
        select: 'fullName',
        strictPopulate: false // Prevent errors if population fails
      })
      .sort({ date: 1 });
    
    // Apply service filter if provided
    if (serviceFilter && serviceFilter !== '') {
      allAppointments = allAppointments.filter(appt => {
        if (appt.isMultiService && appt.serviceItems && appt.serviceItems.length > 0) {
          // For multi-service appointments, check if any service matches
          return appt.serviceItems.some(item => 
            (item.service?.name || item.serviceName) === serviceFilter
          );
        } else {
          // For single-service appointments
          return (appt.service?.name || appt.serviceName) === serviceFilter;
        }
      });
    }
    
    // Apply staff filter if provided
    if (staffFilter && staffFilter !== '') {
      allAppointments = allAppointments.filter(appt => {
        if (appt.isMultiService && appt.serviceItems && appt.serviceItems.length > 0) {
          // For multi-service appointments, check if any staff matches
          return appt.serviceItems.some(item => 
            (item.staff?.fullName || item.staffName) === staffFilter
          );
        } else {
          // For single-service appointments
          return (appt.staff?.fullName || appt.staffName) === staffFilter;
        }
      });
    }
    
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
    
    const responseData = {
      salesByService: salesByServiceArray
    };
    
    return NextResponse.json({
      success: true,
      data: responseData,
      filters: {
        period,
        startDate,
        endDate,
        client: clientFilter || null,
        service: serviceFilter || null,
        staff: staffFilter || null,
        status: statusFilter || null,
        bookingType: bookingTypeFilter || null
      }
    });
    
  } catch (error) {
    console.error("Error fetching sales by service report:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
});