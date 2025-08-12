import type { Metadata } from 'next';
import StoreProvider from '@repo/store/provider';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <StoreProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-grow">{children}</main>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
