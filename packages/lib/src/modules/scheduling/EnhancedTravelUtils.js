import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from '../../../../config/config.js';
import VendorModel from '../../models/Vendor/Vendor.model.js';
import { calculateHaversineDistance, calculateHaversineTime } from './TravelUtils.js';

/**
 * Enhanced Travel Utilities Module
 * Handles travel time calculation with caching, fallbacks, and external API integration
 */

// In-memory cache for travel times (in production, this should use Redis or similar)
const travelTimeCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Calculate travel time between two points with caching and fallback
 * @param {Object} origin - Origin coordinates {lat, lng}
 * @param {Object} destination - Destination coordinates {lat, lng}
 * @param {Object} vendor - Vendor object with travel configuration
 * @param {boolean} useExternalAPI - Whether to use external API for more accurate estimates
 * @returns {Promise<Object>} - Travel time information {timeInMinutes, distanceInKm, distanceInMeters, source}
 */
export async function calculateEnhancedTravelTime(origin, destination, vendor, useExternalAPI = true) {
  try {
    // Create cache key
    const cacheKey = `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}-${vendor._id}`;
    
    // Check cache first
    if (travelTimeCache.has(cacheKey)) {
      const cached = travelTimeCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('Using cached travel time');
        return {
          ...cached.data,
          source: 'cache'
        };
      } else {
        // Expired cache, remove it
        travelTimeCache.delete(cacheKey);
      }
    }
    
    // Validate vendor supports travel
    const supportsTravel = ['onsite-only', 'hybrid', 'vendor-home-travel'].includes(vendor.vendorType);
    if (!supportsTravel) {
      return {
        timeInMinutes: 0,
        distanceInKm: 0,
        distanceInMeters: 0,
        source: 'vendor-not-supported'
      };
    }
    
    // Calculate distance using Haversine formula
    const distanceInKm = calculateHaversineDistance(origin, destination);
    const distanceInMeters = distanceInKm * 1000;
    
    // Check if customer is within travel radius
    if (distanceInKm > vendor.travelRadius) {
      throw new Error('Customer location is outside vendor travel radius');
    }
    
    let timeInMinutes = 0;
    let source = 'haversine';
    
    // Try external API if enabled and available
    if (useExternalAPI && NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      try {
        timeInMinutes = await calculateExternalTravelTime(origin, destination);
        source = 'external-api';
      } catch (externalError) {
        console.warn('External API failed, falling back to Haversine:', externalError.message);
        // Fall back to Haversine calculation
        timeInMinutes = calculateHaversineTime(origin, destination, vendor.travelSpeed);
      }
    } else {
      // Use Haversine calculation
      timeInMinutes = calculateHaversineTime(origin, destination, vendor.travelSpeed);
    }
    
    // Cache the result
    const result = {
      timeInMinutes,
      distanceInKm,
      distanceInMeters,
      source
    };
    
    travelTimeCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('Error calculating enhanced travel time:', error);
    throw error;
  }
}

/**
 * Calculate travel time using external API (Google Maps)
 * @param {Object} origin - Origin coordinates {lat, lng}
 * @param {Object} destination - Destination coordinates {lat, lng}
 * @returns {Promise<number>} - Travel time in minutes
 */
