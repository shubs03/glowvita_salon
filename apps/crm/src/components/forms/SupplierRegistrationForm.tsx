
"use client";

import React, { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { toast } from 'sonner';

export function SupplierRegistrationForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    // Add other fields from Supplier model here
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement API call to register supplier
    console.log("Supplier registration data:", formData);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    toast.success("Supplier registration submitted!");
    onSuccess();
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Registration</CardTitle>
        <CardDescription>This feature is under construction.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="firstName" placeholder="First Name" required />
          <Input name="lastName" placeholder="Last Name" required />
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="mobile" type="tel" placeholder="Mobile Number" required />
          {/* Add more fields as needed */}
          <Button type="submit" className="w-full" disabled>
            Submit Application
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
