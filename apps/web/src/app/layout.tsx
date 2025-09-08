
"use client";

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import StoreProvider from '@repo/store/provider';
import './globals.css';
import { MarketingLayout } from '@/components/MarketingLayout';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  
  // For this phase, we assume all pages in 'web' use the MarketingLayout.
  // We can add logic for different layouts (e.g., a dashboard layout) later.
  const useMarketingLayout = !pathname.startsWith('/dashboard'); // Example logic for later

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <StoreProvider>
            {useMarketingLayout ? (
                <MarketingLayout>{children}</MarketingLayout>
            ) : (
                children
            )}
        </StoreProvider>
      </body>
    </html>
  );
}
