# Caching Module

## Overview

The Caching Module provides a dual-layer caching solution for the Glowvita Booking System, using Redis as the primary cache with an in-memory fallback for maximum reliability and performance.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐
│   Redis Cache   │◄──►│  Cache Manager   │
└─────────────────┘    └──────────────────┘
                              │
┌─────────────────┐           │
│ Memory Cache    │◄──────────┘
└─────────────────┘
```

## Key Features

### Dual-Layer Caching
- **Primary Layer**: Redis for distributed, persistent caching
- **Fallback Layer**: In-memory cache using NodeCache for when Redis is unavailable
- **Automatic Failover**: Seamless switching between layers

### Cache Management
- **TTL Control**: Configurable expiration times for different data types
- **Composite Keys**: Support for complex cache key generation
- **Statistics**: Cache hit/miss tracking for performance monitoring
- **Flushing**: Manual and automatic cache clearing

## Implementation Details

### CacheManager.js
The central coordinator that manages both Redis and memory caches:

```javascript
const cache = new CacheManager();

// Store data
await cache.set('key', data, 300); // 5 minute TTL

// Retrieve data
const data = await cache.get('key');

// Delete data
await cache.del('key');
```

### BookingCache.js
Specialized caching for booking-related data:

```javascript
const bookingCache = new BookingCache();

// Cache vendor data
await bookingCache.cacheVendors(location, vendors);

// Get cached vendors
const vendors = await bookingCache.getCachedVendors(location);

// Cache slot data
await bookingCache.cacheSlots(slotKey, slots);
```

## Caching Strategy

### Data Categories and TTL

| Data Type | TTL | Reasoning |
|-----------|-----|-----------|
| Vendor Data | 5 minutes | Changes infrequently, high read volume |
| Service Data | 10 minutes | Moderate change frequency |
| Staff Data | 10 minutes | Schedule updates daily |
| Slot Data | 3 minutes | High volatility, frequent updates |
| Wedding Packages | 10 minutes | Infrequent changes |
| Travel Times | 1 hour | Rarely changes for same locations |

### Cache Key Structure

- **Vendors**: `vendors_{lat}_{lng}_{radius}_{limit}`
- **Services**: `services_vendor_{vendorId}`
- **Staff**: `staff_vendor_{vendorId}`
- **Slots**: `slots_{vendorId}_{staffId}_{serviceIds}_{date}_{type}_{packageId}`
- **Wedding Packages**: `wedding_packages_{vendorId}_{packageId}_{activeStatus}`
- **Travel Times**: `travel_{vendorId}_{lat}_{lng}`

## Performance Benefits

### Reduced Database Load
- Up to 80% reduction in database queries for cached data
- Improved response times for frequently accessed information
- Better scalability under high load

### Bandwidth Optimization
- Reduced external API calls (Google Maps, etc.)
- Lower network overhead
- Faster data retrieval

## Configuration

The caching module is configured through environment variables:

```env
# Redis configuration
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true

# Default TTL settings (in seconds)
CACHE_TTL_DEFAULT=300
CACHE_TTL_SLOTS=180
CACHE_TTL_VENDORS=300
CACHE_TTL_SERVICES=600
```

## Monitoring and Metrics

### Cache Statistics
- Hit rate tracking
- Miss rate tracking
- Memory usage monitoring
- Expiration tracking

### Performance Metrics
- Average response time improvement
- Database query reduction
- External API call reduction

## Best Practices

### Cache Invalidation
- Invalidate on data updates
- Use appropriate TTL for different data types
- Implement cache warming for critical data

### Memory Management
- Monitor cache size to prevent memory exhaustion
- Use appropriate eviction policies
- Regular cache cleanup

### Error Handling
- Graceful degradation when cache is unavailable
- Fallback to direct data sources
- Detailed error logging

## Troubleshooting

### Common Issues

1. **Cache Misses**: Check TTL settings and data volatility
2. **Memory Pressure**: Monitor cache size and adjust accordingly
3. **Redis Connection Issues**: Verify Redis availability and configuration
4. **Performance Degradation**: Review cache hit rates and key effectiveness

### Diagnostic Commands

```bash
# Check Redis connectivity
redis-cli ping

# Monitor cache statistics
npm run cache:stats

# Clear cache
npm run cache:flush
```

## Future Enhancements

1. **Cache Warming**: Pre-populate cache with frequently accessed data
2. **Advanced Eviction Policies**: LRU, LFU implementations
3. **Distributed Cache Clustering**: For horizontal scaling
4. **Cache Analytics Dashboard**: Visual monitoring of cache performance