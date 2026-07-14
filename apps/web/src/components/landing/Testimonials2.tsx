'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  const nextTestimonial = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const current = testimonials[currentIndex];

  return (
    /* pb-40: gives vertical space for the white card that hangs below the purple box */
    <section className="pt-5 container mx-auto px-4 sm:px-6 lg:px-8 bg-background pb-[5.5rem]">

      {/* ── Section Header ── */}
      <div className="mb-6">
        <h2
          className="relative inline-block text-2xl md:text-3xl font-serif font-bold pb-3"
          style={{ color: '#252B42' }}
        >
          What Our Customers Say
          <span
            className="absolute left-0 bottom-0 h-[3px] w-full rounded-full"
            style={{ background: 'linear-gradient(to right, #252B42 0%, #252B42 40%, transparent 100%)' }}
          />
        </h2>
      </div>

      {/*
        mx-12 gives horizontal room for the arrows that sit outside the purple box.
        The arrows are absolute children of the purple box, so top-1/2 is relative
        to the purple box height only — they land at its vertical mid-point.
      */}
      <div className="mx-8 md:mx-12">

        {/*
          Purple box: relative + overflow-visible
          The white card (absolute child) will hang below this box.
          pb-36 creates the interior space the card needs to peek out from.
        */}
        <div
          className="relative  pt-10 pb-36 text-center shadow-xl overflow-visible"
          style={{ backgroundColor: '#3D2645' }}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >

          {/* ── Left Arrow — outside left edge, vertically centred on this box ── */}
          <button
            onClick={() => { prevTestimonial(); setIsAutoPlaying(false); }}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className="absolute -left-12 top-1/2 -translate-y-1/2 z-20
                       flex items-center justify-center w-10 h-10
                       bg-white rounded-full border border-gray-200 shadow-md
                       hover:bg-gray-50 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>

          {/* ── Right Arrow — outside right edge, vertically centred on this box ── */}
          <button
            onClick={() => { nextTestimonial(); setIsAutoPlaying(false); }}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className="absolute -right-12 top-1/2 -translate-y-1/2 z-20
                       flex items-center justify-center w-10 h-10
                       bg-gray-900 rounded-full shadow-md
                       hover:bg-gray-700 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Purple box text content */}
          <h3 className="text-white text-2xl md:text-3xl font-bold font-serif mb-4 px-8">
            Testimonials
          </h3>
          <p className="text-white/80 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed px-6">
            See how GlowVita has transformed the way customers discover and enjoy salon services.
            From hassle-free bookings to exceptional salon experiences, these shared stories shine
            a light on the value we bring to our users.
          </p>

          {/*
            White card — absolute, centered, smaller than the purple box.
            translate-y-[55%] makes it hang below the bottom edge.
          */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[38%]
                       w-[90%] max-w-2xl
                       bg-white  shadow-xl border border-gray-100
                       px-5 md:px-7 pt-9 pb-7 text-left z-10"
          >
            {/* Opening quote */}
            <span
              className="absolute top-3 left-4 text-4xl font-bold leading-none select-none"
              style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a' }}
            >
              &#x201C;
            </span>

            {/* Closing quote */}
            <span
              className="absolute bottom-2 right-4 text-4xl font-bold leading-none select-none"
              style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a' }}
            >
              &#x201D;
            </span>

            {/* Avatar + connector + text */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              {/* Circular avatar + tan connector */}
              <div className="flex items-center flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                  <img
                    src={current.image}
                    alt={current.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden md:flex items-center ml-2 w-10 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#C9956C' }} />
                  <div className="flex-1 h-px" style={{ backgroundColor: '#C9956C' }} />
                </div>
              </div>

              {/* Name + review */}
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-sm md:text-base font-bold text-gray-900 mb-1">{current.name}</h4>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{current.text}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials2;