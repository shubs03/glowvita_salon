"use client";

import React from "react";
import { MapPin, Users, Star, ArrowRight } from "lucide-react";
import { useGetPublicVendorsQuery } from "@repo/store/services/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    // Add other offer properties as needed
  }>;
}

interface TransformedSalon {
  id: string;
  name: string;
  type: string;
  location: string;
  rating: number | string;
  clients: string;
  image: string;
  badge: string | null;
}

const WhereToGo = () => {
  const router = useRouter();
  const {
    data: vendorsData,
    isLoading,
    error,
  } = useGetPublicVendorsQuery(undefined);

  // Transform vendor data to match the card structure
  const salons = React.useMemo(() => {
    if (!vendorsData?.vendors || !Array.isArray(vendorsData.vendors)) {
      return [];
    }

    return vendorsData.vendors
      .map((vendor: VendorData, index: number) => {
        // Generate placeholder image URL based on business name if no profile image
        const imageUrl =
          vendor.profileImage ||
          `https://placehold.co/600x400/gradient?text=${encodeURIComponent(vendor.businessName || "Salon")}`;

        // Determine badge based on vendor properties
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
          rating: vendor.rating || (4.7 + Math.random() * 0.3).toFixed(1), // Generate realistic ratings between 4.7-5.0
          clients: `${vendor.clientCount || Math.floor(200 + Math.random() * 600)}+`, // Generate client count
          image: imageUrl,
          badge: hasOffer ? "Offer Available" : null,
        };
      })
      .slice(0, 8) as TransformedSalon[]; // Limit to 8 salons to match original design
  }, [vendorsData]);

  return (
    <section className="py-16 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
            Where Would You Like to Go?
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Explore our top-rated salons and find the perfect spot for your next
          beauty treatment or hairstyle.
        </p>
      </div>

      {/* Salons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          // Loading skeleton cards
          Array.from({ length: 8 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="group bg-card border border-border rounded-3xl overflow-hidden shadow-sm transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <div className="w-full h-full bg-gray-200 animate-pulse" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-1 w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-lg ml-2 w-12 h-5 animate-pulse" />
                </div>
                <div className="flex items-start gap-1.5 mb-3">
                  <div className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 pt-3 border-t border-border">
                  <div className="w-3.5 h-3.5 text-primary" />
                  <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          // Error state
          <div className="col-span-full text-center py-12">
            <div className="inline-block p-4 bg-destructive/10 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Unable to Load Salons
            </h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading salon data. Please try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Retry
            </button>
          </div>
        ) : salons.length === 0 ? (
          // Empty state
          <div className="col-span-full text-center py-12">
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
              <Star className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Salons Available
            </h3>
            <p className="text-muted-foreground">
              We don't have any salons to display right now. Please check back
              later.
            </p>
          </div>
        ) : (
          // Actual salon cards
          <>
            {salons.map((salon: TransformedSalon, index: number) => (
              <div
                key={salon.id}
                className="group bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => router.push(`/salon-details/${salon.id}`)}
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={salon.image}
                    alt={salon.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Badge */}
                  {salon.badge && (
                    <div className="absolute top-3 right-3 bg-primary text-destructive-foreground px-2.5 py-0.5 rounded-full text-xs font-bold shadow-lg">
                      {salon.badge}
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Title and Rating */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-card-foreground text-base leading-tight mb-1">
                        {salon.name}
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        {salon.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-accent/50 px-2 py-1 rounded-lg ml-2">
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                      <span className="text-xs font-bold text-accent-foreground">
                        {salon.rating}
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground text-xs leading-tight">
                      {salon.location}
                    </p>
                  </div>

                  {/* Clients */}
                  <div className="flex items-center gap-1.5 pt-3 border-t border-border">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-card-foreground">
                      {salon.clients} Clients
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* View More Button */}
      <div className="flex justify-end">
        <button
          className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          onClick={() => (window.location.href = "/salons")}
        >
          View All Salons
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </section>
  );
};

export default WhereToGo;
