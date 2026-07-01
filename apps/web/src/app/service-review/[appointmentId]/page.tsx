"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ServiceReviewPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params?.appointmentId as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !appointmentId) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(`/client-login?redirect=${encodeURIComponent(`/profile/reviews?appointmentId=${appointmentId}&tab=services`)}`);
      return;
    }

    router.replace(`/profile/reviews?appointmentId=${appointmentId}&tab=services`);
  }, [authLoading, isAuthenticated, appointmentId, router]);

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Opening review form</CardTitle>
        <CardDescription>Redirecting you to your profile so the review opens in a modal.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </CardContent>
    </Card>
  );
}
