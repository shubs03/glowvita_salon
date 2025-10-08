"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@repo/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { useGetPublicVendorServicesQuery } from "@repo/store/api";
import { Loader2 } from "lucide-react";

interface ServicesSectionProps {
  vendorId: string;
  onBookNow: (service?: any) => void;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ vendorId, onBookNow }) => {
  const [activeServiceTab, setActiveServiceTab] = useState("All");
  
  // Fetch services dynamically from API
  const { data: servicesData, isLoading: servicesLoading, error: servicesError } = useGetPublicVendorServicesQuery(vendorId);
  // Process services data
  const services = useMemo(() => {
    if (servicesData?.services && servicesData.services.length > 0) {
      return servicesData.services.map((service: any) => ({
        name: service.name || "",
        price: service.price || 0,
        duration: service.duration || 60,
        category: service.category?.name || service.category || "Other",
        description: service.description || "",
        image: service.image || "https://placehold.co/200x200/e2e8f0/64748b?text=" + (service.name || "Service").replace(/\s/g, '+')
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
          {servicesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading services...</span>
            </div>
          ) : servicesError ? (
            <ErrorState />
          ) : filteredServices.length > 0 ? (
            filteredServices.map((service: any, index: number) => (
              <div
                key={`${service.name}-${index}`}
                className="flex items-center p-4 border rounded-md hover:bg-secondary/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{service.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    <span>{service.duration} min</span>
                    {service.description && (
                      <span className="ml-2">• {service.description}</span>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold">
                    ₹{service.price.toFixed(2)}
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-1" 
                    onClick={() => onBookNow(service)}
                  >
                    Book
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