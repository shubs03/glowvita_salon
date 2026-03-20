import React from 'react';
import Image from 'next/image';

const PhilosophySection = () => {
  const approaches = [
    {
      icon: '/icons/energy 1.png',
      title: 'Efficiency',
      description: 'We believe salon management should be streamlined and intuitive, eliminating operational bottlenecks and administrative overhead.',
    },
    {
      icon: '/icons/quality 1.png',
      title: 'Reliability',
      description: 'We deliver robust, dependable systems that you can trust to run your business smoothly and securely.',
    },
    {
      icon: '/icons/growth (2) 1.png',
      title: 'Growth',
      description: 'We build solutions that help your business scale and adapt to changing market demands.',
    },
  ];

  return (
    <section className="pt-0 pb-12 md:pb-20 px-6 lg:px-16 max-w-7xl mx-auto bg-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Section Header */}
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1C] relative inline-block pb-3">
          Our Business Approach
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#302131] to-transparent"></div>
        </h2>
        <p className="text-[#433D48]/70 mt-4 text-[14.5px] max-w-3xl font-medium leading-relaxed">
          Our approach is guided by three fundamental principles that shape every business solution we develop for salon owners and managers.
        </p>
      </div>

      {/* Staggered Cards Layout - Still more compact */}
      <div className="flex flex-col gap-4 md:gap-6">
        {approaches.map((approach, index) => (
          <div 
            key={index}
            className={`flex items-stretch max-w-3xl transition-all duration-300 ${
              index === 1 ? 'md:ml-16 lg:ml-24' : 
              index === 2 ? 'md:ml-32 lg:ml-48' : ''
            }`}
          >
            {/* Left Vertical Accent Bar */}
            <div className={`w-1.5 md:w-2 bg-[#302131] rounded-l-[10px] flex-shrink-0`}></div>
            
            {/* Main Card Content */}
            <div className="flex-1 bg-white border border-[#00000015] rounded-r-[16px] p-4 md:p-5 shadow-[0_5px_20px_-10px_rgba(0,0,0,0.05)] group hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.07)] transition-all">
              
              {/* Card Header: Icon + Title */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-9 h-9 md:w-10 md:h-10 bg-[#F0F7FF] rounded-full flex items-center justify-center p-2 border border-[#00000005]">
                  <div className="relative w-full h-full">
                    <Image 
                      src={approach.icon} 
                      alt={approach.title} 
                      fill 
                      className="object-contain"
                    />
                  </div>
                </div>
                <h3 className="text-[#1C1C1C] font-bold text-[15.5px] md:text-[17px]">
                  {approach.title}
                </h3>
              </div>

              {/* Nested Description Box */}
              <div className="bg-[#F0F7FF] border border-[#E9EFFD] rounded-[10px] p-3 md:p-4 md:px-5">
                <p className="text-[#1C1C1C]/85 text-[13px] md:text-[14px] leading-relaxed font-medium">
                  {approach.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PhilosophySection;