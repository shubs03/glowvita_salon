"use client";

import * as React from "react";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { cn } from "./cn";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("bg-muted/30 border-t border-border", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <span className="font-bold text-xl text-foreground font-headline">
                  GlowVita
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your trusted partner for premium beauty products and professional salon services. 
                Enhancing your natural glow with quality and care.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="text-muted-foreground hover:text-blue-600 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-blue-600 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-blue-600 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/products" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Products
                  </a>
                </li>
                <li>
                  <a href="/services" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Services
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Customer Service</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/help" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/shipping" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="/returns" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Returns & Exchanges
                  </a>
                </li>
                <li>
                  <a href="/track-order" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Track Your Order
                  </a>
                </li>
                <li>
                  <a href="/faq" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Get in Touch</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p>123 Beauty Street</p>
                    <p>Salon District, City 12345</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a href="tel:+1-800-BEAUTY" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    +1 (800) BEAUTY
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a href="mailto:hello@glowvita.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    hello@glowvita.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 GlowVita Salon. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}