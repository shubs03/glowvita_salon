import React from 'react';
import { Heart, Zap, Shield } from 'lucide-react';

const PhilosophySection = () => {
  const values = [
    {
      icon: Heart,
      title: 'Simplicity',
      description: 'We believe beauty services should be easy to find, book, and enjoy without unnecessary complexity.',
    },
    {
      icon: Zap,
      title: 'Performance',
      description: 'We deliver fast, reliable experiences that respect your time and exceed your expectations.',
    },
    {
      icon: Shield,
      title: 'Trust',
      description: 'We build confidence through transparency, verified reviews, and secure transactions every time.',
    },
  ];

  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          Our Philosophy
        </h2>
        <p className="text-muted-foreground mt-3 text-sm max-w-2xl">
          Our approach is guided by three fundamental principles that shape every decision 
          we make and every experience we create for our community.
        </p>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {values.map((value, index) => {
          const Icon = value.icon;
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
                  {value.title}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed pl-16 mt-3">
                {value.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PhilosophySection;