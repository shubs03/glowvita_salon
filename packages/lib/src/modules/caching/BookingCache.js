import cacheManager from './CacheManager.js';
import VendorModel from '../../models/Vendor/Vendor.model.js';
import StaffModel from '../../models/Vendor/Staff.model.js';
import ServiceModel from '../../models/Service/Service.model.js';
import WeddingPackageModel from '../../models/Vendor/WeddingPackage.model.js';

/**
 * Booking Cache Module
 * Handles caching for booking-related data with intelligent invalidation
 */

// Cache TTL constants (in seconds)
const CACHE_TTL = {
  VENDOR_DISCOVERY: 600,     // 10 minutes
  SERVICE_LIST: 300,         // 5 minutes
  STAFF_LIST: 300,           // 5 minutes
  STAFF_AVAILABILITY: 180,   // 3 minutes
  WEDDING_PACKAGES: 600,     // 10 minutes
  TRAVEL_TIME: 600,          // 10 minutes
  SLOT_AVAILABILITY: 120,    // 2 minutes
  PRICE_CALCULATION: 300     // 5 minutes
};

/**
 * Cache vendor discovery results
 * @param {Object} params - Discovery parameters
 * @param {Array} vendors - Vendor results
 * @returns {Promise<boolean>} - Success status
 */
export async function cacheVendorDiscovery(params, vendors) {
  const key = cacheManager.createKey('vendor_discovery', [
    params.lat, 
    params.lng, 
    params.radius, 
    params.serviceId,
    params.date
  ]);
  
  return await cacheManager.set(key, vendors, CACHE_TTL.VENDOR_DISCOVERY);
}

/**
 * Get cached vendor discovery results
 * @param {Object} params - Discovery parameters
 * @returns {Promise<Array|null>} - Cached vendors or null
 */
export async function getCachedVendorDiscovery(params) {
  const key = cacheManager.createKey('vendor_discovery', [
    params.lat, 
    params.lng, 
    params.radius, 
    params.serviceId,
    params.date
  ]);
  
  return await cacheManager.get(key);
}

/**
 * Cache service list for a vendor
 * @param {string} vendorId - Vendor ID
 * @param {Array} services - Service list
 * @returns {Promise<boolean>} - Success status
 */
export async function cacheVendorServices(vendorId, services) {
  const key = cacheManager.createKey('vendor_services', [vendorId]);
  return await cacheManager.set(key, services, CACHE_TTL.SERVICE_LIST);
}

/**
 * Get cached service list for a vendor
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Array|null>} - Cached services or null
 */
export async function getCachedVendorServices(vendorId) {
  const key = cacheManager.createKey('vendor_services', [vendorId]);
  return await cacheManager.get(key);
}

/**
 * Cache staff list for a vendor
 * @param {string} vendorId - Vendor ID
 * @param {Array} staff - Staff list
 * @returns {Promise<boolean>} - Success status
 */
export async function cacheVendorStaff(vendorId, staff) {
  const key = cacheManager.createKey('vendor_staff', [vendorId]);
  return await cacheManager.set(key, staff, CACHE_TTL.STAFF_LIST);
}

/**
 * Get cached staff list for a vendor
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Array|null>} - Cached staff or null
 */
export async function getCachedVendorStaff(vendorId) {
  const key = cacheManager.createKey('vendor_staff', [vendorId]);
  return await cacheManager.get(key);
}

/**
 * Cache staff availability for a specific date
 * @param {string} staffId - Staff ID
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {Object} availability - Availability data
 * @returns {Promise<boolean>} - Success status
 */
export async function cacheStaffAvailability(staffId, date, availability) {
  const key = cacheManager.createKey('staff_availability', [staffId, date]);
  return await cacheManager.set(key, availability, CACHE_TTL.STAFF_AVAILABILITY);
}

/**
 * Get cached staff availability for a specific date
 * @param {string} staffId - Staff ID
 * @param {string} date - Date string (YYYY-MM-DD)
 * @returns {Promise<Object|null>} - Cached availability or null
 */
export async function getCachedStaffAvailability(staffId, date) {
  const key = cacheManager.createKey('staff_availability', [staffId, date]);
  return await cacheManager.get(key);
}

/**
 * Cache wedding packages for a vendor
 * @param {string} vendorId - Vendor ID
 * @param {Array} packages - Wedding packages
 * @returns {Promise<boolean>} - Success status
 */
export async function cacheWeddingPackages(vendorId, packages) {
  const key = cacheManager.createKey('wedding_packages', [vendorId]);
  return await cacheManager.set(key, packages, CACHE_TTL.WEDDING_PACKAGES);
}

/**
 * Get cached wedding packages for a vendor
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Array|null>} - Cached packages or null
 */
export async function getCachedWeddingPackages(vendorId) {
  const key = cacheManager.createKey('wedding_packages', [vendorId]);
  return await cacheManager.get(key);
}

