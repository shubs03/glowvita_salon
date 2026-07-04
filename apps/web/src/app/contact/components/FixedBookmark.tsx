"use client";

import React, { useState } from "react";

const FixedBookmark = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-0 z-50">
      <div className="flex flex-col items-end space-y-2">
        {/* Social Media Links */}
        <div
          className="flex flex-col space-y-2 border border-border rounded-tl-2xl rounded-bl-2xl shadow-lg p-2 w-12"
          style={{ backgroundColor: "#E5CEE9" }}
        >
          <a
            href="https://www.instagram.com/glowvitasalon?igsh=ZDRhaW82dXdmaml2"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center transition-all duration-300"
            aria-label="Instagram"
          >
            <img
              src="/images/Frame 2.png"
              alt="Instagram"
              className="w-8 h-8 object-contain"
            />
          </a>
          <a
            href="https://www.linkedin.com/company/glowvitasalon/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center transition-all duration-300"
            aria-label="LinkedIn"
          >
            <img
              src="/images/Frame 3.png"
              alt="LinkedIn"
              className="w-6 h-6 object-contain"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default FixedBookmark;