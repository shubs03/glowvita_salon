import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
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

// GET - Fetch consolidated sales report data by using existing routes
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    await initDb();
    
    // Extract filter parameters from query
    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get('filterType'); // 'day', 'month', 'year', or null
    const filterValue = searchParams.get('filterValue'); // specific date value
    const startDateParam = searchParams.get('startDate'); // Custom date range start
    const endDateParam = searchParams.get('endDate'); // Custom date range end
    const saleType = searchParams.get('saleType'); // 'online', 'offline', or 'all'
    const city = searchParams.get('city'); // City filter
    const userType = searchParams.get('userType'); // 'vendor', 'supplier', or 'all'
    const businessName = searchParams.get('businessName'); // Business name filter
    
    console.log("Consolidated Sales Report Filter parameters:", { filterType, filterValue, startDateParam, endDateParam, saleType, city, userType, businessName });
    
    // Create internal requests
    // Helper function to convert filterType/filterValue to startDate/endDate
    const convertFilterToDates = (filterType, filterValue) => {
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
      
      return { startDate, endDate };
    };
    
    const createInternalRequest = (pathname, isMarketingRoute = false) => {
      const url = new URL(pathname, req.url);
      
      if (isMarketingRoute) {
        // For marketing routes, convert filterType/filterValue to startDate/endDate
        const { startDate, endDate } = convertFilterToDates(filterType, filterValue);
        if (startDateParam || startDate) url.searchParams.set('startDate', startDateParam || startDate);
        if (endDateParam || endDate) url.searchParams.set('endDate', endDateParam || endDate);
      } else {
        // For other routes, use filterType/filterValue directly
        if (filterType) url.searchParams.set('filterType', filterType);
        if (filterValue) url.searchParams.set('filterValue', filterValue);
        if (startDateParam) url.searchParams.set('startDate', startDateParam);
        if (endDateParam) url.searchParams.set('endDate', endDateParam);
      }
      
      if (saleType) url.searchParams.set('saleType', saleType);
      if (city) url.searchParams.set('city', city);
      if (userType) url.searchParams.set('userType', userType); // Add userType filter
      if (businessName) url.searchParams.set('businessName', businessName); // Add businessName filter
      if (searchParams.get('regionId')) url.searchParams.set('regionId', searchParams.get('regionId')); // Add regionId filter
      
      return new Request(url.href, {
        method: 'GET',
        headers: req.headers,
      });
    };
    
    // Import route handlers directly with correct relative paths
    const sellingServicesModule = await import('../../booking-summary/selling-services/route');
    const salesByProductsModule = await import('../../booking-summary/sales-by-products/route');
    const completedBookingsModule = await import('../../booking-summary/completed-bookings/route');
    const subscriptionReportModule = await import('../subscription-report/route');
    const smsCampaignsModule = await import('../../marketing-reports/campaigns/route');
    
    // Fetch data from all existing routes
    const sellingServicesRes = await sellingServicesModule.GET(createInternalRequest('/api/admin/reports/booking-summary/selling-services'));
    const salesByProductsRes = await salesByProductsModule.GET(createInternalRequest('/api/admin/reports/booking-summary/sales-by-products'));
    const completedBookingsRes = await completedBookingsModule.GET(createInternalRequest('/api/admin/reports/booking-summary/completed-bookings'));
    const subscriptionReportRes = await subscriptionReportModule.GET(createInternalRequest('/api/admin/reports/Financial-Reports/subscription-report'));
    const smsCampaignsRes = await smsCampaignsModule.GET(createInternalRequest('/api/admin/reports/marketing-reports/campaigns', true));
    
    // Parse responses
    const sellingServicesData = await sellingServicesRes.json();
    const salesByProductsData = await salesByProductsRes.json();
    const completedBookingsData = await completedBookingsRes.json();
    const subscriptionReportData = await subscriptionReportRes.json();
    const smsCampaignsData = await smsCampaignsRes.json();
    
    // Log the raw data for debugging
    console.log("Raw selling services data:", sellingServicesData?.data?.services?.length || 0);
    console.log("Raw sales by products data:", salesByProductsData?.data?.salesByProducts?.length || 0);
    console.log("Raw subscription report data:", subscriptionReportData?.data?.subscriptions?.length || 0);
    console.log("Raw SMS campaigns data:", smsCampaignsData?.data?.campaigns?.length || 0);
    
    // Extract data from responses
    const sellingServices = sellingServicesData?.success ? sellingServicesData.data.services : [];
    const salesByProducts = salesByProductsData?.success ? salesByProductsData.data.salesByProducts : [];
    const completedBookingsAggregated = completedBookingsData?.success ? completedBookingsData.data.aggregatedTotals : {};
    const subscriptionReport = subscriptionReportData?.success ? subscriptionReportData.data.subscriptions : [];
    const smsCampaigns = smsCampaignsData?.success ? smsCampaignsData.data.campaigns : [];
    
    // Log the extracted data counts
    console.log("Extracted selling services count:", sellingServices.length);
    console.log("Extracted sales by products count:", salesByProducts.length);
    console.log("Extracted subscription report count:", subscriptionReport.length);
    console.log("Extracted SMS campaigns count:", smsCampaigns.length);
    
    // Get cities from any of the responses (they should be similar)
    // Updated to include cities from all data sources
    const sellingServiceCities = sellingServicesData?.success ? sellingServicesData.data.cities : [];
    const salesByProductCities = salesByProductsData?.success ? salesByProductsData.data.cities : [];
    const completedBookingCities = completedBookingsData?.success ? completedBookingsData.data.cities : [];
    const subscriptionReportCities = subscriptionReportData?.success ? subscriptionReportData.data.cities : [];
    const smsCampaignCities = smsCampaignsData?.success ? smsCampaignsData.data.cities : [];
    
    // Combine all cities and remove duplicates
    const allCities = [...new Set([
      ...sellingServiceCities,
      ...salesByProductCities,
      ...completedBookingCities,
      ...subscriptionReportCities,
      ...smsCampaignCities
    ])].filter(city => city && city !== 'N/A');
    
    const cities = allCities;
    
    // Process data to consolidate by vendor
    const vendorMap = new Map();
    
    // Process selling services data
    // First, get unique vendor IDs to fetch their types
    const uniqueVendors = [...new Set(sellingServices.map(service => service.vendor))].filter(vendor => vendor && vendor.toLowerCase() !== 'vendor' && vendor.trim() !== '');
    
    // Fetch vendor types from database
    const vendorTypesMap = new Map();
    if (uniqueVendors.length > 0) {
      const VendorModel = await import('@repo/lib/models/Vendor/Vendor.model').then(module => module.default);
      const vendors = await VendorModel.find({ businessName: { $in: uniqueVendors } }, 'businessName type');
      vendors.forEach(vendor => {
        vendorTypesMap.set(vendor.businessName, vendor.type || 'Vendor');
      });
    }
    
    sellingServices.forEach(service => {
      // Skip records with invalid vendor names
      if (!service.vendor || service.vendor.toLowerCase() === 'vendor' || service.vendor.trim() === '') {
        return;
      }
      
      const key = `${service.vendor}-${service.city}`;
      if (!vendorMap.has(key)) {
        // Get vendor type from the database, fallback to 'Vendor' if not found
        const vendorType = vendorTypesMap.get(service.vendor) || 'Vendor';
        vendorMap.set(key, {
          vendor: service.vendor,
          city: service.city,
          type: vendorType,
          totalServiceAmount: 0,
          totalProductAmount: 0,
          totalProductPlatformFee: 0, // Add total product platform fee
          totalPlatformFees: 0,
          totalServiceTax: 0,
          totalProductTax: 0, // Add total product tax/GST
          subscriptionAmount: 0,
          smsAmount: 0
        });
      }
      
      const vendorData = vendorMap.get(key);
      // Extract numeric value from rawTotalServiceAmount (the actual amount, not revenue)
      const serviceAmount = service.rawTotalServiceAmount || 0;
      // Only add service amounts for vendors (not suppliers)
      if (vendorData.type.toLowerCase() === 'vendor') {
        vendorData.totalServiceAmount += serviceAmount;
      }
      
      // Add platform fees from selling services - only for vendors, not suppliers
      if (vendorData.type.toLowerCase() === 'vendor') {
        const platformFee = service.rawPlatformFee || 0;
        vendorData.totalPlatformFees += platformFee;
      }
      
      // Add service tax from selling services - only for vendors, not suppliers
      if (vendorData.type.toLowerCase() === 'vendor') {
        const serviceTax = service.rawServiceTax || 0;
        vendorData.totalServiceTax += serviceTax;
      }
    });
    
    // Process sales by products data
    salesByProducts.forEach(product => {
      // Skip records with invalid vendor names
      if (!product.vendor || product.vendor.toLowerCase() === 'vendor' || product.vendor.trim() === '') {
        return;
      }
      
      const key = `${product.vendor}-${product.city}`;
      if (!vendorMap.has(key)) {
        vendorMap.set(key, {
          vendor: product.vendor,
          city: product.city,
          type: product.type || 'Vendor', // Use actual type from product data
          totalServiceAmount: 0,
          totalProductAmount: 0,
          totalProductPlatformFee: 0, // Add total product platform fee
          totalPlatformFees: 0,
          totalServiceTax: 0,
          totalProductTax: 0, // Add total product tax/GST
          subscriptionAmount: 0,
          smsAmount: 0
        });
      }
      
      const vendorData = vendorMap.get(key);
      // Extract numeric value from sale string (remove ₹ symbol)
      const productAmount = parseFloat((product.sale || '0').replace('₹', '')) || 0;
      vendorData.totalProductAmount += productAmount;
      // Add product platform fee
      vendorData.totalProductPlatformFee += (product.productPlatformFee !== undefined && product.productPlatformFee !== null) ? product.productPlatformFee : 0;
      // Add product tax/GST if available
      if (product.rawProductTax !== undefined && product.rawProductTax !== null) {
        vendorData.totalProductTax += product.rawProductTax;
      } else if (product.productTax !== undefined && product.productTax !== null) {
        // If rawProductTax is not available, try to extract from formatted tax string
        const taxValue = parseFloat((product.productTax || '0').replace('₹', '')) || 0;
        vendorData.totalProductTax += taxValue;
      } else if (product.gstAmount !== undefined && product.gstAmount !== null) {
        // Use gstAmount field from sales by products data
        vendorData.totalProductTax += product.gstAmount;
      } else if (product.productGST !== undefined && product.productGST !== null) {
        // Use productGST field from sales by products data
        vendorData.totalProductTax += product.productGST;
      }
      // Also update the type if it wasn't set correctly before
      if (product.type) {
        vendorData.type = product.type;
      }
    });
    
    // Process subscription data by vendor
    const vendorSubscriptionMap = new Map();
    const vendorTypeMap = new Map(); // To store vendor types
    subscriptionReport.forEach(subscription => {
      // Skip records with invalid vendor names
      if (!subscription.vendor || subscription.vendor.toLowerCase() === 'vendor' || subscription.vendor.trim() === '') {
        return;
      }
      
      const key = `${subscription.vendor}-${subscription.city}`;
      if (!vendorSubscriptionMap.has(key)) {
        vendorSubscriptionMap.set(key, 0);
      }
      const price = (subscription.price !== undefined && subscription.price !== null) ? subscription.price : 0;
      vendorSubscriptionMap.set(key, vendorSubscriptionMap.get(key) + price);
      
      // Store vendor type
      if (!vendorTypeMap.has(key) && subscription.type) {
        vendorTypeMap.set(key, subscription.type.charAt(0).toUpperCase() + subscription.type.slice(1)); // Capitalize first letter
      }
    });
    
    // Process SMS data by vendor
    const vendorSmsMap = new Map();
    smsCampaigns.forEach(campaign => {
      // Skip records with invalid vendor names
      if (!campaign.vendor || campaign.vendor.toLowerCase() === 'vendor' || campaign.vendor.trim() === '') {
        return;
      }
      
      const key = `${campaign.vendor}-${campaign.city}`;
      if (!vendorSmsMap.has(key)) {
        vendorSmsMap.set(key, 0);
      }
      const price = (campaign.price !== undefined && campaign.price !== null) ? campaign.price : 0;
      vendorSmsMap.set(key, vendorSmsMap.get(key) + price);
      
      // Store vendor type
      if (!vendorTypeMap.has(key) && campaign.type) {
        vendorTypeMap.set(key, campaign.type);
      }
    });
    
    // Log sample data for debugging
    console.log("Sample subscription data:", subscriptionReport.slice(0, 2));
    console.log("Sample SMS data:", smsCampaigns.slice(0, 2));
    
    // Log the vendor maps for debugging
    console.log("Vendor subscription map size:", vendorSubscriptionMap.size);
    console.log("Vendor SMS map size:", vendorSmsMap.size);
    console.log("Sample vendor subscription keys:", Array.from(vendorSubscriptionMap.keys()).slice(0, 3));
    console.log("Sample vendor SMS keys:", Array.from(vendorSmsMap.keys()).slice(0, 3));
    
    // Combine all vendor data
    // First, add all vendors from services and products to the map
    const allVendorKeys = new Set([
      ...Array.from(vendorMap.keys()),
      ...Array.from(vendorSubscriptionMap.keys()),
      ...Array.from(vendorSmsMap.keys())
    ]);
    
    console.log("All vendor keys count:", allVendorKeys.size);
    console.log("Existing vendor map keys:", Array.from(vendorMap.keys()));
    console.log("Subscription map keys:", Array.from(vendorSubscriptionMap.keys()));
    console.log("SMS map keys:", Array.from(vendorSmsMap.keys()));
    
    // Create entries for all vendors
    allVendorKeys.forEach(key => {
      if (!vendorMap.has(key)) {
        // Extract vendor and city from key
        const [vendor, ...cityParts] = key.split('-');
        const city = cityParts.join('-'); // In case city name contains dashes
        
        // Skip records with invalid vendor names
        if (!vendor || vendor.toLowerCase() === 'vendor' || vendor.trim() === '') {
          return;
        }
        
        // Get vendor type from vendorTypeMap or default to 'Vendor'
        const type = vendorTypeMap.get(key) || 'Vendor';
        
        console.log(`Creating entry for missing vendor: ${vendor}, city: ${city}, type: ${type}`);
        
        vendorMap.set(key, {
          vendor: vendor,
          city: city,
          type: type,
          totalServiceAmount: 0,
          totalProductAmount: 0,
          totalProductPlatformFee: 0, // Add total product platform fee
          totalPlatformFees: 0,
          totalServiceTax: 0,
          totalProductTax: 0, // Add total product tax/GST
          subscriptionAmount: 0,
          smsAmount: 0
        });
      }
    });
    
    // Add subscription amounts to vendors
    console.log("Adding subscription amounts...");
    vendorSubscriptionMap.forEach((amount, key) => {
      if (vendorMap.has(key)) {
        console.log(`Adding subscription amount ${amount} to vendor ${key}`);
        vendorMap.get(key).subscriptionAmount = amount;
      } else {
        console.log(`Warning: Vendor ${key} not found in vendorMap for subscription`);
      }
    });
    
    // Add SMS amounts to vendors
    console.log("Adding SMS amounts...");
    vendorSmsMap.forEach((amount, key) => {
      if (vendorMap.has(key)) {
        console.log(`Adding SMS amount ${amount} to vendor ${key}`);
        vendorMap.get(key).smsAmount = amount;
      } else {
        console.log(`Warning: Vendor ${key} not found in vendorMap for SMS`);
      }
    });
    
    // Log the final vendor map size
    console.log("Final vendor map size:", vendorMap.size);
    console.log("Sample final vendor keys:", Array.from(vendorMap.keys()).slice(0, 3));
    console.log("Sample vendor data:", Array.from(vendorMap.values()).slice(0, 2));
    
    // Platform fees and service tax are now calculated directly from selling services data
    // No additional distribution from completed bookings is needed to avoid double counting
    
    // Convert map to array
    let consolidatedData = Array.from(vendorMap.values());
    
    // Apply userType filter if specified
    if (userType && userType !== 'all') {
      consolidatedData = consolidatedData.filter(vendor => 
        vendor.type.toLowerCase() === userType.toLowerCase()
      );
    }
    
    // Apply businessName filter if specified
    if (businessName && businessName !== 'all') {
      consolidatedData = consolidatedData.filter(vendor => 
        vendor.vendor === businessName
      );
    }
    
    // Format data for response (matching the required columns)
    // Change 'vendor' to 'Business Name' as per requirements
    // Add subscriptionAmount and smsAmount columns after Service Tax
    // Add Type column after Business Name
    // Add Service Tax and Product Tax/GST columns
    const formattedData = consolidatedData.map(vendor => ({
      "Business Name": vendor.vendor,
      "Type": vendor.type,
      "City": vendor.city,
      "Total Service Amount (₹)": `₹${vendor.totalServiceAmount.toFixed(2)}`,
      "Total Product Amount (₹)": `₹${vendor.totalProductAmount.toFixed(2)}`,
      "Service Tax (₹)": `₹${vendor.totalServiceTax.toFixed(2)}`,
      "Product Tax/GST (₹)": `₹${vendor.totalProductTax.toFixed(2)}`,
      "Product Platform Fee (₹)": `₹${vendor.totalProductPlatformFee.toFixed(2)}`,
      // Show '-' for suppliers if they have no service platform fees (as they don't provide services)
      "Service Platform Fees (₹)": vendor.type.toLowerCase() === 'supplier' && vendor.totalPlatformFees === 0 ? '-' : `₹${vendor.totalPlatformFees.toFixed(2)}`,
      "Subscription Amount (₹)": `₹${vendor.subscriptionAmount.toFixed(2)}`,
      "SMS Amount (₹)": `₹${vendor.smsAmount.toFixed(2)}`
    }));
    
    console.log("Formatted data sample:", formattedData.slice(0, 2));
    
    // Calculate aggregated totals
    const aggregatedTotals = consolidatedData.reduce((totals, vendor) => {
      totals.totalServiceAmount += vendor.totalServiceAmount || 0;
      totals.totalProductAmount += vendor.totalProductAmount || 0;
      totals.totalServiceTax += vendor.totalServiceTax || 0; // Add service tax
      totals.totalProductTax += vendor.totalProductTax || 0; // Add product tax/GST
      totals.totalProductPlatformFee += vendor.totalProductPlatformFee || 0; // Add product platform fee
      totals.totalPlatformFees += vendor.totalPlatformFees || 0;
      totals.subscriptionAmount += vendor.subscriptionAmount || 0;
      totals.smsAmount += vendor.smsAmount || 0;
      return totals;
    }, {
      totalServiceAmount: 0,
      totalProductAmount: 0,
      totalServiceTax: 0, // Add total service tax
      totalProductTax: 0, // Add total product tax/GST
      totalProductPlatformFee: 0, // Add total product platform fee
      totalPlatformFees: 0,
      subscriptionAmount: 0,
      smsAmount: 0
    });
    
    // Get unique business names for filter dropdown
    const businessNames = [...new Set(consolidatedData.map(item => item.vendor))].filter(name => name && name !== 'N/A');
    
    // Calculate total business as per the requirement:
    // total business = Total Service Amount (₹) + Total Product Amount (₹) + Service Tax (₹) + Product Tax/GST (₹) + Product Platform Fee (₹) + Service Platform Fees (₹) + Subscription Amount (₹) + SMS Amount (₹)
    aggregatedTotals.totalBusiness = 
      aggregatedTotals.totalServiceAmount + 
      aggregatedTotals.totalProductAmount + 
      aggregatedTotals.totalServiceTax + 
      aggregatedTotals.totalProductTax + 
      aggregatedTotals.totalProductPlatformFee + 
      aggregatedTotals.totalPlatformFees + 
      aggregatedTotals.subscriptionAmount + 
      aggregatedTotals.smsAmount;
    aggregatedTotals.totalBusinessFormatted = `₹${aggregatedTotals.totalBusiness.toFixed(2)}`;
    
    // Generate city-wise sales data for CityWiseSalesTable component
    const cityWiseSales = consolidatedData.reduce((cityMap, vendorData) => {
      const city = vendorData.city;
      if (!cityMap[city]) {
        cityMap[city] = {
          city: city,
          totalBusinesses: 0,
          totalServiceAmount: 0,
          totalProductAmount: 0,
          servicePlatformFees: 0,
          productPlatformFees: 0,
          serviceTax: 0, // Add service tax
          productTax: 0, // Add product tax/GST
          subscriptionAmount: 0,
          smsAmount: 0,
          totalRevenue: 0
        };
      }
      
      // Increment business count
      cityMap[city].totalBusinesses += 1;
      
      // Add fees and amounts
      cityMap[city].totalServiceAmount += vendorData.totalServiceAmount || 0;
      cityMap[city].totalProductAmount += vendorData.totalProductAmount || 0;
      cityMap[city].servicePlatformFees += vendorData.totalPlatformFees || 0;
      cityMap[city].productPlatformFees += vendorData.totalProductPlatformFee || 0;
      cityMap[city].serviceTax += vendorData.totalServiceTax || 0; // Add service tax
      cityMap[city].productTax += vendorData.totalProductTax || 0; // Add product tax/GST
      cityMap[city].subscriptionAmount += vendorData.subscriptionAmount || 0;
      cityMap[city].smsAmount += vendorData.smsAmount || 0;
      
      // Calculate total revenue for this city
      cityMap[city].totalRevenue = 
        cityMap[city].servicePlatformFees + 
        cityMap[city].productPlatformFees + 
        cityMap[city].subscriptionAmount + 
        cityMap[city].smsAmount;
      
      return cityMap;
    }, {});
    
    // Convert city map to array
    const cityWiseSalesArray = Object.values(cityWiseSales);
    
    // Log the data for debugging
    console.log("Consolidated data count:", consolidatedData.length);
    console.log("Formatted data count:", formattedData.length);
    console.log("City-wise sales data count:", cityWiseSalesArray.length);
    console.log("Sample formatted data:", formattedData.slice(0, 2));
    console.log("Sample city-wise data:", cityWiseSalesArray.slice(0, 2));
    console.log("Aggregated totals:", aggregatedTotals);
    
    return NextResponse.json({
      success: true,
      data: {
        salesReport: formattedData,
        consolidatedData: consolidatedData,
        cityWiseSales: cityWiseSalesArray, // Add city-wise sales data
        cities: cities,
        aggregatedTotals,
        filter: filterType ? `${filterType}: ${filterValue}` : 'All time'
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching consolidated sales report:", error);
    
    return NextResponse.json({ 
      success: false,
      message: "Error fetching consolidated sales report",
      error: error.message
    }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "reports:view");