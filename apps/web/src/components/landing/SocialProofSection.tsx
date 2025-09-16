"use client";

import { Star, ArrowRight, Calendar, Users, TrendingUp, Shield, Clock, Headphones } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@repo/ui/cn';

interface SocialProofSectionProps {
  className?: string;
}


export function SocialProofSection({ className }: SocialProofSectionProps) {
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

    const element = document.getElementById('social-proof-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
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
      gradient: "from-blue-500 to-emerald-500"
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
    <section 
      id="social-proof-section"
      className={cn(
        "relative py-24 md:py-32 bg-gradient-to-br from-background via-primary/2 to-secondary/3 overflow-hidden",
        className
      )}
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-secondary/10 to-transparent rounded-full blur-2xl animate-float-delayed"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Trust Badge */}
        <div className={cn(
          "flex justify-center mb-16 transition-all duration-1000",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative inline-flex items-center gap-3 bg-gradient-to-r from-background via-background/95 to-background px-8 py-4 rounded-full text-sm font-semibold border border-primary/20 shadow-xl backdrop-blur-sm">
              <div className="relative">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full animate-ping opacity-20"></div>
              </div>
              <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Trusted by 10,000+ beauty professionals worldwide
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Social Proof Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 max-w-7xl mx-auto mb-20">
          {/* Customer Testimonials Card */}
          <div className={cn(
            "group relative transition-all duration-1000 delay-200",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-background to-background/80 backdrop-blur-xl rounded-2xl p-8 border border-primary/10 shadow-2xl group-hover:shadow-primary/20 transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="flex -space-x-4">
                    <div className="relative">
                      <Image 
                        src="https://picsum.photos/seed/user1/56/56" 
                        alt="Happy Customer" 
                        width={56} 
                        height={56} 
                        className="rounded-full border-4 border-background shadow-xl group-hover:scale-110 transition-transform cursor-pointer" 
                        data-ai-hint="satisfied salon owner" 
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-background"></div>
                    </div>
                    <div className="relative">
                      <Image 
                        src="https://picsum.photos/seed/user2/56/56" 
                        alt="Happy Customer" 
                        width={56} 
                        height={56} 
                        className="rounded-full border-4 border-background shadow-xl group-hover:scale-110 transition-transform cursor-pointer" 
                        data-ai-hint="professional stylist" 
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-background"></div>
                    </div>
                    <div className="relative">
                      <Image 
                        src="https://picsum.photos/seed/user3/56/56" 
                        alt="Happy Customer" 
                        width={56} 
                        height={56} 
                        className="rounded-full border-4 border-background shadow-xl group-hover:scale-110 transition-transform cursor-pointer" 
                        data-ai-hint="beauty professional" 
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-background"></div>
                    </div>
                    <div className="relative w-14 h-14 rounded-full border-4 border-background bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-xl group-hover:scale-110 transition-transform cursor-pointer">
                      +10k
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
                  ))}
                  <span className="ml-3 text-lg font-bold text-foreground">4.9/5</span>
                </div>
                
                <h3 className="font-semibold text-lg text-foreground mb-2">Customer Satisfaction</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Average rating from thousands of happy salon owners and beauty professionals
                </p>
              </div>
            </div>
          </div>
          
          {/* Performance Stats Card */}
          <div className={cn(
            "transition-all duration-1000 delay-400",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}>
            <div className="h-full space-y-6">
              {stats.map((stat, index) => (
                <div key={index} className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                  <div className="relative bg-gradient-to-br from-background to-background/90 backdrop-blur-xl rounded-xl p-6 border border-primary/10 shadow-xl group-hover:shadow-primary/20 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-primary group-hover:scale-105 transition-transform">
                          {stat.number}
                        </div>
                        <div className="text-sm font-medium text-foreground">{stat.label}</div>
                        <div className="text-xs text-muted-foreground">{stat.sublabel}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Card */}
          <div className={cn(
            "transition-all duration-1000 delay-600",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}>
            <div className="group relative h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative h-full bg-gradient-to-br from-background to-background/80 backdrop-blur-xl rounded-2xl p-8 border border-primary/10 shadow-2xl group-hover:shadow-primary/20 transition-all duration-300">
                <div className="flex flex-col justify-center h-full space-y-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-2">Why Choose Us</h3>
                    <p className="text-sm text-muted-foreground">Everything you need to succeed</p>
                  </div>
                  
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-4 group/item">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${benefit.color} flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform`}>
                        <benefit.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground group-hover/item:text-primary transition-colors">
                          {benefit.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {benefit.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Call-to-Action */}
        <div className={cn(
          "text-center transition-all duration-1000 delay-800",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          <div className="relative group inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-background to-background/95 backdrop-blur-xl rounded-2xl p-8 border border-primary/20 shadow-2xl">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to Transform Your Salon?
              </h3>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
                Join thousands of salon owners who've revolutionized their business with our platform
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="inline-flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 px-6 py-3 rounded-full border border-primary/10">
                  <Calendar className="w-4 h-4" />
                  <span>Book a personalized demo • Takes only 15 minutes</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="text-blue-600 font-semibold">✓ No commitment required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
