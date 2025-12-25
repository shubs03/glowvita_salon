import { NextResponse } from "next/server";
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

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

// GET - Fetch completed appointments report
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
    
    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      const dateRange = getDateRanges(period);
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }
    
    // Base query for appointments
    const baseQuery = {
      vendorId: vendorId,
      date: { $gte: startDate, $lte: endDate }
    };
    
    // Apply status filter - if provided, use it; otherwise default to 'completed'
    if (statusFilter && statusFilter !== '') {
      baseQuery.status = statusFilter;
    } else {
      baseQuery.status = 'completed'; // Default to completed appointments
    }
    
    // Apply additional filters if provided
    if (clientFilter && clientFilter !== '') {
      baseQuery.clientName = clientFilter;
    }
    
    if (statusFilter && statusFilter !== '') {
      baseQuery.status = statusFilter;
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
    
    // Completed appointments (already filtered by status in baseQuery)
    let completedAppointments = allAppointments;
    
    // Handle completed appointments for both single and multi-service appointments
    const formattedCompletedAppointments = [];
    let totalRevenue = 0;
    let totalDuration = 0;
    
    completedAppointments.forEach(appt => {
      if (appt.isMultiService && appt.serviceItems && appt.serviceItems.length > 0) {
        // For multi-service appointments, create an entry for each service
        // But only include entries that match our filters
        appt.serviceItems.forEach(item => {
          const serviceName = item.service?.name || item.serviceName || 'Unknown Service';
          const staffName = item.staff?.fullName || item.staffName || 'Any Staff';
          
          // If service or staff filters are applied, only include matching items
          const matchesService = !serviceFilter || serviceFilter === '' || serviceName === serviceFilter;
          const matchesStaff = !staffFilter || staffFilter === '' || staffName === staffFilter;
          
          if (matchesService && matchesStaff) {
            formattedCompletedAppointments.push({
              id: appt._id,
              clientName: appt.clientName,
              serviceName: serviceName,
              staffName: staffName,
              date: appt.date,
              createdAt: appt.createdAt,
              startTime: item.startTime,
              endTime: item.endTime,
              duration: item.duration,
              amount: item.amount,
              totalAmount: appt.totalAmount,
              platformFee: appt.platformFee || 0,
              serviceTax: appt.serviceTax || 0,
              finalAmount: appt.finalAmount || appt.totalAmount || 0,
              status: appt.status,
              paymentStatus: appt.paymentStatus,
              mode: appt.mode, // Include the booking mode
              isMultiService: true,
              multiServiceIndex: appt.serviceItems.indexOf(item),
              multiServiceTotal: appt.serviceItems.length
            });
            totalRevenue += item.amount || 0;
            totalDuration += item.duration || 0;
          }
        });
      } else {
        // For single-service appointments
        const serviceName = appt.service?.name || appt.serviceName || 'Unknown Service';
        const staffName = appt.staff?.fullName || appt.staffName || 'Any Staff';
        
        // If service or staff filters are applied, only include matching appointments
        const matchesService = !serviceFilter || serviceFilter === '' || serviceName === serviceFilter;
        const matchesStaff = !staffFilter || staffFilter === '' || staffName === staffFilter;
        
        if (matchesService && matchesStaff) {
          formattedCompletedAppointments.push({
            id: appt._id,
            clientName: appt.clientName,
            serviceName: serviceName,
            staffName: staffName,
            date: appt.date,
            createdAt: appt.createdAt,
            startTime: appt.startTime,
            endTime: appt.endTime,
            duration: appt.duration,
            amount: appt.amount,
            totalAmount: appt.totalAmount,
            platformFee: appt.platformFee || 0,
            serviceTax: appt.serviceTax || 0,
            finalAmount: appt.finalAmount || appt.totalAmount || 0,
            status: appt.status,
            paymentStatus: appt.paymentStatus,
            mode: appt.mode, // Include the booking mode
            isMultiService: false
          });
          totalRevenue += appt.totalAmount || 0;
          totalDuration += appt.duration || 0;
        }
      }
    });
    
    const responseData = {
      complete: {
        total: completedAppointments.length,
        appointments: formattedCompletedAppointments,
        totalRevenue: totalRevenue,
        totalDuration: totalDuration
      }
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
    console.error("Error fetching completed appointments report:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
});