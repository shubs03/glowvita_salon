import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import { authMiddlewareAdmin } from "../../../../../../middlewareAdmin";
import { buildRegionQueryFromRequest } from "@repo/lib";

// Initialize database connection
const initDb = async () => {
  try {
    await _db();
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
};

// GET - Fetch sales by salon report data
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    await initDb();
    
    // Extract filter parameters from query
    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get('filterType'); // 'day', 'month', 'year', or null
    const filterValue = searchParams.get('filterValue'); // specific date value
    
    // Build date filter
    const buildDateFilter = (filterType, filterValue) => {
      const now = new Date();
      let startDate, endDate;

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
    
    const dateFilter = buildDateFilter(filterType, filterValue);
    
    // Get all appointments with detailed information within the filtered period (scoped by region)
    const appointmentQuery = buildRegionQueryFromRequest(req, dateFilter);
    const vendorAppointments = await AppointmentModel.find(appointmentQuery).select(
      'vendorId status paymentStatus mode finalAmount platformFee taxAmount discountAmount date'
    );
    
    // Fetch all vendors with business name and city (scoped by region)
    const vendorQuery = buildRegionQueryFromRequest(req);
    const allVendors = await VendorModel.find(vendorQuery, 'businessName city');
    const vendorMap = new Map(allVendors.map(vendor => [vendor._id.toString(), {
      businessName: vendor.businessName,
      city: vendor.city || 'Unknown City'
    }]));

    // Group appointments by vendor
    const appointmentsByVendor = vendorAppointments.reduce((acc, appointment) => {
      const vendorId = appointment.vendorId?.toString();
      if (!acc[vendorId]) {
        acc[vendorId] = [];
      }
      acc[vendorId].push(appointment);
      return acc;
    }, {});

    // Calculate sales metrics for each vendor
    const salesBySalon = Object.entries(appointmentsByVendor)
    .map(([vendorId, vendorAppointments]) => {
      // Get vendor details
      const vendor = vendorMap.get(vendorId) || { businessName: 'Unknown Vendor', city: 'Unknown City' };
      
      // Filter completed appointments for this vendor
      const vendorCompletedAppointments = vendorAppointments.filter(appt => 
        appt.status === 'completed' && appt.paymentStatus === 'completed'
      );
      
      // Calculate financial metrics
      const totalRevenue = vendorCompletedAppointments.reduce((sum, appt) => sum + (appt.finalAmount || 0), 0);
      const totalPlatformFees = vendorCompletedAppointments.reduce((sum, appt) => sum + (appt.platformFee || 0), 0);
      const totalTaxes = vendorCompletedAppointments.reduce((sum, appt) => sum + (appt.taxAmount || 0), 0);
      const totalDiscounts = vendorCompletedAppointments.reduce((sum, appt) => sum + (appt.discountAmount || 0), 0);
      const totalProfit = totalRevenue - totalPlatformFees - totalTaxes - totalDiscounts;
      
      // Count bookings
      const totalBookings = vendorAppointments.length;
      const onlineBookings = vendorAppointments.filter(appt => appt.mode === 'online').length;
      const offlineBookings = vendorAppointments.filter(appt => appt.mode === 'offline').length;
      const cancelledBookings = vendorAppointments.filter(appt => appt.status === 'cancelled').length;
      const completedBookings = vendorAppointments.filter(appt => appt.status === 'completed').length;
      
      return {
        _id: vendorId,
        businessName: vendor.businessName,
        city: vendor.city,
        totalRevenue,
        totalProfit,
        totalPlatformFees,
        totalTaxes,
        totalDiscounts,
        totalBookings,
        onlineBookings,
        offlineBookings,
        cancelledBookings,
        completedBookings
      };
    })
    // Sort by revenue (highest first)
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    // Calculate totals
    const totalRevenueAllSalons = salesBySalon.reduce((sum, salon) => sum + salon.totalRevenue, 0);
    const totalProfitAllSalons = salesBySalon.reduce((sum, salon) => sum + salon.totalProfit, 0);
    const totalBookingsAllSalons = salesBySalon.reduce((sum, salon) => sum + salon.totalBookings, 0);
    
    // Get top 10 salons by revenue
    const topSalons = salesBySalon.slice(0, 10);
    
    // Group sales by date for trend analysis
    const salesByDate = await AppointmentModel.aggregate([
      { $match: { 
          ...appointmentQuery,
          status: 'completed',
          paymentStatus: 'completed'
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          revenue: { $sum: "$finalAmount" },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        salesBySalon: topSalons,
        totalRevenueAllSalons,
        totalProfitAllSalons,
        totalBookingsAllSalons,
        salesByDate,
        totalSalons: allVendors.length,
        filter: filterType ? `${filterType}: ${filterValue}` : 'All time'
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching sales by salon report:", error);
    
    return NextResponse.json({ 
      success: false,
      message: "Error fetching sales by salon report",
      error: error.message
    }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "reports:view");