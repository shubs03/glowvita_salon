"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { toast } from 'sonner';
import { useCreateSupplierMutation } from '@repo/store/api';
import { User, Building, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@repo/ui/cn';

const StepIndicator = ({ currentStep }) => {
    const steps = [
        { id: 1, name: 'Create Account', icon: User },
        { id: 2, name: 'Business Details', icon: Building },
    ];
    
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={cn("relative", stepIdx !== steps.length - 1 ? 'flex-1' : '')}>
                         <div className="flex items-center text-sm font-medium">
                            <span className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                                currentStep > step.id ? "bg-primary text-white" :
                                currentStep === step.id ? "border-2 border-primary bg-primary/10 text-primary" :
                                "border-2 border-gray-300 bg-background text-muted-foreground"
                            )}>
                                {currentStep > step.id ? <User className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                            </span>
                            <span className={cn(
                                "ml-3 hidden font-medium text-muted-foreground md:inline",
                                currentStep >= step.id && "text-foreground"
                            )}>
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
  const [step, setStep] = useState(1);
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
  
  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.mobile || !formData.password) {
        toast.error("Please fill all required fields in this step.");
        return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;

    try {
      await createSupplier(formData).unwrap();
      toast.success("Supplier registration submitted successfully!");
      onSuccess();
    } catch (err) {
       toast.error(err?.data?.message || "Registration failed. Please try again.");
    }
  };
  
  const nextStep = () => {
      if (validateStep1()) {
          setStep(2);
      }
  }

  const prevStep = () => setStep(1);

  return (
    <div className="w-full max-w-xl mx-auto">
        <div className="bg-background/70 backdrop-blur-sm border-white/20 shadow-2xl shadow-blue-500/10 p-8 rounded-lg">
            <div className="mb-8">
                <StepIndicator currentStep={step} />
            </div>
            <form onSubmit={handleSubmit} className="mt-8">
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in-50 duration-500">
                        <h2 className="text-xl font-semibold text-center">Create Your Supplier Account</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input name="firstName" placeholder="First Name" onChange={handleChange} required />
                            <Input name="lastName" placeholder="Last Name" onChange={handleChange} required />
                        </div>
                        <Input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
                        <Input name="mobile" type="tel" placeholder="Mobile Number" onChange={handleChange} required />
                        <Input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                        <Input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in-50 duration-500">
                        <h2 className="text-xl font-semibold text-center">Tell us about your Business</h2>
                        <Input name="shopName" placeholder="Shop Name" onChange={handleChange} required />
                        <Input name="supplierType" placeholder="Supplier Type (e.g., Cosmetics, Equipment)" onChange={handleChange} required />
                        <Input name="address" placeholder="Business Address" onChange={handleChange} required />
                        <div className="grid md:grid-cols-3 gap-4">
                            <Input name="city" placeholder="City" onChange={handleChange} required />
                            <Input name="state" placeholder="State" onChange={handleChange} required />
                            <Input name="pincode" placeholder="Pincode" onChange={handleChange} required />
                        </div>
                    </div>
                )}
                <div className="flex justify-between pt-6 border-t mt-8">
                    <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    {step < 2 ? (
                        <Button type="button" onClick={nextStep}>
                            Next <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Complete Registration'}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    </div>
  );
}

export const SupplierRegistrationFormWithSuspense = (props) => (
    <Suspense fallback={<div>Loading...</div>}>
        <SupplierRegistrationForm {...props} />
    </Suspense>
);