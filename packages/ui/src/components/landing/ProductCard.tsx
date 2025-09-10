
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
    <div className="group relative w-full aspect-[4/5] perspective-1000">
      <div className="relative w-full h-full text-white bg-black/50 backdrop-blur-xl border border-white/10 rounded-lg futuristic-clip-path transition-all duration-500 ease-in-out group-hover:bg-primary/10 group-hover:border-primary/50 group-hover:shadow-2xl group-hover:shadow-primary/20">
        
        {/* Glowing border effect on hover */}
        <div className="absolute inset-0 futuristic-clip-path border-2 border-primary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow"></div>

        {/* Floating Image */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 transition-transform duration-500 ease-in-out group-hover:scale-110 group-hover:-translate-y-2">
          <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl shadow-primary/20 border-4 border-background/50 backdrop-blur-sm">
            <Image
              src={image}
              alt={name}
              layout="fill"
              className="object-cover"
              data-ai-hint={hint}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="absolute top-28 left-0 right-0 p-6 flex flex-col items-center text-center h-[calc(100%-7rem)]">
          <h3 className="font-bold text-lg truncate mb-1 transition-all duration-300 group-hover:text-primary">{name}</h3>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 transition-colors duration-300 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({reviewCount} reviews)</span>
          </div>

          <div className="flex-grow"></div>
          
          {/* Details revealed on hover */}
          <div className="flex flex-col items-center w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out delay-100">
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
    </div>
  );
}
