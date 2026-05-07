import { NextResponse } from "next/server";
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorServicesModel from '@repo/lib/models/Vendor/VendorServices.model';
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
    
    // Fetch vendor services to get original prices for accurate Gross Sale calculation
    const vendorServicesDoc = await VendorServicesModel.findOne({ vendor: vendorId }).lean();
    const servicePriceMap = {};
    const serviceNamePriceMap = {}; // Fallback mapping by name
    
    if (vendorServicesDoc && vendorServicesDoc.services) {
      vendorServicesDoc.services.forEach(s => {
        const price = s.price || 0;
        // Use the base price as the "Gross" price
        servicePriceMap[s._id.toString()] = price;
        serviceNamePriceMap[s.name] = price;
      });
    }

    // Fetch all appointments within date range
    let allAppointments = await AppointmentModel.find(baseQuery)
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
      // Get appointment-level financials for distribution
      const appointmentDiscountAmount = appt.discountAmount || 0;
      const appointmentTax = appt.serviceTax || 0;
      const appointmentFinalAmount = appt.finalAmount || 0;
      const isCouponUsed = !!appt.couponCode;

      // Handle multi-service appointments
      if (appt.isMultiService && appt.serviceItems && appt.serviceItems.length > 0) {
        // Calculate the "actual value" (Original Price + Add-ons) for each item
        const itemsWithFinancials = appt.serviceItems.map(item => {
          const serviceId = (item.service?._id || item.service)?.toString();
          const serviceName = item.service?.name || item.serviceName || 'Unknown Service';
          const originalPrice = servicePriceMap[serviceId] || serviceNamePriceMap[serviceName] || item.amount || 0;
          const itemAddOnsAmount = (item.addOns || []).reduce((sum, addon) => sum + (addon.price || 0), 0);
          
          const itemGrossSale = originalPrice + itemAddOnsAmount;
          const itemImplicitDiscount = Math.max(0, originalPrice - (item.amount || 0));
          
          return {
            ...item.toObject(),
            itemGrossSale,
            itemImplicitDiscount,
            serviceName: item.service?.name || item.serviceName || 'Unknown Service'
          };
        });

        // Total "Actual Value" (Appt Amount + Add-ons) for proportional distribution of appt-level discount/tax
        const totalApptValue = appt.serviceItems.reduce((sum, item) => {
          const itemAddOnsAmount = (item.addOns || []).reduce((s, a) => s + (a.price || 0), 0);
          return sum + (item.amount || 0) + itemAddOnsAmount;
        }, 0);

        itemsWithFinancials.forEach(item => {
          const serviceName = item.serviceName;
          
          // If service filter is applied, only include the matching service
          if (serviceFilter && serviceFilter !== '' && serviceName !== serviceFilter) {
            return;
          }
          
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
          
          // Proportion based on the amount recorded in the appointment (for distributing final taxes/coupons)
          const itemApptValue = (item.amount || 0) + (item.addOns || []).reduce((s, a) => s + (a.price || 0), 0);
          const itemProportion = totalApptValue > 0 ? itemApptValue / totalApptValue : 0;
          
          const itemCouponOffer = appointmentDiscountAmount * itemProportion;
          const itemTax = appointmentTax * itemProportion;
          const itemFinalAmount = appointmentFinalAmount * itemProportion;

          salesByService[serviceName].serviceSold += 1;
          salesByService[serviceName].grossSale += item.itemGrossSale;
          
          // Implicit discounts (from service model) are always categorized as 'discounts'
          // Coupon/Offer discounts are categorized based on isCouponUsed
          salesByService[serviceName].discounts += item.itemImplicitDiscount;
          
          if (isCouponUsed) {
            salesByService[serviceName].offers += itemCouponOffer;
          } else {
            salesByService[serviceName].discounts += itemCouponOffer;
          }
          
          const totalItemDiscount = item.itemImplicitDiscount + itemCouponOffer;
          salesByService[serviceName].netSale += (item.itemGrossSale - totalItemDiscount);
          salesByService[serviceName].tax += itemTax;
          salesByService[serviceName].totalSales += itemFinalAmount;
        });
      } else {
        // Handle single-service appointments
        const serviceName = appt.service?.name || appt.serviceName || 'Unknown Service';
        const serviceId = (appt.service?._id || appt.service)?.toString();
        
        // If service filter is applied, only include the matching service
        if (serviceFilter && serviceFilter !== '' && serviceName !== serviceFilter) {
          return;
        }
        
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
        
        // Calculate original price vs recorded amount
        const originalPrice = servicePriceMap[serviceId] || serviceNamePriceMap[serviceName] || appt.amount || 0;
        const addOnsAmount = appt.addOnsAmount || 0;
        
        const grossSale = originalPrice + addOnsAmount;
        const implicitDiscount = Math.max(0, originalPrice - (appt.amount || 0));

        salesByService[serviceName].serviceSold += 1;
        salesByService[serviceName].grossSale += grossSale;
        
        // Categories
        salesByService[serviceName].discounts += implicitDiscount;
        if (isCouponUsed) {
          salesByService[serviceName].offers += appointmentDiscountAmount;
        } else {
          salesByService[serviceName].discounts += appointmentDiscountAmount;
        }
        
        const totalDiscount = implicitDiscount + appointmentDiscountAmount;
        salesByService[serviceName].netSale += (grossSale - totalDiscount);
        salesByService[serviceName].tax += appointmentTax;
        salesByService[serviceName].totalSales += appointmentFinalAmount;
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