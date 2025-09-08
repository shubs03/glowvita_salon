
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
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 rounded-lg border border-border/50">
      <div className="relative aspect-square overflow-hidden bg-secondary/30">
        <Image
          src={image}
          alt={name}
          layout="fill"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          data-ai-hint={hint}
        />
      </div>
      <CardContent className="p-4 bg-background">
        <h3 className="font-semibold text-base truncate mb-1">{name}</h3>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({reviewCount})</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">₹{price.toFixed(2)}</p>
          <Button size="sm" variant="outline" className="group/btn">
             <ShoppingCart className="mr-2 h-4 w-4 group-hover/btn:text-primary transition-colors" /> Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
