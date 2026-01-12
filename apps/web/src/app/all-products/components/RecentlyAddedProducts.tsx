"use client";

import React from "react";
import { MapPin, ArrowRight, Star } from "lucide-react";
import { useGetPublicProductsQuery } from "@repo/store/api";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";

interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  image: string;
  productImages?: string[];
  vendorName: string;
  vendorLocation?: string;
  category: string;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

const RecentlyAddedProducts = () => {
  const router = useRouter();
  const { 
    data: productsData, 
    isLoading, 
    error 
  } = useGetPublicProductsQuery(undefined);

  // Find the most recently created product
  const mostRecentProduct = React.useMemo(() => {
    if (!productsData?.products || !Array.isArray(productsData.products)) {
      return null;
    }

    // Sort products by creation date to find the most recent
    const sortedProducts = [...productsData.products].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Sort in descending order (most recent first)
    });

    return sortedProducts[0]; // Return the most recent product
  }, [productsData]);

  // Transform product data to match component requirements
  const product = React.useMemo(() => {
    if (!mostRecentProduct) return null;

    // Use all product images if available, otherwise use the main image
    const allImages = mostRecentProduct.productImages || [mostRecentProduct.image];
    
    // Ensure we have 4 images for the grid (duplicate if needed)
    const gridImages = [];
    for (let i = 0; i < 4; i++) {
      gridImages.push(allImages[i % allImages.length] || mostRecentProduct.image);
    }

    return {
      id: mostRecentProduct.id,
      name: mostRecentProduct.name || "Product Name",
      description: mostRecentProduct.description || 
        "Experience premium quality and exceptional value with this amazing product. Crafted with attention to detail and designed for your satisfaction.",
      price: mostRecentProduct.price || 0,
      salePrice: mostRecentProduct.salePrice,
      images: gridImages,
      vendorName: mostRecentProduct.vendorName || "Vendor",
      vendorLocation: mostRecentProduct.vendorLocation || "Location",
      category: mostRecentProduct.category || "Beauty Products",
      rating: mostRecentProduct.rating || 4.5,
      reviewCount: mostRecentProduct.reviewCount || 0,
      isNew: mostRecentProduct.isNew || true, // Always true since it's the most recent
      stock: mostRecentProduct.stock || 0,
      createdAt: mostRecentProduct.createdAt,
    };
  }, [mostRecentProduct]);

  if (isLoading) {
    return (
      <section className="py-20 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
              Recently Added Products
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Discover our newest additions to the collection
          </p>
        </div>

        {/* Loading Skeleton */}
        <div className="bg-card overflow-hidden duration-300">
          <div className="flex flex-col lg:flex-row-reverse"> {/* Reversed for right images */}
            {/* Right - Image Grid Skeleton */}
            <div className="w-full lg:w-1/2 p-6 md:p-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
                <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
                <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
                <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
              </div>
            </div>

            {/* Left - Details Skeleton */}
            <div className="w-full lg:w-1/2 p-6 md:p-8 flex flex-col justify-between">
              <div>
                {/* New Badge Skeleton */}
                <div className="h-6 w-16 bg-gray-200 rounded-full mb-3 animate-pulse"></div>

                {/* Product Name Skeleton */}
                <div className="h-8 bg-gray-200 rounded mb-3 animate-pulse w-3/4"></div>

                {/* Vendor Info Skeleton */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-4 bg-gray-200 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>

                {/* Category Skeleton */}
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>

                {/* Price Skeleton */}
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>

                {/* Rating Skeleton */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-4 bg-gray-200 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                </div>

                {/* Description Skeleton */}
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                </div>
              </div>

              {/* Bottom Section - Action Button Skeleton */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return null; // Don't render anything if there's an error or no data
  }

  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
            Recently Added Products
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Discover our newest additions to the collection
        </p>
      </div>

      {/* Product Card */}
      <div 
        className="bg-card overflow-hidden duration-300 cursor-pointer"
        onClick={() => router.push(`/product-details/${product.id}`)}
      >
        <div className="flex flex-col lg:flex-row-reverse"> {/* Reversed for right images */}
          {/* Right - Image Grid */}
          <div className="w-full lg:w-1/2 p-6 md:p-8">
            <div className="grid grid-cols-2 gap-4">
              {product.images.map((image, index) => (
                <div 
                  key={index} 
                  className="aspect-square rounded-2xl overflow-hidden group-hover:opacity-90 transition-opacity"
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Left - Details */}
          <div className="w-full lg:w-1/2 p-6 md:p-8 flex flex-col justify-between">
            {/* Top Section */}
            <div>
              {/* New Badge */}
              {product.isNew && (
                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  New
                </span>
              )}

              {/* Product Name */}
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {product.name}
              </h3>

              {/* Vendor Info */}
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{product.vendorLocation || product.vendorName}</span>
              </div>

              {/* Category */}
              <p className="text-muted-foreground text-sm mb-4">
                {product.category}
              </p>

              {/* Price */}
              <div className="flex items-center gap-2 mb-4">
                {product.salePrice ? (
                  <>
                    <span className="text-xl font-bold text-primary">
                      ₹{product.salePrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{product.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-primary">
                    ₹{product.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Description */}
              <p className="text-foreground mb-6">{product.description}</p>
            </div>

            {/* Bottom Section - Action Button */}
            <div className="mt-6 pt-6 border-t border-border">
              <Button 
                className="inline-flex items-center gap-2 text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/product-details/${product.id}`);
                }}
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentlyAddedProducts;