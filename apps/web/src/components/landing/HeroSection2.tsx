import React, { useState, useMemo, useEffect } from "react";
import {
  Scissors,
  MapPin,
  Sparkles,
  Navigation,
} from "lucide-react";
import {
  useGetPublicCategoriesQuery,
  useGetPublicServicesQuery,
  useGetPublicVendorsQuery,
} from "@repo/store/services/api";
import { useRouter } from "next/navigation";
import { cn } from "@repo/ui/cn";
import { useLoadScript } from "@react-google-maps/api";
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from "@repo/config/config";
import { useSalonFilter } from "./SalonFilterContext";

const GOOGLE_MAPS_LIBRARIES: any = ["places"];

const HeroSection2 = () => {
  const router = useRouter();

  // ── Shared filter context — updating this changes landing page sections ─────
  const { setUserLocation, userLat, userLng, locationLabel } = useSalonFilter();

  const [serviceInput, setServiceInput] = useState("");
  // Synced with context's locationLabel so the input reflects auto-detected location
  const [locationInput, setLocationInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isServiceFocused, setIsServiceFocused] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Locally resolved coords for the current typed/selected location
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);

  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetPublicCategoriesQuery(undefined);
  const { data: servicesData } = useGetPublicServicesQuery({ limit: 100 });
  const { data: vendorsData } = useGetPublicVendorsQuery({ limit: 100 });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [locationPredictions, setLocationPredictions] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  // ── Sync with global context (Requirements 1 & 3) ─────────────────────────
  useEffect(() => {
    if (locationLabel) {
      // Sync the input if it's currently empty or generic
      if (!locationInput || locationInput === "Current Location") {
        setLocationInput(locationLabel);
      }
    }
  }, [locationLabel]);

  // Sync coords from auto-detect/profile to local state
  useEffect(() => {
    if (userLat != null && userLng != null && selectedLat === null) {
      setSelectedLat(userLat);
      setSelectedLng(userLng);
    }
  }, [userLat, userLng]);

  // ── Service / Category autocomplete ───────────────────────────────────────
  const suggestions = useMemo(() => {
    const input = serviceInput.toLowerCase();
    const results: any[] = [];

    if (servicesData?.services) {
      const svcs = servicesData.services
        .filter((s: any) => s.name.toLowerCase().includes(input))
        .slice(0, 50);
      results.push(...svcs.map((s: any) => ({ ...s, type: "service" })));
    }

    if (categoriesData?.categories) {
      const cats = categoriesData.categories
        .filter((c: any) => c.name.toLowerCase().includes(input))
        .slice(0, 10);
      results.push(...cats.map((c: any) => ({ ...c, type: "category" })));
    }

    if (vendorsData?.vendors) {
      const vendors = vendorsData.vendors
        .filter((v: any) => v.businessName?.toLowerCase().includes(input))
        .slice(0, 10);
      results.push(...vendors.map((v: any) => ({ ...v, type: "salon", name: v.businessName })));
    }

    return results;
  }, [serviceInput, categoriesData, servicesData, vendorsData]);

  // ── Google Places autocomplete (geocode = allows neighbourhoods too) ───────
  useEffect(() => {
    if (!isLoaded || !locationInput || locationInput === "Current Location") {
      setLocationPredictions([]);
      return;
    }

    const svc = new google.maps.places.AutocompleteService();
    svc.getPlacePredictions(
      {
        input: locationInput,
        types: ["geocode"], // allows areas, suburbs, cities, states
        componentRestrictions: { country: "in" },
      },
      (predictions) => setLocationPredictions(predictions || [])
    );
  }, [locationInput, isLoaded]);

  // ── Clear resolved coords when user re-types ──────────────────────────────
  const handleLocationInputChange = (value: string) => {
    setLocationInput(value);
    setSelectedLat(null);
    setSelectedLng(null);
  };

  // ── Geocode a place_id and update both local state AND context ────────────
  const handleSelectPrediction = (prediction: any) => {
    const label =
      prediction.structured_formatting?.main_text ||
      prediction.description.split(",")[0].trim();
    setLocationInput(prediction.description);
    setIsLocationFocused(false);

    if (!isLoaded) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const loc = results[0].geometry.location;
        const lat = loc.lat();
        const lng = loc.lng();
        setSelectedLat(lat);
        setSelectedLng(lng);
        // ↓ Update context → WhereToDo / AllSalons / NewlyAdded re-query immediately
        setUserLocation(lat, lng, label);
      }
    });
  };

  // ── Use browser geolocation ────────────────────────────────────────────────
  const handleCurrentLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedLat(latitude);
        setSelectedLng(longitude);
        setLocationInput("Current Location");
        setIsLocating(false);
        // ↓ Also update context
        setUserLocation(latitude, longitude, "Current Location");
      },
      () => setIsLocating(false)
    );
  };

  // ── Geocode helper (promise wrapper) ──────────────────────────────────────
  const geocodeText = (text: string): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!isLoaded) return resolve(null);
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { address: text, region: "in" },
        (results, status) => {
          if (status === "OK" && results && results[0]) {
            const loc = results[0].geometry.location;
            resolve({ lat: loc.lat(), lng: loc.lng() });
          } else {
            resolve(null);
          }
        }
      );
    });
  };

  // ── Navigate to search — geocodes text if no coords yet ──────────────────
  const handleSearch = async () => {
    setIsSearching(true);
    const params = new URLSearchParams();

    if (serviceInput) params.append("serviceName", serviceInput);
    if (selectedCategoryId) params.append("categoryIds", selectedCategoryId);

    let finalLat = selectedLat;
    let finalLng = selectedLng;

    // If user typed something but never selected from dropdown, geocode now
    if (
      (finalLat == null || finalLng == null) &&
      locationInput &&
      locationInput !== "Current Location"
    ) {
      const result = await geocodeText(locationInput);
      if (result) {
        finalLat = result.lat;
        finalLng = result.lng;
        setSelectedLat(result.lat);
        setSelectedLng(result.lng);
        // Also update context so landing sections update
        setUserLocation(
          result.lat,
          result.lng,
          locationInput.split(",")[0].trim()
        );
      }
    }

    if (finalLat != null && finalLng != null) {
      params.append("lat", finalLat.toString());
      params.append("lng", finalLng.toString());
      if (locationInput && locationInput !== "Current Location") {
        params.append("locationLabel", locationInput.split(",")[0].trim());
      }
    } else if (locationInput && locationInput !== "Current Location") {
      // Fallback: text-based (case-insensitive regex on backend)
      params.append("city", locationInput.split(",")[0].trim());
    }

    if (dateInput) params.append("date", dateInput);
    setIsSearching(false);
    router.push(`/search?${params.toString()}`);
  };

  const handleSuggestionSelection = (item: any) => {
    if (item.type === "category") {
      setSelectedCategoryId(item._id);
      setServiceInput(item.name);
    } else if (item.type === "salon") {
      setServiceInput(item.name);
      setSelectedCategoryId("");
    } else {
      setServiceInput(item.name);
      setSelectedCategoryId("");
    }
    setIsServiceFocused(false);
  };

  const marqueeCategories = useMemo(() => {
    if (!categoriesData?.categories) return [];
    const iconMap: Record<string, any> = {
      hair: Scissors,
      nail: Scissors,
      spa: Sparkles,
      makeup: Sparkles,
      skin: Sparkles,
    };
    return categoriesData.categories.map((category: any) => {
      const name = category.name.toLowerCase();
      let icon = Sparkles;
      for (const [key, Icon] of Object.entries(iconMap)) {
        if (name.includes(key)) { icon = Icon; break; }
      }
      return { id: category._id, icon, label: category.name };
    });
  }, [categoriesData]);

  return (
    <div className="relative w-full min-h-[500px] h-[615px] md:h-[615px] overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(45, 28, 48, 0.85), rgba(45, 28, 48, 0.4)), url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200')`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center max-w-7xl py-8 md:py-0">
        <div className="mb-4 md:mb-8">
          <h3 className="text-amber-100 text-xs sm:text-sm font-light tracking-[0.2em] sm:tracking-[0.3em] uppercase">
            GLOWVITA
          </h3>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-amber-50 mb-4 md:mb-6 max-w-2xl leading-tight">
          Find a service
          <br />
          close to you
        </h1>

        <p className="text-gray-200 text-sm sm:text-base md:text-lg mb-6 md:mb-10 max-w-xl leading-relaxed">
          Experience convenience by discovering salons and specialists in your
          area, ready to provide excellent self-care services.
        </p>

        {/* ── Search Bar ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl md:rounded-full shadow-2xl p-3 md:p-2 flex flex-col md:flex-row items-stretch md:items-center gap-3 max-w-4xl mb-6 md:mb-8">

          {/* Service Input */}
          <div className="relative flex-1 flex items-center gap-3 px-4 md:border-r border-gray-200 py-2 md:py-0">
            <div className="flex flex-col flex-1">
              {!serviceInput && (
                <label className="text-primary text-xs font-medium mb-1">
                  Service Name
                </label>
              )}
              <input
                type="text"
                placeholder="Book your services..."
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onFocus={() => setIsServiceFocused(true)}
                onBlur={() => setTimeout(() => setIsServiceFocused(false), 200)}
                className="outline-none text-gray-800 placeholder-gray-400 text-sm w-full"
              />
            </div>
            <Scissors className="w-4 h-4 text-gray-400 flex-shrink-0" />

            {/* Service Suggestions */}
            {isServiceFocused && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 md:right-auto md:w-[400px] mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-60 overflow-y-auto no-scrollbar">
                {suggestions.map((item: any) => (
                  <button
                    key={item._id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSuggestionSelection(item);
                    }}
                    className="w-full text-left px-4 sm:px-5 py-3 hover:bg-amber-50 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div
                        className={cn(
                          "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0",
                          item.type === "category" ? "bg-purple-100/50" : "bg-amber-100/50"
                        )}
                      >
                        {item.type === "category" ? (
                          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                        ) : item.type === "salon" ? (
                          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                        ) : (
                          <Scissors className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-gray-900 font-bold text-xs sm:text-sm tracking-tight truncate">
                          {item.name}
                        </span>
                        <span className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          {item.type}
                        </span>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location Input */}
          <div className="relative flex-1 flex items-center gap-3 px-4 py-2 md:py-0">
            <div className="flex flex-col flex-1">
              {!locationInput && (
                <label className="text-primary text-xs font-medium mb-1">
                  Address
                </label>
              )}
              <input
                type="text"
                placeholder="Neighbourhood, city or area…"
                value={locationInput}
                onChange={(e) => handleLocationInputChange(e.target.value)}
                onFocus={() => setIsLocationFocused(true)}
                onBlur={() => setTimeout(() => setIsLocationFocused(false), 200)}
                className="outline-none text-gray-800 placeholder-gray-400 text-sm w-full"
              />
            </div>

            {/* Green dot = coords resolved */}
            {selectedLat != null ? (
              <div className="relative flex-shrink-0">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
            ) : (
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}

            {/* Location Dropdown */}
            {isLocationFocused && (locationPredictions.length > 0 || !locationInput) && (
              <div className="absolute top-full left-0 right-0 md:right-auto md:w-[380px] mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-64 overflow-y-auto no-scrollbar">
                {/* Current Location */}
                {!locationInput && (
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleCurrentLocation();
                      setIsLocationFocused(false);
                    }}
                    className="w-full text-left px-4 sm:px-5 py-3 hover:bg-amber-50 flex items-center gap-2 sm:gap-3 transition-colors group"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 group-hover:bg-amber-200 transition-colors flex items-center justify-center flex-shrink-0">
                      <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-gray-900 font-bold text-xs sm:text-sm tracking-tight truncate">
                        {isLocating ? "Locating…" : "Use Current Location"}
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-gray-400 font-black uppercase">
                        Instant Search
                      </span>
                    </div>
                  </button>
                )}

                {locationPredictions.map((prediction, i) => (
                  <button
                    key={i}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectPrediction(prediction);
                    }}
                    className="w-full text-left px-4 sm:px-5 py-3 hover:bg-amber-50 flex items-center gap-2 sm:gap-3 transition-colors group"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 group-hover:bg-amber-100 transition-colors flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-amber-600" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-gray-800 font-bold text-xs sm:text-sm tracking-tight truncate">
                        {prediction.structured_formatting?.main_text || prediction.description}
                      </span>
                      <span className="text-[9px] text-gray-400 truncate">
                        {prediction.structured_formatting?.secondary_text || ""}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-primary text-white px-6 sm:px-8 py-3 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:bg-primary/90 w-full md:w-auto disabled:opacity-70"
          >
            {isSearching ? "Searching…" : "Search"}
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* Service Categories Marquee */}
        <div className="max-w-4xl overflow-hidden relative">
          <div className="rounded-full absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[rgba(45,28,48,0.95)] via-[rgba(45,28,48,0.7)] to-transparent z-10 pointer-events-none"></div>
          <div className="flex gap-3 animate-marquee hover:[animation-play-state:paused]">
            {categoriesLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white bg-opacity-10 backdrop-blur-sm border border-purple-950 border-opacity-30 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-full flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 animate-pulse">
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gray-300 rounded-full" />
                  <div className="h-3.5 sm:h-4 bg-gray-300 rounded w-12 sm:w-16" />
                </div>
              ))
              : [...marqueeCategories, ...marqueeCategories].map((cat: any, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setServiceInput(cat.label);
                  }}
                  className="bg-white bg-opacity-10 backdrop-blur-sm hover:border-white hover:bg-opacity-20 border border-purple-950 border-opacity-30 text-white px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0"
                >
                  <cat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {cat.label}
                </button>
              ))}
          </div>
          <div className="rounded-full absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[rgba(45,28,48,0.95)] via-[rgba(45,28,48,0.7)] to-transparent z-10 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection2;