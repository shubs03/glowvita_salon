import _db from "@repo/lib/db";
import { generateFreshaLikeSlots, generateAnyStaffSlots, generateWeddingPackageSlots } from "@repo/lib/modules/scheduling/FreshaLikeSlotEngine";
import { acquireLock, createTemporaryAppointment, confirmAppointment, releaseLock, cancelAppointment } from "@repo/lib/modules/scheduling/OptimisticLocking";
import { calculateVendorTravelTime } from "@repo/lib/modules/scheduling/EnhancedTravelUtils";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";
import ServiceModel from "@repo/lib/models/admin/Service";
import StaffModel from "@repo/lib/models/staffModel";
import AddOnModel from "@repo/lib/models/Vendor/AddOn.model";
import WeddingPackageModel from "@repo/lib/models/Vendor/WeddingPackage.model";
import { validateService, validateStaff, validateAppointment, validateWeddingPackage } from "@repo/lib/modules/validation/ValidationEngine";
import { AppError, formatErrorResponse } from "@repo/lib/modules/error/ErrorHandler";
import { getCache, setCache } from "@repo/lib/modules/caching/CacheManager";
import { sendEmail } from "../../../../../../../packages/lib/src/emailService";
import { getCancellationTemplate } from "../../../../../../../packages/lib/src/emailTemplates";
import UserModel from "../../../../../../../packages/lib/src/models/user/User.model";

// Utility functions for internally use
/**
 * Unified Booking API Route
 * Consolidates all booking operations into a single endpoint
 */

/**
 * Helper: Parse duration string or number to minutes
 * @param {string|number} duration - Duration to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} - Duration in minutes
 */
const parseDuration = (duration, defaultValue = 60) => {
  if (duration === undefined || duration === null || duration === '') return 0;
  if (typeof duration === 'number') return duration;
  if (typeof duration === 'string') {
    const match = duration.match(/(\d+)\s*(min|hour|hours)/i);
    if (!match) {
      const num = parseInt(duration);
      return isNaN(num) ? defaultValue : num;
    }
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    if (unit === 'min') return value;
    if (unit === 'hour' || unit === 'hours') return value * 60;
  }
  return defaultValue;
};

/**
 * Helper: Ensure numeric values for amounts and durations to avoid NaN
 * @param {any} a - Value to check
 * @returns {number} - Numeric value or 0
 */
const safeAmount = (a) => {
  if (a === undefined || a === null) return 0;
  const num = Number(a);
  return isNaN(num) ? 0 : num;
};

