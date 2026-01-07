"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  useGetPublicVendorsQuery, 
  useGetPublicCategoriesQuery,
} from "@repo/store/services/api";
import { 
  Star, 
  MapPin,
  Clock,
  Scissors,
  Bookmark,
  Share2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/cn";
import { GlobalSearchBar } from "@/components/GlobalSearchBar";
import { MultiSalonMap } from "@/components/MultiSalonMap";
import { MarketingLayout } from "@/components/MarketingLayout";

const SearchResults = () => {
  const searchParams = useSearchParams();
  const serviceQuery = searchParams.get("serviceName") || "";
  const locationQuery = searchParams.get("city") || "";
  const categoryIdQuery = searchParams.get("categoryIds") || "";

  const { data: vendorsData, isLoading: vendorsLoading } = useGetPublicVendorsQuery({
    serviceName: serviceQuery,
    city: locationQuery,
    categoryIds: categoryIdQuery,
  });

  const vendors = useMemo(() => vendorsData?.vendors || [], [vendorsData]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] bg-white overflow-hidden relative">
      {/* Search Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 z-50 shadow-sm flex-shrink-0">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center gap-6">
          <GlobalSearchBar variant="compact" className="max-w-[1000px] mx-0" />
          <div className="hidden xl:flex items-center gap-2 text-sm text-gray-400 font-bold whitespace-nowrap">
            <span className="text-gray-900">{vendors.length}</span> venues found
          </div>
        </div>
      </header>

      {/* Main Content: Split View */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Results List */}
        <section className="w-full lg:w-[55%] xl:w-[60%] h-full overflow-y-auto custom-scrollbar bg-[#FBFCFF]">
          <div className="p-4 md:p-8 max-w-4xl mx-auto">
            
            {/* Sort & Quick Filters */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-xl md:text-2xl font-headline font-black text-gray-900 tracking-tight">
                {serviceQuery ? `Results for "${serviceQuery}"` : "Explore Salons"}
              </h1>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-full text-xs font-bold text-gray-600 hover:shadow-md transition-all">
                  Recommended <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="space-y-6 pb-20">
              {vendorsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-[30px] p-6 flex flex-col sm:flex-row gap-6 animate-pulse border border-gray-50 shadow-sm">
                    <div className="w-full sm:w-48 h-48 bg-gray-50 rounded-[24px] shrink-0"></div>
                    <div className="flex-1 space-y-4 py-2">
                      <div className="h-6 bg-gray-50 rounded-full w-2/3"></div>
                      <div className="h-4 bg-gray-50 rounded-full w-1/3"></div>
                      <div className="pt-4 space-y-3">
                        <div className="h-12 bg-gray-50 rounded-2xl w-full"></div>
                        <div className="h-12 bg-gray-50 rounded-2xl w-full"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : vendors.length > 0 ? (
                vendors.map((vendor: any) => (
                  <div 
                    key={vendor._id} 
                    className="bg-white rounded-[30px] p-2 flex flex-col sm:flex-row gap-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] transition-all duration-500 group cursor-pointer overflow-hidden"
                    onClick={() => window.location.href = `/salon-details/${vendor._id}`}
                  >
                    {/* Salon Image Section */}
                    <div className="relative w-full sm:w-60 h-60 shrink-0">
                      <Image 
                        src={vendor.profileImage || `https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600`}
                        alt={vendor.businessName}
                        fill
                        className="object-cover rounded-[24px] group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-white text-gray-800">
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 py-4 pr-6 pl-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          4.9
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">(200+ reviews)</span>
                      </div>
                      
                      <h3 className="text-xl md:text-2xl font-headline font-black text-gray-900 group-hover:text-primary transition-colors leading-tight mb-1">
                        {vendor.businessName}
                      </h3>
                      
                      <div className="flex items-center gap-1 text-gray-500 text-xs font-bold mb-6">
                        <MapPin className="w-3.5 h-3.5 text-gray-300" />
                        <span>{vendor.city}, {vendor.state}</span>
                      </div>

                      {/* Service Highlights */}
                      <div className="space-y-2">
                        {vendor.services.slice(0, 2).map((svc: any) => (
                          <div 
                            key={svc._id} 
                            className="flex justify-between items-center p-3 sm:px-4 sm:py-3 rounded-2xl bg-gray-50 border border-transparent hover:border-primary/10 hover:bg-white group/svc transition-all"
                          >
                            <div className="flex-1">
                              <p className="font-bold text-gray-800 text-sm">{svc.name}</p>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{svc.duration} mins • {svc.category?.name || "Service"}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <p className="text-base font-black text-gray-900 tracking-tighter">₹{svc.price}</p>
                              <Button className="h-8 px-4 rounded-full font-black text-[10px] uppercase tracking-widest">Book</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-[40px] p-16 text-center border border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Scissors className="w-8 h-8 text-gray-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">No salons found</h2>
                  <p className="text-gray-400 text-sm font-medium mb-8">Try adjusting your filters or searching in a different area.</p>
                  <Button variant="outline" className="rounded-full px-8" onClick={() => window.location.href = '/search'}>Clear filters</Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Side: Google Map */}
        <section className="hidden lg:block lg:w-[45%] xl:w-[40%] h-full bg-gray-100 relative shadow-2xl z-10">
          <MultiSalonMap vendors={vendors} />
        </section>

      </main>
    </div>
  );
};

// Main Page Component wrapped in MarketingLayout
const SearchPage = () => {
  return (
    <MarketingLayout>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-xs uppercase tracking-[0.2em] text-gray-400">Personalizing Results...</p>
          </div>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </MarketingLayout>
  );
};

export default SearchPage;
