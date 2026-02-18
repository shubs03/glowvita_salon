import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import SubscriptionPlanModel from '@repo/lib/models/admin/SubscriptionPlan.model';
import { authMiddlewareAdmin } from "../../../../../../middlewareAdmin";
import { buildRegionQueryFromRequest } from "@repo/lib";

// Initialize database connection
const initDb = async () => {
  try {
    await _db();
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
};

// GET - Fetch subscription report data
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    await initDb();
    
    // Extract filter parameters from query
    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get('filterType'); // 'day', 'month', 'year', or null
    const filterValue = searchParams.get('filterValue'); // specific date value
    const startDateParam = searchParams.get('startDate'); // Custom date range start
    const endDateParam = searchParams.get('endDate'); // Custom date range end
    const userType = searchParams.get('userType'); // 'vendor', 'supplier', or 'all'
    const city = searchParams.get('city'); // City filter
    const businessName = searchParams.get('businessName'); // Business name filter
    const planStatus = searchParams.get('planStatus'); // Plan status filter
    
    console.log("Subscription Report Filter parameters:", { filterType, filterValue, startDateParam, endDateParam, userType, city, businessName, planStatus });
    
    // Build date filter
    const buildDateFilter = (filterType, filterValue, startDateParam, endDateParam) => {
      let startDate, endDate;
      
      // Handle custom date range first
      if (startDateParam && endDateParam) {
        startDate = new Date(startDateParam);
        endDate = new Date(endDateParam);
        endDate.setHours(23, 59, 59, 999); // Set to end of day
        return { createdAt: { $gte: startDate, $lte: endDate } };
      }

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

      return filterType ? { createdAt: { $gte: startDate, $lte: endDate } } : {};
    };
    
    const dateFilter = buildDateFilter(filterType, filterValue, startDateParam, endDateParam);
    console.log("Date filter:", dateFilter);
    
    // Build user type filter
    const buildUserTypeFilter = (userType) => {
      // This function now controls which user types we fetch data for
      // Instead of filtering at the database level, we control which collections we query
      return userType || 'all';
    };
    
    const userTypeFilter = buildUserTypeFilter(userType);
    
    // Get subscription data from vendors and suppliers based on filter
    // Get all vendors with subscriptions
    let vendorsWithSubscriptions = [];
    let suppliersWithSubscriptions = [];
    
    if (userTypeFilter === 'all' || userTypeFilter === 'vendor') {
      const regionQuery = buildRegionQueryFromRequest(req);
      vendorsWithSubscriptions = await VendorModel.find({
        ...regionQuery,
        "subscription.plan": { $exists: true, $ne: null }
      }).populate([
        { path: 'subscription.plan', model: 'SubscriptionPlan' },
        { path: 'subscription.history.plan', model: 'SubscriptionPlan' }
      ]);
    }
    
    // Get all suppliers with subscriptions
    const SupplierModel = (await import('@repo/lib/models/Vendor/Supplier.model')).default;
    if (userTypeFilter === 'all' || userTypeFilter === 'supplier') {
      const regionQuery = buildRegionQueryFromRequest(req);
      suppliersWithSubscriptions = await SupplierModel.find({
        ...regionQuery,
        "subscription.plan": { $exists: true, $ne: null }
      }).populate([
        { path: 'subscription.plan', model: 'SubscriptionPlan' },
        { path: 'subscription.history.plan', model: 'SubscriptionPlan' }
      ]);
    }
    
    // Process subscriptions to match the required format
    const processSubscriptions = (users, userType) => {
      return users
        .filter(user => user.subscription && (user.subscription.plan || (user.subscription.history && user.subscription.history.length > 0)))
        .flatMap(user => {
          const subscriptions = [];
          
          // Add current subscription if it exists
          if (user.subscription && user.subscription.plan) {
            subscriptions.push({
              purchaseDate: user.subscription.startDate,
              vendor: user.businessName || user.shopName || user.name || 'N/A',
              city: user.city || 'N/A',
              subscription: user.subscription.plan.name,
              startDate: user.subscription.startDate,
              endDate: user.subscription.endDate,
              price: user.subscription.plan.price,
              planStatus: user.subscription.plan.status,
              paymentMode: 'Online',
              userType: userType,
              type: userType,
              // Adding vendor history information
              vendorId: user._id,
              vendorEmail: user.email || 'N/A',
              vendorPhone: user.phone || user.mobile || 'N/A',
              vendorAddress: user.address || 'N/A',
              vendorRegistrationDate: user.createdAt || 'N/A',
              subscriptionHistory: user.subscription.history || []
            });
          }
          
          // Add historical subscriptions if they exist
          if (user.subscription && user.subscription.history && user.subscription.history.length > 0) {
            user.subscription.history.forEach(historyItem => {
              // Make sure the history item has a populated plan
              if (historyItem.plan && historyItem.plan.name) {
                subscriptions.push({
                  purchaseDate: historyItem.startDate,
                  vendor: user.businessName || user.shopName || user.name || 'N/A',
                  city: user.city || 'N/A',
                  subscription: historyItem.plan.name,
                  startDate: historyItem.startDate,
                  endDate: historyItem.endDate,
                  price: historyItem.plan.price,
                  planStatus: historyItem.status,
                  paymentMode: 'Online',
                  userType: userType,
                  type: userType,
                  // Adding vendor history information
                  vendorId: user._id,
                  vendorEmail: user.email || 'N/A',
                  vendorPhone: user.phone || user.mobile || 'N/A',
                  vendorAddress: user.address || 'N/A',
                  vendorRegistrationDate: user.createdAt || 'N/A',
                  subscriptionHistory: user.subscription.history || []
                });
              }
            });
          }
          
          return subscriptions;
        })
        .filter(sub => {
          // Apply date filter
          if (Object.keys(dateFilter).length > 0 && dateFilter.createdAt) {
            const purchaseDate = new Date(sub.purchaseDate);
            return purchaseDate >= dateFilter.createdAt.$gte && purchaseDate <= dateFilter.createdAt.$lte;
          }
          return true;
        })
        .filter(sub => {
          // Apply user type filter
          if (userType && userType !== 'all') {
            return userType === userType;
          }
          return true;
        })
        .filter(sub => {
          // Apply city filter
          if (city && city !== 'all') {
            return sub.city === city;
          }
          return true;
        })
        .filter(sub => {
          // Apply business name filter
          if (businessName && businessName !== 'all') {
            return sub.vendor === businessName;
          }
          return true;
        })
        .filter(sub => {
          // Apply plan status filter
          if (planStatus && planStatus !== 'all') {
            return sub.planStatus === planStatus;
          }
          return true;
        });
    };
    
    // Process subscriptions for each user type
    const vendorSubscriptions = (userTypeFilter === 'all' || userTypeFilter === 'vendor') 
      ? processSubscriptions(vendorsWithSubscriptions, 'vendor') 
      : [];
    const supplierSubscriptions = (userTypeFilter === 'all' || userTypeFilter === 'supplier') 
      ? processSubscriptions(suppliersWithSubscriptions, 'supplier') 
      : [];
    
    // Combine all subscriptions
    const allSubscriptions = [
      ...vendorSubscriptions,
      ...supplierSubscriptions
    ];
    
    // Sort by purchase date (newest first)
    allSubscriptions.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
    
    // Calculate totals
    const totalSubscriptions = allSubscriptions.length;
    const totalRevenue = allSubscriptions.reduce((sum, sub) => sum + (sub.price || 0), 0);
    
    // Calculate active and inactive plan counts
    // Consider both 'Inactive' and 'Expired' as inactive plans
    const activePlans = allSubscriptions.filter(sub => sub.planStatus === 'Active').length;
    const inactivePlans = allSubscriptions.filter(sub => sub.planStatus === 'Inactive' || sub.planStatus === 'Expired').length;
    
    // Get unique subscription plans
    const subscriptionPlans = [...new Set(allSubscriptions.map(sub => sub.subscription))];
    
    // Count subscriptions by plan
    const subscriptionsByPlan = {};
    allSubscriptions.forEach(sub => {
      if (!subscriptionsByPlan[sub.subscription]) {
        subscriptionsByPlan[sub.subscription] = 0;
      }
      subscriptionsByPlan[sub.subscription]++;
    });
    
    // Get unique cities from all users (not just subscriptions) for the filter
    let allCities = [];
    let vendorCities = [];
    let supplierCities = [];
    
    // Get unique business names for the filter
    let allBusinessNames = [];
    let vendorBusinessNames = [];
    let supplierBusinessNames = [];
    
    if (userTypeFilter === 'all' || userTypeFilter === 'vendor') {
      const regionQuery = buildRegionQueryFromRequest(req);
      const allVendors = await VendorModel.find(regionQuery);
      vendorCities = [...new Set(allVendors.map(vendor => vendor.city))];
      vendorBusinessNames = [...new Set(allVendors.map(vendor => vendor.businessName || vendor.shopName || vendor.name))]
        .filter(name => name && name !== 'N/A');
    }
    
    if (userTypeFilter === 'all' || userTypeFilter === 'supplier') {
      const regionQuery = buildRegionQueryFromRequest(req);
      const allSuppliers = await SupplierModel.find(regionQuery);
      supplierCities = [...new Set(allSuppliers.map(supplier => supplier.city))];
      supplierBusinessNames = [...new Set(allSuppliers.map(supplier => supplier.businessName || supplier.shopName || supplier.name))]
        .filter(name => name && name !== 'N/A');
    }
    
    // Combine cities based on the filter
    if (userTypeFilter === 'vendor') {
      allCities = vendorCities;
      allBusinessNames = vendorBusinessNames;
    } else if (userTypeFilter === 'supplier') {
      allCities = supplierCities;
      allBusinessNames = supplierBusinessNames;
    } else {
      // 'all' case - combine vendor and supplier cities only
      allCities = [...new Set([...vendorCities, ...supplierCities])];
      allBusinessNames = [...new Set([...vendorBusinessNames, ...supplierBusinessNames])];
    }
    
    allCities = allCities.filter(city => city && city !== 'N/A');
    
    return NextResponse.json({
      success: true,
      data: {
        subscriptions: allSubscriptions,
        totalSubscriptions,
        totalRevenue,
        activePlans,
        inactivePlans,
        subscriptionPlans,
        subscriptionsByPlan,
        cities: allCities,
        filter: filterType ? `${filterType}: ${filterValue}` : 'All time'
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching subscription report:", error);
    
    return NextResponse.json({ 
      success: false,
      message: "Error fetching subscription report",
      error: error.message
    }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "reports:view");