
"use client";

import { BrainCircuit, Bot, LineChart, Code, Check, ArrowRight, Scissors, Calendar, CreditCard, Users, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '@repo/ui/cn';
import { ModernCard } from '@repo/ui/modern-card';
import { useState, useEffect } from 'react';

const services = [
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "Smart Booking System",
    description: "Help your clients book appointments effortlessly with our intelligent scheduling system featuring real-time availability, automated reminders, and seamless calendar sync that reduces no-shows by 40%.",
    className: "lg:col-span-2",
    gradient: "from-blue-500/20 to-cyan-500/20",
    color: "text-blue-600"
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Client Management",
    description: "Provide personalized experiences for your clients with comprehensive profiles, service history tracking, preference management, and detailed notes that enhance customer satisfaction.",
    className: "lg:col-span-1",
    gradient: "from-blue-600/20 to-blue-500/20",
    color: "text-blue-600"
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: "Payment Processing",
    description: "Offer your clients convenient, secure payment options with instant processing, multiple payment methods, automated invoicing, and transparent financial tracking.",
    className: "lg:col-span-1",
    gradient: "from-indigo-500/20 to-blue-500/20",
    color: "text-blue-600"
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Analytics & Insights",
    description: "Understand your clients better with powerful analytics showing booking patterns, service preferences, revenue insights, and customer lifetime value to enhance their experience.",
    className: "lg:col-span-2",
    gradient: "from-cyan-500/20 to-blue-500/20",
    color: "text-blue-600"
  },
  {
    icon: <Scissors className="h-6 w-6" />,
    title: "Service Catalog",
    description: "Present your services beautifully to clients with dynamic catalogs, transparent pricing, service packages, and personalized recommendations based on their preferences.",
    className: "lg:col-span-1",
    gradient: "from-blue-700/20 to-blue-500/20",
    color: "text-blue-600"
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "Loyalty Programs",
    description: "Reward your loyal clients with automated loyalty programs, personalized promotions, and exclusive offers that increase retention and encourage repeat visits.",
    className: "lg:col-span-1",
    gradient: "from-sky-500/20 to-blue-500/20",
    color: "text-blue-600"
  },
];

const ServiceCard = ({ icon, title, description, className, gradient, color }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  className?: string,
  gradient: string,
  color: string
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={cn("group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ModernCard 
        variant="elevated" 
        hover 
        className="h-96 flex flex-col p-8 relative overflow-hidden hover-lift transition-all duration-500 border-2 hover:border-primary/30"
      >
        {/* Background Gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          gradient
        )}></div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-1 h-1 bg-primary/30 rounded-full transition-all duration-1000",
                isHovered ? "animate-float" : "opacity-0"
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Icon Container */}
        <div className="relative z-10">
          <div className={cn(
            "w-16 h-16 rounded-md flex items-center justify-center mb-6 shadow-lg border border-primary/20 transition-all duration-500 relative overflow-hidden",
            "bg-gradient-to-br from-background to-primary/5",
            "group-hover:scale-105 group-hover:rotate-3 group-hover:shadow-lg",
            color
          )}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 transition-transform duration-300 group-hover:scale-105">
              {icon}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex-grow">
          <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed text-sm flex-grow mb-6">
            {description}
          </p>
        </div>
        
        {/* CTA */}
        <div className="relative z-10">
          <div className={cn(
            "inline-flex items-center gap-2 text-sm font-semibold transition-all duration-300 cursor-pointer",
            "group-hover:bg-primary/10 group-hover:px-3 group-hover:py-1 group-hover:rounded-full",
            color
          )}>
            <span>Explore Feature</span>
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </ModernCard>
    </div>
  );
};

export function Services() {
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

    const element = document.getElementById('services-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="services-section"
      className="py-20 md:py-28 bg-gradient-to-br from-background via-secondary/5 to-background relative overflow-hidden"
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-secondary/30 [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)] opacity-30"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-full blur-3xl animate-float-delayed"></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className={cn(
          "text-center mb-16 md:mb-20 transition-all duration-1000",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          <h2 className="text-4xl lg:text-6xl font-bold font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-6">
            Powerful Features for Your Clients
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Enhance your clients' experience with GlowVita's comprehensive suite of tools designed to streamline their booking journey, provide personalized service, and create lasting relationships.
          </p>
        </div>
        
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 delay-300",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          {services.map((service, index) => (
            <div
              key={index}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ServiceCard {...service} />
            </div>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className={cn(
          "text-center mt-16 transition-all duration-1000 delay-500",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer hover-lift">
            <span className="text-base font-semibold">Explore All Features</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </section>
  );
}
