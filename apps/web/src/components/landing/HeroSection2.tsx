import React, { useState, useMemo, useEffect } from "react";
import {
  Scissors,
  MapPin,
  Calendar,
  Sparkles,
  Navigation,
} from "lucide-react";
import { 
  useGetPublicCategoriesQuery,
  useGetPublicServicesQuery 
} from "@repo/store/services/api";
import { useRouter } from "next/navigation";
import { cn } from "@repo/ui/cn";
import { useLoadScript } from "@react-google-maps/api";
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from "@repo/config/config";

const GOOGLE_MAPS_LIBRARIES: any = ["places"];

const HeroSection2 = () => {
  const router = useRouter();
  const [serviceInput, setServiceInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isServiceFocused, setIsServiceFocused] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);

  const { data: categoriesData, isLoading: categoriesLoading } = useGetPublicCategoriesQuery(undefined);
  const { data: servicesData } = useGetPublicServicesQuery({});

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [locationPredictions, setLocationPredictions] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  // Merged autocomplete logic: categories + services
  const suggestions = useMemo(() => {
    const input = serviceInput.toLowerCase();
    const results = [];

    // Categories
    if (categoriesData?.categories) {
      const cats = categoriesData.categories
        .filter((c: any) => c.name.toLowerCase().includes(input))
        .slice(0, 3);
      results.push(...cats.map((c: any) => ({ ...c, type: "category" })));
    }

    // Services
    if (servicesData?.services) {
      const svcs = servicesData.services
        .filter((s: any) => s.name.toLowerCase().includes(input))
        .slice(0, 6);
      results.push(...svcs.map((s: any) => ({ ...s, type: "service" })));
    }

    return results;
  }, [serviceInput, categoriesData, servicesData]);

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
      // Split by comma and trim to get just the city part for the backend query
      const cityPart = locationInput.split(',')[0].trim();
      params.append("city", cityPart);
    }
    
    if (dateInput) params.append("date", dateInput);
    router.push(`/search?${params.toString()}`);
  };

  const handleSuggestionSelection = (item: any) => {
    if (item.type === "category") {
      setSelectedCategoryId(item._id);
      setServiceInput(item.name);
    } else {
      setServiceInput(item.name);
      setSelectedCategoryId(""); // Clear category if a specific service is picked
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
        if (name.includes(key)) {
          icon = Icon;
          break;
        }
      }
      return { id: category._id, icon, label: category.name };
    });
  }, [categoriesData]);

  return (
    <div className="relative w-full h-[615px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(45, 28, 48, 0.85), rgba(45, 28, 48, 0.4)), url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200')`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8 h-full flex flex-col justify-center max-w-7xl">
        {/* Logo */}
        <div className="mb-8">
          <h3 className="text-amber-100 text-sm font-light tracking-[0.3em] uppercase">
            GLOWVITA
          </h3>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-amber-50 mb-6 max-w-2xl leading-tight">
          Find a service
          <br />
          close to you
        </h1>

        {/* Subheading */}
        <p className="text-gray-200 text-base md:text-lg mb-10 max-w-xl leading-relaxed">
          Experience convenience by discovering salons and specialists in your
          area, ready to provide excellent self-care services.
        </p>

        {/* Search Bar */}
        <div className="bg-white rounded-full shadow-2xl p-2 flex items-center gap-3 max-w-4xl mb-8">
          {/* Service Name Input */}
          <div className="relative flex-1 flex items-center gap-3 px-4 border-r border-gray-200">
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
                className="outline-none text-gray-800 placeholder-gray-400 text-sm"
              />
            </div>
            <Scissors className="w-4 h-4 text-gray-400" />

            {/* Fixed & Reliable Dropdown */}
            {isServiceFocused && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-auto w-[300px] sm:w-[400px] mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-60 overflow-y-auto no-scrollbar">
                  {/* <div className="px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50 sticky top-0 backdrop-blur-sm">
                    Suggestions
                  </div> */}
                  {suggestions.map((item: any) => (
                    <button
                      key={item._id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionSelection(item);
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-amber-50 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                          item.type === 'category' ? "bg-purple-100/50" : "bg-amber-100/50"
                        )}>
                          {item.type === 'category' ? (
                            <Sparkles className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Scissors className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-bold text-sm tracking-tight">{item.name}</span>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            {item.type}
                          </span>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <Sparkles className="w-3 h-3 text-amber-400" />
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Address Input */}
          <div className="relative flex-1 flex items-center gap-3 px-4">
            <div className="flex flex-col flex-1">
              {!locationInput && (
                <label className="text-primary text-xs font-medium mb-1">
                  Address
                </label>
              )}
              <input
                type="text"
                placeholder="Where"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onFocus={() => setIsLocationFocused(true)}
                onBlur={() => setTimeout(() => setIsLocationFocused(false), 200)}
                className="outline-none text-gray-800 placeholder-gray-400 text-sm"
              />
            </div>
            <MapPin className="w-4 h-4 text-gray-400" />

            {isLocationFocused && (locationPredictions.length > 0 || !locationInput) && (
              <div className="absolute top-full left-0 right-auto w-[200px] sm:w-[350px] mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-60 overflow-y-auto no-scrollbar">
                  {/* <div className="px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50 sticky top-0 backdrop-blur-sm">
                    Locations
                  </div> */}
                  
                  {/* Current Location Option */}
                  {!locationInput && (
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleCurrentLocation();
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-amber-50 flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-100 group-hover:bg-amber-200 transition-colors flex items-center justify-center">
                        <Navigation className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-bold text-sm tracking-tight">
                          {isLocating ? "Locating..." : "Use Current Location"}
                        </span>
                        <span className="text-[9px] text-gray-400 font-black uppercase">Instant Search</span>
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
                      className="w-full text-left px-5 py-3 hover:bg-amber-50 flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-amber-100 transition-colors flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-gray-400 group-hover:text-amber-600" />
                      </div>
                      <span className="text-gray-800 font-bold text-sm tracking-tight">{prediction.description}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="bg-primary text-white px-8 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:bg-primary/90"
          >
            Search
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* Service Categories Marquee */}
        <div className="max-w-4xl overflow-hidden relative">
          {/* Left Fade */}
          <div className="rounded-full absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[rgba(45,28,48,0.95)] via-[rgba(45,28,48,0.7)] to-transparent z-10 pointer-events-none"></div>

          {/* Marquee */}
          <div className="flex gap-3 animate-marquee hover:[animation-play-state:paused]">
            {categoriesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white bg-opacity-10 backdrop-blur-sm border border-purple-950 border-opacity-30 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap flex-shrink-0 animate-pulse"
                >
                  <div className="w-4 h-4 bg-gray-300 rounded-full" />
                  <div className="h-4 bg-gray-300 rounded w-16" />
                </div>
              ))
            ) : (
              [...marqueeCategories, ...marqueeCategories].map((cat: any, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setServiceInput(cat.label);
                  }}
                  className="bg-white bg-opacity-10 backdrop-blur-sm hover:border-white hover:bg-opacity-20 border border-purple-950 border-opacity-30 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))
            )}
          </div>

          {/* Right Fade */}
          <div className="rounded-full absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[rgba(45,28,48,0.95)] via-[rgba(45,28,48,0.7)] to-transparent z-10 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection2;