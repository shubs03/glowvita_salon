import React from "react";

const IntroductionSection = () => {
  return (
    <section className="relative w-full py-10 md:py-14 px-6 lg:px-8 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Elegant Brand Mark */}
        <div className="mb-8">
          <p className="text-primary/60 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase">
            Welcome to GlowVita Salon
          </p>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground mb-8 leading-tight tracking-tight">
          Discover Your Perfect
          <br />
          <span className="text-primary">Salon Experience</span>
        </h1>

        {/* Descriptive Paragraph */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-light mb-6">
          GlowVita is your trusted online platform for discovering and booking
          exceptional salon services. Explore verified salons near you or across
          the city, read authentic reviews, compare services, and schedule
          appointments effortlessly—all in one elegant experience.
        </p>

        {/* Supporting Text */}
        <p className="text-sm sm:text-base text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto font-light">
          From haircuts to spa treatments, finding quality beauty and wellness
          services has never been easier.
        </p>

        <div className="gap-4 flex flex-wrap justify-center mt-8">
          <a href="/salons" className="bg-primary text-white px-6 py-3 rounded-md font-medium transition-all hover:opacity-90">Explore Salons</a>
          <a href="/about#cta-section" className="bg-transparent border border-primary text-primary px-6 py-3 rounded-md font-medium transition-all hover:bg-primary/5">Join GlowVita Today</a>
        </div>
      </div>
    </section>
  );
};

export default IntroductionSection;
