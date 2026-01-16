import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import { authMiddlewareAdmin } from "../../../../middlewareAdmin";
import { buildRegionQueryFromRequest } from "@repo/lib";
import mongoose from 'mongoose';

// Initialize database connection
const initDb = async () => {
  try {
    await _db();
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
};

// GET - Fetch dashboard statistics with optional date filtering
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    await initDb();
    
    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get('filterType');
    const filterValue = searchParams.get('filterValue');
    const selectedRegionId = searchParams.get('regionId');
    
    if (filterType && !filterValue) {
      return NextResponse.json({ success: false, message: "Filter value required" }, { status: 400 });
    }

    // Date Filter Construction
    const getDateRange = (type, value) => {
      let start, end;
      if (!type || !value) return null;
      switch (type) {
        case 'day':
          const [y, m, d] = value.split('-').map(Number);
          start = new Date(y, m - 1, d);
          end = new Date(y, m - 1, d, 23, 59, 59, 999);
          break;
        case 'month':
          const [my, mn] = value.split('-').map(Number);
          start = new Date(my, mn - 1, 1);
          end = new Date(my, mn, 0, 23, 59, 59, 999);
          break;
        case 'year':
          const yv = parseInt(value.trim());
          start = new Date(yv, 0, 1);
          end = new Date(yv, 11, 31, 23, 59, 59, 999);
          break;
      }
      return { start, end };
    };

    const range = getDateRange(filterType, filterValue);
    const appointmentDateMatch = range ? { date: { $gte: range.start, $lte: range.end } } : {};
    const generalDateMatch = range ? { createdAt: { $gte: range.start, $lte: range.end } } : {};

    // Regional Scoping for Admin
    const { roleName, assignedRegions } = req.user;
    let allowedRegionIds = [];
    if (roleName === 'REGIONAL_ADMIN') {
      allowedRegionIds = (assignedRegions || []).map(id => new mongoose.Types.ObjectId(id));
    } else if (selectedRegionId) {
      allowedRegionIds = [new mongoose.Types.ObjectId(selectedRegionId)];
    }

    const buildRegionalMatch = (fieldName = 'effectiveRegionId') => {
      if (allowedRegionIds.length > 0) {
        return { [fieldName]: { $in: allowedRegionIds } };
      }
      return {};
    };

    // 1. Core Models Aggregation (Safe fallback to Vendor Region if missing)
    const runEntityAggregation = async (Model, dateMatch, countField = null, sumField = null) => {
      const pipeline = [
        { $match: dateMatch },
        {
          $lookup: {
            from: 'vendors',
            localField: 'vendorId',
            foreignField: '_id',
            as: 'vendor'
          }
        },
        { $unwind: { path: '$vendor', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            effectiveRegionId: { $ifNull: ["$regionId", "$vendor.regionId"] }
          }
        },
        { $match: buildRegionalMatch() }
      ];

      if (countField) {
        pipeline.push({ $count: "count" });
        const res = await Model.aggregate(pipeline);
        return res[0]?.count || 0;
      }
      
      if (sumField) {
        pipeline.push({ $group: { _id: null, total: { $sum: `$${sumField}` } } });
        const res = await Model.aggregate(pipeline);
        return res[0]?.total || 0;
      }

      return pipeline;
    };

    // 2. Fetch Entity Counts
    const VendorModel = (await import('@repo/lib/models/Vendor/Vendor.model')).default;
    const SupplierModel = (await import('@repo/lib/models/Vendor/Supplier.model')).default;
    const DoctorModel = (await import('@repo/lib/models/Vendor/Docters.model')).default;
    const ClientModel = (await import('@repo/lib/models/Vendor/Client.model')).default;

    // Simple count for top-level entities
    const getTopEntityCount = async (Model) => {
      const q = (roleName === 'REGIONAL_ADMIN' || selectedRegionId) 
        ? { regionId: { $in: allowedRegionIds.length > 0 ? allowedRegionIds : [new mongoose.Types.ObjectId(selectedRegionId)] } } 
        : {};
      return await Model.countDocuments(q);
    };

    const [totalVendors, totalSuppliers, totalDoctors, totalCustomers] = await Promise.all([
      getTopEntityCount(VendorModel),
      getTopEntityCount(SupplierModel),
      getTopEntityCount(DoctorModel),
      runEntityAggregation(ClientModel, generalDateMatch, "count")
    ]);

    // 3. Bookings and Revenue
    const totalBookingsAgg = await AppointmentModel.aggregate([
      ...(await runEntityAggregation(AppointmentModel, appointmentDateMatch)),
      { $group: { 
          _id: null, 
          total: { $sum: 1 }, 
          online: { $sum: { $cond: [{ $eq: ["$mode", "online"] }, 1, 0] } },
          offline: { $sum: { $cond: [{ $eq: ["$mode", "offline"] }, 1, 0] } }
      }}
    ]);
    const totalData = totalBookingsAgg[0] || { total: 0, online: 0, offline: 0 };
    
    const completedBookingsAgg = await AppointmentModel.aggregate([
      ...(await runEntityAggregation(AppointmentModel, appointmentDateMatch)),
      { $match: { status: 'completed' } },
      { $group: { 
          _id: null, 
          total: { $sum: 1 }, 
          online: { $sum: { $cond: [{ $eq: ["$mode", "online"] }, 1, 0] } },
          offline: { $sum: { $cond: [{ $eq: ["$mode", "offline"] }, 1, 0] } },
          fees: { $sum: "$platformFee" }
      }}
    ]);
    const completedData = completedBookingsAgg[0] || { total: 0, online: 0, offline: 0, fees: 0 };
    const servicePlatformFees = completedData.fees;

    const cancelledBookingsAgg = await AppointmentModel.aggregate([
      ...(await runEntityAggregation(AppointmentModel, appointmentDateMatch)),
      { $match: { status: 'cancelled' } },
      { $group: { 
          _id: null, 
          total: { $sum: 1 }, 
          online: { $sum: { $cond: [{ $eq: ["$mode", "online"] }, 1, 0] } }, 
          offline: { $sum: { $cond: [{ $eq: ["$mode", "offline"] }, 1, 0] } } 
      }}
    ]);
    const cancelledData = cancelledBookingsAgg[0] || { total: 0, online: 0, offline: 0 };

    const ClientOrderModel = (await import('@repo/lib/models/user/ClientOrder.model')).default;
    const productPlatformFees = await runEntityAggregation(ClientOrderModel, { ...generalDateMatch, status: 'Delivered' }, null, "platformFeeAmount");

    const subscriptionAmount = await calculateSubscriptionAmount(req, filterType, filterValue);
    const smsAmount = await getSmsAmount(req, filterType, filterValue, selectedRegionId);

    const totalRevenue = servicePlatformFees + productPlatformFees + subscriptionAmount + smsAmount;

    // 4. Accurate Region-Wise Sales for Charts and Tables
    const regionWiseSales = await getRegionWiseRevenueDetailed(req, allowedRegionIds);

    // 5. Top Performance
    const [servicesData, productsData] = await Promise.all([
      getPerformanceData(req, '../reports/booking-summary/selling-services/route'),
      getPerformanceData(req, '../reports/booking-summary/sales-by-products/route')
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: { 
          current: totalRevenue, 
          components: { servicePlatformFees, productPlatformFees, subscriptionAmount, smsAmount } 
        },
        regionWiseSales,
        cityWiseSales: regionWiseSales, // Legacy UI support
        totalBookings: {
          current: totalData.total,
          online: totalData.online,
          offline: totalData.offline,
          completed: completedData.total,
          completedOnline: completedData.online,
          completedOffline: completedData.offline
        },
        totalCustomers: { current: totalCustomers },
        totalVendors: { current: totalVendors },
        totalSuppliers: { current: totalSuppliers },
        totalDoctors: { current: totalDoctors },
        cancelledBookings: { 
          current: cancelledData.total,
          online: cancelledData.online,
          offline: cancelledData.offline
        },
        services: servicesData?.services || [],
        products: productsData?.salesByProducts || [],
        subscriptionAmount: subscriptionAmount,
        smsAmount: smsAmount,
        serviceAmount: servicePlatformFees,
        productAmount: productPlatformFees,
        currentPeriod: filterType ? `${filterType}: ${filterValue}` : 'All time'
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);

async function getRegionWiseRevenueDetailed(req, allowedRegionIds) {
  const AppointmentModel = (await import('@repo/lib/models/Appointment/Appointment.model')).default;
  const ClientOrderModel = (await import('@repo/lib/models/user/ClientOrder.model')).default;
  const RegionModel = (await import('@repo/lib/models/admin/Region')).default;
  const VendorModel = (await import('@repo/lib/models/Vendor/Vendor.model')).default;
  const SupplierModel = (await import('@repo/lib/models/Vendor/Supplier.model')).default;
  const SubscriptionPlanModel = (await import('@repo/lib/models/admin/SubscriptionPlan.model')).default;
  
  const basePipeline = (match) => [
    { $match: match },
    { $lookup: { from: 'vendors', localField: 'vendorId', foreignField: '_id', as: 'v' } },
    { $unwind: { path: '$v', preserveNullAndEmptyArrays: true } },
    { $addFields: { rid: { $ifNull: ["$regionId", "$v.regionId"] } } }
  ];

  const [serviceSales, productSales, vendorCounts, supplierCounts] = await Promise.all([
    AppointmentModel.aggregate([
      ...basePipeline({ status: 'completed' }),
      { $group: { 
          _id: "$rid", 
          totalServiceAmount: { $sum: "$totalAmount" },
          servicePlatformFees: { $sum: "$platformFee" },
          serviceTax: { $sum: "$serviceTax" }
      }}
    ]),
    ClientOrderModel.aggregate([
      ...basePipeline({ status: 'Delivered' }),
      { $group: { 
          _id: "$rid", 
          totalProductAmount: { $sum: "$totalAmount" },
          productPlatformFees: { $sum: "$platformFeeAmount" },
          productTax: { $sum: "$gstAmount" }
      }}
    ]),
    VendorModel.aggregate([
      { $group: { _id: "$regionId", count: { $sum: 1 } } }
    ]),
    SupplierModel.aggregate([
      { $group: { _id: "$regionId", count: { $sum: 1 } } }
    ])
  ]);

  const map = {};
  const getEntry = (id) => {
    const sid = id ? id.toString() : 'other';
    if (!map[sid]) {
      map[sid] = {
        totalBusinesses: 0,
        totalServiceAmount: 0,
        totalProductAmount: 0,
        servicePlatformFees: 0,
        productPlatformFees: 0,
        serviceTax: 0,
        productTax: 0,
        subscriptionAmount: 0,
        smsAmount: 0
      };
    }
    return map[sid];
  };

  serviceSales.forEach(s => {
    const entry = getEntry(s._id);
    entry.totalServiceAmount += s.totalServiceAmount || 0;
    entry.servicePlatformFees += s.servicePlatformFees || 0;
    entry.serviceTax += s.serviceTax || 0;
  });

  productSales.forEach(s => {
    const entry = getEntry(s._id);
    entry.totalProductAmount += s.totalProductAmount || 0;
    entry.productPlatformFees += s.productPlatformFees || 0;
    entry.productTax += s.productTax || 0;
  });

  vendorCounts.forEach(c => {
    const entry = getEntry(c._id);
    entry.totalBusinesses += c.count || 0;
  });

  supplierCounts.forEach(c => {
    const entry = getEntry(c._id);
    entry.totalBusinesses += c.count || 0;
  });

  // Calculate subscriptions per region
  const [vendorsWithSubs, suppliersWithSubs] = await Promise.all([
    VendorModel.find({ "subscription.plan": { $exists: true } }).populate('subscription.plan'),
    SupplierModel.find({ "subscription.plan": { $exists: true } }).populate('subscription.plan')
  ]);

  vendorsWithSubs.forEach(v => {
    if (v.regionId && v.subscription?.plan) {
      const entry = getEntry(v.regionId);
      entry.subscriptionAmount += v.subscription.plan.price || 0;
    }
  });

  suppliersWithSubs.forEach(s => {
    if (s.regionId && s.subscription?.plan) {
      const entry = getEntry(s.regionId);
      entry.subscriptionAmount += s.subscription.plan.price || 0;
    }
  });

  const regions = await RegionModel.find({ _id: { $in: Object.keys(map).filter(id => mongoose.Types.ObjectId.isValid(id)) } });
  const names = regions.reduce((acc, r) => ({ ...acc, [r._id.toString()]: r.name }), {});

  let result = Object.entries(map).map(([id, data]) => {
    const totalRevenue = data.servicePlatformFees + data.productPlatformFees + data.subscriptionAmount + data.smsAmount;
    return {
      regionId: id,
      regionName: names[id] || 'Other',
      city: names[id] || 'Other',
      ...data,
      totalRevenue
    };
  });

  if (allowedRegionIds.length > 0) {
    const allowedStr = allowedRegionIds.map(o => o.toString());
    result = result.filter(r => allowedStr.includes(r.regionId));
  }

  return result.sort((a,b) => b.totalRevenue - a.totalRevenue);
}

async function getSmsAmount(req, filterType, filterValue, selectedRegionId) {
  try {
    const marketingReportModule = await import('../reports/marketing-reports/campaigns/route');
    const marketingReportRes = await marketingReportModule.GET(new Request(new URL('/api/admin/reports/marketing-reports/campaigns', req.url).href, { headers: req.headers }));
    const data = await marketingReportRes.json();
    return data?.success ? (data.data.campaigns || []).reduce((sum, c) => sum + (c.price || 0), 0) : 0;
  } catch (e) { return 0; }
}

async function getPerformanceData(req, path) {
  try {
    const mod = await import(path);
    const res = await mod.GET(new Request(new URL(path, req.url).href, { headers: req.headers }));
    const json = await res.json();
    return json?.data || {};
  } catch (e) { return {}; }
}

async function calculateSubscriptionAmount(req, filterType, filterValue) {
  try {
    const VendorModel = (await import('@repo/lib/models/Vendor/Vendor.model')).default;
    const SupplierModel = (await import('@repo/lib/models/Vendor/Supplier.model')).default;
    const SubscriptionPlanModel = (await import('@repo/lib/models/admin/SubscriptionPlan.model')).default;
    const regionQuery = buildRegionQueryFromRequest(req);
    
    const [vendors, suppliers] = await Promise.all([
      VendorModel.find({ ...regionQuery, "subscription.plan": { $exists: true } }).populate('subscription.plan subscription.history.plan'),
      SupplierModel.find({ ...regionQuery, "subscription.plan": { $exists: true } }).populate('subscription.plan subscription.history.plan')
    ]);

    const filter = (subDate) => {
      if (!filterType || !filterValue) return true;
      const d = new Date(subDate);
      if (filterType === 'day') return d.toDateString() === new Date(filterValue).toDateString();
      if (filterType === 'month') {
        const [y, m] = filterValue.split('-').map(Number);
        return d.getFullYear() === y && d.getMonth() === m - 1;
      }
      if (filterType === 'year') return d.getFullYear() === parseInt(filterValue);
      return true;
    };

    const process = (list) => list.reduce((t, u) => {
      let s = 0;
      if (u.subscription?.plan && filter(u.subscription.startDate)) s += u.subscription.plan.price || 0;
      (u.subscription?.history || []).forEach(h => { if (h.plan && filter(h.startDate)) s += h.plan.price || 0; });
      return t + s;
    }, 0);

    return process(vendors) + process(suppliers);
  } catch (e) { return 0; }
}