import React from 'react';
import { Sparkles, Users, Shield, Zap } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'Business Growth',
      description: 'Tools and analytics to help expand your customer base and increase revenue streams.',
    },
    {
      icon: Users,
      title: 'Customer Management',
      description: 'Comprehensive CRM tools to track client preferences, booking history, and engagement patterns.',
    },
    {
      icon: Shield,
      title: 'Secure Operations',
      description: 'Enterprise-grade security for all your business data, payment processing, and customer information.',
    },
    {
      icon: Zap,
      title: 'Efficient Scheduling',
      description: 'Advanced booking systems with real-time availability, automated reminders, and conflict resolution.'
    },
  ];

  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          Business Advantages
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">
          Transform your salon operations with our unique business management features.
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