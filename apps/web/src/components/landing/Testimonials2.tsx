'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const Testimonials2 = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      name: 'Nidhi Deshmukh',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      text: "I've tried many salons in the past, but this platform truly connected me with professionals who understand quality and care. The booking process was smooth, the stylist was incredibly skilled, and my overall experience felt premium from start to finish. I finally found a place I can trust with my hair and beauty needs, and I'm genuinely excited to come back again.",
    },
    {
      name: 'Priya Sharma',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      text: "GlowVita has completely transformed my salon experience! The convenience of finding verified salons near me and booking appointments in just a few taps is incredible. The staff was professional, and the ambiance was perfect.",
    },
    {
      name: 'Ananya Patel',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      text: "What sets GlowVita apart is the transparency and detailed information about services. I knew exactly what to expect before my appointment. The reviews helped me choose the perfect salon, and the experience exceeded my expectations.",
    },
    {
      name: 'Meera Krishnan',
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
    <section className="pt-5 px-6 lg:px-8 max-w-7xl mx-auto bg-background pb-28">
      {/* Section Header */}
      <div className="mb-8 flex items-center justify-between">
        <h2
          className="relative inline-block text-2xl md:text-3xl font-serif font-bold pb-3"
          style={{ color: "#252B42" }}
        >
          What Our Customers Say
          <span
            className="absolute left-0 bottom-0 h-[3px] w-full rounded-full"
            style={{
              background:
                "linear-gradient(to right, #252B42 0%, #252B42 40%, transparent 100%)",
            }}
          />
        </h2>
      </div>

      {/* Testimonials Container */}
      <div className="relative max-w-5xl mx-auto px-4 md:px-12">
        {/* Left Arrow Button */}
        <button
          onClick={prevTestimonial}
          className="absolute -left-2 md:-left-8 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 bg-white rounded-full border border-gray-200 shadow-md hover:bg-gray-50 transition-colors z-20"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={nextTestimonial}
          className="absolute -right-2 md:-right-8 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 bg-black rounded-full shadow-md hover:bg-gray-800 transition-colors z-20"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Central Dark Purple Card */}
        <div
          className="bg-primary rounded-[32px] pt-12 pb-24 md:pb-28 px-6 md:px-16 text-center relative shadow-xl overflow-visible animate-fade-in"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <h3 className="text-white text-2xl md:text-3xl font-bold font-serif mb-4">
            Testimonials
          </h3>
          <p className="text-primary-foreground/90 font-serif text-xs md:text-sm max-w-2xl mx-auto leading-relaxed mb-6">
            See how GlowVita has transformed the way customers discover and enjoy salon services. From hassle-free bookings to exceptional salon experiences, these shared stories shine a light on the value we bring to our users.
          </p>

          {/* Testimonial Card - Positioned relative with translation to overlap the bottom edge */}
          <div className="relative z-10 translate-y-16 bg-white rounded-3xl p-6 md:p-8 pt-10 pb-10 shadow-2xl border border-gray-100 max-w-3xl mx-auto text-left min-h-[220px]">
            {/* Opening Quote Mark */}
            <span
              className="absolute top-4 left-6 text-5xl font-serif text-black leading-none select-none font-bold"
              style={{ fontFamily: "Georgia, serif" }}
            >
              “
            </span>

            {/* Closing Quote Mark */}
            <span
              className="absolute bottom-1 right-6 text-5xl font-serif text-black leading-none select-none font-bold"
              style={{ fontFamily: "Georgia, serif" }}
            >
              ”
            </span>

            {/* Content layout: Avatar + Connector + Text */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pt-2 px-2">
              {/* Profile image container */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 shadow-sm">
                  <img
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Tan/Peach Connector line with dot */}
                <div className="hidden md:flex items-center gap-0.5 w-12 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e3bc9a]" />
                  <div className="h-[1.5px] bg-[#e3bc9a] flex-grow" />
                </div>
              </div>

              {/* Text Block */}
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                  {testimonials[currentIndex].name}
                </h4>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed font-normal">
                  {testimonials[currentIndex].text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials2;