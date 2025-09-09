
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@repo/ui/card';
import Image from 'next/image';
import { Button } from '@repo/ui/button';

interface ProductCardProps {
  name: string;
  description: string;
  price: number;
  image: string;
  hint: string;
}

export function ProductCard({ name, description, price, image, hint }: ProductCardProps) {
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0">
        <div className="aspect-square relative">
          <Image
            src={image}
            alt={name}
            layout="fill"
            className="object-cover"
            data-ai-hint={hint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-muted-foreground mt-1 flex-grow">{description}</p>
        <div className="flex justify-between items-center mt-4">
            <p className="text-xl font-bold">₹{price.toFixed(2)}</p>
            <Button size="sm">Add to Cart</Button>
        </div>
      </CardContent>
    </Card>
  );
}
