"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetMeQuery } from '@repo/store/api';
import { setUserAuth, clearUserAuth } from '@repo/store/slices/Web/userAuthSlice';
import { useAppDispatch, useAppSelector } from '@repo/store/hooks';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import Cookies from 'js-cookie';

export default function DashboardPage() {
  const router = useRouter();
  const { data, error, isLoading } = useGetMeQuery({});
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data) {
      dispatch(setUserAuth(data.user));
    }
    if(error){        
      dispatch(clearUserAuth())
      router.push('/login');
    }
  }, [data, error, dispatch, router]);

  const handleLogout = async () => {
    try {
      // Remove all possible auth tokens from cookies
      Cookies.remove('token', { path: '/' });
      Cookies.remove('token', { path: '/', domain: window.location.hostname });
      Cookies.remove('access_token', { path: '/' });
      Cookies.remove('access_token', { path: '/', domain: window.location.hostname });
      Cookies.remove('crm_access_token', { path: '/' });
      Cookies.remove('crm_access_token', { path: '/', domain: window.location.hostname });
      
      // Clear all auth-related data from localStorage
      localStorage.removeItem('userAuthState');
      localStorage.removeItem('crmAuthState');
      localStorage.removeItem('adminAuthState');
      
      // Clear any other possible tokens
      Object.keys(localStorage).forEach(key => {
        if (key.includes('token') || key.includes('auth')) {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.warn(`Failed to remove localStorage item: ${key}`, e);
          }
        }
      });

      await fetch('/api/auth/logout');
      dispatch(clearUserAuth());
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login even if there was an error
      router.push('/login');
    }
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
