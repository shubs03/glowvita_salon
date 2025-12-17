import NodeCache from 'node-cache';
import Redis from 'redis';

/**
 * Unified Cache Manager
 * Handles multiple caching layers with Redis as primary and NodeCache as fallback
 */

class CacheManager {
  constructor() {
    // Initialize in-memory cache as fallback
    this.memoryCache = new NodeCache({ stdTTL: 300, checkperiod: 600 }); // 5 min default TTL
    
    // Initialize Redis client if available
    this.redisClient = null;
    this.redisConnected = false;
    
    // Cache configuration
    this.defaultTTL = 300; // 5 minutes
    this.useRedis = !!process.env.REDIS_URL;
    
    // Connect to Redis if configured
    if (this.useRedis) {
      this.initializeRedis();
    }
  }
  
  /**
   * Initialize Redis connection
   */
  async initializeRedis() {
    try {
      this.redisClient = Redis.createClient({
        url: process.env.REDIS_URL
      });
      
      this.redisClient.on('error', (err) => {
        console.warn('Redis connection error:', err);
        this.redisConnected = false;
      });
      
      this.redisClient.on('connect', () => {
        console.log('Redis connected successfully');
        this.redisConnected = true;
      });
      
      await this.redisClient.connect();
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.redisConnected = false;
    }
  }
  
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Cached value or null
   */
  async get(key) {
    // Try Redis first if connected
    if (this.useRedis && this.redisConnected && this.redisClient) {
      try {
        const value = await this.redisClient.get(key);
        if (value !== null) {
          return JSON.parse(value);
        }
      } catch (error) {
        console.warn('Redis GET error:', error);
      }
    }
    
    // Fallback to memory cache
    return this.memoryCache.get(key);
  }
  
  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, ttl = this.defaultTTL) {
    const serializedValue = JSON.stringify(value);
    
    // Try Redis first if connected
    if (this.useRedis && this.redisConnected && this.redisClient) {
      try {
        await this.redisClient.setEx(key, ttl, serializedValue);
        return true;
      } catch (error) {
        console.warn('Redis SET error:', error);
      }
    }
    
    // Fallback to memory cache
    return this.memoryCache.set(key, value, ttl);
  }
  
  /**
   * Delete key from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Success status
   */
  async del(key) {
    let success = false;
    
    // Try Redis first if connected
    if (this.useRedis && this.redisConnected && this.redisClient) {
      try {
        await this.redisClient.del(key);
        success = true;
      } catch (error) {
        console.warn('Redis DEL error:', error);
      }
    }
    
    // Also delete from memory cache
    const memorySuccess = this.memoryCache.del(key);
    
    return success || memorySuccess;
  }
  
  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Existence status
   */
  async has(key) {
    // Check Redis first if connected
    if (this.useRedis && this.redisConnected && this.redisClient) {
      try {
        const exists = await this.redisClient.exists(key);
        if (exists) return true;
      } catch (error) {
        console.warn('Redis EXISTS error:', error);
      }
    }
    
    // Check memory cache
    return this.memoryCache.has(key);
  }
  
  /**
   * Clear all cache entries
   * @returns {Promise<void>}
   */
  async flushAll() {
    // Flush Redis if connected
    if (this.useRedis && this.redisConnected && this.redisClient) {
      try {
        await this.redisClient.flushAll();
      } catch (error) {
        console.warn('Redis FLUSHALL error:', error);
      }
    }
    
    // Flush memory cache
    this.memoryCache.flushAll();
  }
  
  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getStats() {
    const stats = {
      memory: this.memoryCache.getStats()
    };
    
    if (this.useRedis && this.redisConnected) {
      stats.redis = {
        connected: true
      };
    } else {
      stats.redis = {
        connected: false,
        reason: this.useRedis ? 'Connection failed' : 'Not configured'
      };
    }
    
    return stats;
  }
  
  /**
   * Create a composite key for complex cache entries
   * @param {string} prefix - Key prefix
   * @param {Array} identifiers - Array of identifiers to include in key
   * @returns {string} - Composite cache key
   */
  createKey(prefix, identifiers = []) {
    if (identifiers.length === 0) {
      return prefix;
    }
    
    const sanitizedIdentifiers = identifiers.map(id => {
      if (typeof id === 'object') {
        return JSON.stringify(id);
      }
      return String(id);
    });
    
    return `${prefix}:${sanitizedIdentifiers.join(':')}`;
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Export both the class and instance
export { CacheManager };
export default cacheManager;