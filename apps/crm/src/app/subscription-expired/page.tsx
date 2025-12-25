"use client";

import { Button } from '@repo/ui/button';
import { useRouter } from 'next/navigation';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { useGetProfileQuery } from '@repo/store/api';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function SubscriptionExpiredPage() {
  const router = useRouter();
  const { isCrmAuthenticated, logout } = useCrmAuth();
  const [isChecking, setIsChecking] = useState(true);
  
  const { data: profileData, isSuccess } = useGetProfileQuery(undefined, {
    skip: !isCrmAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (isSuccess && profileData) {
      const subscription = profileData.user?.subscription;
      const endDate = subscription?.endDate ? new Date(subscription.endDate) : null;
      const isExpired = subscription?.status?.toLowerCase() === 'expired' || 
                      (endDate && endDate.getTime() <= Date.now());
      
      // If subscription is actually active, redirect to dashboard
      if (!isExpired) {
        router.push('/dashboard');
      } else {
        setIsChecking(false);
      }
    } else if (!isCrmAuthenticated) {
      router.push('/login');
    }
  }, [isSuccess, profileData, isCrmAuthenticated, router]);

  const handleRenew = () => {
    router.push('/pricing');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Subscription Expired
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your subscription has expired. Please renew to continue using all features.
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <Button
            onClick={handleRenew}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Renew Subscription
          </Button>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
