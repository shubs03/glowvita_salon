"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Building, MapPin, User, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { toast } from 'sonner';
import { useVendorRegisterMutation } from '@repo/store/api';
import { cn } from '@repo/ui/cn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Checkbox } from '@repo/ui/checkbox';
import { Textarea } from '@repo/ui/textarea';

const StepIndicator = ({ currentStep }) => {
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

export function VendorRegistrationForm({ onSuccess }) {
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
    referredByCode: refCode || '',
    description: '',
    website: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [registerVendor, { isLoading }] = useVendorRegisterMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (id, checked) => {
    setFormData(prev => ({
      ...prev,
      subCategories: checked
        ? [...prev.subCategories, id]
        : prev.subCategories.filter(item => item !== id)
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.businessName) newErrors.businessName = 'Business name is required';
    if (!formData.category) newErrors.category = 'Salon category is required';
    if (formData.subCategories.length === 0) newErrors.subCategories = 'At least one sub-category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) {
        toast.error("Please ensure all required fields are filled correctly.");
        return;
    }

    try {
      await registerVendor(formData).unwrap();
      onSuccess();
    } catch (err) {
      toast.error(err.data?.error || 'Registration failed');
    }
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
        setStep(2);
    } else if (step === 2 && validateStep2()) {
        setStep(3);
    }
  }

  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-background/70 backdrop-blur-sm border-white/20 shadow-2xl shadow-blue-500/10 p-8 rounded-lg">
        <div className="mb-8">
            <StepIndicator currentStep={step} />
        </div>
        <form onSubmit={handleSubmit} className="mt-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
                <h2 className="text-xl font-semibold text-center">Create your account</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <Input name="firstName" placeholder="First Name" onChange={handleChange} value={formData.firstName} required />
                    <Input name="lastName" placeholder="Last Name" onChange={handleChange} value={formData.lastName} required />
                </div>
                <Input name="email" type="email" placeholder="Email Address" onChange={handleChange} value={formData.email} required />
                <Input name="phone" type="tel" placeholder="Phone Number" onChange={handleChange} value={formData.phone} required />
                 <div className="relative">
                    <Input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password (min. 8 characters)" onChange={handleChange} value={formData.password} required />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                       {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="relative">
                    <Input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} value={formData.confirmPassword} required />
                </div>
            </div>
          )}

          {step === 2 && (
             <div className="space-y-6 animate-in fade-in-50 duration-500">
                <h2 className="text-xl font-semibold text-center">Tell us about your business</h2>
                <Input name="businessName" placeholder="Business Name" onChange={handleChange} value={formData.businessName} required />
                 <Select name="category" onValueChange={(value) => setFormData(prev => ({...prev, category: value }))} value={formData.category}>
                    <SelectTrigger><SelectValue placeholder="Salon Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unisex">Unisex</SelectItem>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                    </SelectContent>
                </Select>
                <div className="space-y-2">
                    <Label>Sub Categories</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['shop', 'shop-at-home', 'onsite']).map(sc => (
                        <div key={sc} className="flex items-center space-x-2 p-2 border rounded-md">
                          <Checkbox id={sc} checked={formData.subCategories.includes(sc)} onCheckedChange={(checked) => handleCheckboxChange(sc, checked)} />
                          <Label htmlFor={sc} className="capitalize">{sc.replace('-', ' ')}</Label>
                        </div>
                      ))}
                    </div>
                </div>
                <Textarea name="description" placeholder="Business Description (Optional)" onChange={handleChange} value={formData.description} />
                <Input name="website" placeholder="Website URL (Optional)" onChange={handleChange} value={formData.website} />
                <Input name="referredByCode" placeholder="Referral Code (Optional)" onChange={handleChange} value={formData.referredByCode} />
            </div>
          )}

          {step === 3 && (
             <div className="space-y-6 animate-in fade-in-50 duration-500">
                <h2 className="text-xl font-semibold text-center">Where is your business located?</h2>
                <Input name="address" placeholder="Full Address" onChange={handleChange} value={formData.address} required />
                 <div className="grid md:grid-cols-3 gap-4">
                    <Input name="state" placeholder="State" onChange={handleChange} value={formData.state} required />
                    <Input name="city" placeholder="City" onChange={handleChange} value={formData.city} required />
                    <Input name="pincode" placeholder="Pincode" onChange={handleChange} value={formData.pincode} required />
                </div>
             </div>
          )}
          
          <div className="flex justify-between pt-6 border-t mt-8">
            <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            {step < 3 ? (
              <Button type="button" onClick={nextStep}>
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Complete Registration"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export const VendorRegistrationFormWithSuspense = (props) => (
  <Suspense fallback={<div>Loading form...</div>}>
    <VendorRegistrationForm {...props} />
  </Suspense>
);