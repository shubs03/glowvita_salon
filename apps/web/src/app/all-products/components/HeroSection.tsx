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
  const ratedProducts = products.filter((p: any) => Number(p.rating) > 0);
  const averageRating = ratedProducts.length > 0
    ? (ratedProducts.reduce((acc: any, p: any) => acc + Number(p.rating), 0) / ratedProducts.length).toFixed(1)
    : "0";

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
    <section className="relative w-full min-h-[420px] sm:min-h-[520px] md:h-[620px] lg:h-[650px] overflow-hidden bg-background">
      {/* Solid dark maroon base */}
      <div className="absolute inset-0" style={{ backgroundColor: "#130C11" }} />

      {/* Full-width image background */}
      <div className="absolute inset-0">
        <img
          src="/images/product-hero-bg.png"
          alt="Products"
          className="absolute inset-0 h-full w-full pointer-events-none select-none object-cover object-right md:object-right lg:object-center"
        />
        {/* Dark gradient overlay for text readability */}
        {/* <div className="absolute inset-0 bg-gradient-to-r from-[#130C11]/90 via-[#130C11]/45 to-transparent" /> */}
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 md:absolute md:inset-0 lg:relative lg:inset-auto container mx-auto px-4 sm:px-6 md:px-8 lg:px-8 h-full flex flex-col justify-evenly gap-4 sm:gap-3 md:gap-0 py-8 sm:py-10 md:py-6 lg:py-0 max-w-7xl">
        {/* Logo/Brand Name */}
        <h3 className="text-amber-100 text-[10px] sm:text-xs md:text-xs lg:text-sm font-medium tracking-[0.2em] sm:tracking-[0.25em] md:tracking-[0.3em] uppercase">
          GLOWVITA SHOP
        </h3>

        {/* Main Heading */}
        <h1
          className="text-[34px] sm:text-[44px] md:text-[56px] lg:text-[70px] leading-[115%] font-bold max-w-full sm:max-w-[85%] md:max-w-[70%] lg:max-w-[510px]"
          style={{
            fontFamily: "'Playfair Display', serif",
            letterSpacing: "-0.01em",
            color: "#F7E5C1",
          }}
        >
          Choose the Best<br />for Your Routine
        </h1>

        {/* Description */}
        <p
          className="text-gray-200 text-sm sm:text-base md:text-lg lg:text-xl max-w-xl leading-relaxed"
        >
          Explore high-quality beauty products crafted to elevate your daily self-care with trusted formulas and reliable performance.
        </p>

        {/* ── Search Bar ─────────────────────────────────────────────────── */}
        <div
          className="bg-white shadow-2xl w-full max-w-[865px] flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-0 rounded-2xl md:rounded-full px-4 md:pl-10 md:pr-3.5 py-3 md:py-3"
        >

          {/* Product Input */}
          <div className="relative flex-1 flex items-center gap-3 px-2 md:px-0 md:border-r border-gray-200 py-2 md:py-0 md:pr-6">
            <div className="flex flex-col flex-1">
              {!productInput && (
                <label
                  className="font-medium mb-1"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                    fontSize: "clamp(11px, 1.2vw, 13px)",
                    color: "#BA7894",
                  }}
                >
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
                className="outline-none text-gray-800 placeholder-gray-400 w-full bg-transparent"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(13px, 1.5vw, 15px)",
                  lineHeight: "160%",
                }}
              />
            </div>
            <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>

          {/* Divider between inputs on mobile */}
          <div className="block md:hidden h-px w-full bg-gray-100 mx-2" />

          {/* Location Input */}
          <div className="relative flex-1 flex items-center gap-3 px-2 md:px-0 py-2 md:py-0">
            <div className="flex flex-col flex-1">
              {!locationInput && (
                <label className="text-xs font-medium mb-0.5" style={{ color: "#BA7894" }}>
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
                className="outline-none text-gray-800 placeholder-gray-400 text-sm w-full"
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
                      <span
                        className="text-gray-900 font-bold tracking-tight truncate"
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: 600,
                          fontSize: "clamp(12px, 1.5vw, 14px)",
                          lineHeight: "160%",
                        }}
                      >
                        {isLocating ? "Locating…" : "Use Current Location"}
                      </span>
                      <span
                        className="text-gray-400 font-black uppercase"
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: 700,
                          fontSize: "clamp(8px, 1vw, 10px)",
                          lineHeight: "160%",
                        }}
                      >
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
                      <span
                        className="text-gray-800 font-bold tracking-tight truncate"
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: 600,
                          fontSize: "clamp(12px, 1.5vw, 14px)",
                          lineHeight: "160%",
                        }}
                      >
                        {prediction.structured_formatting?.main_text || prediction.description}
                      </span>
                      <span
                        className="text-gray-400 truncate"
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: 400,
                          fontSize: "clamp(11px, 1.2vw, 13px)",
                          lineHeight: "160%",
                        }}
                      >
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
            className="text-white transition-all duration-300 flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-70 w-full md:w-[127px] h-11 md:h-[44px] lg:h-[35px] rounded-full md:rounded-[21px] mt-1 md:mt-0 md:ml-3"
            style={{
              backgroundColor: "#BA7894",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 500,
              fontSize: "clamp(12px, 1.5vw, 14px)",
              lineHeight: "160%",
            }}
          >
            {isSearching ? "Searching…" : "Search"}
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* Product Categories Marquee */}
        <div className="w-full max-w-4xl overflow-hidden relative rounded-full py-1">
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
                  className="bg-white bg-opacity-10 backdrop-blur-sm hover:border-white hover:bg-opacity-20 border border-white/20 text-white px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-full font-medium transition-all duration-300 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                    fontSize: "clamp(12px, 1.5vw, 14px)",
                    lineHeight: "160%",
                  }}
                >
                  <cat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {cat.label}
                </button>
              ))}
          </div>
          <div className="rounded-full absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[rgba(45,28,48,0.95)] via-[rgba(45,28,48,0.7)] to-transparent z-10 pointer-events-none"></div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 max-w-3xl">
          <div className="text-center py-2 px-3 sm:py-3 sm:px-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 transition-colors hover:bg-white/10">
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: "clamp(24px, 4vw, 32px)",
                lineHeight: "115%",
              }}
              className="text-amber-50"
            >
              {isLoading ? "..." : uniqueVendors > 0 ? `${uniqueVendors}+` : "0"}
            </p>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                fontSize: "clamp(11px, 1.2vw, 13px)",
                lineHeight: "160%",
                color: "#ffff",
              }}
              className="uppercase tracking-wider mt-2"
            >
              Vendors
            </p>
          </div>
          <div className="text-center py-2 px-3 sm:py-3 sm:px-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 transition-colors hover:bg-white/10">
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: "clamp(24px, 4vw, 32px)",
                lineHeight: "115%",
              }}
              className="text-amber-50"
            >
              {isLoading ? "..." : totalProducts > 0 ? `${totalProducts.toLocaleString()}+` : "0"}
            </p>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                fontSize: "clamp(11px, 1.2vw, 13px)",
                lineHeight: "160%",
                color: "#ffff",
              }}
              className="uppercase tracking-wider mt-2"
            >
              Products
            </p>
          </div>
          <div className="text-center py-2 px-3 sm:py-3 sm:px-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 transition-colors hover:bg-white/10">
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: "clamp(24px, 4vw, 32px)",
                lineHeight: "115%",
              }}
              className="text-amber-50"
            >
              {isLoading ? "..." : averageRating}/5
            </p>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                fontSize: "clamp(11px, 1.2vw, 13px)",
                lineHeight: "160%",
                color: "#ffff",
              }}
              className="uppercase tracking-wider mt-2"
            >
              Avg Rating
            </p>
          </div>
          <div className="text-center py-2 px-3 sm:py-3 sm:px-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 transition-colors hover:bg-white/10">
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: "clamp(24px, 4vw, 32px)",
                lineHeight: "115%",
              }}
              className="text-amber-50"
            >
              Secure
            </p>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                fontSize: "clamp(11px, 1.2vw, 13px)",
                lineHeight: "160%",
                color: "#ffff",
              }}
              className="uppercase tracking-wider mt-2"
            >
              Guarantee
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;