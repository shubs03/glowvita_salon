
"use client";

import React, { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { toast } from 'sonner';

export function DoctorRegistrationForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    // Add other fields from Doctor model here
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement API call to register doctor
    console.log("Doctor registration data:", formData);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    toast.success("Doctor registration submitted!");
    onSuccess();
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doctor Registration</CardTitle>
        <CardDescription>This feature is under construction.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="name" placeholder="Full Name" required />
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="phone" type="tel" placeholder="Phone Number" required />
          {/* Add more fields as needed */}
          <Button type="submit" className="w-full" disabled>
            Submit Application
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
