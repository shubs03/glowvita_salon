/**
 * Graceful Fallbacks and UX Improvements Module
 * Handles fallback mechanisms and user experience enhancements for the booking flow
 */

/**
 * Generate ETA range message for display to users
 * @param {number|null} eta - Estimated travel time in minutes
 * @param {string} fallbackType - Type of fallback used ('precise', 'range', 'unavailable')
 * @returns {string} - User-friendly ETA message
 */
export function generateEtaMessage(eta, fallbackType = 'precise') {
  if (eta === null || eta === undefined) {
    return "We'll calculate your travel time after selecting a service provider";
  }
  
  switch (fallbackType) {
    case 'precise':
      return `Approximately ${eta} minutes travel time`;
    case 'range':
      const lowerBound = Math.max(5, Math.floor(eta * 0.8));
      const upperBound = Math.ceil(eta * 1.3);
      return `Travel time estimate: ${lowerBound}-${upperBound} minutes`;
    case 'unavailable':
      return "Travel time will be confirmed after booking";
    default:
      return `Approximately ${eta} minutes travel time`;
  }
}

/**
 * Recalculate ETA at key touchpoints and check for significant changes
 * @param {number} previousEta - Previous ETA in minutes
 * @param {number} newEta - New ETA in minutes
 * @param {number} thresholdPercent - Threshold percentage for significant change (default: 20%)
 * @returns {Object} - Change analysis result
 */
export function analyzeEtaChange(previousEta, newEta, thresholdPercent = 20) {
  if (previousEta === null || previousEta === undefined || newEta === null || newEta === undefined) {
    return {
      hasSignificantChange: false,
      percentChange: 0,
      message: ''
    };
  }
  
  const absoluteChange = Math.abs(newEta - previousEta);
  const percentChange = (absoluteChange / previousEta) * 100;
  const hasSignificantChange = percentChange > thresholdPercent;
  
  let message = '';
  if (hasSignificantChange) {
    if (newEta > previousEta) {
      message = `Travel time has increased by ${percentChange.toFixed(0)}%.`;
    } else {
      message = `Travel time has decreased by ${percentChange.toFixed(0)}%.`;
    }
  }
  
  return {
    hasSignificantChange,
    percentChange,
    absoluteChange,
    message
  };
}

/**
 * Suggest alternate staff/vendors if ETA exceeds acceptable limits
 * @param {Array} vendors - List of available vendors
 * @param {Object} customerLocation - Customer location {lat, lng}
 * @param {number} maxAcceptableEta - Maximum acceptable ETA in minutes
 * @param {number} maxSuggestions - Maximum number of suggestions to return
 * @returns {Array} - List of suggested vendors with acceptable ETAs
 */
export async function suggestAlternateVendors(vendors, customerLocation, maxAcceptableEta, maxSuggestions = 3) {
  // Import travel utilities dynamically to avoid circular dependencies
  const { calculateEnhancedTravelTime } = await import('./EnhancedTravelUtils.js');
  
  const vendorEtas = [];
  
  // Calculate ETAs for all vendors
  for (const vendor of vendors) {
    try {
      const travelResult = await calculateEnhancedTravelTime(
        vendor.baseLocation || vendor.location,
        customerLocation,
        vendor
      );
      
      vendorEtas.push({
        vendor,
        eta: travelResult.timeInMinutes,
        distance: travelResult.distanceInKm
      });
    } catch (error) {
      console.warn(`Failed to calculate ETA for vendor ${vendor._id}:`, error.message);
      // Add vendor with high ETA as fallback
      vendorEtas.push({
        vendor,
        eta: 999,
        distance: 0
      });
    }
  }
  
  // Filter vendors with acceptable ETAs and sort by ETA
  const acceptableVendors = vendorEtas
    .filter(item => item.eta <= maxAcceptableEta)
    .sort((a, b) => a.eta - b.eta)
    .slice(0, maxSuggestions)
    .map(item => ({
      ...item.vendor,
      travelTime: item.eta,
      distance: item.distance
    }));
  
  return acceptableVendors;
}

/**
 * Format cancellation/acceptance windows for display
 * @param {Date} deadline - Deadline date
 * @param {string} type - Window type ('cancellation', 'acceptance')
 * @returns {string} - Formatted window message
 */
export function formatWindowMessage(deadline, type = 'acceptance') {
  if (!deadline) return '';
  
  const now = new Date();
  const diffMs = deadline - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return type === 'cancellation' 
      ? `Cancellation deadline: ${diffDays} day${diffDays > 1 ? 's' : ''}` 
      : `Acceptance required within: ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return type === 'cancellation'
      ? `Cancellation deadline: ${diffHours} hour${diffHours > 1 ? 's' : ''}`
      : `Acceptance required within: ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else {
    return type === 'cancellation'
      ? 'Cancellation deadline: Less than 1 hour'
      : 'Acceptance required within: Less than 1 hour';
  }
}

/**
 * Check if a vendor meets ETA requirements
 * @param {Object} vendor - Vendor object
 * @param {Object} customerLocation - Customer location {lat, lng}
 * @param {number} maxEta - Maximum acceptable ETA
 * @returns {Object} - Validation result
 */
export async function validateVendorEta(vendor, customerLocation, maxEta) {
  try {
    // Import travel utilities dynamically to avoid circular dependencies
    const { calculateEnhancedTravelTime } = await import('./EnhancedTravelUtils.js');
    
    const travelResult = await calculateEnhancedTravelTime(
      vendor.baseLocation || vendor.location,
      customerLocation,
      vendor
    );
    
    const isValid = travelResult.timeInMinutes <= maxEta;
    
    return {
      isValid,
      eta: travelResult.timeInMinutes,
      distance: travelResult.distanceInKm,
      source: travelResult.source,
      message: isValid 
        ? `Vendor is within acceptable travel time (${travelResult.timeInMinutes} mins)`
        : `Vendor travel time exceeds limit (${travelResult.timeInMinutes} mins > ${maxEta} mins)`
    };
  } catch (error) {
    console.warn(`Failed to validate ETA for vendor ${vendor._id}:`, error.message);
    return {
      isValid: false,
      eta: null,
      distance: null,
      source: 'error',
      message: 'Unable to calculate travel time for this vendor'
    };
  }
}

/**
 * Generate user-friendly error messages for booking failures
 * @param {Error} error - Error object
 * @returns {string} - User-friendly error message
 */
export function generateUserFriendlyErrorMessage(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';
  
  // Handle specific error types
  if (error.message.includes('quota')) {
    return 'We are experiencing high demand. Please try again in a few minutes.';
  }
  
  if (error.message.includes('location')) {
    return 'There was an issue with the location data. Please verify your address and try again.';
  }
  
  if (error.message.includes('travel radius')) {
    return 'This vendor does not serve your area. Please try another vendor or adjust your location.';
  }
  
  if (error.message.includes('conflict') || error.message.includes('overlap')) {
    return 'The selected time slot is no longer available. Please choose another time.';
  }
  
  if (error.message.includes('lock') || error.message.includes('timeout')) {
    return 'The selected time slot has expired. Please try again.';
  }
  
  // Generic fallback
  return 'We encountered an issue processing your request. Please try again.';
}