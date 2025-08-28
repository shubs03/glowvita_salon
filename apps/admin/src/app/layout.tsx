
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
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
