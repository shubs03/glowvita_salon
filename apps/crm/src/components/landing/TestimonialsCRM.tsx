'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TestimonialsCRM = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Salon Owner',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      text: "The CRM has transformed how we manage our client relationships. We've seen a 40% increase in repeat bookings since implementing it.",
    },
    {
      name: 'Michael Chen',
      role: 'Spa Manager',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      text: "Managing staff schedules and client appointments has never been easier. The automation features save us hours each week.",
    },
    {
      name: 'Emma Rodriguez',
      role: 'Beauty Professional',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      text: "The analytics dashboard gives us insights we never had before. We can now personalize services based on client history.",
    },
    {
      name: 'David Wilson',
      role: 'Business Director',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      text: "Our revenue increased by 30% after implementing targeted marketing campaigns through the CRM system.",
    },
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background pb-20">

      {/* Section Header */}
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

      {/* Testimonials Container */}
      <div className="relative max-w-7xl mx-auto">
        {/* Static Background Card */}
        <div className="bg-gradient-to-br from-primary/80 via-primary/90 to-primary/70 rounded-3xl p-10 md:p-16 shadow-2xl relative overflow-visible z-0 border border-primary/20">

        <p className="text-center text-primary-foreground/90 font-serif text-lg md:text-xl italic mb-6 max-w-2xl mx-auto">
          Transform your salon business with our powerful CRM tools. Experience growth and efficiency like never before.
        </p>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary-foreground/10 rounded-full -translate-y-20 translate-x-20 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-foreground/10 rounded-full translate-y-16 -translate-x-16 blur-xl"></div>
          <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-primary-foreground/5 rounded-full blur-xl"></div>

          {/* Animated Testimonial Card - positioned to extend outside the outer card */}
          <div className="relative z-10 -mt-30 -mb-24 transition-all duration-700 ease-in-out">
            <div className="bg-background rounded-2xl p-6 md:p-10 shadow-2xl relative transform  transition-transform duration-300">
              {/* Quote Icon */}
              <div className="absolute -top-5 -left-5 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-xl z-20">
                <Quote className="w-5 h-5 text-primary-foreground" />
              </div>

              <div className="absolute -bottom-5 -right-5 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-xl z-20">
                <Quote className="w-5 h-5 text-primary-foreground" />
              </div>

              {/* Content */}
              <div className="flex flex-col md:flex-row items-center gap-8 pt-6">
                {/* Profile Section */}
                <div className="flex-shrink-0 text-center md:text-left">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/30 shadow-xl mx-auto md:mx-0">
                      <img
                        src={testimonials[currentIndex].image}
                        alt={testimonials[currentIndex].name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                  </div>
                  <h4 className="text-xl font-bold text-foreground mt-4">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[currentIndex].role}
                  </p>
                </div>

                {/* Divider for Desktop */}
                <div className="hidden md:block w-px h-28 bg-gradient-to-b from-transparent via-primary/30 to-transparent"></div>

                {/* Text Content */}
                <div className="flex-1 text-center md:text-left">
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed italic">
                    "{testimonials[currentIndex].text}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCRM;