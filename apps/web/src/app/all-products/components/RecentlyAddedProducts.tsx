"use client";

import React from "react";
import { MapPin, ArrowRight, Star } from "lucide-react";
import { useGetPublicProductsQuery } from "@repo/store/api";
import { useSalonFilter } from "@/components/landing/SalonFilterContext";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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
  const { userLat, userLng } = useSalonFilter();
  const { isAuthenticated } = useAuth();
  
  const {
    data: productsData,
    isLoading,
    error
  } = useGetPublicProductsQuery({
    lat: userLat || undefined,
    lng: userLng || undefined,
  });

  // Find the most recently created product
  const mostRecentProduct = React.useMemo(() => {
    if (!productsData?.products || !Array.isArray(productsData.products)) {
      return null;
    }

    // Filter by stock first
    const availableProducts = productsData.products.filter((p: ProductData) => (p.stock || 0) > 0);
    if (availableProducts.length === 0) return null;

    // Sort products by creation date to find the most recent
    const sortedProducts = [...availableProducts].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Sort in descending order (most recent first)
    });

    return sortedProducts[0]; // Return the most recent product
  }, [productsData]);

  // Transform product data to match component requirements
  const product = React.useMemo(() => {
    if (!mostRecentProduct) return null;

    const defaultProductImage = "/images/product-placeholder.png";
    const mainImage = (mostRecentProduct.image && mostRecentProduct.image.trim()) ? mostRecentProduct.image : defaultProductImage;
    // Use all product images if available, otherwise use the main image
    const allImages = mostRecentProduct.productImages?.length ? mostRecentProduct.productImages : [mainImage];

    return {
      id: mostRecentProduct.id,
      name: mostRecentProduct.name || "Product Name",
      description: mostRecentProduct.description ||
        "Experience premium quality and exceptional value with this amazing product. Crafted with attention to detail and designed for your satisfaction.",
      price: mostRecentProduct.price || 0,
      salePrice: mostRecentProduct.salePrice,
      image: mainImage,
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
      <section className="py-6 px-6 lg:px-8 max-w-5xl mx-auto bg-background">
        {/* Section Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-2">
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
            {/* Right - Featured Image Skeleton */}
            <div className="w-full lg:w-1/2 p-4 md:p-6 flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-[320px] aspect-[4/5] bg-gray-200 rounded-3xl animate-pulse shadow-sm"></div>
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
    <section className="py-6 px-6 lg:px-8 max-w-5xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-2">
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
          {/* Right - Featured Image (Properly Sized) */}
          <div className="w-full lg:w-1/2 p-4 md:p-6 flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-[320px] aspect-[4/5] rounded-3xl overflow-hidden group-hover:opacity-90 transition-opacity shadow-xl border border-border/50 bg-muted/30">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "/images/product-placeholder.png"; }}
              />
            </div>
          </div>

          {/* Left - Details */}
          <div className="w-full lg:w-1/2 p-4 md:p-6 flex flex-col justify-center">
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
                {product.salePrice && product.salePrice > 0 ? (
                  <>
                    <span className="text-xl font-bold text-primary">
                      ₹{product.salePrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{product.price.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
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
              <div className="flex flex-wrap items-center gap-3">
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

                <Button
                  variant="outline"
                  className="inline-flex items-center gap-2 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isAuthenticated) {
                      router.push(`/client-login?redirect=${encodeURIComponent(window.location.pathname)}`);
                      return;
                    }
                    // Handle buy now logic
                    const productData = {
                      id: product.id,
                      name: product.name,
                      price: product.salePrice && product.salePrice > 0 ? product.salePrice : product.price,
                      originalPrice: product.price,
                      hasSale: !!(product.salePrice && product.salePrice > 0),
                      image: product.image,
                      vendorName: product.vendorName,
                      vendorId: product.vendorId || 'unknown-vendor',
                      quantity: 1,
                    };
                    localStorage.setItem('buyNowProduct', JSON.stringify(productData));
                    router.push('/checkout');
                  }}
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentlyAddedProducts;