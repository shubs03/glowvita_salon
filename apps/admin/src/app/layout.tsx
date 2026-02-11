
"use client";

import type { ReactNode } from 'react';
import StoreProvider from '@repo/store/provider';
import './globals.css';
import { AdminLayout } from '@/components/AdminLayout';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthInitializer } from '@/components/AuthInitializer';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const showLayout = pathname !== '/login';

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
        <link rel="icon" href="/favicon.jpeg" />
      </head>
      <body>
        <StoreProvider>
          <AuthInitializer>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {showLayout ? <AdminLayout>{children}</AdminLayout> : children}
              <Toaster position="bottom-right" richColors />
            </ThemeProvider>
          </AuthInitializer>
        </StoreProvider>
      </body>
    </html>
  );
}
