import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const PurposeVisionSection = () => {
  return (
    <section className="pt-4 md:pt-6 pb-12 md:pb-20 px-6 lg:px-16 max-w-7xl mx-auto bg-white">
      {/* Section Header */}
      <div className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1C] relative inline-block pb-3">
          Our Vision & Mission
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#302131] to-transparent"></div>
        </h2>
        <p className="text-[#433D48]/70 mt-4 text-[15px] max-w-2xl font-medium">
          Empowering salon businesses with modern management solutions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        {/* Left Card - Vision */}
        <div className="bg-white border border-[#00000036] rounded-[40px_0px_40px_0px] p-8 md:p-10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center gap-8 group hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-500">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="relative w-32 h-48 md:w-36 md:h-52">
              <Image 
                src="/icons/4908 1.png" 
                alt="Business Vision" 
                fill 
                className="object-contain"
              />
            </div>
          </div>
          <div className="md:w-2/3">
            <h3 className="text-[#302131] font-bold text-lg mb-3 tracking-wide uppercase">
              OUR BUSINESS VISION
            </h3>
            <p className="text-[#1C1C1C]/80 text-[14.5px] leading-[1.8] font-medium">
              We believe every salon business deserves powerful tools to thrive. 
              GlowVita CRM was created to bridge the gap between salon management 
              challenges and efficient business operations, making appointment 
              scheduling, customer management, and revenue growth simple, reliable, 
              and effortlessly achievable.
            </p>
          </div>
        </div>

        {/* Right Card - Mission */}
        <div className="bg-white border border-[#00000036] rounded-[40px_0px_40px_0px] p-8 md:p-10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center gap-8 group hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 relative pb-24 md:pb-16">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="relative w-32 h-32 md:w-36 md:h-36">
              <Image 
                src="/icons/Dart hitting center of target 3D icon 1.png" 
                alt="Business Mission" 
                fill 
                className="object-contain"
              />
            </div>
          </div>
          <div className="md:w-2/3">
            <h3 className="text-[#302131] font-bold text-lg mb-3 tracking-wide uppercase">
              OUR BUSINESS Mission
            </h3>
            <p className="text-[#1C1C1C]/80 text-[14.5px] leading-[1.8] font-medium mb-10">
              We're constantly evolving to bring you better business tools, 
              innovative management features, and deeper insights into your 
              customer base and revenue trends. Our journey is just beginning, 
              and we're excited to grow with you.
            </p>
            
            <div className="absolute bottom-6 right-6 md:right-10 md:bottom-10">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 bg-[#302131] hover:bg-[#302131]/90 text-white px-5 py-2 rounded-lg font-bold text-[12px] tracking-wide transition-all shadow-sm active:scale-95 group"
              >
                Manage Your Business Today
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PurposeVisionSection;
