
"use client";

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import StoreProvider from '@repo/store/provider';
import './globals.css';
import { MarketingLayout } from '@/components/MarketingLayout';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/client-login') || pathname.startsWith('/client-register');
  const isDashboardPage = pathname.startsWith('/dashboard');
  const isBookingPage = pathname.startsWith('/book/');

  let layoutContent: ReactNode;

  if (isAuthPage || isDashboardPage || isBookingPage) {
    // Auth, Dashboard, and Booking pages have no shared layout
    layoutContent = children;
  } else {
    // All other pages get the MarketingLayout
    layoutContent = <MarketingLayout>{children}</MarketingLayout>;
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
        <StoreProvider>{layoutContent}</StoreProvider>
        <Toaster />
      </body>
    </html>
  );
}
