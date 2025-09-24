
"use client";

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import StoreProvider from '@repo/store/provider';
import './globals.css';
import { MarketingLayout } from '@/components/MarketingLayout';
import { Toaster } from 'sonner';
import { AuthInitializer } from '@/components/AuthInitializer'; // Import the initializer
import { MarketingHeader } from '@/components/MarketingHeader';
import { useState } from 'react';
import ProfileLayout from './profile/layout';

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
  
  // Pages that should use the full MarketingLayout (with footer)
  const marketingPages = [
    '/',
    '/apps',
    '/pricing',
    '/support',
    '/about',
    '/contact',
    '/privacy-policy',
    '/return-policy',
    '/terms-and-conditions'
  ];

  const isMarketingPage = marketingPages.includes(pathname);
  const isAuthPage = pathname.startsWith('/client-login') || pathname.startsWith('/client-register');
  const isProfilePage = pathname.startsWith('/profile');

  let layoutContent: ReactNode;

  if (isMarketingPage) {
    // Full marketing layout with header and footer
    layoutContent = <MarketingLayout>{children}</MarketingLayout>;
  } else if (isAuthPage) {
    // Auth pages have no layout
    layoutContent = children;
  } else if (isProfilePage) {
    // Profile pages get the ProfileLayout
    layoutContent = <ProfileLayout>{children}</ProfileLayout>;
  }
  else {
    // For other pages (e.g., booking, product details), show the header but no footer
    layoutContent = (
       <div className="flex flex-col min-h-screen bg-background text-foreground">
        <MarketingHeader 
          isMobileMenuOpen={isMobileMenuOpen} 
          toggleMobileMenu={toggleMobileMenu}
          isHomePage={false}
        />
        <main className="flex-grow">
          {children}
        </main>
      </div>
    );
  }

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
          <AuthInitializer>
            {layoutContent}
            <Toaster />
          </AuthInitializer>
        </StoreProvider>
      </body>
    </html>
  );
}
