"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { toast } from 'sonner';
import { useCreateDoctorMutation, useGetSuperDataQuery } from '@repo/store/api';
import { Label } from '@repo/ui/label';
import { Checkbox } from '@repo/ui/checkbox';
import { Skeleton } from '@repo/ui/skeleton';
import { CheckCircle, Stethoscope, User, HeartPulse, Bone, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@repo/ui/cn';

const StepIndicator = ({ currentStep }) => {
    const steps = [
        { id: 1, name: 'Create Account', icon: User },
        { id: 2, name: 'Role & Specialty', icon: Stethoscope },
        { id: 3, name: 'Disease Focus', icon: HeartPulse },
    ];
    
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={cn("relative", stepIdx !== steps.length - 1 ? "flex-1" : "")}>
                        <div className="flex items-center">
                            <span 
                                className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                                    currentStep > step.id ? "bg-primary text-white" :
                                    currentStep === step.id ? "border-2 border-primary bg-primary/10 text-primary" :
                                    "border-2 border-gray-300 bg-background text-muted-foreground"
                                )}
                            >
                                {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
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

export function DoctorRegistrationForm({ onSuccess }) {
  const { data: dropdownData = [], isLoading: isLoadingDropdowns } = useGetSuperDataQuery(undefined);
  
  const [formData, setFormData] = useState({
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

  const allSpecialties = useMemo(() => dropdownData.filter(d => d.type === 'specialization'), [dropdownData]);
  const allDiseases = useMemo(() => dropdownData.filter(d => d.type === 'disease'), [dropdownData]);

  const filteredSpecialties = useMemo(() => {
    return formData.doctorType ? allSpecialties.filter(s => s.doctorType === formData.doctorType) : [];
  }, [allSpecialties, formData.doctorType]);

  const filteredDiseases = useMemo(() => {
    const diseaseMap = new Map();
    if (formData.specialties.length > 0) {
      const selectedSpecialtyIds = formData.specialties;
      
      allDiseases.forEach(disease => {
        if (selectedSpecialtyIds.includes(disease.parentId)) {
          const specialty = allSpecialties.find(s => s._id === disease.parentId);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDoctorTypeChange = (typeName, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData(prev => ({ ...prev, doctorType: typeName, specialties: [], diseases: [] }));
  };

  const handleSpecialtyChange = (specId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData(prev => {
      const newSpecialties = prev.specialties.includes(specId)
        ? prev.specialties.filter(id => id !== specId)
        : [...prev.specialties, specId];
      
      const validDiseases = prev.diseases.filter(diseaseId => {
        const disease = allDiseases.find(d => d._id === diseaseId);
        return newSpecialties.includes(disease?.parentId);
      });

      return { ...prev, specialties: newSpecialties, diseases: validDiseases };
    });
  };

  const handleDiseaseChange = (diseaseId) => {
    setFormData(prev => ({
      ...prev,
      diseases: prev.diseases.includes(diseaseId)
        ? prev.diseases.filter(id => id !== diseaseId)
        : [...prev.diseases, diseaseId],
    }));
  };

  const preventSubmission = (e) => {
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
    
    const specialtyNames = formData.specialties.map(id => allSpecialties.find(s => s._id === id)?.name).filter(Boolean);
    const diseaseNames = formData.diseases.map(id => allDiseases.find(d => d._id === id)?.name).filter(Boolean);
    
    const submissionData = { ...formData, specialties: specialtyNames, diseases: diseaseNames };
    
    try {
      await createDoctor(submissionData).unwrap();
      toast.success("Doctor registration submitted successfully!");
      onSuccess();
    } catch (err) {
      toast.error(err?.data?.message || "Registration failed. Please try again.");
    }
  };

  // This should never be called, but exists as a safety net
  const handleFormSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Unexpected form submission blocked on step ${step}`);
    return false;
  };

  // Enhanced navigation functions - completely separate from form submission
  const navigateToNextStep = (e) => {
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

  const navigateToPrevStep = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (step > 1) {
      setStep(s => s - 1);
    }
  };

  // Final step submit handler - only for actual submission
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (step === 3) {
      await handleActualSubmit();
    } else {
      console.log(`Final submit blocked - not on step 3, current step: ${step}`);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && step < 3) {
      e.preventDefault();
      e.stopPropagation();
      console.log(`Input Enter key blocked on step ${step}`);
      return false;
    }
  };

  const handleKeyDown = (e) => {
    // Prevent Enter key from submitting form on steps 1 and 2
    if (e.key === 'Enter' && step < 3) {
      e.preventDefault();
      e.stopPropagation();
      console.log(`Enter key blocked on step ${step}`);
      return false;
    }
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in-50 duration-500 max-w-lg mx-auto">
            <h3 className="font-semibold text-lg text-center">Create Your Doctor Account</h3>
            <Input name="name" placeholder="Full Name" onChange={handleChange} onKeyDown={handleInputKeyDown} />
            <Input name="email" type="email" placeholder="Email Address" onChange={handleChange} onKeyDown={handleInputKeyDown} />
            <Input name="phone" type="tel" placeholder="Phone Number" onChange={handleChange} onKeyDown={handleInputKeyDown} />
            <Input name="registrationNumber" placeholder="Registration Number" onChange={handleChange} onKeyDown={handleInputKeyDown} />
            <Input name="password" type="password" placeholder="Password" onChange={handleChange} onKeyDown={handleInputKeyDown} />
            <Input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} onKeyDown={handleInputKeyDown} />
            <Input name="referredByCode" placeholder="Referral Code (Optional)" onChange={handleChange} onKeyDown={handleInputKeyDown} />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div>
              <h3 className="font-semibold text-lg text-center mb-4">What describes you best?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {doctorTypes.map(type => (
                  <Card key={type.name} onClick={(e) => handleDoctorTypeChange(type.name, e)} className={cn("cursor-pointer transition-all duration-200 text-center p-6", formData.doctorType === type.name ? "border-primary ring-2 ring-primary bg-primary/5" : "hover:border-primary/50 hover:bg-secondary/50")}>
                    <div className="text-primary mb-3">{type.name === 'Physician' ? <HeartPulse className="h-10 w-10 mx-auto" /> : <Stethoscope className="h-10 w-10 mx-auto" />}</div>
                    <h4 className="font-bold text-lg">{type.name}</h4>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </Card>
                ))}
              </div>
            </div>
            {formData.doctorType && (
              <div className="animate-in fade-in-50 duration-500">
                <h3 className="font-semibold text-lg text-center mb-4">Select your specialty/specialties</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {isLoadingDropdowns ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />) : (
                    filteredSpecialties.map(spec => (
                      <div key={spec._id} onClick={(e) => handleSpecialtyChange(spec._id, e)} className={cn("p-4 border rounded-lg cursor-pointer flex flex-col items-center justify-center text-center transition-all duration-200", formData.specialties.includes(spec._id) ? "border-primary ring-2 ring-primary bg-primary/5" : "hover:border-primary/50 hover:bg-secondary/50")}>
                        <Bone className="h-8 w-8 text-primary mb-2" />
                        <span className="font-medium text-sm">{spec.name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            <h3 className="font-semibold text-lg text-center">Which diseases do you specialize in?</h3>
            {filteredDiseases.length > 0 ? filteredDiseases.map(([specialtyName, diseases]) => (
              <div key={specialtyName}>
                <h4 className="font-semibold mb-2">{specialtyName}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border p-4 rounded-md">
                  {diseases.map(disease => (
                    <div key={disease._id} className="flex items-center space-x-2">
                      <Checkbox id={disease._id} checked={formData.diseases.includes(disease._id)} onCheckedChange={() => handleDiseaseChange(disease._id)} />
                      <Label htmlFor={disease._id} className="text-sm font-normal">{disease.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground">No diseases found for selected specialties. You can add them later.</p>
            )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-background/70 backdrop-blur-sm border-white/20 shadow-2xl shadow-blue-500/10 p-8 rounded-lg">
        <div className="mb-8">
          <StepIndicator currentStep={step} />
        </div>
        
        {/* Navigation steps (1 & 2) - NO form element */}
        {step < 3 ? (
          <div onKeyDown={handleKeyDown} className="space-y-6">
            {renderStepContent()}
            <div className="flex justify-between pt-6 border-t mt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={navigateToPrevStep} 
                disabled={step === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <Button 
                type="button" 
                onClick={navigateToNextStep}
              >
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          /* Final step (3) - ONLY here we use form element */
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            {renderStepContent()}
            <div className="flex justify-between pt-6 border-t mt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={navigateToPrevStep}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export const DoctorRegistrationFormWithSuspense = (props) => (
    <Suspense fallback={<div>Loading...</div>}>
        <DoctorRegistrationForm {...props} />
    </Suspense>
)
