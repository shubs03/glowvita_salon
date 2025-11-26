"use client";

import { cn } from "@repo/ui/cn";
import { useState, useEffect } from "react";
import { format } from 'date-fns';

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  date?: string;
  rating?: number;
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

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return '';
    }
  };

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
                
                {/* Author Role / Date */}
                <div className="text-sm text-muted-foreground mt-1">
                  {testimonial.date ? formatDate(testimonial.date) : testimonial.role}
                </div>
                
                {/* Rating */}
                {testimonial.rating && (
                  <div className="flex justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < testimonial.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                )}
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
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorReviews = async () => {
      try {
        const response = await fetch('/api/client/reviews/doctors');
        const data = await response.json();
        
        if (data.success && data.reviews.length > 0) {
          setTestimonials(data.reviews);
        } else {
          // Fallback to sample data if API fails or no reviews
          setTestimonials([
            {
              id: "1",
              quote: "The video consultation was incredibly convenient. Dr. Sarah provided excellent care and even sent my prescription digitally. Highly recommend GlowVita!",
              name: "Priya Sharma",
              role: "Feb 15, 2024"
            },
            {
              id: "2",
              quote: "Found an amazing pediatrician for my daughter through GlowVita. The booking process was seamless and the doctor was very professional and caring.",
              name: "Rajesh Kumar",
              role: "Feb 10, 2024"
            },
            {
              id: "3",
              quote: "The mental health support I received was life-changing. Dr. Emily was understanding and provided practical strategies that really helped me.",
              name: "Anita Patel",
              role: "Feb 08, 2024"
            },
            {
              id: "4",
              quote: "Emergency consultation at 2 AM saved my day. The doctor was available immediately and guided me through the crisis. Exceptional service!",
              name: "Mohammed Ali",
              role: "Feb 05, 2024"
            },
            {
              id: "5",
              quote: "GlowVita transformed how I manage my health. The platform is intuitive, doctors are qualified, and the entire experience feels premium yet accessible.",
              name: "Dr. Kavita Reddy",
              role: "Feb 01, 2024"
            },
            {
              id: "6",
              quote: "The diagnostic center they recommended was excellent. Same-day results and the entire process was coordinated perfectly through their platform.",
              name: "Suresh Gupta",
              role: "Jan 28, 2024"
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching doctor reviews:', error);
        // Fallback to sample data if API fails
        setTestimonials([
          {
            id: "1",
            quote: "The video consultation was incredibly convenient. Dr. Sarah provided excellent care and even sent my prescription digitally. Highly recommend GlowVita!",
            name: "Priya Sharma",
            role: "Feb 15, 2024"
          },
          {
            id: "2",
            quote: "Found an amazing pediatrician for my daughter through GlowVita. The booking process was seamless and the doctor was very professional and caring.",
            name: "Rajesh Kumar",
            role: "Feb 10, 2024"
          },
          {
            id: "3",
            quote: "The mental health support I received was life-changing. Dr. Emily was understanding and provided practical strategies that really helped me.",
            name: "Anita Patel",
            role: "Feb 08, 2024"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorReviews();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse mb-4 mx-auto w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded-lg animate-pulse mx-auto w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="h-24 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
                <div className="h-4 bg-gray-200 rounded-lg animate-pulse mb-2 w-1/2 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded-lg animate-pulse w-1/3 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return <TestimonialsSection testimonials={testimonials} />;
}