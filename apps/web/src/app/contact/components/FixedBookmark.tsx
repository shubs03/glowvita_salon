"use client";

import React, { useState } from "react";
import { Instagram, Linkedin } from "lucide-react";

const FixedBookmark = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-0 z-50">
      <div className="flex flex-col items-end space-y-2">
        {/* Social Media Links */}
        <div className="flex flex-col space-y-2 bg-secondary border border-border rounded-tl-2xl rounded-bl-2xl shadow-lg p-2 w-12">
          <a
            href="https://www.instagram.com/glowvitasalon?igsh=ZDRhaW82dXdmaml2"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 bg-secondary/10 hover:bg-primary text-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-all duration-300"
            aria-label="Instagram"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a
            href="https://www.linkedin.com/company/glowvitasalon/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 bg-secondary/10 hover:bg-primary text-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-all duration-300"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default FixedBookmark;