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
import { useGetPublicVendorServicesQuery, useGetPublicVendorWeddingPackagesQuery } from "@repo/store/services/api";
import { Loader2, AlertCircle, Home, Heart, Plus, Users, Gift, Clock, CheckCircle } from "lucide-react";

interface ServicesSectionProps {
  vendorId: string;
  onBookNow: (service?: any) => void;
  isSubscriptionExpired?: boolean;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ vendorId, onBookNow, isSubscriptionExpired = false }) => {
  const [activeServiceTab, setActiveServiceTab] = useState("All");

  // Fetch services dynamically from API
  const { data: servicesData, isLoading: servicesLoading, error: servicesError } = useGetPublicVendorServicesQuery(vendorId);
  // Fetch wedding packages dynamically
  const { data: weddingPackagesData, isLoading: weddingPackagesLoading } = useGetPublicVendorWeddingPackagesQuery(vendorId);

  // Process services data
  const services = useMemo(() => {
    let allItems: any[] = [];
    
    // Add regular services
    if (servicesData?.services && servicesData.services.length > 0) {
      const regularServices = servicesData.services.map((service: any) => ({
        id: service._id || service.id,
        name: service.name || "",
        price: service.price || 0,
        discountedPrice: service.discountedPrice,
        duration: service.duration || 60,
        category: service.category?.name || service.category || "Other",
        description: service.description || "",
        image: service.image || "https://placehold.co/200x200/png?text=" + encodeURIComponent(service.name || "Service"),
        addOns: service.addOns || [],
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

      if (rawPackages.length > 0) {
        const processedPackages = rawPackages
          .filter((pkg: any) => pkg.isActive !== false && pkg.status === 'approved')
          .map((pkg: any) => ({
            id: pkg._id || pkg.id,
            name: pkg.name || "",
            price: pkg.totalPrice || 0,
            discountedPrice: pkg.discountedPrice,
            duration: pkg.duration || 0,
            category: "Wedding Packages",
            description: pkg.description || "",
            image: pkg.image || "https://placehold.co/200x200/png?text=" + encodeURIComponent(pkg.name || "Package"),
            servicesList: pkg.services || [],
            staffCount: pkg.staffCount || 1,
            assignedStaff: Array.isArray(pkg.assignedStaff) ? pkg.assignedStaff.map((s: any) => typeof s === 'string' ? s : (s.name || s.firstName || 'Staff')) : [],
            isWeddingPackage: true,
            // Mock empty addOns, homeService, weddingService for type compatibility
            addOns: [],
            homeService: { available: false },
            weddingService: { available: true }
          }));
        allItems = [...allItems, ...processedPackages];
      }
    }

    return allItems;
  }, [servicesData, weddingPackagesData]);

  // Generate dynamic service categories based on actual services
  const serviceCategories = useMemo(() => {
    const categories = ["All"];
    if (services.length > 0) {
      const uniqueCategories = Array.from(new Set(services.map((service: any) => service.category))) as string[];
      // Keep "Wedding Packages" at the end if it exists
      const sortedCats = uniqueCategories.filter(c => c !== "Wedding Packages" && c !== "Other").sort();
      if (uniqueCategories.includes("Other")) {
        sortedCats.push("Other");
      }
      if (uniqueCategories.includes("Wedding Packages")) {
        sortedCats.push("Wedding Packages");
      }
      categories.push(...sortedCats);
    }
    return categories;
  }, [services]);

  // Filter services by category
  const filteredServices = useMemo(() => {
    return activeServiceTab === "All"
      ? services
      : services.filter((service: any) => service.category === activeServiceTab);
  }, [services, activeServiceTab]);

  const isLoadingData = servicesLoading || weddingPackagesLoading;

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
          {isLoadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading services...</span>
            </div>
          ) : servicesError ? (
            <ErrorState />
          ) : filteredServices.length > 0 ? (
            filteredServices.map((service: any, index: number) => (
              <div key={service.id || index} className="flex flex-col sm:flex-row items-start gap-4 p-4 border rounded-md hover:bg-secondary/50 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                {/* Service Image */}
                <div className="relative w-full sm:w-32 h-40 sm:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-secondary/30">
                  <Image
                    src={service.image || `https://placehold.co/400x400/png?text=${encodeURIComponent(service.name)}`}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {service.isWeddingPackage && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500 text-white shadow-sm flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      Wedding Package
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 w-full mt-2 sm:mt-0">
                  <h3 className="font-semibold group-hover:text-primary transition-colors text-lg truncate pr-14 sm:pr-0">{service.name}</h3>
                  <div className="text-sm text-muted-foreground space-y-1 mt-1">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {service.duration} min</span>
                      {service.isWeddingPackage && service.staffCount && (
                         <span className="flex items-center gap-1"><Users className="w-3 h-3"/> {service.staffCount} Staff</span>
                      )}
                      {service.isWeddingPackage && service.servicesList && (
                         <span className="flex items-center gap-1"><Gift className="w-3 h-3"/> {service.servicesList.length} Services</span>
                      )}
                    </div>
                    {service.description && (
                      <p className="line-clamp-2 mt-2 text-sm text-muted-foreground/80">{service.description}</p>
                    )}
                    
                    {/* Included Services for Wedding Packages */}
                    {service.isWeddingPackage && (
                      <div className="mt-3 bg-rose-50/50 border border-rose-100/50 rounded-xl p-3">
                         <p className="text-[11px] font-bold text-rose-600 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                           <CheckCircle className="w-3.5 h-3.5"/> What's Included:
                         </p>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                           {service.servicesList && service.servicesList.length > 0 && service.servicesList.map((incService: any, idx: number) => (
                             <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground/90 bg-white/60 px-2 py-1.5 rounded-lg border border-rose-100/30">
                               <Plus className="w-3 h-3 text-rose-400" />
                               <span>{incService.serviceName || "Service"} {incService.quantity > 1 ? `(x${incService.quantity})` : ""}</span>
                             </div>
                           ))}
                           {/* Expert Staff badge as requested */}
                           <div className="flex items-center gap-2 text-xs text-muted-foreground/90 bg-white/60 px-2 py-1.5 rounded-lg border border-rose-100/30">
                              <Users className="w-3 h-3 text-rose-400" />
                              <span>Expert Staff</span>
                           </div>
                         </div>
                         
                         {service.assignedStaff && service.assignedStaff.length > 0 && (
                           <div className="mt-3 pt-3 border-t border-rose-100/50">
                             <p className="text-[10px] font-semibold text-rose-500 mb-1">Assigned Experts:</p>
                             <div className="flex flex-wrap gap-2">
                               {service.assignedStaff.map((staffName: string, idx: number) => (
                                 <span key={idx} className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                   <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                                   {staffName}
                                 </span>
                               ))}
                             </div>
                           </div>
                         )}
                      </div>
                    )}

                    {/* Subscription Expired Status */}
                    {isSubscriptionExpired && (
                      <p className="text-[10px] text-red-600 font-medium mt-1">
                        This {service.isWeddingPackage ? "package" : "service"} is temporarily closed
                      </p>
                    )}

                    {/* Service Badges */}
                    {!service.isWeddingPackage && (
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
                    )}
                  </div>
                </div>
                <div className="text-right sm:ml-4 self-end sm:self-auto w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-start pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50 mt-3 sm:mt-0">
                  <div className="mb-2 text-left sm:text-right">
                    {service.isWeddingPackage && <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5 font-semibold">Package Price</p>}
                    {service.discountedPrice !== null && service.discountedPrice !== undefined && service.discountedPrice !== 0 && service.discountedPrice !== service.price ? (
                      <div>
                        <div className="flex items-center justify-start sm:justify-end gap-2">
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
                    className={`h-9 px-6 rounded-full font-bold text-xs uppercase tracking-widest w-full sm:w-auto ${isSubscriptionExpired ? 'opacity-50' : 'hover:bg-primary hover:text-white transition-all shadow-sm'}`}
                    disabled={isSubscriptionExpired}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Redirect to book page with vendorId - since this is global components 
                      // Wait, if it is in salon-details, onBookNow is passed from page
                      if (service.isWeddingPackage) {
                        const packageData = { ...service, isWeddingPackage: true };
                        sessionStorage.setItem("selectedWeddingPackage", JSON.stringify(packageData));
                      } else {
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
                      }
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