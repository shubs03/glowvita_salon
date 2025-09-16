
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/card";
import { Search, CalendarCheck, Heart, Sparkles, ArrowRight, CheckCircle, Clock } from "lucide-react";
import { useState, useEffect } from 'react';
import { cn } from '@repo/ui/cn';

const steps = [
  {
    icon: <Search className="h-8 w-8 text-primary" />,
    title: "Discover & Explore",
    description: "Browse through our curated selection of premium salons and discover the perfect match for your beauty and wellness needs.",
    details: "Filter by services, location, ratings, and price to find exactly what you're looking for.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10"
  },
  {
    icon: <CalendarCheck className="h-8 w-8 text-primary" />,
    title: "Book Instantly",
    description: "Select your preferred service and time slot with our intelligent booking system that shows real-time availability.",
    details: "Get instant confirmation and automated reminders to ensure you never miss your appointment.",
    color: "from-purple-500 to-pink-500", 
    bgColor: "bg-purple-500/10"
  },
  {
    icon: <Heart className="h-8 w-8 text-primary" />,
    title: "Enjoy & Relax",
    description: "Experience premium treatments from certified professionals in beautiful, modern facilities designed for your comfort.",
    details: "Rate your experience and earn loyalty points for future bookings.",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10"
  }
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
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

    const element = document.getElementById('how-it-works');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      id="how-it-works"
      className="py-24 md:py-32 bg-gradient-to-br from-secondary/20 via-background to-primary/10 relative overflow-hidden"
    >
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,white,transparent_70%)] opacity-20"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-secondary/20 to-transparent rounded-full blur-3xl animate-float-delayed"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Header */}
        <div className={cn(
          "text-center mb-20 transition-all duration-1000",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg backdrop-blur-sm">
            <Sparkles className="h-4 w-4 animate-spin-slow" />
            Simple Process
            <Clock className="h-4 w-4" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-6">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Get started in just three simple steps and experience the future of salon booking.
          </p>
        </div>

        {/* Enhanced Steps */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connection Lines */}
          <div className="absolute top-24 left-1/2 w-1 h-full bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 -translate-x-1/2 hidden lg:block"></div>
          
          <div className="space-y-24 lg:space-y-32">
            {steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  "flex flex-col lg:flex-row items-center gap-12 lg:gap-20 transition-all duration-1000",
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                )}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Step Content */}
                <div className="lg:w-1/2 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    Step {index + 1}
                  </div>
                  
                  <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                    {step.description}
                  </p>
                  <p className="text-base text-muted-foreground/80 leading-relaxed">
                    {step.details}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-6 text-primary font-medium cursor-pointer group">
                    <span>Learn More</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Step Visual */}
                <div className="lg:w-1/2 flex justify-center">
                  <div className="relative">
                    {/* Main Circle */}
                    <div className={cn(
                      "w-40 h-40 lg:w-48 lg:h-48 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 border-4 border-white/20 relative overflow-hidden",
                      step.bgColor,
                      activeStep === index ? "scale-110 shadow-primary/30" : "scale-100"
                    )}>
                      {/* Gradient Background */}
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-20",
                        step.color
                      )}></div>
                      
                      {/* Icon */}
                      <div className="relative z-10 transition-transform duration-300 hover:scale-110">
                        {step.icon}
                      </div>
                      
                      {/* Pulse Effect */}
                      {activeStep === index && (
                        <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping"></div>
                      )}
                    </div>
                    
                    {/* Floating Particles */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "absolute w-2 h-2 bg-primary/30 rounded-full transition-all duration-1000",
                            activeStep === index ? "animate-float opacity-100" : "opacity-0"
                          )}
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.2}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Indicators */}
        <div className={cn(
          "flex justify-center gap-4 mt-16 transition-all duration-1000 delay-600",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                activeStep === index 
                  ? "bg-primary scale-125 shadow-lg shadow-primary/50" 
                  : "bg-primary/30 hover:bg-primary/50"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
