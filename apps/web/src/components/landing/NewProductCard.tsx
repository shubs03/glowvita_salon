"use client";

import Image from "next/image";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@repo/ui/cn";

interface NewProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  hint: string;
  rating: number;
  reviewCount: number;
  vendorName: string;
  isNew?: boolean;
  description?: string;
  category?: string;
  salePrice?: number;
}

export function NewProductCard({
  name,
  price,
  salePrice,
  image,
  hint,
  rating,
  reviewCount,
  isNew = false,
  vendorName,
  description,
}: NewProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="group relative overflow-hidden rounded-md hover:shadow-md border bg-card transition-all duration-500 hover:-translate-y-2">
      {/* Upper Half: Image */}
      <div className="aspect-[4/3] relative w-full overflow-hidden">
        <Image
          src={image}
          alt={name}
          layout="fill"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          data-ai-hint={hint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
        {isNew && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-none text-xs py-0.5 px-2 rounded-full font-bold shadow-lg">
            NEW
          </Badge>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 text-blue-500 backdrop-blur-sm hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
        >
          <Heart
            className={cn("h-4 w-4", isLiked && "fill-current text-blue-500")}
          />
        </Button>
      </div>

      {/* Lower Half: Details */}
      <div className="p-4 flex flex-col justify-between h-fit bg-card">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {vendorName}
          </p>
          <h3 className="font-bold text-base text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>

          <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
            {description}
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
              {salePrice && (
                <span className="text-lg font-bold text-primary">
                  ₹{salePrice.toFixed(2)}
                </span>
              )}
              <span
                className={cn(
                  "font-bold",
                  salePrice
                    ? "text-sm text-muted-foreground line-through"
                    : "text-lg text-foreground"
                )}
              >
                ₹{price.toFixed(2)}
              </span>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full rounded-lg group-hover:text-primary transition-colors group-hover:border-primary"
            onClick={(e) => {
              e.stopPropagation();
              alert("Added to cart!");
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
