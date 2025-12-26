import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import ClientOrderModel from '@repo/lib/models/user/ClientOrder.model';
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
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

// GET - Fetch sales by brand report data
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
    
    console.log("Sales by Brand Filter parameters:", { filterType, filterValue, startDateParam, endDateParam, saleType, city, userType, businessName });
    
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
    
    // Build mode filter (using paymentMethod for online/offline distinction)
    const buildModeFilter = (saleType) => {
      if (!saleType || saleType === 'all') {
        return {};
      }
      // Map 'online'/'offline' to actual payment methods
      if (saleType === 'online') {
        return { paymentMethod: { $in: ['razorpay', 'online'] } }; // Assuming these are online payment methods
      } else if (saleType === 'offline') {
        return { paymentMethod: { $in: ['cod', 'cash', 'offline'] } }; // Assuming these are offline payment methods
      }
      return {};
    };
    
    const modeFilter = buildModeFilter(saleType);
    
    // Combine all filters
    const combinedFilter = {
      ...dateFilter,
      ...modeFilter,
      status: "Delivered" // Only count delivered orders
    };
    
    console.log("Combined filter for Sales by Brand:", combinedFilter);
    
    // Build city filter pipeline
    const cityFilterPipeline = [
      { $match: combinedFilter },
      { 
        $lookup: { 
          from: "crm_products", 
          localField: "items.productId", 
          foreignField: "_id", 
          as: "productInfo" 
        } 
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "vendors",
          localField: "productInfo.vendorId",
          foreignField: "_id",
          as: "vendorInfo"
        }
      },
      {
        $lookup: {
          from: "suppliers",
          localField: "productInfo.vendorId",
          foreignField: "_id",
          as: "supplierInfo"
        }
      },
      {
        $addFields: {
          "ownerInfo": {
            $cond: {
              if: { $eq: ["$productInfo.origin", "Vendor"] },
              then: { $ifNull: [{ $arrayElemAt: ["$vendorInfo", 0] }, {}] },
              else: { $ifNull: [{ $arrayElemAt: ["$supplierInfo", 0] }, {}] }
            }
          },
          "ownerType": { $ifNull: ["$productInfo.origin", "Vendor"] }
        }
      },
      ...(city && city !== 'all' ? [{ 
        $match: { 
          $or: [
            { "vendorInfo.city": city },
            { "supplierInfo.city": city }
          ]
        } 
      }] : []),
      // Add userType filter
      ...(userType && userType !== 'all' ? [{
        $match: {
          "ownerType": userType.charAt(0).toUpperCase() + userType.slice(1) // Capitalize first letter
        }
      }] : []),
      // Add business name filter
      ...(businessName && businessName !== 'all' ? [{
        $match: {
          $or: [
            { "vendorInfo.businessName": businessName },
            { "supplierInfo.shopName": businessName }
          ]
        }
      }] : [])
    ];
    
    // Get sales by brand data
    const salesByBrandPipeline = [
      ...cityFilterPipeline,
      { $unwind: "$items" }, // Unwind the items array to process each product separately
      {
        $group: {
          _id: {
            brand: { $ifNull: ["$productInfo.brand", "Unknown Brand"] },
            ownerId: "$productInfo.vendorId"
          },
          brandName: { $first: { $ifNull: ["$productInfo.brand", "Unknown Brand"] } },
          ownerId: { $first: "$productInfo.vendorId" },
          ownerName: { $first: { 
            $cond: {
              if: { $eq: ["$productInfo.origin", "Vendor"] },
              then: { $ifNull: [{ $let: { vars: { vendor: { $arrayElemAt: ["$vendorInfo", 0] } }, in: "$$vendor.businessName" } }, "Unknown Vendor"] },
              else: { $ifNull: [{ $let: { vars: { supplier: { $arrayElemAt: ["$supplierInfo", 0] } }, in: "$$supplier.shopName" } }, "Unknown Supplier"] }
            }
          }},
          ownerCity: { $first: { 
            $cond: {
              if: { $eq: ["$productInfo.origin", "Vendor"] },
              then: { $ifNull: [{ $let: { vars: { vendor: { $arrayElemAt: ["$vendorInfo", 0] } }, in: "$$vendor.city" } }, ""] },
              else: { $ifNull: [{ $let: { vars: { supplier: { $arrayElemAt: ["$supplierInfo", 0] } }, in: "$$supplier.city" } }, ""] }
            }
          }},
          ownerType: { $first: { $ifNull: ["$productInfo.origin", "Vendor"] } },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
          totalQuantity: { $sum: "$items.quantity" },
          totalOrders: { $sum: 1 },

        }
      },
      {
        $group: {
          _id: { $ifNull: ["$brandName", "Unknown Brand"] },
          brandName: { $first: "$brandName" },
          totalRevenue: { $sum: "$totalRevenue" },
          totalQuantity: { $sum: "$totalQuantity" },
          totalOrders: { $sum: "$totalOrders" },

          owners: {
            $push: {
              ownerId: "$ownerId",
              ownerName: "$ownerName",
              ownerCity: "$ownerCity",
              ownerType: "$ownerType",
              totalRevenue: "$totalRevenue",
              totalQuantity: "$totalQuantity",
              orders: "$totalOrders",

            }
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ];
    
    // Add debug logging
    console.log("Executing sales by brand pipeline");
    const salesByBrand = await ClientOrderModel.aggregate(salesByBrandPipeline);
    console.log("Sales by brand result:", JSON.stringify(salesByBrand.slice(0, 2), null, 2));
    
    // Log sample data for debugging
    console.log("Sales by brand raw data sample:", salesByBrand.slice(0, 2));
    
    // Format data as requested: Brand Name, Total Quantity Sold, Total Revenue (₹)
    const formattedData = salesByBrand.map(brand => ({
      brandName: brand.brandName && brand.brandName !== 'Unknown Brand' ? brand.brandName : (brand._id || 'Unknown Brand'),
      totalQuantitySold: brand.totalQuantity || 0,
      totalRevenue: `₹${(brand.totalRevenue || 0).toFixed(2)}`
    }));
      
    console.log("Formatted data count:", formattedData.length);
    console.log("Formatted data sample:", formattedData.slice(0, 2));
    console.log("Full formatted data:", JSON.stringify(formattedData, null, 2));
    
    // Calculate aggregated totals
    const aggregatedTotals = formattedData.reduce((totals, brand) => {
      // Extract numeric value from revenue string (remove ₹ symbol)
      const revenueValue = parseFloat(brand.totalRevenue.replace('₹', '')) || 0;
      totals.totalRevenue += revenueValue;
      totals.totalQuantitySold += brand.totalQuantitySold || 0;
      return totals;
    }, {
      totalRevenue: 0,
      totalQuantitySold: 0
    });
    
    // Get unique cities for the filter dropdown
    const cityPipeline = [
      { $match: { status: "Delivered" } }, // Only delivered orders
      { $lookup: { from: "crm_products", localField: "items.productId", foreignField: "_id", as: "productInfo" } },
      { $unwind: "$productInfo" },
      {
        $lookup: {
          from: "vendors",
          localField: "productInfo.vendorId",
          foreignField: "_id",
          as: "vendorInfo"
        }
      },
      {
        $lookup: {
          from: "suppliers",
          localField: "productInfo.vendorId",
          foreignField: "_id",
          as: "supplierInfo"
        }
      },
      {
        $addFields: {
          "ownerInfo": {
            $cond: {
              if: { $eq: ["$productInfo.origin", "Vendor"] },
              then: { $ifNull: [{ $arrayElemAt: ["$vendorInfo", 0] }, {}] },
              else: { $ifNull: [{ $arrayElemAt: ["$supplierInfo", 0] }, {}] }
            }
          },
          "ownerType": { $ifNull: ["$productInfo.origin", "Vendor"] }
        }
      },
      // Add userType filter for cities
      ...(userType && userType !== 'all' ? [{
        $match: {
          "ownerType": userType.charAt(0).toUpperCase() + userType.slice(1) // Capitalize first letter
        }
      }] : []),
      { $group: { _id: { $ifNull: ["$ownerInfo.city", null] } } }, // Get unique cities
      { $match: { "_id": { $ne: null } } }, // Filter out null cities
      { $sort: { _id: 1 } } // Sort alphabetically
    ];
    
    // Get unique business names for the filter dropdown
    const businessNamePipeline = [
      { $match: { status: "Delivered" } }, // Only delivered orders
      { $lookup: { from: "crm_products", localField: "items.productId", foreignField: "_id", as: "productInfo" } },
      { $unwind: "$productInfo" },
      {
        $lookup: {
          from: "vendors",
          localField: "productInfo.vendorId",
          foreignField: "_id",
          as: "vendorInfo"
        }
      },
      {
        $lookup: {
          from: "suppliers",
          localField: "productInfo.vendorId",
          foreignField: "_id",
          as: "supplierInfo"
        }
      },
      {
        $addFields: {
          "ownerInfo": {
            $cond: {
              if: { $eq: ["$productInfo.origin", "Vendor"] },
              then: { $ifNull: [{ $arrayElemAt: ["$vendorInfo", 0] }, {}] },
              else: { $ifNull: [{ $arrayElemAt: ["$supplierInfo", 0] }, {}] }
            }
          },
          "ownerType": { $ifNull: ["$productInfo.origin", "Vendor"] }
        }
      },
      // Remove userType filter for business names to show all business names
      // This ensures the business name dropdown always shows all available business names
      // regardless of the userType filter selection
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$productInfo.origin", "Vendor"] },
              then: "$vendorInfo.businessName",
              else: "$supplierInfo.shopName"
            }
          }
        }
      },
      { $match: { "_id": { $ne: null } } }, // Filter out null business names
      { $sort: { _id: 1 } } // Sort alphabetically
    ];
    
    const citiesResult = await ClientOrderModel.aggregate(cityPipeline);
    const cities = citiesResult.map(item => item._id).filter(city => city && city !== 'N/A'); // Filter out null/undefined cities
    
    const businessNamesResult = await ClientOrderModel.aggregate(businessNamePipeline);
    const businessNames = businessNamesResult.map(item => item._id).filter(name => name); // Filter out null/undefined names
    
    return NextResponse.json({
      success: true,
      data: {
        salesByBrand: formattedData,
        aggregatedTotals,
        cities: cities,
        businessNames: businessNames,
        filter: filterType ? `${filterType}: ${filterValue}` : 'All time'
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching sales by brand report:", error);
    
    return NextResponse.json({ 
      success: false,
      message: "Error fetching sales by brand report",
      error: error.message
    }, { status: 500 });
  }
}, ["superadmin", "admin"]);