"use client";

import { useState, useEffect } from 'react';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { User, Users, Phone, Activity, Stethoscope, CheckCircle, Star, MapPin, DollarSign } from "lucide-react";
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
    
    // Get doctor info preview based on specialty
    const doctorPreviews: { [key: string]: { name: string; rating: number; reviews: number; clinic: string } } = {
      'General Medicine': { name: 'Dr. Sarah Johnson', rating: 4.8, reviews: 234, clinic: 'City Medical Center' },
      'Cardiology': { name: 'Dr. Michael Chen', rating: 4.9, reviews: 189, clinic: 'Heart Care Clinic' },
      'Dermatology': { name: 'Dr. Emily Rodriguez', rating: 4.7, reviews: 156, clinic: 'Skin Care Clinic' },
      'Neurology': { name: 'Dr. David Thompson', rating: 4.9, reviews: 201, clinic: 'Neuro Wellness Center' },
      'Orthopedics': { name: 'Dr. Lisa Wang', rating: 4.8, reviews: 178, clinic: 'Bone & Joint Clinic' },
      'Psychiatry': { name: 'Dr. James Wilson', rating: 4.6, reviews: 145, clinic: 'Mental Wellness Center' },
      'Gastroenterology': { name: 'Dr. Maria Garcia', rating: 4.8, reviews: 167, clinic: 'Digestive Health Center' },
      'Pulmonology': { name: 'Dr. Robert Kim', rating: 4.7, reviews: 142, clinic: 'Respiratory Care Clinic' },
      'Endocrinology': { name: 'Dr. Jennifer Brown', rating: 4.9, reviews: 198, clinic: 'Hormone Health Clinic' },
      'Rheumatology': { name: 'Dr. Andrew Davis', rating: 4.7, reviews: 134, clinic: 'Arthritis Care Center' }
    };
    
    const doctorPreview = doctorPreviews[specialty] || doctorPreviews['General Medicine'];
    
    onUpdate({ 
      selectedSpecialty: specialty,
      doctorName: doctorPreview.name,
      doctorSpecialty: specialty,
      doctorRating: doctorPreview.rating,
      doctorReviewCount: doctorPreview.reviews,
      doctorClinic: doctorPreview.clinic
    });
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

      {/* Consultation Type - Horizontal Selection */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Who is this consultation for?
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => onUpdate({ consultationType: 'self' })}
              className={cn(
                "flex items-center p-4 rounded-lg border-2 transition-all text-left",
                data.consultationType === 'self'
                  ? "border-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              <User className="mr-3 h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-semibold text-sm">For myself</div>
                <div className="text-xs text-muted-foreground">Book for yourself</div>
              </div>
            </button>
            <button
              onClick={() => onUpdate({ consultationType: 'other' })}
              className={cn(
                "flex items-center p-4 rounded-lg border-2 transition-all text-left",
                data.consultationType === 'other'
                  ? "border-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              <Users className="mr-3 h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-semibold text-sm">For someone else</div>
                <div className="text-xs text-muted-foreground">Book for family member</div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Patient Details */}
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Patient Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div>
                <Label htmlFor="patientName" className="text-sm font-medium">Patient Name *</Label>
                <Input
                  id="patientName"
                  placeholder="Enter patient's full name"
                  value={data.patientName}
                  onChange={(e) => onUpdate({ patientName: e.target.value })}
                  className="mt-1.5 h-10 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number *</Label>
                <div className="flex mt-1.5">
                  <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 border-input rounded-l-md">
                    +91
                  </span>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={data.phoneNumber}
                    onChange={(e) => onUpdate({ phoneNumber: e.target.value })}
                    className="rounded-l-none h-10 text-sm"
                    pattern="[0-9]{10}"
                    maxLength={10}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Preview Card - shows when specialty is selected */}
          {selectedSpecialty && data.doctorName && (
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Your Assigned Doctor
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-2 border-b">
                    <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{data.doctorName}</p>
                      <p className="text-xs text-muted-foreground">{data.doctorSpecialty}</p>
                    </div>
                  </div>
                  
                  {data.doctorRating && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Rating</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm">{data.doctorRating}</span>
                        <span className="text-xs text-muted-foreground">({data.doctorReviewCount})</span>
                      </div>
                    </div>
                  )}
                  
                  {data.doctorClinic && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Clinic</span>
                      </div>
                      <span className="font-semibold text-sm text-right">{data.doctorClinic}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Fee</span>
                    </div>
                    <span className="font-bold text-sm">₹{data.consultationFee}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Health Concerns */}
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Health Concerns *
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {/* Concerns Text Input */}
              <div className="space-y-2">
                <Label htmlFor="concerns" className="text-sm font-medium">Describe your symptoms</Label>
                <textarea
                  id="concerns"
                  placeholder="E.g., fever, headache, stomach pain, etc."
                  value={data.concerns}
                  onChange={(e) => handleConcernsChange(e.target.value)}
                  className="w-full min-h-[100px] p-3 text-sm border border-input rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Specialty Suggestions */}
              {showSpecialtySelection && (
                <div className="space-y-3 p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Recommended Specialties</Label>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedSpecialties.map((specialty) => (
                      <button
                        key={specialty}
                        onClick={() => handleSpecialtySelect(specialty)}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-lg border-2 transition-all text-left",
                          selectedSpecialty === specialty
                            ? "border-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full border-2",
                            selectedSpecialty === specialty
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          )} />
                          <span className="text-sm font-medium">{specialty}</span>
                        </div>
                        {selectedSpecialty === specialty && (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Selected Specialty Indicator */}
                  {selectedSpecialty && (
                    <div className="flex items-center gap-2 p-2 rounded-lg border">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium">
                        Connected with {selectedSpecialty} specialist
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground border-t pt-2">
                    <p>AI-matched specialties based on your symptoms</p>
                  </div>

                  {/* Manual Specialty Selection */}
                  <div className="border-t pt-3">
                    <Label className="text-xs font-medium mb-2 block">
                      Other specialties:
                    </Label>
                    <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
                      {ALL_SPECIALTIES
                        .filter(specialty => !suggestedSpecialties.includes(specialty))
                        .map((specialty) => (
                          <button
                            key={specialty}
                            onClick={() => handleSpecialtySelect(specialty)}
                            className={cn(
                              "p-1.5 rounded border text-xs text-left transition-all",
                              selectedSpecialty === specialty
                                ? "border-primary"
                                : "border-border hover:border-primary/50"
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