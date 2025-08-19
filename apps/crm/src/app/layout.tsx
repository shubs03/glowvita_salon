
"use client";

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import StoreProvider from '@repo/store/provider';
import './globals.css';
import { CrmLayout } from '@/components/CrmLayout';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const showLayout = pathname !== '/login' && pathname !== '/';

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
            {showLayout ? <CrmLayout>{children}</CrmLayout> : children}
          </ThemeProvider>
          
        </StoreProvider>
      </body>
    </html>
  );
}
