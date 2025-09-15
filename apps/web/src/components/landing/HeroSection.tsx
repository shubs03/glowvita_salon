
"use client";

import React from 'react';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { ArrowRight, Sparkles, Star, Play, Calendar, Users, TrendingUp, Shield, Clock, Headphones } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@repo/ui/cn';

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

  const benefits = [
    {
      icon: Clock,
      title: "Quick Setup",
      description: "Setup in under 5 minutes",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Headphones,
      title: "24/7 Support", 
      description: "24/7 customer support",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Shield,
      title: "Free Migration",
      description: "Free migration assistance", 
      color: "from-purple-500 to-indigo-500"
    }
  ];

  const stats = [
    {
      number: "2.5M+",
      label: "Appointments Booked",
      sublabel: "Monthly active bookings",
      icon: Calendar,
      gradient: "from-pink-500 to-rose-500"
    },
    {
      number: "99.9%", 
      label: "Service Uptime",
      sublabel: "Guaranteed reliability",
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      number: "10K+",
      label: "Active Salons",
      sublabel: "Worldwide partners", 
      icon: Users,
      gradient: "from-blue-500 to-indigo-500"
    }
  ];

  return (
    <section className="relative bg-gradient-to-br from-background via-primary/3 to-secondary/5 text-center py-20 md:py-20 lg:py-20 overflow-hidden">
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
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Badge with Pulse Effect */}
        <div className={`transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 shadow-lg hover:shadow-primary/25 animate-pulse-glow backdrop-blur-sm">
            <Sparkles className="h-3 w-3 mr-2 text-primary animate-spin-slow" />
            <span className="font-semibold">The #1 Platform for Modern Salons</span>
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
            className="text-base rounded-full md:text-base shadow-xl hover:shadow-2xl transition-all duration-300 group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary border-0 relative overflow-hidden"
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
            className="text-base md:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 bg-background/50 hover:bg-background backdrop-blur-sm group relative overflow-hidden"
            asChild
          >
            <Link href="#">
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Watch Demo
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </Button>
        </div>

        {/* Enhanced Social Proof - Bento Grid */}
        <div className={`mt-20 transition-all duration-1000 delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Trust Badge */}
          <div className="flex justify-center mb-12">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative inline-flex items-center gap-3 bg-gradient-to-r from-background via-background/95 to-background px-6 py-3 rounded-full text-sm font-semibold border border-primary/20 shadow-xl backdrop-blur-sm">
                <div className="relative">
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2.5 h-2.5 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-ping opacity-20"></div>
                </div>
                <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Trusted by 10,000+ beauty professionals worldwide
                </span>
              </div>
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-8 gap-4 lg:gap-6 max-w-7xl mx-auto">
            
            {/* Large Customer Testimonials Card - spans 3 columns on md, 4 on lg */}
            <div className="md:col-span-3 lg:col-span-4 group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative h-full bg-gradient-to-br from-background to-background/80 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-primary/10 shadow-2xl group-hover:shadow-primary/20 transition-all duration-300">
                <div className="flex flex-col justify-center h-full">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                      <div className="flex -space-x-3">
                        <div className="relative">
                          <Image 
                            src="https://picsum.photos/seed/user1/48/48" 
                            alt="Happy Customer" 
                            width={48} 
                            height={48} 
                            className="rounded-full border-3 border-background shadow-lg group-hover:scale-110 transition-transform cursor-pointer" 
                            data-ai-hint="satisfied salon owner" 
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                        </div>
                        <div className="relative">
                          <Image 
                            src="https://picsum.photos/seed/user2/48/48" 
                            alt="Happy Customer" 
                            width={48} 
                            height={48} 
                            className="rounded-full border-3 border-background shadow-lg group-hover:scale-110 transition-transform cursor-pointer" 
                            data-ai-hint="professional stylist" 
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                        </div>
                        <div className="relative">
                          <Image 
                            src="https://picsum.photos/seed/user3/48/48" 
                            alt="Happy Customer" 
                            width={48} 
                            height={48} 
                            className="rounded-full border-3 border-background shadow-lg group-hover:scale-110 transition-transform cursor-pointer" 
                            data-ai-hint="beauty professional" 
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                        </div>
                        <div className="relative w-12 h-12 rounded-full border-3 border-background bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-xs shadow-lg group-hover:scale-110 transition-transform cursor-pointer">
                          +10k
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
                        ))}
                        <span className="ml-2 text-lg font-bold text-foreground">4.9/5</span>
                      </div>
                      <h3 className="font-semibold text-lg text-foreground mb-1">Customer Satisfaction</h3>
                      <p className="text-muted-foreground text-sm">
                        Average rating from happy salon owners
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards - 2 columns on md, spans 2 on lg */}
            <div className="md:col-span-2 lg:col-span-2 space-y-4 lg:space-y-6">
              {stats.slice(0, 2).map((stat, index) => (
                <div key={index} className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                  <div className="relative bg-gradient-to-br from-background to-background/90 backdrop-blur-xl rounded-xl p-4 lg:p-6 border border-primary/10 shadow-xl group-hover:shadow-primary/20 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xl lg:text-2xl font-bold text-primary group-hover:scale-105 transition-transform">
                          {stat.number}
                        </div>
                        <div className="text-xs lg:text-sm font-medium text-foreground truncate">{stat.label}</div>
                        <div className="text-xs text-muted-foreground truncate">{stat.sublabel}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Third Stat Card - spans 1 column on md, 2 on lg */}
            <div className="md:col-span-1 lg:col-span-2 group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative h-full bg-gradient-to-br from-background to-background/90 backdrop-blur-xl rounded-xl p-4 lg:p-6 border border-primary/10 shadow-xl group-hover:shadow-primary/20 transition-all duration-300">
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-r ${stats[2].gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-3`}>
                    {React.createElement(stats[2].icon, { className: "w-6 h-6 lg:w-8 lg:h-8 text-white" })}
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-primary group-hover:scale-105 transition-transform">
                    {stats[2].number}
                  </div>
                  <div className="text-sm font-medium text-foreground">{stats[2].label}</div>
                  <div className="text-xs text-muted-foreground">{stats[2].sublabel}</div>
                </div>
              </div>
            </div>

            {/* Benefits Cards - spans full width on mobile, 3 columns each on md, 2+2+4 on lg */}
            {benefits.map((benefit, index) => (
              <div key={index} className={cn(
                "group relative",
                "md:col-span-2",
                index === 2 ? "lg:col-span-4" : "lg:col-span-2"
              )}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative h-full bg-gradient-to-br from-background to-background/80 backdrop-blur-xl rounded-xl p-4 lg:p-6 border border-primary/10 shadow-xl group-hover:shadow-primary/20 transition-all duration-300">
                  <div className="flex items-center gap-4 h-full">
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r ${benefit.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                      <benefit.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {benefit.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {benefit.description}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Call-to-Action Card - spans full width */}
            <div className="md:col-span-6 lg:col-span-8 group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-gradient-to-br from-background to-background/95 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-primary/20 shadow-2xl text-center">
                <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3">
                  Ready to Transform Your Salon?
                </h3>
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of salon owners who've revolutionized their business
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="inline-flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 px-6 py-3 rounded-full border border-primary/10">
                    <Calendar className="w-4 h-4" />
                    <span>Book a personalized demo • Takes only 15 minutes</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="text-green-600 font-semibold">✓ No commitment required</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Enhanced Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none"></div>
      
      {/* Scroll Indicator */}
      {/*  */}

    </section>
  );
}
