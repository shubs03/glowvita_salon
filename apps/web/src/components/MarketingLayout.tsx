
'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { MarketingHeader } from './MarketingHeader';

export function MarketingLayout({ children }: { children: ReactNode; }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
     
  return (
    <>
      {/* The header is now rendered in the root layout, so it's removed from here */}
      {children}
      <Footer />
    </>
  );
}
