# Scheduling Module

## Overview

The Scheduling Module is the core component of the Glowvita Booking System, responsible for managing all aspects of appointment scheduling including vendor discovery, service selection, staff allocation, slot generation, and booking confirmation.

## Key Components

### FreshaLikeSlotEngine.js
Implements the slot generation algorithm with comprehensive validation similar to Fresha's system:
- Validates staff working hours
- Checks for breaks and blocked periods
- Ensures no conflicts with existing appointments
- Calculates combined durations of selected services
- Integrates travel time buffers for home services
- Outputs only valid time slots

### OptimisticLocking.js
Manages concurrent booking requests through optimistic locking:
- Acquires locks on time slots
- Creates temporary appointments
- Confirms bookings with payment processing
- Handles lock expiration and cleanup

### EnhancedTravelUtils.js
Calculates travel times for home service bookings:
- Uses Google Maps API as primary source
- Falls back to Haversine formula when API is unavailable
- Provides accurate distance and time estimates
- Integrates with slot generation for buffer calculations

### WeddingPackageSlotEngine.js
Handles wedding package slot generation with team coordination:
- Generates slots for wedding packages with multiple services
- Coordinates team formation with multiple staff members
- Validates team availability across all required services
- Supports customizable acceptance windows

### Frontend Utilities
Provides simplified interfaces for frontend integration:
- `BookingUtils.js` - Utility functions for API interactions
- `useBooking.js` - React hook for state management
- `BookingExample.jsx` - Example component implementation

## API Integration

The scheduling module integrates with the following APIs:
- `/api/booking/*` - Unified booking endpoints
- Google Maps Distance Matrix API - Travel time calculations
- Internal vendor, service, and staff APIs - Data retrieval
- Redis caching layer - Performance optimization

## Caching

The module leverages the centralized caching system:
- Vendor availability data
- Staff schedules
- Service durations
- Generated slot results
- Travel time calculations

## Error Handling

Comprehensive error handling with:
- Custom error classes for different error types
- Graceful degradation when external services fail
- User-friendly error messages
- Detailed logging for debugging

## Testing

The module includes extensive test coverage:
- Unit tests for individual functions
- Integration tests for API endpoints
- End-to-end tests for complete booking flows
- Performance tests for high-load scenarios

## Performance Optimization

- Database query optimization with proper indexing
- Multi-layer caching strategy
- Batch processing where possible
- Efficient algorithms for slot generation