'use client';

import React from "react";
import { Download, Search } from "lucide-react";
import { GlobalSearchBar } from "@/components/GlobalSearchBar";

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
    <section className="relative w-full min-h-[420px] sm:min-h-[500px] lg:h-[650px] py-16 md:py-24 flex items-center overflow-hidden">
      {/* Solid dark maroon base */}
      <div className="absolute inset-0" style={{ backgroundColor: "#422A3C" }} />

      {/* Full-width image background */}
      <div className="absolute inset-0">
        <img
          src="/images/Rectangle 5.png"
          alt="Products"
          className="h-full w-full pointer-events-none select-none object-cover object-center md:object-[85%_center] lg:object-center"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl">
        <div className="flex flex-col gap-6 md:gap-8 max-w-[800px]">
          {/* Logo/Brand Name */}
          <div>
            <h3 className="text-amber-100 text-xs sm:text-sm font-light tracking-[0.2em] sm:tracking-[0.3em] uppercase">
              GLOWVITA
            </h3>
          </div>

          {/* Main Heading */}
          <h1
            className="text-amber-50"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "clamp(42px, 6vw, 70px)",
              lineHeight: "115%",
              letterSpacing: "-0.01em",
            }}
          >
            Choose the Best
            <br />
            for Your Look
          </h1>

          {/* Description */}
          <p className="text-gray-200 text-sm sm:text-base md:text-lg lg:text-xl max-w-xl leading-relaxed">
            Choose from top-rated salons where experienced artists, modern
            techniques, and exceptional care come together to transform your look.
          </p>

          {/* Search Bar */}
          <div className="w-full relative z-40 mt-2 sm:mt-4">
            <GlobalSearchBar variant="compact" className="shadow-2xl mx-0" />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2 sm:mt-4">
            <button
              onClick={() => scrollToSection('cta-section')}
              className="bg-transparent border border-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:bg-white/5 shadow-sm w-full sm:w-auto"
            >
              <Search className="w-4 h-4" />
              Explore Services
            </button>
            <button
              onClick={() => scrollToSection('download-app')}
              className="bg-white text-gray-800 px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gray-100 shadow-sm w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              Download App
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;