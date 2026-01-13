'use client'

import React, { useState } from 'react';
import { Heart, Zap, Shield, ChevronDown } from 'lucide-react';

const PhilosophySection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const values = [
    {
      icon: Heart,
      title: 'Efficiency',
      description: 'We believe salon management should be streamlined and intuitive, eliminating operational bottlenecks and administrative overhead.',
    },
    {
      icon: Zap,
      title: 'Reliability',
      description: 'We deliver robust, dependable systems that you can trust to run your business smoothly and securely.',
    },
    {
      icon: Shield,
      title: 'Growth',
      description: 'We build solutions that help your business scale and adapt to changing market demands.',
    },
  ];

  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4 mx-auto">
          Our Business Approach
        </h2>
        <p className="text-muted-foreground mt-4 text-base max-w-2xl">
          Our approach is guided by three fundamental principles that shape every business 
          solution we develop for salon owners and managers.
        </p>
      </div>

      {/* Interactive Accordion Layout */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {values.map((value, index) => {
          const Icon = value.icon;
          const isActive = activeIndex === index;
          
          return (
            <div 
              key={index} 
              className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300"
            >
              <button
                className={`w-full p-4 text-left flex items-center justify-between ${
                  isActive ? 'bg-primary/5' : 'hover:bg-accent/30'
                }`}
                onClick={() => setActiveIndex(isActive ? -1 : index)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-primary/10 text-primary'
                  } transition-all duration-300`}>
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <h3 className={`font-bold text-lg ${
                    isActive ? 'text-primary' : 'text-card-foreground'
                  }`}>
                    {value.title}
                  </h3>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? 'rotate-180 text-primary' : 'text-muted-foreground'
                  }`} 
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  isActive ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-4 border-t border-border">
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PhilosophySection;