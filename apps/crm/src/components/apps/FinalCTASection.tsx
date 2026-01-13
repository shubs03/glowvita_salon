import React from 'react';
import { ArrowRight } from 'lucide-react';

const FinalCTASection = () => {
  return (
    <section id="cta-section" className="py-16 px-6 lg:px-8 bg-muted">
      <div className="max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
          Ready to Transform Your Salon Business?
        </h2>

        {/* Description */}
        <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of salon owners using GlowVita CRM to streamline operations and boost revenue.
        </p>

        {/* Primary CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold text-base transition-all duration-300 flex items-center gap-2 shadow-sm">
            Join as a Business Owner
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Secondary Link */}
          <a 
            href="#" 
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-300"
          >
            Learn more about benefits
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;