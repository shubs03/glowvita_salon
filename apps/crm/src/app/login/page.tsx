"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { toast } from 'sonner';
import { useVendorLoginMutation } from '@repo/store/api';
import { Eye, EyeOff, ShoppingBag, Shield, Users, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  const [vendorLogin, { isLoading }] = useVendorLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await vendorLogin({ email, password }).unwrap();
      
      toast.success('Login successful!', {
        description: 'Welcome back to your vendor dashboard.',
        duration: 3000,
      });
      
      router.push('/');
    } catch (error: any) {
      toast.error('Login failed', {
        description: error?.data?.message || error?.message || 'Invalid credentials. Please try again.',
        duration: 4000,
      });
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 left-16 w-24 h-24 bg-white rounded-full blur-xl"></div>
          <div className="absolute bottom-32 right-16 w-20 h-20 bg-white rounded-full blur-lg"></div>
          <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white rounded-full blur-md"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-white p-8 flex flex-col justify-center w-full">
          <div className="max-w-md mx-auto">
            <ShoppingBag className="w-12 h-12 mb-4" />
            <h1 className="text-4xl font-bold mb-3 leading-tight">
              Vendor
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Hub
              </span>
            </h1>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              Streamline your business with our vendor management platform
            </p>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Secure & Reliable</h3>
                  <p className="text-sm text-blue-100">Enterprise-grade security</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Team Collaboration</h3>
                  <p className="text-sm text-blue-100">Work with your team seamlessly</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Smart Analytics</h3>
                  <p className="text-sm text-blue-100">Data-driven insights</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">10K+</div>
                <div className="text-xs text-blue-100">Vendors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">99.9%</div>
                <div className="text-xs text-blue-100">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">24/7</div>
                <div className="text-xs text-blue-100">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mb-3">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Hub</h1>
          </div>

          <Card className="shadow-lg border border-gray-100">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-semibold text-center text-gray-900">
                Sign In
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Access your vendor dashboard
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vendor@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 text-gray-600">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4" 
                    />
                    <span>Remember me</span>
                  </label>
                  <a 
                    href="#" 
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                  >
                    Forgot?
                  </a>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-10 font-medium border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-all duration-200"
                onClick={() => router.push('/auth/register')}
                disabled={isLoading}
              >
                Create Account
              </Button>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              Trusted by <span className="font-semibold text-blue-600">10K+</span> vendors
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}