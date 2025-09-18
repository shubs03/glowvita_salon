
"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from '@repo/ui/cn';

interface MarketingHeaderProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  isHomePage?: boolean;
}

export function MarketingHeader({ isMobileMenuOpen, toggleMobileMenu, isHomePage = false }: MarketingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Set scrolled state if user scrolls down more than 10px
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Debug: log the current state
  useEffect(() => {
    console.log('Header state:', { isScrolled, isHomePage, shouldBeTransparent: !isScrolled && isHomePage });
  }, [isScrolled, isHomePage]);

  return (
    <header 
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        // Apply blurred background if scrolled OR if it's not the home page
        isScrolled || !isHomePage
          ? " backdrop-blur-lg border-b border-border/50" 
          : "bg-transparent border-b border-transparent",
        // Ensure true transparency on home page when not scrolled
        !isScrolled && isHomePage && "!bg-transparent backdrop-blur-none"
      )}
      style={
        !isScrolled && isHomePage 
          ? { backgroundColor: 'transparent', backdropFilter: 'none' }
          : undefined
      }
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between relative">
        <Link
          href="/"
          className="font-bold text-lg sm:text-xl font-headline bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          <span className="hidden sm:inline">GlowVita Salon</span>
          <span className="sm:hidden">GlowVita</span>
        </Link>
        
        {/* Desktop & Tablet Nav */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <Button variant="ghost" className="hover:bg-primary/10 text-sm px-3" asChild>
            <Link href="/apps">Features</Link>
          </Button>
          <Button variant="ghost" className="hover:bg-primary/10 text-sm px-3" asChild>
            <Link href="/pricing">Pricing</Link>
          </Button>
          <Button variant="ghost" className="hover:bg-primary/10 text-sm px-3" asChild>
            <Link href="/about">About Us</Link>
          </Button>
          <Button variant="ghost" className="hover:bg-primary/10 text-sm px-3" asChild>
            <Link href="/contact">Contact</Link>
          </Button>
          <Button variant="ghost" className="hover:bg-primary/10 text-sm px-3" asChild>
            <Link href="/support">Support</Link>
          </Button>
          <div className="mx-2">
            <ThemeToggle />
          </div>
          <Button variant="ghost" className="hover:bg-primary/10 text-sm px-3" asChild>
            <Link href="/client-login">Login</Link>
          </Button>
          <Button
            size="sm"
            className="shadow-lg hover:shadow-xl transition-shadow duration-300 group px-4 py-2 text-sm"
            asChild
          >
            <Link href="/client-register">
              Sign Up{" "}
              <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </Button>
        </nav>
        
        {/* Tablet Nav (between lg and md) */}
        <nav className="hidden md:flex lg:hidden items-center gap-1">
          <Button variant="ghost" size="sm" className="hover:bg-primary/10 text-xs px-2" asChild>
            <Link href="/pricing">Pricing</Link>
          </Button>
          <Button variant="ghost" size="sm" className="hover:bg-primary/10 text-xs px-2" asChild>
            <Link href="/about">About</Link>
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="hover:bg-primary/10 text-xs px-2" asChild>
            <Link href="/client-login">Login</Link>
          </Button>
          <Button
            size="sm"
            className="shadow-lg hover:shadow-xl transition-shadow duration-300 text-xs px-3 py-1"
            asChild
          >
            <Link href="/client-register">Sign Up</Link>
          </Button>
        </nav>
        
        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="h-8 w-8 sm:h-10 sm:w-10">
            {isMobileMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
      
      {/* Enhanced Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-border/50 absolute top-14 sm:top-16 left-0 w-full z-30 shadow-lg">
          <nav className="flex flex-col gap-1 p-4 max-h-[80vh] overflow-y-auto">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                <Link href="/apps">
                  <span className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Features
                  </span>
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                <Link href="/pricing">
                  <span className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Pricing
                  </span>
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                <Link href="/about">
                  <span className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    About Us
                  </span>
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                <Link href="/contact">
                  <span className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Contact
                  </span>
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start h-12 text-left" asChild>
                <Link href="/support">
                  <span className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Support
                  </span>
                </Link>
              </Button>
            </div>
            
            <div className="border-t border-border/30 my-4"></div>
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full h-12 justify-center" asChild>
                <Link href="/client-login">Login</Link>
              </Button>
              <Button className="w-full h-12 justify-center bg-gradient-to-r from-primary to-secondary" asChild>
                <Link href="/client-register">
                  <span className="flex items-center gap-2">
                    Sign Up
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
