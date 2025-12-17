
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
    '/customers/summary',
    '/services',
    '/products',
    '/product-questions',
    '/reviews',
    '/marketplace',
    '/sales',
    '/invoice-management',
    '/orders',
    '/shipping',
    '/settlements',
    '/expenses',
    '/salon-profile',
    '/offers-coupons',
    '/referrals',
    '/marketing',
    '/push-notifications',
    '/reports',
    '/staff',
    '/earnings',
    '/doctor-reports',
    '/doctor-referrals',
    '/doctor-reviews',
    '/doctor-staff',
    '/timetable',
    '/consultations',
    '/patients',
    '/calendar',
    '/appointments/[id]',
    '/appointments',
    '/wedding-packages'
  ].some(path => pathname.startsWith(path));
  
  const showMarketingLayout = ['/', '/apps', '/pricing', '/support'].includes(pathname);
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/auth/register') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password');
  const isNotFoundPage = pathname === '/not-found';

  let layoutContent: ReactNode;

  if (isAuthPage || isNotFoundPage) {
    // Auth and Not Found pages have no layout
    layoutContent = children;
  } else if (isPanelPage) {
    // CRM panel pages get the CrmLayout
    layoutContent = <CrmLayout>{children}</CrmLayout>;
  } else {
    // All other pages get the MarketingLayout
    layoutContent = <MarketingLayout>{children}</MarketingLayout>;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href='https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.css' rel='stylesheet' />
      </head>
      <body className="bg-background text-foreground">
        <StoreProvider>
          <Toaster richColors />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {layoutContent}
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
