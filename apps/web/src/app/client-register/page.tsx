
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { PageContainer } from '@repo/ui/page-container';
import { UserPlus } from 'lucide-react';

export default function ClientRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      const data = await res.json();
      setError(data.message || 'Failed to sign up.');
    }
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-screen bg-secondary/50 py-12">
        <Card className="mx-auto max-w-md w-full shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
              <UserPlus className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
            <CardDescription>
              Join us to book and manage your appointments with ease.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Max Robinson" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-destructive text-sm text-center">{error}</p>}
                <Button type="submit" className="w-full" size="lg">
                  Create an account
                </Button>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" size="lg">
                  Sign up with Google
                </Button>
              </div>
            </form>
            <div className="mt-6 text-center text-sm">
              Already have an account?{' '}
              <Link href="/client-login" className="underline font-semibold">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* 10 sections */}
      <section></section><section></section><section></section><section></section><section></section><section></section><section></section><section></section><section></section><section></section>
    </PageContainer>
  );
}
