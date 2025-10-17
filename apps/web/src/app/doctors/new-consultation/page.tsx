"use client";

import { useState } from 'react';
import { Button } from "@repo/ui/button";
import { BasicInfoStep } from './components/BasicInfoStep';
import { ConfirmationStep } from './components/ConfirmationStep';
import { ChatPanel } from './components/ChatPanel';
import { ChevronRight } from 'lucide-react';
import { cn } from '@repo/ui/cn';

export type ConsultationData = {
  // Basic Info
  patientName: string;
  consultationType: 'self' | 'other';
  concerns: string;
  phoneNumber: string;
  selectedSpecialty?: string;
  
  // Payment Info
  consultationFee: number;
  couponCode?: string;
  discount?: number;
  finalAmount: number;
  
  // Chat Info
  consultationId?: string;
  doctorId?: string;
  doctorName?: string;
  doctorSpecialty?: string;
};

// Breadcrumb Navigation Component (matching salon booking style)
const Breadcrumb = ({ currentStep, setCurrentStep }: { currentStep: number; setCurrentStep: (step: number) => void; }) => {
  const steps = ['Basic Information', 'Confirmation & Payment', 'Consultation'];
  return (
    <nav className="flex items-center text-sm font-medium text-muted-foreground mb-4">
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

export default function NewConsultationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [consultationData, setConsultationData] = useState<ConsultationData>({
    patientName: '',
    consultationType: 'self',
    concerns: '',
    phoneNumber: '',
    consultationFee: 150,
    finalAmount: 150
  });

  const updateConsultationData = (updates: Partial<ConsultationData>) => {
    setConsultationData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < 3 && isStepValid()) {
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
        const hasBasicInfo = consultationData.patientName.trim() && 
                            consultationData.phoneNumber.trim() && 
                            consultationData.concerns.trim();
        const hasSpecialty = consultationData.concerns.trim() === '' || consultationData.selectedSpecialty;
        return hasBasicInfo && hasSpecialty;
      case 2:
        return true; // Payment step is always valid once reached
      case 3:
        return true; // Chat step is always valid once reached
      default:
        return false;
    }
  };

  const handlePaymentSuccess = () => {
    // Simulate successful payment and doctor assignment based on specialty
    const doctorNames = {
      'General Medicine': 'Dr. Sarah Johnson',
      'Cardiology': 'Dr. Michael Chen',
      'Dermatology': 'Dr. Emily Rodriguez',
      'Neurology': 'Dr. David Thompson',
      'Orthopedics': 'Dr. Lisa Wang',
      'Psychiatry': 'Dr. James Wilson',
      'Gastroenterology': 'Dr. Maria Garcia',
      'Pulmonology': 'Dr. Robert Kim',
      'Endocrinology': 'Dr. Jennifer Brown',
      'Rheumatology': 'Dr. Andrew Davis'
    };

    const selectedSpecialty = consultationData.selectedSpecialty || 'General Medicine';
    const doctorName = doctorNames[selectedSpecialty as keyof typeof doctorNames] || 'Dr. Sarah Johnson';

    updateConsultationData({
      consultationId: `CONS-${Date.now()}`,
      doctorId: `DR-${Math.floor(Math.random() * 1000)}`,
      doctorName: doctorName,
      doctorSpecialty: selectedSpecialty
    });
    handleNext();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} />
      
      {currentStep === 1 && (
        <BasicInfoStep
          data={consultationData}
          onUpdate={updateConsultationData}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
      )}
      
      {currentStep === 2 && (
        <ConfirmationStep
          data={consultationData}
          onUpdate={updateConsultationData}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onNext={handlePaymentSuccess}
        />
      )}
      
      {currentStep === 3 && (
        <ChatPanel
          consultationData={consultationData}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
      )}

      {/* Navigation Buttons (matching salon booking style) */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-6"
        >
          Back
        </Button>
        <Button
          onClick={currentStep === 2 ? handlePaymentSuccess : handleNext}
          disabled={!isStepValid()}
          className="px-6"
        >
          {currentStep === 3 ? 'End Consultation' : currentStep === 2 ? 'Proceed to Payment' : 'Next'}
        </Button>
      </div>
    </div>
  );
}