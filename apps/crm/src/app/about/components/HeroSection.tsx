import React from 'react';
import { Sparkles, Download, ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="container relative w-full py-36 my-6 bg-gradient-to-br from-primary to-primary/80 rounded-3xl overflow-hidden mx-auto">
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground mb-6">
          We're Building the Future of Beauty & Wellness
        </h1>

        {/* Supporting Paragraph */}
        <p className="text-primary-foreground/90 text-base md:text-lg leading-relaxed max-w-3xl mx-auto mb-8">
          At GlowVita, we connect exceptional salons with customers seeking premium beauty experiences. 
          Our mission is to make quality self-care accessible, convenient, and delightful for everyone.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => scrollToSection('download-app')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center gap-2 shadow-sm"
          >
            <Download className="w-5 h-5" />
            Download App
          </button>
          
          <button 
            onClick={() => scrollToSection('cta-section')}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center gap-2 shadow-sm"
          >
            Learn More
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;