// Handle CORS preflight
export const OPTIONS = async () => {
  const response = new Response(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

/**
 * GET: Discovery endpoints for various booking components
 */
export const GET = async (request, { params }) => {
  try {
    await _db();

    // params.action is an array from the catch-all route [...action]
    // e.g. /api/booking/vendors -> params.action = ['vendors']
    const path = params.action ? params.action[0] : '';
    const { searchParams } = new URL(request.url);

    switch (path) {
      case 'vendors':
        return await handleVendorDiscovery(searchParams);
      case 'services':
        return await handleServiceDiscovery(searchParams);
      case 'staff':
        return await handleStaffDiscovery(searchParams);
      case 'slots':
        return await handleSlotDiscovery(searchParams);
      case 'wedding-packages':
        return await handleWeddingPackageDiscovery(searchParams);
      default:
        return Response.json(formatErrorResponse(new AppError(`Invalid endpoint: ${path}`, 'INVALID_ENDPOINT', 'CLIENT_ERROR', 404)), { status: 404 });
    }
  } catch (error) {
    console.error('GET Error:', error);
    const errorResponse = formatErrorResponse(error);
    return Response.json(errorResponse, { status: errorResponse.statusCode || 500 });
  }
};

/**
 * POST: Creation and booking operations
 */
export const POST = async (request, { params }) => {
  try {
    await _db();

    const path = params.action ? params.action[0] : '';
    const body = await request.json();

    switch (path) {
      case 'quote':
        return await handleQuoteRequest(body);
      case 'lock':
        return await handleSlotLock(body);
      case 'confirm':
        return await handleBookingConfirmation(body);
      case 'customize-wedding-package':
        return await handleWeddingPackageCustomization(body);
      case 'travel-time':
        return await handleTravelTimeRequest(body);
      case 'release-lock':
        return await handleReleaseLock(body);
      default:
        return Response.json(formatErrorResponse(new AppError(`Invalid endpoint: ${path}`, 'INVALID_ENDPOINT', 'CLIENT_ERROR', 404)), { status: 404 });
    }
  } catch (error) {
    console.error('POST Error:', error);
    const errorResponse = formatErrorResponse(error);
    return Response.json(errorResponse, { status: errorResponse.statusCode || 500 });
  }
};

/**
 * PUT: Update operations
 */
export const PUT = async (request, { params }) => {
  try {
    await _db();

    const path = params.action ? params.action[0] : '';
    const body = await request.json();

    switch (path) {
      case 'wedding-package':
        return await handleWeddingPackageUpdate(body);
      default:
        return Response.json(formatErrorResponse(new AppError(`Invalid endpoint: ${path}`, 'INVALID_ENDPOINT', 'CLIENT_ERROR', 404)), { status: 404 });
    }
  } catch (error) {
    console.error('PUT Error:', error);
    const errorResponse = formatErrorResponse(error);
    return Response.json(errorResponse, { status: errorResponse.statusCode || 500 });
  }
};

/**
 * DELETE: Cancellation operations
 */
export const DELETE = async (request, { params }) => {
  try {
    await _db();

    const path = params.action ? params.action[0] : '';
    const body = await request.json();

    switch (path) {
      case 'booking':
        return await handleBookingCancellation(body);
      default:
        return Response.json(formatErrorResponse(new AppError(`Invalid endpoint: ${path}`, 'INVALID_ENDPOINT', 'CLIENT_ERROR', 404)), { status: 404 });
    }
  } catch (error) {
    console.error('DELETE Error:', error);
    const errorResponse = formatErrorResponse(error);
    return Response.json(errorResponse, { status: errorResponse.statusCode || 500 });
  }
};

// --- Route Handlers ---

/**
 * Handle manual lock release
 * @returns {Promise<Response>}
 */
async function handleReleaseLock(body) {
  const { lockToken } = body;
  console.log('handleReleaseLock called with token:', lockToken);

  if (!lockToken) {
    const errorRes = formatErrorResponse(new AppError('Lock token is required', 'MISSING_LOCK_TOKEN', 'CLIENT_ERROR', 400));
    return Response.json(errorRes, { status: 400 });
  }

  try {
    const { releaseLock } = await import("@repo/lib/modules/scheduling/OptimisticLocking");
    await releaseLock(lockToken);
    return Response.json({
      success: true,
      message: "Lock released successfully"
    });
  } catch (error) {
    console.error('Error releasing lock:', error);
    const errorResponse = formatErrorResponse(error);
    return Response.json(errorResponse, { status: errorResponse.statusCode || 500 });
  }
}

/**
 * Handle travel time calculation request
 * @returns {Promise<Response>}
 */
async function handleTravelTimeRequest(body) {
  const { vendorId, customerLocation } = body;

  if (!vendorId || !customerLocation) {
    const errorRes = formatErrorResponse(new AppError('Vendor ID and customer location are required', 'MISSING_REQUIRED_FIELDS', 'CLIENT_ERROR', 400));
    return Response.json(errorRes, { status: 400 });
  }

  try {
    const travelTimeInfo = await calculateVendorTravelTime(vendorId, customerLocation);

    return Response.json({
      success: true,
      message: "Travel time calculated successfully",
      travelTimeInfo
    });
  } catch (error) {
    console.error('Error calculating travel time:', error);
    return formatErrorResponse(new AppError(error.message || 'Failed to calculate travel time', 'TRAVEL_TIME_CALCULATION_ERROR', 'SERVER_ERROR', 500));
  }
}

/**
 * Handle vendor discovery with location-based filtering
 * @returns {Promise<Response>}
 */
async function handleVendorDiscovery(searchParams) {
  const lat = parseFloat(searchParams.get('lat'));
  const lng = parseFloat(searchParams.get('lng'));
  const radius = parseInt(searchParams.get('radius')) || 20;
  const limit = parseInt(searchParams.get('limit')) || 20;
  const category = searchParams.get('category');
  const serviceId = searchParams.get('serviceId');

  // Validate location parameters if provided
  const hasValidLocation = !isNaN(lat) && !isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180;

  // Build base query for approved vendors
  let query = { status: "Approved" };

  // Add category filter if provided
  if (category) {
    query.category = category;
  }

  // Add service filter if provided
  if (serviceId) {
    // This would require a join with VendorServicesModel in a full implementation
    // For now, we'll note this as a limitation
  }

  let vendors;
  const cacheKey = `vendors_${lat}_${lng}_${radius}_${limit}_${category || 'all'}`;

  // Try to get from cache first
  const cachedVendors = await getCache(cacheKey);
  if (cachedVendors) {
    return Response.json({
      success: true,
      vendors: cachedVendors,
      count: cachedVendors.length,
      fromCache: true
    });
  }

  if (hasValidLocation) {
    // Use MongoDB geospatial query for efficient location-based filtering
    query.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat] // Note: GeoJSON uses [longitude, latitude] order
        },
        $maxDistance: radius * 1000 // Convert km to meters
      }
    };

    // Execute geospatial query with projection for performance
    vendors = await VendorModel.find(query, {
      businessName: 1,
      firstName: 1,
      lastName: 1,
      city: 1,
      state: 1,
      category: 1,
      profileImage: 1,
      description: 1,
      location: 1,
      vendorType: 1,
      travelRadius: 1,
      baseLocation: 1,
      createdAt: 1
    })
      .limit(limit)
      .maxTimeMS(5000) // 5-second timeout
      .lean()
      .exec();
  } else {
    // If no location provided, fetch vendors ordered by creation date
    vendors = await VendorModel.find(query, {
      businessName: 1,
      firstName: 1,
      lastName: 1,
      city: 1,
      state: 1,
      category: 1,
      profileImage: 1,
      description: 1,
      location: 1,
      vendorType: 1,
      travelRadius: 1,
      baseLocation: 1,
      createdAt: 1
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .maxTimeMS(5000)
      .lean()
      .exec();
  }

  // Transform vendor data for response
  const transformedVendors = vendors.map(vendor => ({
    id: vendor._id,
    businessName: vendor.businessName,
    ownerName: `${vendor.firstName} ${vendor.lastName}`,
    city: vendor.city,
    state: vendor.state,
    category: vendor.category,
    profileImage: vendor.profileImage,
    description: vendor.description,
    location: vendor.location,
    vendorType: vendor.vendorType,
    travelRadius: vendor.travelRadius,
    baseLocation: vendor.baseLocation
  }));

  // Cache the results
  await setCache(cacheKey, transformedVendors, 300); // Cache for 5 minutes

  return Response.json({
    success: true,
    vendors: transformedVendors,
    count: transformedVendors.length,
    locationProvided: hasValidLocation
  });
}

/**
 * Handle service discovery for a specific vendor
 * @returns {Promise<Response>}
 */
async function handleServiceDiscovery(searchParams) {
  const vendorId = searchParams.get('vendorId');

  if (!vendorId) {
    const errorRes = formatErrorResponse(new AppError('Vendor ID is required', 'MISSING_VENDOR_ID', 'CLIENT_ERROR', 400));
    return Response.json(errorRes, { status: 400 });
  }

  // Validate vendor ID format
  if (!/^[0-9a-fA-F]{24}$/.test(vendorId)) {
    const errorRes = formatErrorResponse(new AppError('Invalid vendor ID format', 'INVALID_VENDOR_ID', 'CLIENT_ERROR', 400));
    return Response.json(errorRes, { status: 400 });
  }

  const cacheKey = `services_vendor_${vendorId}`;

  // Try to get from cache first
  const cachedServices = await getCache(cacheKey);
  if (cachedServices) {
    return Response.json({
      success: true,
      services: cachedServices,
      vendorId: vendorId,
      count: cachedServices.length,
      fromCache: true
    });
  }

  // Import the VendorServicesModel dynamically to avoid circular dependencies
  const VendorServicesModel = (await import("@repo/lib/models/Vendor/VendorServices.model")).default;
  const CategoryModel = (await import("@repo/lib/models/admin/Category.model")).default;

  // Find the vendor services document with optimized query
  const vendorServices = await VendorServicesModel.findOne({
    vendor: vendorId
  }).select('services').populate('services.addOns').lean().exec();

  if (!vendorServices || !vendorServices.services || vendorServices.services.length === 0) {
    return Response.json({
      success: true,
      services: [],
      vendorId: vendorId,
      count: 0,
      message: "No services found for this vendor"
    });
  }

  // Filter only approved services
  const approvedServices = vendorServices.services.filter(service =>
    service.status === 'approved'
  );

  // Transform services and resolve category names
  const serviceCategories = new Set();
  const transformedServices = approvedServices.map((service) => {
    // Add category to set for later use
    let categoryName = 'Other';

    // Handle category resolution
    if (service.category && /^[0-9a-fA-F]{24}$/.test(service.category)) {
      // Will resolve category names later in batch
      categoryName = service.category.toString(); // Temporarily use ObjectId as key
    } else if (typeof service.category === 'string') {
      categoryName = service.category;
    }

    serviceCategories.add(categoryName);

    return {
      id: service._id.toString(),
      name: service.name,
      price: service.price,
      discountedPrice: service.discountedPrice,
      duration: service.duration,
      description: service.description,
      category: categoryName,
      image: service.image,
      status: service.status,
      gender: service.gender,
      staff: Array.isArray(service.staff) ? service.staff.map(s =>
        typeof s === 'object' ? s.toString() : s
      ) : [],
      homeService: service.homeService || { available: false, charges: null },
      weddingService: service.weddingService || { available: false, charges: null },
      onlineBooking: service.onlineBooking !== false, // Default to true if not explicitly false
      addOns: service.addOns || [],
      isAddon: false // Will be determined after category resolution
    };
  });

  // Resolve category names in batch for better performance
  const categoryIds = Array.from(serviceCategories).filter(cat =>
    /^[0-9a-fA-F]{24}$/.test(cat)
  );

  const categoryNames = {};
  if (categoryIds.length > 0) {
    const categories = await CategoryModel.find({
      _id: { $in: categoryIds.map(id => id) }
    }).select('name').lean().exec();

    categories.forEach(cat => {
      categoryNames[cat._id.toString()] = cat.name;
    });
  }

  // Apply resolved category names
  const finalServices = transformedServices.map(service => {
    if (categoryNames[service.category]) {
      service.category = categoryNames[service.category];
    } else if (/^[0-9a-fA-F]{24}$/.test(service.category)) {
      // Fallback if category name couldn't be resolved
      service.category = 'Other';
    }

    // Set isAddon to true if category name contains 'addon' OR add-ons are present
    service.isAddon =
      (service.category && typeof service.category === 'string' && service.category.toLowerCase().includes('addon')) ||
      (service.addOns && service.addOns.length > 0);

    return service;
  });

  // Cache the results
  await setCache(cacheKey, finalServices, 600); // Cache for 10 minutes

  // Group services by category for frontend convenience
  const servicesByCategory = {};
  finalServices.forEach(service => {
    if (!servicesByCategory[service.category]) {
      servicesByCategory[service.category] = [];
    }
    servicesByCategory[service.category].push(service);
  });

  // Prepare response with all necessary data
  return Response.json({
    success: true,
    services: finalServices,
    servicesByCategory: servicesByCategory,
    categories: Object.keys(servicesByCategory),
    vendorId: vendorId,
    count: finalServices.length
  });
}

/**
 * Handle staff discovery for a specific vendor
 * @returns {Promise<Response>}
 */
async function handleStaffDiscovery(searchParams) {
  const vendorId = searchParams.get('vendorId');

  if (!vendorId) {
    const errorRes = formatErrorResponse(new AppError('Vendor ID is required', 'MISSING_VENDOR_ID', 'CLIENT_ERROR', 400));
    return Response.json(errorRes, { status: 400 });
  }

  // Validate vendor ID format
  if (!/^[0-9a-fA-F]{24}$/.test(vendorId)) {
    const errorRes = formatErrorResponse(new AppError('Invalid vendor ID format', 'INVALID_VENDOR_ID', 'CLIENT_ERROR', 400));
    return Response.json(errorRes, { status: 400 });
  }

  const cacheKey = `staff_vendor_${vendorId}`;

  // Try to get from cache first
  const cachedStaff = await getCache(cacheKey);
  if (cachedStaff) {
    return Response.json({
      success: true,
      staff: cachedStaff,
      vendorId: vendorId,
      count: cachedStaff.length,
      fromCache: true
    });
  }

  // Find all active staff members for the vendor
  const staffMembers = await StaffModel.find({
    vendorId: vendorId,
    status: 'Active'
  }).select('fullName position photo mobileNo emailAddress mondayAvailable tuesdayAvailable wednesdayAvailable thursdayAvailable fridayAvailable saturdayAvailable sundayAvailable blockedTimes mondaySlots tuesdaySlots wednesdaySlots thursdaySlots fridaySlots saturdaySlots sundaySlots');

  // Transform staff data for public consumption (hide sensitive info)
  const publicStaffData = staffMembers.map(staff => ({
    id: staff._id,
    name: staff.fullName,
    role: staff.position,
    image: staff.photo || null,
    mondayAvailable: staff.mondayAvailable,
    tuesdayAvailable: staff.tuesdayAvailable,
    wednesdayAvailable: staff.wednesdayAvailable,
    thursdayAvailable: staff.thursdayAvailable,
    fridayAvailable: staff.fridayAvailable,
    saturdayAvailable: staff.saturdayAvailable,
    sundayAvailable: staff.sundayAvailable,
    blockedTimes: staff.blockedTimes || [],
    mondaySlots: staff.mondaySlots || [],
    tuesdaySlots: staff.tuesdaySlots || [],
    wednesdaySlots: staff.wednesdaySlots || [],
    thursdaySlots: staff.thursdaySlots || [],
    fridaySlots: staff.fridaySlots || [],
    saturdaySlots: staff.saturdaySlots || [],
    sundaySlots: staff.sundaySlots || []
    // Hide sensitive information like phone and email for public endpoint
  }));

  // Cache the results
  await setCache(cacheKey, publicStaffData, 600); // Cache for 10 minutes

  return Response.json({
    success: true,
    staff: publicStaffData,
    vendorId: vendorId,
    count: publicStaffData.length
  });
}

/**
 * Handle slot discovery with comprehensive validation
 * @returns {Promise<Response>}
 */
async function handleSlotDiscovery(searchParams) {
  try {
    console.log('=== handleSlotDiscovery called ===');
    console.log('Query params:', Object.fromEntries(searchParams.entries()));

    const vendorId = searchParams.get('vendorId');
    const staffId = searchParams.get('staffId');
    const serviceIds = searchParams.get('serviceIds')?.split(',') || [];
    const date = searchParams.get('date');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const isHomeService = searchParams.get('isHomeService') === 'true';
    const isWeddingService = searchParams.get('isWeddingService') === 'true';
    const packageId = searchParams.get('packageId');
    const addOnIds = searchParams.get('addOnIds')?.split(',') || [];
    const bufferBefore = parseInt(searchParams.get('bufferBefore')) || 0;
    const bufferAfter = parseInt(searchParams.get('bufferAfter')) || 0;

    console.log('Parsed values:', { vendorId, staffId, serviceIds, isWeddingService, packageId });

    // Validate required parameters
    if (!vendorId) {
      console.error('Missing vendorId');
      const err = formatErrorResponse(new AppError('Vendor ID is required', 'MISSING_VENDOR_ID', 'CLIENT_ERROR', 400));
      return Response.json(err, { status: 400 });
    }

    if (!date) {
      console.error('Missing date');
      const err = formatErrorResponse(new AppError('Date is required', 'MISSING_DATE', 'CLIENT_ERROR', 400));
      return Response.json(err, { status: 400 });
    }

    // Parse date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      const err = formatErrorResponse(new AppError('Invalid date format', 'INVALID_DATE_FORMAT', 'CLIENT_ERROR', 400));
      return Response.json(err, { status: 400 });
    }

    // Get services - fetch for both regular and wedding services
    let services = [];
    if (serviceIds.length > 0) {
      try {
        // First try to find in VendorServices collection where services are stored as subdocuments
        const VendorServicesModel = (await import("@repo/lib/models/Vendor/VendorServices.model")).default;
        const vendorServicesDoc = await VendorServicesModel.findOne({ vendor: vendorId }).lean();

        if (vendorServicesDoc && vendorServicesDoc.services) {
          services = vendorServicesDoc.services
            .filter(s => serviceIds.includes(s._id.toString()))
            .map(s => ({ 
              ...s, 
              duration: parseDuration(s.duration),
              prepTime: parseDuration(s.prepTime, 0),
              setupCleanupTime: parseDuration(s.setupCleanupTime, 0)
            }));
        }

        console.log(`Found ${services.length} services in VendorServices`);

        // Fallback to ServiceModel if not found (legacy or different structure)
        if (services.length === 0) {
          const rawServices = await ServiceModel.find({ _id: { $in: serviceIds } }).lean();
          services = rawServices.map(s => ({ 
            ...s, 
            duration: parseDuration(s.duration),
            prepTime: parseDuration(s.prepTime, 0),
            setupCleanupTime: parseDuration(s.setupCleanupTime, 0)
          }));
          console.log(`Found ${services.length} services in ServiceModel fallback`);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        const err = formatErrorResponse(new AppError('Failed to fetch services', 'SERVICE_FETCH_ERROR', 'SERVER_ERROR', 500));
        return Response.json(err, { status: 500 });
      }
    }

    // Fetch Add-ons if provided
    let addOns = [];
    if (addOnIds.length > 0) {
      try {
        const AddOnModel = (await import("@repo/lib/models/Vendor/AddOn.model")).default;
        addOns = await AddOnModel.find({ _id: { $in: addOnIds } }).lean();
        console.log(`Found ${addOns.length} addons to include in slot calculation`);

        // Add addons to services array for duration calculation in the engine
        // We map them to match the expected structure (id, name, duration)
        const addOnServices = addOns.map(addon => ({
          _id: addon._id,
          id: addon._id.toString(),
          name: addon.name,
          duration: parseDuration(addon.duration),
          price: addon.price || 0,
          isAddon: true
        }));

        services = [...services, ...addOnServices];
      } catch (error) {
        console.error('Error fetching addons:', error);
      }
    }

    // For wedding packages, services array can be empty - we use package duration directly

    // Prepare customer location if provided
    let customerLocation = null;
    if (lat && lng) {
      customerLocation = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      };
    }

    let slots = [];
    const cacheKey = `slots_${vendorId}_${staffId || 'any'}_${serviceIds.join('_')}_${addOnIds.join('_')}_${date}_${isHomeService ? 'home' : 'salon'}_${isWeddingService ? 'wedding' : 'regular'}_${packageId || 'none'}`;

    // Try to get from cache first
    const cachedSlots = await getCache(cacheKey);
    if (cachedSlots) {
      return Response.json({
        slots: cachedSlots,
        fromCache: true
      });
    }

    try {
      if (isWeddingService && packageId) {
        // Generate wedding package slots
        console.log('Generating wedding package slots with:', {
          packageId,
          vendorId,
          servicesCount: services.length,
          date: parsedDate,
          hasCustomerLocation: !!customerLocation
        });

        slots = await generateWeddingPackageSlots({
          packageId,
          vendorId,
          services,
          date: parsedDate,
          customerLocation,
          bufferBefore,
          bufferAfter
        });

        console.log(`Generated ${slots.length} wedding package slots`);
      } else if (staffId === 'any' || !staffId) {
        // Generate "Any Staff" slots
        slots = await generateAnyStaffSlots({
          vendorId,
          serviceIds: serviceIds.length > 0 ? serviceIds[0] : null,
          date: parsedDate,
          services,
          customerLocation,
          isHomeService,
          bufferBefore,
          bufferAfter
        });
      } else {
        // Generate slots for specific staff
        slots = await generateFreshaLikeSlots({
          vendorId,
          staffId,
          date: parsedDate,
          services,
          customerLocation,
          isHomeService,
          bufferBefore,
          bufferAfter
        });
      }
    } catch (error) {
      console.error('Error generating slots:', error);
      console.error('Error stack:', error.stack);
      const err = formatErrorResponse(new AppError(
        `Failed to generate slots: ${error.message}`,
        'SLOT_GENERATION_ERROR',
        'SERVER_ERROR',
        500
      ));
      return Response.json(err, { status: 500 });
    }

    // Cache the results
    await setCache(cacheKey, slots, 180); // Cache for 3 minutes

    return Response.json({ slots });

  } catch (topLevelError) {
    console.error('=== CRITICAL ERROR in handleSlotDiscovery ===');
    console.error('Error:', topLevelError);
    console.error('Stack:', topLevelError.stack);
    const err = formatErrorResponse(new AppError(
      `Server error: ${topLevelError.message}`,
      'INTERNAL_ERROR',
      'SERVER_ERROR',
      500
    ));
    return Response.json(err, { status: 500 });
  }
}

/**
 * Handle wedding package discovery
 * @returns {Promise<Response>}
 */
async function handleWeddingPackageDiscovery(searchParams) {
  const vendorId = searchParams.get('vendorId');
  const packageId = searchParams.get('packageId');
  const isActive = searchParams.get('isActive');

  // Validate required parameters
  if (!vendorId) {
    const errorRes = formatErrorResponse(new AppError('Vendor ID is required', 'MISSING_VENDOR_ID', 'CLIENT_ERROR', 400));
    return Response.json(errorRes, { status: 400 });
  }

  const cacheKey = `wedding_packages_${vendorId}_${packageId || 'all'}_${isActive || 'all'}`;

  // Try to get from cache first
  const cachedPackages = await getCache(cacheKey);
  if (cachedPackages) {
    return Response.json({
      success: true,
      weddingPackages: cachedPackages,
      count: cachedPackages.length,
      fromCache: true
    });
  }

  // Import the WeddingPackageModel dynamically
  const WeddingPackageModel = (await import("@repo/lib/models/Vendor/WeddingPackage.model")).default;

  let query = { vendorId };

  if (packageId) {
    query._id = packageId;
  }

  if (isActive !== null) {
    query.isActive = isActive === 'true';
  }

  const weddingPackages = await WeddingPackageModel.find(query)
    .sort({ createdAt: -1 });

  // Populate service details for each package
  const populatedPackages = await Promise.all(weddingPackages.map(async (pkg) => {
    return await pkg.populateServiceDetails();
  }));

  // Cache the results
  await setCache(cacheKey, populatedPackages, 600); // Cache for 10 minutes

  return Response.json({
    success: true,
    weddingPackages: populatedPackages,
    count: populatedPackages.length
  });
}

