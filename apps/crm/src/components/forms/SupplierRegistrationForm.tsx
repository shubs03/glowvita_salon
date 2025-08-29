
"use client";

import React, { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { toast } from 'sonner';
import { useCreateSupplierMutation } from '@repo/store/api';

export function SupplierRegistrationForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    shopName: '',
    country: 'India',
    state: 'N/A',
    city: 'N/A',
    pincode: '000000',
    address: 'N/A',
    supplierType: 'General',
    password: '',
    confirmPassword: '',
  });

  const [createSupplier, { isLoading }] = useCreateSupplierMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await createSupplier(formData).unwrap();
      toast.success("Supplier registration submitted successfully!");
      onSuccess();
    } catch (err) {
       toast.error(err?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Registration</CardTitle>
        <CardDescription>Join as a supplier to provide products to our network.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="firstName" placeholder="First Name" onChange={handleChange} required />
          <Input name="lastName" placeholder="Last Name" onChange={handleChange} required />
          <Input name="shopName" placeholder="Shop Name" onChange={handleChange} required />
          <Input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
          <Input name="mobile" type="tel" placeholder="Mobile Number" onChange={handleChange} required />
          <Input name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <Input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
