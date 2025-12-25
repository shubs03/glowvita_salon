/**
 * Frontend Booking Utilities
 * Provides simplified interfaces for frontend components to interact with booking system
 */

/**
 * Fetch available vendors based on service and location
 * @param {Object} params - Search parameters
 * @returns {Promise<Array>} - Array of available vendors
 */
export async function fetchAvailableVendors(params) {
  const searchParams = new URLSearchParams();
  
  if (params.lat && params.lng) {
    searchParams.append('lat', params.lat);
    searchParams.append('lng', params.lng);
  }
  
  if (params.radius) searchParams.append('radius', params.radius);
  if (params.category) searchParams.append('category', params.category);
  if (params.serviceId) searchParams.append('serviceId', params.serviceId);
  
  const response = await fetch(`/api/booking/vendors?${searchParams.toString()}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch vendors');
  }
  
  return data.vendors;
}

/**
 * Fetch services for a specific vendor
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Array>} - Array of services
 */
export async function fetchVendorServices(vendorId) {
  const response = await fetch(`/api/booking/services?vendorId=${vendorId}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch services');
  }
  
  return data.services;
}

/**
 * Fetch available staff for a vendor
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Array>} - Array of staff members
 */
export async function fetchVendorStaff(vendorId) {
  const response = await fetch(`/api/booking/staff?vendorId=${vendorId}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch staff');
  }
  
  return data.staff;
}

/**
 * Fetch available time slots
 * @param {Object} params - Slot parameters
 * @returns {Promise<Array>} - Array of available slots
 */
export async function fetchAvailableSlots(params) {
  const searchParams = new URLSearchParams();
  
  searchParams.append('vendorId', params.vendorId);
  if (params.staffId) searchParams.append('staffId', params.staffId);
  if (params.serviceIds) searchParams.append('serviceIds', params.serviceIds.join(','));
  if (params.date) searchParams.append('date', params.date);
  if (params.lat && params.lng) {
    searchParams.append('lat', params.lat);
    searchParams.append('lng', params.lng);
  }
  if (params.isHomeService !== undefined) searchParams.append('isHomeService', params.isHomeService);
  if (params.isWeddingService !== undefined) searchParams.append('isWeddingService', params.isWeddingService);
  if (params.packageId) searchParams.append('packageId', params.packageId);
  if (params.bufferBefore) searchParams.append('bufferBefore', params.bufferBefore);
  if (params.bufferAfter) searchParams.append('bufferAfter', params.bufferAfter);
  
  const response = await fetch(`/api/booking/slots?${searchParams.toString()}`);
  const data = await response.json();
  
  return data.slots;
}

/**
 * Generate a quote for services
 * @param {Object} quoteData - Quote parameters
 * @returns {Promise<Object>} - Quote details and slots
 */
export async function generateQuote(quoteData) {
  const response = await fetch('/api/booking/quote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(quoteData),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to generate quote');
  }
  
  return data;
}

/**
 * Lock a time slot
 * @param {Object} lockData - Slot lock parameters
 * @returns {Promise<Object>} - Lock details
 */
export async function lockTimeSlot(lockData) {
  const response = await fetch('/api/booking/lock', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(lockData),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to lock time slot');
  }
  
  return data;
}

/**
 * Confirm a booking
 * @param {Object} confirmationData - Booking confirmation parameters
 * @returns {Promise<Object>} - Confirmed appointment
 */
export async function confirmBooking(confirmationData) {
  const response = await fetch('/api/booking/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(confirmationData),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to confirm booking');
  }
  
  return data;
}

/**
 * Calculate travel time between vendor and customer
 * @param {string} vendorId - Vendor ID
 * @param {Object} customerLocation - Customer location {lat, lng}
 * @returns {Promise<Object>} - Travel time information
 */
export async function getTravelTime(vendorId, customerLocation) {
  try {
    // Direct API call to get travel time
    const response = await fetch('/api/booking/travel-time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendorId,
        customerLocation
      }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to calculate travel time');
    }
    
    return data.travelTimeInfo;
  } catch (error) {
    // Fallback to client-side calculation if API fails
    console.warn('API travel time calculation failed, using fallback:', error.message);
    
    // In a real implementation, this would use a client-side geolocation library
    // For now, we'll return a default value
    return {
      timeInMinutes: 30,
      distanceInKm: 10,
      source: 'client-fallback'
    };
  }
}

export default {
  fetchAvailableVendors,
  fetchVendorServices,
  fetchVendorStaff,
  fetchAvailableSlots,
  generateQuote,
  lockTimeSlot,
  confirmBooking,
  getTravelTime
};