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

// GET - Fetch vendor payout settlement report data for products
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
    
    console.log("Vendor Payout Settlement Report - Product Filter parameters:", { 
      filterType, 
      filterValue, 
      startDateParam, 
      endDateParam, 
      city, 
      businessName,
      userType 
    });
    
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
        dateFilter.createdAt = { $gte: startDate, $lte: endDate };
      }
    }
    // Apply custom date range if provided (takes precedence over filterType/filterValue)
    else if (startDateParam && endDateParam) {
      dateFilter.createdAt = { 
        $gte: new Date(startDateParam), 
        $lte: new Date(endDateParam) 
      };
    }

    // Create the main filter for client orders - focusing on delivered orders with cash-on-delivery
    const mainFilter = {
      ...dateFilter,
      paymentMethod: 'cash-on-delivery', // Only cash-on-delivery orders
      status: 'Delivered', // Only include delivered orders
    };

    // City filter will be applied after lookups

    console.log("Main filter for client orders:", mainFilter);

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
          totalAmount: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }, // Product amount
          platformFee: { $sum: "$platformFeeAmount" }, // Platform fee for products
          gst: { $sum: "$gstAmount" }, // GST for products
          orderCount: { $sum: 1 },
          deliveredOrders: { $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] } }
        }
      },
      // Project the final structure with required fields
      {
        $project: {
          _id: 0,
          ownerId: "$_id.ownerId",
          "Source Type": "$_id.ownerType", // Vendor or Supplier
          "Entity Name": "$_id.businessName", // Business name of the vendor/supplier
          "Product Platform Fee": "$platformFee",
          "Product Tax (₹)": "$gst",
          "Product Total Amount": "$totalAmount",
          "Total": { $add: ["$totalAmount", "$platformFee", "$gst"] }, // Total = Product Amount + Platform Fee + GST
          city: "$_id.city",
          orderCount: 1,
          deliveredOrders: 1
        }
      }
    ];

    // Execute aggregation
    const results = await ClientOrderModel.aggregate(pipeline);

    console.log("Vendor payout settlement report - product results:", results);

    // Get unique cities for filter dropdown
    const cityPipeline = [
      { $match: { paymentMethod: 'cash-on-delivery', status: 'Delivered' } },
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
      { $match: { paymentMethod: 'cash-on-delivery', status: 'Delivered' } },
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
      totals.productPlatformFee += entity["Product Platform Fee"] || 0;
      totals.productTax += entity["Product Tax (₹)"] || 0;
      totals.productTotalAmount += entity["Product Total Amount"] || 0;
      totals.total = entity.Total ? (totals.total + entity.Total) : totals.total;
      totals.orderCount += entity.orderCount || 0;
      totals.deliveredOrders += entity.deliveredOrders || 0;
      return totals;
    }, {
      productPlatformFee: 0,
      productTax: 0,
      productTotalAmount: 0,
      total: 0, // This will be the sum of all vendor/supplier payouts
      orderCount: 0,
      deliveredOrders: 0
    });

    return NextResponse.json({
      success: true,
      data: {
        vendorPayoutSettlementReport: results,
        cities: cities,
        businessNames: businessNames,
        aggregatedTotals: aggregatedTotals,
        filter: filterType ? `${filterType}: ${filterValue}` : 'All time'
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching vendor payout settlement report - product:", error);
    
    return NextResponse.json({ 
      success: false,
      message: "Error fetching vendor payout settlement report - product",
      error: error.message
    }, { status: 500 });
  }
}, ["superadmin", "admin"]);