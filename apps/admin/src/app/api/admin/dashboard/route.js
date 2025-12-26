import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import { authMiddlewareAdmin } from "../../../../middlewareAdmin";

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
    
    // Extract filter parameters from query
    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get('filterType'); // 'day', 'month', 'year', or null
    const filterValue = searchParams.get('filterValue'); // specific date value
    
    // Validate filter parameters
    if (filterType && !filterValue) {
      return NextResponse.json({ 
        success: false,
        message: "Filter value is required when filter type is specified" 
      }, { status: 400 });
    }
    
    // If no filter type, ensure no filter value is passed
    if (!filterType && filterValue) {
      return NextResponse.json({ 
        success: false,
        message: "Filter type is required when filter value is specified" 
      }, { status: 400 });
    }
    
    // Validate filter value format based on filter type
    if (filterType === 'day' && filterValue && !/^\d{4}-\d{2}-\d{2}$/.test(filterValue)) {
      return NextResponse.json({ 
        success: false,
        message: "Invalid date format for day filter. Expected YYYY-MM-DD" 
      }, { status: 400 });
    }
    
    if (filterType === 'month' && filterValue && !/^\d{4}-\d{2}$/.test(filterValue)) {
      return NextResponse.json({ 
        success: false,
        message: "Invalid date format for month filter. Expected YYYY-MM" 
      }, { status: 400 });
    }
    
    if (filterType === 'year' && filterValue) {
      // Trim whitespace and validate year format
      const trimmedValue = filterValue.trim();
      if (!/^\d{4}$/.test(trimmedValue)) {
        return NextResponse.json({ 
          success: false,
          message: "Invalid date format for year filter. Expected YYYY (e.g., 2023)" 
        }, { status: 400 });
      }
      
      // Additional validation: check if year is reasonable (between 2020 and next year)
      const yearNum = parseInt(trimmedValue);
      const currentYear = new Date().getFullYear();
      if (yearNum < 2020 || yearNum > currentYear + 1) {
        return NextResponse.json({ 
          success: false,
          message: `Year must be between 2020 and ${currentYear + 1}` 
        }, { status: 400 });
      }
    }
    
    // Build date filter based on parameters
    const buildDateFilter = (filterType, filterValue) => {
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
    
    // Fetch total bookings data
    const totalBookings = await AppointmentModel.countDocuments(dateFilter);
    
    // Fetch completed bookings data
    const completedBookingsPipeline = [
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          online: {
            $sum: {
              $cond: [{ $eq: ["$mode", "online"] }, 1, 0]
            }
          },
          offline: {
            $sum: {
              $cond: [{ $eq: ["$mode", "offline"] }, 1, 0]
            }
          }
        }
      }
    ];
    
    const completedBookingsResult = await AppointmentModel.aggregate(completedBookingsPipeline);
    const completedBookingsData = completedBookingsResult.length > 0 ? completedBookingsResult[0] : { total: 0, online: 0, offline: 0 };
    
    // Fetch cancelled bookings data
    const cancelledBookingsPipeline = [
      { $match: { ...dateFilter, status: 'cancelled' } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          online: {
            $sum: {
              $cond: [{ $eq: ["$mode", "online"] }, 1, 0]
            }
          },
          offline: {
            $sum: {
              $cond: [{ $eq: ["$mode", "offline"] }, 1, 0]
            }
          }
        }
      }
    ];
    
    const cancelledBookingsResult = await AppointmentModel.aggregate(cancelledBookingsPipeline);
    const cancelledBookingsData = cancelledBookingsResult.length > 0 ? cancelledBookingsResult[0] : { total: 0, online: 0, offline: 0 };
    
    // Calculate online and offline bookings
    const onlineBookingsPipeline = [
      { $match: { ...dateFilter, mode: 'online' } },
      { $count: "total" }
    ];
    
    const onlineBookingsResult = await AppointmentModel.aggregate(onlineBookingsPipeline);
    const onlineBookings = onlineBookingsResult.length > 0 ? onlineBookingsResult[0].total : 0;
    
    const offlineBookingsPipeline = [
      { $match: { ...dateFilter, mode: 'offline' } },
      { $count: "total" }
    ];
    
    const offlineBookingsResult = await AppointmentModel.aggregate(offlineBookingsPipeline);
    const offlineBookings = offlineBookingsResult.length > 0 ? offlineBookingsResult[0].total : 0;
    
    // Fetch total vendors count
    const VendorModel = (await import('@repo/lib/models/Vendor/Vendor.model')).default;
    const totalVendors = await VendorModel.countDocuments({});
    
    // Fetch total suppliers count
    const SupplierModel = (await import('@repo/lib/models/Vendor/Supplier.model')).default;
    const totalSuppliers = await SupplierModel.countDocuments({});
    
    // Calculate platform fees from completed bookings
    const platformFeesPipeline = [
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalPlatformFees: { $sum: "$platformFee" }
        }
      }
    ];
    
    const platformFeesResult = await AppointmentModel.aggregate(platformFeesPipeline);
    const platformFees = platformFeesResult.length > 0 ? platformFeesResult[0].totalPlatformFees : 0;
    
    // Calculate service amount (platform fees from completed bookings)
    const serviceAmount = platformFees;
    
    // Calculate product platform fees from sales by products
    const ClientOrderModel = (await import('@repo/lib/models/user/ClientOrder.model')).default;
    
    // Get product platform fees from delivered orders
    const productPlatformFeesPipeline = [
      { $match: { ...dateFilter, status: 'Delivered' } },
      {
        $group: {
          _id: null,
          totalProductPlatformFees: { $sum: "$platformFeeAmount" }
        }
      }
    ];
    
    const productPlatformFeesResult = await ClientOrderModel.aggregate(productPlatformFeesPipeline);
    const productPlatformFees = productPlatformFeesResult.length > 0 ? productPlatformFeesResult[0].totalProductPlatformFees : 0;
    

    
    // Calculate subscription amount from vendor and supplier subscriptions
    const subscriptionAmount = await calculateSubscriptionAmount(dateFilter);
    
    // Import and fetch marketing campaign report data for SMS amount calculation
    const marketingReportModule = await import('../reports/marketing-reports/campaigns/route');
    
    // Import sales report route for city-wise sales data
    const salesReportModule = await import('../reports/Financial-Reports/salesreport/route');
    
    // Import selling services route for service sales data
    const sellingServicesModule = await import('../reports/booking-summary/selling-services/route');
    
    // Import sales by products route for product sales data
    const salesByProductsModule = await import('../reports/booking-summary/sales-by-products/route');
    
    // Convert filter parameters to startDate/endDate format for marketing campaign API
    let startDate = null;
    let endDate = null;
    
    if (filterType && filterValue) {
      if (filterType === 'day') {
        startDate = filterValue;
        endDate = filterValue;
      } else if (filterType === 'month') {
        // First day of month
        startDate = `${filterValue}-01`;
        // Last day of month
        const year = parseInt(filterValue.split('-')[0]);
        const month = parseInt(filterValue.split('-')[1]);
        const lastDay = new Date(year, month, 0).getDate();
        endDate = `${filterValue}-${lastDay.toString().padStart(2, '0')}`;
      } else if (filterType === 'year') {
        startDate = `${filterValue}-01-01`;
        endDate = `${filterValue}-12-31`;
      }
    }
    
    const marketingParams = {};
    if (startDate) marketingParams.startDate = startDate;
    if (endDate) marketingParams.endDate = endDate;
    
    // Create internal request to fetch marketing campaign data
    const createInternalRequest = (pathname, additionalParams = {}) => {
      const url = new URL(pathname, req.url);
      if (filterType) url.searchParams.set('filterType', filterType);
      if (filterValue) url.searchParams.set('filterValue', filterValue);
      
      // Add additional parameters if provided
      Object.keys(additionalParams).forEach(key => {
        url.searchParams.set(key, additionalParams[key]);
      });
      
      return new Request(url.href, {
        method: 'GET',
        headers: req.headers,
      });
    };
    
    const marketingReportRes = await marketingReportModule.GET(createInternalRequest('/api/admin/reports/marketing-reports/campaigns', marketingParams));
    const marketingReportData = await marketingReportRes.json();
    
    // Calculate SMS amount from marketing campaign data
    const smsAmount = marketingReportData?.success && marketingReportData.data?.campaigns ? 
      marketingReportData.data.campaigns.reduce((sum, campaign) => sum + (campaign.price || 0), 0) : 0;
    
    // Fetch city-wise sales data from sales report
    const salesReportRes = await salesReportModule.GET(createInternalRequest('/api/admin/reports/Financial-Reports/salesreport'));
    const salesReportData = await salesReportRes.json();
    
    // Extract city-wise sales data
    const cityWiseSales = salesReportData?.success && salesReportData.data?.consolidatedData ? 
      salesReportData.data.consolidatedData.reduce((cityMap, vendorData) => {
        const city = vendorData.city;
        if (!cityMap[city]) {
          cityMap[city] = {
            city: city,
            totalBusinesses: 0,
            servicePlatformFees: 0,
            productPlatformFees: 0,
            subscriptionAmount: 0,
            smsAmount: 0,
            totalRevenue: 0
          };
        }
        
        // Increment business count
        cityMap[city].totalBusinesses += 1;
        
        // Add fees and amounts
        cityMap[city].servicePlatformFees += vendorData.totalPlatformFees || 0;
        cityMap[city].productPlatformFees += vendorData.totalProductPlatformFee || 0;
        cityMap[city].subscriptionAmount += vendorData.subscriptionAmount || 0;
        cityMap[city].smsAmount += vendorData.smsAmount || 0;
        
        // Calculate total revenue for this city
        cityMap[city].totalRevenue = 
          cityMap[city].servicePlatformFees + 
          cityMap[city].productPlatformFees + 
          cityMap[city].subscriptionAmount + 
          cityMap[city].smsAmount;
        
        return cityMap;
      }, {}) : {};
    
    // Convert city map to array
    const cityWiseSalesArray = Object.values(cityWiseSales);
    
    // Fetch service sales data from selling services report
    const sellingServicesRes = await sellingServicesModule.GET(createInternalRequest('/api/admin/reports/booking-summary/selling-services'));
    const sellingServicesData = await sellingServicesRes.json();
    
    // Extract services data
    const servicesData = sellingServicesData?.success ? sellingServicesData.data.services : [];
    
    // Fetch product sales data from sales by products report
    const salesByProductsRes = await salesByProductsModule.GET(createInternalRequest('/api/admin/reports/booking-summary/sales-by-products'));
    const salesByProductsData = await salesByProductsRes.json();
    
    // Extract products data and add raw values for chart usage
    const productsData = salesByProductsData?.success ? salesByProductsData.data.salesByProducts.map(item => ({
      ...item,
      rawSale: parseFloat(item.sale.replace('₹', '')) || 0
    })) : [];
    
    // Calculate total revenue according to dashboard specification
    // Based on the "Total Revenue Calculation Components" memory:
    // Total revenue = Service Platform Fees + Product Platform Fees + Subscription Amount + SMS Amount
    const totalRevenue = serviceAmount + productPlatformFees + subscriptionAmount + smsAmount;
    
    // Return dashboard data with actual values
    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: {
          current: totalRevenue,
          changePercent: 0,
          changeText: ""
        },
        subscriptionAmount: subscriptionAmount,
        smsAmount: smsAmount,
        serviceAmount: serviceAmount,
        productAmount: 0, // Removed product amount calculation
        platformFees: platformFees,
        productPlatformFees: productPlatformFees,
        cityWiseSales: cityWiseSalesArray,
        services: servicesData,
        products: productsData,
        salesBySalon: [],
        revenueByMonth: [],
        bookingsByMonth: [],
        servicesUsage: [],
        totalBookings: {
          current: totalBookings,
          completed: completedBookingsData.total,
          online: onlineBookings,
          offline: offlineBookings,
          completedOnline: completedBookingsData.online,
          completedOffline: completedBookingsData.offline,
          changePercent: 0,
          changeText: ""
        },
        totalCustomers: {
          current: 0,
          online: 0,
          offline: 0,
          changePercent: 0,
          changeText: "",
          newThisPeriod: 0
        },
        totalVendors: {
          current: totalVendors,
          changePercent: 0,
          changeText: "",
          newThisPeriod: 0
        },
        totalSuppliers: {
          current: totalSuppliers,
          changePercent: 0,
          changeText: "",
          newThisPeriod: 0
        },
        cancelledBookings: {
          current: cancelledBookingsData.total,
          changePercent: 0,
          changeText: "",
          newThisPeriod: 0,
          online: cancelledBookingsData.online,
          offline: cancelledBookingsData.offline
        },
        currentPeriod: filterType ? `${filterType}: ${filterValue}` : 'All time',
        currentPeriodBookings: totalBookings
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error in dashboard route:", error);
    return NextResponse.json({ 
      success: false,
      message: "Error in dashboard route",
      error: error.message
    }, { status: 500 });
  }

  // Function to calculate subscription amount from vendor and supplier subscriptions
  async function calculateSubscriptionAmount(dateFilter) {
    try {
      const VendorModel = (await import('@repo/lib/models/Vendor/Vendor.model')).default;
      const SupplierModel = (await import('@repo/lib/models/Vendor/Supplier.model')).default;
      const SubscriptionPlanModel = (await import('@repo/lib/models/admin/SubscriptionPlan.model')).default;
      
      // Get vendors with subscriptions
      const vendorsWithSubscriptions = await VendorModel.find({
        "subscription.plan": { $exists: true, $ne: null }
      }).populate([
        { path: 'subscription.plan', model: 'SubscriptionPlan' },
        { path: 'subscription.history.plan', model: 'SubscriptionPlan' }
      ]);
      
      // Get suppliers with subscriptions
      const suppliersWithSubscriptions = await SupplierModel.find({
        "subscription.plan": { $exists: true, $ne: null }
      }).populate([
        { path: 'subscription.plan', model: 'SubscriptionPlan' },
        { path: 'subscription.history.plan', model: 'SubscriptionPlan' }
      ]);
      
      // Process vendor subscriptions
      const vendorSubscriptions = vendorsWithSubscriptions
        .filter(vendor => vendor.subscription && (vendor.subscription.plan || (vendor.subscription.history && vendor.subscription.history.length > 0)))
        .flatMap(vendor => {
          const subscriptions = [];
          
          // Add current subscription if it exists
          if (vendor.subscription && vendor.subscription.plan) {
            subscriptions.push({
              purchaseDate: vendor.subscription.startDate,
              price: vendor.subscription.plan.price,
            });
          }
          
          // Add historical subscriptions if they exist
          if (vendor.subscription && vendor.subscription.history && vendor.subscription.history.length > 0) {
            vendor.subscription.history.forEach(historyItem => {
              if (historyItem.plan && historyItem.plan.name) {
                subscriptions.push({
                  purchaseDate: historyItem.startDate,
                  price: historyItem.plan.price,
                });
              }
            });
          }
          
          return subscriptions;
        })
        .filter(sub => {
          // Apply date filter
          if (dateFilter && dateFilter.date) {
            const purchaseDate = new Date(sub.purchaseDate);
            return purchaseDate >= dateFilter.date.$gte && purchaseDate <= dateFilter.date.$lte;
          }
          return true;
        });
      
      // Process supplier subscriptions
      const supplierSubscriptions = suppliersWithSubscriptions
        .filter(supplier => supplier.subscription && (supplier.subscription.plan || (supplier.subscription.history && supplier.subscription.history.length > 0)))
        .flatMap(supplier => {
          const subscriptions = [];
          
          // Add current subscription if it exists
          if (supplier.subscription && supplier.subscription.plan) {
            subscriptions.push({
              purchaseDate: supplier.subscription.startDate,
              price: supplier.subscription.plan.price,
            });
          }
          
          // Add historical subscriptions if they exist
          if (supplier.subscription && supplier.subscription.history && supplier.subscription.history.length > 0) {
            supplier.subscription.history.forEach(historyItem => {
              if (historyItem.plan && historyItem.plan.name) {
                subscriptions.push({
                  purchaseDate: historyItem.startDate,
                  price: historyItem.plan.price,
                });
              }
            });
          }
          
          return subscriptions;
        })
        .filter(sub => {
          // Apply date filter
          if (dateFilter && dateFilter.date) {
            const purchaseDate = new Date(sub.purchaseDate);
            return purchaseDate >= dateFilter.date.$gte && purchaseDate <= dateFilter.date.$lte;
          }
          return true;
        });
      
      // Calculate total subscription amount
      const totalVendorSubscriptionAmount = vendorSubscriptions.reduce((sum, sub) => sum + (sub.price || 0), 0);
      const totalSupplierSubscriptionAmount = supplierSubscriptions.reduce((sum, sub) => sum + (sub.price || 0), 0);
      
      return totalVendorSubscriptionAmount + totalSupplierSubscriptionAmount;
    } catch (error) {
      console.error("Error calculating subscription amount:", error);
      return 0; // Return 0 in case of error
    }
  }
  

}, ["superadmin", "admin"]);