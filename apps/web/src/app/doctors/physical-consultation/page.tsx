"use client";

import { useState } from 'react';
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Calendar, User, Clock, CheckCircle, Home, Eye, ChevronRight } from "lucide-react";
import { cn } from '@repo/ui/cn';
import { TimeSlotSelection, BasicDetailsForm, NotificationConfirmation, AppointmentConfirmation } from './components';

// Types for our consultation data
export type ConsultationData = {
  // Time Slot Selection
  selectedDate?: string;
  selectedTime?: string;
  selectedDoctorId?: string;
  selectedDoctorName?: string;
  selectedDoctorSpecialty?: string;
  consultationFee?: number;
  doctorImage?: string;
  doctorRating?: number;
  doctorReviewCount?: number;
  doctorClinic?: string;
  doctorAddress?: string;
  
  // Basic Details
  patientName: string;
  phoneNumber: string;
  email?: string;
  reason: string;
  
  // Notification Preferences
  whatsappNotifications: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  
  // Confirmation
  appointmentId?: string;
};

// Breadcrumb Navigation Component (matching video consultation style)
const Breadcrumb = ({ currentStep, setCurrentStep }: { currentStep: number; setCurrentStep: (step: number) => void; }) => {
  const steps = ['Select Time Slot', 'Basic Details', 'Notifications', 'Confirmation'];
  return (
    <nav className="flex items-center text-sm font-medium text-muted-foreground mb-6">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <button
            onClick={() => currentStep > index + 1 && setCurrentStep(index + 1)}
            className={cn(
              "transition-colors",
              currentStep > index + 1 ? "hover:text-primary cursor-pointer" : "cursor-default",
              currentStep === index + 1 && "text-primary font-semibold"
            )}
            disabled={currentStep < index + 1}
          >
            {step}
          </button>
          {index < steps.length - 1 && <ChevronRight className="h-4 w-4 mx-2" />}
        </div>
      ))}
    </nav>
  );
};

export default function PhysicalConsultationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [consultationData, setConsultationData] = useState<ConsultationData>({
    // Doctor Details (would come from URL params in real implementation)
    selectedDoctorId: 'DR-001',
    selectedDoctorName: 'Dr. Sarah Johnson',
    selectedDoctorSpecialty: 'Dermatology',
    consultationFee: 200,
    doctorImage: '',
    doctorRating: 4.9,
    doctorReviewCount: 156,
    doctorClinic: 'Skin Care Clinic',
    doctorAddress: '123 Medical Center, Downtown',
    
    // Basic Details
    patientName: '',
    phoneNumber: '',
    email: '',
    reason: '',
    
    // Notification Preferences
    whatsappNotifications: true,
    smsNotifications: false,
    emailNotifications: false,
  });

  const updateConsultationData = (updates: Partial<ConsultationData>) => {
    setConsultationData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < 4 && isStepValid()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return consultationData.selectedDate && consultationData.selectedTime && consultationData.selectedDoctorId;
      case 2:
        return consultationData.patientName.trim() && 
               consultationData.phoneNumber.trim() && 
               consultationData.reason.trim();
      case 3:
        return true; // Notification preferences are optional
      case 4:
        return true; // Confirmation step is always valid
      default:
        return false;
    }
  };

  const handleConfirmAppointment = () => {
    // Generate a mock appointment ID
    const appointmentId = `APT-${Date.now()}`;
    updateConsultationData({ appointmentId });
    handleNext();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Physical Consultation</h1>
            <p className="text-lg text-muted-foreground mt-1">
              Book an in-person appointment with our doctors
            </p>
          </div>
        </div>
      </div>

      <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} />
      
      {/* Main content area with consistent spacing */}
      <div className="space-y-8">
        <Card>
          <CardContent className="p-6">
            {currentStep === 1 && (
              <TimeSlotSelection
                data={consultationData}
                onUpdate={updateConsultationData}
              />
            )}
            
            {currentStep === 2 && (
              <BasicDetailsForm
                data={consultationData}
                onUpdate={updateConsultationData}
              />
            )}
            
            {currentStep === 3 && (
              <NotificationConfirmation
                data={consultationData}
                onUpdate={updateConsultationData}
              />
            )}
            
            {currentStep === 4 && (
              <AppointmentConfirmation
                data={consultationData}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons (matching video consultation style) */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6"
          >
            Back
          </Button>
          
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="px-6"
            >
              {currentStep === 3 ? 'Confirm Appointment' : 'Next'}
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <Button onClick={() => window.location.href = '/doctors/appointments'}>
                <Eye className="h-4 w-4 mr-2" />
                View Appointments
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}