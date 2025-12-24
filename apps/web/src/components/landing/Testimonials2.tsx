'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const Testimonials2 = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: 'Nidhi Deshmukh',
      role: 'Beauty Enthusiast',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      text: "I've tried many salons in the past, but this platform truly connected me with professionals who understand quality and care. The booking process was smooth, the stylist was incredibly skilled, and my overall experience felt premium from start to finish.",
    },
    {
      name: 'Priya Sharma',
      role: 'Regular Customer',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      text: "GlowVita has completely transformed my salon experience! The convenience of finding verified salons near me and booking appointments in just a few taps is incredible. The staff was professional, and the ambiance was perfect.",
    },
    {
      name: 'Ananya Patel',
      role: 'Wellness Advocate',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      text: "What sets GlowVita apart is the transparency and detailed information about services. I knew exactly what to expect before my appointment. The reviews helped me choose the perfect salon, and the experience exceeded my expectations.",
    },
    {
      name: 'Meera Krishnan',
      role: 'Self-Care Lover',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
      text: "I love how easy it is to discover new salons and read genuine reviews from other customers. The booking system is seamless, and the reminders ensure I never miss an appointment. GlowVita has made self-care so much more accessible!",
    },
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-16 px-6 lg:px-8 max-w-6xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          What Our Customers Say
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm">
          Real experiences from our valued customers
        </p>
      </div>

      {/* Testimonials Container */}
      <div className="relative">
        {/* Compact Purple Background Card */}
        <div className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/5 rounded-full translate-y-12 -translate-x-12"></div>

          {/* Testimonial Card */}
          <div className="bg-background rounded-xl p-6 md:p-8 shadow-2xl relative">
            {/* Quote Icon */}
            <div className="absolute -top-3 -left-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Quote className="w-5 h-5 text-primary-foreground" />
            </div>

            {/* Content */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile Section */}
              <div className="flex-shrink-0 text-center md:text-left">
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-lg">
                    <img
                      src={testimonials[currentIndex].image}
                      alt={testimonials[currentIndex].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full border-2 border-background"></div>
                </div>
                <h4 className="text-lg font-bold text-foreground mt-3">
                  {testimonials[currentIndex].name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {testimonials[currentIndex].role}
                </p>
              </div>

              {/* Divider for Desktop */}
              <div className="hidden md:block w-px h-24 bg-border"></div>

              {/* Text Content */}
              <div className="flex-1">
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed italic">
                  "{testimonials[currentIndex].text}"
                </p>
              </div>
            </div>
          </div>

          {/* Compact Pagination */}
          <div className="flex justify-center items-center gap-3 mt-5">
            <button
              onClick={prevTestimonial}
              className="w-8 h-8 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4 text-primary-foreground" />
            </button>

            <div className="flex gap-1.5">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-6 bg-primary-foreground'
                      : 'w-1.5 bg-primary-foreground/40 hover:bg-primary-foreground/60'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-8 h-8 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials2;