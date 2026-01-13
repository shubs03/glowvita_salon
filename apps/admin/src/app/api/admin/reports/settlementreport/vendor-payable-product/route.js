import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import ClientOrderModel from '@repo/lib/models/user/ClientOrder.model';
import { authMiddlewareAdmin } from '../../../../../../middlewareAdmin';

// Initialize database connection
const initDb = async () => {
  try {
    await _db();
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
};

// GET - Fetch vendor payable to admin report data for products
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
    const businessName = searchParams.get('businessName'); // Business name filter (vendor/supplier)
    const userType = searchParams.get('userType'); // 'vendor', 'supplier', or 'all'
    
    console.log("Vendor Payable to Admin Report - Product Filter parameters:", { 
      filterType, 
      filterValue, 
      startDateParam, 
      endDateParam, 
      city, 
      businessName,
      userType 
    });
    
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
    
    // Create the main filter for client orders
    const mainFilter = {
      ...dateFilter,
      status: 'Delivered', // Only include delivered orders
    };

    // City filter will be applied after lookups

    console.log("Main filter for vendor payable to admin report - product:", mainFilter);

    // Build aggregation pipeline
    const pipeline = [
      { $match: mainFilter },
      // Lookup product information to get vendorId and origin
      {
        $lookup: {
          from: "crm_products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      // Lookup vendor information
      {
        $lookup: {
          from: "vendors",
          localField: "productInfo.vendorId",
          foreignField: "_id",
          as: "vendorInfo"
        }
      },
      // Lookup supplier information
      {
        $lookup: {
          from: "suppliers",
          localField: "productInfo.vendorId",
          foreignField: "_id",
          as: "supplierInfo"
        }
      },
      // Add fields to determine owner type and info
      {
        $addFields: {
          ownerInfo: {
            $cond: {
              if: { $eq: ["$productInfo.origin", "Vendor"] },
              then: { $ifNull: [{ $arrayElemAt: ["$vendorInfo", 0] }, {}] },
              else: { $ifNull: [{ $arrayElemAt: ["$supplierInfo", 0] }, {}] }
            }
          },
          ownerType: { $ifNull: ["$productInfo.origin", "Vendor"] },
          businessName: {
            $cond: {
              if: { $eq: ["$productInfo.origin", "Vendor"] },
              then: { $ifNull: [{ $arrayElemAt: ["$vendorInfo.businessName", 0] }, "Unknown Business"] },
              else: { $ifNull: [{ $arrayElemAt: ["$supplierInfo.shopName", 0] }, "Unknown Business"] }
            }
          },
          city: {
            $cond: {
              if: { $eq: ["$productInfo.origin", "Vendor"] },
              then: { $ifNull: [{ $arrayElemAt: ["$vendorInfo.city", 0] }, "Unknown City"] },
              else: { $ifNull: [{ $arrayElemAt: ["$supplierInfo.city", 0] }, "Unknown City"] }
            }
          }
        }
      },
      // Apply business name filter if provided
      ...(businessName && businessName !== 'all' ? [{ 
        $match: { 
          businessName: businessName 
        } 
      }] : []),
      // Apply city filter if provided
      ...(city && city !== 'all' ? [{ 
        $match: { 
          city: city 
        } 
      }] : []),
      // Apply user type filter if provided
      ...(userType && userType !== 'all' ? [{ 
        $match: { 
          ownerType: userType.charAt(0).toUpperCase() + userType.slice(1) // Capitalize first letter
        } 
      }] : []),
      // Unwind items array to process each product separately
      { $unwind: "$items" },
      // Group by owner (vendor/supplier) to calculate totals
      {
        $group: {
          _id: {
            ownerId: "$productInfo.vendorId",
            businessName: "$businessName",
            city: "$city",
            ownerType: "$ownerType"
          },
          productPlatformFee: { $sum: "$platformFeeAmount" }, // Platform fee for products
          productTax: { $sum: "$gstAmount" }, // GST for products
          orderCount: { $sum: 1 },
          deliveredOrders: { $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] } }
        }
      },
      // Project the final structure with required fields
      {
        $project: {
          _id: 0,
          ownerId: "$_id.ownerId",
          "Payee Type": "$_id.ownerType", // Vendor or Supplier
          "Payee Name": "$_id.businessName", // Business name of the vendor/supplier
          "product Platform Fee": "$productPlatformFee",
          "product Tax/gst": "$productTax",
          "Total": { $add: ["$productPlatformFee", "$productTax"] }, // Total = Platform Fee + Tax/GST
          city: "$_id.city",
          orderCount: 1,
          deliveredOrders: 1
        }
      }
    ];

    // Execute aggregation
    const results = await ClientOrderModel.aggregate(pipeline);

    console.log("Vendor payable to admin report - product results:", results);

    // Get unique cities for filter dropdown
    const cityPipeline = [
      { $match: { status: 'Delivered' } },
      {
        $lookup: {
          from: "crm_products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productInfo"
        }
      },
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
          city: {
            $cond: {
              if: { $eq: ["$productInfo.origin", "Vendor"] },
              then: { $ifNull: [{ $arrayElemAt: ["$vendorInfo.city", 0] }, null] },
              else: { $ifNull: [{ $arrayElemAt: ["$supplierInfo.city", 0] }, null] }
            }
          }
        }
      },
      { $group: { _id: "$city" } },
      { $match: { "_id": { $ne: null } } }, // Filter out null cities
      { $sort: { _id: 1 } }
    ];

    const citiesResult = await ClientOrderModel.aggregate(cityPipeline);
    const cities = citiesResult.map(item => item._id).filter(city => city); // Filter out null/undefined cities

    // Get unique business names for filter dropdown
    const businessNamePipeline = [
      { $match: { status: 'Delivered' } },
      {
        $lookup: {
          from: "crm_products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productInfo"
        }
      },
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
          businessName: {
            $cond: {
              if: { $eq: ["$productInfo.origin", "Vendor"] },
              then: { $ifNull: [{ $arrayElemAt: ["$vendorInfo.businessName", 0] }, null] },
              else: { $ifNull: [{ $arrayElemAt: ["$supplierInfo.shopName", 0] }, null] }
            }
          }
        }
      },
      { $group: { _id: "$businessName" } },
      { $match: { "_id": { $ne: null } } }, // Filter out null business names
      { $sort: { _id: 1 } }
    ];

    const businessNamesResult = await ClientOrderModel.aggregate(businessNamePipeline);
    const businessNames = businessNamesResult.map(item => item._id).filter(name => name); // Filter out null/undefined business names

    // Calculate aggregated totals
    const aggregatedTotals = results.reduce((totals, entity) => {
      totals.productPlatformFee += entity["product Platform Fee"] || 0;
      totals.productTax += entity["product Tax/gst"] || 0;
      totals.total = entity.Total ? (totals.total + entity.Total) : totals.total;
      totals.orderCount += entity.orderCount || 0;
      totals.deliveredOrders += entity.deliveredOrders || 0;
      return totals;
    }, {
      productPlatformFee: 0,
      productTax: 0,
      total: 0, // This will be the sum of all vendor/supplier payables to admin
      orderCount: 0,
      deliveredOrders: 0
    });

    return NextResponse.json({
      success: true,
      data: {
        vendorPayableReport: results,
        cities: cities,
        businessNames: businessNames,
        aggregatedTotals: aggregatedTotals,
        filter: filterType ? `${filterType}: ${filterValue}` : 'All time'
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching vendor payable to admin report - product:", error);
    
    return NextResponse.json({ 
      success: false,
      message: "Error fetching vendor payable to admin report - product",
      error: error.message
    }, { status: 500 });
  }
}, ["superadmin", "admin"]);