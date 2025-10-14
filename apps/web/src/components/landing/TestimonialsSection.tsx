"use client";

import { cn } from "@repo/ui/cn";
import { useState, useEffect } from "react";

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide functionality
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isPaused, testimonials.length]);

  // Get testimonials to display (current + next 2, cycling through)
  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      visible.push(testimonials[index]);
    }
    return visible;
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-4">
            What Our Patients Say
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Real experiences from patients who trust us with their healthcare
          </p>
        </div>

        {/* Slider Container */}
        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Testimonials Slider */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 transition-all duration-700 ease-in-out">
            {visibleTestimonials.map((testimonial, index) => (
              <div 
                key={`${testimonial.id}-${currentIndex}-${index}`}
                className={cn(
                  "text-center transition-all duration-700 ease-in-out",
                  "transform opacity-100"
                )}
              >
                {/* Testimonial Quote */}
                <blockquote className="text-lg leading-relaxed text-foreground mb-6 font-normal">
                  "{testimonial.quote}"
                </blockquote>
                
                {/* Author Name */}
                <div className="font-semibold text-foreground text-base">
                  {testimonial.name}
                </div>
                
                {/* Author Role */}
                <div className="text-sm text-muted-foreground mt-1">
                  {testimonial.role}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slider Indicators */}
        <div className="flex justify-center mt-12 gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-primary w-8"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animation-paused {
          animation-play-state: paused !important;
        }
      `}</style>
    </section>
  );
}

// Default export with sample data
export default function TestimonialsSectionWithData() {
  const testimonials: Testimonial[] = [
    {
      id: "1",
      quote: "The video consultation was incredibly convenient. Dr. Sarah provided excellent care and even sent my prescription digitally. Highly recommend GlowVita!",
      name: "Priya Sharma",
      role: "Software Engineer"
    },
    {
      id: "2",
      quote: "Found an amazing pediatrician for my daughter through GlowVita. The booking process was seamless and the doctor was very professional and caring.",
      name: "Rajesh Kumar",
      role: "Business Owner"
    },
    {
      id: "3",
      quote: "The mental health support I received was life-changing. Dr. Emily was understanding and provided practical strategies that really helped me.",
      name: "Anita Patel",
      role: "Teacher"
    },
    {
      id: "4",
      quote: "Emergency consultation at 2 AM saved my day. The doctor was available immediately and guided me through the crisis. Exceptional service!",
      name: "Mohammed Ali",
      role: "Marketing Manager"
    },
    {
      id: "5",
      quote: "GlowVita transformed how I manage my health. The platform is intuitive, doctors are qualified, and the entire experience feels premium yet accessible.",
      name: "Dr. Kavita Reddy",
      role: "Dentist & Patient"
    },
    {
      id: "6",
      quote: "The diagnostic center they recommended was excellent. Same-day results and the entire process was coordinated perfectly through their platform.",
      name: "Suresh Gupta",
      role: "Retired Professor"
    }
  ];

  return <TestimonialsSection testimonials={testimonials} />;
}
