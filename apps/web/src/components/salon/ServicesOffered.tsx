'use client';

import React, { useState, useMemo } from 'react';
import { useGetPublicVendorServicesQuery, useGetPublicVendorWeddingPackagesQuery } from "@repo/store/services/api";
import { Clock, ChevronDown, AlertCircle, Home, Heart, Plus, CheckCircle } from 'lucide-react';
import Image from "next/image";

interface ServicesOfferedProps {
  vendorId: string;
  onBookNow: (service?: any) => void;
  isSubscriptionExpired?: boolean;
}

// Sub-components moved outside for performance and clarity
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Array.from({ length: 6 }).map((_, index) => (
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

const EmptyState = () => (
  <div className="text-center py-12 bg-card border border-border rounded-2xl">
    <p className="text-muted-foreground">No services available in this category.</p>
  </div>
);

const ServicesOffered: React.FC<ServicesOfferedProps> = ({
  vendorId,
  onBookNow,
  isSubscriptionExpired = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedPackages, setExpandedPackages] = useState<Record<string, boolean>>({});

  const togglePackage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPackages(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Fetch services dynamically from API
  const { data: servicesData, isLoading: servicesLoading, error: servicesError } = useGetPublicVendorServicesQuery(vendorId);
  // Fetch wedding packages dynamically
  const { data: weddingPackagesData, isLoading: weddingPackagesLoading } = useGetPublicVendorWeddingPackagesQuery(vendorId);

  // Process services and wedding packages
  const services = useMemo(() => {
    let allItems: any[] = [];

    // Add regular services
    if (servicesData?.services && Array.isArray(servicesData.services)) {
      const regularServices = servicesData.services.map((service: any) => ({
        id: service._id || service.id,
        name: service.name || "",
        price: service.price || 0,
        discountedPrice: service.discountedPrice,
        duration: service.duration || 60,
        category: service.category?.name || service.category || "Other",
        description: service.description || "",
        image: service.image || "",
        homeService: service.homeService || service.serviceHomeService,
        weddingService: service.weddingService || service.serviceWeddingService,
        isWeddingPackage: false
      }));
      allItems = [...allItems, ...regularServices];
    }

    // Add wedding packages
    if (weddingPackagesData) {
      let rawPackages = [];
      if (weddingPackagesData.success && Array.isArray(weddingPackagesData.weddingPackages)) {
        rawPackages = weddingPackagesData.weddingPackages;
      } else if (weddingPackagesData.weddingPackages && Array.isArray(weddingPackagesData.weddingPackages)) {
        rawPackages = weddingPackagesData.weddingPackages;
      } else if (Array.isArray(weddingPackagesData)) {
        rawPackages = weddingPackagesData;
      } else if (weddingPackagesData.data && Array.isArray(weddingPackagesData.data)) {
        rawPackages = weddingPackagesData.data;
      }

      const processedPackages = rawPackages
        .filter((pkg: any) => pkg && pkg.isActive !== false)
        .map((pkg: any) => ({
          id: pkg._id || pkg.id || `pkg-${Math.random()}`,
          name: pkg.name || "Wedding Package",
          price: pkg.totalPrice || 0,
          discountedPrice: pkg.discountedPrice,
          duration: pkg.duration || 0,
          category: "Wedding Packages",
          description: pkg.description || "",
          image: pkg.image || "",
          servicesList: pkg.services || [],
          staffCount: pkg.staffCount || 1,
          assignedStaff: Array.isArray(pkg.assignedStaff) ? pkg.assignedStaff.map((s: any) => typeof s === 'string' ? s : (s.name || s.firstName || 'Staff')) : [],
          isWeddingPackage: true,
          homeService: { available: false },
          weddingService: { available: true }
        }));
      allItems = [...allItems, ...processedPackages];
    }

    return allItems;
  }, [servicesData, weddingPackagesData]);

  // Generate dynamic categories
  const categories = useMemo(() => {
    const cats = ["All"];
    if (services.length > 0) {
      const uniqueCategories = Array.from(new Set(services.map((s: any) => s.category))) as string[];
      const sorted = uniqueCategories.filter(c => c !== "Wedding Packages").sort();
      cats.push(...sorted);
      if (uniqueCategories.includes("Wedding Packages")) {
        cats.push("Wedding Packages");
      }
    }
    return cats;
  }, [services]);

  // Filter based on selected category
  const filteredServices = useMemo(() => {
    if (selectedCategory === "All") return services;
    return services.filter((s: any) => s.category === selectedCategory);
  }, [services, selectedCategory]);

  // Format duration
  const formatDuration = (duration: any) => {
    const durStr = String(duration);
    if (durStr.includes('min') || durStr.includes('h')) return durStr;
    const durNum = parseInt(durStr);
    if (isNaN(durNum)) return duration;
    if (durNum < 60) return `${durNum} min`;
    const hours = Math.floor(durNum / 60);
    const mins = durNum % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const isLoading = servicesLoading || weddingPackagesLoading;

  if (servicesError) return <ErrorState />;

  return (
    <section className="max-w-6xl mx-auto bg-background">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          Services Offered
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">
          Choose from a variety of expert treatments to enhance your natural beauty.
        </p>
      </div>

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

      {!isLoading && services.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSkeleton />
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((service: any, index: number) => (
            <div
              key={`${service.id}-${index}`}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all duration-300 relative group cursor-pointer"
              onClick={() => {
                if (!isSubscriptionExpired) {
                  if (service.isWeddingPackage) {
                    sessionStorage.setItem("selectedWeddingPackage", JSON.stringify({ ...service, isWeddingPackage: true }));
                  } else {
                    sessionStorage.setItem("selectedService", JSON.stringify({
                      id: service.id,
                      name: service.name,
                      price: service.price,
                      discountedPrice: service.discountedPrice,
                      duration: service.duration,
                      category: service.category,
                      description: service.description,
                      image: service.image,
                    }));
                  }
                  onBookNow(service);
                }
              }}
            >
              {/* Top-Right Tags */}
              {service.isWeddingPackage ? (
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-current" />
                    Wedding Package
                  </span>
                </div>
              ) : (service.homeService?.available || service.homeService === true) && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-primary text-secondary text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    Home Service
                  </span>
                </div>
              )}

              <div className="flex items-start gap-4 h-full">
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-secondary/30">
                  <Image
                    src={service.image || `https://placehold.co/400x400/png?text=${encodeURIComponent(service.name)}`}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {!service.image && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                      <Plus className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 h-full min-w-0">
                  <div className="flex-1">
                    {/* Service Name - Consistent height */}
                    <h3 className="font-bold text-foreground text-base mb-1 pr-12 group-hover:text-primary transition-colors line-clamp-1 min-h-[1.5rem]">
                      {service.name}
                    </h3>

                    {/* Description - Tight 2-line limit */}
                    <p className="text-[11px] text-muted-foreground mb-2 line-clamp-2 min-h-[2rem] leading-relaxed">
                      {service.description || "No description available"}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2.5">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-secondary/50 rounded-md">
                        <Clock className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-medium text-foreground">
                          {service.isWeddingPackage ? `${service.duration} min` : formatDuration(service.duration)}
                        </span>
                      </div>
                      {isSubscriptionExpired && (
                        <p className="text-[9px] text-red-600 font-bold uppercase tracking-wider">Closed</p>
                      )}
                    </div>

                    {service.isWeddingPackage && (
                      <div className="mb-4 bg-rose-50/50 border border-rose-100/50 rounded-xl p-3">
                        <div
                          className="flex items-center justify-between cursor-pointer mb-2"
                          onClick={(e) => togglePackage(service.id, e)}
                        >
                          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle className="w-3 h-3" /> What's Included ({service.servicesList?.length || 0} Services):
                          </p>
                          <ChevronDown className={`w-3.5 h-3.5 text-rose-500 transition-transform duration-300 ${expandedPackages[service.id] ? 'rotate-180' : ''}`} />
                        </div>

                        <div className="grid grid-cols-1 gap-1.5">
                          {expandedPackages[service.id]
                            ? service.servicesList?.map((inc: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-[11px] text-muted-foreground/90">
                                <Plus className="w-2.5 h-2.5 text-rose-400" />
                                <span>{inc.serviceName || "Service"}</span>
                              </div>
                            ))
                            : service.servicesList?.slice(0, 1).map((inc: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-[11px] text-muted-foreground/90">
                                <Plus className="w-2.5 h-2.5 text-rose-400" />
                                <span>{inc.serviceName || "Service"}</span>
                                {service.servicesList?.length > 1 && (
                                  <span className="text-[9px] text-muted-foreground/50 ml-1">+{service.servicesList.length - 1} more</span>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {!service.isWeddingPackage && (service.weddingService?.available || service.weddingService === true) && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 uppercase tracking-wider border border-rose-200">
                          <Heart className="h-2.5 w-2.5 mr-1" />
                          Wedding Service
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-end justify-between mt-auto pt-2 border-t border-border/50">
                    <div className="space-y-0.5">
                      {service.discountedPrice && service.discountedPrice < service.price ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground line-through text-[10px] italic">₹{service.price}</span>
                            <span className="font-black text-lg text-primary tracking-tight">₹{service.discountedPrice}</span>
                          </div>
                          <div className="text-[9px] font-black text-green-600 uppercase tracking-wider">
                            {Math.round(((service.price - service.discountedPrice) / service.price) * 100)}% OFF
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="font-black text-lg text-primary tracking-tight">₹{service.price}</span>
                        </div>
                      )}
                    </div>

                    <button
                      className={`bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/10 transition-all duration-300 ${isSubscriptionExpired ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:-translate-y-0.5'}`}
                      disabled={isSubscriptionExpired}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Session storage logic same as above for consistency
                        if (service.isWeddingPackage) {
                          sessionStorage.setItem("selectedWeddingPackage", JSON.stringify({ ...service, isWeddingPackage: true }));
                        } else {
                          sessionStorage.setItem("selectedService", JSON.stringify({
                            id: service.id,
                            name: service.name,
                            price: service.price,
                            discountedPrice: service.discountedPrice,
                            duration: service.duration,
                            category: service.category,
                            description: service.description,
                            image: service.image,
                          }));
                        }
                        onBookNow(service);
                      }}
                    >
                      {isSubscriptionExpired ? 'Unavailable' : 'Book'}
                    </button>
                  </div>
                </div>
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