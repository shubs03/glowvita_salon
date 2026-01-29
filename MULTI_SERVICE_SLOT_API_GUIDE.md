# Multi-Service Slot API - Implementation Guide

## Overview
This API centralizes complex multi-service scheduling logic on the backend, ensuring accuracy and consistency across web and mobile platforms.

## Endpoint
```
POST /api/booking/slots/multi
```

## Features
- ✅ Handles same staff with multiple services
- ✅ Handles different staff with different services
- ✅ Sequential service scheduling with precise handoff times
- ✅ Home service with travel time calculation
- ✅ Validates all staff availability, working hours, and blocked times
- ✅ Checks existing appointment conflicts
- ✅ Optimized for high traffic (millions of users)

---

## Request Format

### Basic Multi-Service (Salon)
```json
{
  "vendorId": "salon_123",
  "date": "2026-01-25T00:00:00.000Z",
  "assignments": [
    {
      "serviceId": "haircut_service_id",
      "staffId": "stylist_a_id"
    },
    {
      "serviceId": "manicure_service_id",
      "staffId": "nail_tech_b_id"
    }
  ],
  "isHomeService": false,
  "stepMinutes": 15,
  "bufferBefore": 5,
  "bufferAfter": 5
}
```

### Multi-Service with Home Service
```json
{
  "vendorId": "salon_123",
  "date": "2026-01-25T00:00:00.000Z",
  "assignments": [
    {
      "serviceId": "haircut_service_id",
      "staffId": "stylist_a_id"
    },
    {
      "serviceId": "makeup_service_id",
      "staffId": "makeup_artist_c_id"
    }
  ],
  "isHomeService": true,
  "location": {
    "lat": 12.9716,
    "lng": 77.5946,
    "address": "123 Main St, Bangalore"
  },
  "stepMinutes": 15,
  "bufferBefore": 10,
  "bufferAfter": 10
}
```

### Same Staff Multiple Services
```json
{
  "vendorId": "salon_123",
  "date": "2026-01-25T00:00:00.000Z",
  "assignments": [
    {
      "serviceId": "haircut_service_id",
      "staffId": "stylist_a_id"
    },
    {
      "serviceId": "hair_coloring_service_id",
      "staffId": "stylist_a_id"
    }
  ],
  "isHomeService": false
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "slots": [
    {
      "startTime": "10:00",
      "endTime": "12:00",
      "totalDuration": 120,
      "serviceDuration": 90,
      "travelTime": 30,
      "isHomeService": true,
      "sequence": [
        {
          "serviceId": "haircut_service_id",
          "serviceName": "Haircut",
          "staffId": "stylist_a_id",
          "staffName": "John Doe",
          "startTime": "10:15",
          "endTime": "11:00",
          "duration": 45
        },
        {
          "serviceId": "makeup_service_id",
          "serviceName": "Bridal Makeup",
          "staffId": "makeup_artist_c_id",
          "staffName": "Jane Smith",
          "startTime": "11:00",
          "endTime": "11:45",
          "duration": 45
        }
      ],
      "travelInfo": {
        "timeInMinutes": 15,
        "distanceInKm": 8.5,
        "source": "external-api"
      }
    },
    {
      "startTime": "10:30",
      "endTime": "12:30",
      "totalDuration": 120,
      "sequence": [...]
    }
  ],
  "count": 15,
  "metadata": {
    "date": "2026-01-25T00:00:00.000Z",
    "vendorId": "salon_123",
    "servicesCount": 2,
    "totalDuration": 120,
    "isHomeService": true,
    "travelTime": 15
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Staff stylist_a_id not found or inactive",
  "slots": []
}
```

---

## How It Works

### 1. Sequential Service Calculation
The API calculates the exact handoff time between services:

```
Example: Haircut (45min) + Manicure (30min)

Stylist A: Haircut
  Start: 10:00
  End:   10:45

Nail Tech B: Manicure (starts immediately after)
  Start: 10:45
  End:   11:15

Total Slot: 10:00 - 11:15 (75 minutes)
```

### 2. Travel Time Integration (Home Services)
For home services, the API adds travel time before and after:

```
Customer Location: 15 minutes away

Timeline:
09:45 - 10:00  Travel to customer
10:00 - 10:45  Haircut service
10:45 - 11:15  Manicure service
11:15 - 11:30  Travel back to salon

Slot shown to user: 10:00 - 11:30 (includes all time)
```

### 3. Validation Checks
For each candidate slot, the API validates:

1. **Staff Availability**: Is the staff member working on this day?
2. **Working Hours**: Is the service within their work schedule?
3. **Blocked Times**: Does it conflict with breaks/personal time?
4. **Existing Appointments**: Are there overlapping bookings?
5. **Sequential Feasibility**: Can all services fit in sequence?

---

## Mobile App Integration

### Example: Swift (iOS)
```swift
struct ServiceAssignment: Codable {
    let serviceId: String
    let staffId: String
}

struct MultiServiceSlotRequest: Codable {
    let vendorId: String
    let date: String
    let assignments: [ServiceAssignment]
    let isHomeService: Bool
    let location: Location?
}

func fetchMultiServiceSlots(request: MultiServiceSlotRequest) async throws -> [TimeSlot] {
    let url = URL(string: "https://glowvita.com/api/booking/slots/multi")!
    var urlRequest = URLRequest(url: url)
    urlRequest.httpMethod = "POST"
    urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let encoder = JSONEncoder()
    urlRequest.httpBody = try encoder.encode(request)
    
    let (data, _) = try await URLSession.shared.data(for: urlRequest)
    let response = try JSONDecoder().decode(MultiServiceSlotResponse.self, from: data)
    
    return response.slots
}
```

