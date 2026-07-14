import React from 'react';

const DownloadApp = () => {
  return (
    <section id="download-app" className=" mt-0 pt-0 pb-0 bg-[#FAFAFA] overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="order-2 lg:order-1 lg:col-span-3 text-center lg:text-left w-full">
            <h2
              className="relative inline-block text-2xl md:text-3xl font-serif font-bold pb-3 mb-4 sm:mb-5 lg:mb-6"
              style={{ color: "#252B42" }}
            >
              Access GlowVita Anywhere
              <span
                className="absolute left-0 bottom-0 h-[3px] w-full rounded-full"
                style={{
                  background:
                    "linear-gradient(to right, #252B42 0%, #252B42 40%, transparent 100%)",
                }}
              />
            </h2>
            <p className="mb-4 sm:mb-5 lg:mb-6 text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              Discover and book top-rated salons, spas, and wellness experiences instantly across all your devices.
            </p>

            {/* Key Features */}
            <div className="mb-5 sm:mb-6 lg:mb-8 grid grid-cols-2 gap-y-2.5 gap-x-6 sm:gap-y-3 sm:gap-x-8 lg:gap-y-4 lg:gap-x-10 w-fit mx-auto lg:mx-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <img
                    src="/images/appointment (9) 1 (1).png"
                    alt="Instant booking"
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain"
                  />
                </div>
                <span className="text-xs sm:text-sm text-secondary-foreground">Instant booking</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <img
                    src="/images/protection 1 (1).png"
                    alt="Verified professionals"
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain"
                  />
                </div>
                <span className="text-xs sm:text-sm text-secondary-foreground">Verified professionals</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <img
                    src="/images/lock 1 (1).png"
                    alt="Secure payments"
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain"
                  />
                </div>
                <span className="text-xs sm:text-sm text-secondary-foreground">Secure payments</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <img
                    src="/images/bell (1) 1 (1).png"
                    alt="Real-time updates"
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain"
                  />
                </div>
                <span className="text-xs sm:text-sm text-secondary-foreground">Real-time updates</span>
              </div>
            </div>

            {/* App Store Buttons */}
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
              {/* Google Play Button */}
              <a
                href="https://play.google.com/store/apps/details?id=com.paarsh.glow_vita_salon"
                className="transition-transform duration-300 hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/icons/Group 1000002487.png"
                  alt="Get it on Google Play"
                  className="h-9 w-auto sm:h-10 lg:h-11"
                />
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="mt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-600">
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
          <div className="order-1 lg:order-2 lg:col-span-2 flex justify-center lg:justify-end relative w-full">
            <img
              src="/images/close-up-hand-holding-phone (1) (2) 1.png"
              alt="Download App"
              className="w-full h-auto object-contain block"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadApp;