/**
 * Handle quote request for services or wedding packages
 * @returns {Promise<Response>}
 */
async function handleQuoteRequest(body) {
  const {
    vendorId,
    serviceIds = [],
    packageId,
    date,
    customerLocation,
    isHomeService = false,
    isWeddingService = false,
    selectedAddOns = [], // Array of add-on IDs
    bufferBefore = 0,
    bufferAfter = 0
  } = body;

  // Validate required parameters
  if (!vendorId) {
    const errorRes = formatErrorResponse(new AppError('Vendor ID is required', 'MISSING_VENDOR_ID', 'CLIENT_ERROR', 400));
    return Response.json(errorRes, { status: 400 });
  }

  if (!date) {
    const errorRes = formatErrorResponse(new AppError('Date is required', 'MISSING_DATE', 'CLIENT_ERROR', 400));
    return Response.json(errorRes, { status: 400 });
  }

  // Parse date
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    const errorRes = formatErrorResponse(new AppError('Invalid date format', 'INVALID_DATE_FORMAT', 'CLIENT_ERROR', 400));
    return Response.json(errorRes, { status: 400 });
  }

  // For wedding services, package ID is required
  if (isWeddingService && !packageId) {
    const errorRes = formatErrorResponse(new AppError('Package ID is required for wedding services', 'MISSING_PACKAGE_ID', 'CLIENT_ERROR', 400));
    return Response.json(errorRes, { status: 400 });
  }

  // Get services if service IDs are provided
  let services = [];
  if (serviceIds.length > 0) {
    services = await ServiceModel.find({
      _id: { $in: serviceIds },
      vendorId: vendorId
    });
  }

  let slots = [];
  let quoteDetails = {};

  if (isWeddingService && packageId) {
    // Generate wedding package slots and quote
    const weddingPackage = await WeddingPackageModel.findById(packageId);
    if (!weddingPackage) {
      const errorRes = formatErrorResponse(new AppError('Wedding package not found', 'PACKAGE_NOT_FOUND', 'CLIENT_ERROR', 404));
      return Response.json(errorRes, { status: 404 });
    }

    slots = await generateWeddingPackageSlots({
      packageId,
      vendorId,
      services,
      date: parsedDate,
      customerLocation,
      bufferBefore,
      bufferAfter
    });

    quoteDetails = {
      packageName: weddingPackage.name,
      packageDescription: weddingPackage.description,
      totalPrice: weddingPackage.totalPrice,
      discountedPrice: weddingPackage.discountedPrice,
      duration: weddingPackage.duration,
      depositRequired: weddingPackage.depositRequired,
      depositAmount: weddingPackage.depositAmount,
      cancellationPolicy: weddingPackage.cancellationPolicy
    };
  } else {
    // Generate regular service quote
    if (serviceIds.length === 0) {
      const errorRes = formatErrorResponse(new AppError('At least one service ID is required', 'MISSING_SERVICE_IDS', 'CLIENT_ERROR', 400));
      return Response.json(errorRes, { status: 400 });
    }

    // Calculate total price and duration
    let totalPrice = 0;
    let totalDuration = 0;
    let selectedAddOnDetails = [];

    services.forEach(service => {
      totalPrice += service.price;
      totalDuration += service.duration;
    });

    // Handle Add-ons
    if (selectedAddOns.length > 0) {
      const AddOnModel = (await import("@repo/lib/models/Vendor/AddOn.model")).default;
      const addOns = await AddOnModel.find({ _id: { $in: selectedAddOns } }).lean();

      addOns.forEach(addOn => {
        totalPrice += addOn.price;
        totalDuration += addOn.duration;
        selectedAddOnDetails.push({
          addOnId: addOn._id,
          name: addOn.name,
          price: addOn.price,
          duration: addOn.duration
        });
      });

      // Add addons to services array for duration calculation in the engine
      const addOnServices = addOns.map(addon => ({
        _id: addon._id,
        id: addon._id.toString(),
        name: addon.name,
        duration: addon.duration || 0,
        price: addon.price || 0,
        isAddon: true
      }));

      // Ensure existing services are in plain object format if they are Mongoose documents
      const plainServices = services.map(s => (typeof s.toObject === 'function') ? s.toObject() : s);
      services = [...plainServices, ...addOnServices];
    }

    slots = await generateAnyStaffSlots({
      vendorId,
      serviceIds: serviceIds[0],
      date: parsedDate,
      services,
      customerLocation,
      isHomeService,
      bufferBefore,
      bufferAfter
    });

    quoteDetails = {
      services: services.map(s => ({
        id: s._id,
        name: s.name,
        price: s.price,
        duration: s.duration
      })),
      totalPrice,
      totalDuration,
      isHomeService,
      selectedAddOns: selectedAddOnDetails
    };
  }

  return Response.json({
    success: true,
    message: "Quote generated successfully",
    quote: quoteDetails,
    slots,
    count: slots.length
  });
}

