import React from 'react';
import { ArrowRight } from 'lucide-react';

const FutureVisionSection = () => {
  return (
    <section className="relative w-full py-20 md:py-24 px-6 lg:px-8 bg-gradient-to-b from-muted/30 to-background overflow-hidden">
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Section Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground mb-6 leading-tight tracking-tight">
          Looking Forward
        </h2>

        {/* Subtle Accent Line */}
        <div className="w-16 h-0.5 bg-primary rounded-full mx-auto mb-8"></div>

        {/* Vision Paragraph */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-light mb-8">
          We're constantly evolving to bring you better experiences, innovative features, 
          and deeper connections with the beauty and wellness community you trust. Our journey 
          is just beginning, and we're excited to have you with us.
        </p>

        {/* Secondary Paragraph */}
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-light mb-12">
          Join us in shaping the future of beauty and wellness services.
        </p>

        {/* Call-to-Action Button */}
        <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-sm hover:shadow-md group">
          Get Started Today
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </button>

        {/* Optional Secondary Link */}
        <div className="mt-6">
          <a 
            href="#" 
            className="text-sm text-muted-foreground hover:text-foreground font-light transition-colors duration-300"
          >
            Learn more about our services
          </a>
        </div>
      </div>
    </section>
  );
};

export default FutureVisionSection;