### Example: Kotlin (Android)
```kotlin
data class ServiceAssignment(
    val serviceId: String,
    val staffId: String
)

data class MultiServiceSlotRequest(
    val vendorId: String,
    val date: String,
    val assignments: List<ServiceAssignment>,
    val isHomeService: Boolean,
    val location: Location? = null
)

suspend fun fetchMultiServiceSlots(request: MultiServiceSlotRequest): List<TimeSlot> {
    val response = apiService.getMultiServiceSlots(request)
    return response.slots
}

// Using Retrofit
interface BookingApiService {
    @POST("booking/slots/multi")
    suspend fun getMultiServiceSlots(
        @Body request: MultiServiceSlotRequest
    ): MultiServiceSlotResponse
}
```

---

## Performance Optimizations

### 1. Staff Caching
Staff data is cached during the request to avoid redundant database queries:
```javascript
const staffCache = new Map();
// Reused across all assignments
```

### 2. Batch Appointment Query
All appointments are fetched in a single query:
```javascript
await AppointmentModel.find({
  vendorId,
  date: { $gte: startOfDay, $lte: endOfDay },
  status: { $in: ['confirmed', 'pending', 'scheduled'] }
});
```

### 3. Early Termination
Validation stops as soon as a conflict is found:
```javascript
if (hasAppointmentConflict(...)) {
  return { valid: false, reason: '...' };
}
```

### 4. Efficient Time Calculations
All time operations use minutes (integers) instead of Date objects:
```javascript
const startMinutes = 10 * 60 + 30; // 10:30 = 630 minutes
```

---

## Migration Guide

### For Web App (Replacing Frontend Logic)

**Before (Frontend - Step3_MultiServiceTimeSlot.tsx):**
```typescript
// Frontend fetches appointments and calculates slots client-side
const { data: existingAppointments } = useGetPublicAppointmentsQuery(...);
const availableTimeSlots = useMemo(() => {
  // Complex client-side calculation...
}, [selectedDate, serviceStaffAssignments, existingAppointments]);
```

**After (Using Unified API):**
```typescript
// Single API call, backend handles all logic
const [slots, setSlots] = useState([]);

const fetchSlots = async () => {
  const response = await fetch('/api/booking/slots/multi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vendorId: salonId,
      date: selectedDate.toISOString(),
      assignments: serviceStaffAssignments.map(a => ({
        serviceId: a.service.id,
        staffId: a.staff.id
      })),
      isHomeService,
      location: homeServiceLocation
    })
  });
  
  const data = await response.json();
  setSlots(data.slots);
};
```

### For Mobile App (New Implementation)

Use the examples above in the Mobile App Integration section.

---

## Testing

### Test Case 1: Same Staff, Multiple Services
```bash
curl -X POST http://localhost:3000/api/booking/slots/multi \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "your_vendor_id",
    "date": "2026-01-25T00:00:00.000Z",
    "assignments": [
      {"serviceId": "service1", "staffId": "staff1"},
      {"serviceId": "service2", "staffId": "staff1"}
    ]
  }'
```

### Test Case 2: Different Staff, Different Services
```bash
curl -X POST http://localhost:3000/api/booking/slots/multi \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "your_vendor_id",
    "date": "2026-01-25T00:00:00.000Z",
    "assignments": [
      {"serviceId": "service1", "staffId": "staff1"},
      {"serviceId": "service2", "staffId": "staff2"}
    ]
  }'
```

### Test Case 3: Home Service with Travel
```bash
curl -X POST http://localhost:3000/api/booking/slots/multi \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "your_vendor_id",
    "date": "2026-01-25T00:00:00.000Z",
    "assignments": [
      {"serviceId": "service1", "staffId": "staff1"}
    ],
    "isHomeService": true,
    "location": {
      "lat": 12.9716,
      "lng": 77.5946
    }
  }'
```

---

## Monitoring & Logs

The API provides detailed console logs for debugging:
```
Multi-service slot request: { vendorId, date, assignmentsCount, isHomeService }
Travel time calculated: { timeInMinutes, distanceInKm, source }
Duration breakdown: { serviceDuration, travelTime, buffers, total }
Found 12 existing appointments for the day
Working hours range: { earliest: "09:00", latest: "18:00" }
Generated 36 candidate start times
Found 15 valid time slots
```

Monitor these logs to optimize performance and identify issues.

---

## Error Handling

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| "Vendor ID is required" | 400 | Missing vendorId | Provide valid vendorId |
| "Service assignments are required" | 400 | Empty assignments array | Add at least one assignment |
| "Service {id} not found" | 404 | Invalid serviceId | Check service exists in vendor services |
| "Staff {id} not found or inactive" | 404 | Invalid/inactive staffId | Verify staff is active |
| "Cannot book appointments in the past" | 400 | Date is before today | Use future date |

---

## Next Steps

1. **Update Frontend**: Replace `Step3_MultiServiceTimeSlot` logic with API calls
2. **Implement in Mobile**: Use the Swift/Kotlin examples above
3. **Test Thoroughly**: Run all test cases with real data
4. **Monitor Performance**: Track API response times and optimize as needed
5. **Add Caching**: Consider Redis for frequently requested slots

---

## Support

For issues or questions:
- Check logs for detailed error messages
- Verify all serviceIds and staffIds exist in the database
- Ensure staff have working hours configured for the selected date
- Test with the provided curl commands first
