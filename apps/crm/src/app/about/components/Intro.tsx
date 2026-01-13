import React from "react";

const IntroductionSection = () => {
  return (
    <section className="relative w-full py-10 md:py-14 px-6 lg:px-8 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Elegant Brand Mark */}
        <div className="mb-8">
          <p className="text-primary/60 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase">
            Welcome to GlowVita CRM
          </p>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground mb-8 leading-tight tracking-tight">
          Grow Your Salon
          <br />
          <span className="text-primary">Business Success</span>
        </h1>

        {/* Descriptive Paragraph */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-light mb-6">
          GlowVita CRM is your comprehensive business management platform for
          running your salon operations. Manage appointments, track customer
          relationships, handle payments, and grow your business—all in one
          powerful solution.
        </p>

        {/* Supporting Text */}
        <p className="text-sm sm:text-base text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto font-light">
          From appointment scheduling to customer analytics, managing your
          salon business has never been more efficient.
        </p>

        <div className="gap-4 flex flex-wrap justify-center mt-8">
          <a href="/dashboard" className="bg-primary text-white px-6 py-3 rounded-md font-medium transition-all hover:opacity-90">Access Dashboard</a>
          <a href="/about#cta-section" className="bg-transparent border border-primary text-primary px-6 py-3 rounded-md font-medium transition-all hover:bg-primary/5">Join as Vendor</a>
        </div>
      </div>
    </section>
  );
};

export default IntroductionSection;
