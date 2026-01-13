import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
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

// GET - Fetch vendor payable report data based on appointments with mode: 'online' and paymentMethod: 'Pay at Salon'
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    await initDb();
    
    // Extract filter parameters from query
    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get('filterType'); // 'day', 'month', 'year', or null
    const filterValue = searchParams.get('filterValue'); // specific date value
    const startDateParam = searchParams.get('startDate'); // Custom date range start
    const endDateParam = searchParams.get('endDate'); // Custom date range end
    const city = searchParams.get('city'); // City filter
    const vendorName = searchParams.get('vendor'); // Vendor filter
    
    console.log("Vendor Payable Report Filter parameters:", { filterType, filterValue, startDateParam, endDateParam, city, vendorName });
    
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
          const [mYear, mMonth] = filterValue.split('-').map(Number);
          startDate = new Date(mYear, mMonth - 1, 1);
          endDate = new Date(mYear, mMonth, 0, 23, 59, 59, 999);
          break;
        case 'year':
          // Specific year - format: YYYY
          const yYear = parseInt(filterValue);
          startDate = new Date(yYear, 0, 1);
          endDate = new Date(yYear, 11, 31, 23, 59, 59, 999);
          break;
        default:
          startDate = null;
          endDate = null;
      }

      return { startDate, endDate };
    };

    // Build the main filter
    let dateFilter = {};

    // Apply date filter based on filterType and filterValue
    if (filterType && filterValue) {
      const { startDate, endDate } = buildDateFilter(filterType, filterValue);
      if (startDate && endDate) {
        dateFilter.date = { $gte: startDate, $lte: endDate };
      }
    }
    // Apply custom date range if provided (takes precedence over filterType/filterValue)
    else if (startDateParam && endDateParam) {
      dateFilter.date = { 
        $gte: new Date(startDateParam), 
        $lte: new Date(endDateParam) 
      };
    }

    // Create the main filter for appointments
    const mainFilter = {
      ...dateFilter,
      mode: 'online', // Only online appointments
      paymentMethod: 'Pay at Salon', // Only Pay at Salon appointments
      status: { $in: ['completed'] }, // Only include completed appointments
      paymentStatus: { $in: ['completed'] } // Only include completed payment status
    };

    console.log("Main filter for appointments:", mainFilter);

    // Build aggregation pipeline
    const pipeline = [
      { $match: mainFilter },
      // Lookup vendor information to get city and business name
      {
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendorInfo"
        }
      },
      { $unwind: "$vendorInfo" },
      // Apply city filter if provided (after lookup)
      ...(city && city !== 'all' ? [{ $match: { "vendorInfo.city": city } }] : []),
      // Apply vendor name filter if provided
      ...(vendorName && vendorName !== 'all' ? [{ $match: { "vendorInfo.businessName": vendorName } }] : []),
      // Group by vendor to calculate totals
      {
        $group: {
          _id: {
            vendorId: "$vendorId",
            businessName: "$vendorInfo.businessName",
            city: "$vendorInfo.city"
          },
          totalAmount: { $sum: "$totalAmount" },
          platformFee: { $sum: "$platformFee" },
          serviceTax: { $sum: "$serviceTax" },
          finalAmount: { $sum: "$finalAmount" },
          appointmentCount: { $sum: 1 },
          completedAppointments: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          confirmedAppointments: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
          scheduledAppointments: { $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] } }
        }
      },
      // Project the final structure
      {
        $project: {
          _id: 0,
          vendorId: "$_id.vendorId",
          businessName: "$_id.businessName",
          city: "$_id.city",
          totalAmount: 1,
          platformFee: 1,
          serviceTax: 1,
          finalAmount: 1,
          appointmentCount: 1,
          completedAppointments: 1,
          confirmedAppointments: 1,
          scheduledAppointments: 1
        }
      }
    ];

    // Execute aggregation
    const results = await AppointmentModel.aggregate(pipeline);

    console.log("Vendor payable report results:", results);

    // Get unique cities for filter dropdown
    const cityPipeline = [
      { $match: { mode: 'online', paymentMethod: 'Pay at Salon', status: { $in: ['completed'] }, paymentStatus: { $in: ['completed'] } } },
      {
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendorInfo"
        }
      },
      { $unwind: "$vendorInfo" },
      { $group: { _id: "$vendorInfo.city" } },
      { $sort: { _id: 1 } }
    ];

    const citiesResult = await AppointmentModel.aggregate(cityPipeline);
    const cities = citiesResult.map(item => item._id).filter(city => city); // Filter out null/undefined cities

    // Get unique vendors for filter dropdown
    const vendorPipeline = [
      { $match: { mode: 'online', paymentMethod: 'Pay at Salon', status: { $in: ['completed'] }, paymentStatus: { $in: ['completed'] } } },
      {
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendorInfo"
        }
      },
      { $unwind: "$vendorInfo" },
      { $group: { _id: "$vendorInfo.businessName" } },
      { $sort: { _id: 1 } }
    ];

    const vendorsResult = await AppointmentModel.aggregate(vendorPipeline);
    const vendorNames = vendorsResult.map(item => item._id).filter(vendor => vendor); // Filter out null/undefined vendors

    // Calculate aggregated totals
    const aggregatedTotals = results.reduce((totals, vendor) => {
      totals.totalAmount += vendor.totalAmount || 0;
      totals.platformFee += vendor.platformFee || 0;
      totals.serviceTax += vendor.serviceTax || 0;
      totals.finalAmount += vendor.finalAmount || 0;
      totals.appointmentCount += vendor.appointmentCount || 0;
      totals.completedAppointments += vendor.completedAppointments || 0;
      totals.confirmedAppointments += vendor.confirmedAppointments || 0;
      totals.scheduledAppointments += vendor.scheduledAppointments || 0;
      return totals;
    }, {
      totalAmount: 0,
      platformFee: 0,
      serviceTax: 0,
      finalAmount: 0,
      appointmentCount: 0,
      completedAppointments: 0,
      confirmedAppointments: 0,
      scheduledAppointments: 0
    });

    return NextResponse.json({
      success: true,
      data: {
        vendorPayableReport: results,
        cities: cities,
        vendorNames: vendorNames,
        aggregatedTotals: aggregatedTotals,
        filter: filterType ? `${filterType}: ${filterValue}` : 'All time'
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching vendor payable report:", error);
    
    return NextResponse.json({ 
      success: false,
      message: "Error fetching vendor payable report",
      error: error.message
    }, { status: 500 });
  }
}, ["superadmin", "admin"]);