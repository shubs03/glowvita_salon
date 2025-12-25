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

// GET - Fetch sales by products report data
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
    const category = searchParams.get('category'); // Category filter
    const brand = searchParams.get('brand'); // Brand filter
    
    console.log("Sales by Products Filter parameters:", { filterType, filterValue, startDateParam, endDateParam, saleType, city, userType, businessName, category, brand });
    
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
    
    console.log("Combined filter for Sales by Products:", combinedFilter);
    
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
      // Add business name filter
      ...(businessName && businessName !== 'all' ? [{
        $match: {
          $or: [
            { "vendorInfo.businessName": businessName },
            { "supplierInfo.shopName": businessName }
          ]
        }
      }] : []),
      // Add userType filter
      ...(userType && userType !== 'all' ? [{
        $match: {
          "ownerType": userType.charAt(0).toUpperCase() + userType.slice(1) // Capitalize first letter
        }
      }] : [])
    ];
    
    // Get sales by products data
    const salesByProductsPipeline = [
      ...cityFilterPipeline,
      { $unwind: "$items" }, // Unwind the items array to process each product separately
      {
        $group: {
          _id: {
            productId: "$items.productId",
            ownerId: "$productInfo.vendorId"
          },
          productName: { $first: { $ifNull: ["$productInfo.productName", "Unknown Product"] } },
          productCategory: { $first: "$productInfo.category" }, // Add category reference
          productBrand: { $first: { $ifNull: ["$productInfo.brand", ""] } }, // Add brand
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
          totalPlatformFee: { $sum: "$platformFeeAmount" },
          totalGST: { $sum: "$gstAmount" },

        }
      },
      // Lookup product category names
      {
        $lookup: {
          from: "productcategories",
          localField: "productCategory",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      {
        $addFields: {
          categoryName: { $ifNull: [{ $arrayElemAt: ["$categoryInfo.name", 0] }, "Unknown Category"] }
        }
      },
      // Add category filter
      ...(category && category !== 'all' ? [{ 
        $match: { 
          categoryName: category 
        } 
      }] : []),
      // Add brand filter
      ...(brand && brand !== 'all' ? [{ 
        $match: { 
          productBrand: brand 
        } 
      }] : []),
      {
        $group: {
          _id: { $ifNull: ["$productName", "Unknown Product"] },
          productId: { $first: "$_id.productId" },
          productName: { $first: "$productName" },
          categoryName: { $first: "$categoryName" }, // Add category name
          productBrand: { $first: "$productBrand" }, // Add brand
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
              totalPlatformFee: "$totalPlatformFee",
              totalGST: "$totalGST",

            }
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ];
    
    // Add debug logging
    console.log("Executing sales by products pipeline");
    const salesByProducts = await ClientOrderModel.aggregate(salesByProductsPipeline);
    console.log("Sales by products result:", JSON.stringify(salesByProducts.slice(0, 2), null, 2));
    
    // Log sample data for debugging
    console.log("Sales by products raw data sample:", salesByProducts.slice(0, 2));
    
    // Format data as requested: Product, Vendor, City, Sale (₹), Product Sold
    const formattedData = salesByProducts
      .flatMap(product => {
        return product.owners.map(owner => ({
          product: product.productName && product.productName !== 'Unknown Product' ? product.productName : (product._id || 'Unknown Product'),
          category: product.categoryName || 'Unknown Category', // Add category
          brand: product.productBrand || 'Unknown Brand', // Add brand
          vendor: Array.isArray(owner.ownerName) ? (owner.ownerName.length > 0 ? owner.ownerName[0] : 'Unknown Vendor') : (owner.ownerName || 'Unknown Vendor'),
          city: Array.isArray(owner.ownerCity) ? (owner.ownerCity.length > 0 ? owner.ownerCity[0] : 'Unknown City') : (owner.ownerCity || 'Unknown City'),
          sale: `₹${(owner.totalRevenue || 0).toFixed(2)}`,
          productSold: owner.totalQuantity || 0,
          productPlatformFee: owner.totalPlatformFee || 0,
          productGST: owner.totalGST || 0,
          type: owner.ownerType // Add owner type (Vendor or Supplier)
        }));
      })
      .filter(item => {
        // Log item for debugging
        console.log("Processing item:", item);
        
        // Filter out records with invalid vendor names
        const vendorName = item.vendor || '';
        // Ensure vendorName is a string before calling toLowerCase
        if (typeof vendorName !== 'string') {
          console.log("Skipping item with non-string vendor name:", item);
          return false;
        }
        
        // Filter out records with invalid product names
        const productName = item.product || '';
        if (typeof productName !== 'string') {
          console.log("Skipping item with non-string product name:", item);
          return false;
        }
        
        // More permissive filtering - only exclude truly invalid data
        const shouldInclude = vendorName.trim() !== '' && 
                             productName.trim() !== '' &&
                             vendorName.toLowerCase() !== 'unknown vendor';
                              
        if (!shouldInclude) {
          console.log("Skipping item with invalid vendor or product name:", vendorName, productName);
        }
        return shouldInclude;
      });
      
    console.log("Formatted data count:", formattedData.length);
    console.log("Formatted data sample:", formattedData.slice(0, 2));
    console.log("Full formatted data:", JSON.stringify(formattedData, null, 2));
    
    // Calculate aggregated totals
    const aggregatedTotals = formattedData.reduce((totals, product) => {
      // Extract numeric value from sale string (remove ₹ symbol)
      const saleValue = parseFloat(product.sale.replace('₹', '')) || 0;
      totals.totalSale += saleValue;
      totals.totalProductsSold += product.productSold || 0;
      totals.totalProductPlatformFee += product.productPlatformFee || 0;
      totals.totalProductGST += product.productGST || 0;
      return totals;
    }, {
      totalSale: 0,
      totalProductsSold: 0,
      totalProductPlatformFee: 0,
      totalProductGST: 0
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
      // Apply userType filter for business names to maintain consistency
      ...(userType && userType !== 'all' ? [{
        $match: {
          "ownerType": userType.charAt(0).toUpperCase() + userType.slice(1) // Capitalize first letter
        }
      }] : []),
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
    
    // Get unique categories for the filter dropdown
    const categoryPipeline = [
      { $match: { status: "Delivered" } }, // Only delivered orders
      { $lookup: { from: "crm_products", localField: "items.productId", foreignField: "_id", as: "productInfo" } },
      { $unwind: "$productInfo" },
      // Lookup vendor/supplier info to apply userType filter
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
          "ownerType": { $ifNull: ["$productInfo.origin", "Vendor"] }
        }
      },
      // Apply userType filter
      ...(userType && userType !== 'all' ? [{
        $match: {
          "ownerType": userType.charAt(0).toUpperCase() + userType.slice(1) // Capitalize first letter
        }
      }] : []),
      // Lookup product category names
      {
        $lookup: {
          from: "productcategories",
          localField: "productInfo.category",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      {
        $addFields: {
          categoryName: { $ifNull: [{ $arrayElemAt: ["$categoryInfo.name", 0] }, "$productInfo.category"] }
        }
      },
      { $group: { _id: { $ifNull: ["$categoryName", null] } } }, // Get unique category names
      { $project: { _id: "$_id" } }, // Project only the category name
      { $match: { "_id": { $ne: null } } }, // Filter out null categories
      { $sort: { _id: 1 } } // Sort alphabetically
    ];
    
    // Get unique brands for the filter dropdown
    const brandPipeline = [
      { $match: { status: "Delivered" } }, // Only delivered orders
      { $lookup: { from: "crm_products", localField: "items.productId", foreignField: "_id", as: "productInfo" } },
      { $unwind: "$productInfo" },
      // Lookup vendor/supplier info to apply userType filter
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
          "ownerType": { $ifNull: ["$productInfo.origin", "Vendor"] }
        }
      },
      // Apply userType filter
      ...(userType && userType !== 'all' ? [{
        $match: {
          "ownerType": userType.charAt(0).toUpperCase() + userType.slice(1) // Capitalize first letter
        }
      }] : []),
      { $group: { _id: { $ifNull: ["$productInfo.brand", null] } } }, // Get unique brands
      { $match: { "_id": { $ne: null } } }, // Filter out null brands
      { $sort: { _id: 1 } } // Sort alphabetically
    ];
    
    const categoriesResult = await ClientOrderModel.aggregate(categoryPipeline);
    const categories = categoriesResult.map(item => item._id).filter(category => category); // Filter out null/undefined categories
    
    const brandsResult = await ClientOrderModel.aggregate(brandPipeline);
    const brands = brandsResult.map(item => item._id).filter(brand => brand); // Filter out null/undefined brands
    
    return NextResponse.json({
      success: true,
      data: {
        salesByProducts: formattedData,
        aggregatedTotals,
        cities: cities,
        businessNames: businessNames,
        categories: categories,
        brands: brands,
        filter: filterType ? `${filterType}: ${filterValue}` : 'All time'
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching sales by products report:", error);
    
    return NextResponse.json({ 
      success: false,
      message: "Error fetching sales by products report",
      error: error.message
    }, { status: 500 });
  }
}, ["superadmin", "admin"]);