
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
    <div className="group relative aspect-[4/5] overflow-hidden rounded-xl shadow-lg transition-all duration-500 hover:shadow-primary/20 transform hover:-translate-y-2">
      <Image 
          src={image} 
          alt={name} 
          layout="fill" 
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          data-ai-hint={hint}
      />
      
      {/* Static Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
      
      {/* Top Rated Badge */}
      {topRated && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border-2 border-primary-foreground/50 animate-pulse-slow">
              <Sparkles className="h-4 w-4" />
              ELITE
          </div>
      )}

      {/* Details container that slides up */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out">
        <h3 className="font-bold text-xl truncate">{name}</h3>
        <div className="flex items-center justify-between text-sm mt-1 mb-2 text-gray-200">
            <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{rating}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
            </div>
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs my-3">
          {services.map(service => (
            <div key={service} className="px-2 py-1 bg-white/20 rounded-full">
              {service}
            </div>
          ))}
        </div>
        <Button className="w-full group/btn bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg hover:shadow-primary/40 transition-all duration-300 mt-2">
          Book Now <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
        </Button>
      </div>

      {/* Name visible at the bottom when not hovered */}
      <div className="absolute bottom-0 left-0 right-0 p-4 group-hover:opacity-0 transition-opacity duration-300">
        <h3 className="font-bold text-lg text-white truncate drop-shadow-md">{name}</h3>
      </div>
    </div>
  );
}
