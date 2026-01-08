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
  useGetPublicServicesQuery 
} from "@repo/store/services/api";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@repo/ui/cn";
import { useLoadScript } from "@react-google-maps/api";
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from "@repo/config/config";

const GOOGLE_MAPS_LIBRARIES: any = ["places"];

interface GlobalSearchBarProps {
  variant?: "hero" | "compact";
  className?: string;
}

export const GlobalSearchBar = ({ variant = "hero", className }: GlobalSearchBarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [serviceInput, setServiceInput] = useState(searchParams.get("serviceName") || "");
  const [locationInput, setLocationInput] = useState(searchParams.get("city") || "");
  const [dateInput, setDateInput] = useState(searchParams.get("date") || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState(searchParams.get("categoryIds") || "");
  
  const [isServiceFocused, setIsServiceFocused] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  
  const { data: categoriesData } = useGetPublicCategoriesQuery(undefined);
  const { data: servicesData } = useGetPublicServicesQuery({});

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [locationPredictions, setLocationPredictions] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  const autocompleteResults = useMemo(() => {
    if (!serviceInput) return { categories: categoriesData?.categories?.slice(0, 3) || [], services: servicesData?.services?.slice(0, 5) || [] };
    
    const term = serviceInput.toLowerCase();
    
    const categories = categoriesData?.categories?.filter((c: any) => 
      c.name.toLowerCase().includes(term)
    ).slice(0, 3) || [];

    const services = servicesData?.services?.filter((s: any) =>
      s.name.toLowerCase().includes(term)
    ).slice(0, 8) || [];

    return { categories, services };
  }, [serviceInput, categoriesData, servicesData]);

  // Sync state with URL parameters
  useEffect(() => {
    const service = searchParams.get("serviceName") || "";
    const location = searchParams.get("city") || "";
    const date = searchParams.get("date") || "";

    // Check if we have categoryIds and find the category name if possible
    const categoryId = searchParams.get("categoryIds");
    if (categoryId && categoriesData?.categories) {
      const cat = categoriesData.categories.find((c: any) => c._id === categoryId);
      if (cat) {
        setServiceInput(cat.name);
        setSelectedCategoryId(cat._id);
      }
    } else {
      setServiceInput(service);
      setSelectedCategoryId("");
    }

    setLocationInput(location);
    setDateInput(date);
  }, [searchParams, categoriesData]);

  // Dynamic location suggestions using Google Places
  useEffect(() => {
    if (!isLoaded || !locationInput || locationInput === "Current Location") {
      setLocationPredictions([]);
      return;
    }

    const autocompleteService = new google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions(
      { input: locationInput, types: ["(cities)"] },
      (predictions) => {
        setLocationPredictions(predictions || []);
      }
    );
  }, [locationInput, isLoaded]);

  const handleCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            if (status === "OK" && results?.[0]) {
              const cityComponent = results[0].address_components.find(
                (c) => c.types.includes("locality") || c.types.includes("administrative_area_level_2")
              );
              if (cityComponent) {
                setLocationInput(cityComponent.long_name);
              }
            }
            setIsLocating(false);
          });
        },
        () => setIsLocating(false)
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (serviceInput) params.append("serviceName", serviceInput);
    if (selectedCategoryId) params.append("categoryIds", selectedCategoryId);

    if (locationInput && locationInput !== "Current Location") {
      // Split by comma and trim to get just the city part
      const cityPart = locationInput.split(',')[0].trim();
      params.append("city", cityPart);
    }

    if (dateInput) params.append("date", dateInput);

    router.push(`/search?${params.toString()}`);
  };

  const isHero = variant === "hero";

  return (
    <div className={cn(
      "w-full max-w-5xl mx-auto z-[100]",
      isHero ? "animate-slide-up" : "",
      className
    )}>
      <div className={cn(
        "bg-white rounded-3xl shadow-2xl p-1.5 md:p-2 flex flex-col md:flex-row items-stretch md:items-center gap-1 border border-gray-100",
        !isHero && "md:rounded-[30px] shadow-lg"
      )}>

        {/* Service Field */}
        <div className={cn(
          "flex-[1.5] relative flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300",
          isServiceFocused ? "bg-gray-50 ring-2 ring-primary/5" : "hover:bg-gray-50"
        )}>
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <div className="flex flex-col flex-1">
            <input
              type="text"
              placeholder="Services, salons or categories"
              value={serviceInput}
              onChange={(e) => setServiceInput(e.target.value)}
              onFocus={() => setIsServiceFocused(true)}
              onBlur={() => setTimeout(() => setIsServiceFocused(false), 200)}
              className="w-full bg-transparent outline-none text-gray-900 font-bold text-sm md:text-base placeholder:text-gray-400 placeholder:font-medium"
            />
          </div>

          {/* Combined Autocomplete Dropdown */}
          {isServiceFocused && (
            <div className="absolute top-[calc(100%+10px)] left-0 w-full md:w-[450px] bg-white rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.15)] border border-gray-100 p-3 z-[1000] overflow-y-auto max-h-64 no-scrollbar backdrop-blur-xl">
              {autocompleteResults.categories.length > 0 && (
                <div className="mb-4">
                  <div className="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-1">Categories</div>
                  <div className="grid grid-cols-1 gap-1">
                    {autocompleteResults.categories.map((cat: any) => (
                       <button
                        key={cat._id}
                        onClick={() => {
                          setServiceInput(cat.name);
                          setSelectedCategoryId(cat._id);
                          setIsServiceFocused(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-primary/5 rounded-2xl flex items-center gap-3 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-bold text-gray-800 text-sm">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {autocompleteResults.services.length > 0 && (
                <div>
                  <div className="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-1">Services</div>
                  <div className="grid grid-cols-1 gap-1">
                    {autocompleteResults.services.map((svc: any) => (
                       <button
                        key={svc._id}
                        onClick={() => {
                          setServiceInput(svc.name);
                          setSelectedCategoryId(""); // Clear category if specific service picked
                          setIsServiceFocused(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-2xl flex items-center gap-3 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Scissors className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-sm">{svc.name}</span>
                          {svc.category && (
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{svc.category.name || "Service"}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {autocompleteResults.categories.length === 0 && autocompleteResults.services.length === 0 && (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No results found for "{serviceInput}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hidden md:block w-px h-8 bg-gray-100 mx-1"></div>

        {/* Location Field */}
        <div className={cn(
          "flex-1 relative flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300",
          isLocationFocused ? "bg-gray-50 ring-2 ring-primary/5" : "hover:bg-gray-50"
        )}>
          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Where"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onFocus={() => setIsLocationFocused(true)}
            onBlur={() => setTimeout(() => setIsLocationFocused(false), 200)}
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
          {isLocationFocused && (locationPredictions.length > 0 || !locationInput) && (
            <div className="absolute top-[calc(100%+10px)] left-0 w-full md:w-[350px] bg-white rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.15)] border border-gray-100 p-3 z-[1000] overflow-y-auto max-h-64 no-scrollbar backdrop-blur-xl">
              <div className="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-1">Locations</div>
              
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
                    <span className="font-bold text-gray-800 text-sm">{isLocating ? "Locating..." : "Current Location"}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">Detect my city</span>
                  </div>
                </button>
              )}

              {locationPredictions.map((prediction, i) => (
                <button
                  key={i}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setLocationInput(prediction.description);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-2xl flex items-center gap-3 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="font-bold text-gray-800 text-sm">{prediction.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hidden md:block w-px h-8 bg-gray-100 mx-1"></div>

        {/* Date Field */}
        <div className="flex-1 flex items-center gap-3 px-5 py-3 rounded-2xl hover:bg-gray-50 transition-colors">
          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="When"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            onFocus={(e) => e.target.type = 'date'}
            onBlur={(e) => e.target.type = 'text'}
            className="w-full bg-transparent outline-none text-gray-900 font-bold text-sm placeholder:text-gray-400 placeholder:font-medium"
          />
        </div>

        {/* Search Button */}
        <button 
          onClick={handleSearch}
          className={cn(
            "bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group",
            isHero ? "px-10 py-4 rounded-[20px] ml-2" : "px-8 py-3 rounded-[15px] ml-1"
          )}
        >
          {isHero ? "Search" : ""}
          <Search className={cn("w-4 h-4", isHero && "group-hover:translate-x-1 transition-transform")} />
        </button>
      </div>
    </div>
  );
};
