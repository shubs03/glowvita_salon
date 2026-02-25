import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorSettlementPaymentModel from '@repo/lib/models/Vendor/VendorSettlementPayment.model';
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
    const regionId = searchParams.get('regionId'); // Region filter

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
    const regionQuery = getRegionQuery(req.user, regionId);
    const mainFilter = {
      ...dateFilter,
      ...regionQuery,
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
          "Payee Type": { $literal: "Vendor" },
          "Payee Name": "$_id.businessName",
          "Service Gross Amount": "$totalAmount",
          "Service Platform Fee": "$platformFee",
          "Service Tax (₹)": "$serviceTax",
          "Total": { $add: ["$platformFee", "$serviceTax"] },
          city: "$_id.city",
          appointmentCount: 1,
          completedAppointments: 1,
          confirmedAppointments: 1,
          scheduledAppointments: 1
        }
      }
    ];

    // Execute aggregation
    const results = await AppointmentModel.aggregate(pipeline);

    // Also fetch actual payments for these vendors in the same period
    const paymentFilter = {
      ...dateFilter,
      ...regionQuery,
      type: "Payment to Admin"
    };

    const actualPayments = await VendorSettlementPaymentModel.aggregate([
      { $match: paymentFilter },
      {
        $group: {
          _id: "$vendorId",
          paidAmount: { $sum: "$amount" }
        }
      }
    ]);

    const paymentMap = actualPayments.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.paidAmount;
      return acc;
    }, {});

    // Add payment info to results
    const resultsWithPayments = results.map(vendor => {
      const collectedAmount = paymentMap[vendor.vendorId.toString()] || 0;
      const totalPayable = vendor.Total || 0; // Correctly calculate what's payable to admin
      return {
        ...vendor,
        "Actually Collected": collectedAmount,
        "Total Payable to Admin": totalPayable,
        "Pending Amount": Math.max(0, totalPayable - collectedAmount)
      };
    });

    console.log("Vendor payable report results with payments:", resultsWithPayments);

    // Get unique cities for filter dropdown
    const cityPipeline = [
      { $match: { ...regionQuery, mode: 'online', paymentMethod: 'Pay at Salon', status: { $in: ['completed'] }, paymentStatus: { $in: ['completed'] } } },
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
      { $match: { ...regionQuery, mode: 'online', paymentMethod: 'Pay at Salon', status: { $in: ['completed'] }, paymentStatus: { $in: ['completed'] } } },
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
      totals.totalAmount += vendor["Service Gross Amount"] || 0;
      totals.platformFee += vendor["Service Platform Fee"] || 0;
      totals.serviceTax += vendor["Service Tax (₹)"] || 0;
      totals.total = vendor.Total ? (totals.total + vendor.Total) : totals.total;
      totals.totalCollected = (totals.totalCollected || 0) + (vendor["Actually Collected"] || 0);
      totals.totalPending = (totals.totalPending || 0) + (vendor["Pending Amount"] || 0);
      totals.appointmentCount += vendor.appointmentCount || 0;
      totals.completedAppointments += vendor.completedAppointments || 0;
      totals.confirmedAppointments += vendor.confirmedAppointments || 0;
      totals.scheduledAppointments += vendor.scheduledAppointments || 0;
      return totals;
    }, {
      totalAmount: 0,
      platformFee: 0,
      serviceTax: 0,
      total: 0,
      totalCollected: 0,
      totalPending: 0,
      appointmentCount: 0,
      completedAppointments: 0,
      confirmedAppointments: 0,
      scheduledAppointments: 0
    });

    return NextResponse.json({
      success: true,
      vendorPayableReport: resultsWithPayments,
      cities: cities,
      vendorNames: vendorNames,
      aggregatedTotals: aggregatedTotals,
      filter: filterType ? `${filterType}: ${filterValue}` : 'All time'
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching vendor payable report:", error);

    return NextResponse.json({
      success: false,
      message: "Error fetching vendor payable report",
      error: error.message
    }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);