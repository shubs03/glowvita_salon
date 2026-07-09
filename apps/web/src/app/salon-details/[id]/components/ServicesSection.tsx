"use client";

import Image from "next/image";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@repo/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { useGetPublicVendorServicesQuery, useGetPublicVendorWeddingPackagesQuery } from "@repo/store/services/api";
import { Loader2, AlertCircle, CheckCircle, Plus, Users, Gift, Heart, Home } from "lucide-react";

interface ServicesSectionProps {
  vendorId: string;
  onBookNow: (service?: any) => void;
  isSubscriptionExpired?: boolean;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ vendorId, onBookNow, isSubscriptionExpired = false }) => {
  const router = useRouter();
  const [serviceType, setServiceType] = useState<"Individual Services" | "Wedding Packages">("Individual Services");
  const [locationType, setLocationType] = useState<"Visit Salon" | "Home Service">("Visit Salon");
  const [activeCategory, setActiveCategory] = useState("All");

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
            image: pkg.image || "/images/wedding package placeholder.png",
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

  const filteredServicesByType = useMemo(() => {
    let filtered = services;
    if (serviceType === "Wedding Packages") {
      filtered = filtered.filter((s: any) => s.isWeddingPackage);
    } else {
      filtered = filtered.filter((s: any) => !s.isWeddingPackage);
    }

    if (locationType === "Home Service") {
      filtered = filtered.filter((s: any) => s.homeService?.available);
    }

    return filtered;
  }, [services, serviceType, locationType]);

  const serviceCategories = useMemo(() => {
    const categories = ["All"];
    if (filteredServicesByType.length > 0) {
      const uniqueCategories = Array.from(new Set(filteredServicesByType.map((service: any) => service.category))) as string[];
      const sortedCats = uniqueCategories.filter(c => c !== "Wedding Packages" && c !== "Other").sort();
      if (uniqueCategories.includes("Other")) {
        sortedCats.push("Other");
      }
      categories.push(...sortedCats);
    }
    return categories;
  }, [filteredServicesByType]);

  const filteredServices = useMemo(() => {
    return activeCategory === "All"
      ? filteredServicesByType
      : filteredServicesByType.filter((service: any) => service.category === activeCategory);
  }, [filteredServicesByType, activeCategory]);

  const isLoadingData = servicesLoading || weddingPackagesLoading;

  const handleBook = (e: React.MouseEvent, service: any) => {
    e.stopPropagation();
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
        image: service.image,
        locationType
      };
      sessionStorage.setItem("selectedService", JSON.stringify(serviceData));
    }
    onBookNow(service);
  };

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
    <section id="services" className="space-y-6">
      <div>
        <h2
          className="relative inline-block text-2xl md:text-3xl font-serif font-bold pb-3 mb-2"
          style={{ color: "#252B42" }}
        >
          Services Offered
          <span
            className="absolute left-0 bottom-0 h-[3px] w-full rounded-full"
            style={{
              background:
                "linear-gradient(to right, #252B42 0%, #252B42 40%, transparent 100%)",
            }}
          />
        </h2>
        <p className="text-sm md:text-base text-black mb-6">
          Choose from a variety of expert treatments to enhance your natural beauty.
        </p>
      </div>

      {/* Service Type Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => { setServiceType("Individual Services"); setActiveCategory("All"); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${serviceType === "Individual Services" ? "bg-[#422A3C] text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          style={{ border: '1px solid #00000082', borderRadius: '0.375rem' }}
        >
          <Image src="/images/customer (2) 1.png" alt="Individual" width={16} height={16} className={serviceType === "Individual Services" ? "brightness-0 invert" : ""} />
          Individual Services
        </button>
        <button
          onClick={() => { router.push(`/book/${vendorId}?tab=packages`); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors bg-white text-gray-700 hover:bg-gray-50`}
          style={{ border: '1px solid #00000082', borderRadius: '0.375rem' }}
        >
          <Image src="/images/like (1) 1.png" alt="Wedding" width={16} height={16} />
          Wedding Packages
        </button>
      </div>

      {/* Location Selection */}
      <div className="bg-[#f2f6fc] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image src="/images/calendar (6) 1.png" alt="Calendar" width={24} height={24} />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">How would you like to book?</h3>
            <p className="text-xs text-gray-600">Select your preferred services location type</p>
          </div>
        </div>
        <div className="flex bg-white rounded-md p-1 shadow-sm border border-gray-100">
          <button
            onClick={() => setLocationType("Visit Salon")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${locationType === "Visit Salon" ? "bg-[#452c42] text-white" : "bg-transparent text-gray-700 hover:bg-gray-50"
              }`}
          >
            <Image src="/images/scissors (1) 1.png" alt="Salon" width={16} height={16} className={locationType === "Visit Salon" ? "brightness-0 invert" : ""} />
            Visit Salon
          </button>
          <button
            onClick={() => setLocationType("Home Service")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${locationType === "Home Service" ? "bg-[#452c42] text-white" : "bg-transparent text-gray-700 hover:bg-gray-50"
              }`}
          >
            <Image src="/images/home (2) 1.png" alt="Home" width={16} height={16} className={locationType === "Home Service" ? "brightness-0 invert" : ""} />
            Home Service
          </button>
        </div>
      </div>

      {/* Category Dropdown */}
      {serviceCategories.length > 0 && (
        <div className="w-full sm:w-[500px] md:w-[600px] lg:w-[800px]">
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {serviceCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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

      {/* Services Grid */}
      {isLoadingData ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-muted-foreground">Loading services...</span>
        </div>
      ) : servicesError ? (
        <ErrorState />
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((service: any) => (
            <div key={service.id} className="flex p-3 rounded-xl hover:shadow-sm transition-shadow relative" style={{ border: '1px solid #00000080', background: 'linear-gradient(90deg, #EBF3FD 0%, #FFFFFF 100%)' }}>
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 mr-4">
                <Image src={service.image} alt={service.name} fill className="object-cover" />
              </div>

              <div className="flex flex-col flex-1 py-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base pr-2">{service.name}</h4>
                  {service.discountedPrice && service.discountedPrice < service.price && (
                    <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                      Save {Math.round(((service.price - service.discountedPrice) / service.price) * 100)}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mb-1.5">
                  <Image src="/images/clock (2) 4.png" alt="Time" width={14} height={14} />
                  <span className="text-xs sm:text-sm text-gray-500">{service.duration} mins</span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Image src="/images/rupee (2) 1.png" alt="Price" width={14} height={14} />
                    <span className="text-xs sm:text-sm text-gray-900 font-medium">
                      {service.discountedPrice && service.discountedPrice < service.price ? (
                        <>
                          <span className="line-through text-gray-400 mr-1">{service.price}/-</span>
                          {service.discountedPrice}/-
                        </>
                      ) : (
                        `${service.price}/-`
                      )}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleBook(e, service)}
                    disabled={isSubscriptionExpired}
                    className={`border border-gray-300 h-9 px-4 text-sm font-medium flex justify-center items-center gap-1 transition-colors rounded-none rounded-tr-xl rounded-bl-xl ${isSubscriptionExpired ? "opacity-50 cursor-not-allowed bg-gray-100" : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No services available in this category.</p>
        </div>
      )}
    </section>
  );
};

export default ServicesSection;