/**
 * Handle slot lock acquisition
 * @returns {Promise<Response>}
 */
async function handleSlotLock(body) {
  try {
    console.log('handleSlotLock body:', body);

    const {
      vendorId,
      clientId
    } = body;

    // INDUSTRY BEST PRACTICE: Only allow ONE active lock per client per vendor
    // This prevents a single user from blocking multiple slots.
    if (clientId && clientId !== 'temp-client-id') {
      try {
        const Appointment = (await import("@repo/lib/models/Appointment/Appointment.model")).default;
        const existingTempApt = await Appointment.findOne({
          client: clientId,
          vendorId: vendorId,
          status: 'temp-locked'
        });

        if (existingTempApt) {
          console.log(`Auto-releasing previously locked slot for client ${clientId}: Appointment ${existingTempApt._id}`);
          await cancelAppointment(existingTempApt._id.toString(), existingTempApt.lockToken);
        }
      } catch (err) {
        console.error("Error during auto-lock-release:", err);
        // Continue anyway to not block the new lock
      }
    }

    const {
      staffId,
      serviceId: rawServiceId,
      serviceName,
      date,
      startTime,
      endTime,
      clientName,
      clientEmail,
      clientPhone,
      staffName,
      isHomeService,
      isWeddingService,
      location,
      homeServiceLocation,
      packageId,
      duration,
      amount,
      addOnsAmount = 0,
      totalAmount,
      finalAmount,
      platformFee = 0,
      serviceTax = 0,
      taxRate = 0,
      addOns = [],
      selectedAddOns,
      couponCode = null,
      discountAmount = 0,
      bufferBefore = 0,
      bufferAfter = 0
    } = body;

    // Resolve "combo" to a real service ID if possible to avoid CastError
    const serviceId = rawServiceId === "combo" ? (body.serviceItems?.[0]?.service || rawServiceId) : rawServiceId;

    // Handle Add-ons - Fetch full details to ensure accurate duration/price calculation
    const rawAddOnIds = body.addOnIds || [];
    const rawSelectedAddOns = body.selectedAddOns || [];
    const combinedInputAddOnIds = [...new Set([...rawAddOnIds, ...rawSelectedAddOns])];

    let effectiveAddOns = [];

    if (combinedInputAddOnIds.length > 0) {
      const AddOnIDs = combinedInputAddOnIds.map(a => (typeof a === 'string') ? a : (a.id || a._id || a));
      const AddOnModel = (await import("@repo/lib/models/Vendor/AddOn.model")).default;
      const addOnDocs = await AddOnModel.find({ _id: { $in: AddOnIDs } }).lean();

      effectiveAddOns = AddOnIDs.map(id => {
        const doc = addOnDocs.find(d => d._id.toString() === id.toString());
        return doc ? {
          _id: doc._id,
          id: doc._id.toString(),
          name: doc.name,
          price: doc.price || 0,
          duration: parseDuration(doc.duration)
        } : null;
      }).filter(Boolean);
    }

    console.log('Effective AddOns (detailed):', effectiveAddOns);

    // SUPPORT BOTH FIELD NAMES: If location is missing but homeServiceLocation exists, use it
    const actualLocation = location || homeServiceLocation;

    console.log('Received slot lock request:', body);
    console.log('Using location data:', actualLocation);

    // FIX: Force isHomeService to true if we have a location
    const effectiveIsHomeService = isHomeService || !!actualLocation;
    console.log('Effective isHomeService:', effectiveIsHomeService, '(Original:', isHomeService, ', Has Location:', !!actualLocation, ')');

    // Validate required parameters
    if (!vendorId || !serviceId || !date || !startTime || !endTime) {
      const errorResponse = formatErrorResponse(new AppError('Vendor ID, service ID, date, start time, and end time are required', 'MISSING_REQUIRED_FIELDS', 'CLIENT_ERROR', 400));
      return Response.json(errorResponse, { status: 400 });
    }

    // Set default clientId if not provided
    const effectiveClientId = clientId || 'temp-client-id';
    const effectiveClientName = clientName || 'Customer';

    // Parse date
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      const errorResponse = formatErrorResponse(new AppError('Invalid date format', 'INVALID_DATE_FORMAT', 'CLIENT_ERROR', 400));
      return Response.json(errorResponse, { status: 400 });
    }

    // Calculate additional time from addons
    const totalAddOnsDuration = effectiveAddOns.reduce((sum, a) => sum + parseDuration(a.duration, 0), 0);
    const totalAddOnsPrice = effectiveAddOns.reduce((sum, a) => sum + (Number(a.price) || 0), 0);

    // Prepare lock data, ensuring it matches the Appointment schema structure
    // Use serviceItems from request body if provided (for multi-service bookings)
    // Otherwise, create a single-service array for backward compatibility
    let serviceItems;
    if (body.serviceItems && Array.isArray(body.serviceItems) && body.serviceItems.length > 0) {
      // Multi-service booking - use the serviceItems from frontend
      console.log('Using serviceItems from request body (multi-service):', body.serviceItems.length, 'services');
      serviceItems = body.serviceItems.map(item => ({
        ...item,
        // If this is the primary service, add the addons (ensure string comparison)
        // Only overwrite if effectiveAddOns has items, otherwise keep what's in the item
        addOns: (item.service && serviceId && item.service.toString() === serviceId.toString() && effectiveAddOns.length > 0)
          ? effectiveAddOns
          : (item.addOns || [])
      }));
    } else {
      // Single service booking - create serviceItems array with the primary service
      console.log('Creating serviceItems for single service');
      serviceItems = [{
        service: serviceId,
        serviceName: serviceName || 'Service',
        staff: staffId,
        staffName: staffName || 'Any Professional',
        startTime,
        endTime,
        duration: Number(duration) || 0,
        amount: Number(amount) || 0,
        addOns: effectiveAddOns
      }];
    }

    // Determine if this is a multi-service booking
    const isMultiService = body.isMultiService || (serviceItems && serviceItems.length > 1);
    console.log('isMultiService:', isMultiService, '(from body:', body.isMultiService, ', serviceItems count:', serviceItems?.length, ')');

    // Fetch Base Services to ensure we have the correct base durations (avoid frontend double-counting)
    const VendorServicesModel = (await import("@repo/lib/models/Vendor/VendorServices.model")).default;
    const vendorServicesDoc = await VendorServicesModel.findOne({ vendor: vendorId }).lean();
    const dbServices = vendorServicesDoc?.services || [];

    // For ALL bookings (single or multi), ensure sequential start/end times and total duration includes addons
    let currentStartTime = startTime;
    let finalCalculatedDuration = 0;

    serviceItems = serviceItems.map((item, index) => {
      // Get base duration from DB or fallback to item.duration (if not double-counted)
      // We look up by service ID to be safe
      const dbService = dbServices.find(s => s._id.toString() === item.service.toString());
      const baseDuration = dbService ? parseDuration(dbService.duration) : parseDuration(item.duration);

      let serviceDuration = baseDuration;
      if (item.addOns && Array.isArray(item.addOns)) {
        const addOnsDuration = item.addOns.reduce((sum, addon) => sum + parseDuration(addon.duration, 0), 0);
        serviceDuration += addOnsDuration;
      }

      // Calculate end time for this service
      const [hours, minutes] = currentStartTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + serviceDuration;
      const endHours = Math.floor(totalMinutes / 60) % 24;
      const endMinutes = totalMinutes % 60;
      const serviceEndTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

      const updatedItem = {
        ...item,
        startTime: currentStartTime,
        endTime: serviceEndTime,
        duration: baseDuration, // Store original base duration
        totalDuration: serviceDuration // Total including addons
      };

      finalCalculatedDuration += serviceDuration;

      // Next service starts when this one ends
      currentStartTime = serviceEndTime;

      console.log(`Service ${index + 1} (${item.serviceName}): ${updatedItem.startTime} - ${updatedItem.endTime} (Base: ${baseDuration}min, Total: ${serviceDuration}min)`);

      return updatedItem;
    });

    const calculatedEndTime = serviceItems[serviceItems.length - 1].endTime;

    // Calculate travel time early to use in verification
    let calculatedTravelTime = null;
    if (effectiveIsHomeService && actualLocation) {
      try {
        const customerLocation = {
          lat: actualLocation.lat,
          lng: actualLocation.lng
        };
        calculatedTravelTime = await calculateVendorTravelTime(vendorId, customerLocation);
        console.log('Lock travel time calculated:', calculatedTravelTime);
      } catch (error) {
        console.warn('Could not calculate travel time, using fallback:', error.message);
        calculatedTravelTime = {
          timeInMinutes: 30,
          distanceInKm: 10,
          distanceInMeters: 10000,
          source: 'fallback'
        };
      }
    }

    // CRITICAL: Re-verify availability with the engine now that we have the actual travel time
    if (effectiveIsHomeService && calculatedTravelTime && staffId !== 'any') {
      const { generateFreshaLikeSlots } = await import("@repo/lib/modules/scheduling/FreshaLikeSlotEngine");
      try {
        // Correctly merge addons into the services array for re-verification
        const verificationServices = serviceItems.map(item => ({
          id: item.service,
          name: item.serviceName,
          duration: parseDuration(item.duration)
        }));

        // Add addons as distinct services so the engine counts their duration
        const addOnServices = effectiveAddOns.map(addon => ({
          id: addon._id.toString(),
          name: addon.name,
          duration: parseDuration(addon.duration),
          isAddon: true
        }));

        const validationSlots = await generateFreshaLikeSlots({
          vendorId,
          staffId,
          date: appointmentDate,
          services: [...verificationServices, ...addOnServices],
          customerLocation: actualLocation,
          isHomeService: true,
          bufferBefore: Number(bufferBefore) || 0,
          bufferAfter: Number(bufferAfter) || 0
        });

        // Check if the requested start time is still available
        const isStillAvailable = validationSlots.some(s => s.startTime === startTime);
        if (!isStillAvailable) {
          console.warn(`Time slot ${startTime} no longer available with travel time of ${calculatedTravelTime.timeInMinutes} mins or existing bookings`);
          const errorRes = formatErrorResponse(new AppError('The selected time is no longer available. Please choose another time or professional.', 'SLOT_CONFLICT', 'CONFLICT', 409));
          return Response.json(errorRes, { status: 409 });
        }
      } catch (err) {
        console.error("Availability re-check error:", err.message);
      }
    }

    // [GENERAL CONFLICT CHECK] Check for any overlapping appointments in DB for the specific staff
    // This is a safety net for non-home-service appointments as well
    const { checkMultiServiceConflict } = await import('@repo/lib/modules/scheduling/ConflictChecker');
    const dbConflict = await checkMultiServiceConflict(vendorId, appointmentDate, serviceItems);
    if (dbConflict) {
      console.warn('Conflict detected during handleSlotLock:', dbConflict);
      const errorRes = formatErrorResponse(new AppError('The selected time slot is already booked. Please choose another time.', 'SLOT_CONFLICT', 'CONFLICT', 409));
      return Response.json(errorRes, { status: 409 });
    }

    // Calculate totals if not provided
    const effectiveServiceAmount = amount !== undefined ? safeAmount(amount) : (serviceItems && serviceItems.length > 0 ? serviceItems.reduce((sum, item) => sum + safeAmount(item.amount), 0) : 0);
    const effectiveTotalAmount = totalAmount !== undefined ? safeAmount(totalAmount) : (effectiveServiceAmount + totalAddOnsPrice);

    console.log('Amount Calculations:', {
      inputAmount: amount,
      inputTotalAmount: totalAmount,
      effectiveServiceAmount,
      totalAddOnsPrice,
      effectiveTotalAmount,
      finalAmountInBody: finalAmount
    });

    // Determine the primary staffId for locking purposes
    const lockStaffId = staffId || (serviceItems && serviceItems.length > 0 ? (serviceItems[0].staff || serviceItems[0].staffId || 'any') : 'any');

    console.log('Staff Resolution:', {
      topLevelStaffId: staffId,
      firstItemStaff: serviceItems?.[0]?.staff,
      resolvedStaffId: lockStaffId
    });

    const lockData = {
      vendorId,
      staffId: lockStaffId,
      serviceId, // Keep for top-level reference if needed by other logic
      serviceName: serviceName || (serviceItems && serviceItems.length > 0 ? serviceItems[0].serviceName : 'Service'),
      staffName: staffName || (serviceItems && serviceItems.length > 0 ? serviceItems[0].staffName : 'Any Professional'),
      date: appointmentDate,
      startTime,
      endTime: calculatedEndTime,
      duration: finalCalculatedDuration,
      clientId: effectiveClientId,
      clientName: effectiveClientName,
      clientEmail: clientEmail,
      clientPhone: clientPhone,
      isHomeService: effectiveIsHomeService,
      isWeddingService,
      isMultiService,
      // Amounts
      amount: effectiveServiceAmount,
      addOnsAmount: totalAddOnsPrice,
      totalAmount: effectiveTotalAmount,
      finalAmount: finalAmount !== undefined ? safeAmount(finalAmount) : (effectiveTotalAmount + safeAmount(platformFee) + safeAmount(serviceTax) - safeAmount(discountAmount)),
      platformFee: safeAmount(platformFee),
      serviceTax: safeAmount(serviceTax),
      taxRate: safeAmount(taxRate),
      couponCode: couponCode,
      discountAmount: safeAmount(discountAmount),
      // For single service, keep addOns for backward compatibility
      addOns: effectiveAddOns,
      // Service Structure
      serviceItems: serviceItems,
      // Location
      ...(actualLocation && actualLocation.lat && actualLocation.lng ? { location: actualLocation } : {}),
      // Package
      ...(packageId ? { packageId } : {}),
      // Buffers
      bufferBefore: safeAmount(bufferBefore),
      bufferAfter: safeAmount(bufferAfter),
      travelTimeInfo: calculatedTravelTime // Include the calculated one
    };

    // Add travel time info to lock data
    const enhancedLockData = {
      ...lockData,
      travelTimeInfo: calculatedTravelTime
    };

    console.log('Enhanced lock data:', enhancedLockData);

    // Acquire lock
    const lockToken = await acquireLock(enhancedLockData);

    if (!lockToken) {
      const errorResponse = formatErrorResponse(new AppError('Failed to acquire slot lock - slot may be taken', 'LOCK_ACQUISITION_FAILED', 'CONFLICT', 409));
      return Response.json(errorResponse, { status: 409 });
    }

    // Create a temporary appointment
    const tempAppointment = await createTemporaryAppointment(enhancedLockData, lockToken);

    // Use the actual MongoDB ObjectId of the temporary appointment
    const tempAppointmentId = tempAppointment._id.toString();

    console.log('Temporary appointment created with ID:', tempAppointmentId);

    return Response.json({
      success: true,
      message: "Slot lock acquired successfully",
      lockId: lockToken,
      appointmentId: tempAppointmentId,
      expiresAt: tempAppointment.lockExpiration
    });
  } catch (error) {
    console.error('Error in handleSlotLock:', error);
    const errorResponse = formatErrorResponse(error);
    return Response.json(errorResponse, { status: errorResponse.statusCode || 500 });
  }
}

