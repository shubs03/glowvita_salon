import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorSettlementPaymentModel from '@repo/lib/models/Vendor/VendorSettlementPayment.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
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

    // Create the main filter for appointments - show ALL Pay Online appointments
    // Removed strict status filter to show everything (even scheduled/cancelled for visibility)
    // Admin can then see what's pending
    const regionQuery = getRegionQuery(req.user, regionId);
    
    const vendorMatch = { ...regionQuery };
    if (city && city !== 'all') {
      vendorMatch.city = city;
    }
    if (vendorName && vendorName !== 'all') {
      vendorMatch.businessName = vendorName;
    }

    console.log("Vendor match query:", vendorMatch);

    // Build aggregation pipeline starting from VendorModel
    const pipeline = [
      { $match: vendorMatch },
      {
        $lookup: {
          from: "appointments",
          let: { vId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$vendorId", "$$vId"] },
                ...dateFilter,
                paymentMethod: 'Pay Online',
                status: { $ne: 'temp-locked' }
              }
            }
          ],
          as: "appointments"
        }
      },
      {
        $unwind: {
          path: "$appointments",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: {
            vendorId: "$_id",
            businessName: "$businessName",
            city: "$city"
          },
          serviceGrossAmount: { $sum: { $ifNull: ["$appointments.totalAmount", 0] } },
          servicePlatformFee: { $sum: { $ifNull: ["$appointments.platformFee", 0] } },
          serviceTax: { $sum: { $ifNull: ["$appointments.serviceTax", 0] } },
          serviceTotalAmount: { $sum: { $ifNull: ["$appointments.finalAmount", 0] } },
          completedTotal: { 
            $sum: { 
              $cond: [
                { $eq: ["$appointments.status", "completed"] }, 
                { $subtract: [
                    { $ifNull: ["$appointments.totalAmount", 0] },
                    { $add: [{ $ifNull: ["$appointments.platformFee", 0] }, { $ifNull: ["$appointments.serviceTax", 0] }] }
                ]}, 
                0
              ] 
            } 
          },
          pendingTotal: { 
            $sum: { 
              $cond: [
                { $or: [{ $eq: ["$appointments.status", "confirmed"] }, { $eq: ["$appointments.status", "scheduled"] }] }, 
                { $subtract: [
                    { $ifNull: ["$appointments.totalAmount", 0] },
                    { $add: [{ $ifNull: ["$appointments.platformFee", 0] }, { $ifNull: ["$appointments.serviceTax", 0] }] }
                ]}, 
                0
              ] 
            } 
          },
          refundableTotal: { 
            $sum: { 
              $cond: [
                { $eq: ["$appointments.status", "cancelled"] }, 
                { $subtract: [
                    { $ifNull: ["$appointments.finalAmount", 0] },
                    { $add: [{ $ifNull: ["$appointments.platformFee", 0] }, { $ifNull: ["$appointments.serviceTax", 0] }] }
                ]}, 
                0
              ] 
            } 
          },
          appointmentCount: { $sum: { $cond: [{ $ifNull: ["$appointments._id", false] }, 1, 0] } },
          completedAppointments: { $sum: { $cond: [{ $eq: ["$appointments.status", "completed"] }, 1, 0] } },
          pendingAppointments: { $sum: { $cond: [{ $or: [{ $eq: ["$appointments.status", "confirmed"] }, { $eq: ["$appointments.status", "scheduled"] }] }, 1, 0] } },
          cancelledAppointments: { $sum: { $cond: [{ $eq: ["$appointments.status", "cancelled"] }, 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          vendorId: "$_id.vendorId",
          "Source Type": { $literal: "Service" },
          "Entity Name": "$_id.businessName",
          "Service Gross Amount": "$serviceGrossAmount",
          "Service Platform Fee": "$servicePlatformFee",
          "Service Tax (₹)": "$serviceTax",
          "Service Total Amount": "$serviceTotalAmount",
          "Total": "$completedTotal",
          "Completed Total": "$completedTotal",
          "Pending Total": "$pendingTotal",
          "Refundable Total": "$refundableTotal",
          city: "$_id.city",
          appointmentCount: 1,
          completedAppointments: 1,
          pendingAppointments: 1,
          cancelledAppointments: 1
        }
      },
      { $sort: { "Entity Name": 1 } }
    ];

    // Execute aggregation
    const results = await VendorModel.aggregate(pipeline);

    // Also fetch actual payments for these vendors in the same period
    const paymentFilter = {
      ...dateFilter,
      ...regionQuery,
      type: "Payment to Vendor"
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
      const paidAmount = paymentMap[vendor.vendorId.toString()] || 0;
      const totalPayable = vendor.Total || 0;
      return {
        ...vendor,
        "Actually Paid": paidAmount,
        "Pending Amount": Math.max(0, totalPayable - paidAmount)
      };
    });

    console.log("Vendor payout settlement report results with payments:", resultsWithPayments);

    // Get unique cities for filter dropdown from VendorModel
    const cityPipeline = [
      { $match: { ...regionQuery } },
      { $group: { _id: "$city" } },
      { $sort: { _id: 1 } }
    ];
    const citiesResult = await VendorModel.aggregate(cityPipeline);
    const cities = citiesResult.map(item => item._id).filter(Boolean);

    // Get unique vendors for filter dropdown from VendorModel
    const vendorPipeline = [
      { $match: { ...regionQuery } },
      { $group: { _id: "$businessName" } },
      { $sort: { _id: 1 } }
    ];
    const vendorsResult = await VendorModel.aggregate(vendorPipeline);
    const vendorNames = vendorsResult.map(item => item._id).filter(Boolean);

    // Calculate aggregated totals from resultsWithPayments (which includes Actually Paid + Pending Amount)
    const aggregatedTotals = resultsWithPayments.reduce((totals, vendor) => {
      totals.serviceGrossAmount += vendor["Service Gross Amount"] || 0;
      totals.servicePlatformFee += vendor["Service Platform Fee"] || 0;
      totals.serviceTax += vendor["Service Tax (₹)"] || 0;
      totals.serviceTotalAmount += vendor["Service Total Amount"] || 0;
      totals.total += vendor["Total"] || 0;
      totals.totalPaid += vendor["Actually Paid"] || 0;
      totals.totalPending += vendor["Pending Amount"] || 0;
      totals.appointmentCount += vendor.appointmentCount || 0;
      totals.completedAppointments += vendor.completedAppointments || 0;
      totals.pendingAppointments += vendor.pendingAppointments || 0;
      totals.cancelledAppointments += vendor.cancelledAppointments || 0;
      totals.completedTotal += vendor["Completed Total"] || 0;
      totals.pendingTotal += vendor["Pending Total"] || 0;
      totals.refundableTotal += vendor["Refundable Total"] || 0;
      return totals;
    }, {
      serviceGrossAmount: 0,
      servicePlatformFee: 0,
      serviceTax: 0,
      serviceTotalAmount: 0,
      total: 0,
      totalPaid: 0,
      totalPending: 0,
      appointmentCount: 0,
      completedAppointments: 0,
      pendingAppointments: 0,
      cancelledAppointments: 0,
      completedTotal: 0,
      pendingTotal: 0,
      refundableTotal: 0
    });

    // total is already correctly summed above (no need to recalculate)

    return NextResponse.json({
      success: true,
      vendorPayoutSettlementReport: resultsWithPayments,
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
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "reports:view");