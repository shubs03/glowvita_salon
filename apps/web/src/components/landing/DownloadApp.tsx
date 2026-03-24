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
                className="transition-transform duration-300 hover:scale-105"
              >
                <img
                  src="/icons/Group 1000002487.png"
                  alt="Get it on Google Play"
                  className="h-12 w-auto sm:h-14 lg:h-16"
                />
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

          {/* Right Image Container */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end relative h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px] mb-4 sm:mb-0">
            <div className="relative w-full h-full">
              <img
                src="/images/close-up-hand-holding-phone (1) (2) 1.svg"
                alt="Download App"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadApp;