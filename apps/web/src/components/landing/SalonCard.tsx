
import { Card, CardContent } from '@repo/ui/card';
import Image from 'next/image';
import { Star, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@repo/ui/button';

interface SalonCardProps {
  name: string;
  rating: number;
  location: string;
  image: string;
  hint: string;
  topRated?: boolean;
}

export function SalonCard({ name, rating, location, image, hint, topRated = false }: SalonCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-lg border border-border/50">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image 
            src={image} 
            alt={name} 
            layout="fill" 
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            data-ai-hint={hint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        {topRated && (
            <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Star className="h-3 w-3" />
                TOP RATED
            </div>
        )}
        <div className="absolute bottom-4 left-4 right-4">
            <h3 className="font-bold text-lg text-white truncate shadow-black/50 [text-shadow:0_2px_4px_var(--tw-shadow-color)]">{name}</h3>
            <div className="flex items-center justify-between text-sm text-white/90 mt-1">
                <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span>{rating}</span>
                </div>
                <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{location}</span>
                </div>
            </div>
        </div>
      </div>
      <CardContent className="p-4 bg-background">
        <p className="text-sm text-muted-foreground h-10">
          Specializing in modern cuts, creative color, and luxurious spa treatments.
        </p>
        <Button className="w-full mt-4 group/btn">
          Book Now <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
        </Button>
      </CardContent>
    </Card>
  );
}
