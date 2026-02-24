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
      const castedAssigned = (assignedRegions || []).map(id => id.toString());
      if (selectedRegionId && castedAssigned.includes(selectedRegionId)) {
        allowedRegionIds = [new mongoose.Types.ObjectId(selectedRegionId)];
      } else {
        allowedRegionIds = (assignedRegions || []).map(id => new mongoose.Types.ObjectId(id));
      }
    } else if (selectedRegionId && selectedRegionId !== 'all') {
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
        { $lookup: { from: 'vendors', localField: 'vendorId', foreignField: '_id', as: 'v' } },
        { $lookup: { from: 'suppliers', localField: 'vendorId', foreignField: '_id', as: 's' } },
        { $unwind: { path: '$v', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$s', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            effectiveRegionId: { $ifNull: ["$regionId", "$v.regionId", "$s.regionId"] },
            providerType: { $cond: [{ $ifNull: ["$s._id", false] }, "Supplier", "Vendor"] }
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

    const runProductAggregation = async () => {
      const pipeline = [
        { $match: { ...generalDateMatch, status: 'Delivered' } },
        {
          $lookup: {
            from: 'crm_products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'productInfo'
          }
        },
        {
          $lookup: {
            from: 'vendors',
            localField: 'vendorId',
            foreignField: '_id',
            as: 'vendorDoc'
          }
        },
        {
          $lookup: {
            from: 'suppliers',
            localField: 'vendorId',
            foreignField: '_id',
            as: 'supplierDoc'
          }
        },
        { $unwind: { path: '$vendorDoc', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$supplierDoc', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            // Determine origin from products in the order
            origin: { $ifNull: [{ $arrayElemAt: ["$productInfo.origin", 0] }, "Vendor"] },
            // Fallback for region matching: Order.regionId -> Vendor region -> Supplier region
            effectiveRegionId: {
              $ifNull: [
                "$regionId",
                "$vendorDoc.regionId",
                "$supplierDoc.regionId"
              ]
            }
          }
        },
        { $match: buildRegionalMatch() },
        {
          $group: {
            _id: "$origin",
            totalFees: { $sum: "$platformFeeAmount" },
            totalSales: { $sum: "$totalAmount" }
          }
        }
      ];

      const results = await ClientOrderModel.aggregate(pipeline);
      const data = {
        Vendor: { fees: 0, sales: 0 },
        Supplier: { fees: 0, sales: 0 }
      };

      results.forEach(r => {
        if (data[r._id]) {
          data[r._id].fees = r.totalFees;
          data[r._id].sales = r.totalSales;
        }
      });

      return data;
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
    const [totalBookingsAgg, completedBookingsAgg, cancelledBookingsAgg] = await Promise.all([
      AppointmentModel.aggregate([
        ...(await runEntityAggregation(AppointmentModel, appointmentDateMatch)),
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            online: { $sum: { $cond: [{ $eq: ["$mode", "online"] }, 1, 0] } },
            offline: { $sum: { $cond: [{ $eq: ["$mode", "offline"] }, 1, 0] } }
          }
        }
      ]),
      AppointmentModel.aggregate([
        ...(await runEntityAggregation(AppointmentModel, appointmentDateMatch)),
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: "$providerType",
            total: { $sum: 1 },
            online: { $sum: { $cond: [{ $eq: ["$mode", "online"] }, 1, 0] } },
            offline: { $sum: { $cond: [{ $eq: ["$mode", "offline"] }, 1, 0] } },
            fees: { $sum: "$platformFee" },
            gross: { $sum: "$totalAmount" }
          }
        }
      ]),
      AppointmentModel.aggregate([
        ...(await runEntityAggregation(AppointmentModel, appointmentDateMatch)),
        { $match: { status: 'cancelled' } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            online: { $sum: { $cond: [{ $eq: ["$mode", "online"] }, 1, 0] } },
            offline: { $sum: { $cond: [{ $eq: ["$mode", "offline"] }, 1, 0] } }
          }
        }
      ])
    ]);

    const totalData = totalBookingsAgg[0] || { total: 0, online: 0, offline: 0 };
    const cancelledData = cancelledBookingsAgg[0] || { total: 0, online: 0, offline: 0 };

    const completedData = {
      total: 0, online: 0, offline: 0, fees: 0, gross: 0,
      Vendor: { gross: 0, fees: 0 },
      Supplier: { gross: 0, fees: 0 }
    };

    completedBookingsAgg.forEach(r => {
      completedData.total += r.total;
      completedData.online += r.online;
      completedData.offline += r.offline;
      completedData.fees += r.fees;
      completedData.gross += r.gross;
      if (completedData[r._id]) {
        completedData[r._id].gross = r.gross;
        completedData[r._id].fees = r.fees;
      }
    });

    const servicePlatformFees = completedData.fees;
    const serviceGrossAmount = completedData.gross;
    const vendorServiceAmount = completedData.Vendor.gross;
    const supplierServiceAmount = completedData.Supplier.gross;

    const ClientOrderModel = (await import('@repo/lib/models/user/ClientOrder.model')).default;
    const productData = await runProductAggregation();

    // Total product platform fees is the sum of vendor and supplier fees
    const productPlatformFees = productData.Vendor.fees + productData.Supplier.fees;
    const vendorProductAmount = productData.Vendor.fees;
    const supplierProductAmount = productData.Supplier.fees;

    const subscriptionAmount = await calculateSubscriptionAmount(req, filterType, filterValue);
    const subscriptionStats = await getSubscriptionStats(req);
    const smsAmount = await getSmsAmount(req, filterType, filterValue, selectedRegionId);

    const totalRevenue = servicePlatformFees + productPlatformFees + subscriptionAmount + smsAmount;

    // 4. Accurate Region-Wise Sales for Charts and Tables
    const regionWiseSales = await getRegionWiseRevenueDetailed(req, allowedRegionIds);

    // 5. Top Performance
    const [servicesData, productsData] = await Promise.all([
      (async () => {
        try {
          const mod = await import('../reports/booking-summary/selling-services/route');
          const url = new URL(req.url);
          url.pathname = '/api/admin/reports/booking-summary/selling-services';
          if (selectedRegionId) {
            url.searchParams.set('regionId', selectedRegionId);
          }
          const res = await mod.GET(new Request(url.href, { headers: req.headers }));
          const json = await res.json();
          return json?.data || {};
        } catch (e) { return {}; }
      })(),
      (async () => {
        try {
          const mod = await import('../reports/booking-summary/sales-by-products/route');
          const url = new URL(req.url);
          url.pathname = '/api/admin/reports/booking-summary/sales-by-products';
          if (selectedRegionId) {
            url.searchParams.set('regionId', selectedRegionId);
          }
          const res = await mod.GET(new Request(url.href, { headers: req.headers }));
          const json = await res.json();
          return json?.data || {};
        } catch (e) { return {}; }
      })()
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
        subscriptionStats: subscriptionStats,
        smsAmount: smsAmount,
        serviceAmount: serviceGrossAmount,
        productAmount: productData.Vendor.sales + productData.Supplier.sales,
        servicePlatformFees,
        productPlatformFees,
        vendorServiceAmount,
        supplierServiceAmount,
        vendorProductAmount: productData.Vendor.sales,
        supplierProductAmount: productData.Supplier.sales,
        vendorProductFees: productData.Vendor.fees,
        supplierProductFees: productData.Supplier.fees,
        totalProductSales: productData.Vendor.sales + productData.Supplier.sales,
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
    { $lookup: { from: 'suppliers', localField: 'vendorId', foreignField: '_id', as: 's' } },
    { $unwind: { path: '$v', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$s', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        rid: {
          $ifNull: [
            "$regionId",
            "$v.regionId",
            "$s.regionId"
          ]
        }
      }
    }
  ];

  const [serviceSales, productSales, vendorCounts, supplierCounts] = await Promise.all([
    AppointmentModel.aggregate([
      ...basePipeline({ status: 'completed' }),
      {
        $group: {
          _id: "$rid",
          totalServiceAmount: { $sum: "$totalAmount" },
          servicePlatformFees: { $sum: "$platformFee" },
          serviceTax: { $sum: "$serviceTax" }
        }
      }
    ]),
    ClientOrderModel.aggregate([
      ...basePipeline({ status: 'Delivered' }),
      {
        $group: {
          _id: "$rid",
          totalProductAmount: { $sum: "$totalAmount" },
          productPlatformFees: { $sum: "$platformFeeAmount" },
          productTax: { $sum: "$gstAmount" }
        }
      }
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

  return result.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

async function getSmsAmount(req, filterType, filterValue, selectedRegionId) {
  try {
    const marketingReportModule = await import('../reports/marketing-reports/campaigns/route');
    const url = new URL(req.url);
    url.pathname = '/api/admin/reports/marketing-reports/campaigns';
    if (selectedRegionId) {
      url.searchParams.set('regionId', selectedRegionId);
    }
    const marketingReportRes = await marketingReportModule.GET(new Request(url.href, { headers: req.headers }));
    const data = await marketingReportRes.json();
    return data?.success ? (data.data.campaigns || []).reduce((sum, c) => sum + (c.price || 0), 0) : 0;
  } catch (e) { return 0; }
}

/** 
 * Refactored to use explicit strings above instead of generic dynamic imports to avoid Webpack warnings
 */

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

async function getSubscriptionStats(req) {
  try {
    const VendorModel = (await import('@repo/lib/models/Vendor/Vendor.model')).default;
    const SupplierModel = (await import('@repo/lib/models/Vendor/Supplier.model')).default;
    const regionQuery = buildRegionQueryFromRequest(req);

    const [activeVendors, inactiveVendors, activeSuppliers, inactiveSuppliers] = await Promise.all([
      VendorModel.countDocuments({ ...regionQuery, "subscription.status": "Active" }),
      VendorModel.countDocuments({ ...regionQuery, "subscription.status": { $ne: "Active" } }),
      SupplierModel.countDocuments({ ...regionQuery, "subscription.status": "Active" }),
      SupplierModel.countDocuments({ ...regionQuery, "subscription.status": { $ne: "Active" } })
    ]);

    return {
      active: activeVendors + activeSuppliers,
      inactive: inactiveVendors + inactiveSuppliers
    };
  } catch (e) {
    return { active: 0, inactive: 0 };
  }
}