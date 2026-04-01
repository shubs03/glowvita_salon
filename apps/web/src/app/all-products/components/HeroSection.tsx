import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Sparkles, Navigation, Package, Scissors } from 'lucide-react';
import { 
  useGetPublicProductsQuery, 
  useGetAdminProductCategoriesQuery 
} from '@repo/store/api';
import { useRouter } from "next/navigation";
import { useLoadScript } from "@react-google-maps/api";
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from "@repo/config/config";
import { useSalonFilter } from "@/components/landing/SalonFilterContext";
import { cn } from "@repo/ui/cn";

const GOOGLE_MAPS_LIBRARIES: any = ["places"];

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

const HeroSection = ({ onSearch }: HeroSectionProps) => {
  const router = useRouter();
  const [productInput, setProductInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [isProductFocused, setIsProductFocused] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { setUserLocation, userLat, userLng, locationLabel } = useSalonFilter();

  // Locally resolved coords for the current typed/selected location
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);

  // Fetch product data to show stats - pass location to make stats context-aware
  const { data: productsApiData, isLoading } = useGetPublicProductsQuery({
    lat: selectedLat || userLat || undefined,
    lng: selectedLng || userLng || undefined,
  });
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAdminProductCategoriesQuery(undefined);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [locationPredictions, setLocationPredictions] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  // Sync with global context
  useEffect(() => {
    if (locationLabel) {
      if (!locationInput || locationInput === "Current Location") {
        setLocationInput(locationLabel);
      }
    }
  }, [locationLabel]);

  useEffect(() => {
    if (userLat != null && userLng != null && selectedLat === null) {
      setSelectedLat(userLat);
      setSelectedLng(userLng);
    }
  }, [userLat, userLng]);

  // Google Places autocomplete
  useEffect(() => {
    if (!isLoaded || !locationInput || locationInput === "Current Location") {
      setLocationPredictions([]);
      return;
    }

    const svc = new google.maps.places.AutocompleteService();
    svc.getPlacePredictions(
      {
        input: locationInput,
        types: ["geocode"],
        componentRestrictions: { country: "in" },
      },
      (predictions) => setLocationPredictions(predictions || [])
    );
  }, [locationInput, isLoaded]);

  const handleLocationInputChange = (value: string) => {
    setLocationInput(value);
    setSelectedLat(null);
    setSelectedLng(null);
  };

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
        setUserLocation(lat, lng, label);
      }
    });
  };

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
        setUserLocation(latitude, longitude, "Current Location");
      },
      () => setIsLocating(false)
    );
  };

  const handleSearchClick = async () => {
    setIsSearching(true);
    const params = new URLSearchParams();

    if (productInput) params.append("productName", productInput);
    
    let finalLat = selectedLat;
    let finalLng = selectedLng;

    if (finalLat != null && finalLng != null) {
      params.append("lat", finalLat.toString());
      params.append("lng", finalLng.toString());
      if (locationInput && locationInput !== "Current Location") {
        params.append("locationLabel", locationInput.split(",")[0].trim());
      }
    } else if (locationInput && locationInput !== "Current Location") {
      params.append("city", locationInput.split(",")[0].trim());
    }

    setIsSearching(false);
    router.push(`/search?tab=products&${params.toString()}`);
  };

  // Calculate stats
  const products = productsApiData?.products || [];
  const uniqueVendors = products.length > 0 ? new Set(products.map((p: any) => p.vendorId)).size : 0;
  const totalProducts = products.length;
  const averageRating = (products.length > 0)
    ? (products.reduce((acc: any, p: any) => acc + (p.rating || 0), 0) / products.length).toFixed(1)
    : "0.0";

  const marqueeCategories = useMemo(() => {
    // Determine the array of categories based on response structure
    const categoriesArray = Array.isArray(categoriesData) 
      ? categoriesData 
      : categoriesData?.data && Array.isArray(categoriesData.data)
        ? categoriesData.data
        : [];

    return categoriesArray.map((category: any) => ({
      id: category._id || category.id,
      label: category.name,
      icon: Package
    }));
  }, [categoriesData]);

  return (
    <section className="relative w-full min-h-[500px] h-auto lg:h-[700px] overflow-hidden bg-background">
      {/* Background Image with Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(45, 28, 48, 0.85), rgba(45, 28, 48, 0.4)), url('https://images.unsplash.com/photo-1512496011951-408a2fe6480c?w=1200')`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center max-w-7xl py-12 md:py-20 lg:py-0">
        {/* Logo/Brand Name */}
        <div className="mb-4 md:mb-8">
          <h3 className="text-amber-100 text-xs sm:text-sm font-light tracking-[0.2em] sm:tracking-[0.3em] uppercase">
            GLOWVITA SHOP
          </h3>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-amber-50 mb-4 md:mb-6 max-w-3xl leading-tight">
          Choose the Best<br />for Your Routine
        </h1>

        {/* Description */}
        <p className="text-gray-200 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed mb-8 md:mb-10">
          Explore high-quality beauty products crafted to elevate your daily self-care with trusted formulas and reliable performance.
        </p>

        {/* ── Search Bar ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl md:rounded-full shadow-2xl p-3 md:p-2 flex flex-col md:flex-row items-stretch md:items-center gap-3 max-w-4xl mb-6 md:mb-8">
          
          {/* Product Input */}
          <div className="relative flex-1 flex items-center gap-3 px-4 md:border-r border-gray-200 py-2 md:py-0">
            <div className="flex flex-col flex-1">
              {!productInput && (
                <label className="text-primary text-xs font-medium mb-1">
                  Product Name
                </label>
              )}
              <input
                type="text"
                placeholder="What are you looking for?"
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                onFocus={() => setIsProductFocused(true)}
                onBlur={() => setTimeout(() => setIsProductFocused(false), 200)}
                className="outline-none text-gray-800 placeholder-gray-400 text-sm w-full bg-transparent"
              />
            </div>
            <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>

          {/* Location Input */}
          <div className="relative flex-1 flex items-center gap-3 px-4 py-2 md:py-0">
            <div className="flex flex-col flex-1">
              {!locationInput && (
                <label className="text-primary text-xs font-medium mb-1">
                  Location
                </label>
              )}
              <input
                type="text"
                placeholder="Neighbourhood, city or area…"
                value={locationInput}
                onChange={(e) => handleLocationInputChange(e.target.value)}
                onFocus={() => setIsLocationFocused(true)}
                onBlur={() => setTimeout(() => setIsLocationFocused(false), 200)}
                className="outline-none text-gray-800 placeholder-gray-400 text-sm w-full bg-transparent"
              />
            </div>

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
                        Instant Locate
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
            onClick={handleSearchClick}
            disabled={isSearching}
            className="bg-primary text-white px-6 sm:px-8 py-3 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:bg-primary/90 w-full md:w-auto disabled:opacity-70"
          >
            {isSearching ? "Searching…" : "Search"}
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Product Categories Marquee */}
        <div className="max-w-4xl overflow-hidden relative mb-12">
          <div className="rounded-full absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[rgba(45,28,48,0.95)] via-[rgba(45,28,48,0.7)] to-transparent z-10 pointer-events-none"></div>
          <div className="flex gap-3 animate-marquee hover:[animation-play-state:paused]">
            {categoriesLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white bg-opacity-10 backdrop-blur-sm border border-white/20 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-full flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 animate-pulse">
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gray-300 rounded-full" />
                  <div className="h-3.5 sm:h-4 bg-gray-300 rounded w-12 sm:w-16" />
                </div>
              ))
              : [...marqueeCategories, ...marqueeCategories].map((cat: any, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setProductInput(cat.label);
                  }}
                  className="bg-white bg-opacity-10 backdrop-blur-sm hover:border-white hover:bg-opacity-20 border border-white/20 text-white px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0"
                >
                  <cat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {cat.label}
                </button>
              ))}
          </div>
          <div className="rounded-full absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[rgba(45,28,48,0.95)] via-[rgba(45,28,48,0.7)] to-transparent z-10 pointer-events-none"></div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-4xl">
          <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 transition-colors hover:bg-white/10">
            <p className="text-xl sm:text-2xl font-bold text-amber-50">
              {isLoading ? "..." : uniqueVendors > 0 ? `${uniqueVendors}+` : "0"}
            </p>
            <p className="text-[10px] sm:text-xs md:text-sm text-amber-100/60 uppercase tracking-wider mt-1">Vendors</p>
          </div>
          <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 transition-colors hover:bg-white/10">
            <p className="text-xl sm:text-2xl font-bold text-amber-50">
              {isLoading ? "..." : totalProducts > 0 ? `${totalProducts.toLocaleString()}+` : "0"}
            </p>
            <p className="text-[10px] sm:text-xs md:text-sm text-amber-100/60 uppercase tracking-wider mt-1">Products</p>
          </div>
          <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 transition-colors hover:bg-white/10">
            <p className="text-xl sm:text-2xl font-bold text-amber-50">
              {isLoading ? "..." : averageRating}/5
            </p>
            <p className="text-[10px] sm:text-xs md:text-sm text-amber-100/60 uppercase tracking-wider mt-1">Avg Rating</p>
          </div>
          <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 transition-colors hover:bg-white/10">
            <p className="text-xl sm:text-2xl font-bold text-amber-50">Secure</p>
            <p className="text-[10px] sm:text-xs md:text-sm text-amber-100/60 uppercase tracking-wider mt-1">Guarantee</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;