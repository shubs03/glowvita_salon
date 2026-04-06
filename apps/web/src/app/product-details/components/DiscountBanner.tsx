'use client';

import React, { useState, useEffect } from 'react';

const DiscountBanner = ({ discountPercentage }: { discountPercentage: number }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 45,
    seconds: 0,
  });

  useEffect(() => {
    // Check local storage for existing timer to keep it consistent
    const savedEndTime = localStorage.getItem('discountEndTime');
    let endTime: number;

    if (savedEndTime) {
      endTime = parseInt(savedEndTime);
    } else {
      endTime = Date.now() + (2 * 60 * 60 * 1000) + (45 * 60 * 1000); // 2h 45m from now
      localStorage.setItem('discountEndTime', endTime.toString());
    }

    const timer = setInterval(() => {
      const remaining = endTime - Date.now();
      
      if (remaining <= 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const h = Math.floor((remaining / (1000 * 60 * 60)) % 24);
      const m = Math.floor((remaining / (1000 * 60)) % 60);
      const s = Math.floor((remaining / 1000) % 60);

      setTimeLeft({ hours: h, minutes: m, seconds: s });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (discountPercentage <= 0) return null;

  return (
    <div className="w-full bg-muted py-3 px-6 rounded-2xl mb-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left - Discount Text */}
        <div className="flex items-center text-center gap-2">
          <span className="flex text-2xl text-center items-center md:text-3xl font-bold text-green-600">
            {discountPercentage}% OFF
          </span>
          <span className="flex text-muted-foreground text-center items-center text-sm gap-1 uppercase font-bold">
                Available for Next
          </span>
        </div>

        {/* Right - Countdown Timer */}
        <div className="flex items-center gap-2">
          {/* Hours */}
          <div className="bg-foreground text-background px-3 py-2 rounded-xl min-w-[50px] text-center">
            <span className="text-lg font-bold">
              {String(timeLeft.hours).padStart(2, '0')}h
            </span>
          </div>

          <span className="text-foreground font-bold">:</span>

          {/* Minutes */}
          <div className="bg-foreground text-background px-3 py-2 rounded-xl min-w-[50px] text-center">
            <span className="text-lg font-bold">
              {String(timeLeft.minutes).padStart(2, '0')}m
            </span>
          </div>

          <span className="text-foreground font-bold">:</span>

          {/* Seconds */}
          <div className="bg-foreground text-background px-3 py-2 rounded-xl min-w-[50px] text-center">
            <span className="text-lg font-bold">
              {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountBanner;