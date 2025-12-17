/**
 * Travel Utility Functions
 * Basic utilities for distance and time calculations
 */

/**
 * Calculate distance between two points using Haversine formula
 * @param {Object} origin - Origin coordinates {lat, lng}
 * @param {Object} destination - Destination coordinates {lat, lng}
 * @returns {number} - Distance in kilometers
 */
export function calculateHaversineDistance(origin, destination) {
  const R = 6371; // Earth's radius in km
  const dLat = (destination.lat - origin.lat) * Math.PI / 180;
  const dLon = (destination.lng - origin.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  
  return d;
}

/**
 * Calculate travel time based on Haversine distance and average speed
 * @param {Object} origin - Origin coordinates {lat, lng}
 * @param {Object} destination - Destination coordinates {lat, lng}
 * @param {number} speedKmph - Average speed in km/h (default: 30)
 * @returns {number} - Time in minutes
 */
export function calculateHaversineTime(origin, destination, speedKmph = 30) {
  const distance = calculateHaversineDistance(origin, destination);
  // Time = Distance / Speed
  const timeInHours = distance / speedKmph;
  // Convert to minutes and add buffer (traffic/signals)
  return Math.ceil(timeInHours * 60 * 1.2); // Adding 20% buffer
}

export default {
  calculateHaversineDistance,
  calculateHaversineTime
};
