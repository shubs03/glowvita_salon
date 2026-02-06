import React from 'react';
import { Apple, Smartphone, Zap, ShieldCheck, Lock, Bell } from 'lucide-react';

const DownloadApp = () => {
  return (
    <section id="download-app" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="order-2 lg:order-1 lg:pl-8 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary mb-3 sm:mb-4 lg:mb-6 border-b-2 border-gray-900 pb-3 sm:pb-4 lg:pb-6">
              Access GlowVita Anywhere
            </h2>
            <p className="mb-4 sm:mb-5 lg:mb-6 text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              Discover and book top-rated salons, spas, and wellness experiences instantly across all your devices.
            </p>

            {/* Key Features */}
            <div className="mb-5 sm:mb-6 lg:mb-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 lg:gap-4 max-w-md mx-auto lg:max-w-none lg:mx-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                </div>
                <span className="text-xs sm:text-sm text-secondary-foreground">Instant booking</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                </div>
                <span className="text-xs sm:text-sm text-secondary-foreground">Verified professionals</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                </div>
                <span className="text-xs sm:text-sm text-secondary-foreground">Secure payments</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                </div>
                <span className="text-xs sm:text-sm text-secondary-foreground">Real-time updates</span>
              </div>
            </div>

            {/* App Store Buttons */}
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
              {/* Google Play Button */}
              <a
                href="#"
                className="bg-foreground hover:bg-foreground/90 text-background px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 flex items-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl group"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <p className="text-[10px] sm:text-xs opacity-90">Get it on</p>
                  <p className="text-base sm:text-lg font-semibold">Google Play</p>
                </div>
              </a>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-5 sm:mt-6 lg:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-primary">4.9/5</span>
                <span>Rating</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-primary">100K+</span>
                <span>Downloads</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-primary">24/7</span>
                <span>Support</span>
              </div>
            </div>
          </div>

          {/* Right Multiple Device Mockups */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end relative h-[350px] sm:h-[450px] md:h-[500px] lg:h-[550px] mb-4 sm:mb-0">
            <div className="relative w-full max-w-[500px] sm:max-w-[550px] lg:max-w-[600px]">
              
              {/* Desktop/Laptop Mockup - Back Layer */}
              <div className="hidden lg:block absolute top-0 left-0 z-10 transform -rotate-3 origin-bottom-left">
                <div className="relative w-[380px] xl:w-[420px]">
                  {/* Laptop Screen Container */}
                  <div className="relative bg-foreground rounded-t-xl p-1.5 shadow-2xl">
                    {/* Screen Bezel */}
                    <div className="bg-gray-900 rounded-t-lg p-0.5">
                      {/* Webcam */}
                      <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-gray-700 rounded-full ring-1 ring-gray-600"></div>
                      
                      {/* Screen Display */}
                      <div className="w-full h-[240px] xl:h-[260px] bg-white rounded-sm overflow-hidden shadow-inner">
                        <img
                          src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800"
                          alt="GlowVita Desktop"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Laptop Base/Keyboard */}
                  <div className="relative">
                    {/* Hinge */}
                    <div className="w-full h-1 bg-gradient-to-b from-gray-700 to-gray-800"></div>
                    
                    {/* Keyboard Base */}
                    <div className="w-[105%] -ml-[2.5%] h-3 bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-2xl shadow-lg relative">
                      {/* Trackpad indication */}
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-700/50 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tablet Mockup - Middle Layer */}
              <div className="hidden md:block absolute top-8 md:top-12 lg:top-16 left-1/2 md:left-[38%] lg:left-[45%] -translate-x-1/2 z-20 transform rotate-2">
                <div className="relative w-[200px] md:w-[240px] lg:w-[280px] h-[280px] md:h-[340px] lg:h-[380px] bg-foreground rounded-[1.75rem] md:rounded-[2rem] p-2 shadow-2xl">
                  {/* Tablet Screen */}
                  <div className="w-full h-full bg-background rounded-[1.5rem] overflow-hidden relative">
                    {/* Camera */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground/30 rounded-full z-10"></div>
                    
                    {/* Screen Content */}
                    <img
                      src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600"
                      alt="GlowVita Tablet"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Phone Mockup - Front Layer */}
              <div className="absolute top-12 sm:top-16 md:top-20 lg:top-32 right-2 sm:right-4 md:right-8 lg:right-8 z-30 transform -rotate-1">
                <div className="relative w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] h-[300px] sm:h-[340px] md:h-[380px] lg:h-[420px] bg-foreground rounded-[1.75rem] sm:rounded-[2rem] lg:rounded-[2.5rem] p-1.5 sm:p-2 shadow-2xl">
                  {/* Phone Screen */}
                  <div className="w-full h-full bg-background rounded-[1.5rem] sm:rounded-[1.75rem] lg:rounded-[2rem] overflow-hidden relative">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 sm:w-16 lg:w-20 h-3 sm:h-3.5 lg:h-4 bg-foreground rounded-b-xl sm:rounded-b-2xl z-10"></div>
                    
                    {/* Screen Content */}
                    <img
                      src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600"
                      alt="GlowVita Mobile"
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

export default DownloadApp;