import React from 'react';
import Image from 'next/image';

const FeaturesSection = () => {
  const features = [
    {
      number: '01',
      icon: '/icons/diagram 1.png',
      title: 'Business Growth',
      description: 'Tools and analytics to help expand your customer base and increase revenue streams.',
    },
    {
      number: '02',
      icon: '/icons/service 2.png',
      title: 'Customer Management',
      description: 'Comprehensive CRM tools to track client preferences, booking history, and engagement patterns.',
    },
    {
      number: '03',
      icon: '/icons/encrypted 1 (1).png',
      title: 'Secure Operations',
      description: 'Enterprise-grade security for all your business data, payment processing, and customer information.',
    },
    {
      number: '04',
      icon: '/icons/shedule 1.png',
      title: 'Efficient Scheduling',
      description: 'Advanced booking systems with real-time availability, automated reminders, and conflict resolution.'
    },
  ];

  return (
    <section className="pt-0 md:pt-0 pb-12 md:pb-20 px-6 lg:px-16 max-w-7xl mx-auto bg-white">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1C] relative inline-block pb-3">
          Business Advantages
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#302131] to-transparent"></div>
        </h2>
        <p className="text-[#433D48]/70 mt-4 text-[15px] max-w-2xl font-medium">
          Transform your salon operations with our unique business management features.
        </p>
      </div>

      {/* Features Grid - As seen in UI */}
      <div className="border border-[#00000015] rounded-[24px] overflow-hidden flex flex-col lg:flex-row shadow-sm">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`flex-1 relative p-8 md:p-10 group transition-all duration-300 ${
              index !== features.length - 1 ? 'border-b lg:border-b-0 lg:border-r border-[#00000015]' : ''
            }`}
          >
            {/* Top Accent Line - No transition */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[4px] bg-[#302131] rounded-b-full opacity-80"></div>

            {/* Background Number - Romanesco font, refined color and size */}
            <div className="absolute top-0 left-8 select-none">
              <span className="text-[52px] md:text-[56px] text-[#DEE5FF] leading-none" style={{ fontFamily: 'Romanesco, cursive' }}>
                {feature.number}
              </span>
            </div>

            {/* Icon Box - Reduced size */}
            <div className="mb-6 mt-10">
              <div className="w-12 h-12 bg-[#DEE5FF] rounded-xl shadow-[0_8px_20px_-5px_rgba(0,0,0,0.1)] flex items-center justify-center p-2.5 border border-[#00000005]">
                <Image 
                  src={feature.icon} 
                  alt={feature.title} 
                  width={25} 
                  height={25} 
                  className="object-contain"
                />
              </div>
            </div>

            {/* Content */}
            <h3 className="text-[#1C1C1C] font-bold text-lg mb-4 leading-tight">
              {feature.title}
            </h3>
            <p className="text-[#433D48]/70 text-[14px] leading-relaxed font-medium">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;