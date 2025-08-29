
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { toast } from 'sonner';
import { useCreateDoctorMutation, useGetSuperDataQuery } from '@repo/store/api';
import { Label } from '@repo/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Checkbox } from '@repo/ui/checkbox';

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
    registrationNumber: 'TEMP-REG-12345',
    physicalConsultationStartTime: '00:00',
    physicalConsultationEndTime: '00:00',
    assistantName: 'N/A',
    assistantContact: '0000000000',
    doctorAvailability: 'Online',
    workingWithHospital: false,
    videoConsultation: false,
  });
  
  const [createDoctor, { isLoading }] = useCreateDoctorMutation();

  const doctorTypes = dropdownData.filter(d => d.type === 'doctorType');
  const allSpecialties = dropdownData.filter(d => d.type === 'specialization');
  const allDiseases = dropdownData.filter(d => d.type === 'disease');

  const filteredSpecialties = allSpecialties.filter(s => s.parentId === formData.doctorType);
  const filteredDiseases = allDiseases.filter(d => formData.specialties.includes(d.parentId));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDoctorTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, doctorType: value, specialties: [], diseases: [] }));
  };
  
  const handleSpecialtyChange = (specialtyId: string, checked: boolean) => {
    setFormData(prev => {
        const currentSpecialties = prev.specialties || [];
        const newSpecialties = checked 
            ? [...currentSpecialties, specialtyId]
            : currentSpecialties.filter(id => id !== specialtyId);
        
        // Remove diseases that are no longer relevant
        const relevantDiseases = prev.diseases.filter(diseaseId => {
            const disease = allDiseases.find(d => d._id === diseaseId);
            return newSpecialties.includes(disease?.parentId);
        });

        return { ...prev, specialties: newSpecialties, diseases: relevantDiseases };
    });
  };
  
  const handleDiseaseChange = (diseaseId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      diseases: checked
        ? [...prev.diseases, diseaseId]
        : prev.diseases.filter(id => id !== diseaseId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    
    // Prepare data for submission, converting IDs to names
    const specialtyNames = formData.specialties.map(id => allSpecialties.find(s => s._id === id)?.name).filter(Boolean);
    const diseaseNames = formData.diseases.map(id => allDiseases.find(d => d._id === id)?.name).filter(Boolean);
    const doctorTypeName = doctorTypes.find(dt => dt._id === formData.doctorType)?.name;

    const submissionData = {
      ...formData,
      doctorType: doctorTypeName,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doctor Registration</CardTitle>
        <CardDescription>Join our platform as a healthcare professional.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="name" placeholder="Full Name" onChange={handleChange} required />
          <Input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
          <Input name="phone" type="tel" placeholder="Phone Number" onChange={handleChange} required />
          <Input name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <Input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />
          
          <div className="space-y-2">
            <Label>What describes you best?</Label>
            <Select onValueChange={handleDoctorTypeChange} value={formData.doctorType}>
                <SelectTrigger>
                    <SelectValue placeholder="Select your primary role" />
                </SelectTrigger>
                <SelectContent>
                {doctorTypes.map(type => (
                    <SelectItem key={type._id} value={type._id}>{type.name}</SelectItem>
                ))}
                </SelectContent>
            </Select>
          </div>

          {formData.doctorType && (
            <div className="space-y-2">
                <Label>Specialties</Label>
                <div className="p-4 border rounded-md max-h-40 overflow-y-auto space-y-2">
                    {filteredSpecialties.length > 0 ? filteredSpecialties.map(spec => (
                        <div key={spec._id} className="flex items-center space-x-2">
                            <Checkbox 
                                id={spec._id} 
                                checked={formData.specialties.includes(spec._id)}
                                onCheckedChange={(checked) => handleSpecialtyChange(spec._id, !!checked)}
                            />
                            <Label htmlFor={spec._id}>{spec.name}</Label>
                        </div>
                    )) : <p className="text-sm text-muted-foreground">No specialties found for this type.</p>}
                </div>
            </div>
          )}

          {formData.specialties.length > 0 && (
             <div className="space-y-2">
                <Label>Diseases Treated (Select all that apply)</Label>
                 <div className="p-4 border rounded-md max-h-40 overflow-y-auto space-y-2">
                    {filteredDiseases.length > 0 ? filteredDiseases.map(disease => (
                         <div key={disease._id} className="flex items-center space-x-2">
                            <Checkbox 
                                id={disease._id} 
                                checked={formData.diseases.includes(disease._id)}
                                onCheckedChange={(checked) => handleDiseaseChange(disease._id, !!checked)}
                            />
                            <Label htmlFor={disease._id}>{disease.name}</Label>
                        </div>
                    )) : <p className="text-sm text-muted-foreground">No diseases found for selected specialties.</p>}
                </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || isLoadingDropdowns}>
            {isLoading ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
