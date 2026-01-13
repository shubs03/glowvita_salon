"use client";

import React from "react";
import { MapPin, ArrowRight } from "lucide-react";
import { useGetPublicVendorsQuery } from "@repo/store/services/api";
import { useRouter } from "next/navigation";

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
  const { 
    data: vendorsData, 
    isLoading, 
    error 
  } = useGetPublicVendorsQuery(undefined);

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
        `https://placehold.co/600x400/gradient?text=${encodeURIComponent(mostRecentSalon.businessName || "Salon")}`,
      isNew: true, // Always true since it's the most recent
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
          <div className="flex flex-col lg:flex-row">
            {/* Left - Large Image Skeleton */}
            <div className="w-full lg:w-1/2 h-64 lg:h-auto flex-shrink-0 rounded-2xl bg-gray-200 animate-pulse"></div>

            {/* Right - Details Skeleton */}
            <div className="w-full lg:w-1/2 p-6 md:p-8 flex flex-col justify-between">
              <div>
                {/* New Badge Skeleton */}
                <div className="h-6 w-16 bg-gray-200 rounded-full mb-3 animate-pulse"></div>

                {/* Salon Name Skeleton */}
                <div className="h-8 bg-gray-200 rounded mb-3 animate-pulse w-3/4"></div>

                {/* Location Skeleton */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-4 bg-gray-200 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>

                {/* Category Skeleton */}
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>

                {/* Description Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                </div>
              </div>

              {/* Bottom Section - Action Button Skeleton */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
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
        <div className="flex flex-col lg:flex-row">
          {/* Left - Large Image */}
          <div className="w-full lg:w-1/2 h-64 lg:h-auto flex-shrink-0 rounded-2xl">
            <img
              src={salon.image}
              alt={salon.name}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>

          {/* Right - Details */}
          <div className="w-full lg:w-1/2 p-6 md:p-8 flex flex-col justify-between">
            {/* Top Section */}
            <div>
              {/* New Badge */}
              {salon.isNew && (
                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  New
                </span>
              )}

              {/* Salon Name */}
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {salon.name}
              </h3>

              {/* Location */}
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{salon.location}</span>
              </div>

              {/* Category */}
              <p className="text-muted-foreground text-sm mb-4">
                {salon.category}
              </p>

              {/* Description */}
              <p className="text-foreground mb-6">{salon.description}</p>
            </div>

            {/* Bottom Section - Action Button */}
            <div className="mt-6 pt-6 border-t border-border">
              <button 
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-sm transition-colors duration-300"
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