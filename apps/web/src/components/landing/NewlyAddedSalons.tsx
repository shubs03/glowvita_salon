"use client";

import React, { useState } from "react";
import { MapPin, Filter, RotateCcw, X } from "lucide-react";
import { useGetLandingSalonsQuery } from "@repo/store/services/api";
import { useRouter } from "next/navigation";
import { useSalonFilter } from "./SalonFilterContext";

interface TransformedSalon {
  id: string;
  name: string;
  type: string;
  location: string;
  rating: number | string;
  clients: string;
  image: string;
  badge: string | null;
  serviceNames: string[];
  isHomeService?: boolean;
  isWeddingService?: boolean;
}

interface NewlyAddedSalonsProps {
  maxSalons?: number;
}

const NewlyAddedSalons: React.FC<NewlyAddedSalonsProps> = ({ maxSalons = 8 }) => {
  const router = useRouter();
  const { userLat, userLng, locationLabel } = useSalonFilter();

  const {
    data: landingData,
    isLoading,
    error,
  } = useGetLandingSalonsQuery({ lat: userLat, lng: userLng });

  const transformVendor = (vendor: any) => {
    const imageUrl =
      vendor.profileImage ||
      "/images/salon-placeholder.png";

    const hasOffer =
      vendor.offers &&
      Array.isArray(vendor.offers) &&
      vendor.offers.some((offer: any) => {
        const now = new Date();
        const startDate = offer.startDate ? new Date(offer.startDate) : null;
        const expires = offer.expires ? new Date(offer.expires) : null;
        return (!startDate || now >= startDate) && (!expires || now <= expires);
      });

    const isHomeService =
      vendor.isHomeService === true ||
      (vendor.vendorType && ["hybrid", "home-only", "vendor-home-travel"].includes(vendor.vendorType)) ||
      (vendor.subCategories?.includes("at-home")) ||
      (vendor.services?.some((s: any) => (!s.status || s.status === 'approved') && (s.homeService?.available || s.serviceHomeService?.available)));

    const isWeddingService =
      vendor.isWeddingService === true ||
      vendor.services?.some((s: any) => (!s.status || s.status === 'approved') && (s.weddingService?.available || s.serviceWeddingService?.available)) ||
      (vendor.vendorServicesItems?.[0]?.services?.some((s: any) => (!s.status || s.status === 'approved') && (s.weddingService?.available || s.serviceWeddingService?.available)));

    return {
      id: vendor._id,
      name: vendor.businessName || "Beauty Salon",
      type:
        vendor.category === "unisex"
          ? "Full-Service Salon"
          : vendor.category === "women"
            ? "Women's Beauty Salon"
            : vendor.category === "men"
              ? "Men's Grooming"
              : "Beauty Services",
      location: `${vendor.city || "Unknown City"}, ${vendor.state || "Unknown State"}`,
      rating: vendor.rating || "0.0",
      clients: `${vendor.dynamicClientCount ||
        vendor.stats?.find((s: any) => s.label === "Happy Clients")?.value ||
        vendor.clientCount ||
        0}+`,
      image: imageUrl,
      badge: hasOffer ? "Offer Available" : null,
      serviceNames: vendor.services?.map((s: any) => s.name) || [],
      isHomeService,
      isWeddingService,
    };
  };

  const salons = React.useMemo(() => {
    if (!landingData?.data?.newlyAdded) return [];
    return landingData.data.newlyAdded.map(transformVendor).slice(0, maxSalons);
  }, [landingData, maxSalons]);

  if (isLoading) {
    return (
      <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 bg-muted animate-pulse rounded-3xl" />
          ))}
        </div>
      </section>
    );
  }

  if (error || salons.length === 0 || landingData?.noServiceArea) {
    return null;
  }

  return (
    <section className="py-8 px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <h2
          className="relative inline-block text-2xl md:text-3xl font-serif font-bold pb-3"
          style={{ color: "#252B42" }}
        >
          Newly Added Salons
          <span
            className="absolute left-0 bottom-0 h-[3px] w-full rounded-full"
            style={{
              background:
                "linear-gradient(to right, #252B42 0%, #252B42 40%, transparent 100%)",
            }}
          />
        </h2>
        <button
          onClick={() => {
            const params = new URLSearchParams();
            if (userLat) params.append("lat", userLat.toString());
            if (userLng) params.append("lng", userLng.toString());
            if (locationLabel) params.append("locationLabel", locationLabel);
            const queryString = params.toString() ? `?${params.toString()}` : "";
            router.push(`/salons${queryString}`);
          }}
          className="group flex items-center gap-2 text-sm font-semibold flex-shrink-0"
          style={{ color: "#252B42" }}
        >
          View All
          <img src="/images/arrow.png" alt="arrow" className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {salons.map((salon: TransformedSalon) => (
          <div
            key={salon.id}
            className="group p-4 border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
            style={{ backgroundColor: "#FFFFFF" }}
            onClick={() => router.push(`/salon-details/${salon.id}`)}
          >
            <div className="relative h-48 overflow-hidden rounded-xl border border-gray-200">
              <img
                src={salon.image}
                alt={salon.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { (e.target as HTMLImageElement).src = "/images/salon-placeholder.png"; }}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Service Badges */}
              <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1.5 z-10">
                {salon.isHomeService && (
                  <div
                    className="flex items-center gap-1 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-lg backdrop-blur-sm"
                    style={{ backgroundColor: "#00000082" }}
                  >
                    <img src="/images/home (12) 1.png" alt="home service" className="w-3 h-3" />
                    <span className="uppercase tracking-wider">Home service</span>
                  </div>
                )}
                {salon.isWeddingService && (
                  <div
                    className="flex items-center gap-1 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-lg backdrop-blur-sm"
                    style={{ backgroundColor: "#00000082" }}
                  >
                    <img src="/images/like (3) 1 (1).png" alt="wedding service" className="w-3 h-3" />
                    <span className="uppercase tracking-wider">Wedding Service</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 px-1">
              <div className="flex items-start justify-between mb-2">
                <h3
                  className="font-bold text-base leading-tight truncate pr-2 flex-1"
                  style={{ color: "#252B42" }}
                >
                  {salon.name}
                </h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <img src="/images/star 6.png" alt="rating" className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-gray-900">
                    {Number(salon.rating).toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <p className="text-gray-900 text-[11px] uppercase tracking-wider font-normal truncate">
                  {salon.type}
                </p>
                <div className="flex items-start gap-1.5 mt-1.5">
                  <img src="/images/placeholder 6.png" alt="location" className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-900 text-[13px] leading-tight truncate font-normal">
                    {salon.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 h-8">
                <div className="flex items-center gap-1.5">
                  <img src="/images/customer 6.png" alt="clients" className="w-3.5 h-3.5" />
                  <span className="text-[13px] font-semibold text-card-foreground">
                    {salon.clients} Clients
                  </span>
                </div>
                {salon.badge && (
                  <img
                    src="/images/new-offer.png"
                    alt="Offer"
                    className="h-8 w-auto object-contain"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewlyAddedSalons;
