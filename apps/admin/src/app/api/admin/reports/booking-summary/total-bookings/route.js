import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import { authMiddlewareAdmin } from "../../../../../../middlewareAdmin";

// Initialize database connection
const initDb = async () => {
  try {
    await _db();
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
};

// GET - Fetch total bookings report data
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
    
    console.log("Total Bookings Filter parameters:", { filterType, filterValue, startDateParam, endDateParam, saleType, city });
    
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
    
    // Combine all filters
    const combinedFilter = {
      ...dateFilter,
      ...modeFilter,
      ...vendorFilter
      // Note: We don't filter by status for total bookings to match dashboard route behavior
    };
    
    console.log("Combined filter for Total Bookings:", combinedFilter);
    
    // Build filter pipeline that handles both city and vendor filters
    const filterPipeline = [
      { $match: combinedFilter },
      { $lookup: { from: "vendors", localField: "vendorId", foreignField: "_id", as: "vendorInfo" } },
      { $unwind: { path: "$vendorInfo", preserveNullAndEmptyArrays: true } }, // Preserve appointments even if vendor info is missing
      ...(city && city !== 'all' ? [{ $match: { "vendorInfo.city": city } }] : []),
      ...(vendorName && vendorName !== 'all' ? [{ $match: { "vendorInfo.businessName": vendorName } }] : [])
    ];
    
    // 1. Total Bookings
    // Use a simpler count approach that matches the main booking summary and dashboard
    // Only apply date filter to match other routes
    const totalBookings = await AppointmentModel.countDocuments(dateFilter);
    
    // 2. Completed Bookings
    const completedBookingsPipeline = [
      ...filterPipeline,
      { $match: { status: 'completed' } }
    ];
    
    const completedBookingsResult = await AppointmentModel.aggregate([
      ...completedBookingsPipeline,
      { $count: "total" }
    ]);
    
    const completedBookings = completedBookingsResult.length > 0 ? completedBookingsResult[0].total : 0;
    
    // 2.1 Online Completed Bookings (specifically requested)
    const onlineCompletedBookingsPipeline = [
      { $match: { ...dateFilter, mode: 'online', status: 'completed' } }, // Use date filter only
      { $lookup: { from: "vendors", localField: "vendorId", foreignField: "_id", as: "vendorInfo" } },
      { $unwind: { path: "$vendorInfo", preserveNullAndEmptyArrays: true } },
      ...(city && city !== 'all' ? [{ $match: { "vendorInfo.city": city } }] : [])
    ];
    
    const onlineCompletedBookingsResult = await AppointmentModel.aggregate([
      ...onlineCompletedBookingsPipeline,
      { $count: "total" }
    ]);
    
    const onlineCompletedBookings = onlineCompletedBookingsResult.length > 0 ? onlineCompletedBookingsResult[0].total : 0;
    
    // 3. Cancelled Bookings
    const cancelledBookingsPipeline = [
      ...filterPipeline,
      { $match: { status: 'cancelled' } }
    ];
    
    const cancelledBookingsResult = await AppointmentModel.aggregate([
      ...cancelledBookingsPipeline,
      { $count: "total" }
    ]);
    
    const cancelledBookings = cancelledBookingsResult.length > 0 ? cancelledBookingsResult[0].total : 0;
    
    // 4. Online vs Offline Bookings
    // These should respect the existing mode filter
    let onlineBookings = 0;
    let offlineBookings = 0;
    
    // Count online/offline bookings regardless of the saleType filter
    // This ensures we get accurate counts of online and offline bookings
    const onlineBookingsPipeline = [
      { $match: { ...dateFilter, mode: 'online' } },  // Use only date filter, not mode filter
      { $lookup: { from: "vendors", localField: "vendorId", foreignField: "_id", as: "vendorInfo" } },
      { $unwind: { path: "$vendorInfo", preserveNullAndEmptyArrays: true } },
      ...(city && city !== 'all' ? [{ $match: { "vendorInfo.city": city } }] : [])
    ];
    
    const onlineBookingsResult = await AppointmentModel.aggregate([
      ...onlineBookingsPipeline,
      { $count: "total" }
    ]);
    
    onlineBookings = onlineBookingsResult.length > 0 ? onlineBookingsResult[0].total : 0;
    
    const offlineBookingsPipeline = [
      { $match: { ...dateFilter, mode: 'offline' } },  // Use only date filter, not mode filter
      { $lookup: { from: "vendors", localField: "vendorId", foreignField: "_id", as: "vendorInfo" } },
      { $unwind: { path: "$vendorInfo", preserveNullAndEmptyArrays: true } },
      ...(city && city !== 'all' ? [{ $match: { "vendorInfo.city": city } }] : [])
    ];
    
    const offlineBookingsResult = await AppointmentModel.aggregate([
      ...offlineBookingsPipeline,
      { $count: "total" }
    ]);
    
    offlineBookings = offlineBookingsResult.length > 0 ? offlineBookingsResult[0].total : 0;
    
    // 5. Revenue from completed bookings
    const completedAppointmentsPipeline = [
      ...filterPipeline,
      { $match: { status: 'completed' } }
    ];
    
    const completedAppointments = await AppointmentModel.aggregate([
      ...completedAppointmentsPipeline,
      { $project: { finalAmount: 1 } }
    ]);
    
    const totalRevenue = completedAppointments.reduce((sum, appointment) => sum + (appointment.finalAmount || 0), 0);
    
    // 6. Top 5 services by booking count
    const topServicesPipeline = [
      ...filterPipeline,
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: "$serviceName",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ];
    
    const topServices = await AppointmentModel.aggregate(topServicesPipeline);
    
    // 7. Bookings by status
    const scheduledBookingsPipeline = [
      ...filterPipeline,
      { $match: { status: 'scheduled' } }
    ];
    
    const scheduledBookingsResult = await AppointmentModel.aggregate([
      ...scheduledBookingsPipeline,
      { $count: "total" }
    ]);
    
    const scheduledBookings = scheduledBookingsResult.length > 0 ? scheduledBookingsResult[0].total : 0;
    
    const confirmedBookingsPipeline = [
      ...filterPipeline,
      { $match: { status: 'confirmed' } }
    ];
    
    const confirmedBookingsResult = await AppointmentModel.aggregate([
      ...confirmedBookingsPipeline,
      { $count: "total" }
    ]);
    
    const confirmedBookings = confirmedBookingsResult.length > 0 ? confirmedBookingsResult[0].total : 0;
    
    const noShowBookingsPipeline = [
      ...filterPipeline,
      { $match: { status: 'no-show' } }
    ];
    
    const noShowBookingsResult = await AppointmentModel.aggregate([
      ...noShowBookingsPipeline,
      { $count: "total" }
    ]);
    
    const noShowBookings = noShowBookingsResult.length > 0 ? noShowBookingsResult[0].total : 0;
    
    // 8. Recent bookings (last 5)
    const recentBookingsPipeline = [
      ...filterPipeline,
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
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
          "vendorId.city": "$vendorInfo.city",
          clientName: 1,
          serviceName: 1,
          date: 1,
          startTime: 1,
          endTime: 1,
          status: 1,
          mode: 1,
          finalAmount: 1,
          createdAt: 1
        }
      }
    ];
    
    const recentBookings = await AppointmentModel.aggregate(recentBookingsPipeline);
    
    // Log for debugging vendor information
    console.log('Recent bookings with vendor info:', recentBookings.map(booking => ({
      id: booking._id,
      vendorId: booking.vendorId,
      vendorName: booking.vendorId?.businessName || 'No vendor name',
      vendorCity: booking.vendorId?.city || 'No city',
      hasVendorId: !!booking.vendorId
    })));
    
    // 9. Vendor-specific booking counts with city information
    const vendorBookingsPipeline = [
      ...filterPipeline,
      {
        $group: {
          _id: "$vendorId",
          totalBookings: { $sum: 1 },
          onlineBookings: {
            $sum: {
              $cond: [{ $eq: ["$mode", "online"] }, 1, 0]
            }
          },
          offlineBookings: {
            $sum: {
              $cond: [{ $eq: ["$mode", "offline"] }, 1, 0]
            }
          }
        }
      },
      { $sort: { totalBookings: -1 } }
    ];
    
    const vendorBookings = await AppointmentModel.aggregate(vendorBookingsPipeline);
    
    // Populate vendor names and cities
    const vendorIds = vendorBookings.map(stat => stat._id).filter(id => id);
    const vendors = await VendorModel.find({ _id: { $in: vendorIds } }, 'businessName city');
    const vendorMap = vendors.reduce((map, vendor) => {
      map[vendor._id.toString()] = {
        businessName: vendor.businessName,
        city: vendor.city
      };
      return map;
    }, {});
    
    // Format vendor data with city information
    const formattedVendorBookings = vendorBookings.map(stat => ({
      vendorId: stat._id,
      vendor: vendorMap[stat._id.toString()]?.businessName || 'Unknown Vendor',
      city: vendorMap[stat._id.toString()]?.city || 'Unknown City',
      totalBookings: stat.totalBookings,
      onlineBookings: stat.onlineBookings,
      offlineBookings: stat.offlineBookings
    }));

    // Calculate aggregated totals
    const aggregatedTotals = vendorBookings.reduce((totals, stat) => {
      totals.totalBookings += stat.totalBookings;
      totals.onlineBookings += stat.onlineBookings;
      totals.offlineBookings += stat.offlineBookings;
      return totals;
    }, {
      totalBookings: 0,
      onlineBookings: 0,
      offlineBookings: 0
    });

    // Get unique cities for the filter dropdown
    const cityPipeline = [
      { $match: { status: { $in: ["scheduled", "confirmed", "completed", "cancelled", "no-show"] } } }, // All statuses
      { $lookup: { from: "vendors", localField: "vendorId", foreignField: "_id", as: "vendorInfo" } },
      { $unwind: { path: "$vendorInfo", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$vendorInfo.city" } }, // Get unique cities
      { $sort: { _id: 1 } } // Sort alphabetically
    ];
    
    const citiesResult = await AppointmentModel.aggregate(cityPipeline);
    const cities = citiesResult.map(item => item._id).filter(city => city); // Filter out null/undefined cities
    
    // Get unique vendors for the filter dropdown
    const vendorPipeline = [
      { $match: { status: { $in: ["scheduled", "confirmed", "completed", "cancelled", "no-show"] } } }, // All statuses
      { $lookup: { from: "vendors", localField: "vendorId", foreignField: "_id", as: "vendorInfo" } },
      { $unwind: { path: "$vendorInfo", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$vendorInfo.businessName" } }, // Get unique vendor names
      { $sort: { _id: 1 } } // Sort alphabetically
    ];
    
    const vendorsResult = await AppointmentModel.aggregate(vendorPipeline);
    const vendorNamesForFilter = vendorsResult.map(item => item._id).filter(vendor => vendor); // Filter out null/undefined vendors
    
    return NextResponse.json({
      success: true,
      data: {
        totalBookings,
        completedBookings,
        onlineCompletedBookings, // Include the specific online completed bookings count
        cancelledBookings,
        onlineBookings,
        offlineBookings,
        totalRevenue,
        topServices,
        bookingStatus: {
          scheduled: scheduledBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          noShow: noShowBookings
        },
        recentBookings,
        vendorBookings: formattedVendorBookings,
        aggregatedTotals, // Add aggregated totals to the response
        cities: cities, // Add cities to the response
        vendors: vendorNamesForFilter, // Add vendors to the response
        filter: filterType ? `${filterType}: ${filterValue}` : 'All time'
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching total bookings report:", error);
    
    return NextResponse.json({ 
      success: false,
      message: "Error fetching total bookings report",
      error: error.message
    }, { status: 500 });
  }
}, ["superadmin", "admin"]);
