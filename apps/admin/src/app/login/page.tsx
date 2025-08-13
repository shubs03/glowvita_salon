"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { useAppDispatch } from '@repo/store/hooks';
import { setAdminAuth } from '@repo/store/slices/auth';
import { useAdminLoginMutation } from '@repo/store/services/api';
import { Eye, EyeOff } from 'lucide-react';


export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [adminLogin] = useAdminLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await adminLogin({ email, password }).unwrap();
      if (response.success) {
        dispatch(setAdminAuth({ user: response.user, token: response.admin_access_token }));
        router.push('/');
      } else {
        setError(response.error || 'Invalid email or password.');
    }
    } catch (err: any) {
      setError(err.data?.error || 'An unexpected error occurred.');
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
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 h-full px-3"
                        onClick={togglePasswordVisibility}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">
                            {showPassword ? 'Hide password' : 'Show password'}
                        </span>
                    </Button>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
