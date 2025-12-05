"use client";

import Image from "next/image";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@repo/ui/cn";
import { useAddToCartMutation } from "@repo/store/api";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
    _id: string;
    productImage: string;
    productName: string;
    price: number;
    salePrice?: number;
    category: { name: string };
    stock: number;
    vendorId: string;
    supplierName: string;
    supplierEmail: string;
    description: string;
    discount?: number;
    rating?: number;
  };
  onQuickAddToCart: (product: any, e: React.MouseEvent) => void;
  onViewDetails: (product: any) => void;
  onBuyNow: (product: any, e: React.MouseEvent) => void;
  onViewSupplier: (e: React.MouseEvent, supplierId: string) => void;
}

export function ProductCard({
  product,
  onQuickAddToCart,
  onViewDetails,
  onBuyNow,
  onViewSupplier
}: ProductCardProps) {
  const [addToCart] = useAddToCartMutation();
  
  // Mock review count since it's not in the product data
  const reviewCount = Math.floor(Math.random() * 50) + 10;
  const rating = product.rating || 4.5;

  const handleCardClick = () => {
    onViewDetails(product);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAddToCart(product, e);
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBuyNow(product, e);
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-md hover:shadow-md border bg-card transition-all duration-500 hover:-translate-y-2 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Upper Half: Image */}
      <div className="aspect-[4/3] relative w-full overflow-hidden">
        <Image
          src={product.productImage || 'https://placehold.co/300x300.png'}
          alt={product.productName}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
        
        <Badge 
          variant={product.stock > 10 ? "secondary" : product.stock > 0 ? "outline" : "destructive"}
          className={cn(
            "absolute top-3 left-3 text-xs font-medium",
            product.stock > 10 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : product.stock > 0 
                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                : 'bg-red-100 text-red-800 border-red-200'
          )}
        />
      </div>

      {/* Lower Half: Details */}
      <div className="p-4 flex flex-col justify-between h-fit bg-card">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {product.supplierName || 'Supplier'}
          </p>
          <h3 className="font-bold text-base text-foreground line-clamp-1 leading-snug mb-1 group-hover:text-primary transition-colors">
            {product.productName}
          </h3>

          <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-semibold text-foreground">
                {rating}
              </span>
              <span className="text-xs text-muted-foreground">
                ({reviewCount})
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              {product.salePrice && (
                <span className="text-lg font-bold text-primary">
                  ₹{product.salePrice.toFixed(0)}
                </span>
              )}
              <span
                className={cn(
                  "font-semibold",
                  product.salePrice
                    ? "text-xs text-muted-foreground line-through"
                    : "text-md text-foreground"
                )}
              >
                ₹{product.price.toFixed(0)}
              </span>
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-fit rounded-lg group-hover:text-primary transition-colors group-hover:border-primary"
              onClick={handleBuyNowClick}
              disabled={product.stock === 0}
            >
              Buy Now
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-fit rounded-lg group-hover:text-primary transition-colors group-hover:border-primary"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}