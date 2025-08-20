
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { useAppDispatch } from '@repo/store/hooks';
import { setAdminAuth } from '@repo/store/slices/auth';
import { useAdminLoginMutation } from '../../../../../packages/store/src/services/api';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [adminLogin, { isLoading }] = useAdminLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your admin credentials to login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)} 
                      required
                      className="pr-10"
                      disabled={isLoading}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 h-full px-3"
                        onClick={togglePasswordVisibility}
                        disabled={isLoading}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">
                            {showPassword ? 'Hide password' : 'Show password'}
                        </span>
                    </Button>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
