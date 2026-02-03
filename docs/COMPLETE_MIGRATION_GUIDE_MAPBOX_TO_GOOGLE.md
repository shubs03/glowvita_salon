# Complete Mapbox to Google Maps Migration Guide

## Summary

This project has been migrated from Mapbox to Google Maps. Below is the complete list of files changed and changes required.

## ✅ Files Already Migrated

### 1. apps/admin/src/components/VendorForm.tsx
- ✅ Removed `mapboxgl` imports
- ✅ Added Google Maps API loading script
- ✅ Replaced Mapbox Geocoding with Google Places Autocomplete
- ✅ Replaced Mapbox reverse geocoding with Google Geocoder
- ✅ Updated map initialization (mapboxgl.Map → google.maps.Map)
- ✅ Updated marker handling (mapboxgl.Marker → google.maps.Marker)
- ✅ Updated event listeners (`.on()` → `.addListener()`)
- ✅ Updated coordinates format ([lng, lat] → {lat, lng})
- ✅ Updated search results UI (result.id → result.place_id, result.place_name → result.description)
- ✅ Updated error messages (Mapbox → Google Maps)

## 🔄 Files Requiring Migration

### Remaining Files with Mapbox

The following **5 files** still need to be migrated using the SAME PATTERN as VendorForm.tsx:

#### 1. **apps/admin/src/components/VendorEditForm.tsx** (Lines 19-24, 121-310)
**Mapbox Usage:**
- Lines 19-20: `import mapboxgl from 'mapbox-gl'` and CSS import
- Line 21: `import { NEXT_PUBLIC_MAPBOX_API_KEY }`
- Line 24: `const MAPBOX_TOKEN = NEXT_PUBLIC_MAPBOX_API_KEY`
- Line 121-131: `MapboxFeature` interface
- Lines 148-151: Mapbox refs (map, marker)
- Lines 156-226: Map initialization with Mapbox
- Lines 239-254: Mapbox Geocoding search
- Lines 256-280: Mapbox reverse geocoding
- Lines 282-309: Mapbox search result selection
- Lines 618-622: Search results UI using Mapbox properties
- Lines 641-646: Mapbox error message

**Required Changes:** Apply the same transformation pattern from VendorForm.tsx

#### 2. **apps/admin/src/components/DoctorForm.tsx**
Search for Mapbox imports and usage (similar pattern to VendorForm/VendorEditForm)

#### 3. **apps/admin/src/app/supplier-management/page.tsx**
Contains Mapbox imports at lines 67-68

#### 4. **apps/crm/src/components/forms/SupplierRegistrationForm.tsx**
Contains Mapbox imports at lines 13-14

#### 5. **apps/crm/src/components/forms/VendorRegistrationForm.tsx**
Contains Mapbox imports at lines 16-17

#### 6. **apps/crm/src/app/layout.tsx** (Line 210)
Contains Mapbox CSS CDN link:
```tsx
<link href='https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.css' rel='stylesheet' />
```
**Action:** Remove this line entirely (Google Maps doesn't need external CSS)

## Transformation Pattern

### Before (Mapbox)
```typescript
// Imports
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NEXT_PUBLIC_MAPBOX_API_KEY } from '@repo/config/config';

const MAPBOX_TOKEN = NEXT_PUBLIC_MAPBOX_API_KEY;

// Interface
interface MapboxFeature {
  id: string;
  place_name: string;
  geometry: { coordinates: [number, number] };
  context?: Array<{ id: string; text: string }>;
}

// Refs
const map = useRef<mapboxgl.Map | null>(null);
const marker = useRef<mapboxgl.Marker | null>(null);
const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);

// Map initialization
mapboxgl.accessToken = MAPBOX_TOKEN;
map.current = new mapboxgl.Map({
  container: mapContainer.current,
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [lng, lat],
  zoom: 15
});

marker.current = new mapboxgl.Marker({ draggable: true })
  .setLngLat([lng, lat])
  .addTo(map.current);

marker.current.on('dragend', () => {
  const lngLat = marker.current!.getLngLat();
  // Handle position
});

map.current.on('click', (e: mapboxgl.MapLayerMouseEvent) => {
  const { lng, lat } = e.lngLat;
  // Handle click
});

// Geocoding search
const response = await fetch(
  `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}&country=IN`
);
const data = await response.json();
setSearchResults(data.features || []);

// Reverse geocoding
const response = await fetch(
  `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
);

