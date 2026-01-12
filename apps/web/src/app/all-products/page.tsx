"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { useGetPublicProductsQuery } from "@repo/store/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import {
  DollarSign,
  RotateCcw,
  Globe,
  Leaf,
  Search,
  Filter,
  Grid,
  List,
  Star,
  TrendingUp,
  Package,
  Shield,
  CheckCircle,
  Users,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Heart,
} from "lucide-react";
import { PageContainer } from "@repo/ui/page-container";
import { Badge } from "@repo/ui/badge";
import { Dialog, DialogContent } from "@repo/ui/dialog";
import { Label } from "@repo/ui/label";
import ProductCard from "@/components/ProductCard";
import HeroSection from "./components/HeroSection";
import ProductsGrid from "./components/ProductsGrid";
import FilterComponent from "./components/FilterComponent";
import RecentlyAddedProducts from "./components/RecentlyAddedProducts";
import Testimonials from "./components/Testimonials";
import { ChevronDown } from "lucide-react";
import DownloadApp from "@/components/landing/DownloadApp";
import CTASection from "../salons/components/CTASection";

// Product type definition
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  hint: string;
  rating: number;
  reviewCount: number;
  vendorName: string;
  vendorId: string;
  isNew?: boolean;
  description: string;
  category: string;
  forBodyPart?: string;
  brand?: string;
  bodyPartType?: string;
  salePrice?: number;
  stock?: number;
  productImages?: string[];
}

