"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useEffect,
} from "react";
import { useSelector } from "react-redux";
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from "@repo/config/config";

type GeoStatus = "pending" | "granted" | "denied";

interface SalonFilterContextType {
  selectedCategories: string[];
  selectedServices: string[];
  // ── Coordinate-based location ─────────────────────────────────────────────
  userLat: number | null;
  userLng: number | null;
  locationLabel: string;
  geoStatus: GeoStatus;
  setUserLocation: (lat: number, lng: number, label?: string) => void;
  clearLocation: () => void;
  // ── Helpers ───────────────────────────────────────────────────────────────
  setSelectedCategories: (categories: string[]) => void;
  setSelectedServices: (services: string[]) => void;
  clearFilters: () => void;
  addCategory: (categoryId: string) => void;
  removeCategory: (categoryId: string) => void;
  addService: (serviceId: string) => void;
  removeService: (serviceId: string) => void;
  // ── Legacy city support (derived from locationLabel) ──────────────────────
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  serviceQuery: string;
  setServiceQuery: (query: string) => void;
  // ── Region Detection ──────────────────────────────────────────────────────
  selectedRegionId: string | null;
}

const defaultContextValue: SalonFilterContextType = {
  selectedCategories: [],
  selectedServices: [],
  userLat: null,
  userLng: null,
  locationLabel: "",
  geoStatus: "pending",
  setUserLocation: () => { },
  clearLocation: () => { },
  setSelectedCategories: () => { },
  setSelectedServices: () => { },
  clearFilters: () => { },
  addCategory: () => { },
  removeCategory: () => { },
  addService: () => { },
  removeService: () => { },
  selectedCity: "",
  setSelectedCity: () => { },
  serviceQuery: "",
  setServiceQuery: () => { },
  selectedRegionId: null,
};

const SalonFilterContext =
  createContext<SalonFilterContextType>(defaultContextValue);

export function SalonFilterProvider({ children }: { children: ReactNode }) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationLabel, setLocationLabel] = useState<string>("");
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("pending");
  const [serviceQuery, setServiceQuery] = useState<string>("");
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  // Guard: run geolocation only once per session
  const geoAttempted = useRef(false);

  // ── Pull registered location from Redux (fallback Case 3) ──────────────────
  const userAuth = useSelector((state: any) => state?.userAuth);
  const registeredLat: number | undefined = userAuth?.user?.location?.lat;
  const registeredLng: number | undefined = userAuth?.user?.location?.lng;
  const registeredCity: string = userAuth?.user?.city || "";
  const isAuthenticated: boolean = userAuth?.isAuthenticated || false;

  // ── Detect Region From Coordinates ────────────────────────────────────────
  const detectRegion = async (lat: number, lng: number, cityName: string = "") => {
    try {
      const cityParams = cityName ? `&city=${encodeURIComponent(cityName)}` : "";
      const response = await fetch(`/api/regions/detect?lat=${lat}&lng=${lng}${cityParams}`);
      const data = await response.json();
      if (data.success && data.regionId) {
        setSelectedRegionId(data.regionId);
        return data.regionId;
      }
    } catch (e) {
      console.error("[SalonFilterContext] Region detection failed:", e);
    }
    setSelectedRegionId(null);
    return null;
  };

  // ── Expose setter for manual overrides (Case 2) ───────────────────────────
  const setUserLocation = (lat: number, lng: number, label: string = "") => {
    setUserLat(lat);
    setUserLng(lng);
    setLocationLabel(label);
    detectRegion(lat, lng, label);
  };

  const clearLocation = () => {
    setUserLat(null);
    setUserLng(null);
    setLocationLabel("");
    setSelectedRegionId(null);
  };

  // ── Reverse Geocode for Case 1 (Auto-detect) ──────────────────────────────
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.status === "OK" && data.results?.[0]) {
        // Return full address string: "Pune, Maharashtra, India" instead of just "Pune"
        return data.results[0].formatted_address || "Current Location";
      }
    } catch (e) {
      console.error("Reverse geocoding error:", e);
    }
    return "Current Location";
  };

  // ── Requirement 1: Auto Location Fetch ────────────────────────────────────
  useEffect(() => {
    if (geoAttempted.current) return;
    geoAttempted.current = true;

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLat(latitude);
        setUserLng(longitude);
        setGeoStatus("granted");

        // Requirement 1: Show detected location name in search bar if possible
        const cityLabel = await reverseGeocode(latitude, longitude);
        setLocationLabel(cityLabel);

        // Detect region for auto-detected coords
        detectRegion(latitude, longitude, cityLabel);
      },
      () => {
        setGeoStatus("denied");
      },
      { timeout: 8000, maximumAge: 300_000 }
    );
  }, []);

  // ── Requirement 3: User Logged In (Fallback) ──────────────────────────────
  useEffect(() => {
    if (
      geoStatus === "denied" &&
      isAuthenticated &&
      typeof registeredLat === "number" &&
      typeof registeredLng === "number" &&
      registeredLat !== 0 &&
      registeredLng !== 0 &&
      userLat === null
    ) {
      setUserLat(registeredLat);
      setUserLng(registeredLng);
      // Case 3A: Show salons from saved city + show in search bar
      setLocationLabel(registeredCity || "Your Profile Area");
      
      // Detect region for registered user location
      detectRegion(registeredLat, registeredLng, registeredCity);
    }
  }, [geoStatus, isAuthenticated, registeredLat, registeredLng, registeredCity]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedServices([]);
    clearLocation();
  };

  const addCategory = (categoryId: string) => {
    if (!selectedCategories.includes(categoryId)) {
      setSelectedCategories((prev) => [...prev, categoryId]);
    }
  };

  const removeCategory = (categoryId: string) =>
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));

  const addService = (serviceId: string) => {
    if (!selectedServices.includes(serviceId)) {
      setSelectedServices((prev) => [...prev, serviceId]);
    }
  };

  const removeService = (serviceId: string) =>
    setSelectedServices((prev) => prev.filter((id) => id !== serviceId));

  // ── Legacy helpers ────────────────────────────────────────────────────────
  const selectedCity = locationLabel;
  const setSelectedCity = (city: string) => {
    // When switching to a city fallback, clear coordinates so the API
    // switches from region-based (intersect) to city-name-based (exact match)
    setUserLat(null);
    setUserLng(null);
    setLocationLabel(city);
    setSelectedRegionId(null);
  };

  return (
    <SalonFilterContext.Provider
      value={{
        selectedCategories,
        selectedServices,
        userLat,
        userLng,
        locationLabel,
        geoStatus,
        setUserLocation,
        clearLocation,
        setSelectedCategories,
        setSelectedServices,
        clearFilters,
        addCategory,
        removeCategory,
        addService,
        removeService,
        selectedCity,
        setSelectedCity,
        serviceQuery,
        setServiceQuery,
        selectedRegionId,
      }}
    >
      {children}
    </SalonFilterContext.Provider>
  );
}

export function useSalonFilter() {
  return useContext(SalonFilterContext);
}