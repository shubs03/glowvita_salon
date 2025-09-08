
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
}

export function SalonCard({ name, rating, location, image, hint, topRated = false }: SalonCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-xl border-border/50 bg-gradient-to-br from-background via-background to-primary/5 hover:border-primary/30">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image 
            src={image} 
            alt={name} 
            layout="fill" 
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            data-ai-hint={hint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        {topRated && (
            <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 border-2 border-primary-foreground/50">
                <Sparkles className="h-4 w-4" />
                ELITE
            </div>
        )}
      </div>
      <CardContent className="p-4 bg-background/50">
        <h3 className="font-bold text-lg truncate mb-2">{name}</h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{rating}</span>
            </div>
            <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
            </div>
        </div>
        <Button className="w-full group/btn bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg hover:shadow-primary/40 transition-all duration-300">
          Request Teleport <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
        </Button>
      </CardContent>
    </Card>
  );
}
