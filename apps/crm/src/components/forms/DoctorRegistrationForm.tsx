"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { toast } from 'sonner';
import { useCreateDoctorMutation, useGetSuperDataQuery } from '@repo/store/api';
import { Label } from '@repo/ui/label';
import { Checkbox } from '@repo/ui/checkbox';
import { Skeleton } from '@repo/ui/skeleton';
import { CheckCircle, Stethoscope, User, HeartPulse, Microscope, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@repo/ui/cn';

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  gender: string;
  doctorType: string;
  specialties: string[];
  diseases: string[];
  experience: string;
  registrationNumber: string;
  clinicName: string;
  clinicAddress: string;
  state: string;
  city: string;
  pincode: string;
  physicalConsultationStartTime: string;
  physicalConsultationEndTime: string;
  assistantName: string;
  assistantContact: string;
  doctorAvailability: string;
  workingWithHospital: boolean;
  videoConsultation: boolean;
  referredByCode: string;
}

const StepIndicator = ({ currentStep, setStep }: { currentStep: number; setStep: (step: number) => void }) => {
  return (
    <div className="w-full mb-4 mt-2">
      <div className="flex space-x-2">
        {/* Step 1 Line */}
        <div 
          className={cn(
            "h-1 flex-1 rounded-full transition-colors cursor-pointer",
            currentStep >= 1 ? "bg-purple-600" : "bg-gray-200"
          )}
          onClick={() => currentStep > 1 && setStep(1)}
        />
        {/* Step 2 Line */}
        <div 
          className={cn(
            "h-1 flex-1 rounded-full transition-colors cursor-pointer",
            currentStep >= 2 ? "bg-purple-600" : "bg-gray-200"
          )}
          onClick={() => currentStep > 2 && setStep(2)}
        />
        {/* Step 3 Line */}
        <div 
          className={cn(
            "h-1 flex-1 rounded-full transition-colors cursor-pointer",
            currentStep >= 3 ? "bg-purple-600" : "bg-gray-200"
          )}
          onClick={() => currentStep > 3 && setStep(3)}
        />
      </div>
    </div>
  );
};

