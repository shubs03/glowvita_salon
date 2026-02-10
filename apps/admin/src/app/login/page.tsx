"use client";

import { useState } from 'react';
import Image from 'next/image';
import salonImage from '../../../public/images/salon_image.jpg';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Label } from '@repo/ui/label';
import { useAppDispatch } from '@repo/store/hooks';
import { setAdminAuth } from '@repo/store/slices/adminAuthSlice';
import { useAdminLoginMutation } from '../../../../../packages/store/src/services/api';
import { Eye, EyeOff, Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [adminLogin] = useAdminLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await adminLogin({ email, password }).unwrap();

      if (response.success) {
        // Set the token in an httpOnly cookie via the API response header is best,
        // but for this setup, we'll set it client-side.
        Cookies.set('admin_access_token', response.admin_access_token, {
          expires: 1, // Expires in 1 day
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        dispatch(setAdminAuth({ user: response.user, token: response.admin_access_token }));
        toast.success("Login successful!");
        router.push('/');
        router.refresh(); // Refresh to ensure middleware runs with new cookie
      } else {
        setError(response.error || 'Invalid email or password.');
        toast.error(response.error || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.data?.error || 'An unexpected error occurred.');
      toast.error(err.data?.error || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-all duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Left Side - Login Form */}
      <div className="flex-1 md:w-1/2 flex items-center justify-center p-4 sm:p-6 relative z-10 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md self-center py-6">
          {/* Heading */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="/favicon.jpeg"
                alt="GlowVita Logo"
                className="w-16 h-16 object-contain rounded-full border-4 border-white shadow-lg"
              />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 md:text-xl">GlowVita Admin Portal</h1>
            <p className="text-gray-600 text-l mt-3 lg:whitespace-nowrap md:whitespace-normal sm:whitespace-normal">Manage bookings, clients, and operations seamlessly</p>
          </div>

          {/* Login Form */}
          <div className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-11 p-5 text-sm font-medium bg-gray-50 hover:bg-gray-0 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 md:text-base pl-11"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-11 text-sm p-5 font-medium bg-gray-50 hover:bg-gray-0 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 md:text-base pl-11 pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
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

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2 flex-shrink-0"></div>
                    {error}
                  </p>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-11 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>


            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Salon Image */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={salonImage}
            alt="Salon Interior"
            fill
            priority
            className="object-cover"
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20"></div>
        </div>
      </div>
    </div>
  );
}