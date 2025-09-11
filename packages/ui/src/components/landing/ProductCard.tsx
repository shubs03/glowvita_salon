import { Star, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { ModernCard } from '@repo/ui/modern-card';
import { cn } from '../../cn';

interface ProductCardProps {
  name: string;
  price: number;
  image: string;
  hint: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  vendorName?: string;
}

export function ProductCard({ 
  name, 
  price, 
  image, 
  hint, 
  rating, 
  reviewCount, 
  isNew = false, 
  vendorName = 'Top Vendor'
}: ProductCardProps) {
  return (
    <ModernCard 
      variant="elevated" 
      padding="none" 
      hover 
      className="group flex flex-col overflow-hidden"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={image}
          alt={name}
          layout="fill"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          data-ai-hint={hint}
        />
        {isNew && (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground border-2 border-background shadow-lg">
            NEW
          </Badge>
        )}
      </div>
      
      <div className="flex flex-col flex-grow p-4">
        <p className="text-xs text-muted-foreground mb-1">
          Sold by <span className="font-medium text-primary">{vendorName}</span>
        </p>
        
        <h3 className="text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors duration-300 flex-grow">
          {name}
        </h3>
        
        <div className="flex items-center gap-2 my-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={cn(
                  "h-4 w-4", 
                  i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                )} 
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({reviewCount} reviews)</span>
        </div>

        <div className="flex justify-between items-center mt-auto pt-3 border-t border-border/50">
          <p className="text-2xl font-bold text-foreground">
            ₹{price.toFixed(2)}
          </p>
          <Button size="sm" className="group/btn">
            <ShoppingCart className="mr-2 h-4 w-4 group-hover/btn:animate-bounce" />
            Add
          </Button>
        </div>
      </div>
    </ModernCard>
  );
}