async function calculateExternalTravelTime(origin, destination) {
  try {
    // Check if Google Maps API key is available
    const apiKey = NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }
    
    // Format coordinates for Google Maps API
    const origins = `${origin.lat},${origin.lng}`;
    const destinations = `${destination.lat},${destination.lng}`;
    
    // Construct the Google Maps Distance Matrix API URL
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&key=${apiKey}`;
    
    // Make the API request
    const response = await fetch(url);
    
    // Check if response is OK
    if (!response.ok) {
      throw new Error(`Google Maps API request failed with status ${response.status}`);
    }
    
    // Parse the JSON response
    const data = await response.json();
    
    // Check API response status
    if (data.status !== 'OK') {
      throw new Error(`Google Maps API returned error status: ${data.status}`);
    }
    
    // Check element status
    if (data.rows[0].elements[0].status !== 'OK') {
      throw new Error(`Google Maps API element error: ${data.rows[0].elements[0].status}`);
    }
    
    // Extract travel time in seconds and convert to minutes
    const durationInSeconds = data.rows[0].elements[0].duration.value;
    return Math.ceil(durationInSeconds / 60);
  } catch (error) {
    console.error('Error calculating external travel time:', error);
    throw error;
  }
}
/**
 * Calculate travel time for a vendor to reach a customer location
 * @param {string} vendorId - Vendor ID
 * @param {Object} customerLocation - Customer location {lat, lng}
 * @param {boolean} useExternalAPI - Whether to use external API for more accurate estimates
 * @returns {Promise<Object>} - Travel time information
 */
export async function calculateVendorTravelTime(vendorId, customerLocation, useExternalAPI = true) {
  try {
    // Get vendor information
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }
    
    // Get vendor base location based on vendor type
    let vendorLocation;
    if (vendor.vendorType === 'home-only' || vendor.vendorType === 'vendor-home-travel') {
      vendorLocation = vendor.baseLocation;
    } else if (vendor.vendorType === 'hybrid') {
      // For hybrid vendors, use base location (shop location)
      vendorLocation = vendor.location;
    } else {
      // For onsite-only vendors, use base location
      vendorLocation = vendor.baseLocation;
    }
    
    // Validate vendor location
    if (!vendorLocation || !vendorLocation.lat || !vendorLocation.lng) {
      throw new Error('Vendor location not properly configured');
    }
    
    // Calculate travel time
    const travelInfo = await calculateEnhancedTravelTime(
      vendorLocation, 
      customerLocation, 
      vendor,
      useExternalAPI
    );
    
    return {
      ...travelInfo,
      vendorId: vendor._id,
      vendorType: vendor.vendorType
    };
  } catch (error) {
    console.error('Error calculating vendor travel time:', error);
    throw error;
  }
}

/**
 * Batch calculate travel times for multiple vendors to a single destination
 * @param {Array} vendorIds - Array of vendor IDs
 * @param {Object} destination - Destination coordinates {lat, lng}
 * @param {boolean} useExternalAPI - Whether to use external API for more accurate estimates
 * @returns {Promise<Array>} - Array of travel time information for each vendor
 */
export async function batchCalculateTravelTimes(vendorIds, destination, useExternalAPI = true) {
  try {
    // Get all vendors
    const vendors = await VendorModel.find({
      _id: { $in: vendorIds }
    });
    
    // Calculate travel times for all vendors
    const travelTimes = await Promise.all(
      vendors.map(async (vendor) => {
        try {
          const travelInfo = await calculateVendorTravelTime(
            vendor._id, 
            destination, 
            useExternalAPI
          );
          return {
            vendorId: vendor._id,
            vendorName: vendor.businessName,
            ...travelInfo,
            error: null
          };
        } catch (error) {
          return {
            vendorId: vendor._id,
            vendorName: vendor.businessName,
            error: error.message
          };
        }
      })
    );
    
    return travelTimes;
  } catch (error) {
    console.error('Error batch calculating travel times:', error);
    throw error;
  }
}

/**
 * Precompute ETA matrix for high-demand geographical areas
 * @param {Array} tileCoordinates - Array of tile coordinates [{lat, lng}]
 * @param {Array} vendorIds - Array of vendor IDs
 * @returns {Promise<Object>} - ETA matrix
 */
export async function precomputeETAMatrix(tileCoordinates, vendorIds) {
  try {
    const etaMatrix = {};
    
    // For each tile coordinate, calculate travel times to all vendors
    for (const coord of tileCoordinates) {
      const tileKey = `${coord.lat.toFixed(4)},${coord.lng.toFixed(4)}`;
      etaMatrix[tileKey] = {};
      
      // Batch calculate travel times for this coordinate
      const travelTimes = await batchCalculateTravelTimes(vendorIds, coord, true);
      
      // Store results in matrix
      for (const travelInfo of travelTimes) {
        if (!travelInfo.error) {
          etaMatrix[tileKey][travelInfo.vendorId] = {
            timeInMinutes: travelInfo.timeInMinutes,
            distanceInKm: travelInfo.distanceInKm,
            source: travelInfo.source
          };
        }
      }
    }
    
    return etaMatrix;
  } catch (error) {
    console.error('Error precomputing ETA matrix:', error);
    throw error;
  }
}

export default {
  calculateEnhancedTravelTime,
  calculateVendorTravelTime,
  batchCalculateTravelTimes,
  precomputeETAMatrix
};