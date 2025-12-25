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

// GET - Fetch cancelled appointments report
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
    
    // Appointment cancellations
    const cancelledAppointments = allAppointments.filter(appt => appt.status === 'cancelled');
    
    // Handle cancellations for both single and multi-service appointments
    const formattedCancellations = [];
    let totalRevenueLoss = 0;
    
    cancelledAppointments.forEach(appt => {
      if (appt.isMultiService && appt.serviceItems && appt.serviceItems.length > 0) {
        // For multi-service appointments, create an entry for each service
        // But only include entries that match our filters
        appt.serviceItems.forEach(item => {
          const serviceName = item.service?.name || item.serviceName || 'Unknown Service';
          const staffName = item.staffName || appt.staffName || 'N/A';
          
          // If service or staff filters are applied, only include matching items
          const matchesService = !serviceFilter || serviceFilter === '' || serviceName === serviceFilter;
          const matchesStaff = !staffFilter || staffFilter === '' || staffName === staffFilter;
          
          if (matchesService && matchesStaff) {
            // Extract cancellation reason from notes if cancellationReason is not available
            let cancellationReason = appt.cancellationReason || 'Not specified';
            if (appt.notes && !appt.cancellationReason) {
              // Extract reason from notes format: "[timestamp] Appointment cancelled: reason"
              const notesMatch = appt.notes.match(/\[.*\]\s*Appointment cancelled: (.+?)(?:\n|$)/);
              if (notesMatch && notesMatch[1]) {
                cancellationReason = notesMatch[1].trim();
              } else if (appt.notes.includes('Appointment cancelled:')) {
                // Handle alternative format
                const altMatch = appt.notes.match(/Appointment cancelled: (.+?)(?:\n|$)/);
                if (altMatch && altMatch[1]) {
                  cancellationReason = altMatch[1].trim();
                }
              }
            }
            
            // Determine who cancelled the appointment based on available information
            let cancelledBy = 'Unknown';
            if (appt.mode === 'online') {
              cancelledBy = appt.clientName || 'Client';
            } else {
              cancelledBy = 'Vendor/Staff';
            }
            
            formattedCancellations.push({
              id: appt._id,
              clientName: appt.clientName,
              serviceName: serviceName,
              staffName: staffName,
              scheduledDate: appt.date,
              cancelledDate: appt.updatedAt || appt.createdAt,
              cancelledBy: cancelledBy,
              createdAt: appt.createdAt,
              startTime: item.startTime,
              amount: item.amount,
              platformFee: appt.platformFee || 0,
              serviceTax: appt.serviceTax || 0,
              finalAmount: appt.finalAmount || appt.totalAmount || 0,
              reason: cancellationReason,
              mode: appt.mode, // Include the booking mode
              isMultiService: true
            });
            totalRevenueLoss += item.amount || 0;
          }
        });
      } else {
        // For single-service appointments
        const serviceName = appt.service?.name || appt.serviceName || 'Unknown Service';
        const staffName = appt.staffName || 'N/A';
        
        // If service or staff filters are applied, only include matching appointments
        const matchesService = !serviceFilter || serviceFilter === '' || serviceName === serviceFilter;
        const matchesStaff = !staffFilter || staffFilter === '' || staffName === staffFilter;
        
        if (matchesService && matchesStaff) {
          // Extract cancellation reason from notes if cancellationReason is not available
          let cancellationReason = appt.cancellationReason || 'Not specified';
          if (appt.notes && !appt.cancellationReason) {
            // Extract reason from notes format: "[timestamp] Appointment cancelled: reason"
            const notesMatch = appt.notes.match(/\[.*\]\s*Appointment cancelled: (.+?)(?:\n|$)/);
            if (notesMatch && notesMatch[1]) {
              cancellationReason = notesMatch[1].trim();
            } else if (appt.notes.includes('Appointment cancelled:')) {
              // Handle alternative format
              const altMatch = appt.notes.match(/Appointment cancelled: (.+?)(?:\n|$)/);
              if (altMatch && altMatch[1]) {
                cancellationReason = altMatch[1].trim();
              }
            }
          }
          
          // Determine who cancelled the appointment based on available information
          let cancelledBy = 'Unknown';
          if (appt.mode === 'online') {
            cancelledBy = appt.clientName || 'Client';
          } else {
            cancelledBy = 'Vendor/Staff';
          }
          
          formattedCancellations.push({
            id: appt._id,
            clientName: appt.clientName,
            serviceName: serviceName,
            staffName: staffName,
            scheduledDate: appt.date,
            cancelledDate: appt.updatedAt || appt.createdAt,
            cancelledBy: cancelledBy,
            createdAt: appt.createdAt,
            startTime: appt.startTime,
            amount: appt.totalAmount,
            platformFee: appt.platformFee || 0,
            serviceTax: appt.serviceTax || 0,
            finalAmount: appt.finalAmount || appt.totalAmount || 0,
            reason: cancellationReason,
            mode: appt.mode, // Include the booking mode
            isMultiService: false
          });
          totalRevenueLoss += appt.totalAmount || 0;
        }
      }
    });
    
    const cancellationStats = {
      totalCancelled: cancelledAppointments.length,
      revenueLoss: totalRevenueLoss,
      cancellations: formattedCancellations
    };
    
    const responseData = {
      cancellations: cancellationStats
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
    console.error("Error fetching cancelled appointments report:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
});