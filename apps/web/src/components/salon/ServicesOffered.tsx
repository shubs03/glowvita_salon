'use client';

import React, { useState, useMemo } from 'react';
import { Clock, IndianRupee, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { useGetPublicVendorServicesQuery } from "@repo/store/services/api";

interface ServicesOfferedProps {
  vendorId: string;
  onBookNow: (service?: any) => void;
  isSubscriptionExpired?: boolean;
}

const ServicesOffered: React.FC<ServicesOfferedProps> = ({ 
  vendorId, 
  onBookNow, 
  isSubscriptionExpired = false 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch services dynamically from API
  const { data: servicesData, isLoading: servicesLoading, error: servicesError } = useGetPublicVendorServicesQuery(vendorId);

  // Process services data
  const services = useMemo(() => {
    if (servicesData?.services && servicesData.services.length > 0) {
      return servicesData.services.map((service: any) => ({
        id: service._id || service.id,
        name: service.name || "",
        price: service.price || 0,
        duration: service.duration || 60,
        category: service.category?.name || service.category || "Other",
        description: service.description || "",
        image: service.image || "",
        discount: service.discount || null,
      }));
    }
    return [];
  }, [servicesData]);

  // Generate dynamic service categories based on actual services
  const categories = useMemo(() => {
    const cats = ["All"];
    if (services.length > 0) {
      const uniqueCategories = Array.from(new Set(services.map((service: any) => service.category))) as string[];
      cats.push(...uniqueCategories.sort());
    }
    return cats;
  }, [services]);

  // Filter services by category
  const filteredServices = useMemo(() => {
    return selectedCategory === "All"
      ? services
      : services.filter((service: any) => service.category === selectedCategory);
  }, [services, selectedCategory]);

  // Format duration display
  const formatDuration = (duration: number) => {
    if (duration < 60) {
      return `${duration} mins`;
    }
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-2xl p-5 animate-pulse"
        >
          <div className="h-5 bg-muted rounded w-3/4 mb-3"></div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-9 bg-muted rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="text-center py-12 bg-card border border-border rounded-2xl">
      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground mb-4">Unable to load services. Please try again later.</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-all duration-300"
      >
        Retry
      </button>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12 bg-card border border-border rounded-2xl">
      <p className="text-muted-foreground">No services available in this category.</p>
    </div>
  );

  return (
    <section className="max-w-6xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          Services Offered
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">
          Choose from a variety of expert treatments to enhance your natural beauty.
        </p>
      </div>

      {/* Subscription Expired Warning */}
      {isSubscriptionExpired && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-destructive mb-1">Salon Currently Unavailable</h4>
            <p className="text-sm text-destructive/80">
              This salon is not accepting bookings at the moment. Please check back later or contact them directly.
            </p>
          </div>
        </div>
      )}

      {/* Category Dropdown */}
      {!servicesLoading && !servicesError && services.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      )}

      {/* Services Grid */}
      {servicesLoading ? (
        <LoadingSkeleton />
      ) : servicesError ? (
        <ErrorState />
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((service: any, index: number) => (
            <div
              key={`${service.id}-${index}`}
              className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all duration-300 relative"
            >
              {/* Discount Badge */}
              {service.discount && (
                <div className="absolute top-4 right-4 bg-foreground text-background px-3 py-1 rounded-full text-xs font-bold">
                  Save {service.discount}
                </div>
              )}

              {/* Service Name */}
              <h3 className="font-bold text-foreground text-base mb-3 pr-20">
                {service.name}
              </h3>

              {/* Description (if available) */}
              {service.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {service.description}
                </p>
              )}

              {/* Duration and Price */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  {/* Duration */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(service.duration)}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      From ₹ {service.price.toFixed(2)}/-
                    </span>
                  </div>
                </div>

                {/* Book Now Button */}
                <button
                  className={`bg-background border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isSubscriptionExpired ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isSubscriptionExpired}
                  onClick={() => {
                    // Store complete service data in sessionStorage
                    const serviceData = {
                      id: service.id,
                      name: service.name,
                      price: service.price,
                      duration: service.duration,
                      category: service.category,
                      description: service.description,
                      image: service.image,
                    };
                    sessionStorage.setItem("selectedService", JSON.stringify(serviceData));
                    onBookNow(service);
                  }}
                >
                  {isSubscriptionExpired ? 'Unavailable' : 'Book Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </section>
  );
};

export default ServicesOffered;