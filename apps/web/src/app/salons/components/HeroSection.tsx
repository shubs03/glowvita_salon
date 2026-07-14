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
    <section className="relative w-full min-h-[500px] h-auto lg:h-[700px] overflow-hidden">
      {/* Solid dark maroon base */}
      <div className="absolute inset-0" style={{ backgroundColor: "#422A3C" }} />

      {/* Full-width image background */}
      <div className="absolute inset-0">
        <img
          src="/images/Rectangle 5.png"
          alt="Products"
          className="h-full w-full pointer-events-none select-none"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      </div>


      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center max-w-7xl py-10 md:py-0">
        {/* Logo/Brand Name */}
        <div className="mb-4 md:mb-8">
          <h3 className="text-amber-100 text-xs sm:text-sm font-light tracking-[0.2em] sm:tracking-[0.3em] uppercase">
            GLOWVITA
          </h3>
        </div>

        {/* Main Heading */}
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: "clamp(42px, 6vw, 70px)",
            lineHeight: "115%",
            letterSpacing: "-0.01em",
          }}
          className="text-amber-50 mb-4 md:mb-6 max-w-[510px]"
        >
          Choose the Best
          <br />
          for Your Look
        </h1>

        {/* Description */}
        <p className="text-gray-200 text-sm sm:text-base md:text-lg mb-6 md:mb-8 max-w-xl leading-relaxed">
          Choose from top-rated salons where experienced artists, modern
          techniques, and exceptional care come together to transform your look.
        </p>

        {/* Search Bar */}
        <div className="mb-6 md:mb-8 w-full max-w-4xl relative z-40">
          <GlobalSearchBar variant="compact" className="shadow-2xl !max-w-4xl mx-0" />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => scrollToSection('cta-section')}
            className="bg-transparent border border-white/30 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:bg-white/5 shadow-sm"
          >
            <Search className="w-4 h-4" />
            Explore Services
          </button>
          <button
            onClick={() => scrollToSection('download-app')}
            className="bg-white text-gray-800 px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gray-100 shadow-sm"
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