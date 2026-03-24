import React from 'react';
import Image from 'next/image';

const AudienceSection = () => {
  const audiences = [
    { number: '01', title: 'Salon Owners' },
    { number: '02', title: 'Spa Managers' },
    { number: '03', title: 'Beauty Business Entrepreneurs' },
    { number: '04', title: 'Wellness Center Directors' },
    { number: '05', title: 'Beauty Care Specialists' },
    { number: '06', title: 'Multi-location Business Owners' },
  ];

  return (
    <section className="pt-0 pb-10 md:pt-0 md:pb-16 px-6 lg:px-12 max-w-7xl mx-auto bg-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Section Header */}
      <div className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1C] relative inline-block pb-3">
          For Salon Business Owners
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#302131] to-transparent"></div>
        </h2>
        <p className="text-[#433D48]/70 mt-4 text-[14px] max-w-4xl font-medium">
          GlowVita CRM is designed for salon business owners who value efficiency, comprehensive management tools, and data-driven growth strategies.
        </p>
      </div>

      {/* Audience Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-4 lg:gap-x-8">
        {audiences.map((audience, index) => (
          <div
            key={index}
            className="flex items-center group"
          >
            {/* Image Number Icon */}
            <div className="relative flex-shrink-0 z-10 scale-90 md:scale-100">
              <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                <Image
                  src="/icons/Rectangle 40770.png"
                  alt="Number background"
                  fill
                  className="object-contain"
                />
                <span
                  className="relative z-10 text-white text-[28px] md:text-[32px] italic translate-y-[-2px]"
                  style={{ fontFamily: 'Romanesco, cursive' }}
                >
                  {audience.number}
                </span>
              </div>
            </div>

            {/* Content Box with specific UI from screenshot */}
            <div className="bg-white border border-[#00000036] rounded-tr-[30px] p-4 md:p-5 pl-12 md:pl-16 -ml-8 md:-ml-10 w-full shadow-sm flex items-center min-h-[65px] md:min-h-[85px]">
              <h3 className="text-[#1C1C1C] font-medium text-[14px] md:text-[15px] xl:text-[15.5px] whitespace-nowrap leading-tight pt-1 tracking-tight">
                {audience.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AudienceSection;