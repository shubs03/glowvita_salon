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

// GET - Fetch cancellation report data
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
    const vendorId = searchParams.get('vendor'); // vendor filter
    const city = searchParams.get('city'); // city filter
    
    console.log("Cancellation Filter parameters:", { filterType, filterValue, startDateParam, endDateParam, saleType });
    
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
    
    const vendorFilter = await buildVendorFilter(vendorId);
    
    // Build city filter
    const buildCityFilter = (city) => {
      if (!city || city === 'all') {
        return {};
      }
      // We'll filter by city in the aggregation pipeline since it's in the vendor document
      return {};
    };
    
    const cityFilter = buildCityFilter(city);
    
    // Combine all filters
    const combinedFilter = {
      ...dateFilter,
      ...modeFilter,
      ...vendorFilter,
      status: "cancelled"
    };
    
    console.log("Combined filter for Cancellation:", combinedFilter);
    
    // Get cancelled appointments with vendor information
    const cancelledAppointments = await AppointmentModel.find(combinedFilter)
    .populate('vendorId', 'businessName city')
    .select('vendorId clientName serviceName date startTime endTime status mode createdAt');
    
    // Log for debugging vendor information
    console.log('Cancelled appointments with vendor info:', cancelledAppointments.map(appt => ({
      id: appt._id,
      vendorId: appt.vendorId,
      vendorName: appt.vendorId?.businessName || 'No vendor name',
      vendorCity: appt.vendorId?.city || 'No city',
      hasVendorId: !!appt.vendorId
    })).slice(0, 5)); // Log first 5 for debugging
    
    // Format data as requested: Vendor, Booking
    const formattedData = cancelledAppointments.map(appointment => ({
      vendor: appointment.vendorId ? appointment.vendorId.businessName : 'Unknown Vendor',
      booking: {
        clientName: appointment.clientName,
        serviceName: appointment.serviceName,
        date: appointment.date,
        time: `${appointment.startTime} - ${appointment.endTime}`,
        mode: appointment.mode,
        status: appointment.status,
        createdAt: appointment.createdAt
      }
    }));
    
    // Vendor-specific cancellation counts with city information and booking/payment modes
    // First, get all vendors for city filtering if needed
    const allVendors = await VendorModel.find({}, 'businessName city');
    
    // Filter vendors by city if city filter is applied
    let filteredVendorIds = null;
    if (city && city !== 'all') {
      const vendorsInCity = allVendors.filter(v => v.city === city);
      filteredVendorIds = vendorsInCity.map(v => v._id);
      // Add vendor ID filter to combined filter
      if (filteredVendorIds.length > 0) {
        combinedFilter.vendorId = { $in: filteredVendorIds };
      } else {
        // No vendors in this city, return empty result
        combinedFilter.vendorId = null;
      }
    }
    
    const vendorCancellations = await AppointmentModel.aggregate([
      { $match: combinedFilter },
      {
        $group: {
          _id: "$vendorId",
          totalCancellations: { $sum: 1 },
          onlineCancellations: {
            $sum: {
              $cond: [{ $eq: ["$mode", "online"] }, 1, 0]
            }
          },
          offlineCancellations: {
            $sum: {
              $cond: [{ $eq: ["$mode", "offline"] }, 1, 0]
            }
          }
        }
      },
      { $sort: { totalCancellations: -1 } }
    ]);

    // Populate vendor names and cities
    const vendorIds = vendorCancellations.map(stat => stat._id).filter(id => id);
    const vendors = await VendorModel.find({ _id: { $in: vendorIds } }, 'businessName city');
    const vendorMap = vendors.reduce((map, vendor) => {
      map[vendor._id.toString()] = {
        businessName: vendor.businessName,
        city: vendor.city
      };
      return map;
    }, {});
    
    // Get unique cities and vendors for dropdowns
    const uniqueCities = [...new Set(allVendors.map(v => v.city).filter(Boolean))];
    const uniqueVendors = [...new Set(allVendors.map(v => v.businessName).filter(Boolean))];

    // Format vendor data with city information
    const formattedVendorCancellations = vendorCancellations.map(stat => ({
      vendorId: stat._id,
      vendor: vendorMap[stat._id.toString()]?.businessName || 'Unknown Vendor',
      city: vendorMap[stat._id.toString()]?.city || 'Unknown City',
      totalCancellations: stat.totalCancellations,
      onlineCancellations: stat.onlineCancellations,
      offlineCancellations: stat.offlineCancellations
    }));

    // Calculate total cancellations across all vendors
    const totalCancellations = formattedVendorCancellations.reduce((sum, vendor) => sum + vendor.totalCancellations, 0);
    
    return NextResponse.json({
      success: true,
      data: {
        cancelledAppointments: formattedData,
        totalCancelled: totalCancellations,
        vendorCancellations: formattedVendorCancellations,
        cities: uniqueCities,
        vendors: uniqueVendors,
        filter: filterType ? `${filterType}: ${filterValue}` : 'All time'
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching cancellation report:", error);
    
    return NextResponse.json({ 
      success: false,
      message: "Error fetching cancellation report",
      error: error.message
    }, { status: 500 });
  }
}, ["superadmin", "admin"]);