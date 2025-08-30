
"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Building, MapPin, User, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { toast } from 'sonner';
import { useVendorRegisterMutation } from '@repo/store/api';
import { cn } from '@repo/ui/cn';

const StepIndicator = ({ currentStep, setStep }) => {
    const steps = [
        { id: 1, name: 'Create Account', icon: User },
        { id: 2, name: 'Business Details', icon: Building },
        { id: 3, name: 'Location', icon: MapPin },
    ];
    
    return (
        <nav aria-label="Progress" className="w-full">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={cn("relative", stepIdx !== steps.length - 1 ? "flex-1" : "")}>
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

const VendorRegistrationFormContent = ({ onSuccess }) => {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    category: '',
    subCategories: [],
    address: '',
    city: '',
    state: '',
    pincode: '',
    location: null,
    referredByCode: refCode || ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [registerVendor, { isLoading }] = useVendorRegisterMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;

    try {
      // For this new flow, we register with minimal details first.
      // The rest of the details would be collected in an onboarding flow after login.
      await registerVendor({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        businessName: formData.businessName || `${formData.firstName}'s Salon`, // Provide a default
        // Provide default/empty values for other required fields for now
        state: formData.state || 'N/A',
        city: formData.city || 'N/A',
        pincode: formData.pincode || '000000',
        category: formData.category || 'unisex',
        subCategories: formData.subCategories.length > 0 ? formData.subCategories : ['shop'],
        address: formData.address || 'N/A',
        location: formData.location || { lat: 0, lng: 0 },
        referredByCode: formData.referredByCode
      }).unwrap();
      onSuccess();
    } catch (err) {
      toast.error(err.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
        <div className="bg-background/70 backdrop-blur-sm border-white/20 shadow-2xl shadow-blue-500/10 p-8 rounded-lg">
            <StepIndicator currentStep={step} setStep={setStep} />
            <form onSubmit={handleSubmit} className="mt-8">
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-center">Create your account</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input name="firstName" placeholder="First Name" onChange={handleChange} value={formData.firstName} required />
                            <Input name="lastName" placeholder="Last Name" onChange={handleChange} value={formData.lastName} required />
                        </div>
                        <Input name="email" type="email" placeholder="Email Address" onChange={handleChange} value={formData.email} required />
                        <Input name="phone" type="tel" placeholder="Phone Number" onChange={handleChange} value={formData.phone} required />
                         <div className="relative">
                            <Input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" onChange={handleChange} value={formData.password} required />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        <div className="relative">
                            <Input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} value={formData.confirmPassword} required />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Create Account & Continue'}
                        </Button>
                    </div>
                )}
            </form>
        </div>
    </div>
  );
};

export function VendorRegistrationForm(props) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VendorRegistrationFormContent {...props} />
        </Suspense>
    );
}
