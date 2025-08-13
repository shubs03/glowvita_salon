"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetMeQuery } from '@/packages/store/src/services/api';
import { useAppDispatch, setAuth, clearAuth } from '@repo/store/slices/auth';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';

export default function DashboardPage() {
  const router = useRouter();
  const { data, error, isLoading } = useGetMeQuery({});
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data) {
      dispatch(setAuth(data.user));
    }
    if(error){
      dispatch(clearAuth())
      router.push('/login');
    }
  }, [data, error, dispatch, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout');
    dispatch(clearAuth());
    router.push('/login');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold font-headline">My Dashboard</h1>
          <Button variant="ghost" onClick={handleLogout}>Logout</Button>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {data?.user?.name || 'User'}!</CardTitle>
            <CardDescription>This is your protected dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Your email: {data?.user?.email}</p>
            <p>Your role: {data?.user?.role}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
