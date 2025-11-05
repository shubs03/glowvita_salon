# Time Slot Generation Logic

## Overview
The booking system generates time slots based on:
- **Consultation Duration**: Dynamic (5-120 minutes, default: 20 minutes, configurable per doctor)
- **Slot Gap**: Variable buffer time between consultations (0-60 minutes)

## Formula
```
Total Interval = Consultation Duration (dynamic) + Slot Gap (variable)
```

## Example Scenarios

### Scenario 1: 20-minute consultation with 10-minute gap
- **Settings**: Consultation = 20 min (dynamic), Gap = 10 min
- **Total Interval**: 30 minutes

**Timeline:**
```
02:00 PM - 02:20 PM  [Consultation 1]
02:20 PM - 02:30 PM  [Gap]
02:30 PM - 02:50 PM  [Consultation 2]
02:50 PM - 03:00 PM  [Gap]
03:00 PM - 03:20 PM  [Consultation 3]
```

**Available Slots for Booking:**
- 02:00 PM
- 02:30 PM
- 03:00 PM
- 03:30 PM
- etc.

### Scenario 2: 20-minute consultation with 0-minute gap (back-to-back)
- **Settings**: Consultation = 20 min (dynamic), Gap = 0 min
- **Total Interval**: 20 minutes

**Timeline:**
```
02:00 PM - 02:20 PM  [Consultation 1]
02:20 PM - 02:40 PM  [Consultation 2]
02:40 PM - 03:00 PM  [Consultation 3]
```

**Available Slots:**
- 02:00 PM
- 02:20 PM
- 02:40 PM
- 03:00 PM
- etc.

### Scenario 3: 20-minute gap
- **Settings**: Consultation = 20 min (dynamic), Gap = 20 min
- **Total Interval**: 40 minutes

**Timeline:**
```
02:00 PM - 02:20 PM  [Consultation 1]
02:20 PM - 02:40 PM  [Gap]
02:40 PM - 03:00 PM  [Consultation 2]
03:00 PM - 03:20 PM  [Gap]
03:20 PM - 03:40 PM  [Consultation 3]
```

**Available Slots:**
- 02:00 PM
- 02:40 PM
- 03:20 PM
- 04:00 PM
- etc.

### Scenario 4: Dynamic 30-minute consultation with 15-minute gap
- **Settings**: Consultation = 30 min (dynamic), Gap = 15 min
- **Total Interval**: 45 minutes

**Timeline:**
```
02:00 PM - 02:30 PM  [Consultation 1]
02:30 PM - 02:45 PM  [Gap]
02:45 PM - 03:15 PM  [Consultation 2]
03:15 PM - 03:30 PM  [Gap]
03:30 PM - 04:00 PM  [Consultation 3]
```

**Available Slots:**
- 02:00 PM
- 02:45 PM
- 03:30 PM
- 04:15 PM
- etc.

## Implementation Details

### Code Flow
1. Fetch `consultationDuration` and `slotGap` from DoctorWorkingHours API
2. Calculate `totalSlotInterval = consultationDuration + slotGap`
3. Generate slots starting from opening time
4. Each iteration: `currentTime += totalSlotInterval`
5. Ensure slot + consultation duration fits within closing time

### Files
- **Model**: `packages/lib/src/models/Vendor/DoctorWorkingHours.model.js`
  - Field: `consultationDuration` (Number, default: 20, min: 5, max: 120)
  - Field: `slotGap` (Number, default: 20, min: 0, max: 60)

- **CRM Settings**: `apps/crm/src/app/settings/page.tsx`
  - Allows doctors to configure consultation duration and slot gap

- **CRM Timetable**: `apps/crm/src/app/timetable/page.tsx`
  - Allows doctors to configure consultation duration and slot gap alongside working hours

- **API**: `apps/crm/src/app/api/crm/doctor-workinghours/route.js`
  - PATCH endpoint to update consultationDuration and slotGap

- **Booking Flow**: `apps/web/src/app/doctors/physical-consultation/components/TimeSlotSelection.tsx`
  - Generates time slots based on dynamic consultationDuration and slotGap
  - Filters out past/in-progress slots

## Benefits
- **Fully dynamic scheduling**: Doctors can adjust both consultation time and buffer time based on specialty needs
- **Flexible consultation duration**: Different doctors can have different consultation durations (e.g., 15 min for quick checks, 45 min for detailed consultations)
- **No overlaps**: Gap ensures doctors have break time
- **Easy to understand**: Simple arithmetic calculation
- **Scalable**: Works for any consultation duration from 5 to 120 minutes
