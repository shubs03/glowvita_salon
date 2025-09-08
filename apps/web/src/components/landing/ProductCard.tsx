
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
    <Card className="overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 rounded-xl bg-background/30 backdrop-blur-xl border border-white/10 hover:-translate-y-2">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={image}
          alt={name}
          layout="fill"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          data-ai-hint={hint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 group-hover:from-black/50 transition-all duration-300"></div>
      </div>
      <CardContent className="p-4 bg-transparent">
        <h3 className="font-bold text-lg truncate mb-1">{name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({reviewCount} reviews)</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">₹{price.toFixed(2)}</p>
          <Button size="sm" variant="outline" className="group/btn border-primary/50 hover:bg-primary/90 hover:text-primary-foreground transition-all duration-300">
             <ShoppingCart className="mr-2 h-4 w-4 group-hover/btn:text-yellow-300 transition-colors" /> Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
