"use client";
import React from "react";
import Image from "next/image";
import { useCrmAuth } from "@/hooks/useCrmAuth";
import { useRouter } from "next/navigation";

const HeroSection = () => {
  const { isCrmAuthenticated } = useCrmAuth();
  const router = useRouter();

  const handleStartTrial = () => {
    if (isCrmAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/auth/register");
    }
  };
  return (
    <div className="relative w-full overflow-hidden bg-white min-h-[500px] lg:h-[700px] flex flex-col lg:flex-row">

      {/* Left Content Section */}
      <div className="relative lg:w-[42%] w-full flex items-center justify-center z-20">
        {/* Slanted Background Shape */}
        <div
          className="absolute inset-0 bg-[#F3F4F6] z-0"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
            borderRight: '4px solid #00AEEF' // This won't work with clipPath, we'll use a separate div for the line
          }}
        >
          {/* Decorative Corner Circle */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#E5E7EB]/60 rounded-full"></div>
        </div>

        {/* Slanted Blue Line */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            clipPath: 'polygon(100% 0, 100% 0, 85% 100%, 85% 100%)', // This is just for visualization, we need a stroke
          }}
        >
          {/* Stroke implementation using a rotated thin div */}
          <div
            className="absolute top-0 right-0 h-full w-[3px] bg-[#00AEEF] z-10 origin-top"
            style={{
              transform: 'translateX(0) skewX(-8.5deg)',
              right: '7.5%' // Adjusted to match the 85% bottom point approx
            }}
          ></div>
        </div>

        {/* Text Content */}
        <div className="relative z-20 px-8 py-20 lg:py-0 w-full max-w-lg text-center lg:pr-20">
          <h1 className="text-2xl md:text-[2.25rem] font-serif text-gray-900 leading-[1.2] mb-10">
            Automate your salon<br />
            & spa <span className="italic text-[#0C1880] font-bold">Business</span><br />
            with <span className="italic text-[#0C1880] font-bold">GlowVita Salon</span>
          </h1>

          <p className="text-gray-700 text-lg md:text-xl font-normal leading-relaxed mb-12 max-w-sm mx-auto">
            GlowvitaSalon brings you the most easy-to-use solution for your salon & spa business
          </p>

          <button
            onClick={handleStartTrial}
            className="px-10 py-3.5 bg-[#3d2c3e] text-white font-semibold rounded-[1rem] hover:bg-[#2d1c2d] transition-all duration-300 shadow-sm active:scale-95 text-lg"
          >
            Start a free trial
          </button>
        </div>
      </div>

      {/* Right Image Section */}
      <div className="relative lg:w-[58%] w-full min-h-[450px] lg:h-full">
        <Image
          src="/images/Laptop Mockup 1 (1).png"
          alt="GlowVita Salon Dashboard on Laptop"
          fill
          className="object-cover lg:object-left-top"
          priority
        />
      </div>
    </div>
  );
};

export default HeroSection;