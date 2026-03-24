import React from 'react';

const FinalCTASection = () => {
  return (
    <section 
      id="cta-section" 
      className="py-20 px-6 overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #2D1A2E 0%, #7B4B7B 50%, #B890B8 100%)',
      }}
    >
      {/* Decorative Blur Elements for depth */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[40%] h-[60%] bg-purple-500/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[40%] h-[60%] bg-pink-500/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Headline */}
        <h2 
          className="text-3xl md:text-5xl font-bold text-white mb-6 font-manrope tracking-tight"
          style={{ lineHeight: '1.2' }}
        >
          Ready To Transform Your Business?
        </h2>

        {/* Description */}
        <p 
          className="text-white/80 text-base md:text-[18px] mb-12 max-w-2xl mx-auto font-poppins font-light leading-relaxed"
        >
          Join thousands of salon owners using GlowVita CRM to streamline operations and boost revenue.
        </p>

        {/* Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button 
            className="bg-white text-[#53435c] px-8 py-4 rounded-full font-bold text-[16px] transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Join as a business owner
          </button>

          <button 
            className="border-2 border-white/40 text-white px-8 py-4 rounded-full font-medium text-[16px] transition-all duration-300 hover:bg-white/10 hover:border-white hover:scale-105 active:scale-95 backdrop-blur-sm"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Learn more about benefits
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;