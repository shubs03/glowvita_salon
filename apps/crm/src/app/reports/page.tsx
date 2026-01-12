'use client';

import { useCrmAuth } from '@/hooks/useCrmAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ReportsRedirectPage() {
  const { role, isLoading } = useCrmAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Redirect to the appropriate reports page based on user role
      if (role === 'vendor' || role === 'staff') {
        router.push('/reports/vendor');
      } else if (role === 'supplier') {
        router.push('/reports/supplier');
      } else {
        // If user doesn't have a valid role, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [role, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p>Please wait while we determine your role.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Reports...</h1>
        <p>Based on your role, you'll be redirected to the appropriate reports page.</p>
      </div>
    </div>
  );
}