export function DoctorRegistrationForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: dropdownData = [], isLoading: isLoadingDropdowns } = useGetSuperDataQuery(undefined);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'male',
    doctorType: '',
    specialties: [],
    diseases: [],
    experience: '0',
    registrationNumber: '',
    clinicName: 'N/A',
    clinicAddress: 'N/A',
    state: 'N/A',
    city: 'N/A',
    pincode: '000000',
    physicalConsultationStartTime: '00:00',
    physicalConsultationEndTime: '00:00',
    assistantName: 'N/A',
    assistantContact: '0000000000',
    doctorAvailability: 'Online',
    workingWithHospital: false,
    videoConsultation: true,
    referredByCode: '',
  });

  const [step, setStep] = useState(1);
  const [createDoctor, { isLoading }] = useCreateDoctorMutation();
  
  const doctorTypes = [
    { name: "Physician", description: "Specializes in non-surgical medical care." },
    { name: "Surgeon", description: "Specializes in surgical procedures." }
  ];

  const allSpecialties = useMemo(() => dropdownData.filter((d: any) => d.type === 'specialization'), [dropdownData]);
  const allDiseases = useMemo(() => dropdownData.filter((d: any) => d.type === 'disease'), [dropdownData]);

  const filteredSpecialties = useMemo(() => {
    return formData.doctorType ? allSpecialties.filter((s: any) => s.doctorType === formData.doctorType) : [];
  }, [allSpecialties, formData.doctorType]);

  const filteredDiseases = useMemo(() => {
    const diseaseMap = new Map();
    if (formData.specialties.length > 0) {
      const selectedSpecialtyIds = formData.specialties;
      
      allDiseases.forEach((disease: any) => {
        if (selectedSpecialtyIds.includes(disease.parentId)) {
          const specialty = allSpecialties.find((s: any) => s._id === disease.parentId);
          if (specialty) {
            if (!diseaseMap.has(specialty.name)) {
              diseaseMap.set(specialty.name, []);
            }
            diseaseMap.get(specialty.name).push(disease);
          }
        }
      });
    }
    return Array.from(diseaseMap.entries());
  }, [allDiseases, allSpecialties, formData.specialties]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDoctorTypeChange = (typeName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData(prev => ({ ...prev, doctorType: typeName, specialties: [], diseases: [] }));
  };

  const handleSpecialtyChange = (specId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData(prev => {
      const newSpecialties = prev.specialties.includes(specId)
        ? prev.specialties.filter(id => id !== specId)
        : [...prev.specialties, specId];
      
      const validDiseases = prev.diseases.filter(diseaseId => {
        const disease = allDiseases.find((d: any) => d._id === diseaseId);
        return newSpecialties.includes(disease?.parentId);
      });

      return { ...prev, specialties: newSpecialties, diseases: validDiseases };
    });
  };

  const handleDiseaseChange = (diseaseId: string) => {
    setFormData(prev => ({
      ...prev,
      diseases: prev.diseases.includes(diseaseId)
        ? prev.diseases.filter(id => id !== diseaseId)
        : [...prev.diseases, diseaseId],
    }));
  };

  const preventSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Form submission prevented on step ${step}`);
    return false;
  };

  // Only handle actual form submission - never called for navigation
  const handleActualSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    
    const specialtyNames = formData.specialties.map(id => allSpecialties.find((s: any) => s._id === id)?.name).filter(Boolean);
    const diseaseNames = formData.diseases.map(id => allDiseases.find((d: any) => d._id === id)?.name).filter(Boolean);
    
    const submissionData = { ...formData, specialties: specialtyNames, diseases: diseaseNames };
    
    try {
      await createDoctor(submissionData).unwrap();
      toast.success(`Dr. ${formData.name}'s registration submitted successfully!`);
      onSuccess();
    } catch (err) {
      toast.error((err as any)?.data?.message || "Registration failed. Please try again.");
    }
  };

  // This should never be called, but exists as a safety net
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Unexpected form submission blocked on step ${step}`);
    return false;
  };

  // Enhanced navigation functions - completely separate from form submission
  const navigateToNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Step 1 validation
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        toast.error("Please fill all required fields.");
        return;
      }
    }
    
    // Step 2 validation
    if (step === 2) {
      if (!formData.doctorType) {
        toast.error("Please select a role.");
        return;
      }
    }
    
    // Only navigate to next step, never submit
    if (step < 3) {
      setStep(s => s + 1);
    }
  };

  const navigateToPrevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (step > 1) {
      setStep(s => s - 1);
    }
  };

  // Final step submit handler - only for actual submission
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (step === 3) {
      await handleActualSubmit();
    } else {
      console.log(`Final submit blocked - not on step 3, current step: ${step}`);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step < 3) {
      e.preventDefault();
      e.stopPropagation();
      console.log(`Input Enter key blocked on step ${step}`);
      return false;
    }
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-500">
            <div className="mb-4 sm:mb-6">
              <p className="text-base sm:text-lg text-gray-500 mb-2">Account setup</p>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Create your account</h1>
              <p className="text-gray-600 text-base sm:text-lg">Enter your personal details to get started.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
              <Input 
                name="name" 
                placeholder="Full Name" 
                onChange={handleChange} 
                value={formData.name}
                onKeyDown={handleInputKeyDown}
                className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg"
                required
              />
              <Input 
                name="registrationNumber" 
                placeholder="Registration Number" 
                onChange={handleChange} 
                value={formData.registrationNumber}
                onKeyDown={handleInputKeyDown}
                className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
              <Input 
                name="email" 
                type="email" 
                placeholder="Email Address" 
                onChange={handleChange} 
                value={formData.email}
                onKeyDown={handleInputKeyDown}
                className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg"
                required
              />
              <Input 
                name="phone" 
                type="tel" 
                placeholder="Phone Number" 
                onChange={handleChange} 
                value={formData.phone}
                onKeyDown={handleInputKeyDown}
                className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
              <Input 
                name="password" 
                type="password" 
                placeholder="Password (min. 8 characters)" 
                onChange={handleChange} 
                value={formData.password}
                onKeyDown={handleInputKeyDown}
                className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg"
                required
              />
              <Input 
                name="confirmPassword" 
                type="password" 
                placeholder="Confirm Password" 
                onChange={handleChange} 
                value={formData.confirmPassword}
                onKeyDown={handleInputKeyDown}
                className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg"
                required
              />
            </div>
            <Input 
              name="referredByCode" 
              placeholder="Referral Code (Optional)" 
              onChange={handleChange} 
              value={formData.referredByCode}
              onKeyDown={handleInputKeyDown}
              className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg"
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-2 sm:space-y-3 animate-in fade-in-50 duration-500">
            <div className="mb-1 sm:mb-2">
              <p className="text-base sm:text-lg text-gray-500 mb-2">Professional Details</p>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Tell us about your practice</h1>
              <p className="text-gray-600 text-base sm:text-lg">Provide information about your medical practice.</p>
            </div>
            
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">What describes you best?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
                {doctorTypes.map(type => (
                  <div 
                    key={type.name} 
                    onClick={(e) => handleDoctorTypeChange(type.name, e)} 
                    className={cn(
                      "cursor-pointer transition-all duration-200 text-center p-2 sm:p-3 h-full border rounded-lg",
                      formData.doctorType === type.name 
                        ? "border-purple-400 ring-2 ring-purple-100 bg-purple-50/50" 
                        : "border-gray-200 hover:border-purple-200 hover:bg-gray-50"
                    )}
                  >
                    <div className="text-purple-600 mb-1">
                      {type.name === 'Physician' ? 
                        <HeartPulse className="h-4 w-4 sm:h-6 sm:w-6 mx-auto" /> : 
                        <Stethoscope className="h-4 w-4 sm:h-6 sm:w-6 mx-auto" />
                      }
                    </div>
                    <h4 className="font-semibold text-xs sm:text-sm">{type.name}</h4>
                    <p className="text-xs text-gray-600 text-xs">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {formData.doctorType && (
              <div className="animate-in fade-in-50 duration-500">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Select your specialty/specialties</h3>
                {/* Added responsive classes for proper scrolling on mobile */}
                <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-h-64 sm:max-h-48">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 pr-2">
                  {isLoadingDropdowns ? 
                    [...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-16 sm:h-20 md:h-18 w-full" />
                    )) : (
                    filteredSpecialties.map((spec: any) => (
                      <div 
                        key={spec._id} 
                        onClick={(e) => handleSpecialtyChange(spec._id, e)} 
                        className={cn(
                          "p-2 sm:p-3 border rounded-lg cursor-pointer flex flex-col items-center justify-center text-center transition-all duration-200 h-16 sm:h-20 md:h-18",
                          formData.specialties.includes(spec._id) 
                            ? "border-purple-400 ring-2 ring-purple-100 bg-purple-50/50" 
                            : "border-gray-200 hover:border-purple-200 hover:bg-gray-50"
                        )}
                      >
                        <Microscope className="h-5 w-5 sm:h-7 sm:w-7 text-purple-600 mb-1" />
                        <span className="font-medium text-sm sm:text-base">{spec.name}</span>
                      </div>
                    ))
                  )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-500">
            <div className="mb-4 sm:mb-6">
              <p className="text-base sm:text-lg text-gray-500 mb-2">Specialization Details</p>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Your areas of expertise</h1>
              <p className="text-gray-600 text-base sm:text-lg">Select the diseases you specialize in treating.</p>
            </div>
            
            {filteredDiseases.length > 0 ? (
              filteredDiseases.map(([specialtyName, diseases]) => (
                <div key={specialtyName} className="space-y-2 sm:space-y-3">
                  <h4 className="text-lg sm:text-xl font-semibold">{specialtyName}</h4>
                  {/* Added responsive grid for diseases */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 border p-3 sm:p-4 rounded-md">
                    {diseases.map((disease: any) => (
                      <div key={disease._id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={disease._id} 
                          checked={formData.diseases.includes(disease._id)} 
                          onCheckedChange={() => handleDiseaseChange(disease._id)} 
                          className="h-3 w-3 sm:h-4 sm:w-4"
                        />
                        <Label 
                          htmlFor={disease._id} 
                          className="text-xs sm:text-sm font-normal cursor-pointer"
                        >
                          {disease.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm sm:text-base">
                No diseases found for selected specialties. You can add them later.
              </p>
            )}
          </div>
        );
      default: 
        return null;
    }
  };

  return (
    <>
      {/* Added responsive container with proper scrolling for mobile */}
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pt-2 overflow-y-auto max-h-[calc(100vh-20px)]">
        <div className="fixed top-4 sm:top-8 left-4 sm:left-10 right-4 sm:right-10 flex justify-between items-center z-20">
          <Button 
            type="button" 
            variant="outline" 
            onClick={step === 1 ? () => window.history.back() : navigateToPrevStep} 
            className="px-3 sm:px-4 py-2 text-base sm:text-lg text-gray-600 border-gray-300 hover:bg-gray-50 h-10 sm:h-auto"
          >
            ← {step === 1 ? 'Back to Role Selection' : 'Back'}
          </Button>
          {step < 3 ? (
            <Button 
              type="button" 
              onClick={navigateToNextStep} 
              className="bg-black text-white px-4 sm:px-6 py-2 rounded-md hover:bg-gray-800 font-medium text-base sm:text-lg h-10 sm:h-auto"
            >
              Continue →
            </Button>
          ) : (
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="bg-black text-white px-4 sm:px-6 py-2 rounded-md hover:bg-gray-800 font-medium text-base sm:text-lg h-10 sm:h-auto"
              form="registration-form"
            >
              {isLoading ? "Submitting..." : "Complete Registration"}
            </Button>
          )}
        </div>
        
        <div className="mt-16 sm:mt-8">
          <StepIndicator currentStep={step} setStep={setStep} />
        </div>
      
        <form id="registration-form" onSubmit={handleFinalSubmit} className="space-y-4 sm:space-y-6 pb-8 mt-4">
          {/* Added responsive container for form content */}
          <div className="flex flex-col justify-start" style={{ minHeight: 'calc(100vh - 200px)' }}>
            {renderStepContent()}
          </div>
        </form>
      </div>
    </>
  );
}

export const DoctorRegistrationFormWithSuspense = (props: { onSuccess: () => void }) => (
    <Suspense fallback={<div>Loading...</div>}>
        <DoctorRegistrationForm {...props} />
    </Suspense>
);