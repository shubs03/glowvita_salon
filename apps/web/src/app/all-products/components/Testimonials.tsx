import React, { useState, useEffect, useRef } from 'react';

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  location: string;
  rating: number;
  productName?: string;
  profileImage?: string | null;
}

// Static fallback reviews shown when no approved reviews exist yet
const STATIC_TESTIMONIALS: Testimonial[] = [
  {
    id: 'static-1',
    quote: 'Absolutely love the curated selection! Every product I\'ve tried has exceeded my expectations. Fast shipping and great prices too.',
    name: 'Manish Sonawane',
    location: 'Navi Mumbai, Maharashtra',
    rating: 5,
    productName: 'Rose Hair Conditioner',
    profileImage: null,
  },
  {
    id: 'static-2',
    quote: 'The customer support is fantastic! They helped me with a return quickly and professionally. Highly recommend this marketplace.',
    name: 'Shubham Vanarse',
    location: 'Nashik, Maharashtra',
    rating: 5,
    productName: 'Acne Cleanser',
    profileImage: null,
  },
  {
    id: 'static-3',
    quote: 'I love the eco-friendly packaging and the variety of brands. The site is easy to use and the deals are unbeatable!',
    name: 'Siddhi Shinde',
    location: 'Nashik, Maharashtra',
    rating: 5,
    productName: 'Hydrating Face Cream',
    profileImage: null,
  },
];

const Testimonials = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(STATIC_TESTIMONIALS);
  const [loading, setLoading] = useState(true);

  // Fetch approved reviews from the public API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews/public?limit=30');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.reviews && data.reviews.length > 0) {
            const mapped: Testimonial[] = data.reviews.map((r: {
              id: string;
              quote: string;
              name: string;
              location: string;
              rating: number;
              productName?: string;
              profileImage?: string | null;
            }) => ({
              id: r.id,
              quote: r.quote,
              name: r.name,
              location: r.location,
              rating: r.rating,
              productName: r.productName,
              profileImage: r.profileImage,
            }));
            setTestimonials(mapped);
          }
          // If no approved reviews, keep the static fallback (already set)
        }
      } catch (err) {
        // Network error – keep static fallback silently
        console.error('Failed to fetch testimonials:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const totalWidth = testimonials.length * 384; // 384px per testimonial
  
  useEffect(() => {
    if (isHovered || testimonials.length === 0) return;
    
    const interval = setInterval(() => {
      setPosition(prev => {
        const newPosition = prev - 1;
        if (newPosition <= -totalWidth) {
          return 0;
        }
        return newPosition;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [isHovered, totalWidth, testimonials.length]);

  // Duplicate testimonials for seamless loop
  const allTestimonials = [...testimonials, ...testimonials];

  if (loading) {
    return (
      <section className="pt-0 pb-12 container mx-auto px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mb-12">
          <div style={{ display: 'inline-block', maxWidth: '100%' }}>
            <div className="h-9 w-64 bg-muted animate-pulse rounded-md" />
            <div className="w-full max-w-[390px] h-[3px] mt-[6px] bg-muted animate-pulse" />
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-[384px] px-3">
              <div className="bg-card border border-border rounded-3xl p-6 h-44 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="pt-0 pb-12 container mx-auto px-4 sm:px-6 lg:px-8 bg-background">
      {/* Section Header */}
      <div className="mb-12">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');`}</style>
        <div style={{ display: 'inline-block', maxWidth: '100%' }}>
          <h2
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: '28px',
              lineHeight: '38px',
              color: '#000000',
              maxWidth: '390px',
              height: '38px',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            What Our Customers Say
          </h2>
          <div
            style={{
              width: '100%',
              maxWidth: '390px',
              height: '3px',
              marginTop: '6px',
              background: 'linear-gradient(90deg, #422A3C 0%, #FFFFFF 100%)',
              border: 'none',
            }}
          />
        </div>
      </div>

      {/* Scrolling Testimonials Container */}
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
          {allTestimonials.map((testimonial, i) => (
            <div key={`${testimonial.id}-${i}`} className="flex-shrink-0 w-[384px] px-3">
              <div
                className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50 flex flex-col h-full"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-100 group-hover:scale-110 transition-all duration-300 bg-[#EBF3FD] flex items-center justify-center">
                    <img 
                      src={testimonial.profileImage || "/images/user-profile.png"} 
                      alt={testimonial.name} 
                      className={testimonial.profileImage ? "w-full h-full object-cover" : "w-8 h-8 object-contain"} 
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-card-foreground text-lg items-center leading-tight">
                      {testimonial.name}
                    </h3>
                    {testimonial.productName && (
                      <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                        {testimonial.productName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, starIndex) => (
                    <img
                      key={starIndex}
                      src="/images/star 6.png"
                      alt="star"
                      className={`w-4 h-4 object-contain ${starIndex < testimonial.rating ? '' : 'opacity-20 grayscale'}`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
                  {testimonial.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;