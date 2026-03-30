"use client";

import React, { useState } from "react";
import { MapPin, Users, Star, ArrowRight } from "lucide-react";
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
      `https://placehold.co/600x400/gradient?text=${encodeURIComponent(vendor.businessName || "Salon")}`;

    const hasOffer =
      vendor.offers &&
      Array.isArray(vendor.offers) &&
      vendor.offers.length > 0;

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
      clients: `${vendor.totalBookings || vendor.clientCount || 0}+`,
      image: imageUrl,
      badge: hasOffer ? "Offer Available" : null,
      serviceNames: vendor.services?.map((s: any) => s.name) || [],
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
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
              Newly Added Salons
            </h2>
          </div>
          <p className="text-muted-foreground">
            Be the first to experience our newest salon arrivals and trendy service spots.
          </p>
        </div>

        <button 
          onClick={() => {
            const params = new URLSearchParams();
            if (userLat) params.append("lat", userLat.toString());
            if (userLng) params.append("lng", userLng.toString());
            if (locationLabel) params.append("locationLabel", locationLabel);
            const queryString = params.toString() ? `?${params.toString()}` : "";
            router.push(`/salons${queryString}`);
          }}
          className="text-primary font-semibold flex items-center gap-1 hover:underline mb-4 md:mb-0"
        >
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {salons.map((salon: TransformedSalon) => (
          <div
            key={salon.id}
            className="group bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
            onClick={() => router.push(`/salon-details/${salon.id}`)}
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={salon.image}
                alt={salon.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {salon.badge && (
                <div className="absolute top-3 right-3 bg-primary text-destructive-foreground px-2.5 py-0.5 rounded-full text-xs font-bold shadow-lg">
                  {salon.badge}
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-card-foreground text-base leading-tight truncate pr-2 flex-1">
                  {salon.name}
                </h3>
                <div className="flex items-center gap-1 bg-accent/50 px-2 py-0.5 rounded-lg flex-shrink-0">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold text-accent-foreground">
                    {Number(salon.rating).toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between mb-3">
                <div className="flex-1 overflow-hidden pr-2 flex flex-col gap-1.5">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold truncate">
                    {salon.type}
                  </p>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground text-xs leading-tight truncate">
                      {salon.location}
                    </p>
                  </div>
                </div>
                {salon.badge && (
                  <div className="flex-shrink-0 mb-1">
                    <img 
                      src="/images/new-offer.png" 
                      alt="Offer" 
                      className="h-10 w-auto object-contain" 
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 pt-3 border-t border-border">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-card-foreground">
                  {salon.clients} Clients
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewlyAddedSalons;
