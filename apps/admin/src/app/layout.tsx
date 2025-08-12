
import type { Metadata } from 'next';
import StoreProvider from '@repo/store/provider';
import './globals.css';
import { AdminLayout } from '@/components/AdminLayout';

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Admin Panel for Monorepo Maestro.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <StoreProvider>
          <AdminLayout>{children}</AdminLayout>
        </StoreProvider>
      </body>
    </html>
  );
}
