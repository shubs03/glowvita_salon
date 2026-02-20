
"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import StoreProvider from '@repo/store/provider';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { useGetProfileQuery } from '@repo/store/services/api';
import './globals.css';
import { MarketingLayout } from '@/components/MarketingLayout';
import { CrmLayout } from '@/components/CrmLayout';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';

// Define types for the user and subscription data
interface Subscription {
  status?: string;
  endDate?: string;
  [key: string]: any;
}

interface User {
  subscription?: Subscription;
  [key: string]: any;
}

interface ProfileData {
  user?: User;
  [key: string]: any;
}

function SubscriptionCheck({ children }: { children: React.ReactNode }) {
  const { isCrmAuthenticated, isLoading: isAuthLoading } = useCrmAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  const {
    refetch
  } = useGetProfileQuery(undefined, {
    skip: !isCrmAuthenticated,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 30000,
  }) as {
    refetch: () => Promise<any>;
  };

  // Handle initial load and authentication state
  useEffect(() => {
    if (!isAuthLoading) {
      if (!isCrmAuthenticated) {
        // If not authenticated, no need to check subscription
        setIsLoading(false);
        setInitialCheckComplete(true);
        return;
      }

      // If authenticated, fetch profile
      const checkSubscription = async () => {
        try {
          await refetch();
        } finally {
          setInitialCheckComplete(true);
          setIsLoading(false);
        }
      };

      checkSubscription();
    }
  }, [isAuthLoading, isCrmAuthenticated, refetch]);

  // Light polling safety net in case the server updates mid-session
  useEffect(() => {
    if (!isCrmAuthenticated) return;
    const id = setInterval(() => {
      refetch();
    }, 60000); // Increased interval as CrmLayout also handles refresh
    return () => clearInterval(id);
  }, [isCrmAuthenticated, refetch]);

  // Show loading state only for the initial check
  if (isLoading && !initialCheckComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading your account...</p>
      </div>
    );
  }

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPanelPage = [
    '/dashboard',
    '/calendar',
    '/appointments',
    '/inventory',
    '/clients',
    '/customers/summary',
    '/services',
    '/products',
    '/supplier-products',
    '/product-questions',
    '/reviews',
    '/marketplace',
    '/sales',
    '/invoice-management',
    '/orders',
    '/shipping',
    '/settlements',
    '/expenses',
    '/profile',
    '/offers-coupons',
    '/referrals',
    '/marketing',
    '/push-notifications',
    '/reports',
    '/reports/vendor',
    '/reports/supplier',
    '/staff',
    '/earnings',
    '/doctor-reports',
    '/doctor-referrals',
    '/doctor-reviews',
    '/doctor-staff',
    '/timetable',
    '/consultations',
    '/patients',
    '/crm',
    '/wedding-packages',
    '/add-ons',
    '/doctor-calendar',
    '/supplier-referrals',
    '/renew-plan',
    '/about'
  ].some(path => pathname.startsWith(path));

  const isAuthPage = pathname.startsWith('/login') ||
    pathname.startsWith('/auth/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');
  const isNotFoundPage = pathname === '/not-found';

  let layoutContent: React.ReactNode;

  if (isAuthPage || isNotFoundPage) {
    // Auth and Not Found pages have no layout
    layoutContent = children;
  } else if (isPanelPage) {
    // CRM panel pages get the CrmLayout with SubscriptionCheck
    layoutContent = (
      <SubscriptionCheck>
        <CrmLayout>{children}</CrmLayout>
      </SubscriptionCheck>
    );
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
        <link rel="icon" href="/favicon.jpeg" />
      </head>
      <body className="bg-background text-foreground">
        <StoreProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {layoutContent}
            <Toaster position="top-center" />
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
