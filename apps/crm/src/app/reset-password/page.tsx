"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Mark component as mounted
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client side after mount
    if (!mounted || typeof window === 'undefined') return;
    
    // Parse URL parameters using window.location
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const emailParam = urlParams.get('email');
    
    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(emailParam);
    
    // Check if token and email are present
    if (!tokenParam || !emailParam) {
      setIsValidToken(false);
      toast.error('Invalid reset link', {
        description: 'The password reset link is invalid or has expired.',
        duration: 5000,
      });
      return;
    }
    
    // Validate token on page load
    const validateToken = async () => {
      try {
        const response = await fetch('/api/crm/auth/validate-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenParam, email: emailParam }),
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.isValid) {
          setIsValidToken(false);
          toast.error('Invalid reset link', {
            description: 'The password reset link is invalid or has expired.',
            duration: 5000,
          });
          // Redirect to forgot password page after a short delay
          setTimeout(() => {
            router.push('/forgot-password');
          }, 3000);
        }
      } catch (error) {
        setIsValidToken(false);
        toast.error('Error', {
          description: 'Failed to validate reset link. Please try again.',
          duration: 4000,
        });
      }
    };
    
    validateToken();
  }, [mounted, router]);

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
      const response = await fetch('/api/crm/auth/reset-password', {
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
          router.push('/login');
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

  // Show loading state while client-side hydration happens
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 overflow-hidden">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Invalid Reset Link</h1>
            <p className="mt-2 text-gray-600">
              The password reset link is invalid or has expired.
            </p>
            <p className="mt-2 text-gray-600">
              Redirecting to forgot password page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 overflow-hidden">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="mt-2 text-gray-600">
            Enter your new password below
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email ID
                </Label>
                <div className="mt-1">
                  <Input
                    id="email"
                    type="email"
                    value={email || ''}
                    readOnly
                    className="w-full bg-gray-100 cursor-not-allowed"
                    placeholder="Email"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Password must be at least 8 characters
                </p>
              </div>
              
              <div>
                <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
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
                onClick={() => router.push('/login')}
                className="w-full font-medium py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition duration-300"
              >
                Back to Login
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}