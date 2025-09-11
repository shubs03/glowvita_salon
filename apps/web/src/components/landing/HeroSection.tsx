"use client";

import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { ArrowRight, Sparkles, Star, Shield, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const categories = [
  'Hair Styling', 'Nail Art', 'Skincare', 'Massages', 'Makeup', 'Barbering', 'Waxing', 'Tanning', 'Eyebrows & Lashes', 'Day Spa'
];

export function HeroSection() {
  return (
    <section className="relative bg-background text-center py-20 md:py-32 lg:py-40 overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Floating Card - Left */}
        <div className="hidden lg:block absolute top-[15%] left-[5%] xl:left-[10%] w-64 animate-float" style={{ animationDelay: '0.5s' }}>
          <div className="bg-background/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-border/30">
            <p className="text-sm text-muted-foreground mb-2">Credit Limit</p>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: '48%' }}></div>
            </div>
            <p className="text-right text-sm font-semibold mt-1 text-primary">48% Used</p>
          </div>
        </div>

        {/* Floating Card - Right */}
        <div className="hidden lg:block absolute top-[20%] right-[5%] xl:right-[10%] w-56 animate-float" style={{ animationDelay: '1s' }}>
          <div className="bg-background/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-border/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Data Protection</p>
                <p className="text-xs text-muted-foreground">Enabled</p>
              </div>
            </div>
          </div>
        </div>
        
        <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 shadow-sm animate-fade-in-up">
          <Sparkles className="h-3 w-3 mr-2 text-primary" />
          The #1 Platform for Modern Salons
        </Badge>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-headline tracking-tighter mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          Your Salon, Supercharged.
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          The all-in-one platform designed for modern salons and stylists. Manage clients, bookings, and payments seamlessly to unlock your salon's full potential.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <Button
            size="lg"
            className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 group bg-primary hover:bg-primary/90"
            asChild
          >
            <Link href="/auth/register">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-300 border-2 bg-background/50 hover:bg-background"
            asChild
          >
            <Link href="#">
              Book a Demo
            </Link>
          </Button>
        </div>

        <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
            <div className="flex justify-center items-center gap-3">
                <div className="flex -space-x-2">
                    <Image src="https://picsum.photos/seed/user1/40/40" alt="User 1" width={40} height={40} className="rounded-full border-2 border-background" data-ai-hint="woman portrait" />
                    <Image src="https://picsum.photos/seed/user2/40/40" alt="User 2" width={40} height={40} className="rounded-full border-2 border-background" data-ai-hint="man portrait" />
                    <Image src="https://picsum.photos/seed/user3/40/40" alt="User 3" width={40} height={40} className="rounded-full border-2 border-background" data-ai-hint="person smiling" />
                </div>
                <div className="text-left">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                    </div>
                    <p className="text-sm text-muted-foreground">Trusted by 10,000+ Salons</p>
                </div>
            </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>

      <div className="absolute bottom-[-10%] md:bottom-[-20%] left-0 w-full h-[50vh] overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
        <div className="flex w-fit animate-slide hover:[animation-play-state:paused]">
          {[...categories, ...categories].map((category, index) => (
            <div key={index} className="flex-shrink-0 mx-3 py-3 px-6 text-lg font-semibold rounded-full bg-background/50 backdrop-blur-sm border border-border/30 shadow-md">
              {category}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
