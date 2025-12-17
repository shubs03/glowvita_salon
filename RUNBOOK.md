# Booking System Runbook

This document provides operational guidance for the enhanced booking system, covering lock expiry handling, fallback paths when the external distance API is down, and steps to tune fairness and ranking weights.

## Table of Contents
1. [Lock Expiry Handling](#lock-expiry-handling)
2. [External Distance API Fallback Path](#external-distance-api-fallback-path)
3. [Tuning Fairness and Ranking Weights](#tuning-fairness-and-ranking-weights)
4. [Background Jobs Monitoring](#background-jobs-monitoring)
5. [Troubleshooting Common Issues](#troubleshooting-common-issues)

## Lock Expiry Handling

### How Slot Locking Works
The optimistic slot locking mechanism uses atomic distributed locks with TTL (Time To Live) to prevent double-bookings:

1. When a user selects a slot, the system creates a temporary locked appointment record
2. A lock key is generated with a configurable TTL (default: 30 minutes)
3. The user proceeds to payment with the lock in place
4. If payment succeeds, the appointment becomes confirmed and the lock is released
5. If the TTL expires, the lock is automatically released and the temporary appointment is cancelled

### Lock Expiry Process
1. **Automatic Cleanup**: Expired locks are cleaned up by background reconcilers that run every 5 minutes
2. **Race Condition Reconciliation**: The system detects and resolves race conditions where multiple users attempt to book the same slot
3. **User Notification**: Users attempting to use expired locks receive appropriate error messages
### Configuration Settings
- `SLOT_LOCK_TTL`: Lock expiration time in milliseconds (default: 1800000ms / 30 minutes)
- `LOCK_RETRY_ATTEMPTS`: Number of retry attempts for lock acquisition (default: 3)
- `LOCK_RETRY_DELAY`: Delay between retry attempts in milliseconds (default: 1000ms / 1 second)

### Monitoring Lock Expiry
Monitor these metrics to track lock expiry issues:
- `locks_acquired`: Total number of locks successfully acquired
- `locks_expired`: Total number of locks that expired before confirmation
- `locks_confirmed`: Total number of locks that were successfully confirmed
- `lock_conflicts`: Total number of conflicts detected during lock acquisition

## External Distance API Fallback Path

### Fallback Mechanism Overview
When the external distance API (Google Maps) is unavailable or quota is exhausted, the system gracefully falls back to alternative methods:

1. **Primary Method**: Google Maps Distance Matrix API (when available and within quota)
2. **Secondary Method**: Haversine formula for straight-line distance calculation
3. **Conservative Estimation**: Travel time estimates include buffer for traffic and road conditions

### Implementation Details
The fallback mechanism is implemented in [EnhancedTravelUtils.js](packages/lib/src/modules/scheduling/EnhancedTravelUtils.js):

1. The system first attempts to call the external API
2. If the external API fails or quota is exhausted, it automatically falls back to Haversine calculation
3. All results are cached with a TTL to reduce API calls
4. Conservative estimates are used to ensure realistic expectations

### Fallback Scenarios
1. **API Quota Exhaustion**: System logs warning and switches to Haversine calculation
2. **Network Issues**: System retries with exponential backoff, then falls back
3. **API Errors**: System catches exceptions and uses fallback method
4. **Configuration Issues**: If API key is missing, system defaults to Haversine

### Monitoring Fallback Usage
Monitor these metrics to track fallback usage:
- `external_api_calls`: Total number of external API calls made
- `external_api_failures`: Total number of external API failures
- `haversine_calculations`: Total number of Haversine calculations performed
- `cache_hits`: Total number of cache hits
- `cache_misses`: Total number of cache misses

## Tuning Fairness and Ranking Weights

### Vendor Ranking Algorithm
The vendor ranking system blends multiple factors to determine the best vendor for each appointment:

1. **Availability Score** (30% default weight): Based on vendor's free time windows
2. **Proximity Score** (25% default weight): Based on distance from customer location
3. **Rating Score** (20% default weight): Based on vendor ratings and reviews
4. **History Score** (15% default weight): Based on acceptance/on-time history
5. **Load Score** (10% default weight): Based on current staff load
6. **Fairness Boost**: Dynamic adjustment based on vendor monthly targets vs completions

### Weight Configuration
Weights can be adjusted through environment variables:
- `VENDOR_RANKING_AVAILABILITY_WEIGHT`: Availability factor weight (default: 0.3)
- `VENDOR_RANKING_PROXIMITY_WEIGHT`: Proximity factor weight (default: 0.25)
- `VENDOR_RANKING_RATING_WEIGHT`: Rating factor weight (default: 0.2)
- `VENDOR_RANKING_HISTORY_WEIGHT`: History factor weight (default: 0.15)
- `VENDOR_RANKING_LOAD_WEIGHT`: Load factor weight (default: 0.1)

### Tuning Process
1. **Monitor Performance Metrics**: Track booking success rates, customer satisfaction, and vendor utilization
2. **Analyze Data**: Review vendor selection patterns and customer feedback
3. **Adjust Weights**: Modify environment variables to change factor importance
4. **Test Changes**: Deploy changes to a small percentage of users first
5. **Measure Impact**: Compare metrics before and after changes
6. **Iterate**: Continue adjusting weights based on results

### Fairness Boost Tuning
The fairness boost helps balance opportunities among vendors:
1. Vendors behind their monthly targets receive a boost
2. The boost is calculated as: `(monthlyTarget - monthlyCompleted) / monthlyTarget * 100`
3. Vendors who meet or exceed targets receive no boost

### Monitoring Ranking Effectiveness
Monitor these metrics to track ranking effectiveness:
- `vendor_selections`: Total number of vendor selections made
- `fairness_boost_applied`: Number of times fairness boost was applied
- `customer_satisfaction`: Average customer satisfaction scores
- `vendor_utilization`: Average vendor utilization rates

## Background Jobs Monitoring

### Job Types and Schedules
1. **Fairness Boosts Recomputation**: Runs at the beginning of each month at 2:00 AM
2. **ETA Cache Precomputation**: Runs every 6 hours
3. **Overlapping Bookings Scan**: Runs daily at 3:00 AM
4. **Wedding Team Reminders**: Runs hourly

### Monitoring Background Jobs
Monitor these metrics for background job health:
- `job_started`: Number of jobs started
- `job_completed`: Number of jobs completed successfully
- `job_failed`: Number of jobs that failed
- `vendors_updated`: Number of vendors updated in fairness computation
- `hotspots_identified`: Number of hotspots identified for ETA caching
- `matrices_precomputed`: Number of ETA matrices precomputed
- `overlapping_bookings_found`: Number of overlapping bookings detected
- `wedding_appointments_for_reminders`: Number of wedding appointments requiring reminders
- `wedding_team_reminders_sent`: Number of wedding team reminders sent

## Troubleshooting Common Issues

### Slot Locking Issues
**Symptom**: Users unable to book slots due to lock conflicts
**Resolution**:
1. Check if [OptimisticLocking.js](packages/lib/src/modules/scheduling/OptimisticLocking.js) is functioning correctly
2. Verify lock TTL settings are appropriate for your use case
3. Monitor lock metrics to identify patterns
4. Consider increasing retry attempts or delay for high-conflict periods

### Travel Time Calculation Issues
**Symptom**: Inaccurate travel time estimates
**Resolution**:
1. Verify external API key is correctly configured
2. Check quota usage for external APIs
3. Review fallback mechanism in [EnhancedTravelUtils.js](packages/lib/src/modules/scheduling/EnhancedTravelUtils.js)
4. Adjust conservative estimation factors as needed

### Vendor Ranking Issues
**Symptom**: Poor vendor selection quality
**Resolution**:
1. Review vendor ranking weights in configuration
2. Analyze vendor selection metrics
3. Adjust weights based on performance data
4. Check fairness boost calculations

### ETA Caching Issues
**Symptom**: Slow performance for location-based queries
**Resolution**:
1. Verify ETA caching is enabled in configuration
2. Check hotspot identification logic
3. Monitor cache hit/miss ratios
4. Adjust tile size and hotspot thresholds as needed

### Wedding Package Issues
**Symptom**: Problems with wedding package team formation
**Resolution**:
1. Check team formation logic in [FreshaLikeSlotEngine.js](packages/lib/src/modules/scheduling/FreshaLikeSlotEngine.js)
2. Verify acceptance window settings
3. Monitor team acceptance rates
4. Review deposit requirements configuration

---
*Last Updated: December 2025*
*Version: 1.0*