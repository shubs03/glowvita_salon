
"use client";

import React, { useState, useEffect, useMemo } from 'react';
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

const StepIndicator = ({ currentStep, setStep }) => {
    const steps = [
        { id: 1, name: 'Role', icon: User },
        { id: 2, name: 'Specialty', icon: Stethoscope },
        { id: 3, name: 'Disease Focus', icon: HeartPulse },
        { id: 4, name: 'Basic Details', icon: User },
    ];
    
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={cn("relative", stepIdx !== steps.length - 1 ? "flex-1" : "")}>
                        <div className="flex items-center">
                            <button 
                                onClick={() => step.id < currentStep && setStep(step.id)}
                                className={cn(
                                    "flex items-center text-sm font-medium",
                                    step.id < currentStep ? "cursor-pointer" : "cursor-default"
                                )}
                                disabled={step.id >= currentStep}
                            >
                                <span className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                                    currentStep > step.id ? "bg-primary hover:bg-primary/90 text-white" :
                                    currentStep === step.id ? "border-2 border-primary bg-primary/10 text-primary" :
                                    "border-2 border-gray-300 bg-background text-muted-foreground"
                                )}>
                                    {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                                </span>
                                <span className={cn(
                                    "ml-3 hidden font-medium text-muted-foreground md:inline",
                                    currentStep >= step.id && "text-foreground"
                                )}>
                                    {step.name}
                                </span>
                            </button>
                            {stepIdx !== steps.length - 1 && (
                                <div className="absolute right-0 top-4 -z-10 hidden h-0.5 w-full bg-gray-200 md:block" aria-hidden="true" />
                            )}
                        </div>
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
    clinicName: 'N/A',
    clinicAddress: 'N/A',
    state: 'N/A',
    city: 'N/A',
    pincode: '000000',
    registrationNumber: '',
    physicalConsultationStartTime: '00:00',
    physicalConsultationEndTime: '00:00',
    assistantName: 'N/A',
    assistantContact: '0000000000',
    doctorAvailability: 'Online',
    workingWithHospital: false,
    videoConsultation: false,
  });

  const [step, setStep] = useState(1);
  const [createDoctor, { isLoading }] = useCreateDoctorMutation();
  
  // Use a static array for the doctor types
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

  const handleDoctorTypeChange = (typeName: string) => {
    setFormData(prev => ({ ...prev, doctorType: typeName, specialties: [], diseases: [] }));
  };

  const handleSpecialtyChange = (specId: string) => {
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

  const handleDiseaseChange = (diseaseId: string) => {
    setFormData(prev => ({
      ...prev,
      diseases: prev.diseases.includes(diseaseId)
        ? prev.diseases.filter(id => id !== diseaseId)
        : [...prev.diseases, diseaseId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    
    const specialtyNames = formData.specialties.map(id => allSpecialties.find(s => s._id === id)?.name).filter(Boolean);
    const diseaseNames = formData.diseases.map(id => allDiseases.find(d => d._id === id)?.name).filter(Boolean);
    
    const submissionData = {
      ...formData,
      specialties: specialtyNames,
      diseases: diseaseNames,
    };
    
    try {
      await createDoctor(submissionData).unwrap();
      toast.success("Doctor registration submitted successfully!");
      onSuccess();
    } catch (err) {
      toast.error(err?.data?.message || "Registration failed. Please try again.");
    }
  };

  const nextStep = () => {
    if(step === 1 && !formData.doctorType) return toast.error("Please select a role.");
    if(step === 2 && formData.specialties.length === 0) return toast.error("Please select at least one specialty.");
    setStep(s => s + 1);
  };
  const prevStep = () => setStep(s => s - 1);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Doctor Registration</CardTitle>
        <CardDescription>Join our platform as a healthcare professional.</CardDescription>
        <div className="pt-4">
          <StepIndicator currentStep={step} setStep={setStep} />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in-50 duration-500">
              <h3 className="font-semibold text-lg text-center">What describes you best?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {doctorTypes.map(type => (
                  <Card
                    key={type.name}
                    onClick={() => handleDoctorTypeChange(type.name)}
                    className={cn(
                      "cursor-pointer transition-all duration-200 text-center p-6",
                      formData.doctorType === type.name 
                        ? "border-primary ring-2 ring-primary bg-primary/5" 
                        : "hover:border-primary/50 hover:bg-secondary/50"
                    )}
                  >
                    <div className="text-primary mb-3">
                      {type.name === 'Physician' ? <HeartPulse className="h-10 w-10 mx-auto" /> : <Stethoscope className="h-10 w-10 mx-auto" />}
                    </div>
                    <h4 className="font-bold text-lg">{type.name}</h4>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in-50 duration-500">
              <h3 className="font-semibold text-lg text-center">Select your specialty/specialties</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {isLoadingDropdowns ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />) : (
                  filteredSpecialties.map(spec => (
                    <div
                      key={spec._id}
                      onClick={() => handleSpecialtyChange(spec._id)}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer flex flex-col items-center justify-center text-center transition-all duration-200",
                        formData.specialties.includes(spec._id)
                          ? "border-primary ring-2 ring-primary bg-primary/5"
                          : "hover:border-primary/50 hover:bg-secondary/50"
                      )}
                    >
                      <Bone className="h-8 w-8 text-primary mb-2" />
                      <span className="font-medium text-sm">{spec.name}</span>
                    </div>
                  ))
                 )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <h3 className="font-semibold text-lg text-center">Which diseases do you specialize in?</h3>
              {filteredDiseases.length > 0 ? filteredDiseases.map(([specialtyName, diseases]) => (
                <div key={specialtyName}>
                  <h4 className="font-semibold mb-2">{specialtyName}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border p-4 rounded-md">
                    {diseases.map(disease => (
                      <div key={disease._id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={disease._id}
                          checked={formData.diseases.includes(disease._id)}
                          onCheckedChange={(checked) => handleDiseaseChange(disease._id, !!checked)}
                        />
                        <Label htmlFor={disease._id} className="text-sm font-normal">{disease.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground">No diseases found for selected specialties. You can add them later.</p>
              )}
            </div>
          )}

          {step === 4 && (
             <div className="space-y-4 animate-in fade-in-50 duration-500 max-w-2xl mx-auto">
              <h3 className="font-semibold text-lg text-center">Finally, a few basic details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="name" placeholder="Full Name" onChange={handleChange} required />
                <Input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="phone" type="tel" placeholder="Phone Number" onChange={handleChange} required />
                <Input name="experience" type="number" placeholder="Years of Experience" onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input name="registrationNumber" placeholder="Registration Number" onChange={handleChange} required />
                  <Input name="gender" placeholder="Gender" onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                <Input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t mt-8">
            <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            {step < 4 && (
              <Button type="button" onClick={nextStep}>
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {step === 4 && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
