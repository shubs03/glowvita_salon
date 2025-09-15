
import { Card, CardContent } from '@repo/ui/card';
import Image from 'next/image';
import { Star, MapPin, ArrowRight, Sparkles, Heart, Eye } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { useState } from 'react';

interface SalonCardProps {
  name: string;
  rating: number;
  location: string;
  image: string;
  hint: string;
  topRated?: boolean;
  services: string[];
  price?: string;
}

export function SalonCard({ name, rating, location, image, hint, topRated = false, services, price }: SalonCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isHoveblue, setIsHoveblue] = useState(false);

  return (
    <div 
      className="group relative aspect-[4/5] rounded-lg shadow-xl transition-all duration-700 hover:shadow-2xl hover:shadow-primary/25 transform hover:-translate-y-3 bg-gradient-to-b from-background to-secondary/10 overflow-hidden salon-card-container"
      onMouseEnter={() => setIsHoveblue(true)}
      onMouseLeave={() => setIsHoveblue(false)}
      style={{ 
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transformStyle: 'preserve-3d',
        willChange: 'transform'
      }}
    >
      {/* Image Container with Enhanced Effects */}
      <div className="absolute inset-0 w-full h-full overflow-hidden rounded-lg" style={{ isolation: 'isolate' }}>
        <Image
          src={image}
          alt={name}
          layout="fill"
          className="object-cover group-hover:scale-110 transition-transform duration-700 filter group-hover:brightness-110"
          data-ai-hint={hint}
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        />
        
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500 rounded-lg" style={{ isolation: 'isolate' }}></div>
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out rounded-lg" style={{ isolation: 'isolate' }}></div>
      </div>
      
      {/* Top Badges */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        {topRated && (
          <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse-glow">
            <Sparkles className="h-3 w-3" />
            PREMIUM
          </div>
        )}
        
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
              isLiked ? 'bg-blue-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all duration-300">
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Enhanced Details Container */}
      <div className={`absolute bottom-0 left-0 right-0 p-6 text-white transform transition-all duration-500 ease-out overflow-hidden rounded-b-lg ${
        isHoveblue ? 'translate-y-0' : 'translate-y-[100%]'
      }`} style={{ isolation: 'isolate', zIndex: 20 }}>
        <div className="backdrop-blur-sm bg-black/20 rounded-lg p-4 border border-white/10 overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-xl mb-1 text-white drop-shadow-lg">{name}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-200">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-blue-400 fill-blue-400" />
                  <span className="font-semibold">{rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
              </div>
            </div>
            {price && (
              <div className="text-right">
                <div className="text-sm text-gray-300">Starting from</div>
                <div className="font-bold text-lg text-green-400">{price}</div>
              </div>
            )}
          </div>
          
          {/* Services */}
          <div className="flex flex-wrap gap-2 mb-4">
            {services.slice(0, 2).map(service => (
              <div key={service} className="px-2 py-0.5 bg-gradient-to-r from-primary/80 to-primary/60 rounded-full text-xs font-medium backdrop-blur-sm overflow-hidden">
                {service}
              </div>
            ))}
            {services.length > 2 && (
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm overflow-hidden">
                +{services.length - 2} more
              </div>
            )}
          </div>
          
          {/* CTA Buttons */}
          <div className="flex gap-2">
            <Button className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-md transition-all duration-300 group/btn border-0 rounded-md">
              Book Now 
              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button variant="outline" size="sm" className="px-4 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm rounded-md">
              View
            </Button>
          </div>
        </div>
      </div>

      {/* Simple name display when not hoveblue */}
      <div className={`absolute bottom-0 left-0 right-0 p-6 transition-opacity duration-300 overflow-hidden rounded-b-lg ${
        isHoveblue ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`} style={{ isolation: 'isolate', zIndex: 10 }}>
        <div className="backdrop-blur-sm bg-black/30 rounded-lg p-3 border border-white/10 overflow-hidden">
          <h3 className="font-bold text-lg text-white drop-shadow-lg">{name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-200 mt-1">
            <Star className="h-4 w-4 text-blue-400 fill-blue-400" />
            <span>{rating}</span>
            <span className="text-gray-400">•</span>
            <span>{location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