/**
 * Cache travel time calculation
 * @param {Object} origin - Origin coordinates
 * @param {Object} destination - Destination coordinates
 * @param {string} vendorId - Vendor ID
 * @param {Object} travelInfo - Travel time information
 * @returns {Promise<boolean>} - Success status
 */
export async function cacheTravelTime(origin, destination, vendorId, travelInfo) {
  const key = cacheManager.createKey('travel_time', [
    origin.lat, 
    origin.lng, 
    destination.lat, 
    destination.lng, 
    vendorId
  ]);
  
  return await cacheManager.set(key, travelInfo, CACHE_TTL.TRAVEL_TIME);
}

/**
 * Get cached travel time calculation
 * @param {Object} origin - Origin coordinates
 * @param {Object} destination - Destination coordinates
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Object|null>} - Cached travel info or null
 */
export async function getCachedTravelTime(origin, destination, vendorId) {
  const key = cacheManager.createKey('travel_time', [
    origin.lat, 
    origin.lng, 
    destination.lat, 
    destination.lng, 
    vendorId
  ]);
  
  return await cacheManager.get(key);
}

/**
 * Cache slot availability
 * @param {Object} params - Slot parameters
 * @param {Array} slots - Available slots
 * @returns {Promise<boolean>} - Success status
 */
export async function cacheSlotAvailability(params, slots) {
  const key = cacheManager.createKey('slot_availability', [
    params.vendorId,
    params.staffId,
    params.date,
    params.serviceId
  ]);
  
  return await cacheManager.set(key, slots, CACHE_TTL.SLOT_AVAILABILITY);
}

/**
 * Get cached slot availability
 * @param {Object} params - Slot parameters
 * @returns {Promise<Array|null>} - Cached slots or null
 */
export async function getCachedSlotAvailability(params) {
  const key = cacheManager.createKey('slot_availability', [
    params.vendorId,
    params.staffId,
    params.date,
    params.serviceId
  ]);
  
  return await cacheManager.get(key);
}

/**
 * Cache price calculation
 * @param {Object} params - Price calculation parameters
 * @param {Object} priceInfo - Price information
 * @returns {Promise<boolean>} - Success status
 */
export async function cachePriceCalculation(params, priceInfo) {
  const key = cacheManager.createKey('price_calculation', [
    params.vendorId,
    params.serviceIds?.join(','),
    params.isHomeService,
    params.isWeddingService
  ]);
  
  return await cacheManager.set(key, priceInfo, CACHE_TTL.PRICE_CALCULATION);
}

/**
 * Get cached price calculation
 * @param {Object} params - Price calculation parameters
 * @returns {Promise<Object|null>} - Cached price info or null
 */
export async function getCachedPriceCalculation(params) {
  const key = cacheManager.createKey('price_calculation', [
    params.vendorId,
    params.serviceIds?.join(','),
    params.isHomeService,
    params.isWeddingService
  ]);
  
  return await cacheManager.get(key);
}

/**
 * Invalidate all caches for a vendor
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<void>}
 */
export async function invalidateVendorCaches(vendorId) {
  // For now, we'll flush all caches as a simple approach
  // In production, you might want to be more selective
  await cacheManager.flushAll();
}

/**
 * Invalidate staff-related caches
 * @param {string} staffId - Staff ID
 * @returns {Promise<void>}
 */
export async function invalidateStaffCaches(staffId) {
  // Find all keys related to this staff member and delete them
  // This is a simplified approach - in production you might want a more sophisticated solution
  await cacheManager.flushAll();
}

/**
 * Warm up caches for a vendor (preload commonly accessed data)
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<void>}
 */
export async function warmUpVendorCaches(vendorId) {
  try {
    // Preload vendor services
    const services = await ServiceModel.find({ vendorId });
    await cacheVendorServices(vendorId, services);
    
    // Preload vendor staff
    const staff = await StaffModel.find({ vendorId, status: 'Active' });
    await cacheVendorStaff(vendorId, staff);
    
    // Preload wedding packages
    const packages = await WeddingPackageModel.find({ vendorId, isActive: true });
    await cacheWeddingPackages(vendorId, packages);
    
    console.log(`Warmed up caches for vendor ${vendorId}`);
  } catch (error) {
    console.error(`Failed to warm up caches for vendor ${vendorId}:`, error);
  }
}

export default {
  cacheVendorDiscovery,
  getCachedVendorDiscovery,
  cacheVendorServices,
  getCachedVendorServices,
  cacheVendorStaff,
  getCachedVendorStaff,
  cacheStaffAvailability,
  getCachedStaffAvailability,
  cacheWeddingPackages,
  getCachedWeddingPackages,
  cacheTravelTime,
  getCachedTravelTime,
  cacheSlotAvailability,
  getCachedSlotAvailability,
  cachePriceCalculation,
  getCachedPriceCalculation,
  invalidateVendorCaches,
  invalidateStaffCaches,
  warmUpVendorCaches
};