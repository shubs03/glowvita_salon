import React from "react";

const IntroductionSection = () => {
  return (
    <section className="relative w-full py-10 md:py-14 px-6 lg:px-8 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <p className="text-primary/60 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase">
            Support Center
          </p>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground mb-8 leading-tight tracking-tight">
          How can we <span className="text-primary">help you?</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-light mb-6">
          Our support center provides comprehensive resources to help you make the most of GlowVita CRM. 
          Find answers to common questions, get troubleshooting help, and connect with our support team.
        </p>
        <p className="text-sm sm:text-base text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto font-light">
          Access guides, tutorials, and support options to ensure your salon business runs smoothly.
        </p>
      </div>
    </section>
  );
};

export default IntroductionSection;