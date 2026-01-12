'use client';

import { useState, useEffect, useRef } from 'react';
import TestimonialCard from "./TestimonialCard";

const TestimonialsSection = () => {
  const testimonials = [
    {
      review:
        "The mobile app has been a game-changer for my salon. I can manage everything on the fly, and my clients love how easy it is to book appointments.",
      author: "Jane D.",
      role: "Owner, The Style Hub",
      rating: 5,
    },
    {
      review:
        "Finally, a CRM that understands the beauty industry. The analytics are powerful and the client management features are top-notch.",
      author: "Michael S.",
      role: "Lead Stylist, Urban Shears",
      rating: 5,
    },
    {
      review:
        "My no-show rate has dropped significantly since using the automated reminders in the app. A must-have for any serious salon owner.",
      author: "Jessica P.",
      role: "Nail Artist & Owner",
      rating: 5,
    },
    {
      review:
        "I love being able to check my schedule and sales from my phone. It gives me so much freedom and flexibility.",
      author: "Chris T.",
      role: "Barber, The Dapper Den",
      rating: 4,
    },
    {
      review:
        "Our clients constantly compliment how professional and easy our booking app is. It has definitely elevated our brand.",
      author: "Emily R.",
      role: "Spa Manager, Serenity Now",
      rating: 5,
    },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState(0);
  const totalWidth = testimonials.length * 384; // 384px per testimonial
  
  useEffect(() => {
    if (isHovered) return;
    
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
  }, [isHovered, totalWidth]);

  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background pb-20">
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
            Client Success Stories
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Hear from salon owners and professionals who have transformed their business with our CRM platform.
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
          {[...testimonials, ...testimonials].map((testimonial, i) => (
            <div key={i} className="flex-shrink-0 w-[384px] px-3">
              <TestimonialCard {...testimonial} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;