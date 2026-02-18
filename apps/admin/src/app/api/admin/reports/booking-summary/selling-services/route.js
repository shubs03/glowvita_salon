import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import { authMiddlewareAdmin } from "../../../../../../middlewareAdmin";
import { getRegionQuery } from "@repo/lib/utils/regionQuery";

// Initialize database connection
const initDb = async () => {
  try {
    await _db();
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
};

// GET - Fetch selling services report data
export const GET = authMiddlewareAdmin(async (req) => {
  try {
    console.log("Selling Services Report API called");
    await initDb();
    
    // Extract filter parameters from query
    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get('filterType'); // 'day', 'month', 'year', or null
    const filterValue = searchParams.get('filterValue'); // specific date value
    const startDateParam = searchParams.get('startDate'); // Custom date range start
    const endDateParam = searchParams.get('endDate'); // Custom date range end
    const saleType = searchParams.get('saleType'); // 'online', 'offline', or 'all'
    const city = searchParams.get('city'); // City filter
    const vendor = searchParams.get('vendor'); // Vendor filter
    const service = searchParams.get('service'); // Service filter
    const limit = parseInt(searchParams.get('limit')) || 100; // Limit results for performance
    const page = parseInt(searchParams.get('page')) || 1; // Pagination
    const regionId = searchParams.get('regionId'); // Region filter
    
    console.log("Filter parameters:", { filterType, filterValue, startDateParam, endDateParam, saleType, city, limit, page });
    
    // Build date filter
    const buildDateFilter = (filterType, filterValue, startDateParam, endDateParam) => {
      let startDate, endDate;
      
      // Handle custom date range first
      if (startDateParam && endDateParam) {
        startDate = new Date(startDateParam);
        endDate = new Date(endDateParam);
        endDate.setHours(23, 59, 59, 999); // Set to end of day
        return { date: { $gte: startDate, $lte: endDate } };
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

      return filterType ? { date: { $gte: startDate, $lte: endDate } } : {};
    };
    
    const dateFilter = buildDateFilter(filterType, filterValue, startDateParam, endDateParam);
    console.log("Date filter:", dateFilter);
    
    // Build mode filter
    const buildModeFilter = (saleType) => {
      if (!saleType || saleType === 'all') {
        return {};
      }
      return { mode: saleType };
    };
    
    const modeFilter = buildModeFilter(saleType);
    
    const regionQuery = getRegionQuery(req.user, regionId);
    
    // Combine all filters
    const combinedFilter = {
      ...dateFilter,
      ...modeFilter,
      ...regionQuery,
      status: "completed",
      paymentStatus: "completed"
    };
    
    // Add city filter to the pipeline instead of combinedFilter
    console.log("Combined filter for Selling Services:", combinedFilter);
    
    // Service filter will be applied in the pipeline like city and vendor filters
    
    // 1. Services usage statistics
    const servicesUsagePipeline = [
      // Match appointments within the date filter and only include completed appointments
      { $match: combinedFilter },
      
      // Lookup vendor information
      {
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendorInfo"
        }
      },
      
      // Unwind vendorInfo array
      { $unwind: "$vendorInfo" },
      
      // Apply city filter if provided
      ...(city && city !== 'all' ? [{ $match: { "vendorInfo.city": city } }] : []),
      // Apply vendor filter if provided
      ...(vendor && vendor !== 'all' ? [{ $match: { "vendorInfo.businessName": vendor } }] : []),
      
      // Process all appointments using the simple rule based on isMultiService field
      {
        $facet: {
          // Single-service appointments: isMultiService is false or doesn't exist
          singleService: [
            { 
              $match: { 
                $or: [
                  { isMultiService: { $exists: false } },
                  { isMultiService: false }
                ],
                serviceName: { $exists: true, $ne: null }
              } 
            },
            // Apply service filter if provided
            ...(service && service !== 'all' ? [
              { $match: { serviceName: service } }
            ] : []),
            {
              $project: {
                serviceName: "$serviceName",
                service: "$service",
                amount: "$totalAmount",
                vendorId: "$vendorId",
                mode: "$mode",
                vendorCity: "$vendorInfo.city", // Add vendor city
                vendorName: "$vendorInfo.businessName", // Add vendor name
                platformFee: "$platformFee",
                serviceTax: "$serviceTax",
                totalAmount: "$totalAmount",
                // Include service items for multi-service handling
                serviceItems: "$serviceItems",
                isMultiService: "$isMultiService"
              }
            }
          ],
          // Multi-service appointments: isMultiService is true
          multiService: [
            { 
              $match: { 
                isMultiService: true,
                serviceItems: { $exists: true, $ne: [] } 
              } 
            },
            { $unwind: "$serviceItems" },
            { 
              $match: { 
                "serviceItems.serviceName": { $exists: true, $ne: null } 
              } 
            },
            // Apply service filter if provided
            ...(service && service !== 'all' ? [
              { $match: { "serviceItems.serviceName": service } }
            ] : []),
            {
              $project: {
                serviceName: "$serviceItems.serviceName",
                service: "$serviceItems.service",
                amount: "$serviceItems.amount",
                vendorId: "$vendorId",
                mode: "$mode",
                vendorCity: "$vendorInfo.city", // Add vendor city
                vendorName: "$vendorInfo.businessName", // Add vendor name
                platformFee: "$platformFee",
                serviceTax: "$serviceTax",
                totalAmount: "$totalAmount",
                // Include service items for multi-service handling
                serviceItems: "$serviceItems",
                isMultiService: "$isMultiService"
              }
            }
          ]
        }
      },
      {
        $project: {
          allServices: { $concatArrays: ["$singleService", "$multiService"] }
        }
      },
      { $unwind: "$allServices" },
      {
        $group: {
          _id: {
            serviceName: "$allServices.serviceName",
            vendorId: "$allServices.vendorId"
          },
          name: { $first: "$allServices.serviceName" },
          serviceId: { $first: "$allServices.service" },
          vendorId: { $first: "$allServices.vendorId" },
          vendorName: { $first: "$allServices.vendorName" }, // Add vendor name
          vendorCity: { $first: "$allServices.vendorCity" }, // Add vendor city
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: { $ifNull: ["$allServices.amount", 0] } },
          totalAmount: { $sum: { $ifNull: ["$allServices.amount", 0] } },
          mode: { $first: "$allServices.mode" },
          // Group all appointments to calculate platform fees and taxes
          appointments: { $push: "$allServices" }
        }
      },
      // Calculate platform fees and taxes
      {
        $addFields: {
          // Calculate total platform fee and service tax for the service group
          totalPlatformFee: {
            $reduce: {
              input: "$appointments",
              initialValue: 0,
              in: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$$this.mode", "online"] }, // Only for online mode
                      { $ne: ["$$this.platformFee", 0] },   // Only if platform fee is not zero
                      { $ne: ["$$this.serviceTax", 0] }     // Only if service tax is not zero
                    ]
                  },
                  then: {
                    $cond: {
                      if: { $eq: ["$$this.isMultiService", true] },
                      then: {
                        // For multi-service, distribute platform fee proportionally
                        $add: [
                          "$$value",
                          {
                            $cond: {
                              if: { $gt: ["$$this.totalAmount", 0] },
                              then: {
                                $multiply: [
                                  "$$this.platformFee",
                                  { $divide: ["$$this.amount", "$$this.totalAmount"] }
                                ]
                              },
                              else: 0
                            }
                          }
                        ]
                      },
                      else: {
                        // For single-service, use the full platform fee
                        $add: ["$$value", "$$this.platformFee"]
                      }
                    }
                  },
                  else: "$$value"
                }
              }
            }
          },
          totalServiceTax: {
            $reduce: {
              input: "$appointments",
              initialValue: 0,
              in: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$$this.mode", "online"] }, // Only for online mode
                      { $ne: ["$$this.platformFee", 0] },   // Only if platform fee is not zero
                      { $ne: ["$$this.serviceTax", 0] }     // Only if service tax is not zero
                    ]
                  },
                  then: {
                    $cond: {
                      if: { $eq: ["$$this.isMultiService", true] },
                      then: {
                        // For multi-service, distribute service tax proportionally
                        $add: [
                          "$$value",
                          {
                            $cond: {
                              if: { $gt: ["$$this.totalAmount", 0] },
                              then: {
                                $multiply: [
                                  "$$this.serviceTax",
                                  { $divide: ["$$this.amount", "$$this.totalAmount"] }
                                ]
                              },
                              else: 0
                            }
                          }
                        ]
                      },
                      else: {
                        // For single-service, use the full service tax
                        $add: ["$$value", "$$this.serviceTax"]
                      }
                    }
                  },
                  else: "$$value"
                }
              }
            }
          }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ];
    
    // Execute the optimized pipeline
    let servicesUsage = await AppointmentModel.aggregate(servicesUsagePipeline);
    
    console.log("Aggregation result count:", servicesUsage.length);
    
    // Format data as requested: Service, Vendor, Total Service Amount (₹), Items Sold, Platform Fee, Service Tax
    const formattedData = servicesUsage
      .filter(service => {
        // Filter out records with invalid vendor names
        const vendorName = service.vendorName || '';
        return vendorName && vendorName.toLowerCase() !== 'vendor' && vendorName.trim() !== '' && vendorName.toLowerCase() !== 'unknown vendor';
      })
      .map(service => ({
        service: service.name,
        vendor: service.vendorName,
        city: service.vendorCity || 'Unknown City',
        totalServiceAmount: `₹${service.totalRevenue.toFixed(2)}`,
        rawTotalServiceAmount: service.totalRevenue,
        itemsSold: service.totalBookings,
        platformFee: service.totalPlatformFee ? `₹${service.totalPlatformFee.toFixed(2)}` : null,
        rawPlatformFee: service.totalPlatformFee || 0,
        serviceTax: service.totalServiceTax ? `₹${service.totalServiceTax.toFixed(2)}` : null,
        rawServiceTax: service.totalServiceTax || 0,

      }));

    console.log("Formatted data count:", formattedData.length);
    
    // Get all services without pagination for accurate vendor count
    const allServicesPipeline = [
      // Match appointments within the date filter and only include completed appointments
      { $match: combinedFilter },
      
      // Lookup vendor information
      {
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendorInfo"
        }
      },
      
      // Unwind vendorInfo array
      { $unwind: "$vendorInfo" },
      
      // Apply city filter if provided
      ...(city && city !== 'all' ? [{ $match: { "vendorInfo.city": city } }] : []),
      // Apply vendor filter if provided
      ...(vendor && vendor !== 'all' ? [{ $match: { "vendorInfo.businessName": vendor } }] : []),
      // Apply service filter if provided
      ...(service && service !== 'all' ? [
        {
          $match: {
            $or: [
              { serviceName: service },
              { "serviceItems.serviceName": service }
            ]
          }
        }
      ] : []),
      
      // Process all appointments using the simple rule based on isMultiService field
      {
        $facet: {
          // Single-service appointments: isMultiService is false or doesn't exist
          singleService: [
            { 
              $match: { 
                $or: [
                  { isMultiService: { $exists: false } },
                  { isMultiService: false }
                ],
                serviceName: { $exists: true, $ne: null }
              } 
            },
            // Apply service filter if provided
            ...(service && service !== 'all' ? [
              { $match: { serviceName: service } }
            ] : []),
            {
              $project: {
                serviceName: "$serviceName",
                service: "$service",
                amount: "$totalAmount",
                vendorId: "$vendorId",
                mode: "$mode",
                vendorCity: "$vendorInfo.city", // Add vendor city
                vendorName: "$vendorInfo.businessName", // Add vendor name
                platformFee: "$platformFee",
                serviceTax: "$serviceTax",
                totalAmount: "$totalAmount",
                // Include service items for multi-service handling
                serviceItems: "$serviceItems",
                isMultiService: "$isMultiService"
              }
            }
          ],
          // Multi-service appointments: isMultiService is true
          multiService: [
            { 
              $match: { 
                isMultiService: true,
                serviceItems: { $exists: true, $ne: [] } 
              } 
            },
            { $unwind: "$serviceItems" },
            { 
              $match: { 
                "serviceItems.serviceName": { $exists: true, $ne: null } 
              } 
            },
            // Apply service filter if provided
            ...(service && service !== 'all' ? [
              { $match: { "serviceItems.serviceName": service } }
            ] : []),
            {
              $project: {
                serviceName: "$serviceItems.serviceName",
                service: "$serviceItems.service",
                amount: "$serviceItems.amount",
                vendorId: "$vendorId",
                mode: "$mode",
                vendorCity: "$vendorInfo.city", // Add vendor city
                vendorName: "$vendorInfo.businessName", // Add vendor name
                platformFee: "$platformFee",
                serviceTax: "$serviceTax",
                totalAmount: "$totalAmount",
                // Include service items for multi-service handling
                serviceItems: "$serviceItems",
                isMultiService: "$isMultiService"
              }
            }
          ]
        }
      },
      {
        $project: {
          allServices: { $concatArrays: ["$singleService", "$multiService"] }
        }
      },
      { $unwind: "$allServices" },
      {
        $group: {
          _id: {
            serviceName: "$allServices.serviceName",
            vendorId: "$allServices.vendorId"
          },
          name: { $first: "$allServices.serviceName" },
          serviceId: { $first: "$allServices.service" },
          vendorId: { $first: "$allServices.vendorId" },
          vendorName: { $first: "$allServices.vendorName" }, // Add vendor name
          vendorCity: { $first: "$allServices.vendorCity" }, // Add vendor city
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: { $ifNull: ["$allServices.amount", 0] } },
          totalAmount: { $sum: { $ifNull: ["$allServices.amount", 0] } },
          mode: { $first: "$allServices.mode" },
          // Group all appointments to calculate platform fees and taxes
          appointments: { $push: "$allServices" }
        }
      },
      // Calculate platform fees and taxes
      {
        $addFields: {
          // Calculate total platform fee and service tax for the service group
          totalPlatformFee: {
            $reduce: {
              input: "$appointments",
              initialValue: 0,
              in: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$$this.mode", "online"] }, // Only for online mode
                      { $ne: ["$$this.platformFee", 0] },   // Only if platform fee is not zero
                      { $ne: ["$$this.serviceTax", 0] }     // Only if service tax is not zero
                    ]
                  },
                  then: {
                    $cond: {
                      if: { $eq: ["$$this.isMultiService", true] },
                      then: {
                        // For multi-service, distribute platform fee proportionally
                        $add: [
                          "$$value",
                          {
                            $cond: {
                              if: { $gt: ["$$this.totalAmount", 0] },
                              then: {
                                $multiply: [
                                  "$$this.platformFee",
                                  { $divide: ["$$this.amount", "$$this.totalAmount"] }
                                ]
                              },
                              else: 0
                            }
                          }
                        ]
                      },
                      else: {
                        // For single-service, use the full platform fee
                        $add: ["$$value", "$$this.platformFee"]
                      }
                    }
                  },
                  else: "$$value"
                }
              }
            }
          },
          totalServiceTax: {
            $reduce: {
              input: "$appointments",
              initialValue: 0,
              in: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$$this.mode", "online"] }, // Only for online mode
                      { $ne: ["$$this.platformFee", 0] },   // Only if platform fee is not zero
                      { $ne: ["$$this.serviceTax", 0] }     // Only if service tax is not zero
                    ]
                  },
                  then: {
                    $cond: {
                      if: { $eq: ["$$this.isMultiService", true] },
                      then: {
                        // For multi-service, distribute service tax proportionally
                        $add: [
                          "$$value",
                          {
                            $cond: {
                              if: { $gt: ["$$this.totalAmount", 0] },
                              then: {
                                $multiply: [
                                  "$$this.serviceTax",
                                  { $divide: ["$$this.amount", "$$this.totalAmount"] }
                                ]
                              },
                              else: 0
                            }
                          }
                        ]
                      },
                      else: {
                        // For single-service, use the full service tax
                        $add: ["$$value", "$$this.serviceTax"]
                      }
                    }
                  },
                  else: "$$value"
                }
              }
            }
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ];
    
    // Execute the pipeline to get all services
    let allServices = await AppointmentModel.aggregate(allServicesPipeline);
    
    // Calculate unique vendors count from all services
    const uniqueVendors = [...new Set(allServices.map(service => service.vendorName))].length;
    
    // Calculate unique services count from all services
    const uniqueServices = [...new Set(allServices.map(service => service.name))].length;
    
    // Get total count for pagination (without limit/skip)
    const totalCountPipeline = [
      { $match: combinedFilter },
      { $lookup: { from: "vendors", localField: "vendorId", foreignField: "_id", as: "vendorInfo" } },
      { $unwind: "$vendorInfo" },
      // Apply city filter if provided for count as well
      ...(city && city !== 'all' ? [{ $match: { "vendorInfo.city": city } }] : []),
      // Apply vendor filter if provided for count as well
      ...(vendor && vendor !== 'all' ? [{ $match: { "vendorInfo.businessName": vendor } }] : []),
      // Apply service filter if provided for count as well
      ...(service && service !== 'all' ? [
        {
          $match: {
            $or: [
              { serviceName: service },
              { "serviceItems.serviceName": service }
            ]
          }
        }
      ] : []),
      {
        $facet: {
          singleService: [
            { 
              $match: { 
                $or: [
                  { isMultiService: { $exists: false } },
                  { isMultiService: false }
                ],
                serviceName: { $exists: true, $ne: null }
              } 
            },
            { $project: { serviceName: "$serviceName", vendorId: "$vendorId", isMultiService: "$isMultiService" } }
          ],
          multiService: [
            { 
              $match: { 
                isMultiService: true,
                serviceItems: { $exists: true, $ne: [] } 
              } 
            },
            { $unwind: "$serviceItems" },
            { 
              $match: { 
                "serviceItems.serviceName": { $exists: true, $ne: null } 
              } 
            },
            { $project: { serviceName: "$serviceItems.serviceName", vendorId: "$vendorId", isMultiService: "$isMultiService" } }
          ]
        }
      },
      {
        $project: {
          allServices: { $concatArrays: ["$singleService", "$multiService"] }
        }
      },
      { $unwind: "$allServices" },
      {
        $group: {
          _id: {
            serviceName: "$allServices.serviceName",
            vendorId: "$allServices.vendorId"
          }
        }
      },
      { $count: "total" }
    ];
    
    const totalCountResult = await AppointmentModel.aggregate(totalCountPipeline);
    const totalServices = totalCountResult.length > 0 ? totalCountResult[0].total : 0;
    
    // Get unique cities for the filter dropdown
    const cityPipeline = [
      { $match: { status: "completed", paymentStatus: "completed" } }, // Only completed appointments
      { $lookup: { from: "vendors", localField: "vendorId", foreignField: "_id", as: "vendorInfo" } },
      { $unwind: "$vendorInfo" },
      { $group: { _id: "$vendorInfo.city" } }, // Get unique cities
      { $sort: { _id: 1 } } // Sort alphabetically
    ];
    
    const citiesResult = await AppointmentModel.aggregate(cityPipeline);
    const cities = citiesResult.map(item => item._id).filter(city => city); // Filter out null/undefined cities
    
    // Get unique vendors for the filter dropdown
    const vendorPipeline = [
      { $match: { status: "completed", paymentStatus: "completed" } }, // Only completed appointments
      { $lookup: { from: "vendors", localField: "vendorId", foreignField: "_id", as: "vendorInfo" } },
      { $unwind: "$vendorInfo" },
      { $group: { _id: "$vendorInfo.businessName" } }, // Get unique vendor names
      { $sort: { _id: 1 } } // Sort alphabetically
    ];
    
    const vendorsResult = await AppointmentModel.aggregate(vendorPipeline);
    const vendors = vendorsResult.map(item => item._id).filter(vendor => vendor); // Filter out null/undefined vendors
    
    // Get unique services for the filter dropdown
    const servicePipeline = [
      { $match: { status: "completed", paymentStatus: "completed" } }, // Only completed appointments
      {
        $facet: {
          // Single-service appointments: isMultiService is false or doesn't exist
          singleService: [
            { 
              $match: { 
                $or: [
                  { isMultiService: { $exists: false } },
                  { isMultiService: false }
                ],
                serviceName: { $exists: true, $ne: null }
              } 
            }
          ],
          // Multi-service appointments: isMultiService is true
          multiService: [
            { 
              $match: { 
                isMultiService: true,
                serviceItems: { $exists: true, $ne: [] } 
              } 
            },
            { $unwind: "$serviceItems" },
            { 
              $match: { 
                "serviceItems.serviceName": { $exists: true, $ne: null } 
              } 
            }
          ]
        }
      },
      {
        $project: {
          allServices: { $concatArrays: ["$singleService", "$multiService"] }
        }
      },
      { $unwind: "$allServices" },
      { $group: { _id: "$allServices.serviceName" } }, // Get unique service names
      { $sort: { _id: 1 } } // Sort alphabetically
    ];
    
    const servicesResult = await AppointmentModel.aggregate(servicePipeline);
    const services = servicesResult.map(item => item._id).filter(service => service); // Filter out null/undefined services
    
    // Calculate aggregated totals
    const aggregatedTotals = servicesUsage.reduce((totals, service) => {
      totals.totalServiceAmount += service.totalRevenue || 0;
      totals.totalItemsSold += service.totalBookings || 0;
      totals.totalPlatformFee += service.totalPlatformFee || 0;
      totals.totalServiceTax += service.totalServiceTax || 0;

      return totals;
    }, {
      totalServiceAmount: 0,
      totalItemsSold: 0,
      totalPlatformFee: 0,
      totalServiceTax: 0,

    });
    
    // Calculate total business (Total Service Amount + Platform Fee + Service Tax)
    aggregatedTotals.totalBusiness = aggregatedTotals.totalServiceAmount + aggregatedTotals.totalPlatformFee + aggregatedTotals.totalServiceTax;
    aggregatedTotals.totalBusinessFormatted = `₹${aggregatedTotals.totalBusiness.toFixed(2)}`;
    
    return NextResponse.json({
      success: true,
      data: {
        services: formattedData,
        cities: cities, // Add cities to the response
        vendors: vendors, // Add vendors to the response
        servicesList: services, // Add services to the response
        totalServices: totalServices,
        uniqueVendors: uniqueVendors, // Add unique vendors count to the response
        uniqueServices: uniqueServices, // Add unique services count to the response
        aggregatedTotals: {
          ...aggregatedTotals,
          totalServiceAmountFormatted: `₹${aggregatedTotals.totalServiceAmount.toFixed(2)}`,
          totalPlatformFeeFormatted: aggregatedTotals.totalPlatformFee > 0 ? `₹${aggregatedTotals.totalPlatformFee.toFixed(2)}` : null,
          totalServiceTaxFormatted: aggregatedTotals.totalServiceTax > 0 ? `₹${aggregatedTotals.totalServiceTax.toFixed(2)}` : null,

        }, // Add aggregated totals to the response
        currentPage: page,
        totalPages: Math.ceil(totalServices / limit),
        limit: limit,
        filter: filterType ? `${filterType}: ${filterValue}` : 'All time',
        saleType: saleType || 'all',
        startDate: startDateParam,
        endDate: endDateParam
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching selling services report:", error);
    
    return NextResponse.json({ 
      success: false,
      message: "Error fetching selling services report",
      error: error.message
    }, { status: 500 });
  }
}, ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "reports:view");