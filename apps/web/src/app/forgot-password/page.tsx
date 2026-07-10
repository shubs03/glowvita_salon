"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Email sent', {
          description: data.message,
          duration: 5000,
        });
      } else {
        toast.error('Error', {
          description: data.error || 'Failed to send reset email. Please try again.',
          duration: 4000,
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to send reset email. Please try again.',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#422A3C] relative overflow-hidden p-4 md:p-8 select-none">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Left side diagonal curved white background shape */}
        <svg className="absolute left-0 top-0 h-full w-full hidden md:block text-gray-50 fill-current" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 0 0 L 65 0 C 80 30, 75 70, 55 100 L 0 100 Z" />
        </svg>

        {/* Top-left background grey circles */}
        <div className="absolute top-[10%] left-[-3%] w-24 h-24 rounded-full bg-gray-200/50"></div>
        <div className="absolute top-[14%] left-[-1%] w-16 h-16 rounded-full bg-gray-200/30"></div>

        {/* Bottom-left background grey circles */}
        <div className="absolute bottom-[-8%] left-[-8%] w-56 h-56 rounded-full bg-gray-200/50"></div>
        <div className="absolute bottom-[4%] left-[-4%] w-40 h-40 rounded-full bg-gray-200/30"></div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-all duration-200"
        aria-label="Go back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Main Forgot Password Card */}
      <div className="w-full max-w-[970px] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 min-h-[510px] md:h-[540px]">
        {/* Left Column: Brand & Features */}
        <div className="md:w-[40%] bg-[#422A3C] text-white p-6 md:p-8 pt-10 md:pt-14 pb-8 flex flex-col justify-start gap-12 relative overflow-hidden">
          {/* Decorative interior translucent circles */}
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none"></div>
          <div className="absolute bottom-[39px] left-[29px] right-10 w-16 h-16 rounded-full bg-white/10 pointer-events-none"></div>
          <div className="absolute bottom-[7px] right-[30px] left-10 w-16 h-16 rounded-full bg-white/10 pointer-events-none"></div>
         
          {/* User lock icon */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-[80px] h-[80px] flex items-center justify-center filter drop-shadow-sm">
              <img src="/images/user-profile.png" alt="User profile" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Feature checklist */}
          <div className="space-y-8 relative z-10">
            <div className="flex items-start gap-2.5">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white flex items-center justify-center mt-0.5 shadow-sm">
                <svg className="w-3.5 h-3.5 text-[#422A3C]" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">Secure Account Recovery</h3>
                <p className="text-white/80 text-xs mt-0.5">Securely reset your password and regain access to your appointments.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white flex items-center justify-center mt-0.5 shadow-sm">
                <svg className="w-3.5 h-3.5 text-[#422A3C]" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">Verify Your Email</h3>
                <p className="text-white/80 text-xs mt-0.5">Enter your registered email to receive a secure password reset link instantly.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white flex items-center justify-center mt-0.5 shadow-sm">
                <svg className="w-3.5 h-3.5 text-[#422A3C]" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">Get Back to Booking</h3>
                <p className="text-white/80 text-xs mt-0.5">Create a new password and continue your salon journey with GlowVita Salon.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="flex-1 px-6 md:px-16 flex flex-col">
          {/* Logo at top */}
          <div className="text-center pt-7 pb-4 flex-shrink-0">
            <div className="flex justify-center mb-2">
              <img
                src="/images/GlowVita%20Salon%20PNG.png"
                alt="GlowVita Salon"
                className="h-14 w-auto object-contain"
              />
            </div>
          </div>

          {/* Form centered in remaining space */}
          <div className="flex-1 flex flex-col justify-center pb-6">
            <div className="text-center mb-5">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
              <p className="text-gray-600 text-sm">
                we'll help you get back into your account quickly and securely. Reset your password to continue booking your favorite salon services anytime.
              </p>
            </div>

            {/* Form fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#422A3C]/25 focus:border-[#422A3C] transition-all text-base font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-bold bg-[#422A3C] hover:bg-[#34202F] text-white rounded-lg shadow-md transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Instructions...
                    </span>
                  ) : 'Send Reset Instructions'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/client-login')}
                  className="w-full h-11 text-base font-bold bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg shadow-sm transition-all duration-200"
                >
                  Back to Login
                </Button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/client-login" className="font-bold text-[#422A3C] hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}