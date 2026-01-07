import React, { useState, useMemo } from "react";
import {
  Scissors,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react";
import { 
  useGetPublicCategoriesQuery,
  useGetPublicServicesQuery 
} from "@repo/store/services/api";
import { useRouter } from "next/navigation";
import { cn } from "@repo/ui/cn";

const HeroSection2 = () => {
  const router = useRouter();
  const [serviceInput, setServiceInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [isServiceFocused, setIsServiceFocused] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);

  const { data: categoriesData, isLoading: categoriesLoading } = useGetPublicCategoriesQuery(undefined);
  const { data: servicesData } = useGetPublicServicesQuery({});

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

  // Static location suggestions
  const staticLocations = [
    "Current Location",
    "New York, NY",
    "Los Angeles, CA",
    "Chicago, IL",
    "Houston, TX",
    "Miami, FL",
    "San Francisco, CA",
    "London, UK",
    "Paris, France",
  ];

  const displayedLocations = useMemo(() => {
    if (!locationInput) return staticLocations.slice(0, 6);
    return staticLocations
      .filter(loc => loc.toLowerCase().includes(locationInput.toLowerCase()))
      .slice(0, 6);
  }, [locationInput]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (serviceInput) params.append("serviceName", serviceInput);
    
    if (locationInput && locationInput !== "Current Location") {
      // Split by comma and trim to get just the city part for the backend query
      const cityPart = locationInput.split(',')[0].trim();
      params.append("city", cityPart);
    }
    
    if (dateInput) params.append("date", dateInput);
    router.push(`/search?${params.toString()}`);
  };

  const handleSuggestionSelection = (item: any) => {
    const params = new URLSearchParams();
    if (item.type === "category") {
      params.append("categoryIds", item._id);
    } else {
      params.append("serviceName", item.name);
    }
    
    if (locationInput && locationInput !== "Current Location") {
      const cityPart = locationInput.split(',')[0].trim();
      params.append("city", cityPart);
    }
    router.push(`/search?${params.toString()}`);
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
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#2D1C30]">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(45, 28, 48, 0.6), rgba(45, 28, 48, 0.85)), url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2000')`,
        }}
      />

      {/* Glow Effects */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-purple-500/25 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-[180px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-2000 -translate-x-1/2 -translate-y-1/2" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl px-4 sm:px-8 text-center">
        <div className="mb-12">
          <h2 className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-amber-300 mb-4">
            Discover Your Perfect Glow
          </h2>
          <p className="text-gray-100 text-xl sm:text-2xl max-w-2xl mx-auto font-light">
            Unlock premium self-care: Find top-rated salons and specialists nearby, tailored for your ultimate beauty experience.
          </p>
        </div>

        {/* Search Bar - Your Preferred UI */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white rounded-full shadow-2xl p-3 flex flex-col sm:flex-row items-center gap-3 sm:gap-0">
            
            {/* Treatment / Venue */}
            <div className="relative flex-1 w-full flex items-center px-4 sm:px-6 py-3 hover:bg-gray-50/50 transition-all rounded-full">
              <Scissors className="w-5 h-5 text-gray-500 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Treatment or venue"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onFocus={() => setIsServiceFocused(true)}
                onBlur={() => setTimeout(() => setIsServiceFocused(false), 200)}
                className="w-full bg-transparent outline-none text-base font-medium text-gray-900 placeholder:text-gray-500"
              />

              {/* Fixed & Reliable Dropdown */}
              {isServiceFocused && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-auto w-[300px] sm:w-[400px] mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-60 overflow-y-auto no-scrollbar">
                  <div className="px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50 sticky top-0 backdrop-blur-sm">
                    Suggestions
                  </div>
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

            {/* Dividers */}
            <div className="hidden sm:block w-px h-10 bg-gray-200 mx-2" />
            <div className="hidden sm:block w-px h-10 bg-gray-200 mx-2" />

            {/* Location */}
            <div className="relative flex-1 w-full flex items-center px-4 sm:px-6 py-3 hover:bg-gray-50/50 transition-all rounded-full">
              <MapPin className="w-5 h-5 text-gray-500 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Location"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onFocus={() => setIsLocationFocused(true)}
                onBlur={() => setTimeout(() => setIsLocationFocused(false), 200)}
                className="w-full bg-transparent outline-none text-base font-medium text-gray-900 placeholder:text-gray-500"
              />

              {isLocationFocused && displayedLocations.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-60 overflow-y-auto no-scrollbar">
                  <div className="px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50 sticky top-0 backdrop-blur-sm">
                    Locations
                  </div>
                  {displayedLocations.map((loc, i) => (
                    <button
                      key={i}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setLocationInput(loc);
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-amber-50 flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-amber-100 transition-colors flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-gray-400 group-hover:text-amber-600" />
                      </div>
                      <span className="text-gray-800 font-bold text-sm tracking-tight">{loc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Time */}
            <div className="flex-1 w-full flex items-center px-4 sm:px-6 py-3 hover:bg-gray-50/50 transition-all rounded-full">
              <Calendar className="w-5 h-5 text-gray-500 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Time"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                onFocus={(e) => (e.target.type = "datetime-local")}
                onBlur={(e) => !e.target.value && (e.target.type = "text")}
                className="w-full bg-transparent outline-none text-base font-medium text-gray-900 placeholder:text-gray-500"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-3 rounded-full font-semibold text-base transition-all shadow-md hover:shadow-amber-400/40 active:scale-95 mx-2 sm:mx-0 hover:scale-105"
            >
              Search
            </button>
          </div>
        </div>

        {/* Marquee Categories */}
        <div className="mt-16 w-full max-w-4xl mx-auto overflow-hidden">
          <div className="flex gap-4 animate-marquee whitespace-nowrap py-4">
            {categoriesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-40 h-12 bg-white/10 rounded-full animate-pulse" />
              ))
            ) : (
              [...marqueeCategories, ...marqueeCategories].map((cat: any, i) => (
                <button
                  key={i}
                  onClick={() => router.push(`/search?categoryIds=${cat.id}`)}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white font-medium transition-all hover:scale-105"
                >
                  <cat.icon className="w-5 h-5 text-amber-200" />
                  {cat.label}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection2;