import React from 'react';
import { Sparkles, Users, Shield, Zap } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'Premium Quality',
      description: 'Access verified salons and skilled professionals committed to delivering exceptional beauty and wellness experiences.',
    },
    {
      icon: Users,
      title: 'Trusted Community',
      description: 'Join thousands of satisfied customers who rely on authentic reviews and transparent ratings for their choices.',
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Book with confidence knowing your data is protected and every transaction is secure and encrypted.',
    },
    {
      icon: Zap,
      title: 'Instant Booking',
      description: 'Schedule appointments effortlessly with real-time availability and instant confirmation at your fingertips.',
    },
  ];

  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          Why Choose GlowVita
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">
          Experience the difference with our unique features designed to enhance your beauty and wellness journey.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50"
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:bg-primary/20 transition-all duration-300">
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-card-foreground text-lg items-center leading-tight">
                  {feature.title}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed pl-16">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesSection;