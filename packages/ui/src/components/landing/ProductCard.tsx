
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { CardBody, CardContainer, CardItem } from '../../3d-card';
import { cn } from '../../cn';

interface ProductCardProps {
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  image: string;
  hint: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  vendorName?: string;
}

export function ProductCard({ 
  name, 
  description, 
  price, 
  salePrice,
  image, 
  hint, 
  rating, 
  reviewCount, 
  isNew = false, 
  vendorName = 'Top Vendor'
}: ProductCardProps) {
  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[20rem] h-auto rounded-lg p-6 border overflow-hidden">
        
        {/* Vendor Info */}
        <CardItem
          translateZ="20"
          className="text-xs text-muted-foreground mb-1"
        >
          Sold by <span className="font-medium text-primary">{vendorName}</span>
        </CardItem>
        
        {/* Product Name */}
        <CardItem
          translateZ="50"
          className="text-lg font-semibold leading-tight text-foreground mb-2 line-clamp-2"
        >
          {name}
        </CardItem>
        
        {/* Rating */}
        <CardItem
          translateZ="30"
          className="flex items-center gap-2 mb-4"
        >
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
          <span className="text-xs text-muted-foreground">({reviewCount})</span>
        </CardItem>

        {/* Product Image */}
        <CardItem translateZ="100" className="w-full mb-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-md">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover/card:scale-105 transition-all duration-300"
              data-ai-hint={hint}
            />
            {isNew && (
              <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs py-1 px-2 rounded-full border-2 border-background shadow-lg">
                NEW
              </Badge>
            )}
          </div>
        </CardItem>
        
        {/* Price and Add Button */}
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-border/50">
          <CardItem
            translateZ={20}
            className="flex flex-col"
          >
            <span className={cn("text-2xl font-bold text-foreground", salePrice && "text-xl text-muted-foreground line-through")}>
              ₹{price.toFixed(2)}
            </span>
            {salePrice && (
              <span className="text-2xl font-bold text-primary">₹{salePrice.toFixed(2)}</span>
            )}
          </CardItem>
          <CardItem
            translateZ={20}
            as="button"
            className="px-4 py-2 rounded-md bg-black dark:bg-white dark:text-black text-white text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}
