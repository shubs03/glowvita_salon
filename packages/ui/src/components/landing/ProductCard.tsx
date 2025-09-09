import { Card, CardContent } from '@repo/ui/card';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@repo/ui/button';

interface ProductCardProps {
  name: string;
  price: number;
  image: string;
  hint: string;
  rating: number;
  reviewCount: number;
}

export function ProductCard({ name, price, image, hint, rating, reviewCount }: ProductCardProps) {
  return (
    <div className="group relative text-white rounded-xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Background glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
      
      {/* Main Card Body with Glassmorphism Effect */}
      <div className="relative bg-black/50 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden p-6 h-full flex flex-col justify-between">
        {/* Floating Image Container */}
        <div className="relative -mt-16 mb-4 transform group-hover:scale-105 transition-transform duration-500">
          <div className="aspect-square rounded-full mx-auto w-40 h-40 overflow-hidden shadow-2xl shadow-primary/30 border-4 border-white/10">
            <Image
              src={image}
              alt={name}
              layout="fill"
              className="object-cover"
              data-ai-hint={hint}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="text-center">
          <h3 className="font-bold text-lg truncate mb-1">{name}</h3>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({reviewCount} reviews)</span>
          </div>
        </div>
        
        {/* Price and CTA Section */}
        <div className="mt-4">
          <p className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">₹{price.toFixed(2)}</p>
          <Button 
            size="lg" 
            className="w-full group/btn bg-primary/80 backdrop-blur-sm hover:bg-primary text-primary-foreground border border-white/10 shadow-lg hover:shadow-primary/40 transition-all duration-300 rounded-lg"
          >
             <ShoppingCart className="mr-2 h-4 w-4 group-hover/btn:animate-pulse" /> Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
