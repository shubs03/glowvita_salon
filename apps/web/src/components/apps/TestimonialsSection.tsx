'use client';

import { useState, useEffect, useRef } from 'react';
import TestimonialCard from "./TestimonialCard";
import { cn } from "@repo/ui/cn";

interface Testimonial {
  review: string;
  author: string;
  location: string;
  rating: number;
}

interface TestimonialsSectionProps {
  title: string;
  description: string;
  testimonials: Testimonial[];
  className?: string;
}

export const TestimonialsSection = ({ 
  title, 
  description, 
  testimonials,
  className
}: TestimonialsSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState(0);
  const totalWidth = testimonials.length * 384; // 384px per testimonial
  
  useEffect(() => {
    if (isHovered || testimonials.length === 0) return;
    
    const interval = setInterval(() => {
      setPosition(prev => {
        // Move left continuously
        let newPosition = prev - 1;
        // When we've moved past the first set of testimonials, reset
        if (newPosition <= -totalWidth) {
          return 0;
        }
        return newPosition;
      });
    }, 50); // Adjust speed as needed
    
    return () => clearInterval(interval);
  }, [isHovered, totalWidth, testimonials.length]);

  // Duplicate testimonials for seamless loop
  const allTestimonials = [...testimonials, ...testimonials];
  
  return (
    <section className={cn("py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background pb-20", className)}>
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
            {title}
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          {description}
        </p>
      </div>

      <div 
        ref={containerRef}
        className="overflow-hidden w-full py-4 relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left fade overlay */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        {/* Right fade overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
        
        <div 
          className="flex" 
          style={{ 
            transform: `translateX(${position}px)`
          }}
        >
          {allTestimonials.map((testimonial, i) => (
            <div key={`${testimonial.author}-${i}`} className="flex-shrink-0 w-[384px] px-3">
              <TestimonialCard {...testimonial} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};