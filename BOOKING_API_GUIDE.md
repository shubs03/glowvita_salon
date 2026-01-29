 # Complete Booking API Guide - Glowvita

This guide provides the exact API endpoints and request formats for all booking use cases. To ensure consistency between the Web and Mobile apps, **always use these unified endpoints**.

---

## 🚀 Overview of Primary Endpoints

| Category | Endpoint | Method | Purpose |
| :--- | :--- | :--- | :--- |
| **Discovery** | `/api/booking/slots` | `GET` | Discovery of slots for **Single Service** (Salon or Home). *[Legacy/Internal]* |
| **Discovery** | `/api/booking/slots/multi` | `POST` | Discovery of slots for **Unified Booking** (Single or Multiple Services). **[Recommended]** |
| **Locking** | `/api/booking/lock` | `POST` | Temporarily locks a slot (15-30 mins) before payment. |
| **Confirmation** | `/api/booking/confirm` | `POST` | Finalizes the booking and creates the appointment. |

---

## 📂 Use Case Mapping

### 1. Single Service + Single Staff (Salon)
*   **Step 1: Get Slots (Recommended - Unified)**
    ```http
    POST /api/booking/slots/multi
    {
      "vendorId": "{vendorId}",
      "date": "{ISO_DATE}",
      "isHomeService": false,
      "assignments": [
        { "serviceId": "{serviceId}", "staffId": "{staffId}" }
      ],
      "stepMinutes": 15,
      "bufferBefore": 5,
      "bufferAfter": 5
    }
    ```
*   **Alternative: Get Slots (Legacy)**
    ```http
    GET /api/booking/slots?vendorId={vendorId}&staffId={staffId}&serviceIds={serviceId}&date={ISO_DATE}&isHomeService=false
    ```
*   **Step 2: Lock & Confirm** (See [Lock & Confirm](#lock--confirm-flow) section)

### 2. Single Service + Single Staff (Home Service)
*   **Step 1: Get Slots (Recommended - Unified)**
    ```http
    POST /api/booking/slots/multi
    {
      "vendorId": "{vendorId}",
      "date": "{ISO_DATE}",
      "isHomeService": true,
      "location": { "lat": {lat}, "lng": {lng} },
      "assignments": [
        { "serviceId": "{serviceId}", "staffId": "{staffId}" }
      ],
      "stepMinutes": 15,
      "bufferBefore": 5,
      "bufferAfter": 5
    }
    ```
*   **Alternative: Get Slots (Legacy)**
    ```http
    GET /api/booking/slots?vendorId={vendorId}&staffId={staffId}&serviceIds={serviceId}&date={ISO_DATE}&isHomeService=true&lat={lat}&lng={lng}
    ```
*   **Step 2: Lock & Confirm** (Include `location` in Lock payload)

### 3. Multiple Services + SAME Staff (Salon)
*   **Step 1: Get Slots**
    ```http
    POST /api/booking/slots/multi
    {
      "vendorId": "{vendorId}",
      "date": "{ISO_DATE}",
      "isHomeService": false,
      "assignments": [
        { "serviceId": "{s1_id}", "staffId": "{staff_id}" },
        { "serviceId": "{s2_id}", "staffId": "{staff_id}" }
      ]
    }
    ```

### 4. Multiple Services + SAME Staff (Home Service)
*   **Step 1: Get Slots**
    ```http
    POST /api/booking/slots/multi
    {
      "vendorId": "{vendorId}",
      "date": "{ISO_DATE}",
      "isHomeService": true,
      "location": { "lat": {lat}, "lng": {lng} },
      "assignments": [
        { "serviceId": "{s1_id}", "staffId": "{staff_id}" },
        { "serviceId": "{s2_id}", "staffId": "{staff_id}" }
      ]
    }
    ```

### 5. Multiple Services + Different Staff (Salon)
*   **Step 1: Get Slots**
    ```http
    POST /api/booking/slots/multi
    {
      "vendorId": "{vendorId}",
      "date": "{ISO_DATE}",
      "assignments": [
        { "serviceId": "{s1_id}", "staffId": "{staff_a_id}" },
        { "serviceId": "{s2_id}", "staffId": "{staff_b_id}" }
      ]
    }
    ```

### 6. Multiple Services + Different Staff (Home Service)
*   **Step 1: Get Slots**
    ```http
    POST /api/booking/slots/multi
    {
      "vendorId": "{vendorId}",
      "date": "{ISO_DATE}",
      "isHomeService": true,
      "location": { "lat": {lat}, "lng": {lng} },
      "assignments": [
        { "serviceId": "{s1_id}", "staffId": "{staff_a_id}" },
        { "serviceId": "{s2_id}", "staffId": "{staff_b_id}" }
      ]
    }
    ```

---

## 🔒 Lock & Confirm Flow

Regardless of the discovery API used, the locking and confirmation flow is the same.

### Step 2: Lock Slot
`POST /api/booking/lock`

**Minimum Payload:**
```json
{
  "vendorId": "...",
  "staffId": "...",
  "serviceId": "...",
  "date": "2026-01-25T00:00:00.000Z",
  "startTime": "10:00",
  "endTime": "11:00",
  "isHomeService": true,
  "location": { "lat": 12.97, "lng": 77.59 }, // Required for Home Service
  "serviceItems": [ // Optional for single, REQUIRED for multi-service
    {
      "service": "s1_id",
      "staff": "staff_a_id",
      "startTime": "10:00",
      "endTime": "10:30"
    },
    ...
  ]
}
```

### Step 3: Confirm Booking
`POST /api/booking/confirm`

**Payload:**
```json
{
  "appointmentId": "{appointmentId_from_lock}",
  "lockId": "{lockId_from_lock}",
  "paymentDetails": {
    "method": "online",
    "transactionId": "..."
  }
}
```

---

## 👰 Wedding Packages

Wedding packages use a specialized endpoint for discovery and locking.

*   **Discovery & Lock**: `POST /api/scheduling/wedding-package`
    *   This handles calculations specifically for high-duration wedding bookings.

---

> [!IMPORTANT]
> **Staff Selection**: When a user selects "Any Professional", pass `staffId=any` to the discovery APIs. The backend will automatically find the best available staff for the requested slot.