const ProductHighlightCard = ({
  title,
  products,
  className = "",
  isLarge = false,
}: {
  title: string;
  products: Product[];
  className?: string;
  isLarge?: boolean;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHoveblue, setIsHoveblue] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    if (!isHoveblue) {
      timeoutRef.current = setTimeout(
        () => setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length),
        3000
      );
    }
    return () => resetTimeout();
  }, [currentIndex, isHoveblue, products.length]);

  const nextProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
  };

  const prevProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + products.length) % products.length
    );
  };

  if (!products || products.length === 0) return null;

  return (
    <div
      className={`relative rounded-md md:rounded-2xl flex flex-col justify-between group transition-all duration-300 ease-in-out bg-background/50 backdrop-blur-sm ${className}`}
      onMouseEnter={() => setIsHoveblue(true)}
      onMouseLeave={() => setIsHoveblue(false)}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10 h-full flex flex-col">
        <h3
          className={`font-bold mb-2 md:mb-2 ${isLarge ? "text-xl sm:text-2xl lg:text-3xl" : "text-base sm:text-lg md:text-xl"}`}
        >
          {title}
        </h3>
        <div className="relative flex-1 rounded-lg md:rounded-md overflow-hidden">
          {products.map((product: Product, index: number) => (
            <img
              key={product.id}
              src={product.image}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div
            className={`absolute bottom-0 left-0 right-0 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isLarge ? "p-3 md:p-4 lg:p-5" : "p-2 md:p-3"}`}
          >
            <h4
              className={`font-bold truncate ${isLarge ? "text-base sm:text-lg md:text-xl" : "text-sm md:text-base"}`}
            >
              {products[currentIndex]?.name}
            </h4>
            <p
              className={`truncate opacity-90 ${isLarge ? "text-sm md:text-base" : "text-xs md:text-sm"}`}
            >
              {products[currentIndex]?.vendorName}
            </p>
            <div className="flex justify-between items-center mt-1 md:mt-2">
              <p
                className={`font-bold ${isLarge ? "text-sm md:text-base lg:text-lg" : "text-xs md:text-sm"}`}
              >
                ₹{products[currentIndex]?.price.toFixed(2)}
              </p>
              {isLarge && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full text-xs md:text-sm px-3 py-1 md:px-4 md:py-2"
                >
                  View
                </Button>
              )}
            </div>
          </div>

          <div
            className={`absolute flex gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isLarge ? "top-3 right-3 md:top-4 md:right-4" : "top-2 right-2 md:top-3 md:right-3"}`}
          >
            <Button
              size="icon"
              variant="ghost"
              className={`bg-white/20 text-white rounded-full hover:bg-white/30 backdrop-blur-sm transition-all duration-200 ${isLarge ? "h-7 w-7 md:h-8 md:w-8 lg:h-9 lg:w-9" : "h-6 w-6 md:h-7 md:w-7"}`}
              onClick={prevProduct}
            >
              <ChevronLeft
                className={`${isLarge ? "h-3 w-3 md:h-4 md:w-4" : "h-3 w-3"}`}
              />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={`bg-white/20 text-white rounded-full hover:bg-white/30 backdrop-blur-sm transition-all duration-200 ${isLarge ? "h-7 w-7 md:h-8 md:w-8 lg:h-9 lg:w-9" : "h-6 w-6 md:h-7 md:w-7"}`}
              onClick={nextProduct}
            >
              <ChevronRight
                className={`${isLarge ? "h-3 w-3 md:h-4 md:w-4" : "h-3 w-3"}`}
              />
            </Button>
          </div>

          {/* Product indicators for mobile */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 md:hidden">
            {products.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AllProductsPage() {
  // Fetch approved products from API
  const {
    data: productsApiData,
    isLoading,
    error: apiError,
  } = useGetPublicProductsQuery(undefined);

  console.log("Products on all products page : ", productsApiData);

  const [products, setProducts] = useState<Product[]>([]);
  const [filteblueProducts, setFilteblueProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  // New state for filters
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("featured");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Extract unique body parts, brands from products data
  const allBodyParts = React.useMemo(() => {
    if (!productsApiData?.products) return [];
    const uniqueBodyParts = new Set<string>();
    productsApiData.products.forEach((product: Product) => {
      if (product.forBodyPart) {
        uniqueBodyParts.add(product.forBodyPart);
      }
    });
    return Array.from(uniqueBodyParts);
  }, [productsApiData]);

  const allBrands = React.useMemo(() => {
    if (!productsApiData?.products) return [];
    const uniqueBrands = new Set<string>();
    productsApiData.products.forEach((product: Product) => {
      if (product.brand) {
        uniqueBrands.add(product.brand);
      }
    });
    return Array.from(uniqueBrands);
  }, [productsApiData]);

  // Initialize products with API data
  useEffect(() => {
    if (productsApiData?.products) {
      setProducts(productsApiData.products);
      setFilteblueProducts(productsApiData.products);
    }
  }, [productsApiData]);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply body part filter
    if (selectedBodyParts.length > 0) {
      result = result.filter((product) =>
        selectedBodyParts.includes(product.forBodyPart || "")
      );
    }

    // Apply brand filter
    if (selectedBrand.length > 0) {
      result = result.filter((product) =>
        selectedBrand.includes(product.brand || "")
      );
    }

    // Apply rating filter
    if (ratingFilter === "high-to-low") {
      result = result.sort((a, b) => b.rating - a.rating);
    } else if (ratingFilter === "low-to-high") {
      result = result.sort((a, b) => a.rating - b.rating);
    }

    // Apply price range filter
    result = result.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case "newest":
        result = result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "price-low":
        result = result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result = result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = result.sort((a, b) => b.rating - a.rating);
        break;
      case "featured":
      default:
        // Keep original order for featured
        break;
    }

    setFilteblueProducts(result);
  }, [
    searchTerm,
    products,
    selectedBodyParts,
    selectedBrand,
    ratingFilter,
    priceRange,
    sortBy,
  ]);

  // Calculate dynamic stats
  const uniqueVendors = new Set(filteblueProducts.map((p) => p.vendorId)).size;
  const totalProducts = filteblueProducts.length;
  const averageRating =
    filteblueProducts.length > 0
      ? (
          filteblueProducts.reduce((acc, p) => acc + p.rating, 0) /
          filteblueProducts.length
        ).toFixed(1)
      : "0.0";

  const bentoGridProducts = {
    newArrivals: filteblueProducts.slice(0, 3),
    topRated: filteblueProducts.slice(3, 6),
    bestSellers: filteblueProducts.slice(6, 9),
  };

  const resetFilters = () => {
    setSelectedBodyParts([]);
    setSelectedBrand([]);
    setRatingFilter("all");
    setSortBy("featured");
  };

  return (
    <PageContainer padding="none">
      <HeroSection />
      <RecentlyAddedProducts />


      {/* Filters Row - Similar to WhereToDo component */}
      <FilterComponent
        allBodyParts={allBodyParts}
        allBrands={allBrands}
        selectedBodyParts={selectedBodyParts}
        setSelectedBodyParts={setSelectedBodyParts}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        ratingFilter={ratingFilter}
        setRatingFilter={setRatingFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        resetFilters={resetFilters}
      />

      <div className="container mx-auto px-4 py-8">
        {/* 5. Product Grid */}
        <ProductsGrid
          products={filteblueProducts}
          isLoading={isLoading}
          apiError={apiError}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          viewMode={viewMode}
          setViewMode={setViewMode}
          filteblueProducts={filteblueProducts}
          setIsFilterModalOpen={setIsFilterModalOpen}
        />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <main className="lg:col-span-12">
            {/* 8. Testimonials Section */}
            <Testimonials />

            <DownloadApp />
          </main>
        </div>
      </div>
      <CTASection />
    </PageContainer>
  );
}

// Separator Component for local use
const Separator = ({
  orientation = "horizontal",
  className = "",
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) => (
  <div
    className={`bg-border ${orientation === "horizontal" ? "h-px w-full" : "h-full w-px"} ${className}`}
  />
);
