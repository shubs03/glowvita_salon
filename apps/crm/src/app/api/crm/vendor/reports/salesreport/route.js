import { NextResponse } from "next/server";
import _db from '@repo/lib/db';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import ClientOrderModel from '@repo/lib/models/user/ClientOrder.model';
import SmsTransaction from '@repo/lib/models/Marketing/SmsPurchaseHistory.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import { authMiddlewareCrm } from '@/middlewareCrm.js';
import { parseDate } from '../../../../../../utils/dateParser';

await _db();

// Helper function to calculate date ranges
const getDateRanges = (period) => {
  const now = new Date();
  let startDate, endDate;

  if (period === 'day' || period === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (period === 'yesterday') {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
  } else if (period === 'week') {
    const dayOfWeek = now.getDay();
    startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else {
    startDate = new Date(2020, 0, 1);
    endDate = new Date(now.getFullYear() + 1, 0, 1, 23, 59, 59, 999);
  }
  return { startDate, endDate };
};

export const GET = authMiddlewareCrm(async (req) => {
  try {
    const vendorId = req.user.userId.toString();
    const { searchParams } = new URL(req.url);

    const period = searchParams.get('period') || 'all';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let startDate, endDate;
    if (startDateParam && endDateParam) {
      startDate = parseDate(startDateParam);
      endDate = parseDate(endDateParam);
      if (startDate.toDateString() === endDate.toDateString()) {
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);
      }
    } else {
      const range = getDateRanges(period);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    const dateQuery = { $gte: startDate, $lte: endDate };

    // 1. Fetch Appointments (Service Sales)
    const appointments = await AppointmentModel.find({
      vendorId,
      date: dateQuery,
      status: 'completed'
    }).lean();

    // 2. Fetch Product Orders
    const productOrders = await ClientOrderModel.find({
      vendorId,
      createdAt: dateQuery,
      status: 'Delivered'
    }).lean();

    // 3. Fetch SMS Transactions
    const smsTransactions = await SmsTransaction.find({
      userId: vendorId,
      purchaseDate: dateQuery,
      status: 'active'
    }).lean();

    // 4. Fetch Subscriptions from Vendor Model
    const vendor = await VendorModel.findById(vendorId).select('subscription').lean();
    const subscriptionHistory = vendor?.subscription?.history || [];
    const filteredSubscriptions = subscriptionHistory.filter(sub => {
      const subDate = new Date(sub.startDate);
      return subDate >= startDate && subDate <= endDate;
    });

    // Consolidate data by Date
    const dailyData = {};

    const getDayKey = (date) => new Date(date).toISOString().split('T')[0];

    // Process Appointments
    appointments.forEach(appt => {
      const day = getDayKey(appt.date);
      if (!dailyData[day]) dailyData[day] = createEmptyDay(day);
      
      dailyData[day].totalServiceAmount += appt.finalAmount || 0;
      dailyData[day].totalPlatformFees += appt.platformFee || 0;
      dailyData[day].totalServiceTax += appt.serviceTax || 0;
    });

    // Process Product Orders
    productOrders.forEach(order => {
      const day = getDayKey(order.createdAt);
      if (!dailyData[day]) dailyData[day] = createEmptyDay(day);
      
      dailyData[day].totalProductAmount += order.totalAmount || 0;
      dailyData[day].totalProductPlatformFee += order.platformFee || 0;
      dailyData[day].totalProductTax += order.taxAmount || 0;
    });

    // Process SMS
    smsTransactions.forEach(tx => {
      const day = getDayKey(tx.purchaseDate);
      if (!dailyData[day]) dailyData[day] = createEmptyDay(day);
      
      dailyData[day].smsAmount += tx.price || 0;
    });

    // Process Subscriptions
    filteredSubscriptions.forEach(sub => {
      const day = getDayKey(sub.startDate);
      if (!dailyData[day]) dailyData[day] = createEmptyDay(day);
      
      // We need the price of the plan. Since history might not have price, 
      // this is a bit tricky if the history doesn't store it.
      // Usually, it's better if history has price. If not, we might need to fetch plan.
      // For now, assume history has 'price' or we use 0.
      dailyData[day].subscriptionAmount += sub.price || 0;
    });

    // Format for response
    const salesReport = Object.values(dailyData).map(day => {
      const totalBusiness = 
        day.totalServiceAmount + 
        day.totalProductAmount + 
        day.totalServiceTax + 
        day.totalProductTax + 
        day.totalProductPlatformFee + 
        day.totalPlatformFees + 
        day.subscriptionAmount + 
        day.smsAmount;

      return {
        "Date": day.date,
        "Total Service Amount (₹)": `₹${day.totalServiceAmount.toFixed(2)}`,
        "Total Product Amount (₹)": `₹${day.totalProductAmount.toFixed(2)}`,
        "Service Tax (₹)": `₹${day.totalServiceTax.toFixed(2)}`,
        "Product Tax/GST (₹)": `₹${day.totalProductTax.toFixed(2)}`,
        "Product Platform Fee (₹)": `₹${day.totalProductPlatformFee.toFixed(2)}`,
        "Service Platform Fees (₹)": `₹${day.totalPlatformFees.toFixed(2)}`,
        "Subscription Amount (₹)": `₹${day.subscriptionAmount.toFixed(2)}`,
        "SMS Amount (₹)": `₹${day.smsAmount.toFixed(2)}`,
        "Total Business (₹)": `₹${totalBusiness.toFixed(2)}`,
        raw: { ...day, totalBusiness }
      };
    }).sort((a, b) => b.Date.localeCompare(a.Date));

    // Aggregated Totals
    const aggregatedTotals = salesReport.reduce((acc, curr) => {
      acc.totalServiceAmount += curr.raw.totalServiceAmount;
      acc.totalProductAmount += curr.raw.totalProductAmount;
      acc.totalServiceTax += curr.raw.totalServiceTax;
      acc.totalProductTax += curr.raw.totalProductTax;
      acc.totalProductPlatformFee += curr.raw.totalProductPlatformFee;
      acc.totalPlatformFees += curr.raw.totalPlatformFees;
      acc.subscriptionAmount += curr.raw.subscriptionAmount;
      acc.smsAmount += curr.raw.smsAmount;
      acc.totalBusiness += curr.raw.totalBusiness;
      return acc;
    }, {
      totalServiceAmount: 0,
      totalProductAmount: 0,
      totalServiceTax: 0,
      totalProductTax: 0,
      totalProductPlatformFee: 0,
      totalPlatformFees: 0,
      subscriptionAmount: 0,
      smsAmount: 0,
      totalBusiness: 0
    });

    aggregatedTotals.totalBusinessFormatted = `₹${aggregatedTotals.totalBusiness.toFixed(2)}`;

    return NextResponse.json({
      success: true,
      data: {
        salesReport,
        aggregatedTotals,
        filter: period !== 'custom' ? period : `${startDateParam} to ${endDateParam}`
      }
    });

  } catch (error) {
    console.error("Consolidated Sales Report Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
});

function createEmptyDay(date) {
  return {
    date,
    totalServiceAmount: 0,
    totalProductAmount: 0,
    totalProductPlatformFee: 0,
    totalPlatformFees: 0,
    totalServiceTax: 0,
    totalProductTax: 0,
    subscriptionAmount: 0,
    smsAmount: 0
  };
}
