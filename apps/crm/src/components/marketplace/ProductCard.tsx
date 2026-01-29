"use client";

import Image from "next/image";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { ShoppingCart, Star, Eye } from "lucide-react";
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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAddToCart(product, e);
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBuyNow(product, e);
  };

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(product);
  };

  const calculateDiscountPercentage = () => {
    if (product.salePrice && product.price > product.salePrice) {
      return Math.round(((product.price - product.salePrice) / product.price) * 100);
    }
    return 0;
  };

  const discountPercentage = calculateDiscountPercentage();

  return (
    <Card
      className="group overflow-hidden hover:shadow-md transition-shadow flex flex-col text-left cursor-pointer"
      onClick={handleViewDetailsClick}
    >
      <div className="relative aspect-square overflow-hidden rounded-md m-3">
        <Image
          src={product.productImage || 'https://placehold.co/300x300.png'}
          alt={product.productName}
          fill
          className="group-hover:scale-105 transition-transform duration-300 object-cover"
        />
        
        {/* Stock Badge */}
        <div className="absolute top-2 left-2 text-xs">
          <Badge 
            variant={product.stock > 10 ? "secondary" : product.stock > 0 ? "outline" : "destructive"}
            className={cn(
              "text-xs font-medium",
              product.stock > 10 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : product.stock > 0 
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : 'bg-red-100 text-red-800 border-red-200'
            )}
          >
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </Badge>
        </div>
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute -top-1 -right-1">
            <div className="bg-primary text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
              {discountPercentage}%
            </div>
          </div>
        )}

        {/* View Details Button */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-8 w-8 p-0 rounded-full"
            onClick={handleViewDetailsClick}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-grow">
        <p className="text-xs font-bold text-primary mb-1">
          {product.category.name}
        </p>
        <h4 className="text-sm font-semibold flex-grow mb-2">
          {product.productName}
        </h4>
        
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium text-foreground">
            {rating}
          </span>
          <span className="text-xs text-muted-foreground">
            ({reviewCount})
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-auto">
          <div>
            {product.salePrice && product.salePrice < product.price ? (
              <>
                <p className="font-bold text-primary">
                  ₹{product.salePrice.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground line-through">
                  ₹{product.price.toFixed(2)}
                </p>
              </>
            ) : (
              <p className="font-bold text-primary">
                ₹{product.price.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex justify-between w-full">
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs lg:mr-3"
              onClick={handleBuyNowClick}
              disabled={product.stock === 0}
            >
              Buy Now
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="w-fit text-xs"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}