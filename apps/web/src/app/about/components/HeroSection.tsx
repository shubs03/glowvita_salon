import React from 'react';
import Link from 'next/link';
import { NEXT_PUBLIC_CRM_URL } from "@repo/config/config";

const HeroSection = () => {
  return (
    <div className="relative w-full min-h-[420px] sm:min-h-[500px] lg:h-[650px] overflow-hidden">
      {/* Solid dark maroon base */}
      <div className="absolute inset-0" style={{ backgroundColor: "#422A3C" }} />

      {/* Full-width image background */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-salon-bg.png"
          alt="Products"
          className="h-full w-full pointer-events-none select-none"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center py-12 sm:py-14 lg:py-16 max-w-7xl">
        <div className="max-w-xl md:max-w-2xl lg:max-w-4xl">
          <h3 className="text-amber-100 text-xs sm:text-sm font-medium tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-4 sm:mb-6 lg:mb-8">
            WELCOME TO GLOWVITA SALON
          </h3>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "clamp(32px, 6vw, 70px)",
              lineHeight: "115%",
              letterSpacing: "-0.01em",
              color: "#F7E5C1",
            }}
            className="mb-6 sm:mb-8 lg:mb-10"
          >
            Discover Your Perfect<br />Salon Experience
          </h1>

          <p
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 400,
              fontSize: "clamp(14px, 2vw, 18px)",
              lineHeight: "170%",
              letterSpacing: "0%",
              textAlign: "justify",
            }}
            className="text-gray-200 mb-6 sm:mb-8 lg:mb-10 max-w-[679px]"
          >
            GlowVita is your trusted online platform for discovering and booking
            exceptional salon services. Explore verified salons near you or across
            the city, read authentic reviews, compare services and schedule
            appointments effortlessly—all in one elegant experience.
          </p>

          <p
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 500,
              fontSize: "clamp(13px, 1.5vw, 16px)",
              lineHeight: "160%",
              letterSpacing: "0%",
              color: "#AF9A9A",
            }}
            className="mb-8 sm:mb-12 lg:mb-16 max-w-full"
          >
            From haircuts to spa treatments, finding quality and wellness services has never been easier.
          </p>

          <div className="flex flex-col xs:flex-row sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <Link
              href="/salons"
              className="bg-transparent hover:bg-white/10 text-white border border-white/50 px-5 sm:px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2"
            >
              Explore Salons
            </Link>

            <a
              href={`${NEXT_PUBLIC_CRM_URL || "https://partners.glowvitasalon.com"}/login`}
              className="bg-white hover:bg-gray-100 text-gray-900 px-5 sm:px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
            >
              Join GlowVita Today
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;