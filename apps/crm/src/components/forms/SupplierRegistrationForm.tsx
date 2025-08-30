
"use client";

import React, { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { toast } from 'sonner';
import { useCreateSupplierMutation } from '@repo/store/api';
import { User, Building, ArrowRight } from 'lucide-react';

const StepIndicator = ({ currentStep }) => {
    const steps = [
        { id: 1, name: 'Create Account', icon: User },
        { id: 2, name: 'Business Details', icon: Building },
    ];
    
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
                         <div className="flex items-center text-sm font-medium">
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                                currentStep > step.id ? "bg-primary text-white" :
                                currentStep === step.id ? "border-2 border-primary bg-primary/10 text-primary" :
                                "border-2 border-gray-300 bg-background text-muted-foreground"
                            }`}>
                                <step.icon className="h-5 w-5" />
                            </span>
                            <span className={`ml-3 hidden font-medium text-muted-foreground md:inline ${currentStep >= step.id && 'text-foreground'}`}>
                                {step.name}
                            </span>
                        </div>
                        {stepIdx !== steps.length - 1 && (
                            <div className="absolute right-0 top-4 -z-10 hidden h-0.5 w-full bg-gray-200 md:block" aria-hidden="true" />
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

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
    <div className="w-full max-w-xl mx-auto">
        <div className="bg-background/70 backdrop-blur-sm border-white/20 shadow-2xl shadow-blue-500/10 p-8 rounded-lg">
            <div className="mb-8">
                <StepIndicator currentStep={1} />
            </div>
            <h2 className="text-xl font-semibold text-center mb-6">Create Your Supplier Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <Input name="firstName" placeholder="First Name" onChange={handleChange} required />
                    <Input name="lastName" placeholder="Last Name" onChange={handleChange} required />
                </div>
                <Input name="shopName" placeholder="Shop Name" onChange={handleChange} required />
                <Input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
                <Input name="mobile" type="tel" placeholder="Mobile Number" onChange={handleChange} required />
                <Input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                <Input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account & Continue'}
                </Button>
            </form>
        </div>
    </div>
  );
}
