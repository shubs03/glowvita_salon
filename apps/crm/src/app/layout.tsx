
"use client";

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import StoreProvider from '@repo/store/provider';
import './globals.css';
import { MarketingLayout } from '@/components/MarketingLayout';
import { CrmLayout } from '@/components/CrmLayout';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isPanelPage = [
    '/dashboard',
    '/calendar',
    '/appointments',
    '/clients',
    '/services',
    '/products',
    '/salon-profile',
    '/offers-coupons',
    '/referrals',
    '/marketing',
    '/push-notifications',
    '/reports'
  ].some(path => pathname.startsWith(path));
  
  const showMarketingLayout = ['/', '/apps', '/pricing', '/support'].includes(pathname);

  if (pathname === '/login') {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
        </head>
        <body>
          <StoreProvider>
            <Toaster richColors />
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </StoreProvider>
        </body>
      </html>
    )
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <StoreProvider>
          <Toaster richColors />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {isPanelPage ? (
              <CrmLayout>{children}</CrmLayout>
            ) : (
              <MarketingLayout>{children}</MarketingLayout>
            )}
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
