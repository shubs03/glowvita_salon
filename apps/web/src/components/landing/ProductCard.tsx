
import { Card, CardContent, CardHeader } from '@repo/ui/card';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { ShoppingCart, Star, Heart, Eye } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@repo/ui/cn';

interface ProductCardProps {
  name: string;
  description: string;
  price: number;
  image: string;
  hint: string;
  vendorName: string;
  isNew?: boolean;
  rating?: number;
  originalPrice?: number;
}

export function ProductCard({ 
  name, 
  description, 
  price, 
  image, 
  hint, 
  vendorName, 
  isNew = false,
  rating = 4.5,
  originalPrice 
}: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className="overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 flex flex-col group border-2 border-border/30 hover:border-primary/30 rounded-2xl bg-gradient-to-br from-background to-primary/5 hover-lift"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-0 relative">
        <div className="aspect-square relative rounded-t-2xl overflow-hidden">
          <Image
            src={image}
            alt={name}
            layout="fill"
            className="object-cover group-hover:scale-110 transition-transform duration-700 filter group-hover:brightness-110"
            data-ai-hint={hint}
          />
          
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
            {isNew && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg animate-pulse-glow font-bold">
                NEW
              </Badge>
            )}
            
            <div className="flex gap-2 ml-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className={cn(
                  "p-2 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0",
                  isLiked ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                <Heart className={cn("h-4 w-4", isLiked ? 'fill-current' : '')} />
              </button>
              <button className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 delay-75">
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Discount Badge */}
          {originalPrice && (
            <div className="absolute bottom-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 flex-grow flex flex-col relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Vendor and Rating */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">by {vendorName}</p>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-medium text-muted-foreground">{rating}</span>
            </div>
          </div>
          
          {/* Product Name */}
          <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors duration-300 mb-2 line-clamp-2">
            {name}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground flex-grow line-clamp-2 leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
            {description}
          </p>
          
          {/* Price Section */}
          <div className="mt-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-2xl font-bold text-foreground">₹{price.toFixed(0)}</p>
              {originalPrice && (
                <p className="text-sm text-muted-foreground line-through">₹{originalPrice.toFixed(0)}</p>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-border rounded-full h-1 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
            </div>
          </div>
          
          {/* Action Button */}
          <Button 
            size="sm" 
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 group/btn border-0 relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center">
              <ShoppingCart className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform" />
              Add to Cart
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
          </Button>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-1 h-1 bg-primary/30 rounded-full transition-all duration-700",
                isHovered ? "animate-float opacity-100" : "opacity-0"
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`
              }}
            ></div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
