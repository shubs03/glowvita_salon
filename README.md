# Glowvita Salon Booking System - Enhanced Scheduling & Pricing

This document describes the enhancements made to the Glowvita Salon booking system to support multiple vendor types, realistic scheduling, pricing, and travel logic for both wedding and home services.

## Table of Contents
1. [Overview](#overview)
2. [Enhanced Data Models](#enhanced-data-models)
3. [Vendor Types & Behavior](#vendor-types--behavior)
4. [Scheduling Engine](#scheduling-engine)
5. [Pricing Engine](#pricing-engine)
6. [API Endpoints](#api-endpoints)
7. [Frontend Integration](#frontend-integration)
8. [Testing](#testing)
9. [Performance Optimizations](#performance-optimizations)
10. [Design Choices & Trade-offs](#design-choices--trade-offs)

## Overview

The enhanced booking system now supports:
- Multiple vendor types with different service capabilities
- Realistic scheduling with travel time calculations
- Advanced pricing with location surcharges and surge pricing
- Multi-vendor wedding packages
- Home service and onsite service handling
- Conflict detection and buffer time management

## Enhanced Data Models

### Vendor Model
Enhanced to support different vendor types and travel information:

```javascript
{
  vendorType: {
    type: String,
    enum: ["shop-only", "home-only", "onsite-only", "hybrid", "vendor-home-travel"],
    default: "shop-only"
  },
  travelRadius: { type: Number, default: 0 }, // in kilometers
  travelSpeed: { type: Number, default: 30 }, // in km/h
  baseLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }
}
```

### Vendor Services Model
Added prep time and setup/cleanup time:

```javascript
{
  prepTime: { type: Number, default: 0 }, // in minutes
  setupCleanupTime: { type: Number, default: 0 } // in minutes
}
```

### Appointment Model
Enhanced with travel and scheduling information:

```javascript
{
  travelTime: { type: Number, default: 0 }, // in minutes
  travelDistance: { type: Number, default: 0 }, // in kilometers
  blockingWindows: [{
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    reason: { type: String, default: 'Travel time' }
  }],
  bufferBefore: { type: Number, default: 0 }, // in minutes
  bufferAfter: { type: Number, default: 0 } // in minutes
}
```

### Wedding Package Model
Enhanced for multi-vendor support:

```javascript
{
  services: [{
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: false
    },
    prepTime: { type: Number, default: 0 }, // in minutes
    setupCleanupTime: { type: Number, default: 0 } // in minutes
  }]
}
```

## Vendor Types & Behavior

### Shop-only
- Customers must visit vendor shop
- No travel time or distance calculations
- Services performed at vendor location

### Home-only (vendor-home)
- Vendor performs service from vendor's home
- Customer visits vendor location
- Travel time calculated from vendor home to customer

### Onsite-only (travel-to-customer)
- Vendor has no shop; vendor travels to customer's location
- All services are home visits
- Travel time calculated from vendor base location to customer

### Hybrid (shop + travel)
- Vendor has a shop but can also travel to customer
- Supports both shop visits and home services
- Travel time calculated when needed

### Vendor-home + travel
- Vendor operates from home but also travels to customers
- Similar to home-only but with explicit travel capability
- Travel time calculated for customer visits

## Scheduling Engine

The scheduling engine (`packages/lib/src/modules/scheduling/FreshaLikeSlotEngine.js`) provides:

### Key Features
- Slot availability checking with buffer times
- Travel time integration using Haversine formula
- Conflict detection for overlapping appointments
- Blocking window management for travel time
- Tentative booking creation and confirmation

### Travel Time Calculation
- Uses Haversine formula for distance calculation
- Configurable travel speed per vendor
- Travel radius validation
- Automatic blocking window creation for travel time

### Multi-Service Support
- Wedding packages with multiple services
- Dependency ordering for service sequences
- Multi-vendor package scheduling

## Pricing Engine

The pricing engine (`packages/lib/src/modules/pricing/PricingEngine.js`) provides:

### Price Components
- Base service price
- Location surcharge based on distance
- Travel fee calculation
- Surge pricing for peak times and wedding services
- Tax calculation

### Pricing Strategies
- Distance-based location surcharges
- Travel fee structures
- Time-based surge multipliers
- Promo code support

## API Endpoints

### Search Available Vendors
```
GET /api/scheduling/vendors
Query Parameters:
- serviceId (required)
- date (required)
- time (required)
- duration (optional, default: 60)
- lat (optional)
- lng (optional)
- radius (optional, default: 20)
```

### Calculate Price Estimate
```
POST /api/scheduling/price
Body:
{
  "vendorId": "string",
  "serviceId": "string",
  "lat": number,
  "lng": number,
  "isWeddingService": boolean,
  "date": "ISO date string"
}
```

### Booking Management
```
POST /api/scheduling/bookings - Create tentative booking
PUT /api/scheduling/bookings - Confirm booking
DELETE /api/scheduling/bookings - Cancel booking
```

## Frontend Integration

### RTK Query Hooks
New hooks available in `@repo/store/api`:
- `useSearchAvailableVendorsQuery`
- `useCalculatePriceEstimateMutation`
- `useCreateTentativeBookingMutation`
- `useConfirmBookingMutation`
- `useCancelBookingMutation`

### Booking Flow Updates
The existing booking flow components have been enhanced to:
- Handle different vendor types
- Display travel time information
- Show price breakdowns
- Support multi-vendor wedding packages

## Testing

### Unit Tests
- Scheduling engine conflict detection
- Travel time calculation accuracy
- Pricing engine calculations
- Vendor type behavior validation

### Integration Tests
- End-to-end booking flow
- Multi-vendor wedding package scheduling
- Travel time integration
- Price calculation verification

### Performance Tests
- Vendor search response times
- Scheduling algorithm efficiency
- Database query optimization

## Performance Optimizations

### Database Indexing
- Vendor location indexing for radius queries
- Appointment time indexing for conflict detection
- Service-vendor relationship indexing

### Caching Strategy
- Distance calculation caching
- Vendor availability caching
- Price calculation caching

### Query Optimization
- Efficient time slot generation
- Batch vendor filtering
- Parallel processing where possible

## Design Choices & Trade-offs

### Haversine vs External APIs
**Choice**: Haversine formula for distance calculation
**Reasons**:
- No external dependencies
- Fast calculation
- Sufficient accuracy for most use cases
**Trade-offs**:
- Less accurate than routing APIs
- No traffic or road consideration

### In-Memory vs Database Scheduling
**Choice**: Database-based conflict detection
**Reasons**:
- Data consistency
- Scalability
- Persistence
**Trade-offs**:
- Slightly slower than in-memory
- Database load during peak times

### Real-time vs Batch Processing
**Choice**: Real-time scheduling calculations
**Reasons**:
- Immediate feedback to users
- Accurate availability information
**Trade-offs**:
- Higher computational load
- Potential latency during complex calculations

### Monolithic vs Microservices
**Choice**: Enhanced monolithic architecture
**Reasons**:
- Simpler deployment
- Shared codebase benefits
- Easier debugging
**Trade-offs**:
- Less scalability than microservices
- Tighter coupling between components

## Environment Variables

Create a `.env.local` file in the `apps/web` directory with the following variables:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Google Maps API Key Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Add the API key to your `.env.local` file

## Sample Usage

### Creating a Home Service Booking
```javascript
// Calculate price with travel
const priceData = {
  vendorId: "vendor123",
  serviceId: "service456",
  lat: 12.9716,
  lng: 77.5946,
  isWeddingService: false
};

const { data: priceResult } = await calculatePriceEstimate(priceData);

// Create tentative booking
const bookingData = {
  vendorId: "vendor123",
  serviceId: "service456",
  serviceName: "Haircut",
  date: "2023-12-15",
  startTime: "10:00AM",
  endTime: "11:00AM",
  duration: 60,
  amount: priceResult.price,
  clientId: "client789",
  clientName: "John Doe",
  isHomeService: true,
  lat: 12.9716,
  lng: 77.5946
};

const { data: bookingResult } = await createTentativeBooking(bookingData);
```

### Wedding Package Booking
```javascript
// Search vendors for each service in package
const vendors = await searchAvailableVendors({
  serviceId: "service123",
  date: "2023-12-20",
  time: "10:00AM",
  duration: 120,
  lat: 12.9716,
  lng: 77.5946
});
```

## Future Enhancements

1. **Distance Matrix API Integration**: For more accurate travel time calculations
2. **Machine Learning**: For demand forecasting and dynamic pricing
3. **Real-time Availability**: WebSocket-based real-time updates
4. **Advanced Scheduling**: Genetic algorithms for complex multi-vendor scheduling
5. **Mobile Optimization**: Progressive web app enhancements