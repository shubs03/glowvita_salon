
"use client";

import { Card, CardContent } from '@repo/ui/card';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Tag, Zap, Sparkles, Clock, Percent, Gift } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@repo/ui/cn';

const offers = [
  { 
    title: "Signature Glow Facial", 
    description: "Get 25% off our revolutionary anti-aging facial treatment with LED therapy.", 
    image: 'https://placehold.co/600x400.png', 
    hint: 'luxury facial treatment', 
    discount: "25%",
    originalPrice: "₹4,000",
    salePrice: "₹3,000",
    timeLeft: "2 days"
  },
  { 
    title: "Premium Hair Transformation", 
    description: "Complete hair makeover including cut, color, and treatment with celebrity stylist.", 
    image: 'https://placehold.co/600x400.png', 
    hint: 'hair transformation salon', 
    discount: "30%",
    originalPrice: "₹8,000",
    salePrice: "₹5,600",
    timeLeft: "5 days"
  },
  { 
    title: "Bridal Beauty Package", 
    description: "Complete bridal package with makeup trial, hair styling, and pre-wedding treatments.", 
    image: 'https://placehold.co/600x400.png', 
    hint: 'bridal makeup artist', 
    discount: "20%",
    originalPrice: "₹15,000",
    salePrice: "₹12,000",
    timeLeft: "1 week"
  },
  { 
    title: "Luxury Spa Day", 
    description: "Full day spa experience with massage, facial, and relaxation treatments.", 
    image: 'https://placehold.co/600x400.png', 
    hint: 'luxury spa treatment', 
    discount: "35%",
    originalPrice: "₹6,000",
    salePrice: "₹3,900",
    timeLeft: "3 days"
  },
  { 
    title: "Men's Grooming Deluxe", 
    description: "Premium men's grooming package with haircut, beard styling, and facial.", 
    image: 'https://placehold.co/600x400.png', 
    hint: 'mens grooming salon', 
    discount: "15%",
    originalPrice: "₹3,500",
    salePrice: "₹2,975",
    timeLeft: "4 days"
  },
  { 
    title: "Nail Art Masterclass", 
    description: "Learn professional nail art techniques with all materials included.", 
    image: 'https://placehold.co/600x400.png', 
    hint: 'nail art salon', 
    discount: "40%",
    originalPrice: "₹2,500",
    salePrice: "₹1,500",
    timeLeft: "6 days"
  },
];

export function Offers() {
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

    const element = document.getElementById('offers-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="offers-section"
      className="py-24 md:py-32 bg-gradient-to-br from-background via-primary/5 to-secondary/5 relative overflow-hidden"
    >
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,hsl(var(--primary))_0%,transparent_50%)] opacity-10"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,white,transparent_70%)] opacity-20"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-secondary/20 to-transparent rounded-full blur-3xl animate-float-delayed"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={cn(
          "text-center mb-16 transition-all duration-1000",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg backdrop-blur-sm border border-orange-500/20">
            <Gift className="h-4 w-4" />
            <span className="font-semibold">Limited Time Offers</span>
            <Clock className="h-4 w-4 animate-pulse" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold font-headline bg-gradient-to-r from-foreground via-orange-600 to-foreground bg-clip-text text-transparent mb-6">
            Exclusive Deals & Packages
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Don't miss out on these incredible offers from premium salons. Book now and save big on your favorite treatments!
          </p>
        </div>
        
        <div className={cn(
          "w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)] transition-all duration-1000 delay-300",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          <div className="flex w-fit animate-slide hover:[animation-play-state:paused]">
            {[...offers, ...offers].map((offer, index) => (
              <div key={index} className="flex-shrink-0 mx-4" style={{ width: '320px' }}>
                <Card className="relative group overflow-hidden rounded-2xl h-48 w-full transition-all duration-700 hover:shadow-2xl hover:shadow-primary/25 transform hover:-translate-y-2 border-2 border-border/30 hover:border-primary/50 bg-gradient-to-br from-background to-primary/5">
                  {/* Discount Badge */}
                  <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse-glow">
                    <Percent className="h-3 w-3 inline mr-1" />
                    {offer.discount} OFF
                  </div>
                  
                  {/* Timer Badge */}
                  <div className="absolute top-4 right-4 z-20 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/20">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {offer.timeLeft}
                  </div>

                  <Image
                    src={offer.image}
                    alt={offer.title}
                    layout="fill"
                    className="object-cover transition-transform duration-700 group-hover:scale-110 filter group-hover:brightness-110"
                    data-ai-hint={offer.hint}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                  
                  {/* Default Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-300 group-hover:opacity-0">
                    <h3 className="font-bold text-lg text-white truncate">{offer.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-green-400 font-bold text-lg">{offer.salePrice}</span>
                      <span className="text-gray-400 text-sm line-through">{offer.originalPrice}</span>
                    </div>
                  </div>

                  {/* Hover Content */}
                  <div className="absolute inset-0 p-4 bg-black/70 backdrop-blur-sm flex flex-col justify-center items-center text-center opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out">
                    <h3 className="font-bold text-xl mb-2 text-white">{offer.title}</h3>
                    <p className="text-sm text-gray-300 mb-4 line-clamp-2 leading-relaxed">{offer.description}</p>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-green-400 font-bold text-xl">{offer.salePrice}</span>
                      <span className="text-gray-400 text-sm line-through">{offer.originalPrice}</span>
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        SAVE {offer.discount}
                      </span>
                    </div>
                    
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="group/btn bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white transition-all duration-300 shadow-lg hover:shadow-xl border-0 relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center">
                        <Sparkles className="mr-2 h-4 w-4 group-hover/btn:animate-spin" />
                        Book Now
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