// Search results UI
{searchResults.map((result) => (
  <div key={result.id}>
    <div>{result.place_name}</div>
  </div>
))}
```

### After (Google Maps)
```typescript
// Imports
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from '@repo/config/config';

const GOOGLE_MAPS_API_KEY = NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Interface
interface GooglePlacesResult {
  description: string;
  place_id: string;
}

// Refs
const map = useRef<google.maps.Map | null>(null);
const marker = useRef<google.maps.Marker | null>(null);
const geocoder = useRef<google.maps.Geocoder | null>(null);
const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
const placesService = useRef<google.maps.places.PlacesService | null>(null);
const [searchResults, setSearchResults] = useState<GooglePlacesResult[]>([]);
const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

// Load Google Maps script
useEffect(() => {
  if (!GOOGLE_MAPS_API_KEY) return;

  const checkGoogleMaps = () => {
    if ((window as any).google?.maps) {
      setIsGoogleMapsLoaded(true);
      return true;
    }
    return false;
  };

  if (checkGoogleMaps()) return;

  const scriptId = 'google-maps-script-unique-id';
  if (document.getElementById(scriptId)) {
    const checkInterval = setInterval(() => {
      if (checkGoogleMaps()) clearInterval(checkInterval);
    }, 100);
    return () => clearInterval(checkInterval);
  }

  const script = document.createElement('script');
  script.id = scriptId;
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => setIsGoogleMapsLoaded(true);
  document.head.appendChild(script);
}, []);

// Map initialization
useEffect(() => {
  if (!isGoogleMapsLoaded || !isMapOpen) return;

  const center = { lat, lng };
  
  map.current = new google.maps.Map(mapContainer.current, {
    center,
    zoom: 15,
    mapTypeControl: true,
    streetViewControl: true,
  });

  geocoder.current = new google.maps.Geocoder();
  autocompleteService.current = new google.maps.places.AutocompleteService();
  placesService.current = new google.maps.places.PlacesService(map.current);

  marker.current = new google.maps.Marker({
    position: center,
    map: map.current,
    draggable: true,
    animation: google.maps.Animation.DROP,
  });

  marker.current.addListener('dragend', () => {
    const position = marker.current!.getPosition();
    if (position) {
      // Handle position: position.lat(), position.lng()
    }
  });

  map.current.addListener('click', (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    // Handle click
  });
}, [isGoogleMapsLoaded, isMapOpen]);

// Places Autocomplete search
const handleSearch = async (query: string) => {
  if (!query || !autocompleteService.current) return;

  autocompleteService.current.getPlacePredictions(
    {
      input: query,
      componentRestrictions: { country: 'IN' },
    },
    (predictions, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        setSearchResults(predictions.map(p => ({
          description: p.description,
          place_id: p.place_id,
        })));
      } else {
        setSearchResults([]);
      }
    }
  );
};

// Reverse geocoding
const fetchAddress = async (location: { lat: number; lng: number }) => {
  if (!geocoder.current) return;

  geocoder.current.geocode({ location }, (results, status) => {
    if (status === 'OK' && results && results.length > 0) {
      const address = results[0].formatted_address;
      
      let state = '';
      let city = '';
      
      results[0].address_components.forEach((component) => {
        if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
      });
      
      // Update form data
    }
  });
};

