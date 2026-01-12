'use client';

import React, { useState, useEffect } from 'react';

const DiscountBanner = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 21,
    seconds: 42,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds -= 1;
        } else if (minutes > 0) {
          minutes -= 1;
          seconds = 59;
        } else if (hours > 0) {
          hours -= 1;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-muted py-3 px-6 rounded-2xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left - Discount Text */}
        <div className="flex items-center text-center gap-2">
          <span className="flex text-2xl text-center items-center md:text-3xl font-bold text-green-600">
            20% OFF
          </span>
          <span className="flex text-muted-foreground text-center items-center text-sm gap-1 text-uppercase font-bold">
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