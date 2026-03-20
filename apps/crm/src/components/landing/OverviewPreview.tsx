import React from 'react';
import Image from 'next/image';

const OverviewPreview = () => {
  return (
    <section id="overview-preview" className="pt-0 pb-12 overflow-hidden bg-white">
      <div className="px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">

          {/* Left Side: Content */}
          <div className="space-y-6 order-2 lg:order-1 text-center lg:text-left flex flex-col justify-start py-6 lg:py-0 lg:pr-16">
            <h2 className="text-2xl md:text-[2.25rem] font-serif text-gray-900 leading-[1.2]">
              Automate your Salon & Spa <span className="italic text-[#0C1880] font-bold">business</span> with <span className="italic text-[#0C1880] font-bold">GlowVita Salon</span>
            </h2>

            <p className="text-gray-700 text-lg md:text-xl font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              GlowVita Salon brings you the most elegant and easy-to-use solution for your salon & spa business.
              Automate bookings, manage staff, track operations, and delight your clients effortlessly with a complete digital management system.
            </p>

            <div className="pt-4 flex justify-center lg:justify-start">
              <button className="px-10 py-3.5 bg-[#3d2c3e] text-white font-semibold rounded-[1rem] hover:bg-[#2d1c2d] transition-all duration-300 shadow-sm active:scale-95 text-lg">
                Start a free trial
              </button>
            </div>
          </div>

          {/* Right Side: Image */}
          <div className="relative order-1 lg:order-2 flex items-stretch min-h-[350px] lg:min-h-[450px]">
            <div className="relative w-full h-full group">
              <div className="relative w-full h-full overflow-hidden rounded-tr-[40px] md:rounded-tr-[80px] rounded-bl-[40px] md:rounded-bl-[80px] rounded-tl-none rounded-br-none transform hover:scale-[1.01] transition-transform duration-500">
                <Image
                  src="/images/Rectangle 40749.png"
                  alt="GlowVita Salon Dashboard Overview"
                  fill
                  className="object-cover"
                  priority
                />

                {/* Overlay for premium feel */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default OverviewPreview;