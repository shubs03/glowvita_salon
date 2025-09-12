
"use client";

import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { ArrowRight, Sparkles, Star, Play, Calendar, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const categories = [
  'Hair Styling', 'Nail Art', 'Skincare', 'Massages', 'Makeup', 'Barbering', 'Waxing', 'Tanning', 'Eyebrows & Lashes', 'Day Spa'
];

const floatingElements = [
  { icon: Calendar, delay: 0, position: 'top-20 left-20' },
  { icon: Users, delay: 2, position: 'top-32 right-32' },
  { icon: TrendingUp, delay: 4, position: 'bottom-40 left-16' },
  { icon: Sparkles, delay: 1, position: 'bottom-32 right-20' },
];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-background via-primary/3 to-secondary/5 text-center py-20 md:py-32 lg:py-40 overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent"></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] animate-pulse"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-float-delayed"></div>
        
        {/* Floating Icons */}
        {floatingElements.map((element, index) => (
          <div 
            key={index}
            className={`absolute ${element.position} hidden lg:block`}
            style={{ animationDelay: `${element.delay}s` }}
          >
            <div className="animate-float opacity-20 hover:opacity-40 transition-opacity duration-300">
              <element.icon className="w-8 h-8 text-primary" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Badge with Pulse Effect */}
        <div className={`transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 shadow-lg hover:shadow-primary/25 animate-pulse-glow backdrop-blur-sm">
            <Sparkles className="h-3 w-3 mr-2 text-primary animate-spin-slow" />
            <span className="font-semibold">The #1 Platform for Modern Salons</span>
            <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          </Badge>
        </div>
        
        {/* Enhanced Main Title with Typewriter Effect */}
        <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold font-headline tracking-tighter mb-6 leading-none">
            <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-gradient-x">
              Transform Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient-x">
              Salon Experience
            </span>
          </h1>
        </div>
        
        {/* Enhanced Subtitle */}
        <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto mb-10 leading-relaxed font-medium">
            The revolutionary platform that empowers <span className="text-primary font-semibold">modern salons</span> and <span className="text-primary font-semibold">stylists</span> to unlock their full potential with seamless client management, smart bookings, and instant payments.
          </p>
        </div>
        
        {/* Enhanced CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <Button
            size="lg"
            className="text-base md:text-lg px-8 md:px-12 py-4 md:py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary border-0 relative overflow-hidden"
            asChild
          >
            <Link href="/auth/register">
              <span className="relative z-10 flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-base md:text-lg px-8 md:px-12 py-4 md:py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300 border-2 bg-background/50 hover:bg-background backdrop-blur-sm group relative overflow-hidden"
            asChild
          >
            <Link href="#">
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Watch Demo
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </Button>
        </div>

        {/* Enhanced Social Proof */}
        <div className={`mt-16 transition-all duration-1000 delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
            {/* User Avatars and Rating */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <Image src="https://picsum.photos/seed/user1/48/48" alt="User 1" width={48} height={48} className="rounded-full border-3 border-background shadow-lg hover:scale-110 transition-transform cursor-pointer" data-ai-hint="woman portrait" />
                <Image src="https://picsum.photos/seed/user2/48/48" alt="User 2" width={48} height={48} className="rounded-full border-3 border-background shadow-lg hover:scale-110 transition-transform cursor-pointer" data-ai-hint="man portrait" />
                <Image src="https://picsum.photos/seed/user3/48/48" alt="User 3" width={48} height={48} className="rounded-full border-3 border-background shadow-lg hover:scale-110 transition-transform cursor-pointer" data-ai-hint="person smiling" />
                <Image src="https://picsum.photos/seed/user4/48/48" alt="User 4" width={48} height={48} className="rounded-full border-3 border-background shadow-lg hover:scale-110 transition-transform cursor-pointer" data-ai-hint="professional portrait" />
                <div className="w-12 h-12 rounded-full border-3 border-background bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shadow-lg hover:scale-110 transition-transform cursor-pointer">
                  +5k
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center mb-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
                  <span className="ml-2 text-sm font-semibold text-foreground">4.9/5</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">Trusted by 10,000+ Salons</p>
              </div>
            </div>
            
            {/* Key Stats */}
            <div className="flex gap-8 text-center">
              <div className="group cursor-pointer">
                <div className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">50K+</div>
                <div className="text-xs text-muted-foreground">Bookings Daily</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">99.9%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">24/7</div>
                <div className="text-xs text-muted-foreground">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none"></div>

    </section>
  );
}
