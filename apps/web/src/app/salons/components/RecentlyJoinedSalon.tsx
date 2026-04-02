"use client";

import React from "react";
import { MapPin, ArrowRight } from "lucide-react";
import { useGetPublicVendorsQuery } from "@repo/store/services/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useSalonFilter } from "@/components/landing/SalonFilterContext";

interface VendorData {
  _id: string;
  businessName: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  description?: string;
  category: "unisex" | "men" | "women";
  subCategories: string[];
  profileImage?: string;
  gallery?: string[];
  location?: {
    lat: number;
    lng: number;
  };
  vendorType?: string;
  services?: Array<{
    _id: string;
    name: string;
    category: {
      _id: string;
      name: string;
    } | null;
    price: number;
    duration: number;
    description: string;
  }>;
  rating?: number;
  clientCount?: number;
  offers?: Array<{
    _id: string;
    name: string;
    discount: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
}


const RecentlyJoinedSalon = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userLat, userLng, locationLabel, selectedCity, serviceQuery } = useSalonFilter();
  
  // Use location from context or search params if available
  const qLat = searchParams?.get("lat") ? parseFloat(searchParams.get("lat")!) : userLat;
  const qLng = searchParams?.get("lng") ? parseFloat(searchParams.get("lng")!) : userLng;
  const qCityRaw = searchParams?.get("city") || searchParams?.get("locationLabel") || selectedCity;
  const qCity = qCityRaw?.split(',')[0].trim();
  const qServiceName = searchParams?.get("serviceName") || serviceQuery;


  const {
    data: vendorsData,
    isLoading,
    error
  } = useGetPublicVendorsQuery({
    lat: qLat || undefined,
    lng: qLng || undefined,
    city: qCity || undefined,
    serviceName: qServiceName || undefined
  });

  // Find the most recently created vendor
  const mostRecentSalon = React.useMemo(() => {
    if (!vendorsData?.vendors || !Array.isArray(vendorsData.vendors)) {
      return null;
    }

    // Sort vendors by creation date to find the most recent
    const sortedVendors = [...vendorsData.vendors].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Sort in descending order (most recent first)
    });

    return sortedVendors[0]; // Return the most recent vendor
  }, [vendorsData]);

  // Transform vendor data to match component requirements
  const salon = React.useMemo(() => {
    if (!mostRecentSalon) return null;

    return {
      id: mostRecentSalon._id,
      name: mostRecentSalon.businessName || "Beauty Salon",
      location: `${mostRecentSalon.city || "Unknown City"}, ${mostRecentSalon.state || "Unknown State"}`,
      category:
        mostRecentSalon.category === "unisex"
          ? "Full-Service Salon"
          : mostRecentSalon.category === "women"
            ? "Women's Beauty Salon"
            : mostRecentSalon.category === "men"
              ? "Men's Grooming"
              : "Beauty Services",
      image:
        mostRecentSalon.profileImage ||
        "/images/salon-placeholder.png",
      isNew: true, // Always true since it's the most recent
      hasOffer:
        mostRecentSalon.offers &&
        Array.isArray(mostRecentSalon.offers) &&
        mostRecentSalon.offers.some((offer: any) => {
          const now = new Date();
          const startDate = offer.startDate ? new Date(offer.startDate) : null;
          const expires = offer.expires ? new Date(offer.expires) : null;
          return (!startDate || now >= startDate) && (!expires || now <= expires);
        }),
      description: mostRecentSalon.description ||
        "Experience luxury and relaxation at our newest salon location. We offer premium hair styling, coloring, and beauty services with the latest techniques and products. Our skilled professionals are dedicated to making you look and feel your best.",
    };
  }, [mostRecentSalon]);

  if (isLoading) {
    return (
      <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
              Recently Joined Salon
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Discover our newest partner salon
          </p>
        </div>

        {/* Loading Skeleton */}
        <div className="bg-card overflow-hidden duration-300">
          <div className="flex flex-col lg:flex-row lg:h-[460px]">
            {/* Left - Large Image Skeleton */}
            <div className="w-full lg:w-1/2 h-80 md:h-96 lg:h-full flex-shrink-0 rounded-2xl bg-gray-200 animate-pulse"></div>

            {/* Right - Details Skeleton */}
            <div className="w-full lg:w-1/2 p-6 md:p-8 flex flex-col justify-between h-full">
              <div>
                {/* New Badge Skeleton */}
                <div className="h-5 md:h-6 w-14 md:w-16 bg-gray-200 rounded-full mb-2 md:mb-3 animate-pulse"></div>

                {/* Salon Name Skeleton */}
                <div className="h-6 md:h-8 bg-gray-200 rounded mb-2 md:mb-3 animate-pulse w-3/4"></div>

                {/* Location Skeleton */}
                <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                  <div className="w-3.5 h-3.5 md:w-4 md:h-4 bg-gray-200 animate-pulse"></div>
                  <div className="h-3.5 md:h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>

                {/* Category Skeleton */}
                <div className="h-3.5 md:h-4 bg-gray-200 rounded w-2/3 mb-3 md:mb-4 animate-pulse"></div>

                {/* Description Skeleton */}
                <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                  <div className="h-3.5 md:h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3.5 md:h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-3.5 md:h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                </div>
              </div>

              {/* Bottom Section - Action Button Skeleton */}
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
                <div className="h-5 md:h-6 w-20 md:w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !salon) {
    return null; // Don't render anything if there's an error or no data
  }

  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
            Recently Joined Salon
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Discover our newest partner salon
        </p>
      </div>

      {/* Salon Card */}
      <div
        className="bg-card overflow-hidden duration-300 cursor-pointer"
        onClick={() => router.push(`/salon-details/${salon.id}`)}
      >
        <div className="flex flex-col lg:flex-row lg:h-[460px]">
          {/* Left - Large Image */}
          <div className="w-full lg:w-1/2 h-80 md:h-96 lg:h-full flex-shrink-0 rounded-2xl">
            <img
              src={salon.image}
              alt={salon.name}
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => { (e.target as HTMLImageElement).src = "/images/salon-placeholder.png"; }}
            />
          </div>

          {/* Right - Details */}
          <div className="w-full lg:w-1/2 p-6 md:p-8 flex flex-col justify-between h-full">
            {/* Top Section */}
            <div>
              {/* Badges Row */}
              {salon.isNew && (
                <div className="mb-2 md:mb-3">
                  <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                    New
                  </span>
                </div>
              )}

              {/* Salon Name */}
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 md:mb-4 line-clamp-1">
                {salon.name}
              </h3>

              {/* Type, Location and Offer Row */}
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <div className="flex flex-col gap-2">
                  {/* Category */}
                  <p className="text-muted-foreground text-sm md:text-base font-medium">
                    {salon.category}
                  </p>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="text-sm md:text-base line-clamp-1">{salon.location}</span>
                  </div>
                </div>

                {/* Offer */}
                {salon.hasOffer && (
                  <div className="flex-shrink-0">
                    <img 
                      src="/images/new-offer.png" 
                      alt="Offer" 
                      className="h-12 md:h-14 w-auto object-contain" 
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-foreground text-sm md:text-base line-clamp-3">{salon.description}</p>
            </div>

            {/* Bottom Section - Action Button */}
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
              <button
                className="inline-flex items-center gap-1.5 md:gap-2 text-primary hover:text-primary/80 font-semibold text-sm transition-colors duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/salon-details/${salon.id}`);
                }}
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentlyJoinedSalon;