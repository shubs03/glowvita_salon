"use client";

import { useState, useEffect } from 'react';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { User, Users, Phone, Activity, Stethoscope, CheckCircle } from "lucide-react";
import { cn } from '@repo/ui/cn';
import { ConsultationData } from '../page';

interface BasicInfoStepProps {
  data: ConsultationData;
  onUpdate: (updates: Partial<ConsultationData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

// Specialty mapping based on concerns
const SPECIALTY_MAPPING: { [key: string]: string[] } = {
  "fever": ["General Medicine", "Internal Medicine", "Family Medicine"],
  "headache": ["Neurology", "General Medicine", "Pain Management"],
  "migraine": ["Neurology", "Pain Management"],
  "cold": ["ENT", "General Medicine", "Pulmonology"],
  "cough": ["Pulmonology", "ENT", "General Medicine"],
  "stomach": ["Gastroenterology", "General Medicine", "Internal Medicine"],
  "pain": ["Pain Management", "Orthopedics", "General Medicine"],
  "back": ["Orthopedics", "Pain Management", "Neurology"],
  "skin": ["Dermatology", "Allergy & Immunology"],
  "rash": ["Dermatology", "Allergy & Immunology"],
  "allergies": ["Allergy & Immunology", "Dermatology", "Pulmonology"],
  "diabetes": ["Endocrinology", "Internal Medicine", "Family Medicine"],
  "blood pressure": ["Cardiology", "Internal Medicine", "Nephrology"],
  "hypertension": ["Cardiology", "Internal Medicine", "Nephrology"],
  "anxiety": ["Psychiatry", "Psychology", "General Medicine"],
  "depression": ["Psychiatry", "Psychology", "General Medicine"],
  "arthritis": ["Rheumatology", "Orthopedics", "Pain Management"],
  "asthma": ["Pulmonology", "Allergy & Immunology", "General Medicine"],
  "heart": ["Cardiology", "Internal Medicine"],
  "breathing": ["Pulmonology", "Cardiology", "General Medicine"],
  "digestive": ["Gastroenterology", "General Medicine"],
  "respiratory": ["Pulmonology", "ENT", "General Medicine"],
  "mental": ["Psychiatry", "Psychology"],
  "bone": ["Orthopedics", "Rheumatology"],
  "joint": ["Rheumatology", "Orthopedics"],
  "eye": ["Ophthalmology"],
  "vision": ["Ophthalmology"],
  "ear": ["ENT"],
  "throat": ["ENT"],
  "nose": ["ENT"]
};

const ALL_SPECIALTIES = [
  "General Medicine", "Internal Medicine", "Family Medicine", "Cardiology",
  "Dermatology", "Neurology", "Orthopedics", "Psychiatry", "Psychology",
  "Gastroenterology", "Pulmonology", "Endocrinology", "Rheumatology",
  "ENT", "Ophthalmology", "Pain Management", "Allergy & Immunology",
  "Nephrology", "Emergency Medicine", "Pediatrics"
];

export function BasicInfoStep({ data, onUpdate, currentStep, setCurrentStep }: BasicInfoStepProps) {
  const [suggestedSpecialties, setSuggestedSpecialties] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(data.selectedSpecialty || '');
  const [showSpecialtySelection, setShowSpecialtySelection] = useState(false);

  // Initialize specialty suggestions on component mount if concerns already exist
  useEffect(() => {
    if (data.concerns.trim()) {
      updateSpecialtySuggestions(data.concerns);
    }
  }, []);

  const handleConcernsChange = (concerns: string) => {
    onUpdate({ concerns });
    updateSpecialtySuggestions(concerns);
  };

  const updateSpecialtySuggestions = (concernsText: string) => {
    if (!concernsText.trim()) {
      setSuggestedSpecialties([]);
      setShowSpecialtySelection(false);
      return;
    }

    const concernsLower = concernsText.toLowerCase();
    const suggestedSet = new Set<string>();

    // Check each word in the concerns against the specialty mapping
    Object.entries(SPECIALTY_MAPPING).forEach(([keyword, specialties]) => {
      if (concernsLower.includes(keyword)) {
        specialties.forEach(specialty => suggestedSet.add(specialty));
      }
    });

    const suggestions = Array.from(suggestedSet).slice(0, 5); // Limit to 5 suggestions
    setSuggestedSpecialties(suggestions);
    setShowSpecialtySelection(suggestions.length > 0);
  };

  const handleSpecialtySelect = (specialty: string) => {
    setSelectedSpecialty(specialty);
    onUpdate({ selectedSpecialty: specialty });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-primary/10 rounded-full text-primary">
            <Stethoscope className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Basic Information</h2>
            <p className="text-lg text-muted-foreground mt-1">
              Let's start with your details and health concerns
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Consultation Type */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Users className="h-6 w-6 text-primary" />
                Who is this consultation for?
              </CardTitle>
              <p className="text-muted-foreground mt-2">Choose whether you're booking for yourself or someone else</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <button
                  onClick={() => onUpdate({ consultationType: 'self' })}
                  className={cn(
                    "w-full flex items-center p-6 rounded-xl border-2 transition-all text-left hover:shadow-md",
                    data.consultationType === 'self'
                      ? "border-primary bg-primary/10 text-primary shadow-lg"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <User className="mr-4 h-6 w-6" />
                  <div>
                    <div className="font-semibold text-lg">For myself</div>
                    <div className="text-sm text-muted-foreground">Book consultation for yourself</div>
                  </div>
                </button>
                <button
                  onClick={() => onUpdate({ consultationType: 'other' })}
                  className={cn(
                    "w-full flex items-center p-6 rounded-xl border-2 transition-all text-left hover:shadow-md",
                    data.consultationType === 'other'
                      ? "border-primary bg-primary/10 text-primary shadow-lg"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Users className="mr-4 h-6 w-6" />
                  <div>
                    <div className="font-semibold text-lg">For someone else</div>
                    <div className="text-sm text-muted-foreground">Book consultation for family member</div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Patient Details */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <User className="h-6 w-6 text-primary" />
                Patient Details
              </CardTitle>
              <p className="text-muted-foreground mt-2">Provide the patient's basic information</p>
            </CardHeader>
            <CardContent className="pt-0 space-y-6">
              <div>
                <Label htmlFor="patientName" className="text-base font-medium">Patient Name *</Label>
                <Input
                  id="patientName"
                  placeholder="Enter patient's full name"
                  value={data.patientName}
                  onChange={(e) => onUpdate({ patientName: e.target.value })}
                  className="mt-2 h-12 text-base"
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber" className="text-base font-medium">Phone Number *</Label>
                <div className="flex mt-2">
                  <span className="inline-flex items-center px-4 text-base text-muted-foreground bg-muted border border-r-0 border-input rounded-l-md">
                    +91
                  </span>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    value={data.phoneNumber}
                    onChange={(e) => onUpdate({ phoneNumber: e.target.value })}
                    className="rounded-l-none h-12 text-base"
                    pattern="[0-9]{10}"
                    maxLength={10}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Health Concerns */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Activity className="h-6 w-6 text-primary" />
                Health Concerns *
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Describe your symptoms, conditions, or health concerns
              </p>
            </CardHeader>
            <CardContent className="pt-0 space-y-6">
              {/* Concerns Text Input */}
              <div className="space-y-3">
                <Label htmlFor="concerns" className="text-base font-medium">Your Health Concerns</Label>
                <textarea
                  id="concerns"
                  placeholder="Describe your symptoms, conditions, or health concerns (e.g., fever, headache, stomach pain, etc.)"
                  value={data.concerns}
                  onChange={(e) => handleConcernsChange(e.target.value)}
                  className="w-full min-h-[120px] p-4 text-base border border-input rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Specialty Suggestions */}
              {showSpecialtySelection && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <Label className="text-base font-medium text-blue-900">Recommended Specialties</Label>
                      <p className="text-sm text-blue-700">Based on your concerns, these specialists can help you best</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedSpecialties.map((specialty) => (
                      <button
                        key={specialty}
                        onClick={() => handleSpecialtySelect(specialty)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left hover:shadow-md",
                          selectedSpecialty === specialty
                            ? "border-blue-500 bg-blue-100 text-blue-900"
                            : "border-blue-200 bg-white hover:border-blue-400"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-3 h-3 rounded-full border-2",
                            selectedSpecialty === specialty
                              ? "bg-blue-500 border-blue-500"
                              : "border-blue-300"
                          )} />
                          <span className="font-medium">{specialty}</span>
                        </div>
                        {selectedSpecialty === specialty && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Selected Specialty Indicator */}
                  {selectedSpecialty && (
                    <div className="flex items-center gap-2 p-3 bg-blue-100 rounded-lg border border-blue-300">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <div>
                        <span className="font-medium">
                          You'll be connected with a {selectedSpecialty} specialist
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-blue-600">
                    <p className="font-medium mb-1">Why these specialties?</p>
                    <p>Our AI analyzed your symptoms and matched them with the most relevant medical specialties to ensure you get the best care.</p>
                  </div>

                  {/* Manual Specialty Selection */}
                  <div className="border-t border-blue-200 pt-3">
                    <Label className="text-sm font-medium text-blue-900 mb-2 block">
                      Don't see the right specialty? Choose manually:
                    </Label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {ALL_SPECIALTIES
                        .filter(specialty => !suggestedSpecialties.includes(specialty))
                        .map((specialty) => (
                          <button
                            key={specialty}
                            onClick={() => handleSpecialtySelect(specialty)}
                            className={cn(
                              "p-2 rounded border text-xs text-left transition-all",
                              selectedSpecialty === specialty
                                ? "border-blue-500 bg-blue-100 text-blue-900"
                                : "border-gray-200 hover:border-blue-300 text-gray-700"
                            )}
                          >
                            {specialty}
                          </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}