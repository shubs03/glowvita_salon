
"use client";

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import StoreProvider from '@repo/store/provider';
import './globals.css';
import { Toaster } from 'sonner';
import { MarketingHeader } from '@/components/MarketingHeader';
import { Footer } from '@/components/Footer';
import { useState, useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const marketingPages = [
    '/',
    '/apps',
    '/all-products',
    '/pricing',
    '/support',
    '/about',
    '/contact',
    '/privacy-policy',
    '/return-policy',
    '/terms-and-conditions',
    '/product-details/[id]',
    '/search',
  ];

  const isMarketingPage = marketingPages.some(page => {
    // For dynamic routes, check if the pathname starts with the base path
    if (page.includes('[id]')) {
      const basePath = page.replace('/[id]', '');
      return pathname.startsWith(basePath);
    }
    // For static routes, check exact match
    return page === pathname;
  });
  
  const isAuthPage = pathname.startsWith('/client-login') || 
                     pathname.startsWith('/client-register') || 
                     pathname.startsWith('/forgot-password') ||
                     pathname.startsWith('/reset-password');
  const isProfilePage = pathname.startsWith('/profile');

  // Show header on marketing and profile pages, but not on auth pages
  const showHeader = isMarketingPage || isProfilePage;
  // Show footer only on marketing pages, but hide on Search to allow split-view to fill screen
  const showFooter = isMarketingPage && pathname !== '/search';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Roboto:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'Playfair Display';
              font-display: swap;
            }
            @font-face {
              font-family: 'Roboto';
              font-display: swap;
            }
          `
        }} />
      </head>
      <body>
        <StoreProvider>
          <div className="flex flex-col min-h-screen bg-background text-foreground">
            {showHeader && (
              <MarketingHeader 
                isMobileMenuOpen={isMobileMenuOpen} 
                toggleMobileMenu={toggleMobileMenu}
                isHomePage={pathname === '/'}
              />
            )}
            <main className="flex-grow">
              {children}
            </main>
            {showFooter && <Footer />}
          </div>
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
