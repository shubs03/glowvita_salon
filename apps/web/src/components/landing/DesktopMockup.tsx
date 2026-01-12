import React from 'react';
import { Monitor } from 'lucide-react';

const DesktopMockup = () => {
  return (
    <section id="desktop-mockup" className="py-16 px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="lg:pl-8 order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary mb-4 border-b-2 border-gray-900 pb-6">
              Experience GlowVita on Your Desktop
            </h2>
            <p className="mb-4 text-gray-600 max-w-2xl leading-relaxed">
              Access the complete GlowVita experience on your desktop with our web application optimized for larger screens.
            </p>
          </div>

          {/* Right Desktop Mockup */}
          <div className="flex justify-center lg:pl-28 order-1 lg:order-2">
            <div className="relative">
              {/* Desktop Frame */}
              <div className="relative w-[600px] h-[400px] bg-black rounded-lg shadow-2xl">
                {/* Screen */}
                <div className="w-full h-full bg-white rounded-md overflow-hidden relative">
                  {/* Top Bar */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-black rounded-t-md flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  
                  {/* Screen Content - Image */}
                  <div className="pt-8 w-full h-full">
                    <img
                      src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1000"
                      alt="GlowVita App Desktop Screen"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesktopMockup;