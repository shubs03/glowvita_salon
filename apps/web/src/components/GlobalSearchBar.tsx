"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  MapPin,
  Scissors,
  Sparkles,
  Navigation,
  Calendar,
  ChevronDown,
} from "lucide-react";
import {
  useGetPublicCategoriesQuery,
  useGetPublicServicesQuery,
  useGetPublicVendorsQuery,
} from "@repo/store/services/api";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@repo/ui/cn";
import { useLoadScript } from "@react-google-maps/api";
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from "@repo/config/config";
import { useSalonFilter } from "./landing/SalonFilterContext";

const GOOGLE_MAPS_LIBRARIES: any = ["places"];

interface GlobalSearchBarProps {
  variant?: "hero" | "compact";
  className?: string;
}

export const GlobalSearchBar = ({
  variant = "hero",
  className,
}: GlobalSearchBarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [serviceInput, setServiceInput] = useState(
    searchParams.get("serviceName") || ""
  );
  // Display label for the location field (neighbourhood / city name shown to user)
  const [locationInput, setLocationInput] = useState(
    searchParams.get("locationLabel") || searchParams.get("city") || ""
  );
  const [dateInput, setDateInput] = useState(
    searchParams.get("date") || ""
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    searchParams.get("categoryIds") || ""
  );

  // ── Resolved coordinates ─────────────────────────────────────────────────────
  const [selectedLat, setSelectedLat] = useState<number | null>(() => {
    const v = searchParams.get("lat");
    return v ? parseFloat(v) : null;
  });
  const [selectedLng, setSelectedLng] = useState<number | null>(() => {
    const v = searchParams.get("lng");
    return v ? parseFloat(v) : null;
  });

  const [isServiceFocused, setIsServiceFocused] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);

  const { data: categoriesData } = useGetPublicCategoriesQuery(undefined);
  const { data: servicesData } = useGetPublicServicesQuery({ limit: 100 });
  const { data: vendorsData } = useGetPublicVendorsQuery({ limit: 100 });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [locationPredictions, setLocationPredictions] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  // ── Service / category suggestions ──────────────────────────────────────────
  const autocompleteResults = useMemo(() => {
    if (!serviceInput)
      return {
        categories: categoriesData?.categories?.slice(0, 10) || [],
        services: servicesData?.services?.slice(0, 20) || [],
        venues: vendorsData?.vendors?.slice(0, 10) || [],
      };

    const term = serviceInput.toLowerCase();
    const categories =
      categoriesData?.categories
        ?.filter((c: any) => c.name.toLowerCase().includes(term))
        .slice(0, 10) || [];
    const services =
      servicesData?.services
        ?.filter((s: any) => s.name.toLowerCase().includes(term))
        .slice(0, 50) || [];
    const venues = 
      vendorsData?.vendors
        ?.filter((v: any) => v.businessName?.toLowerCase().includes(term))
        .slice(0, 10) || [];

    return { categories, services, venues };
  }, [serviceInput, categoriesData, servicesData, vendorsData]);

  // ── Sync state with URL parameters ──────────────────────────────────────────
  useEffect(() => {
    const service = searchParams.get("serviceName") || "";
    const locLabel =
      searchParams.get("locationLabel") || searchParams.get("city") || "";
    const date = searchParams.get("date") || "";
    const latP = searchParams.get("lat");
    const lngP = searchParams.get("lng");

    const categoryId = searchParams.get("categoryIds");
    if (categoryId && categoriesData?.categories) {
      const cat = categoriesData.categories.find(
        (c: any) => c._id === categoryId
      );
      if (cat) {
        setServiceInput(cat.name);
        setSelectedCategoryId(cat._id);
      }
    } else {
      setServiceInput(service);
      setSelectedCategoryId("");
    }

    setLocationInput(locLabel);
    setDateInput(date);
    setSelectedLat(latP ? parseFloat(latP) : null);
    setSelectedLng(lngP ? parseFloat(lngP) : null);
  }, [searchParams, categoriesData]);

  // ── Sync with global context (Requirements 1 & 3) ─────────────────────────
  const { userLat, userLng, locationLabel, setUserLocation, setServiceQuery, setSelectedCity } = useSalonFilter();

  useEffect(() => {
    if (typeof window === 'undefined' || window.location.pathname !== "/salons") return;

    const timer = setTimeout(() => {
      // Update global context for live results
      setServiceQuery(serviceInput);
      
      // If user has manually cleared or changed text, let it filter by city
      if (locationInput && locationInput !== "Current Location" && locationInput !== locationLabel) {
        setSelectedCity(locationInput);
      } else if (!locationInput) {
        // Handle clear
        setSelectedCity("");
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [serviceInput, locationInput, locationLabel, setSelectedCity, setServiceQuery]);

  useEffect(() => {
    if (locationLabel) {
      // Sync the input if it's currently empty, generic or matching what the context just resolved
      if (!locationInput || locationInput === "Current Location") {
        setLocationInput(locationLabel);
      }
    }
  }, [locationLabel]);

  // Sync coords from context auto-detect/profile to local state
  useEffect(() => {
    if (userLat != null && userLng != null && selectedLat === null) {
      setSelectedLat(userLat);
      setSelectedLng(userLng);
    }
  }, [userLat, userLng, selectedLat]);

  // ── Google Places predictions (allow geocode type for neighbourhoods) ────────
  useEffect(() => {
    if (!isLoaded || !locationInput || locationInput === "Current Location") {
      setLocationPredictions([]);
      return;
    }

    const autocompleteService = new google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions(
      {
        input: locationInput,
        types: ["geocode"],
        componentRestrictions: { country: "in" },
      },
      (predictions) => {
        setLocationPredictions(predictions || []);
      }
    );
  }, [locationInput, isLoaded]);

  // ── Geocode a selected prediction ────────────────────────────────────────────
  const handleSelectPrediction = (prediction: any) => {
    setLocationInput(prediction.description);
    setIsLocationFocused(false);

    if (!isLoaded) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { placeId: prediction.place_id },
      (results, status) => {
        if (status === "OK" && results && results[0]) {
          const loc = results[0].geometry.location;
          const lat = loc.lat();
          const lng = loc.lng();
          const cityLabel = prediction.description.split(",")[0].trim();
          
          setSelectedLat(lat);
          setSelectedLng(lng);
          // Update global context
          setUserLocation(lat, lng, cityLabel);
          
          // Update URL if on salons page to ensure components re-fetch with new state
          if (typeof window !== 'undefined' && window.location.pathname === "/salons") {
            const params = new URLSearchParams(window.location.search);
            params.set("lat", lat.toString());
            params.set("lng", lng.toString());
            params.set("locationLabel", cityLabel);
            params.set("city", cityLabel); // For fallback
            router.push(`/salons?${params.toString()}`);
          }
        }
      }
    );
  };

  // ── Browser geolocation ──────────────────────────────────────────────────────
  const handleCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLat(latitude);
          setSelectedLng(longitude);
          setLocationInput("Current Location");
          setIsLocating(false);
        },
        () => setIsLocating(false)
      );
    } else {
      setIsLocating(false);
    }
  };

  // ── Build search URL with lat/lng ────────────────────────────────────────────
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (serviceInput) params.append("serviceName", serviceInput);
    if (selectedCategoryId) params.append("categoryIds", selectedCategoryId);

    if (selectedLat != null && selectedLng != null) {
      params.append("lat", selectedLat.toString());
      params.append("lng", selectedLng.toString());
      if (locationInput && locationInput !== "Current Location") {
        params.append("locationLabel", locationInput.split(",")[0].trim());
      }
    } else if (locationInput && locationInput !== "Current Location") {
      // Fallback: text-based city search (legacy)
      const cityPart = locationInput.split(",")[0].trim();
      params.append("city", cityPart);
    }

    if (dateInput) params.append("date", dateInput);
    router.push(`/search?${params.toString()}`);
  };

  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "w-full max-w-5xl mx-auto z-[100]",
        isHero ? "animate-slide-up" : "",
        className
      )}
    >
      <div
        className={cn(
          "bg-white rounded-3xl shadow-2xl p-1.5 md:p-2 flex flex-col md:flex-row items-stretch md:items-center gap-1 border border-gray-100",
          !isHero && "md:rounded-[30px] shadow-lg"
        )}
      >
        {/* ── Service Field ─────────────────────────────────────────────────── */}
        <div
          className={cn(
            "flex-[1.5] relative flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300",
            isServiceFocused
              ? "bg-gray-50 ring-2 ring-primary/5"
              : "hover:bg-gray-50"
          )}
        >
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <div className="flex flex-col flex-1">
            <input
              type="text"
              placeholder="Services, salons or categories"
              value={serviceInput}
              onChange={(e) => setServiceInput(e.target.value)}
              onFocus={() => setIsServiceFocused(true)}
              onBlur={() =>
                setTimeout(() => setIsServiceFocused(false), 200)
              }
              className="w-full bg-transparent outline-none text-gray-900 font-bold text-sm md:text-base placeholder:text-gray-400 placeholder:font-medium"
            />
          </div>

          {/* Combined Autocomplete Dropdown */}
          {isServiceFocused && (
            <div className="absolute top-[calc(100%+10px)] left-0 w-full md:w-[450px] bg-white rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.15)] border border-gray-100 p-3 z-[1000] overflow-y-auto max-h-64 no-scrollbar backdrop-blur-xl">
              {autocompleteResults.categories.length > 0 && (
                <div className="mb-4">
                  <div className="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-1">
                    Categories
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {autocompleteResults.categories.map((cat: any) => (
                      <button
                        key={cat._id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setServiceInput(cat.name);
                          setSelectedCategoryId(cat._id);
                          setIsServiceFocused(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-primary/5 rounded-2xl flex items-center gap-3 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-bold text-gray-800 text-sm">
                          {cat.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {autocompleteResults.services.length > 0 && (
                <div>
                  <div className="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-1">
                    Services
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {autocompleteResults.services.map((svc: any) => (
                      <button
                        key={svc._id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setServiceInput(svc.name);
                          setSelectedCategoryId("");
                          setIsServiceFocused(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-2xl flex items-center gap-3 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Scissors className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-sm">
                            {svc.name}
                          </span>
                          {svc.category && (
                            <span className="text-[10px] text-gray-400 font-bold uppercase">
                              {svc.category.name || "Service"}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {autocompleteResults.venues.length > 0 && (
                <div className="mb-4">
                  <div className="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-1">
                    Salons
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {autocompleteResults.venues.map((vendor: any) => (
                      <button
                        key={vendor._id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setServiceInput(vendor.businessName);
                          setSelectedCategoryId("");
                          setIsServiceFocused(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-2xl flex items-center gap-3 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                          {vendor.profileImage ? (
                            <img src={vendor.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <MapPin className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-sm">
                            {vendor.businessName}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">
                            {vendor.city}, {vendor.state}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {autocompleteResults.categories.length === 0 &&
                autocompleteResults.services.length === 0 &&
                autocompleteResults.venues.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">
                      No results found for "{serviceInput}"
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>

        <div className="hidden md:block w-px h-8 bg-gray-100 mx-1"></div>

        {/* ── Location Field ────────────────────────────────────────────────── */}
        <div
          className={cn(
            "flex-1 relative flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300",
            isLocationFocused
              ? "bg-gray-50 ring-2 ring-primary/5"
              : "hover:bg-gray-50"
          )}
        >
          {selectedLat != null ? (
            <div className="relative shrink-0">
              <MapPin className="w-4 h-4 text-green-500 shrink-0" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
            </div>
          ) : (
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
          )}
          <input
            type="text"
            placeholder="Neighbourhood, city or area…"
            value={locationInput}
            onChange={(e) => {
              setLocationInput(e.target.value);
              // Clear resolved coords if user is editing
              setSelectedLat(null);
              setSelectedLng(null);
            }}
            onFocus={() => setIsLocationFocused(true)}
            onBlur={() =>
              setTimeout(() => setIsLocationFocused(false), 200)
            }
            className="w-full bg-transparent outline-none text-gray-900 font-bold text-sm placeholder:text-gray-400 placeholder:font-medium"
          />
          <button
            onClick={handleCurrentLocation}
            className={cn(
              "p-1.5 hover:bg-primary/10 rounded-full transition-colors group",
              isLocating && "animate-pulse"
            )}
            title="Use current location"
          >
            <Navigation className="w-3.5 h-3.5 text-primary opacity-50 group-hover:opacity-100" />
          </button>

          {/* Location Dropdown */}
          {isLocationFocused &&
            (locationPredictions.length > 0 || !locationInput) && (
              <div className="absolute top-[calc(100%+10px)] left-0 w-full md:w-[380px] bg-white rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.15)] border border-gray-100 p-3 z-[1000] overflow-y-auto max-h-64 no-scrollbar backdrop-blur-xl">
                <div className="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-1">
                  Locations
                </div>

                {!locationInput && (
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleCurrentLocation();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-primary/5 rounded-2xl flex items-center gap-3 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Navigation className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 text-sm">
                        {isLocating ? "Locating…" : "Current Location"}
                      </span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase">
                        Detect my area
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
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-2xl flex items-center gap-3 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MapPin className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-gray-800 text-sm truncate">
                        {prediction.structured_formatting?.main_text ||
                          prediction.description}
                      </span>
                      <span className="text-[9px] text-gray-400 truncate">
                        {prediction.structured_formatting?.secondary_text ||
                          ""}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
        </div>

        {/* ── Search Button ─────────────────────────────────────────────────── */}
        <button
          onClick={handleSearch}
          className={cn(
            "bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group",
            isHero
              ? "px-10 py-4 rounded-[20px] ml-2"
              : "px-8 py-3 rounded-[15px] ml-1"
          )}
        >
          {isHero ? "Search" : ""}
          <Search
            className={cn(
              "w-4 h-4",
              isHero && "group-hover:translate-x-1 transition-transform"
            )}
          />
        </button>
      </div>
    </div>
  );
};
