'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const Testimonials2 = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <section className="py-16 px-6 lg:px-8 max-w-7xl mx-auto bg-background pb-24">

      {/* Section Header */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
            What Our Customers Say
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Real experiences from our valued customers who have transformed their beauty and wellness journeys with us.
        </p>
      </div>

      {/* Testimonials Container */}
      <div className="relative max-w-6xl mx-auto">
        {/* Static Background Card */}
        <div className="bg-gradient-to-br from-primary/80 via-primary/90 to-primary/70 rounded-3xl p-10 md:p-16 shadow-2xl relative overflow-visible z-0 border border-primary/20">

        <p className="text-center text-primary-foreground/90 font-serif text-lg md:text-xl italic mb-6 max-w-2xl mx-auto">
          Discover beauty experiences tailored just for you. Our platform connects you with premium salons and skilled professionals who prioritize your satisfaction.
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

export default Testimonials2;