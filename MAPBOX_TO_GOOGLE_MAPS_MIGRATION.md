# Mapbox to Google Maps Migration Summary

## Overview
This document describes the complete migration from Mapbox to Google Maps across all applications in the Glowvita salon project.

## Files Already Using Google Maps ✅
1. `apps/admin/src/components/RegionMapEditor.tsx` - Already uses Google Maps
2. `apps/web/src/components/MultiSalonMap.tsx` - Already uses Google Maps  
3. `apps/web/src/components/GoogleMapSelector.tsx` - Already uses Google Maps

## Files Migrated in This Session ✅
1. **`apps/admin/src/components/VendorForm.tsx`** - COMPLETED
   - Removed Mapbox GL JS imports
   - Added Google Maps JavaScript API with Places library
   - Replaced Mapbox Geocoding API with Google Places Autocomplete & Geocoding
   - Updated all map initialization and event handling

## Files Requiring Migration 🔄

### 1. apps/admin/src/components/VendorEditForm.tsx
**Changes Required:**
- Remove: `import mapboxgl from 'mapbox-gl'`
- Remove: `import 'mapbox-gl/dist/mapbox-gl.css'`
- Replace Mapbox token with Google Maps API key
- Replace map initialization (mapboxgl.Map → google.maps.Map)
- Replace geocoding API calls
- Replace marker handling

### 2. apps/admin/src/components/DoctorForm.tsx
**Changes Required:**
- Same as VendorEditForm.tsx

### 3. apps/admin/src/app/supplier-management/page.tsx
**Changes Required:**
- Same as VendorEditForm.tsx

### 4. apps/crm/src/components/forms/SupplierRegistrationForm.tsx
**Changes Required:**
- Same as VendorEditForm.tsx

### 5. apps/crm/src/components/forms/VendorRegistrationForm.tsx
**Changes Required:**
- Same as VendorEditForm.tsx

### 6. apps/crm/src/app/layout.tsx
**Changes Required:**
- Remove: `<link href='https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.css' rel='stylesheet' />`

## Package Dependencies to Remove

### Root package.json
- No Mapbox dependencies (already using @react-google-maps/api)

### apps/admin/package.json
Remove:
```json
"@mapbox/mapbox-gl-draw": "^1.4.3",
"mapbox-gl": "^3.4.0",
"@types/mapbox__mapbox-gl-draw": "^1.4.6",
"@types/mapbox-gl": "^3.1.0",
```

### apps/crm/package.json
Remove:
```json
"mapbox-gl": "^3.18.1",
```

## Configuration Updates

### packages/config/config.js
- Keep: `NEXT_PUBLIC_MAPBOX_API_KEY` (can be deprecated later)
- Keep: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (already present)

## Migration Pattern

### Before (Mapbox):
```typescript
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = MAPBOX_TOKEN;
const map = new mapboxgl.Map({
  container: mapContainer.current,
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [lng, lat],
  zoom: 15
});

const marker = new mapboxgl.Marker({ draggable: true })
  .setLngLat([lng, lat])
  .addTo(map);

marker.on('dragend', () => {
  const lngLat = marker.getLngLat();
  // Handle dragend
});

// Geocoding
const response = await fetch(
  `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}`
);
```

### After (Google Maps):
```typescript
// Load script dynamically
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;

const map = new google.maps.Map(mapContainer.current, {
  center: { lat, lng },
  zoom: 15,
  mapTypeControl: true,
  streetViewControl: true,
});

const marker = new google.maps.Marker({
  position: { lat, lng },
  map: map,
  draggable: true,
});

marker.addListener('dragend', () => {
  const position = marker.getPosition();
  // Handle dragend
});

// Places Autocomplete
const autocompleteService = new google.maps.places.AutocompleteService();
autocompleteService.getPlacePredictions(
  { input: query, componentRestrictions: { country: 'IN' } },
  (predictions, status) => {
    // Handle predictions
  }
);

// Reverse Geocoding
const geocoder = new google.maps.Geocoder();
geocoder.geocode({ location: { lat, lng } }, (results, status) => {
  // Handle results
});
```

## API Differences Summary

| Feature | Mapbox | Google Maps |
|---------|--------|-------------|
| **Map Init** | `mapboxgl.Map` | `google.maps.Map` |
| **Marker** | `mapboxgl.Marker` | `google.maps.Marker` |
| **Coordinates** | `[lng, lat]` | `{ lat, lng }` |
| **Events** | `.on('event')` | `.addListener('event')` |
| **Geocoding** | Fetch API | Geocoder service |
| **Search** | Geocoding API | Places Autocomplete |
| **Styling** | CSS import required | Built-in |

## Testing Checklist

After migration, verify:
- [ ] Map loads correctly
- [ ] Click to place marker works
- [ ] Drag marker works
- [ ] Search autocomplete works
- [ ] Reverse geocoding fills address fields
- [ ] State and city extraction works
- [ ] All existing UX flows unchanged
- [ ] No console errors
- [ ] All data formats remain the same (lat/lng object structure)

## Rollback Plan

If issues occur:
1. Revert package.json changes
2. Run `npm install` to restore Mapbox packages
3. Restore original component files from git
4. Keep Google Maps API key for future attempts
