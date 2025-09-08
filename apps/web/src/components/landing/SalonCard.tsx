
import { Card, CardContent } from '@repo/ui/card';
import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';
import { Button } from '@repo/ui/button';

interface SalonCardProps {
  name: string;
  rating: number;
  location: string;
  image: string;
  hint: string;
}

export function SalonCard({ name, rating, location, image, hint }: SalonCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-shadow duration-300">
      <div className="relative aspect-[4/3]">
        <Image 
            src={image} 
            alt={name} 
            layout="fill" 
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={hint}
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg truncate">{name}</h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span>{rating}</span>
            </div>
            <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
            </div>
        </div>
        <Button className="w-full mt-4">Book Now</Button>
      </CardContent>
    </Card>
  );
}
