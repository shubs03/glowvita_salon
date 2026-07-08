import React from 'react';

const HeroSection = () => {
  return (
    <div className="relative w-full min-h-[260px] sm:min-h-[360px] md:min-h-[480px] lg:min-h-[700px] overflow-hidden rounded-[24px] sm:rounded-[32px] flex items-center justify-center">
      {/* Solid dark maroon base */}
      <div className="absolute inset-0" style={{ backgroundColor: "#422A3C" }} />

      {/* Decorative pattern background image */}
      <img
        src="/images/Contact Us Banner.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
      />

      {/* Overlay so text stays readable over the pattern */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(66, 42, 60, 0.55)" }}
      />

      {/* Content — always centered */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center py-12 sm:py-16 lg:py-20">
        <h1
          className="font-semibold text-white mb-4 sm:mb-6 md:mb-10 leading-tight tracking-tight whitespace-nowrap"
          style={{ fontSize: 'clamp(1.1rem, 5vw, 4.5rem)' }}
        >
          Get in Touch with Us
        </h1>

        <p
          className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white leading-relaxed max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto font-light"
          style={{ textWrap: 'balance' }}
        >
          If you need help, want to share feedback, or simply have a question, we&apos;re here to listen and respond with care so your journey with GlowVita remains smooth and enjoyable.
        </p>
      </div>
    </div>
  );
};

export default HeroSection;