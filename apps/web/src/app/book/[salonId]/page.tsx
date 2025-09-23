"use client";

import { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { Step1_Services } from "@/components/booking/Step1_Services";
import { Step2_Staff } from "@/components/booking/Step2_Staff";
import { Step3_TimeSlot } from "@/components/booking/Step3_TimeSlot";

const steps = [
  { id: 1, name: 'Select Services' },
  { id: 2, name: 'Select Professional' },
  { id: 3, name: 'Select Time' },
];

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle final booking confirmation
      console.log("Booking Confirmed!");
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      window.history.back();
    }
  };

  const handleSelectService = (service: any) => {
    setSelectedServices(prev => {
        const isSelected = prev.some(s => s.name === service.name);
        if (isSelected) {
            return prev.filter(s => s.name !== service.name);
        } else {
            return [...prev, service];
        }
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1_Services selectedServices={selectedServices} onSelectService={handleSelectService} />;
      case 2:
        return <Step2_Staff />;
      case 3:
        return <Step3_TimeSlot />;
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between h-20 px-4 md:px-8 border-b z-20 bg-background/80 backdrop-blur-sm">
        <Button variant="ghost" onClick={handlePrevStep} className="flex items-center gap-2">
          <ChevronLeft className="mr-1 h-5 w-5" />
          {currentStep === 1 ? 'Back to Salon' : 'Back'}
        </Button>
        {/* Step Indicator */}
        <div className="flex items-center gap-4">
            {steps.map(step => (
                <div key={step.id} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {step.id}
                    </div>
                    <span className={`hidden md:inline ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>{step.name}</span>
                </div>
            ))}
        </div>
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <X className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex-1 lg:grid lg:grid-cols-12 lg:gap-8 overflow-hidden">
        {/* Main Content Area */}
        <main className="lg:col-span-7 xl:col-span-8 overflow-y-auto p-4 sm:p-6 md:p-8 no-scrollbar">
            <div className="max-w-4xl mx-auto">
                {renderStepContent()}
            </div>
        </main>
        
        {/* Sidebar */}
        <aside className="hidden lg:block lg:col-span-5 xl:col-span-4 p-6 bg-background/50 border-l">
          <div className="sticky top-24">
            <BookingSummary 
              selectedServices={selectedServices} 
              onNextStep={handleNextStep}
              currentStep={currentStep}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