// Handle search result selection
const handleSearchResultSelect = (result: GooglePlacesResult) => {
  if (!placesService.current) return;

  placesService.current.getDetails(
    {
      placeId: result.place_id,
      fields: ['geometry', 'formatted_address', 'address_components'],
    },
    (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        // Handle place details
      }
    }
  );
};

// Search results UI
{searchResults.map((result) => (
  <div key={result.place_id}>
    <div>{result.description}</div>
  </div>
))}
```

## Key Differences Summary

| Aspect | Mapbox | Google Maps |
|--------|--------|-------------|
| **Import** | `mapboxgl` from npm | Dynamic script loading |
| **CSS** | Requires CSS import | No CSS needed |
| **API Key** | `mapboxgl.accessToken` | URL parameter |
| **Map Constructor** | `new mapboxgl.Map()` | `new google.maps.Map()` |
| **Coordinates** | `[lng, lat]` array | `{lat, lng}` object |
| **Marker** | `new mapboxgl.Marker()` | `new google.maps.Marker()` |
| **Events** | `.on('event', callback)` | `.addListener('event', callback)` |
| **Geocoding** | Fetch API to Mapbox | `Geocoder` service |
| **Autocomplete** | Geocoding API | `AutocompleteService` |
| **Place Details** | Part of geocoding | `PlacesService` |
| **Coordinates Access** | `lngLat.lng`, `lngLat.lat` | `latLng.lat()`, `latLng.lng()` |

## Package.json Updates Required

### apps/admin/package.json
```json
// REMOVE these dependencies:
{
  "dependencies": {
-   "@mapbox/mapbox-gl-draw": "^1.4.3",
-   "mapbox-gl": "^3.4.0"
  },
  "devDependencies": {
-   "@types/mapbox__mapbox-gl-draw": "^1.4.6",
-   "@types/mapbox-gl": "^3.1.0"
  }
}
```

### apps/crm/package.json
```json
// REMOVE this dependency:
{
  "dependencies": {
-   "mapbox-gl": "^3.18.1"
  }
}
```

**After removing dependencies, run:**
```bash
npm install
```

##  Configuration

The `packages/config/config.js` already exports both:
- `NEXT_PUBLIC_MAPBOX_API_KEY` (can be deprecated/removed after migration)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (already in use)

No changes needed to config file.

## Environment Variables

Ensure `.env` has:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Testing Checklist

After migrating each file, test:
- [ ] Map renders correctly
- [ ] Click on map places marker
- [ ] Marker is draggable
- [ ] Search autocomplete shows results
- [ ] Selecting search result moves map and marker
- [ ] Reverse geocoding fills address, city, state
- [ ] All existing business logic unchanged
- [ ] Data format (lat/lng object) consistent
- [ ] No console errors

## Migration Progress

- [x] apps/admin/src/components/VendorForm.tsx
- [ ] apps/admin/src/components/VendorEditForm.tsx
- [ ] apps/admin/src/components/DoctorForm.tsx
- [ ] apps/admin/src/app/supplier-management/page.tsx
- [ ] apps/crm/src/components/forms/SupplierRegistrationForm.tsx
- [ ] apps/crm/src/components/forms/VendorRegistrationForm.tsx
- [ ] apps/crm/src/app/layout.tsx (remove Mapbox CSS link)
- [ ] Remove Mapbox packages from package.json files
- [ ] Run npm install
- [ ] Full application testing

## Notes

1. **Script ID**: Use unique script IDs in each component (e.g., 'google-maps-vendor-form', 'google-maps-vendor-edit', etc.)
2. **Script Reuse**: Check if script is already loaded before adding a new one
3. **Cleanup**: Don't remove the script on unmount as it may be shared
4. **API Restrictions**: Ensure Google Maps API key allows:
   - Maps JavaScript API
   - Places API  
   - Geocoding API
5. **Billing**: Google Maps requires billing to be enabled (free tier available)
