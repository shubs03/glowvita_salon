import { NextResponse } from "next/server";
import dbConnect from "@repo/lib/db";
import SmsTransaction from "@repo/lib/models/Marketing/SmsPurchaseHistory.model";
import Vendor from "@repo/lib/models/Vendor/Vendor.model";
import Supplier from "@repo/lib/models/Vendor/Supplier.model";
import SMSPackage from "@repo/lib/models/Marketing/SmsPackage.model";
import { authMiddlewareAdmin } from "../../../../../../middlewareAdmin";
import { getRegionQuery } from "@repo/lib/utils/regionQuery";
import { buildRegionQueryFromRequest } from "@repo/lib";

export const GET = authMiddlewareAdmin(async (request) => {
  try {
    await dbConnect();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const city = searchParams.get("city");
    const status = searchParams.get("status");
    const userType = searchParams.get("userType"); // Changed from businessType to match frontend
    const packageName = searchParams.get("packageName");
    const businessName = searchParams.get("businessName"); // Add businessName filter
    const regionId = searchParams.get("regionId");
    const regionQuery = getRegionQuery(request.user, regionId);
    
    // Build query filters
    let matchConditions = {};
    
    // Date range filter
    if (startDate || endDate) {
      matchConditions.purchaseDate = {};
      if (startDate) {
        matchConditions.purchaseDate.$gte = new Date(startDate);
      }
      if (endDate) {
        matchConditions.purchaseDate.$lte = new Date(endDate);
      }
    }
    
    // Status filter
    if (status && status !== "all") {
      matchConditions.status = status;
    }
    
    // User type filter (business type)
    if (userType && userType !== "all") {
      matchConditions.userType = userType.toLowerCase(); // "vendor" or "supplier"
    }
    
    // City filter - we'll handle this in the aggregation pipeline
    
    // Aggregate SMS transactions with vendor/supplier information
    const smsTransactions = await SmsTransaction.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: "vendors",
          localField: "userId",
          foreignField: "_id",
          as: "vendorInfo"
        }
      },
      {
        $lookup: {
          from: "suppliers",
          localField: "userId",
          foreignField: "_id",
          as: "supplierInfo"
        }
      },
      {
        $addFields: {
          vendorInfo: { $arrayElemAt: ["$vendorInfo", 0] },
          supplierInfo: { $arrayElemAt: ["$supplierInfo", 0] }
        }
      },
      {
        $addFields: {
          userInfo: {
            $cond: {
              if: { $eq: ["$userType", "vendor"] },
              then: "$vendorInfo",
              else: "$supplierInfo"
            }
          }
        }
      },
      {
        $match: {
          userInfo: { $exists: true, $ne: null }
        }
      },
      // Apply region filter - map regionId to userInfo.regionId
      ...(Object.keys(regionQuery).length > 0 ? [{
        $match: Object.keys(regionQuery).reduce((acc, key) => {
          acc[`userInfo.${key}`] = regionQuery[key];
          return acc;
        }, {})
      }] : []),
      // Apply city filter if provided
      ...(city && city !== "all" ? [{
        $match: {
          "userInfo.city": city
        }
      }] : []),
      {
        $lookup: {
          from: "smspackages",
          localField: "packageId",
          foreignField: "_id",
          as: "packageInfo"
        }
      },
      { $unwind: "$packageInfo" },
      // Apply package name filter if provided
      ...(packageName && packageName !== "all" ? [{
        $match: {
          "packageInfo.name": packageName
        }
      }] : []),
      // Apply business name filter if provided
      ...(businessName && businessName !== "all" ? [{
        $match: {
          $expr: {
            $eq: [
              {
                $cond: {
                  if: { $eq: ["$userType", "vendor"] },
                  then: "$userInfo.businessName",
                  else: "$userInfo.shopName"
                }
              },
              businessName
            ]
          }
        }
      }] : []),
      {
        $project: {
          _id: 1,
          vendor: {
            $cond: {
              if: { $eq: ["$userType", "vendor"] },
              then: "$userInfo.businessName",
              else: "$userInfo.shopName"
            }
          },
          city: "$userInfo.city",
          packageName: "$packageInfo.name",
          smsCount: "$smsCount",
          price: "$price",
          purchaseDate: 1,
          expiryDate: 1,
          status: 1,
          type: {
            $cond: {
              if: { $eq: ["$userType", "vendor"] },
              then: "Vendor",
              else: "Supplier"
            }
          },
          // For ticket raised, we'll default to "No" as we don't have ticket information in current models
          ticketRaised: { $literal: "No" }
        }
      },
      { $sort: { purchaseDate: -1 } }
    ]);
    
    // Get unique cities for filter dropdown (from both vendors and suppliers)
    let vendorCities = [];
    let supplierCities = [];
    let allCities = [];
    
    const distinctQuery = buildRegionQueryFromRequest(request);
    
    if (!userType || userType === "all") {
      // Get cities from both vendors and suppliers
      vendorCities = await Vendor.distinct("city", distinctQuery);
      supplierCities = await Supplier.distinct("city", distinctQuery);
      allCities = [...new Set([...vendorCities, ...supplierCities])];
    } else if (userType === "vendor") {
      // Get cities only from vendors
      vendorCities = await Vendor.distinct("city", distinctQuery);
      allCities = vendorCities;
    } else if (userType === "supplier") {
      // Get cities only from suppliers
      supplierCities = await Supplier.distinct("city", distinctQuery);
      allCities = supplierCities;
    }
    
    allCities = allCities.filter(city => city && city !== 'N/A');
    
    // Get unique package names for filter dropdown
    // Get all package names from the database to ensure complete list regardless of filters
    const allPackageDocs = await SMSPackage.find({}, { name: 1, _id: 0 });
    const packageNames = [...new Set(allPackageDocs.map(pkg => pkg.name))].filter(name => name && name !== 'N/A');
    
    // Get all business names for filter dropdown
    // Get all vendor business names
    const vendorBusinessNames = await Vendor.distinct("businessName", distinctQuery);
    // Get all supplier shop names
    const supplierShopNames = await Supplier.distinct("shopName", distinctQuery);
    // Combine and deduplicate all business names
    const businessNames = [...new Set([...vendorBusinessNames, ...supplierShopNames])].filter(name => name && name !== 'N/A');
    
    return NextResponse.json({
      success: true,
      data: {
        campaigns: smsTransactions,
        cities: allCities.sort(),
        packageNames: packageNames.sort(),
        businessNames: businessNames.sort()
      }
    });
  } catch (error) {
    console.error("Error fetching marketing campaign report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch marketing campaign report" },
      { status: 500 }
    );
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN"]);