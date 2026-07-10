'use client';

import React from 'react';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const DiscountBanner = ({ discountPercentage, timeLeft }: { discountPercentage: number; timeLeft: TimeLeft }) => {
  if (discountPercentage <= 0) return null;

  return (
    <div className="w-full bg-[#eff4fa] py-2.5 px-4 mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left - Discount Text */}
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-bold text-green-700">
            {discountPercentage}% off
          </span>
          <span className="text-gray-700 text-[13px] md:text-sm font-medium">
            on this order
          </span>
        </div>

        {/* Right - Countdown Timer */}
        <div className="flex items-center">
          {/* Hours */}
          <div className="bg-[#3a2839] text-white px-2 py-1 text-xs font-semibold rounded-[3px]">
            {String(timeLeft.hours).padStart(2, '0')}h
          </div>

          <span className="text-gray-500 font-bold mx-1.5">:</span>

          {/* Minutes */}
          <div className="bg-[#3a2839] text-white px-2 py-1 text-xs font-semibold rounded-[3px]">
            {String(timeLeft.minutes).padStart(2, '0')}m
          </div>

          <span className="text-gray-500 font-bold mx-1.5">:</span>

          {/* Seconds */}
          <div className="bg-[#3a2839] text-white px-2 py-1 text-xs font-semibold rounded-[3px]">
            {String(timeLeft.seconds).padStart(2, '0')}s
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountBanner;