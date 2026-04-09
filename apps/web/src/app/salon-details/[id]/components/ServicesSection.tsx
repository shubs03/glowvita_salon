"use client";

import Image from "next/image";
import React, { useState, useMemo } from "react";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@repo/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { useGetPublicVendorServicesQuery } from "@repo/store/services/api";
import { Loader2, AlertCircle, Home, Heart, Plus } from "lucide-react";

interface ServicesSectionProps {
  vendorId: string;
  onBookNow: (service?: any) => void;
  isSubscriptionExpired?: boolean;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ vendorId, onBookNow, isSubscriptionExpired = false }) => {
  const [activeServiceTab, setActiveServiceTab] = useState("All");

  // Fetch services dynamically from API
  const { data: servicesData, isLoading: servicesLoading, error: servicesError } = useGetPublicVendorServicesQuery(vendorId);
  // Process services data
  const services = useMemo(() => {
    if (servicesData?.services && servicesData.services.length > 0) {
      return servicesData.services.map((service: any) => ({
        id: service._id || service.id,
        name: service.name || "",
        price: service.price || 0,
        discountedPrice: service.discountedPrice,
        duration: service.duration || 60,
        category: service.category?.name || service.category || "Other",
        description: service.description || "",
        image: service.image || "https://placehold.co/200x200/png?text=" + (service.name || "Service").replace(/\s/g, '+'),
        addOns: service.addOns || [],
        homeService: service.homeService || service.serviceHomeService,
        weddingService: service.weddingService || service.serviceWeddingService
      }));
    }
    return [];
  }, [servicesData]);

  // Generate dynamic service categories based on actual services
  const serviceCategories = useMemo(() => {
    const categories = ["All"];
    if (services.length > 0) {
      const uniqueCategories = Array.from(new Set(services.map((service: any) => service.category))) as string[];
      categories.push(...uniqueCategories.sort());
    }
    return categories;
  }, [services]);

  // Filter services by category
  const filteredServices = useMemo(() => {
    return activeServiceTab === "All"
      ? services
      : services.filter((service: any) => service.category === activeServiceTab);
  }, [services, activeServiceTab]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="flex justify-between items-center p-4 border rounded-md animate-pulse">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="text-right space-y-2">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Unable to load services. Please try again later.</p>
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => window.location.reload()}
      >
        Retry
      </Button>
    </div>
  );

  return (
    <section id="services">
      <h2 className="text-4xl font-bold mb-2">Services Offered</h2>
      <p className="text-muted-foreground mb-6">
        Explore our wide range of professional services.
      </p>
      <Card>
        <CardHeader>
          <Tabs
            value={activeServiceTab}
            onValueChange={setActiveServiceTab}
            className="w-full"
          >
            <div className="relative">
              <TabsList className="relative flex w-full overflow-x-auto overflow-y-hidden no-scrollbar rounded-lg p-1">
                {serviceCategories.map((cat) => (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className="flex-shrink-0 text-xs sm:text-sm"
                  >
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {/* Subscription Expired Warning */}
          {isSubscriptionExpired && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">Salon Currently Unavailable</h4>
                <p className="text-sm text-red-700">
                  This salon is not accepting bookings at the moment. Please check back later or contact them directly.
                </p>
              </div>
            </div>
          )}
          {servicesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading services...</span>
            </div>
          ) : servicesError ? (
            <ErrorState />
          ) : filteredServices.length > 0 ? (
            filteredServices.map((service: any, index: number) => (
                <div className="flex items-start gap-4 p-4 border rounded-md hover:bg-secondary/50 transition-all duration-300 group cursor-pointer">
                  {/* Service Image */}
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-secondary/30">
                    <Image
                      src={service.image || `https://placehold.co/400x400/png?text=${encodeURIComponent(service.name)}`}
                      alt={service.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold group-hover:text-primary transition-colors truncate">{service.name}</h3>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>{service.duration} min</span>
                        {service.description && (
                          <span className="line-clamp-1 flex-1">• {service.description}</span>
                        )}
                      </div>
                      {isSubscriptionExpired && (
                        <p className="text-[10px] text-red-600 font-medium mt-1">
                          This service is temporarily closed
                        </p>
                      )}

                      {/* Service Badges */}
                      <div className="flex gap-2 mt-2">
                        {service.homeService?.available && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary text-secondary">
                            <Home className="h-3 w-3 mr-1" />
                            Home Service
                          </span>
                        )}
                        {service.weddingService?.available && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-800">
                            <Heart className="h-3 w-3 mr-1" />
                            Wedding Service
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="mb-1">
                      {service.discountedPrice !== null && service.discountedPrice !== undefined && service.discountedPrice !== 0 && service.discountedPrice !== service.price ? (
                        <div>
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-muted-foreground line-through text-xs italic">
                              ₹{service.price}
                            </span>
                            <span className="font-bold text-lg text-primary">
                              ₹{service.discountedPrice}
                            </span>
                          </div>
                          <div className="text-[10px] text-green-600 font-bold uppercase tracking-wider">
                            {Math.round(((parseFloat(String(service.price)) - parseFloat(String(service.discountedPrice))) / parseFloat(String(service.price))) * 100)}% OFF
                          </div>
                        </div>
                      ) : (
                        <p className="font-bold text-lg text-primary">
                          ₹{service.price}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`h-8 px-4 rounded-full font-bold text-[10px] uppercase tracking-widest ${isSubscriptionExpired ? 'opacity-50' : 'hover:bg-primary hover:text-white transition-all'}`}
                      disabled={isSubscriptionExpired}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Store complete service data in sessionStorage
                        const serviceData = {
                          id: service.id,
                          name: service.name,
                          price: service.price,
                          discountedPrice: service.discountedPrice,
                          duration: service.duration,
                          category: service.category,
                          description: service.description,
                          image: service.image
                        };
                        sessionStorage.setItem("selectedService", JSON.stringify(serviceData));
                        onBookNow(service);
                      }}
                    >
                      {isSubscriptionExpired ? 'Unavailable' : 'Book'}
                    </Button>
                  </div>
                </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No services available in this category.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default ServicesSection;