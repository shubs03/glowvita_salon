import { NextResponse } from "next/server";
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import ClientOrder from '@repo/lib/models/user/ClientOrder.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

// Helper function to calculate date ranges based on filter period
const getDateRanges = (period) => {
  const now = new Date();

  let startDate, endDate;

  if (period === 'day') {
    // Today only
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (period === 'month') {
    // Current month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === 'year') {
    // Current year
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else {
    // All time (last year for testing purposes)
    startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  return { startDate, endDate };
};

// Helper function to parse custom date ranges from query parameters
const getCustomDateRanges = (startDateStr, endDateStr) => {
  let startDate, endDate;

  if (startDateStr && endDateStr) {
    // Parse the custom date range
    startDate = new Date(startDateStr);
    endDate = new Date(endDateStr);
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
};

// Main handler function for the metrics endpoint
async function getVendorMetricsHandler(request) {
  try {
    console.log("Full user object:", JSON.stringify(request.user, null, 2));
    // Use userId and convert to string based on other routes in the app
    const vendorId = (request.user.userId || request.user.id).toString();
    console.log("Fetching metrics for vendor ID:", vendorId);

    // Get filter parameters from query parameters
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'all';
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');

    console.log("Filter period:", period);
    console.log("Custom date range:", startDateParam, "to", endDateParam);

    // Determine date ranges based on parameters
    let startDate, endDate;
    if (startDateParam && endDateParam) {
      // Use custom date range
      const customDates = getCustomDateRanges(startDateParam, endDateParam);
      startDate = customDates.startDate;
      endDate = customDates.endDate;
      console.log("Using custom date range:", startDate, "to", endDate);
    } else {
      // Use preset period
      const presetDates = getDateRanges(period);
      startDate = presetDates.startDate;
      endDate = presetDates.endDate;
      console.log("Using preset date range:", startDate, "to", endDate);
    }

    // Also log the vendorId type to check if it's an ObjectId
    console.log("Vendor ID type:", typeof vendorId);

    // Debug: Check if we can find any appointments at all
    const totalAppointmentCount = await AppointmentModel.countDocuments({});
    console.log("Total appointments in database:", totalAppointmentCount);

    // Try querying with the vendorId as a string first
    let vendorAppointmentCount = await AppointmentModel.countDocuments({ vendorId: vendorId });
    console.log("Total appointments for this vendor (string query):", vendorAppointmentCount);

    // If that doesn't work, try converting to ObjectId
    if (vendorAppointmentCount === 0) {
      try {
        const mongoose = require('mongoose');
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        vendorAppointmentCount = await AppointmentModel.countDocuments({ vendorId: vendorObjectId });
        console.log("Total appointments for this vendor (ObjectId query):", vendorAppointmentCount);
      } catch (objectIdError) {
        console.log("Could not convert vendorId to ObjectId:", objectIdError.message);
      }
    }

    // Debug: Check if vendorId is correct by finding appointments without vendorId filter
    const sampleAllAppointments = await AppointmentModel.find({}, { vendorId: 1, status: 1, paymentStatus: 1 }).limit(5);
    console.log("Sample appointments from all vendors:", JSON.stringify(sampleAllAppointments.map(a => ({
      vendorId: a.vendorId,
      status: a.status,
      paymentStatus: a.paymentStatus
    })), null, 2));

    // Debug: Check a few sample appointments to understand the data structure
    // Try with string vendorId first
    let sampleAppointments = await AppointmentModel.find({ vendorId: vendorId }).limit(5);

    // If that doesn't work, try with ObjectId
    if (sampleAppointments.length === 0) {
      try {
        const mongoose = require('mongoose');
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        sampleAppointments = await AppointmentModel.find({ vendorId: vendorObjectId }).limit(5);
      } catch (error) {
        console.log("Error converting vendorId to ObjectId for sample appointments:", error.message);
      }
    }

    console.log("Sample appointments:", JSON.stringify(sampleAppointments.map(a => ({
      id: a._id,
      status: a.status,
      paymentStatus: a.paymentStatus,
      finalAmount: a.finalAmount,
      totalAmount: a.totalAmount,
      amountPaid: a.amountPaid,
      date: a.date,
      createdAt: a.createdAt
    })), null, 2));

    // 1. Total Revenue from Services (from ALL completed appointments within date range)
    // Use the same logic as the sales by service report - only status: 'completed'

    // Base match condition with vendorId and date range
    const baseMatchCondition = {
      vendorId: vendorId,
      date: { $gte: startDate, $lte: endDate }
    };

    // Check for status: 'completed' only (same as sales by service report)
    // Try with string vendorId first
    let completedByStatus = await AppointmentModel.countDocuments({
      ...baseMatchCondition,
      status: 'completed'
    });

    // If that doesn't work, try with ObjectId
    if (completedByStatus === 0) {
      try {
        const mongoose = require('mongoose');
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        completedByStatus = await AppointmentModel.countDocuments({
          vendorId: vendorObjectId,
          date: { $gte: startDate, $lte: endDate },
          status: 'completed'
        });
      } catch (error) {
        console.log("Error converting vendorId to ObjectId for completed status query:", error.message);
      }
    }
    console.log("Appointments with status 'completed':", completedByStatus);

    // Calculate service revenue using the same approach as sales by service report
    // Need to handle both single-service and multi-service appointments correctly
    // For multi-service, we need to sum the serviceItems.amount values
    // Try with string vendorId first
    let completedAppointmentsAggregation = await AppointmentModel.aggregate([
      {
        $match: {
          vendorId: vendorId,
          date: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $addFields: {
          effectiveAmount: {
            $add: [
              {
                $cond: {
                  if: { $eq: ["$isMultiService", true] },
                  then: {
                    $cond: {
                      if: {
                        $and: [
                          { $ne: ["$serviceItems", null] },
                          { $isArray: "$serviceItems" }
                        ]
                      },
                      then: { $sum: "$serviceItems.amount" },
                      else: { $ifNull: ["$amount", 0] }
                    }
                  },
                  else: { $ifNull: ["$amount", 0] }
                }
              },
              { $ifNull: ["$addOnsAmount", 0] }
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalServiceRevenue: { $sum: "$effectiveAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // If that doesn't work, try with ObjectId
    if (completedAppointmentsAggregation.length === 0) {
      try {
        const mongoose = require('mongoose');
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        completedAppointmentsAggregation = await AppointmentModel.aggregate([
          {
            $match: {
              vendorId: vendorObjectId,
              date: { $gte: startDate, $lte: endDate },
              status: 'completed'
            }
          },
          {
            $addFields: {
              effectiveAmount: {
                $add: [
                  {
                    $cond: {
                      if: { $eq: ["$isMultiService", true] },
                      then: {
                        $cond: {
                          if: {
                            $and: [
                              { $ne: ["$serviceItems", null] },
                              { $isArray: "$serviceItems" }
                            ]
                          },
                          then: { $sum: "$serviceItems.amount" },
                          else: { $ifNull: ["$amount", 0] }
                        }
                      },
                      else: { $ifNull: ["$amount", 0] }
                    }
                  },
                  { $ifNull: ["$addOnsAmount", 0] }
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              totalServiceRevenue: { $sum: "$effectiveAmount" },
              count: { $sum: 1 }
            }
          }
        ]);
      } catch (error) {
        console.log("Error converting vendorId to ObjectId for aggregation query:", error.message);
      }
    }

    console.log("Completed appointments aggregation result:", JSON.stringify(completedAppointmentsAggregation, null, 2));

    const totalServiceRevenue = completedAppointmentsAggregation.length > 0 ? completedAppointmentsAggregation[0].totalServiceRevenue : 0;
    const completedAppointmentsCount = completedAppointmentsAggregation.length > 0 ? completedAppointmentsAggregation[0].count : 0;

    console.log("Total service revenue (completed appointments):", totalServiceRevenue);
    console.log("Completed appointments count:", completedAppointmentsCount);

    // Calculate revenue from delivered product orders
    // Use the same approach as the sales by product report to ensure consistency
    // Try with string vendorId first
    let deliveredProductOrdersAggregation = await ClientOrder.aggregate([
      {
        $match: {
          vendorId: vendorId,
          status: 'Delivered',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $unwind: "$items"
      },
      {
        $group: {
          _id: null,
          totalProductRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          count: { $sum: 1 }
        }
      }
    ]);

    // If that doesn't work, try with ObjectId
    if (deliveredProductOrdersAggregation.length === 0) {
      try {
        const mongoose = require('mongoose');
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        deliveredProductOrdersAggregation = await ClientOrder.aggregate([
          {
            $match: {
              vendorId: vendorObjectId,
              status: 'Delivered',
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $unwind: "$items"
          },
          {
            $group: {
              _id: null,
              totalProductRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
              count: { $sum: 1 }
            }
          }
        ]);
      } catch (error) {
        console.log("Error converting vendorId to ObjectId for delivered product orders query:", error.message);
      }
    }

    const deliveredProductRevenue = deliveredProductOrdersAggregation.length > 0 ? deliveredProductOrdersAggregation[0].totalProductRevenue : 0;
    const deliveredProductOrdersCount = deliveredProductOrdersAggregation.length > 0 ? deliveredProductOrdersAggregation[0].count : 0;

    console.log("Delivered product revenue:", deliveredProductRevenue);
    console.log("Delivered product orders count:", deliveredProductOrdersCount);

    // 7. Total Expense (sum of all expenses within date range)
    let totalExpense = 0;
    try {
      const ExpenseModel = (await import('@repo/lib/models/Vendor/Expense.model')).default;

      // Try with string vendorId first
      let expenseAggregation = await ExpenseModel.aggregate([
        {
          $match: {
            vendorId: vendorId,
            date: { $gte: startDate, $lte: endDate },
            status: 'Active'
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" }
          }
        }
      ]);

      // If that doesn't work, try with ObjectId
      if (expenseAggregation.length === 0) {
        try {
          const mongoose = require('mongoose');
          const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
          expenseAggregation = await ExpenseModel.aggregate([
            {
              $match: {
                vendorId: vendorObjectId,
                date: { $gte: startDate, $lte: endDate },
                status: 'Active'
              }
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$amount" }
              }
            }
          ]);
        } catch (error) {
          console.log("Error converting vendorId to ObjectId for expense query:", error.message);
        }
      }

      totalExpense = expenseAggregation.length > 0 ? expenseAggregation[0].totalAmount : 0;
      console.log("Total Expense:", totalExpense);
    } catch (error) {
      console.error("Error calculating total expense:", error);
    }

    // 8. Total Counter Sale (sum of all counter sales from Billing table within date range)
    let totalCounterSale = 0;
    try {
      const BillingModel = (await import('@repo/lib/models/Vendor/Billing.model')).default;

      // BillingModel uses createdAt for date filtering
      // Try with string vendorId first
      let billingAggregation = await BillingModel.aggregate([
        {
          $match: {
            vendorId: vendorId,
            createdAt: { $gte: startDate, $lte: endDate },
            // Optional: filter by paymentStatus if needed, e.g., 'Completed'
            // paymentStatus: 'Completed' 
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" }
          }
        }
      ]);

      // If that doesn't work, try with ObjectId
      if (billingAggregation.length === 0) {
        try {
          const mongoose = require('mongoose');
          const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
          billingAggregation = await BillingModel.aggregate([
            {
              $match: {
                vendorId: vendorObjectId,
                createdAt: { $gte: startDate, $lte: endDate }
              }
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$totalAmount" }
              }
            }
          ]);
        } catch (error) {
          console.log("Error converting vendorId to ObjectId for billing query:", error.message);
        }
      }

      totalCounterSale = billingAggregation.length > 0 ? billingAggregation[0].totalAmount : 0;
      console.log("Total Counter Sale:", totalCounterSale);
    } catch (error) {
      console.error("Error calculating total counter sale:", error);
    }

    // Calculate combined total revenue (gross sales from services + gross sales from products + counter sales - expenses)
    // The user wants: (amount + addOnsAmount + deliveredProductRevenue + totalCounterSale) - totalExpense
    const combinedTotalRevenue = (totalServiceRevenue + deliveredProductRevenue + totalCounterSale) - totalExpense;
    console.log("Combined total revenue (appointments + products + counter - expenses):", combinedTotalRevenue);
    console.log("Gross sales breakdown:");
    console.log("- Service gross sales (completed appointments including add-ons):", totalServiceRevenue);
    console.log("- Product gross sales (delivered products):", deliveredProductRevenue);
    console.log("- Counter sales:", totalCounterSale);
    console.log("- Expenses (to be subtracted):", totalExpense);

    // Also check what the actual status values are in the database
    const statusDistribution = await AppointmentModel.aggregate([
      {
        $match: {
          vendorId: vendorId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    console.log("Status distribution:", JSON.stringify(statusDistribution, null, 2));

    const paymentStatusDistribution = await AppointmentModel.aggregate([
      {
        $match: {
          vendorId: vendorId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 }
        }
      }
    ]);
    console.log("Payment status distribution:", JSON.stringify(paymentStatusDistribution, null, 2));

    // 2. Total Bookings (total number of ALL appointments within date range)
    // Try with string vendorId first
    let totalBookings = await AppointmentModel.countDocuments({
      vendorId: vendorId,
      date: { $gte: startDate, $lte: endDate }
    });

    // If that doesn't work, try with ObjectId
    if (totalBookings === 0) {
      try {
        const mongoose = require('mongoose');
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        totalBookings = await AppointmentModel.countDocuments({
          vendorId: vendorObjectId,
          date: { $gte: startDate, $lte: endDate }
        });
      } catch (error) {
        console.log("Error converting vendorId to ObjectId for total bookings query:", error.message);
      }
    }

    console.log("Total bookings (all appointments):", totalBookings);

    // 3. Booking Hours (total hours booked from ALL appointments within date range)
    // Try with string vendorId first
    let appointmentsWithDuration = await AppointmentModel.find({
      vendorId: vendorId,
      date: { $gte: startDate, $lte: endDate }
    }, { duration: 1 });

    // If that doesn't work, try with ObjectId
    if (appointmentsWithDuration.length === 0) {
      try {
        const mongoose = require('mongoose');
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        appointmentsWithDuration = await AppointmentModel.find({
          vendorId: vendorObjectId,
          date: { $gte: startDate, $lte: endDate }
        }, { duration: 1 });
      } catch (error) {
        console.log("Error converting vendorId to ObjectId for booking hours query:", error.message);
      }
    }

    console.log("Appointments with duration count:", appointmentsWithDuration.length);

    // Calculate total booking hours
    const totalDurationMinutes = appointmentsWithDuration.reduce((sum, appointment) => sum + (appointment.duration || 0), 0);
    const bookingHours = totalDurationMinutes / 60;

    console.log("Booking hours (all appointments):", bookingHours);

    // 4. Selling Services Revenue (revenue from completed appointments only, excluding product revenue)
    const sellingServicesRevenue = totalServiceRevenue; // Use only appointment revenue for selling services revenue
    console.log("Selling services revenue (appointments only):", sellingServicesRevenue);

    // Log breakdown of revenue sources
    console.log("Revenue breakdown:");
    console.log("- Appointment revenue:", totalServiceRevenue);
    console.log("- Product revenue:", deliveredProductRevenue);
    console.log("- Combined total revenue:", combinedTotalRevenue);

    // Check if we have appointments with service items (multi-service appointments)
    // Try with string vendorId first
    let multiServiceAppointments = await AppointmentModel.countDocuments({
      vendorId: vendorId,
      date: { $gte: startDate, $lte: endDate },
      isMultiService: true
    });

    // If that doesn't work, try with ObjectId
    if (multiServiceAppointments === 0) {
      try {
        const mongoose = require('mongoose');
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        multiServiceAppointments = await AppointmentModel.countDocuments({
          vendorId: vendorObjectId,
          date: { $gte: startDate, $lte: endDate },
          isMultiService: true
        });
      } catch (error) {
        console.log("Error converting vendorId to ObjectId for multi-service query:", error.message);
      }
    }

    console.log("Multi-service appointments count:", multiServiceAppointments);

    // 5. Cancelled Appointments (count + revenue loss from ALL cancelled appointments within date range)
    // Try with string vendorId first
    let cancelledAppointmentsData = await AppointmentModel.aggregate([
      {
        $match: {
          vendorId: vendorId,
          date: { $gte: startDate, $lte: endDate },
          status: 'cancelled'
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenueLoss: { $sum: "$finalAmount" }
        }
      }
    ]);

    // If that doesn't work, try with ObjectId
    if (cancelledAppointmentsData.length === 0) {
      try {
        const mongoose = require('mongoose');
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        cancelledAppointmentsData = await AppointmentModel.aggregate([
          {
            $match: {
              vendorId: vendorObjectId,
              date: { $gte: startDate, $lte: endDate },
              status: 'cancelled'
            }
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              revenueLoss: { $sum: "$finalAmount" }
            }
          }
        ]);
      } catch (error) {
        console.log("Error converting vendorId to ObjectId for cancelled appointments query:", error.message);
      }
    }

    console.log("Cancelled appointments aggregation result:", JSON.stringify(cancelledAppointmentsData, null, 2));

    const cancelledAppointments = {
      count: cancelledAppointmentsData.length > 0 ? cancelledAppointmentsData[0].count : 0,
      revenueLoss: cancelledAppointmentsData.length > 0 ? cancelledAppointmentsData[0].revenueLoss : 0
    };

    console.log("Cancelled appointments (all):", JSON.stringify(cancelledAppointments, null, 2));

    // 6. Upcoming Appointments (count of scheduled/confirmed appointments for the next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    // Try with string vendorId first
    let upcomingAppointments = await AppointmentModel.countDocuments({
      vendorId: vendorId,
      status: { $in: ['scheduled', 'confirmed'] },
      date: { $gte: new Date(), $lte: nextWeek }
    });

    // If that doesn't work, try with ObjectId
    if (upcomingAppointments === 0) {
      try {
        const mongoose = require('mongoose');
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        upcomingAppointments = await AppointmentModel.countDocuments({
          vendorId: vendorObjectId,
          status: { $in: ['scheduled', 'confirmed'] },
          date: { $gte: new Date(), $lte: nextWeek }
        });
      } catch (error) {
        console.log("Error converting vendorId to ObjectId for upcoming appointments query:", error.message);
      }
    }

    console.log("Upcoming appointments (next 7 days):", upcomingAppointments);

    // Calculate Total Business: sum of finalAmount for completed appointments
    // For multi-service appointments, we count finalAmount only once per appointment
    // Try with string vendorId first
    let totalBusinessAggregation = await AppointmentModel.aggregate([
      {
        $match: {
          vendorId: vendorId,
          date: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$_id',  // Group by appointment ID to avoid double counting multi-service appointments
          finalAmount: { $first: '$finalAmount' },
          totalAmount: { $first: '$totalAmount' }
        }
      },
      {
        $group: {
          _id: null,
          totalBusiness: { $sum: { $ifNull: ['$finalAmount', '$totalAmount'] } }
        }
      }
    ]);

    // If that doesn't work, try with ObjectId
    if (totalBusinessAggregation.length === 0) {
      try {
        const mongoose = require('mongoose');
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        totalBusinessAggregation = await AppointmentModel.aggregate([
          {
            $match: {
              vendorId: vendorObjectId,
              date: { $gte: startDate, $lte: endDate },
              status: 'completed'
            }
          },
          {
            $group: {
              _id: '$_id',  // Group by appointment ID to avoid double counting multi-service appointments
              finalAmount: { $first: '$finalAmount' },
              totalAmount: { $first: '$totalAmount' }
            }
          },
          {
            $group: {
              _id: null,
              totalBusiness: { $sum: { $ifNull: ['$finalAmount', '$totalAmount'] } }
            }
          }
        ]);
      } catch (error) {
        console.log("Error converting vendorId to ObjectId for total business query:", error.message);
      }
    }

    const totalBusiness = totalBusinessAggregation.length > 0 ? totalBusinessAggregation[0].totalBusiness : 0;

    // Compile final metrics
    const metrics = {
      totalRevenue: combinedTotalRevenue, // Combined revenue: (Services + Products + Counter) - Expenses
      totalBookings: totalBookings,
      bookingHours: parseFloat(bookingHours.toFixed(2)),
      sellingServicesRevenue: totalServiceRevenue, // Revenue from completed service appointments
      sellingProductsRevenue: deliveredProductRevenue, // Revenue from delivered product orders
      cancelledAppointments: cancelledAppointments,
      upcomingAppointments: upcomingAppointments,
      totalBusiness: totalBusiness,
      completedAppointments: completedAppointmentsCount, // Added completed appointments count
      totalExpense: totalExpense, // Added total expense
      totalCounterSale: totalCounterSale // Added total counter sale
    };

    console.log("Final metrics:", JSON.stringify(metrics, null, 2));

    return NextResponse.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error("Error fetching vendor dashboard metrics:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Wrap the handler with auth middleware
export const GET = authMiddlewareCrm(getVendorMetricsHandler);