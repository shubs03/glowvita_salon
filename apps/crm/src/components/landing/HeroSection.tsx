import React from "react";
import {
  Scissors,
  Sparkles,
} from "lucide-react";
import glowvita_crm from "../../../public/images/glowvita-crm.png";

const HeroSection = () => {
  return (
    <div className="relative w-full min-h-screen lg:h-[615px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(45, 28, 48, 0.85), rgba(45, 28, 48, 0.4)), url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200')`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8 h-full flex flex-col lg:flex-row justify-center items-center max-w-7xl gap-12">
        {/* Left Content */}
        <div className="lg:w-1/2 flex flex-col justify-center">
          {/* Logo */}
          <div className="mb-8">
            <h3 className="text-amber-100 text-sm font-light tracking-[0.3em] uppercase">
              GLOWVITA
            </h3>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-amber-50 mb-6 max-w-2xl leading-tight">
            Transform your salon business
          </h1>

          {/* Subheading */}
          <p className="text-gray-200 text-base md:text-lg mb-10 max-w-xl leading-relaxed">
            Join thousands of salons who trust our platform to manage appointments, 
            customer relationships, and grow their business effortlessly.
          </p>
          
          {/* Call to Action */}
          <div className="mb-8">
            <button className="bg-primary text-white px-8 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:bg-primary/90">
              Get Started
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CRM Panel Image - Right Side */}
        <div className="lg:w-1/2 flex justify-center items-center">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 max-w-full">
            <img 
              src={glowvita_crm.src} alt="GlowVita CRM Dashboard" className="w-full h-auto max-h-[500px] object-contain"
              style={{ minHeight: "320px" }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;