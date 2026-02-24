import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import { authMiddlewareAdmin } from '../../../../../../middlewareAdmin';
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

// GET - Fetch vendor payout settlement report data
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
    const regionId = searchParams.get('regionId'); // Region filter

    console.log("Vendor Payout Settlement Report Filter parameters:", { filterType, filterValue, startDateParam, endDateParam, city, vendorName });

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

    // Create the main filter for appointments - focusing on completed appointments where admin pays to vendor
    const regionQuery = getRegionQuery(req.user, regionId);
    const mainFilter = {
      ...dateFilter,
      ...regionQuery,
      mode: 'online', // Only online appointments
      paymentMethod: 'Pay Online', // Only Pay Online appointments
      status: { $in: ['completed'] }, // Only include completed appointments
      paymentStatus: { $in: ['completed'] } // Only include completed payment status
    };

    // Apply city filter if provided
    if (city && city !== 'all') {
      mainFilter.city = city;
    }

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
          serviceGrossAmount: { $sum: "$totalAmount" },
          servicePlatformFee: { $sum: "$platformFee" },
          serviceTax: { $sum: "$serviceTax" },
          serviceTotalAmount: { $sum: "$finalAmount" },
          appointmentCount: { $sum: 1 },
          completedAppointments: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          confirmedAppointments: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
          scheduledAppointments: { $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] } }
        }
      },
      // Project the final structure with required fields
      {
        $project: {
          _id: 0,
          vendorId: "$_id.vendorId",
          "Source Type": { $literal: "Service" }, // Fixed source type for service-based payouts
          "Entity Name": "$_id.businessName", // Business name of the vendor
          "Service Platform Fee": "$servicePlatformFee",
          "Service Tax (₹)": "$serviceTax",
          "Service Total Amount": "$serviceTotalAmount",
          "Total": { $subtract: ["$serviceTotalAmount", "$servicePlatformFee"] }, // Amount paid to vendor after platform fee deduction
          city: "$_id.city",
          appointmentCount: 1,
          completedAppointments: 1
        }
      }
    ];

    // Execute aggregation
    const results = await AppointmentModel.aggregate(pipeline);

    console.log("Vendor payout settlement report results:", results);

    // Get unique cities for filter dropdown
    const cityPipeline = [
      { $match: { ...regionQuery, status: { $in: ['completed'] }, paymentStatus: { $in: ['completed'] } } },
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
      { $match: { ...regionQuery, status: { $in: ['completed'] }, paymentStatus: { $in: ['completed'] } } },
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
      totals.servicePlatformFee += vendor["Service Platform Fee"] || 0;
      totals.serviceTax += vendor["Service Tax (₹)"] || 0;
      totals.serviceTotalAmount += vendor["Service Total Amount"] || 0;
      totals.total = vendor.Total ? (totals.total + vendor.Total) : totals.total;
      totals.appointmentCount += vendor.appointmentCount || 0;
      totals.completedAppointments += vendor.completedAppointments || 0;
      return totals;
    }, {
      servicePlatformFee: 0,
      serviceTax: 0,
      serviceTotalAmount: 0,
      total: 0, // This will be the sum of all vendor payouts
      appointmentCount: 0,
      completedAppointments: 0
    });

    // Calculate the actual total payout to vendors (serviceTotalAmount - servicePlatformFee)
    aggregatedTotals.total = aggregatedTotals.serviceTotalAmount - aggregatedTotals.servicePlatformFee;

    return NextResponse.json({
      success: true,
      vendorPayoutSettlementReport: results,
      cities: cities,
      vendorNames: vendorNames,
      aggregatedTotals: aggregatedTotals,
      filter: filterType ? `${filterType}: ${filterValue}` : 'All time'
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching vendor payout settlement report:", error);

    return NextResponse.json({
      success: false,
      message: "Error fetching vendor payout settlement report",
      error: error.message
    }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);