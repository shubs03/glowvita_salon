
"use client";

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import StoreProvider from '@repo/store/provider';
import './globals.css';
import { MarketingLayout } from '@/components/MarketingLayout';
import { Toaster } from 'sonner';
import { AuthInitializer } from '@/components/AuthInitializer'; // Import the initializer

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  // Pages that should use the MarketingLayout
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

  // Pages that have their own specific layout or no layout at all
  const hasCustomLayout = [
    '/client-login',
    '/client-register',
    '/profile',
    '/book'
  ].some(path => pathname.startsWith(path));

  const showMarketingLayout = marketingPages.includes(pathname) && !hasCustomLayout;

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
            {showMarketingLayout ? (
              <MarketingLayout>{children}</MarketingLayout>
            ) : (
              children
            )}
            <Toaster />
          </AuthInitializer>
        </StoreProvider>
      </body>
    </html>
  );
}
