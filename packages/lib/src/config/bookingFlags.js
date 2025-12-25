/**
 * Configuration Flags for Incremental Rollout
 * Allows enabling/disabling advanced booking flow features
 */

// Default configuration flags
const defaultFlags = {
  // Enable/disable the enhanced booking flow
  ENABLE_ENHANCED_BOOKING_FLOW: process.env.ENABLE_ENHANCED_BOOKING_FLOW === 'true' || false,
  
  // Enable/disable home service features
  ENABLE_HOME_SERVICE: process.env.ENABLE_HOME_SERVICE === 'true' || false,
  
  // Enable/disable wedding package features
  ENABLE_WEDDING_PACKAGES: process.env.ENABLE_WEDDING_PACKAGES === 'true' || false,
  
  // Enable/disable travel time integration
  ENABLE_TRAVEL_TIME: process.env.ENABLE_TRAVEL_TIME === 'true' || false,
  
  // Enable/disable optimistic locking
  ENABLE_OPTIMISTIC_LOCKING: process.env.ENABLE_OPTIMISTIC_LOCKING === 'true' || false,
  
  // Enable/disable vendor ranking adjustments
  ENABLE_VENDOR_RANKING: process.env.ENABLE_VENDOR_RANKING === 'true' || false,
  
  // Enable/disable ETA matrix caching
  ENABLE_ETA_CACHING: process.env.ENABLE_ETA_CACHING === 'true' || false,
  
  // Enable/disable graceful fallbacks
  ENABLE_GRACEFUL_FALLBACKS: process.env.ENABLE_GRACEFUL_FALLBACKS === 'true' || false,
  
  // Percentage of users to roll out to (0-100)
  ROLLOUT_PERCENTAGE: parseInt(process.env.ROLLOUT_PERCENTAGE) || 0,
  
  // Specific user IDs to enable features for (for testing)
  ENABLED_USER_IDS: process.env.ENABLED_USER_IDS ? process.env.ENABLED_USER_IDS.split(',') : [],
  
  // Enable/disable background jobs
  ENABLE_BACKGROUND_JOBS: process.env.ENABLE_BACKGROUND_JOBS === 'true' || false,
  
  // Travel time settings
  TRAVEL_TIME_CACHE_TTL: parseInt(process.env.TRAVEL_TIME_CACHE_TTL) || 300000, // 5 minutes in ms
  MAX_TRAVEL_RADIUS: parseInt(process.env.MAX_TRAVEL_RADIUS) || 50, // km
  DEFAULT_TRAVEL_SPEED: parseInt(process.env.DEFAULT_TRAVEL_SPEED) || 30, // km/h
  
  // Lock settings
  SLOT_LOCK_TTL: parseInt(process.env.SLOT_LOCK_TTL) || 900000, // 15 minutes in ms
  LOCK_RETRY_ATTEMPTS: parseInt(process.env.LOCK_RETRY_ATTEMPTS) || 3,
  LOCK_RETRY_DELAY: parseInt(process.env.LOCK_RETRY_DELAY) || 1000, // 1 second in ms
  
  // Wedding package settings
  WEDDING_TEAM_ACCEPTANCE_WINDOW: parseInt(process.env.WEDDING_TEAM_ACCEPTANCE_WINDOW) || 86400000, // 24 hours in ms
  WEDDING_DEPOSIT_REQUIRED: process.env.WEDDING_DEPOSIT_REQUIRED === 'true' || true,
  
  // Vendor ranking settings
  VENDOR_RANKING_WEIGHTS: {
    availability: parseFloat(process.env.VENDOR_RANKING_AVAILABILITY_WEIGHT) || 0.3,
    proximity: parseFloat(process.env.VENDOR_RANKING_PROXIMITY_WEIGHT) || 0.25,
    rating: parseFloat(process.env.VENDOR_RANKING_RATING_WEIGHT) || 0.2,
    history: parseFloat(process.env.VENDOR_RANKING_HISTORY_WEIGHT) || 0.15,
    load: parseFloat(process.env.VENDOR_RANKING_LOAD_WEIGHT) || 0.1
  },
  
  // ETA caching settings
  ETA_CACHE_TTL: parseInt(process.env.ETA_CACHE_TTL) || 300000, // 5 minutes in ms
  ETA_TILE_SIZE: parseFloat(process.env.ETA_TILE_SIZE) || 0.01, // Approx 1km tiles
  HOTSPOT_BOOKING_THRESHOLD: parseInt(process.env.HOTSPOT_BOOKING_THRESHOLD) || 10
};

/**
 * Check if a feature is enabled for a user
 * @param {string} flagName - Name of the flag to check
 * @param {string} userId - User ID to check (optional)
 * @returns {boolean} - Whether the feature is enabled
 */
export function isFeatureEnabled(flagName, userId = null) {
  // If the flag doesn't exist, return false
  if (!(flagName in defaultFlags)) {
    return false;
  }
  
  // If it's a simple boolean flag, return its value
  if (typeof defaultFlags[flagName] === 'boolean') {
    return defaultFlags[flagName];
  }
  
  // For rollout percentage, check if user should have access
  if (flagName === 'ROLLOUT_PERCENTAGE' && userId) {
    // Simple hash-based percentage allocation
    const hash = simpleHash(userId);
    const userPercentage = hash % 100;
    return userPercentage < defaultFlags[flagName];
  }
  
  // For enabled user IDs, check if user is in the list
  if (flagName === 'ENABLED_USER_IDS' && userId) {
    return defaultFlags[flagName].includes(userId);
  }
  
  // For other non-boolean values, return true (they're configuration values)
  return true;
}

/**
 * Get a configuration value
 * @param {string} key - Configuration key
 * @param {*} defaultValue - Default value if key not found
 * @returns {*} - Configuration value
 */
export function getConfig(key, defaultValue = null) {
  return defaultFlags[key] !== undefined ? defaultFlags[key] : defaultValue;
}

/**
 * Simple hash function for user ID distribution
 * @param {string} str - String to hash
 * @returns {number} - Hash value
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Export all flags
export default defaultFlags;