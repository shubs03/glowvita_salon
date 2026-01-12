import React from 'react';
import { Tablet } from 'lucide-react';

const TabletMockup = () => {
  return (
    <section id="tablet-mockup" className="py-16 px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="lg:pl-8 order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary mb-4 border-b-2 border-gray-900 pb-6">
              Experience GlowVita on Your Tablet
            </h2>
            <p className="mb-4 text-gray-600 max-w-2xl leading-relaxed">
              Enjoy the full GlowVita experience on your tablet with our optimized interface designed for larger screens.
            </p>
          </div>

          {/* Right Tablet Mockup */}
          <div className="flex justify-center lg:pl-28 order-1 lg:order-2">
            <div className="relative">
              {/* Tablet Frame */}
              <div className="relative w-80 h-[500px] bg-foreground rounded-3xl p-2 shadow-2xl">
                {/* Home Button */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-foreground rounded-full z-10"></div>
                
                {/* Screen */}
                <div className="w-full h-full bg-background rounded-3xl overflow-hidden relative">
                  {/* Screen Content - Image */}
                  <img
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800"
                    alt="GlowVita App Tablet Screen"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TabletMockup;