import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import { authMiddlewareAdmin } from "../../../../../../middlewareAdmin";
import { getRegionQuery } from "@repo/lib/utils/regionQuery";

// Initialize database connection
const initDb = async () => {
  try {
    await _db();
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
};

// GET - Fetch completed bookings report data
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    await initDb();
    
    // Extract filter parameters from query
    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get('filterType'); // 'day', 'month', 'year', or null
    const filterValue = searchParams.get('filterValue'); // specific date value
    const startDateParam = searchParams.get('startDate'); // Custom date range start
    const endDateParam = searchParams.get('endDate'); // Custom date range end
    const saleType = searchParams.get('saleType'); // 'online', 'offline', or 'all'
    const city = searchParams.get('city'); // City filter
    const vendorName = searchParams.get('vendor'); // Vendor filter
    const regionId = searchParams.get('regionId'); // Region filter
    
    console.log("Completed Bookings Filter parameters:", { filterType, filterValue, startDateParam, endDateParam, saleType, city });
    
    // Build date filter
    const buildDateFilter = (filterType, filterValue, startDateParam, endDateParam) => {
      let startDate, endDate;
      
      // Handle custom date range first
      if (startDateParam && endDateParam) {
        startDate = new Date(startDateParam);
        endDate = new Date(endDateParam);
        endDate.setHours(23, 59, 59, 999); // Set to end of day
        return { date: { $gte: startDate, $lte: endDate } };
      }

      switch (filterType) {
        case 'day':
          // Specific day - format: YYYY-MM-DD
          const [year, month, day] = filterValue.split('-').map(Number);
          startDate = new Date(year, month - 1, day);
          endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
          break;
          
        case 'month':
          // Specific month - format: YYYY-MM
          const [monthYear, monthNum] = filterValue.split('-').map(Number);
          startDate = new Date(monthYear, monthNum - 1, 1);
          endDate = new Date(monthYear, monthNum, 1);
          endDate.setTime(endDate.getTime() - 1);
          break;
          
        case 'year':
          // Specific year - format: YYYY
          const trimmedYearValue = filterValue.trim();
          const yearValue = parseInt(trimmedYearValue);
          startDate = new Date(yearValue, 0, 1);
          endDate = new Date(yearValue, 11, 31, 23, 59, 59, 999);
          break;
          
        default:
          // No filter - use all time
          startDate = new Date(0);
          endDate = new Date();
      }

      return filterType ? { date: { $gte: startDate, $lte: endDate } } : {};
    };
    
    const dateFilter = buildDateFilter(filterType, filterValue, startDateParam, endDateParam);
    console.log("Date filter:", dateFilter);
    
    // Build mode filter
    const buildModeFilter = (saleType) => {
      if (!saleType || saleType === 'all') {
        return {};
      }
      return { mode: saleType };
    };
    
    const modeFilter = buildModeFilter(saleType);
    
    // Build vendor filter
    const buildVendorFilter = async (vendorName) => {
      if (!vendorName || vendorName === 'all') {
        return {};
      }
      // Find vendor by business name to get the ID
      const vendor = await VendorModel.findOne({ businessName: vendorName });
      if (!vendor) {
        return {};
      }
      return { vendorId: vendor._id };
    };
    
    const vendorFilter = await buildVendorFilter(vendorName);
    const regionQuery = getRegionQuery(req.user, regionId);
    
    // Combine all filters
    const combinedFilter = {
      ...dateFilter,
      ...modeFilter,
      ...vendorFilter,
      ...regionQuery,
      status: "completed"
    };
    
    console.log("Combined filter for Completed Bookings:", combinedFilter);
    
    // Build filter pipeline that handles both city and vendor filters
    const filterPipeline = [
      { $match: combinedFilter },
      { $lookup: { from: "vendors", localField: "vendorId", foreignField: "_id", as: "vendorInfo" } },
      { $unwind: "$vendorInfo" },
      ...(city && city !== 'all' ? [{ $match: { "vendorInfo.city": city } }] : []),
      ...(vendorName && vendorName !== 'all' ? [{ $match: { "vendorInfo.businessName": vendorName } }] : [])
    ];
    
    // 1. Total Completed Bookings
    const totalCompletedBookingsPipeline = [
      ...filterPipeline
    ];
    
    const totalCompletedBookingsResult = await AppointmentModel.aggregate([
      ...totalCompletedBookingsPipeline,
      { $count: "total" }
    ]);
    
    const totalCompletedBookings = totalCompletedBookingsResult.length > 0 ? totalCompletedBookingsResult[0].total : 0;
    
    // 2. Completed Online vs Offline Bookings
    // These should respect the existing mode filter
    let completedOnlineBookings = 0;
    let completedOfflineBookings = 0;
    
    // Only count online/offline if we're not already filtering by mode
    const onlineBookingsPipeline = [
      ...filterPipeline,
      { $match: { mode: 'online' } }
    ];
    
    const onlineBookingsResult = await AppointmentModel.aggregate([
      ...onlineBookingsPipeline,
      { $count: "total" }
    ]);
    
    completedOnlineBookings = onlineBookingsResult.length > 0 ? onlineBookingsResult[0].total : 0;
    
    const offlineBookingsPipeline = [
      ...filterPipeline,
      { $match: { mode: 'offline' } }
    ];
    
    const offlineBookingsResult = await AppointmentModel.aggregate([
      ...offlineBookingsPipeline,
      { $count: "total" }
    ]);
    
    completedOfflineBookings = offlineBookingsResult.length > 0 ? offlineBookingsResult[0].total : 0;
    
    // 3. Payment Status for Completed Bookings
    const paidCompletedBookingsPipeline = [
      ...filterPipeline,
      { $match: { paymentStatus: 'paid' } }
    ];
    
    const paidCompletedBookingsResult = await AppointmentModel.aggregate([
      ...paidCompletedBookingsPipeline,
      { $count: "total" }
    ]);
    
    const paidCompletedBookings = paidCompletedBookingsResult.length > 0 ? paidCompletedBookingsResult[0].total : 0;
    
    const partialPaidCompletedBookingsPipeline = [
      ...filterPipeline,
      { $match: { paymentStatus: 'partial-paid' } }
    ];
    
    const partialPaidCompletedBookingsResult = await AppointmentModel.aggregate([
      ...partialPaidCompletedBookingsPipeline,
      { $count: "total" }
    ]);
    
    const partialPaidCompletedBookings = partialPaidCompletedBookingsResult.length > 0 ? partialPaidCompletedBookingsResult[0].total : 0;
    
    const pendingPaymentCompletedBookingsPipeline = [
      ...filterPipeline,
      { $match: { paymentStatus: 'pending' } }
    ];
    
    const pendingPaymentCompletedBookingsResult = await AppointmentModel.aggregate([
      ...pendingPaymentCompletedBookingsPipeline,
      { $count: "total" }
    ]);
    
    const pendingPaymentCompletedBookings = pendingPaymentCompletedBookingsResult.length > 0 ? pendingPaymentCompletedBookingsResult[0].total : 0;
    
    // 4. Revenue from Completed Bookings
    const completedAppointmentsPipeline = [
      ...filterPipeline,
      {
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendorInfo"
        }
      },
      {
        $unwind: {
          path: "$vendorInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          "vendorId.businessName": "$vendorInfo.businessName",
          totalAmount: 1,
          finalAmount: 1,
          platformFee: 1,
          serviceTax: 1,
          clientName: 1,
          serviceName: 1,
          date: 1,
          startTime: 1,
          endTime: 1,
          status: 1,
          mode: 1,
          createdAt: 1
        }
      }
    ];
    
    const completedAppointments = await AppointmentModel.aggregate(completedAppointmentsPipeline);
    
    // Log for debugging vendor information
    console.log('Completed appointments with vendor info:', completedAppointments.map(appt => ({
      id: appt._id,
      vendorId: appt.vendorId,
      vendorName: appt.vendorId?.businessName || 'No vendor name',
      hasVendorId: !!appt.vendorId
    })).slice(0, 5)); // Log first 5 for debugging
    
    const revenueFromCompletedBookings = completedAppointments.reduce((sum, appointment) => {
      return sum + (appointment.totalAmount || 0);
    }, 0);
    
    // Calculate total platform fees and service tax
    const totalPlatformFees = completedAppointments.reduce((sum, appointment) => {
      return sum + (appointment.platformFee || 0);
    }, 0);
    
    const totalServiceTax = completedAppointments.reduce((sum, appointment) => {
      return sum + (appointment.serviceTax || 0);
    }, 0);
    
    // 5. Vendor Performance for Completed Bookings
    const vendorStatsPipeline = [
      ...filterPipeline,
      {
        $group: {
          _id: "$vendorId",
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          totalPlatformFees: { $sum: "$platformFee" },
          totalServiceTax: { $sum: "$serviceTax" },
          onlineBookings: {
            $sum: {
              $cond: [{ $eq: ["$mode", "online"] }, 1, 0]
            }
          },
          offlineBookings: {
            $sum: {
              $cond: [{ $eq: ["$mode", "offline"] }, 1, 0]
            }
          },
          onlinePayments: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$mode", "online"] }, { $ne: ["$paymentStatus", "pending"] }] }, "$totalAmount", 0]
            }
          },
          offlinePayments: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$mode", "offline"] }, { $ne: ["$paymentStatus", "pending"] }] }, "$totalAmount", 0]
            }
          }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ];
    
    const vendorStats = await AppointmentModel.aggregate(vendorStatsPipeline);
    
    // Calculate aggregated totals from vendorStats
    const aggregatedTotals = vendorStats.reduce((totals, stat) => {
      totals.totalBookings += stat.totalBookings;
      totals.onlineBookings += stat.onlineBookings;
      totals.offlineBookings += stat.offlineBookings;
      totals.onlinePayments += stat.onlinePayments;
      totals.offlinePayments += stat.offlinePayments;
      totals.totalPlatformFees += stat.totalPlatformFees;
      totals.totalServiceTax += stat.totalServiceTax;
      return totals;
    }, {
      totalBookings: 0,
      onlineBookings: 0,
      offlineBookings: 0,
      onlinePayments: 0,
      offlinePayments: 0,
      totalPlatformFees: 0,
      totalServiceTax: 0
    });
    
    // Calculate total business (Online Payments + Offline Payments + Platform Fees + Service Tax)
    aggregatedTotals.totalBusiness = aggregatedTotals.onlinePayments + aggregatedTotals.offlinePayments + aggregatedTotals.totalPlatformFees + aggregatedTotals.totalServiceTax;
    aggregatedTotals.totalBusinessFormatted = `₹${aggregatedTotals.totalBusiness.toFixed(2)}`;
    
    // Populate vendor names and cities
    const vendorIds = vendorStats.map(stat => stat._id).filter(id => id);
    const vendors = await VendorModel.find({ _id: { $in: vendorIds } }, 'businessName city');
    const vendorMap = vendors.reduce((map, vendor) => {
      map[vendor._id.toString()] = {
        businessName: vendor.businessName,
        city: vendor.city
      };
      return map;
    }, {});
    
    // Format vendor data with city information
    const formattedVendorStats = vendorStats.map(stat => ({
      vendorId: stat._id,
      vendor: vendorMap[stat._id.toString()]?.businessName || 'Unknown Vendor',
      city: vendorMap[stat._id.toString()]?.city || 'Unknown City',
      totalBookings: stat.totalBookings,
      totalRevenue: stat.totalRevenue,
      totalPlatformFees: stat.totalPlatformFees,
      totalServiceTax: stat.totalServiceTax,
      onlineBookings: stat.onlineBookings,
      offlineBookings: stat.offlineBookings,
      onlinePayments: stat.onlinePayments,
      offlinePayments: stat.offlinePayments
    }));
    
    // 6. Completed Bookings Over Time (Daily/Monthly)
    const completedBookingsByDatePipeline = [
      ...filterPipeline,
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ];
    
    const completedBookingsByDate = await AppointmentModel.aggregate(completedBookingsByDatePipeline);
    
    // 7. Top Services by Completed Bookings
    const topServicesPipeline = [
      ...filterPipeline,
      {
        $group: {
          _id: "$serviceName",
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ];
    
    const topServices = await AppointmentModel.aggregate(topServicesPipeline);
    
    // Get unique cities for the filter dropdown
    const cityPipeline = [
      { $match: { status: "completed" } }, // Only completed appointments
      { $lookup: { from: "vendors", localField: "vendorId", foreignField: "_id", as: "vendorInfo" } },
      { $unwind: "$vendorInfo" },
      { $group: { _id: "$vendorInfo.city" } }, // Get unique cities
      { $sort: { _id: 1 } } // Sort alphabetically
    ];
    
    const citiesResult = await AppointmentModel.aggregate(cityPipeline);
    const cities = citiesResult.map(item => item._id).filter(city => city); // Filter out null/undefined cities
    
    // Get unique vendors for the filter dropdown
    const vendorPipeline = [
      { $match: { status: "completed" } }, // Only completed appointments
      { $lookup: { from: "vendors", localField: "vendorId", foreignField: "_id", as: "vendorInfo" } },
      { $unwind: "$vendorInfo" },
      { $group: { _id: "$vendorInfo.businessName" } }, // Get unique vendor names
      { $sort: { _id: 1 } } // Sort alphabetically
    ];
    
    const vendorsResult = await AppointmentModel.aggregate(vendorPipeline);
    const vendorNamesForFilter = vendorsResult.map(item => item._id).filter(vendor => vendor); // Filter out null/undefined vendors
    
    return NextResponse.json({
      success: true,
      data: {
        totalCompletedBookings,
        completedOnlineBookings,
        completedOfflineBookings,
        paidCompletedBookings,
        partialPaidCompletedBookings,
        pendingPaymentCompletedBookings,
        revenueFromCompletedBookings,
        totalPlatformFees,
        totalServiceTax,
        aggregatedTotals, // Add aggregated totals to the response
        completedAppointments: completedAppointments.slice(0, 10), // Top 10 completed appointments
        vendorStats: formattedVendorStats,
        completedBookingsByDate,
        topServices,
        cities: cities, // Add cities to the response
        vendors: vendorNamesForFilter, // Add vendor names to the response
        filter: filterType ? `${filterType}: ${filterValue}` : 'All time'
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching completed bookings report:", error);
    
    return NextResponse.json({ 
      success: false,
      message: "Error fetching completed bookings report",
      error: error.message
    }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);
