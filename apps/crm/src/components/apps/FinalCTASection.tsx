import React from 'react';

const FinalCTASection = () => {
  return (
    <section 
      id="cta-section" 
      className="py-10 md:py-14 px-6 lg:px-8 w-full rounded-2xl md:rounded-3xl overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #422A3C 0%, #A86B99 100%)' 
      }}
    >
      <div className="max-w-4xl mx-auto text-center text-white">
        {/* Headline */}
        <h2 className="text-xl md:text-3xl font-bold mb-3 tracking-tight">
          Ready To Transform Your Business?
        </h2>

        {/* Description */}
        <p className="text-white/90 text-sm md:text-base mb-6 max-w-2xl mx-auto leading-relaxed">
          Join thousands of salon owners using GlowVita CRM to streamline operations 
          <br className="hidden md:block" /> and boost revenue.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="bg-white text-[#422A3C] hover:bg-white/90 px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 shadow-md transform hover:scale-105">
            Join as a business owner
          </button>

          <button className="bg-transparent border-2 border-white/40 hover:border-white/70 text-white hover:bg-white/10 px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 transform hover:scale-105">
            Learn more about benefits
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;