/**
 * Handle booking confirmation
 * @returns {Promise<Response>}
 */
async function handleBookingConfirmation(body) {
  const {
    appointmentId,
    lockId,
    paymentDetails,
    paymentMethod,
    paymentStatus,
    couponCode,
    discountAmount,
    finalAmount,
    platformFee,
    serviceTax,
    taxRate
  } = body;

  // consolidate payment info
  const effectivePaymentDetails = paymentDetails || { paymentMethod, paymentStatus };

  console.log('Received confirmation request:', body);

  // Validate required parameters
  if (!appointmentId) {
    return formatErrorResponse(new AppError('Appointment ID is required', 'MISSING_APPOINTMENT_ID', 'CLIENT_ERROR', 400));
  }

  // Confirm appointment
  let confirmResult;
  try {
    // Pass lockId as lockToken to match the function signature
    // CRITICAL FIX: Also pass platformFee, serviceTax, and taxRate to ensure they're saved
    confirmResult = await confirmAppointment(appointmentId, lockId, effectivePaymentDetails, { 
      couponCode, 
      discountAmount, 
      finalAmount,
      platformFee,
      serviceTax,
      taxRate
    });
  } catch (error) {
    console.error('Error during appointment confirmation:', error);
    // Handle specific error cases with appropriate user messages
    if (error.message === 'Invalid lock token') {
      const errorRes = formatErrorResponse(new AppError('The selected time slot has expired. Please try again.', 'INVALID_LOCK_TOKEN', 'CONFLICT', 409));
      return Response.json(errorRes, { status: 409 });
    } else if (error.message === 'Lock has expired') {
      const errorRes = formatErrorResponse(new AppError('The selected time slot has expired. Please try again.', 'LOCK_EXPIRED', 'CONFLICT', 409));
      return Response.json(errorRes, { status: 409 });
    } else if (error.message === 'Appointment not found') {
      const errorRes = formatErrorResponse(new AppError('Appointment not found. Please try again.', 'APPOINTMENT_NOT_FOUND', 'NOT_FOUND', 404));
      return Response.json(errorRes, { status: 404 });
    } else {
      throw error; // Re-throw other errors
    }
  }

  return Response.json({
    success: true,
    message: "Appointment confirmed successfully",
    appointment: confirmResult.appointment
  });
}

