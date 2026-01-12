import React from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  location: string;
  rating: number;
}

const Testimonials = () => {
  const testimonials: Testimonial[] = [
    {
      id: '1',
      quote: 'Absolutely love the curated selection! Every product I\'ve tried has exceeded my expectations. Fast shipping and great prices too.',
      name: 'Manish Sonawane',
      location: 'Navi Mumbai, Maharashtra',
      rating: 5,
    },
    {
      id: '2',
      quote: 'The customer support is fantastic! They helped me with a return quickly and professionally. Highly recommend this marketplace.',
      name: 'Shubham Vanarse',
      location: 'Nashik, Maharashtra',
      rating: 5,
    },
    {
      id: '3',
      quote: 'I love the eco-friendly packaging and the variety of brands. The site is easy to use and the deals are unbeatable!',
      name: 'Siddhi Shinde',
      location: 'Nashik, Maharashtra',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
            What Our Customers Say
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Hear from real customers who love shopping with us. Their experiences speak for our quality, service, and commitment to your beauty journey.
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50 flex flex-col h-full"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <Star className="w-6 h-6" strokeWidth={2.5} fill="currentColor" />
              </div>
              <h3 className="font-bold text-card-foreground text-lg items-center leading-tight">
                {testimonial.name}
              </h3>
            </div>
            <div className="flex mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < testimonial.rating ? 'text-primary fill-primary' : 'text-muted-foreground fill-muted-foreground'}`}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
              "{testimonial.quote}"
            </p>
            <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
              {testimonial.location}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;