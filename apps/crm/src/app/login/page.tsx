"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { toast } from 'sonner';
import { useVendorLoginMutation, useGetVendorsQuery } from '@repo/store/api';
import { Eye, EyeOff, Scissors, Calendar, Users, CreditCard, Megaphone, Zap, Package } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@repo/store/hooks';
import { setCrmAuth } from '@repo/store/slices/crmAuthSlice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [vendorLogin, { isLoading }] = useVendorLoginMutation();
  const { data: vendorsData, isLoading: isVendorsLoading } = useGetVendorsQuery();
  const totalSalonsCount = vendorsData?.data?.total || vendorsData?.length || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await vendorLogin({ email, password }).unwrap();

      if(response.success) {
        dispatch(setCrmAuth({ user: response.user, token: response.access_token, role: response.role, permissions: response.permissions }));
        
        toast.success('Login successful!', {
          description: 'Welcome back to your dashboard.',
          duration: 3000,
        });
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error('Login failed', {
        description: error?.data?.error || 'Invalid credentials. Please try again.',
        duration: 4000,
      });
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile Background */}
      <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 right-10 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full blur-xl"></div>
        </div>
      </div>

      {/* Left Side - Professional Branding - lg:w-1/2 */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        {/* Modern Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-2xl"></div>
            <div className="absolute bottom-40 right-20 w-28 h-28 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 left-10 w-20 h-20 bg-gradient-to-br from-cyan-300 to-blue-300 rounded-full blur-lg"></div>
            <div className="absolute bottom-20 left-1/3 w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full blur-md"></div>
          </div>
          
          {/* Geometric Patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 right-1/4 w-24 h-24 border-2 border-white rounded-lg rotate-45"></div>
            <div className="absolute bottom-1/3 left-1/5 w-16 h-16 border border-white rounded-full"></div>
            <div className="absolute top-2/3 right-1/3 w-12 h-12 border-2 border-white rounded-lg rotate-12"></div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-white p-8 flex flex-col justify-center w-full">
          <div className="max-w-sm mx-auto">
            {/* Logo Section */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-2xl mb-3 border border-white/20">
                <Scissors className="w-8 h-8 text-white" />
              </div>
              <div className="flex justify-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              </div>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl font-bold mb-6 leading-tight text-center">
              <span className="inline bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                GlowVita Salon CRM
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-base text-slate-300 mb-6 leading-relaxed text-center italic font-serif">
              The smarter way to grow and manage your salon business — from bookings to clients, manage everything effortlessly with elegance.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                {/* Card 1 - Manage Salon */}
                <div className="bg-white/5 backdrop-blur-lg p-3 rounded-md border border-white/10 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-300">Effortlessly manage salon bookings and appointments.</p>
                    </div>
                  </div>
                </div>
                
                {/* Card 3 - Team Management */}
                <div className="bg-white/5 backdrop-blur-lg p-3 rounded-md border border-white/10 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-300">Keep staff and services organized with ease.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Card 2 - Manage Products */}
                <div className="bg-white/5 backdrop-blur-lg p-3 rounded-md border border-white/10 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-300">Simplify products and referral program management.</p>
                    </div>
                  </div>
                </div>
                
                {/* Card 4 - Marketing */}
                <div className="bg-white/5 backdrop-blur-lg p-3 rounded-md border border-white/10 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                      <Megaphone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-300">Run campaigns and nurture client relationships smoothly.</p>
                   </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-6 bg-white/5 backdrop-blur-xl p-8 rounded-md border border-white/20 shadow-sm">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {isVendorsLoading ? '...' : totalSalonsCount > 1000 ? `${Math.floor(totalSalonsCount / 1000)}K+` : totalSalonsCount}
                  </div>
                  <div className="text-xs text-slate-300 font-medium">Active Salons</div>
                </div>
                <div className="border-x border-white/20">
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">99.9%</div>
                  <div className="text-xs text-slate-300 font-medium">Uptime</div>
                </div>
                <div>
                  <div className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">24/7</div>
                  <div className="text-xs text-slate-300 font-medium">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form - lg:w-1/2 */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-sm">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-3 shadow-xl border border-white/20">
              <Scissors className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">GlowVita Salon CRM</h1>
          </div>

          {/* Login Card */}
          <Card className="backdrop-blur-xl bg-white/95 shadow-2xl border border-white/50 rounded-2xl">
            <CardHeader className="space-y-2 pb-4 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-2xl">
              <CardTitle className="text-2xl font-bold text-center text-slate-800">
                Sign In to Your Salon Hub
              </CardTitle>
              <CardDescription className="text-center text-slate-500 font-medium">
                Manage your salon with GlowVita
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-bold text-slate-700">
                    Email Address
                  </Label>
                  <Input
                    className="rounded-sm shadow-sm"
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all bg-white/80 backdrop-blur-sm rounded-sm shadow-sm"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-bold text-slate-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                    className="rounded-sm shadow-sm"
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-all pr-10 bg-white/80 backdrop-blur-sm rounded-xl"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors h-auto w-auto p-1"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded-sm border-slate-300 text-blue-600 focus:ring-1 focus:ring-blue-500/30 w-4 h-4" 
                    />
                    <span className="font-medium">Remember me</span>
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-blue-600 hover:text-indigo-600 font-bold hover:underline transition-colors p-0 h-auto"
                  >
                    Forgot Password?
                  </Button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 transition-all shadow-sm hover:shadow rounded-sm text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Access Dashboard</span>
                      <Zap className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-500 font-bold">Or</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-11 font-bold border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-xl"
                onClick={() => router.push('/auth/register')}
                disabled={isLoading}
              >
                Create Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}