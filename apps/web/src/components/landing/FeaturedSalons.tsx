
"use client";

import { Button } from '@repo/ui/button';
import { SalonCard } from './SalonCard';
import { MapPin, Star, Sparkles, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@repo/ui/cn';

const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai'];

const salons = [
  { name: 'GlowVita Elite Spa', rating: 4.9, location: 'Mumbai Central', image: 'https://placehold.co/600x400.png', hint: 'luxury modern salon interior', topRated: true, services: ['Signature Facial', 'Hair Transformation'], price: '₹2,500+' },
  { name: 'Platinum Hair Studio', rating: 4.8, location: 'Delhi NCR', image: 'https://placehold.co/600x400.png', hint: 'contemporary hair salon', topRated: true, services: ['Color Specialist', 'Bridal Makeup'], price: '₹3,000+' },
  { name: 'Zen Beauty Lounge', rating: 4.7, location: 'Bangalore', image: 'https://placehold.co/600x400.png', hint: 'zen spa with modern amenities', services: ['Thai Massage', 'Aromatherapy'], price: '₹2,000+' },
  { name: 'Royal Treatments', rating: 4.8, location: 'Pune', image: 'https://placehold.co/600x400.png', hint: 'upscale beauty salon', services: ['Diamond Facial', 'Keratin Treatment'], price: '₹2,800+' },
];

export function FeaturedSalons() {
  const [activeLocation, setActiveLocation] = useState('Mumbai');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('featured-salons');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="featured-salons"
      className="py-24 md:py-32 bg-gradient-to-br from-background via-primary/5 to-secondary/5 relative overflow-hidden"
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-secondary/40 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,white,transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-gradient-to-r from-secondary/20 to-transparent rounded-full blur-3xl animate-float-delayed"></div>
      
      {/* Sparkle Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          >
            <Sparkles className="w-4 h-4 text-primary/20" />
          </div>
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Header */}
        <div className={cn(
          "text-center mb-16 transition-all duration-1000",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          
          <h2 className="text-4xl md:text-6xl font-bold font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-6">
            Discover Premium Salons
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience exceptional beauty and wellness services from our carefully curated selection of premium salons and spas.
          </p>
        </div>
        
        {/* Enhanced Location Filter */}
        <div className={cn(
          "flex justify-center gap-3 mb-12 flex-wrap transition-all duration-1000 delay-200",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          {locations.map(loc => (
            <Button 
              key={loc} 
              variant={activeLocation === loc ? "default" : "outline"}
              onClick={() => setActiveLocation(loc)}
              className={cn(
                "rounded-full shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm group relative overflow-hidden",
                activeLocation === loc 
                  ? "bg-primary text-white shadow-primary/25" 
                  : "bg-background/70 hover:bg-primary/10 hover:border-primary/50"
              )}
            >
              <MapPin className="h-4 w-4 mr-2" />
              {loc}
              {activeLocation === loc && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </Button>
          ))}
        </div>
        
        {/* Enhanced Salon Grid */}
        <div className={cn(
          "featured-salons-grid grid sm:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-1000 delay-400",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          {salons.map((salon, index) => (
            <div
              key={index}
              className="animate-fade-in-up"
              style={{ 
                animationDelay: `${index * 0.15}s`,
                isolation: 'isolate',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                contain: 'layout style'
              }}
            >
              <SalonCard {...salon} />
            </div>
          ))}
        </div>
        
        {/* Enhanced CTA */}
        <div className={cn(
          "text-center mt-16 transition-all duration-1000 delay-600",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          <div className="space-y-4">
            <p className="text-muted-foreground text-lg">Join thousands of satisfied customers</p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden rounded-full"
            >
              <span className="relative z-10">View All Salons</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
