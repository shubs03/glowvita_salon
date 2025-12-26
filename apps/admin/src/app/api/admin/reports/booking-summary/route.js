import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import { authMiddlewareAdmin } from "../../../../../middlewareAdmin";

// Initialize database connection
const initDb = async () => {
  try {
    await _db();
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
};

// GET - Fetch overall booking summary report data
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
    
    // 1. Total Bookings
    const totalBookings = await AppointmentModel.countDocuments(dateFilter);
    
    // 2. Completed Bookings
    const completedBookings = await AppointmentModel.countDocuments({
      ...dateFilter,
      status: 'completed'
    });
    
    // 3. Cancelled Bookings
    const cancelledBookings = await AppointmentModel.countDocuments({
      ...dateFilter,
      status: 'cancelled'
    });
    
    // 4. Online vs Offline Bookings
    const onlineBookings = await AppointmentModel.countDocuments({
      ...dateFilter,
      mode: 'online'
    });
    
    const offlineBookings = await AppointmentModel.countDocuments({
      ...dateFilter,
      mode: 'offline'
    });
    
    // 5. Revenue from completed bookings
    const completedAppointments = await AppointmentModel.find({
      ...dateFilter,
      status: 'completed'
    }).select('finalAmount');
    
    const totalRevenue = completedAppointments.reduce((sum, appointment) => {
      return sum + (appointment.finalAmount || 0);
    }, 0);
    
    // 6. Top 5 services by booking count
    const topServices = await AppointmentModel.aggregate([
      { $match: { 
          ...dateFilter,
          status: 'completed'
        } 
      },
      {
        $group: {
          _id: "$serviceName",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // 7. Bookings by status
    const scheduledBookings = await AppointmentModel.countDocuments({
      ...dateFilter,
      status: 'scheduled'
    });
    
    const confirmedBookings = await AppointmentModel.countDocuments({
      ...dateFilter,
      status: 'confirmed'
    });
    
    const noShowBookings = await AppointmentModel.countDocuments({
      ...dateFilter,
      status: 'no-show'
    });
    
    // 8. Recent bookings (last 5)
    const recentBookings = await AppointmentModel.find(dateFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('vendorId', 'businessName')
      .select('clientName serviceName date startTime endTime status mode createdAt');
    
    return NextResponse.json({
      success: true,
      data: {
        totalBookings,
        completedBookings,
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
        filter: filterType ? `${filterType}: ${filterValue}` : 'All time'
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching booking summary report:", error);
    
    return NextResponse.json({ 
      success: false,
      message: "Error fetching booking summary report",
      error: error.message
    }, { status: 500 });
  }
}, ["superadmin", "admin"]);