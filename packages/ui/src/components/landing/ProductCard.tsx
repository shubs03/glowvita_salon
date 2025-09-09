
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
    <div className="group relative aspect-square overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-primary/20 hover:-translate-y-2">
      {/* Background Image */}
      <Image
        src={image}
        alt={name}
        layout="fill"
        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        data-ai-hint={hint}
      />
      
      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

      {/* Glowing Border on Hover */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent transition-all duration-300 group-hover:border-primary/50"></div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="font-bold text-lg truncate mb-1">{name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
            ))}
          </div>
          <span className="text-xs text-gray-300">({reviewCount} reviews)</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold">₹{price.toFixed(2)}</p>
          <Button 
            size="sm" 
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-0 translate-x-4 bg-primary/80 backdrop-blur-sm hover:bg-primary text-primary-foreground"
          >
             <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
