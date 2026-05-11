"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  useGetPublicVendorsQuery,
  useGetPublicCategoriesQuery,
  useGetPublicProductsQuery,
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
  Package,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/cn";
import { GlobalSearchBar } from "@/components/GlobalSearchBar";
import { MultiSalonMap } from "@/components/MultiSalonMap";
import { MarketingLayout } from "@/components/MarketingLayout";
import ProductCard from "@/components/ProductCard";

const SearchResults = () => {
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab");
  const productNameQuery = searchParams.get("productName") || "";
  const serviceQuery = searchParams.get("serviceName") || "";
  const categoryIdQuery = searchParams.get("categoryIds") || "";

  // ── Coordinate-based location (primary) ──────────────────────────────────
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const lat = latStr ? parseFloat(latStr) : undefined;
  const lng = lngStr ? parseFloat(lngStr) : undefined;

  // ── Human-readable label for display ─────────────────────────────────────
  const locationLabel =
    searchParams.get("locationLabel") ||
    searchParams.get("city") ||
    "";

  // ── Legacy city-name fallback (only when no coords provided) ─────────────
  const cityFallback = !lat && !lng ? searchParams.get("city") || "" : "";

  const { data: vendorsData, isLoading: vendorsLoading } =
    useGetPublicVendorsQuery({
      serviceName: serviceQuery || productNameQuery,
      ...(lat != null && lng != null ? { lat, lng } : {}),
      city: locationLabel || cityFallback,
      categoryIds: categoryIdQuery,
    });

  const { data: productsData, isLoading: productsLoading } =
    useGetPublicProductsQuery({
      ...(lat != null && lng != null ? { lat, lng } : {}),
      city: locationLabel || cityFallback,
    });

  const vendors = useMemo(
    () => vendorsData?.vendors || [],
    [vendorsData]
  );

  const products = useMemo(
    () => {
      let filtered = productsData?.products || [];
      const combinedQuery = (productNameQuery || serviceQuery).toLowerCase();
      if (combinedQuery) {
        filtered = filtered.filter((p: any) => 
          p.name.toLowerCase().includes(combinedQuery) ||
          p.description?.toLowerCase().includes(combinedQuery) ||
          p.brand?.toLowerCase().includes(combinedQuery)
        );
      }
      return filtered;
    },
    [productsData, serviceQuery, productNameQuery]
  );

  const [activeTab, setActiveTab] = useState<"salons" | "products">(
    activeTabParam === "products" ? "products" : "salons"
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] bg-white overflow-hidden relative">
      {/* Search Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 z-50 shadow-sm flex-shrink-0">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center gap-6">
          <GlobalSearchBar variant="compact" className="max-w-[1000px] mx-0" />
          <div className="hidden xl:flex items-center gap-2 text-sm text-gray-400 font-bold whitespace-nowrap">
            <span className="text-gray-900">
              {activeTab === "salons" ? vendors.length : products.length}
            </span> {activeTab === "salons" ? "venues" : "products"} found
            {locationLabel && (
              <>
                {" "}near{" "}
                <span className="text-primary font-black">{locationLabel}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content: Split View */}
      <main className="flex-1 flex overflow-hidden">

        {/* Left Side: Results List */}
        <section className="w-full lg:w-[55%] xl:w-[60%] h-full overflow-y-auto custom-scrollbar bg-[#FBFCFF]">
          <div className="p-4 md:p-8 max-w-4xl mx-auto">

            <div className="flex flex-col gap-6 mb-8">
              <div className="flex items-center justify-between">
                <h1 className="text-xl md:text-2xl font-headline font-black text-gray-900 tracking-tight">
                  {serviceQuery
                    ? `Results for "${serviceQuery}"`
                    : locationLabel
                    ? `${activeTab === "salons" ? "Salons" : "Products"} near ${locationLabel}`
                    : `Explore ${activeTab === "salons" ? "Salons" : "Products"}`}
                </h1>

              </div>

              {/* Tabs */}
              <div className="flex items-center gap-4 border-b border-gray-100">
                <button
                  onClick={() => setActiveTab("salons")}
                  className={cn(
                    "pb-3 px-1 text-sm font-black uppercase tracking-widest transition-all relative",
                    activeTab === "salons" ? "text-primary" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  Salons ({vendors.length})
                  {activeTab === "salons" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("products")}
                  className={cn(
                    "pb-3 px-1 text-sm font-black uppercase tracking-widest transition-all relative",
                    activeTab === "products" ? "text-primary" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  Products ({products.length})
                  {activeTab === "products" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-6 pb-20">
              {activeTab === "salons" ? (
                vendorsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-[30px] p-6 flex flex-col sm:flex-row gap-6 animate-pulse border border-gray-50 shadow-sm"
                    >
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
                      onClick={() =>
                        (window.location.href = `/salon-details/${vendor._id}`)
                      }
                    >
                      {/* Salon Image */}
                      <div className="relative w-full sm:w-60 h-60 shrink-0">
                        <Image
                          src={
                            vendor.profileImage ||
                            `https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600`
                          }
                          alt={vendor.businessName}
                          fill
                          className="object-cover rounded-[24px] group-hover:scale-105 transition-transform duration-700"
                        />
                        {/* Removed Bookmark icon as per user request */}
                      </div>

                      {/* Content */}
                      <div className="flex-1 py-4 pr-6 pl-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {vendor.rating || "0.0"}
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            ({vendor.reviewCount || 0} reviews)
                          </span>
                        </div>

                        <h3 className="text-xl md:text-2xl font-headline font-black text-gray-900 group-hover:text-primary transition-colors leading-tight mb-1">
                          {vendor.businessName}
                        </h3>

                        <div className="flex items-center gap-1 text-gray-500 text-xs font-bold mb-6">
                          <MapPin className="w-3.5 h-3.5 text-gray-300" />
                          <span>
                            {vendor.city}, {vendor.state}
                          </span>
                        </div>

                        {/* Service Highlights */}
                        <div className="space-y-2">
                          {vendor.services.slice(0, 2).map((svc: any) => (
                            <div
                              key={svc._id}
                              className="flex justify-between items-center p-3 sm:px-4 sm:py-3 rounded-2xl bg-gray-50 border border-transparent hover:border-primary/10 hover:bg-white group/svc transition-all"
                            >
                              <div className="flex-1">
                                <p className="font-bold text-gray-800 text-sm">
                                  {svc.name}
                                </p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                  {svc.duration} mins •{" "}
                                  {svc.category?.name || "Service"}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                {svc.discountedPrice && svc.discountedPrice < svc.price ? (
                                  <div className="flex flex-col items-end gap-0.5">
                                    <p className="text-base font-black text-gray-900 tracking-tighter leading-none">
                                      ₹{svc.discountedPrice}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 line-through leading-none">
                                      ₹{svc.price}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-base font-black text-gray-900 tracking-tighter">
                                    ₹{svc.price}
                                  </p>
                                )}
                                <Button className="h-8 px-4 rounded-full font-black text-[10px] uppercase tracking-widest">
                                  Book
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : vendorsData?.noServiceArea ? (
                  <div className="bg-white rounded-[40px] p-16 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MapPin className="w-8 h-8 text-primary/30" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
                      We're not available here yet
                    </h2>
                    <p className="text-gray-400 text-sm font-medium mb-8 max-w-md mx-auto">
                      We are currently expanding and haven't reached your location yet. We’ll be available in your area soon—stay tuned!
                    </p>
                    <Button
                      variant="default"
                      className="rounded-full px-8 h-12 shadow-lg"
                      onClick={() => (window.location.href = "/search")}
                    >
                      Explore all salons
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white rounded-[40px] p-16 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MapPin className="w-8 h-8 text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                      No salons found
                      {locationLabel ? ` near "${locationLabel}"` : ""}
                    </h2>
                    <p className="text-gray-400 text-sm font-medium mb-8">
                      We couldn't find any results for your search. Try adjusting
                      your filters or searching in a nearby area.
                    </p>
                    <Button
                      variant="outline"
                      className="rounded-full px-8"
                      onClick={() => (window.location.href = "/search")}
                    >
                      Clear filters
                    </Button>
                  </div>
                )
              ) : (
                /* Products Tab */
                productsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-[30px] p-4 animate-pulse border border-gray-50 h-80"></div>
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {products.map((product: any) => (
                      <ProductCard key={product.id} {...product} />
                    ))}
                  </div>
                ) : productsData?.noServiceArea ? (
                  <div className="bg-white rounded-[40px] p-16 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MapPin className="w-8 h-8 text-primary/30" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
                      We're not available here yet
                    </h2>
                    <p className="text-gray-400 text-sm font-medium mb-8 max-w-md mx-auto">
                      We are currently expanding and haven't reached your location yet. We’ll be available in your area soon—stay tuned!
                    </p>
                    <Button
                      variant="default"
                      className="rounded-full px-8 h-12 shadow-lg"
                      onClick={() => (window.location.href = "/all-products")}
                    >
                      Explore all products
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white rounded-[40px] p-16 text-center border border-gray-100 w-full">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="w-8 h-8 text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                      No products found
                      {locationLabel ? ` near "${locationLabel}"` : ""}
                    </h2>
                    <p className="text-gray-400 text-sm font-medium mb-8">
                      We couldn't find any products matching your search.
                    </p>
                    <Button
                      variant="outline"
                      className="rounded-full px-8"
                      onClick={() => (window.location.href = "/all-products")}
                    >
                      Explore products
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Right Side: Google Map */}
        <section className="hidden lg:block lg:w-[45%] xl:w-[40%] h-full bg-gray-100 relative shadow-2xl z-10">
          <MultiSalonMap vendors={vendors} searchQuery={locationLabel} />
        </section>
      </main>
    </div>
  );
};

// Main Page Component wrapped in MarketingLayout
const SearchPage = () => {
  return (
    <MarketingLayout>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="font-black text-xs uppercase tracking-[0.2em] text-gray-400">
                Personalizing Results...
              </p>
            </div>
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </MarketingLayout>
  );
};

export default SearchPage;
