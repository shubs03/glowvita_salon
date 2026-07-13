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
      <p className="text-black">Unable to load services. Please try again later.</p>
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
      <div className="flex gap-2 md:gap-4 overflow-x-auto pb-1 hide-scrollbar">
        <button
          onClick={() => { setServiceType("Individual Services"); setActiveCategory("All"); }}
          className={`flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-2 text-[11px] md:text-sm font-medium whitespace-nowrap transition-colors ${serviceType === "Individual Services" ? "bg-[#422A3C] text-white" : "bg-white text-black hover:bg-gray-50"
            }`}
          style={{ border: '1px solid #00000082', borderRadius: '0.375rem' }}
        >
          <Image src="/images/Mask group (3).png" alt="Individual" width={16} height={16} className={serviceType === "Individual Services" ? "brightness-0 invert" : ""} />
          Individual Services
        </button>
        <button
          onClick={() => { router.push(`/book/${vendorId}?tab=packages`); }}
          className={`flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-2 text-[11px] md:text-sm font-medium whitespace-nowrap transition-colors bg-white text-black hover:bg-gray-50`}
          style={{ border: '1px solid #00000082', borderRadius: '0.375rem' }}
        >
          <Image src="/images/like (1) 1.png" alt="Wedding" width={16} height={16} />
          Wedding Packages
        </button>
      </div>

      {/* Location Selection */}
      <div className="bg-[#EBF3FD] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image src="/images/calendar (6) 1.png" alt="Calendar" width={24} height={24} />
          <div>
            <h3 className="font-semibold text-black text-sm md:text-base">How would you like to book?</h3>
            <p className="text-xs md:text-sm text-black">Select your preferred services location type</p>
          </div>
        </div>
        <div className="flex flex-nowrap overflow-x-auto hide-scrollbar bg-white rounded-md p-1 shadow-sm border border-gray-100 justify-start sm:justify-center w-full sm:w-auto">
          <button
            onClick={() => setLocationType("Visit Salon")}
            className={`flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-2 rounded-md text-[11px] md:text-sm font-medium whitespace-nowrap transition-colors ${locationType === "Visit Salon" ? "bg-[#452c42] text-white" : "bg-transparent text-black hover:bg-gray-50"
              }`}
          >
            <Image src="/images/Mask group (4).png" alt="Salon" width={16} height={16} className={locationType === "Visit Salon" ? "brightness-0 invert" : ""} />
            Visit Salon
          </button>
          <button
            onClick={() => setLocationType("Home Service")}
            className={`flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-2 rounded-md text-[11px] md:text-sm font-medium whitespace-nowrap transition-colors ${locationType === "Home Service" ? "bg-[#452c42] text-white" : "bg-transparent text-black hover:bg-gray-50"
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
          <span className="text-black">Loading services...</span>
        </div>
      ) : servicesError ? (
        <ErrorState />
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.slice(0, 8).map((service: any) => (
            <div key={service.id} className="flex p-2.5 rounded-xl hover:shadow-sm transition-shadow relative" style={{ border: '1px solid #00000080', background: 'linear-gradient(90deg, #EBF3FD 0%, #FFFFFF 100%)' }}>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 mr-3">
                <Image src={service.image} alt={service.name} fill className="object-cover" />
              </div>

              <div className="flex flex-col flex-1 py-0.5 justify-center">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-black text-sm sm:text-base pr-2">{service.name}</h4>
                  {service.discountedPrice && service.discountedPrice < service.price && (
                    <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                      Save {Math.round(((service.price - service.discountedPrice) / service.price) * 100)}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mb-1">
                  <Image src="/images/clock (2) 4.png" alt="Time" width={12} height={12} />
                  <span className="text-xs text-black">{service.duration} mins</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Image src="/images/rupee (2) 1.png" alt="Price" width={12} height={12} />
                    <span className="text-xs sm:text-sm text-black font-medium">
                      {service.discountedPrice && service.discountedPrice < service.price ? (
                        <>
                          <span className="line-through text-black mr-1">{service.price}/-</span>
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
                    className={`border h-7 md:h-8 px-2.5 md:px-4 text-[11px] md:text-sm font-medium flex justify-center items-center gap-1 transition-colors rounded-none rounded-tr-xl rounded-bl-xl ${isSubscriptionExpired ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-black" : "hover:bg-gray-50"
                      }`}
                    style={!isSubscriptionExpired ? { borderColor: '#422A3C', color: '#422A3C' } : {}}
                  >
                    <Plus className="w-2.5 h-2.5 md:w-3 md:h-3" /> Add
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-black">No services available in this category.</p>
        </div>
      )}
    </section>
  );
};

export default ServicesSection;