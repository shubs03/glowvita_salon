import { NextResponse } from "next/server";
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorSettlementPaymentModel from '@repo/lib/models/Vendor/VendorSettlementPayment.model';
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

// GET - Fetch settlement summary report
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const userId = req.user.userId.toString();
    const userRole = req.user.role;

    // Determine the actual vendorId: staff members belong to a vendor
    let vendorId = userId;
    if (userRole === 'staff') {
      const StaffModel = (await import('@repo/lib/models/Vendor/Staff.model')).default;
      const staffMember = await StaffModel.findById(userId);
      if (staffMember && staffMember.vendorId) {
        vendorId = staffMember.vendorId.toString();
      } else {
        return NextResponse.json(
          { success: false, message: "Vendor not found for staff member" },
          { status: 403 }
        );
      }
    }

    const { searchParams } = new URL(req.url);

    // Get filter parameters
    const period = searchParams.get('period') || 'all';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const settlementFromDateParam = searchParams.get('settlementFromDate');
    const settlementToDateParam = searchParams.get('settlementToDate');
    const clientFilter = searchParams.get('client');
    const serviceFilter = searchParams.get('service');
    const staffFilter = searchParams.get('staff');
    const statusFilter = searchParams.get('status');
    const bookingTypeFilter = searchParams.get('bookingType');

    // Determine date range for appointments
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

    // Determine settlement date range for filtering
    let settlementStartDate, settlementEndDate;
    if (settlementFromDateParam && settlementToDateParam) {
      settlementStartDate = parseDate(settlementFromDateParam);
      settlementEndDate = parseDate(settlementToDateParam);

      // Ensure we're working with proper date objects
      if (!settlementStartDate || !settlementEndDate ||
        isNaN(settlementStartDate.getTime()) || isNaN(settlementEndDate.getTime())) {
        settlementStartDate = startDate;
        settlementEndDate = endDate;
      }
    } else {
      settlementStartDate = startDate;
      settlementEndDate = endDate;
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

    // For settlement summary report, only include appointments where money actually exchanged hands:
    // - Pay Online: client paid platform via Razorpay → paymentStatus must be 'completed'
    // - Pay at Salon: client paid vendor in cash → paymentStatus is never auto-set, use status:'completed'
    if (!statusFilter || statusFilter === '') {
      // No status filter from UI — default to completed appointments
      baseQuery.status = 'completed';
      baseQuery.$or = [
        { paymentMethod: 'Pay Online', paymentStatus: 'completed' },
        { paymentMethod: 'Pay at Salon' }
      ];
    } else {
      // User selected a specific status — respect it, but still apply paymentMethod logic
      baseQuery.$or = [
        { paymentMethod: 'Pay Online', paymentStatus: 'completed' },
        { paymentMethod: 'Pay at Salon' }
      ];
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

    // Fetch Recorded Transfers (Payments)
    const transfers = await VendorSettlementPaymentModel.find({
      vendorId: vendorId,
      paymentDate: { $gte: startDate, $lte: endDate }
    }).sort({ paymentDate: 1 });

    // Process appointments to create settlement summary data
    // This is a simplified version - in a real implementation, you'd need to connect
    // to actual settlement data which may be stored in a separate collection
    const settlementAppointments = [];
    let totalAppointments = 0;
    let totalGrossServiceAmount = 0;
    let totalDiscountAmount = 0;
    let totalPlatformFee = 0;
    let totalTaxAmount = 0;
    let totalNetServiceAmount = 0;
    let totalVendorEarning = 0;
    let totalSalonCommission = 0;

    // Initialize totals for scenarios
    let totalAdminOwesVendor = 0;
    let totalVendorOwesAdmin = 0;
    let totalVendorReceived = 0;
    let totalPlatformReceived = 0;

    allAppointments.forEach(appt => {
      // Handle multi-service appointments
      if (appt.isMultiService && appt.serviceItems && appt.serviceItems.length > 0) {
        appt.serviceItems.forEach((item, index) => {
          const receivedBy = appt.paymentMethod === 'Pay Online' ? 'Platform' : 'Vendor';
          const adminOwesVendor = appt.paymentMethod === 'Pay Online' ? (item.amount || 0) : 0;
          const vendorOwesAdmin = appt.paymentMethod === 'Pay at Salon' ? (appt.platformFee || 0) + (appt.serviceTax || 0) : 0;
          const finalAmt = appt.finalAmount || appt.totalAmount || 0;

          const settlementAppointment = {
            settlementFromDate: settlementStartDate,
            settlementToDate: settlementEndDate,
            settlementDate: appt.updatedAt || appt.createdAt,
            settlementId: `SETTLEMENT_${appt._id}_${index}`,
            appointmentId: appt._id.toString(),
            date: appt.date,
            serviceName: item.service?.name || item.serviceName || 'Unknown Service',
            staffId: item.staff?._id || appt.staffId || 'N/A',
            staffName: item.staff?.fullName || appt.staffName || 'N/A',
            clientName: appt.clientName || 'N/A',
            startTime: appt.startTime || 'N/A',
            endTime: appt.endTime || 'N/A',
            duration: appt.duration || 0,

            amount: item.amount || 0,
            discountAmount: appt.discountAmount || 0,
            totalAmount: appt.totalAmount || 0,
            platformFee: appt.platformFee || 0,
            serviceTax: appt.serviceTax || 0,
            taxRate: appt.taxRate || 0,
            finalAmount: finalAmt,

            receivedBy,
            adminOwesVendor,
            vendorOwesAdmin,
            vendorAmountHandled: appt.paymentMethod === 'Pay at Salon' ? finalAmt : 0,
            platformAmountHandled: appt.paymentMethod === 'Pay Online' ? finalAmt : 0,

            grossServiceAmount: item.amount || 0,
            netServiceAmount: (item.amount || 0) - (appt.discountAmount || 0) + (appt.serviceTax || 0),
            vendorCommissionRate: appt.vendorCommissionRate || 0.7,
            vendorServiceEarning: (item.amount || 0) * (appt.vendorCommissionRate || 0.7),
            salonCommissionAmount: (item.amount || 0) * (1 - (appt.vendorCommissionRate || 0.7)),

            amountPaid: appt.amountPaid || 0,
            amountRemaining: (appt.totalAmount || 0) - (appt.amountPaid || 0),
            paymentMethod: appt.paymentMethod || 'N/A',
            paymentStatus: appt.paymentStatus || 'N/A',
            mode: appt.mode || 'N/A',
            paymentDate: appt.paymentDate || null,
          };

          settlementAppointments.push(settlementAppointment);

          // Update totals
          totalGrossServiceAmount += settlementAppointment.grossServiceAmount;
          totalDiscountAmount += settlementAppointment.discountAmount;
          totalPlatformFee += settlementAppointment.platformFee;
          totalTaxAmount += settlementAppointment.serviceTax;
          totalNetServiceAmount += settlementAppointment.netServiceAmount;
          totalVendorEarning += settlementAppointment.vendorServiceEarning;
          totalSalonCommission += settlementAppointment.salonCommissionAmount;

          totalAdminOwesVendor += adminOwesVendor;
          totalVendorOwesAdmin += vendorOwesAdmin;
          if (appt.paymentMethod === 'Pay at Salon') totalVendorReceived += item.amount;
          if (appt.paymentMethod === 'Pay Online') totalPlatformReceived += item.amount;
        });
      } else {
        // Handle single-service appointments
        const receivedBy = appt.paymentMethod === 'Pay Online' ? 'Platform' : 'Vendor';
        // For Pay Online: admin collected the money, owes vendor the service amount (totalAmount)
        const adminOwesVendor = appt.paymentMethod === 'Pay Online' ? (appt.totalAmount || 0) : 0;
        const vendorOwesAdmin = appt.paymentMethod === 'Pay at Salon' ? (appt.platformFee || 0) + (appt.serviceTax || 0) : 0;
        const finalAmt = appt.finalAmount || appt.totalAmount || 0;

        const settlementAppointment = {
          settlementFromDate: settlementStartDate,
          settlementToDate: settlementEndDate,
          settlementDate: appt.updatedAt || appt.createdAt,
          settlementId: `SETTLEMENT_${appt._id}`,
          appointmentId: appt._id.toString(),
          date: appt.date,
          serviceName: appt.service?.name || appt.serviceName || 'Unknown Service',
          staffId: appt.staffId || 'N/A',
          staffName: appt.staff?.fullName || appt.staffName || 'N/A',
          clientName: appt.clientName || 'N/A',
          startTime: appt.startTime || 'N/A',
          endTime: appt.endTime || 'N/A',
          duration: appt.duration || 0,

          amount: appt.amount || 0,
          discountAmount: appt.discountAmount || 0,
          totalAmount: appt.totalAmount || 0,
          platformFee: appt.platformFee || 0,
          serviceTax: appt.serviceTax || 0,
          taxRate: appt.taxRate || 0,
          finalAmount: finalAmt,

          receivedBy,
          adminOwesVendor,
          vendorOwesAdmin,
          vendorAmountHandled: appt.paymentMethod === 'Pay at Salon' ? finalAmt : 0,
          platformAmountHandled: appt.paymentMethod === 'Pay Online' ? finalAmt : 0,

          grossServiceAmount: appt.amount || 0,
          netServiceAmount: (appt.amount || 0) - (appt.discountAmount || 0) + (appt.serviceTax || 0),
          vendorCommissionRate: appt.vendorCommissionRate || 0.7,
          vendorServiceEarning: (appt.amount || 0) * (appt.vendorCommissionRate || 0.7),
          salonCommissionAmount: (appt.amount || 0) * (1 - (appt.vendorCommissionRate || 0.7)),

          amountPaid: appt.amountPaid || 0,
          amountRemaining: (appt.totalAmount || 0) - (appt.amountPaid || 0),
          paymentMethod: appt.paymentMethod || 'N/A',
          paymentStatus: appt.paymentStatus || 'N/A',
          mode: appt.mode || 'N/A',
          paymentDate: appt.paymentDate || null,
        };

        settlementAppointments.push(settlementAppointment);

        // Update totals
        totalGrossServiceAmount += settlementAppointment.grossServiceAmount;
        totalDiscountAmount += settlementAppointment.discountAmount;
        totalPlatformFee += settlementAppointment.platformFee;
        totalTaxAmount += settlementAppointment.serviceTax;
        totalNetServiceAmount += settlementAppointment.netServiceAmount;
        totalVendorEarning += settlementAppointment.vendorServiceEarning;
        totalSalonCommission += settlementAppointment.salonCommissionAmount;

        totalAdminOwesVendor += adminOwesVendor;
        totalVendorOwesAdmin += vendorOwesAdmin;
        if (appt.paymentMethod === 'Pay at Salon') totalVendorReceived += appt.amount;
        if (appt.paymentMethod === 'Pay Online') totalPlatformReceived += appt.amount;
      }

      totalAppointments++;
    });

    // Process Transfers
    let totalTransferredToVendor = 0;
    let totalTransferredToAdmin = 0;

    transfers.forEach(t => {
      if (t.type === "Payment to Vendor") totalTransferredToVendor += t.amount;
      if (t.type === "Payment to Admin") totalTransferredToAdmin += t.amount;
    });

    // Calculate final net settlement
    const netSettlement = totalAdminOwesVendor - totalVendorOwesAdmin;
    const finalBalance = netSettlement - (totalTransferredToVendor - totalTransferredToAdmin);

    const responseData = {
      settlementSummary: {
        appointments: settlementAppointments,
        transfers: transfers,
        totals: {
          totalAppointments,
          totalGrossServiceAmount,
          totalDiscountAmount,
          totalPlatformFee,
          totalTaxAmount,
          totalNetServiceAmount,
          totalVendorEarning,
          totalSalonCommission,
          totalAdminOwesVendor,
          totalVendorOwesAdmin,
          totalVendorReceived,
          totalPlatformReceived,
          totalTransferredToVendor,
          totalTransferredToAdmin,
          netSettlement,
          finalBalance
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      filters: {
        period,
        startDate,
        endDate,
        settlementFromDate: settlementStartDate,
        settlementToDate: settlementEndDate,
        client: clientFilter || null,
        service: serviceFilter || null,
        staff: staffFilter || null,
        status: statusFilter || null,
        bookingType: bookingTypeFilter || null
      }
    });

  } catch (error) {
    console.error("Error fetching settlement summary report:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
});