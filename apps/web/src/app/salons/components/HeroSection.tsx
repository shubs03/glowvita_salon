'use client';

import React from "react";
import { ArrowRight, Download } from "lucide-react";

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
    <section className="relative w-full h-[615px] overflow-hidden bg-background">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(45, 28, 48, 0.85), rgba(45, 28, 48, 0.3)), url('https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200')`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8 h-full flex flex-col justify-center max-w-7xl">
        {/* Logo/Brand Name */}
        <div className="mb-8">
          <h3 className="text-amber-100 text-sm font-light tracking-[0.3em] uppercase">
            GLOWVITA
          </h3>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-amber-50 mb-6 max-w-2xl leading-tight">
          Choose the Best
          <br />
          for Your Look
        </h1>

        {/* Description */}
        <p className="text-gray-200 text-base md:text-lg mb-10 max-w-xl leading-relaxed">
          Choose from top-rated salons where experienced artists, modern
          techniques, and exceptional care come together to transform your look.
        </p>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => scrollToSection('cta-section')}
            className="bg-primary text-white px-8 py-3 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:bg-primary/90"
          >
            Explore Services
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => scrollToSection('download-app')}
            className="bg-white/10 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-white/20 hover:bg-white/20"
          >
            <Download className="w-4 h-4" />
            Download App
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;