/**
 * Handle wedding package customization
 * @returns {Promise<Response>}
 */
async function handleWeddingPackageCustomization(body) {
  const {
    packageId,
    customizedServices
  } = body;

  if (!packageId || !customizedServices) {
    const errorRes = formatErrorResponse(new AppError('Package ID and customized services are required', 'MISSING_REQUIRED_FIELDS', 'CLIENT_ERROR', 400));
    return Response.json(errorRes, { status: 400 });
  }

  // Import the WeddingPackageModel dynamically
  const WeddingPackageModel = (await import("@repo/lib/models/Vendor/WeddingPackage.model")).default;

  // Find the package
  const weddingPackage = await WeddingPackageModel.findById(packageId);

  if (!weddingPackage) {
    const errorRes = formatErrorResponse(new AppError('Wedding package not found', 'PACKAGE_NOT_FOUND', 'CLIENT_ERROR', 404));
    return Response.json(errorRes, { status: 404 });
  }

  // Apply customizations
  const customizedPackage = weddingPackage.applyCustomizations(customizedServices);
  await customizedPackage.save();

  // Populate service details
  const populatedPackage = await customizedPackage.populateEnhancedServiceDetails();

  return Response.json({
    success: true,
    message: "Customizations applied successfully",
    weddingPackage: populatedPackage
  });
}

