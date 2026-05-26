import { NextResponse } from "next/server";
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorServicesModel from '@repo/lib/models/Vendor/VendorServices.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';
import { parseDate } from '../../../../../../utils/dateParser';

await _db();

// Helper function to calculate date ranges based on filter period
const getDateRanges = (period) => {
  const now = new Date();
  
  let startDate, endDate;
  
  if (period === 'day' || period === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (period === 'yesterday') {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
  } else if (period === 'week') {
    const dayOfWeek = now.getDay();
    startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else {
    startDate = new Date(2020, 0, 1);
    endDate = new Date(now.getFullYear() + 1, 0, 1, 23, 59, 59, 999);
  }
  
  return { startDate, endDate };
};

export const GET = authMiddlewareCrm(async (req) => {
  try {
    const vendorId = req.user.userId.toString();
    const { searchParams } = new URL(req.url);
    
    const period = searchParams.get('period') || 'all';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const clientFilter = searchParams.get('client');
    const serviceFilter = searchParams.get('service');
    const staffFilter = searchParams.get('staff');
    const bookingTypeFilter = searchParams.get('bookingType');
    
    let startDate, endDate;
    
    if (period === 'today' || period === 'yesterday') {
      const dateRange = getDateRanges(period);
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    } else if (startDateParam && endDateParam) {
      startDate = parseDate(startDateParam);
      endDate = parseDate(endDateParam);
      if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        const dateRange = getDateRanges(period);
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
      }
      if (startDate.toDateString() === endDate.toDateString()) {
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);
      }
    } else {
      const dateRange = getDateRanges(period);
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }
    
    const baseQuery = {
      vendorId: vendorId,
      date: { $gte: startDate, $lte: endDate },
      status: 'completed'
    };
    
    if (clientFilter && clientFilter !== '') {
      baseQuery.clientName = clientFilter;
    }
    
    if (bookingTypeFilter && bookingTypeFilter !== '') {
      baseQuery.mode = bookingTypeFilter;
    }
    
    // Fetch vendor info for the response
    const vendorDoc = await VendorModel.findById(vendorId).lean();
    const vendorName = vendorDoc?.businessName || 'Unknown Vendor';
    const vendorCity = vendorDoc?.city || 'Unknown City';

    // Fetch vendor services to get original prices for accurate Gross Sale calculation
    const vendorServicesDoc = await VendorServicesModel.findOne({ vendor: vendorId }).lean();
    const servicePriceMap = {};
    const serviceNamePriceMap = {}; // Fallback mapping by name
    
    if (vendorServicesDoc && vendorServicesDoc.services) {
      vendorServicesDoc.services.forEach(s => {
        const price = s.price || 0;
        servicePriceMap[s._id.toString()] = price;
        serviceNamePriceMap[s.name] = price;
      });
    }

    let allAppointments = await AppointmentModel.find(baseQuery).lean();
    
    if (serviceFilter && serviceFilter !== '') {
      allAppointments = allAppointments.filter(appt => {
        if (appt.isMultiService && appt.serviceItems && appt.serviceItems.length > 0) {
          return appt.serviceItems.some(item => (item.serviceName || 'Unknown') === serviceFilter);
        } else {
          return (appt.serviceName || 'Unknown') === serviceFilter;
        }
      });
    }
    
    if (staffFilter && staffFilter !== '') {
      allAppointments = allAppointments.filter(appt => {
        if (appt.isMultiService && appt.serviceItems && appt.serviceItems.length > 0) {
          return appt.serviceItems.some(item => (item.staffName || 'Unknown') === staffFilter);
        } else {
          return (appt.staffName || 'Unknown') === staffFilter;
        }
      });
    }
    
    const salesByService = {};
    
    allAppointments.forEach(appt => {
      const isOnline = appt.mode === 'online';
      const hasFees = (appt.platformFee || 0) !== 0 && (appt.serviceTax || 0) !== 0;

      if (appt.isMultiService && appt.serviceItems && appt.serviceItems.length > 0) {
        const totalApptValue = appt.serviceItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        
        appt.serviceItems.forEach(item => {
          const serviceName = item.serviceName || 'Unknown Service';
          if (serviceFilter && serviceFilter !== '' && serviceName !== serviceFilter) return;

          if (!salesByService[serviceName]) {
            salesByService[serviceName] = {
              serviceSold: 0,
              grossSale: 0,
              discounts: 0,
              offers: 0,
              netSale: 0,
              tax: 0,
              platformFee: 0,
              totalSales: 0
            };
          }

          // Compute gross and discount based on the item
          const serviceId = (item.service?._id || item.service)?.toString();
          const itemOriginalPrice = servicePriceMap[serviceId] || serviceNamePriceMap[serviceName] || item.amount || 0; 
          
          // Total appointment original value to calculate proportions
          let appointmentGrossAmount = 0;
          if (appt.isMultiService && appt.serviceItems && appt.serviceItems.length > 0) {
            appointmentGrossAmount = appt.serviceItems.reduce((sum, sItem) => {
              const sId = (sItem.service?._id || sItem.service)?.toString();
              const sName = sItem.service?.name || sItem.serviceName || 'Unknown Service';
              const origPrice = servicePriceMap[sId] || serviceNamePriceMap[sName] || sItem.amount || 0;
              const sItemAddOns = (sItem.addOns || []).reduce((s, a) => s + (a.price || 0), 0);
              return sum + origPrice + sItemAddOns;
            }, 0);
          } else {
            const sId = (appt.service?._id || appt.service)?.toString();
            const sName = appt.service?.name || appt.serviceName || 'Unknown Service';
            const origPrice = servicePriceMap[sId] || serviceNamePriceMap[sName] || appt.amount || 0;
            appointmentGrossAmount = origPrice + (appt.addOnsAmount || 0);
          }

          // We'll use the proportion approach if item specific discount isn't available
          const totalApptOriginalValue = appointmentGrossAmount;
          const itemGrossAmount = itemOriginalPrice + (item.addOns || []).reduce((s, a) => s + (a.price || 0), 0);
          const itemProportion = totalApptOriginalValue > 0 ? itemGrossAmount / totalApptOriginalValue : 0;
          
          const explicitDiscount = appt.discountAmount || appt.discount || 0;
          let computedDiscount = appointmentGrossAmount - (appt.amount || 0);
          if (computedDiscount < 0) computedDiscount = 0;
          
          const appointmentDiscountAmount = explicitDiscount > 0 ? explicitDiscount : computedDiscount;
          const isCouponUsed = !!appt.couponCode;
          
          const itemDiscount = appointmentDiscountAmount * itemProportion;
          const itemTax = (appt.serviceTax || 0) * itemProportion;
          const isOnline = appt.mode === 'online';
          const hasFees = (appt.platformFee || 0) !== 0;
          const itemPlatformFee = isOnline && hasFees ? (appt.platformFee || 0) * itemProportion : 0;
          const itemNetSale = itemGrossAmount - itemDiscount;
          const itemTotalSales = itemNetSale + itemTax + itemPlatformFee;

          salesByService[serviceName].serviceSold += 1;
          salesByService[serviceName].grossSale += itemGrossAmount;
          if (isCouponUsed) {
            salesByService[serviceName].offers += itemDiscount;
          } else {
            salesByService[serviceName].discounts += itemDiscount;
          }
          salesByService[serviceName].netSale += itemNetSale;
          salesByService[serviceName].tax += itemTax;
          salesByService[serviceName].platformFee += itemPlatformFee;
          salesByService[serviceName].totalSales += itemTotalSales;
        });
      } else {
        const serviceName = appt.serviceName || 'Unknown Service';
        if (serviceFilter && serviceFilter !== '' && serviceName !== serviceFilter) return;

        if (!salesByService[serviceName]) {
          salesByService[serviceName] = {
            serviceSold: 0,
            grossSale: 0,
            discounts: 0,
            offers: 0,
            netSale: 0,
            tax: 0,
            platformFee: 0,
            totalSales: 0
          };
        }

        const serviceId = (appt.service?._id || appt.service)?.toString();
        const originalPrice = servicePriceMap[serviceId] || serviceNamePriceMap[serviceName] || appt.amount || 0;
        const appointmentGrossAmount = originalPrice + (appt.addOnsAmount || 0);

        const explicitDiscount = appt.discountAmount || appt.discount || 0;
        let computedDiscount = appointmentGrossAmount - (appt.amount || 0);
        if (computedDiscount < 0) computedDiscount = 0;
        
        const appointmentDiscountAmount = explicitDiscount > 0 ? explicitDiscount : computedDiscount;
        const appointmentTax = appt.serviceTax || 0;
        const isOnline = appt.mode === 'online';
        const hasFees = (appt.platformFee || 0) !== 0;
        const appointmentPlatformFee = isOnline && hasFees ? (appt.platformFee || 0) : 0;
        const appointmentNetSale = appointmentGrossAmount - appointmentDiscountAmount;
        const appointmentTotalSales = appointmentNetSale + appointmentTax + appointmentPlatformFee;
        const isCouponUsed = !!appt.couponCode;

        salesByService[serviceName].serviceSold += 1;
        salesByService[serviceName].grossSale += appointmentGrossAmount;
        if (isCouponUsed) {
          salesByService[serviceName].offers += appointmentDiscountAmount;
        } else {
          salesByService[serviceName].discounts += appointmentDiscountAmount;
        }
        salesByService[serviceName].netSale += appointmentNetSale;
        salesByService[serviceName].tax += appointmentTax;
        salesByService[serviceName].platformFee += appointmentPlatformFee;
        salesByService[serviceName].totalSales += appointmentTotalSales;
      }
    });
    
    const salesByServiceArray = Object.keys(salesByService).map(serviceName => {
      const data = salesByService[serviceName];
      return {
        service: serviceName,
        vendor: vendorName,
        city: vendorCity,
        serviceSold: data.serviceSold,
        grossSale: parseFloat(data.grossSale.toFixed(2)),
        discounts: parseFloat(data.discounts.toFixed(2)),
        offers: parseFloat(data.offers.toFixed(2)),
        netSale: parseFloat(data.netSale.toFixed(2)),
        tax: parseFloat(data.tax.toFixed(2)),
        platformFee: parseFloat(data.platformFee.toFixed(2)),
        totalSales: parseFloat(data.totalSales.toFixed(2))
      };
    }).sort((a, b) => b.totalSales - a.totalSales);
    
    // Maintain backward compatibility for aggregated totals structure if needed, or remove
    const aggregatedTotals = salesByServiceArray.reduce((acc, curr) => {
      acc.totalServiceAmount += curr.totalSales;
      return acc;
    }, {
      totalServiceAmount: 0
    });

    aggregatedTotals.totalBusiness = aggregatedTotals.totalServiceAmount;
    aggregatedTotals.totalBusinessFormatted = `₹${aggregatedTotals.totalBusiness.toFixed(2)}`;

    return NextResponse.json({
      success: true,
      data: {
        salesByService: salesByServiceArray,
        aggregatedTotals: aggregatedTotals
      },
      filters: {
        period,
        startDate,
        endDate,
        client: clientFilter || null,
        service: serviceFilter || null,
        staff: staffFilter || null,
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