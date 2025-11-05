"use client";

import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { User, FileText } from "lucide-react";
import { ConsultationData } from '../page';

interface BasicInfoStepProps {
  data: ConsultationData;
  onUpdate: (updates: Partial<ConsultationData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export function BasicInfoStep({ data, onUpdate }: BasicInfoStepProps) {
  return (
    <div className="w-full">
      {/* Simplified Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Basic Details</h2>
            <p className="text-muted-foreground">Provide your personal information and reason for consultation</p>
          </div>
        </div>
      </div>

      {/* 2-Column Layout with improved spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Personal Information */}
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              <p className="text-sm text-muted-foreground">Provide your basic details</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="patientName" className="text-base">Full Name *</Label>
                <Input
                  id="patientName"
                  placeholder="Enter your full name"
                  value={data.patientName}
                  onChange={(e) => onUpdate({ patientName: e.target.value })}
                  className="h-12 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-base">Phone Number *</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-base text-muted-foreground bg-muted border border-r-0 border-input rounded-l-md">
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

        {/* Right Column - Consultation Details */}
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-primary" />
                Consultation Details
              </CardTitle>
              <p className="text-sm text-muted-foreground">Describe your reason for consultation</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="concerns" className="text-base">Reason for Consultation *</Label>
                <textarea
                  id="concerns"
                  placeholder="Describe your symptoms, conditions, or reason for consulting the doctor..."
                  value={data.concerns}
                  onChange={(e) => onUpdate({ concerns: e.target.value })}
                  className="w-full min-h-[180px] p-4 text-base border border-input rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground">
                  Please provide as much detail as possible to help the doctor prepare for your consultation
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Summary Card */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Consultation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor</span>
                <span className="font-medium">{data.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Specialty</span>
                <span className="font-medium">{data.doctorSpecialty}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Consultation Fee</span>
                <span className="font-bold text-lg">₹{data.consultationFee}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
