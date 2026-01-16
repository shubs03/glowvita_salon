import React from "react";

const Intro = () => {
  return (
    <section className="relative w-full py-10 md:py-14 px-6 lg:px-8 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Elegant Brand Mark */}
        <div className="mb-8">
          <p className="text-primary/60 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase">
            Simple, Transparent Pricing
          </p>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground mb-8 leading-tight tracking-tight">
          Choose the Plan That's
          <br />
          <span className="text-primary">Right For Your Business</span>
        </h1>

        {/* Descriptive Paragraph */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-light mb-6">
          Choose the plan that's right for your business. No hidden fees, cancel anytime.
        </p>

        {/* Supporting Text */}
        <p className="text-sm sm:text-base text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto font-light">
          No credit card required, 14-day money back guarantee, and 24/7 support included.
        </p>

        <div className="gap-4 flex flex-wrap justify-center mt-8">
          <a href="/pricing#pricing-plans" className="bg-primary text-white px-6 py-3 rounded-md font-medium transition-all hover:opacity-90">View Plans</a>
          <a href="/contact" className="bg-transparent border border-primary text-primary px-6 py-3 rounded-md font-medium transition-all hover:bg-primary/5">Contact Sales</a>
        </div>
      </div>
    </section>
  );
};

export default Intro;