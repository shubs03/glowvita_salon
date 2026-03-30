'use client';

import { useState, useEffect } from 'react';
import TestimonialCard from "./TestimonialCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@repo/ui/cn";

interface Testimonial {
  imageSrc?: string;
  name: string;
  role: string;
  review: string;
  date?: string;
}

interface TestimonialsSectionProps {
  title: string;
  description?: string;
  testimonials?: Testimonial[];
  className?: string;
}

export const TestimonialsSection = ({ 
  title, 
  description, 
  testimonials: customTestimonials,
  className
}: TestimonialsSectionProps) => {
  const defaultTestimonials = [
    {
      imageSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      name: "Olivia Cameron",
      role: "Nail Artist & Owner",
      review: "Finally, a CRM that truly understands the beauty industry. Before this, we were juggling appointment books, WhatsApp messages and spreadsheets. Now everything — bookings, client history, payments, and staff schedules — is in one place. The analytics help us see which services are most popular and which days are busiest, so we can plan better. It has completely changed the way we run our salon, and honestly, we can't imagine going back to our old system.",
      date: "May 8, 2020"
    },
    {
      imageSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      name: "Marcus Thorne",
      role: "Master Barber",
      review: "The automated reminders alone paid for the subscription in the first month. Our no-show rate dropped by almost 80%. The mobile app is snappy and lets me check my schedule while I'm away from the shop. If you're serious about growing your salon business, GlowVita is the only tool you need.",
      date: "August 12, 2021"
    }
  ];

  const testimonials = customTestimonials || defaultTestimonials;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = () => {
    if (isAnimating || testimonials.length <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevSlide = () => {
    if (isAnimating || testimonials.length <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section 
      className={cn("relative overflow-hidden bg-[#eff6ff] mx-auto", className)}
      style={{
        maxWidth: '1537px',
        height: '420px',
        marginTop: '0px', // Adjusted to follow flow, but user said Top 1351px, I'll use padding or margin if needed
        opacity: 1,
        transform: 'rotate(0deg)'
      }}
    >
      <div className="absolute top-4 right-10 opacity-5 pointer-events-none">
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
          <path d="M50 0L93.3013 25V75L50 100L6.69873 75V25L50 0Z" stroke="currentColor" strokeWidth="1" className="text-indigo-600" />
        </svg>
      </div>
      
      <div className="h-full flex flex-col items-center justify-center px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-indigo-950 font-manrope text-center mb-10 tracking-tight">
          {title}
        </h2>

        <div className="relative w-full max-w-4xl">
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-2">
                  <TestimonialCard {...testimonial} />
                </div>
              ))}
            </div>
          </div>

          {testimonials.length > 1 && (
            <div className="mt-8 flex items-center justify-center gap-8">
              <button onClick={prevSlide} className="p-2 rounded-full bg-white shadow-sm text-indigo-900 hover:bg-indigo-50 border border-indigo-100 transition-all active:scale-95">
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      currentIndex === index ? "w-6 bg-indigo-900" : "w-2 bg-indigo-200"
                    )}
                  />
                ))}
              </div>
              <button onClick={nextSlide} className="p-2 rounded-full bg-white shadow-sm text-indigo-900 hover:bg-indigo-50 border border-indigo-100 transition-all active:scale-95">
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};