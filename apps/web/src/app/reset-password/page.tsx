"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { Suspense } from 'react';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null); // null means we're still checking
  const [email, setEmail] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams?.get('token');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Get email from URL parameters
    const emailParam = searchParams?.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
    
    // Check if token and email are present
    if (!token || !emailParam) {
      setIsValidToken(false);
      return;
    }
    
    // Validate token on page load
    const validateToken = async () => {
      try {
        const response = await fetch('/api/auth/validate-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email: emailParam }),
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.isValid) {
          setIsValidToken(false);
        } else {
          setIsValidToken(true);
        }
      } catch (error) {
        setIsValidToken(false);
      }
    };
    
    validateToken();
  }, [token, searchParams, router, mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error('Password mismatch', {
        description: 'Passwords do not match.',
        duration: 4000,
      });
      return;
    }
    
    // Check password strength
    if (password.length < 8) {
      toast.error('Password too short', {
        description: 'Password must be at least 8 characters long.',
        duration: 4000,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Password reset successful', {
          description: data.message || 'Your password has been reset successfully. You can now log in with your new password.',
          duration: 5000,
        });
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push('/client-login');
        }, 2000);
      } else {
        toast.error('Reset failed', {
          description: data.error || 'Failed to reset password. Please try again.',
          duration: 4000,
        });
        // If the token is invalid or expired, redirect to forgot password page
        if (data.error && (data.error.includes('Invalid') || data.error.includes('expired'))) {
          setTimeout(() => {
            router.push('/forgot-password');
          }, 3000);
        }
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to reset password. Please try again.',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderRightColumnContent = () => {
    if (!mounted || isValidToken === null) {
      return (
        <div className="text-center py-8">
          <h1 className="text-xl font-bold text-gray-900 mb-4">
            {!mounted ? 'Loading...' : 'Validating Reset Link'}
          </h1>
          <div className="flex justify-center my-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#422A3C]"></div>
          </div>
          {mounted && (
            <p className="text-sm text-gray-600">
              Please wait while we validate your reset link...
            </p>
          )}
        </div>
      );
    }

    if (!isValidToken) {
      return (
        <div className="text-center py-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Reset Link</h1>
          <p className="text-sm text-gray-600 mb-6">
            The password reset link is invalid or has expired.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push('/forgot-password')}
              className="w-full h-11 text-base font-bold bg-[#422A3C] hover:bg-[#34202F] text-white rounded-lg shadow-md transition-all duration-300"
            >
              Request New Reset Link
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/client-login')}
              className="w-full h-11 text-base font-bold bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg shadow-sm transition-all duration-200"
            >
              Back to Login
            </Button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset Password</h1>
          <p className="text-gray-600 text-xs px-2">
            Set a strong new password to secure your GlowVita Salon account and continue enjoying seamless salon bookings and beauty services.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              id="email"
              type="email"
              value={email || ''}
              readOnly
              className="w-full h-11 px-3.5 border border-gray-300 bg-gray-50/50 cursor-not-allowed rounded-lg text-gray-500 focus:outline-none text-base font-medium"
              placeholder="Email"
            />
          </div>

          <div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Enter new password"
                className="w-full h-11 pl-3.5 pr-10 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#422A3C]/25 focus:border-[#422A3C] transition-all text-base font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters
            </p>
          </div>

          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Confirm new password"
              className="w-full h-11 pl-3.5 pr-10 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#422A3C]/25 focus:border-[#422A3C] transition-all text-base font-medium"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-base font-bold bg-[#422A3C] hover:bg-[#34202F] text-white rounded-lg shadow-md transition-all duration-300"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting Password...
                </span>
              ) : 'Reset Password'}
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
      </>
    );
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

      {/* Main Card */}
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
              <img src="/images/user-profile.png" alt="User profile" className="w-full h-full object-contain"/>
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
                <h3 className="font-bold text-white text-base leading-tight">Secure Password Update</h3>
                <p className="text-white/80 text-xs mt-0.5">Your new password will be encrypted and securely stored.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white flex items-center justify-center mt-0.5 shadow-sm">
                <svg className="w-3.5 h-3.5 text-[#422A3C]" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">Confirm Your Password</h3>
                <p className="text-white/80 text-xs mt-0.5">Re-enter your password to ensure it matches correctly.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white flex items-center justify-center mt-0.5 shadow-sm">
                <svg className="w-3.5 h-3.5 text-[#422A3C]" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">Get Back to Glow</h3>
                <p className="text-white/80 text-xs mt-0.5">Reset your password and continue booking your favorite salon services with ease.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="flex-1 px-6 md:px-16 flex flex-col justify-center">
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
            {renderRightColumnContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Loading...</h1>
            <div className="flex justify-center my-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}