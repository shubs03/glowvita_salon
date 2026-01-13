"use client";

import { cn } from "@repo/ui/cn";
import { Button } from "@repo/ui/button";
import { ArrowRight, ShoppingCart, Star, Heart } from "lucide-react";
import { useGetPublicProductsQuery } from "@repo/store/services/api";
import { NewProductCard } from "./NewProductCard";

export function FeaturedProductsSection() {
  // Fetch public products data
  const { data: ProductsData, isLoading: productsLoading, error: productsError } = useGetPublicProductsQuery(undefined);

  // Mock products data for fallback
  const mockProducts = [
    {
      id: "1",
      name: "Radiant Glow Serum",
      price: 45.99,
      image: "https://placehold.co/320x224.png",
      hint: "Brightening vitamin C serum",
      rating: 4.8,
      reviewCount: 324,
      vendorName: "Aura Cosmetics",
      vendorId: "mock-vendor-1",
      isNew: true,
      description:
        "A powerful vitamin C serum that brightens and evens skin tone",
      category: "skincare",
    },
    {
      id: "2",
      name: "Luxury Face Cream",
      price: 78.5,
      image: "https://placehold.co/320x224.png",
      hint: "Anti-aging moisturizer",
      rating: 4.9,
      reviewCount: 567,
      vendorName: "Serenity Skincare",
      vendorId: "mock-vendor-2",
      description: "Rich anti-aging cream with peptides and hyaluronic acid",
      category: "skincare",
    },
    {
      id: "3",
      name: "Matte Lipstick Set",
      price: 32.0,
      image: "https://placehold.co/320x224.png",
      hint: "Long-lasting matte lipsticks",
      rating: 4.7,
      reviewCount: 892,
      vendorName: "Chroma Beauty",
      vendorId: "mock-vendor-3",
      isNew: true,
      description: "Set of 6 long-lasting matte lipsticks in trending shades",
      category: "cosmetics",
    },
    {
      id: "4",
      name: "Gentle Cleansing Oil",
      price: 28.75,
      image: "https://placehold.co/320x224.png",
      hint: "Removes makeup effortlessly",
      rating: 4.6,
      reviewCount: 445,
      vendorName: "Earthly Essentials",
      vendorId: "mock-vendor-4",
      description: "Natural cleansing oil that removes makeup and impurities",
      category: "facecare",
    },
    {
      id: "5",
      name: "Body Butter Trio",
      price: 56.99,
      image: "https://placehold.co/320x224.png",
      hint: "Nourishing body care set",
      rating: 4.8,
      reviewCount: 234,
      vendorName: "Earthly Essentials",
      vendorId: "mock-vendor-4",
      description: "Set of 3 rich body butters with natural ingredients",
      category: "bodycare",
    },
    {
      id: "6",
      name: "Eye Shadow Palette",
      price: 42.25,
      image: "https://placehold.co/320x224.png",
      hint: "12 versatile shades",
      rating: 4.9,
      reviewCount: 678,
      vendorName: "Chroma Beauty",
      vendorId: "mock-vendor-3",
      description: "Professional eyeshadow palette with 12 blendable shades",
      category: "cosmetics",
    },
  ];

  // Use dynamic products or fallback to mock data
  const products = ProductsData?.products && ProductsData.products.length > 0 
    ? ProductsData.products.slice(0, 8) // Limit to 8 products for the landing page
    : mockProducts;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 transition-all duration-1000 lg:py-16 md:py-16 py-8">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3">
            Our Featured Products
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Discover our premium selection of salon products, carefully curated for professionals and enthusiasts alike.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {productsLoading ? (
            // Loading skeleton cards for products
            Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`product-skeleton-${index}`}
                className="relative overflow-hidden rounded-md border bg-card animate-pulse"
              >
                <div className="aspect-[4/3] bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-3 bg-gray-200 rounded mb-1 w-20"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-32"></div>
                  <div className="h-3 bg-gray-200 rounded mb-3 w-full"></div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))
          ) : (
            products.map((product: any) => (
              <NewProductCard key={product.id} {...product} />
            ))
          )}
        </div>
        {products && products.length > 0 && (
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              size="lg"
              className="rounded-md px-8 py-6 text-sm font-semibold shadow-sm hover:shadow-md transition-all"
              onClick={() => window.location.href = '/all-products'}
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}