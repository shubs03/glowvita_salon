"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { toast } from 'sonner';
import { glowvitaApi } from '@repo/store/api';
import { Eye, EyeOff } from 'lucide-react';
import { useAppDispatch } from '@repo/store/hooks';
import { setUserAuth } from '@repo/store/slices/userAuthSlice';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import customerImage from '../../../public/images/web_login.jpg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [login, { isLoading: isLoggingIn }] = glowvitaApi.useUserLoginMutation();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.push('/profile');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await login({ email, password }).unwrap();

      if (response.user && response.token) {
        dispatch(setUserAuth({ user: response.user, token: response.token, role: response.role, permissions: response.permissions }));
        
        toast.success('Login successful!', {
          description: 'Redirecting to your profile...',
          duration: 1000,
          onAutoClose: () => router.push('/profile'),
        });
      } else {
        toast.error(response.message || 'Failed to log in.');
      }
    } catch (err: any) {
      toast.error('An error occurred.', {
        description: err.data?.message || 'Please check your credentials and try again.',
      });
    }
  };
  
  // Only redirect if user is authenticated
  if (!isAuthLoading && isAuthenticated) {
    router.push('/profile');
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/80">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/10 rounded-full"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin border-t-primary"></div>
          </div>
        </div>
    );
  }

  // If already authenticated, the useEffect will handle redirection, render nothing here to avoid flash.
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row">
      <button 
        onClick={() => router.back()} 
        className="absolute top-4 left-4 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-all duration-200"
        aria-label="Go back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <div className="flex-1 md:w-1/2 flex items-center justify-center p-4 sm:p-6 relative z-10 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md self-center py-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 md:text-xl">Glowvita Salon for customers</h1>
            <p className="text-gray-600 text-l mt-3 lg:whitespace-nowrap md:whitespace-normal sm:whitespace-normal">Log in to access and manage your appointments anytime.</p>
          </div>

          <div className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-5">
                <div>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-11 p-5 text-sm font-medium bg-gray-50 hover:bg-gray-0 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 md:text-base"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full h-11 text-sm p-5 font-medium bg-gray-50 hover:bg-gray-0 text-gray-700 border border-gray-200 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 md:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Continue'}
              </Button>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="remember" className="ml-2 block text-md text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link href="/forgot-password" className="text-md font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-gray-50 text-gray-500">OR CONTINUE WITH</span>
                </div>
              </div>

              <Button 
                type="button"
                onClick={() => {/* Add Google OAuth handler */}}
                className="w-full h-11 text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
              >
                <div className="flex items-center justify-center w-5 h-5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <span>Continue with Google</span>
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-gray-50 text-gray-500">NEW TO GLOWVITA SALON ?</span>
                </div>
              </div>

              <div className="text-center mt-2">
                <Button 
                  onClick={() => router.push('/client-register')}
                  className="w-full h-11 text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Sign up and register today
                </Button>
              </div>
              
              <div className="border-t border-gray-200 my-4"></div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">
                  Have a business account?
                </p>
                <a 
                  href="http://localhost:3001/login" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 block mt-1"
                >
                  Sign in as a professional
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="absolute inset-0">
          <Image
            src={customerImage}
            alt="Salon Customer"
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}