"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 overflow-hidden">
      <style jsx global>{`
        body {
          overflow: hidden;
        }
      `}</style>
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-600">
            No worries, we'll send you reset instructions.
          </p>
        </div>
        
        
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
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
                className="w-full font-medium py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
              >
                Back to Login
              </Button>
            </div>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Remember your password?{' '}
            <button 
              onClick={() => router.push('/client-login')}
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}