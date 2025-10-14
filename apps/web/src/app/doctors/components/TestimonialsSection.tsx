"use client";

import { cn } from "@repo/ui/cn";
import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  quote: string;
  condition: string;
  doctor: string;
  avatar: string;
  date: string;
}

export function TestimonialsSection() {
  const testimonials: Testimonial[] = [
    {
      id: "1",
      name: "Sarah Mitchell",
      location: "New York, NY",
      rating: 5,
      quote: "The consultation was amazing! Dr. Johnson was thorough and helped me understand my heart condition better. The video quality was excellent.",
      condition: "Heart Health",
      doctor: "Dr. Sarah Johnson",
      avatar: "https://placehold.co/60x60/3B82F6/FFFFFF?text=SM",
      date: "2 days ago"
    },
    {
      id: "2", 
      name: "Michael Chen",
      location: "Los Angeles, CA",
      rating: 5,
      quote: "Quick and professional service. Got my skin concern addressed within minutes. The prescription was sent digitally which was very convenient.",
      condition: "Dermatology",
      doctor: "Dr. Michael Chen",
      avatar: "https://placehold.co/60x60/10B981/FFFFFF?text=MC",
      date: "1 week ago"
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      location: "Chicago, IL",
      rating: 5,
      quote: "As a busy mom, being able to get medical advice for my kids without leaving home is a game-changer. Dr. Rodriguez was so patient and understanding.",
      condition: "Pediatrics",
      doctor: "Dr. Emily Rodriguez",
      avatar: "https://placehold.co/60x60/8B5CF6/FFFFFF?text=ER",
      date: "3 days ago"
    },
    {
      id: "4",
      name: "James Wilson",
      location: "Boston, MA",
      rating: 4,
      quote: "Professional consultation for my neurological concerns. The doctor explained everything clearly and provided helpful treatment recommendations.",
      condition: "Neurology",
      doctor: "Dr. James Wilson",
      avatar: "https://placehold.co/60x60/F97316/FFFFFF?text=JW",
      date: "5 days ago"
    },
    {
      id: "5",
      name: "Lisa Thompson",
      location: "Seattle, WA",
      rating: 5,
      quote: "The 24/7 availability saved me during a weekend emergency. The doctor was compassionate and provided immediate relief for my anxiety.",
      condition: "Mental Health",
      doctor: "Dr. Amanda Smith",
      avatar: "https://placehold.co/60x60/EC4899/FFFFFF?text=LT",
      date: "1 day ago"
    },
    {
      id: "6",
      name: "David Park",
      location: "San Francisco, CA",
      rating: 5,
      quote: "Excellent platform for diabetes management consultation. The doctor provided personalized advice and adjusted my treatment plan effectively.",
      condition: "Endocrinology",
      doctor: "Dr. Robert Kim",
      avatar: "https://placehold.co/60x60/06B6D4/FFFFFF?text=DP",
      date: "4 days ago"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide functionality
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

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
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-4">
            What Our Patients Say
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Real experiences from patients who found quality healthcare through our platform
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div 
          className="relative mb-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.id}-${currentIndex}`}
                className={cn(
                  "bg-white rounded-md border border-border/50 p-6 shadow-sm transition-all duration-500 hover:shadow-lg hover:-translate-y-1",
                  index === 0 && "lg:scale-105 lg:shadow-lg border-primary/20"
                )}
              >
                {/* Quote Icon */}
                <div className="flex justify-between items-start mb-4">
                  <Quote className="h-6 w-6 text-primary/30" />
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < testimonial.rating 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-foreground leading-relaxed mb-6 text-sm">
                  "{testimonial.quote}"
                </blockquote>

                {/* Patient Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full border-2 border-primary/10"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-foreground text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.location} • {testimonial.date}
                    </div>
                    <div className="text-xs text-primary mt-1">
                      {testimonial.condition} with {testimonial.doctor}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
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
              />
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/2 rounded-md border border-primary/10">
            <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
            <div className="text-xs text-muted-foreground mt-1">Based on 15,000+ reviews</div>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-500/5 to-green-500/2 rounded-md border border-green-500/10">
            <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
            <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            <div className="text-xs text-muted-foreground mt-1">Patients recommend us</div>
          </div>
          <div className="p-6 bg-gradient-to-br from-blue-500/5 to-blue-500/2 rounded-md border border-blue-500/10">
            <div className="text-3xl font-bold text-blue-600 mb-2">15 min</div>
            <div className="text-sm text-muted-foreground">Average Response</div>
            <div className="text-xs text-muted-foreground mt-1">Quick consultation start</div>
          </div>
        </div>
      </div>
    </section>
  );
}