/**
 * Handle wedding package update
 * @returns {Promise<Response>}
 */
async function handleWeddingPackageUpdate(body) {
  const {
    packageId,
    ...updateData
  } = body;

  if (!packageId) {
    const errorRes = formatErrorResponse(new AppError('Package ID is required', 'MISSING_PACKAGE_ID', 'CLIENT_ERROR', 400));
    return Response.json(errorRes, { status: 400 });
  }

  // Import the WeddingPackageModel dynamically
  const WeddingPackageModel = (await import("@repo/lib/models/Vendor/WeddingPackage.model")).default;

  // Update the package
  const updatedPackage = await WeddingPackageModel.findByIdAndUpdate(
    packageId,
    { ...updateData, updatedAt: new Date() },
    { new: true, runValidators: true }
  );

  if (!updatedPackage) {
    const errorRes = formatErrorResponse(new AppError('Wedding package not found', 'PACKAGE_NOT_FOUND', 'CLIENT_ERROR', 404));
    return Response.json(errorRes, { status: 404 });
  }

  // Populate service details
  const populatedPackage = await updatedPackage.populateEnhancedServiceDetails();

  return Response.json({
    success: true,
    message: "Enhanced wedding package updated successfully",
    weddingPackage: populatedPackage
  });
}

/**
 * Handle booking cancellation
 * @returns {Promise<Response>}
 */
async function handleBookingCancellation(body) {
  const { appointmentId, reason } = body;

  // Validate required parameters
  if (!appointmentId) {
    return formatErrorResponse(new AppError('Appointment ID is required', 'MISSING_APPOINTMENT_ID', 'CLIENT_ERROR', 400));
  }

  // Import the AppointmentModel dynamically
  const AppointmentModel = (await import("@repo/lib/models/Appointment/Appointment.model")).default;

  // Cancel booking
  const appointment = await AppointmentModel.findByIdAndUpdate(
    appointmentId,
    {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: new Date()
    },
    { new: true }
  );

  if (!appointment) {
    const errorRes = formatErrorResponse(new AppError('Appointment not found', 'APPOINTMENT_NOT_FOUND', 'CLIENT_ERROR', 404));
    return Response.json(errorRes, { status: 404 });
  }

  // Release any associated lock
  if (appointment.lockToken) {
    await releaseLock(appointment.lockToken);
  }

  // Send cancellation email
  try {
    const vendor = await VendorModel.findById(appointment.vendorId).select('businessName');
    const businessName = vendor?.businessName || 'GlowVita Salon';

    let clientEmail = appointment.clientEmail;
    let clientName = appointment.clientName;

    // If clientEmail is missing, check User model (for logged-in users)
    if (!clientEmail && appointment.client) {
      const user = await UserModel.findById(appointment.client).select('emailAddress email firstName lastName');
      if (user) {
        clientEmail = user.emailAddress || user.email;
        clientName = clientName || `${user.firstName} ${user.lastName}`;
      }
    }

    if (clientEmail) {
      const emailHtml = getCancellationTemplate({
        clientName,
        businessName,
        serviceName: appointment.serviceName,
        date: appointment.date,
        startTime: appointment.startTime,
        cancellationReason: reason
      });

      await sendEmail({
        to: clientEmail,
        subject: `Appointment Cancelled - ${businessName}`,
        html: emailHtml
      });
      console.log(`Cancellation email sent to ${clientEmail}`);
    }
  } catch (emailError) {
    console.error('Error sending cancellation email:', emailError);
  }

  return Response.json({
    success: true,
    message: "Booking cancelled successfully",
    appointment
  });
}