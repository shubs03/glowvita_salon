import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative w-full py-10 md:py-14 px-6 lg:px-8 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground mb-8 leading-tight tracking-tight">
          Get in Touch with Us
        </h1>

        {/* Descriptive Paragraph */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-light mb-6">
          If you need help, want to share feedback, or simply have a question, we're here to listen and respond with care so your journey with GlowVita remains smooth and enjoyable.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;