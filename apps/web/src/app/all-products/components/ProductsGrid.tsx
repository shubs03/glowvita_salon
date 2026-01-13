"use client";

import React, { useState } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Search, Filter, Grid, List } from "lucide-react";
import ProductCard from "@/components/ProductCard";
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

interface ProductsGridProps {
  products: Product[];
  isLoading: boolean;
  apiError: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
  filteblueProducts: Product[];
  setIsFilterModalOpen: (open: boolean) => void;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  isLoading,
  apiError,
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  filteblueProducts,
  setIsFilterModalOpen,
}) => {
  return (
    <section className="py-20 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          All Products
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">
          Browse our complete collection of premium beauty and wellness
          products. Discover top-rated skincare, cosmetics, body care, and more
          from trusted brands.
        </p>
      </div>

      {/* Search Bar - New Design */}
      <div className="mb-8 p-4 rounded-md flex flex-col sm:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Input
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 rounded-md w-full bg-background border focus:border-primary transition-all"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          Showing {filteblueProducts.length} products
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : apiError ? (
        <div className="text-center py-12">
          <p className="text-destructive">
            Failed to load products. Please try again later.
          </p>
        </div>
      ) : filteblueProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {filteblueProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductsGrid;
