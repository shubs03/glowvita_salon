
import { Card, CardContent, CardHeader } from '@repo/ui/card';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  name: string;
  description: string;
  price: number;
  image: string;
  hint: string;
  vendorName: string;
  isNew?: boolean;
}

export function ProductCard({ name, description, price, image, hint, vendorName, isNew }: ProductCardProps) {
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col group">
      <CardHeader className="p-0 relative">
        <div className="aspect-square relative">
          <Image
            src={image}
            alt={name}
            layout="fill"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={hint}
          />
           {isNew && (
            <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground border-2 border-background shadow-lg">
              NEW
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <p className="text-xs text-muted-foreground mb-1">Sold by {vendorName}</p>
        <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-sm text-muted-foreground mt-2 flex-grow">{description}</p>
        <div className="flex justify-between items-center mt-4">
            <p className="text-xl font-bold">₹{price.toFixed(2)}</p>
            <Button size="sm">
                <ShoppingCart className="mr-2 h-4 w-4"/>
                Add to Cart
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
