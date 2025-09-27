
"use client";

import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@repo/ui/cn';

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
  vendorName
}: NewProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="group relative overflow-hidden rounded-2xl shadow-md border border-border/20 bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Upper Half: Image */}
      <div className="aspect-[4/3] relative w-full overflow-hidden">
        <Image
          src={image}
          alt={name}
          layout="fill"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          data-ai-hint={hint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        {isNew && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-none text-xs">
            NEW
          </Badge>
        )}
        <Button 
          size="icon" 
          variant="ghost" 
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
          onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current text-red-500")} />
        </Button>
      </div>

      {/* Lower Half: Details */}
      <div className="p-4 flex flex-col justify-between h-48">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">{vendorName}</p>
          <h3 className="font-semibold text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span>{rating}</span>
            <span>({reviewCount})</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-foreground">₹{salePrice || price}</p>
            {salePrice && (
              <p className="text-sm text-muted-foreground line-through">₹{price}</p>
            )}
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            onClick={(e) => { e.stopPropagation(); alert('Added to cart!'); }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
```