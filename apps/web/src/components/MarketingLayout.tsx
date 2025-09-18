
'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { MarketingHeader } from '@/components/MarketingHeader';
import { Footer } from '@/components/Footer';

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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <MarketingHeader 
        isMobileMenuOpen={isMobileMenuOpen} 
        toggleMobileMenu={toggleMobileMenu}
        isHomePage={isHomePage}
      />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
