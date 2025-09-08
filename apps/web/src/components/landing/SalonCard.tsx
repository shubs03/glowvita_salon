
import { Card, CardContent } from '@repo/ui/card';
import Image from 'next/image';
import { Star, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@repo/ui/button';

interface SalonCardProps {
  name: string;
  rating: number;
  location: string;
  image: string;
  hint: string;
  topRated?: boolean;
  services: string[];
}

export function SalonCard({ name, rating, location, image, hint, topRated = false, services }: SalonCardProps) {
  return (
    <Card className="group relative overflow-hidden rounded-xl border border-border/20 bg-background/50 backdrop-blur-xl shadow-lg transition-all duration-500 hover:shadow-primary/20 hover:border-primary/30 hover:-translate-y-2">
      {/* Glare Effect */}
      <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 transform bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 group-hover:animate-shine z-10" />
      
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image 
            src={image} 
            alt={name} 
            layout="fill" 
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            data-ai-hint={hint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        {topRated && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border-2 border-primary-foreground/50 animate-pulse-slow">
                <Sparkles className="h-4 w-4" />
                ELITE
            </div>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-bold text-lg truncate">{name}</h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-foreground">{rating}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
            </div>
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {services.map(service => (
            <div key={service} className="px-2 py-1 bg-secondary rounded-full border border-border/50 text-secondary-foreground">
              {service}
            </div>
          ))}
        </div>
        <Button className="w-full group/btn bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg hover:shadow-primary/40 transition-all duration-300 mt-2">
          Book Now <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
        </Button>
      </CardContent>
    </Card>
  );
}
