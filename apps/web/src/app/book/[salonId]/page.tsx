
"use client";

import { useState } from "react";
import React from 'react';
import { ChevronLeft, X, Scissors, Users, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Step1_Services } from "@/components/booking/Step1_Services";
import { Step2_Staff } from "@/components/booking/Step2_Staff";
import { Step3_TimeSlot } from "@/components/booking/Step3_TimeSlot";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { cn } from "@repo/ui/cn";

const steps = [
  { id: 1, name: "Services", icon: Scissors },
  { id: 2, name: "Professional", icon: Users },
  { id: 3, name: "Time", icon: Calendar },
  { id: 4, name: "Confirm", icon: CheckCircle },
];

const StepIndicator = ({ currentStep }: { currentStep: number }) => (
    <div className="flex items-center p-4 rounded-full bg-secondary/50 border">
        {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            return (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center text-center">
                        <div
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                isCompleted
                                ? "bg-primary border-primary text-primary-foreground"
                                : isActive
                                ? "bg-primary/10 border-primary text-primary font-bold"
                                : "bg-secondary border-border text-muted-foreground"
                            )}
                        >
                            <step.icon className="h-5 w-5" />
                        </div>
                        <p className={cn(
                            "text-xs mt-2 font-medium transition-colors",
                            isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                        )}>{step.name}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={cn(
                            "flex-1 h-0.5 transition-all duration-500",
                            currentStep > step.id ? "bg-primary" : "bg-border"
                        )}></div>
                    )}
                </React.Fragment>
            );
        })}
    </div>
);


export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectService = (service: any) => {
    setSelectedServices((prev) => {
      const isSelected = prev.find((s) => s.name === service.name);
      if (isSelected) {
        return prev.filter((s) => s.name !== service.name);
      }
      return [...prev, service];
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
      case 4:
        return <div>Confirm Details</div>;
      default:
        return <Step1_Services selectedServices={selectedServices} onSelectService={handleSelectService} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-secondary/30">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b z-20 bg-background/80 backdrop-blur-sm">
        <Button variant="ghost" onClick={currentStep === 1 ? () => window.history.back() : handlePrevStep}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Go back
        </Button>
        <h1 className="text-lg font-semibold">{steps.find(s => s.id === currentStep)?.name}</h1>
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <X className="h-4 w-4" />
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <StepIndicator currentStep={currentStep} />
                </div>
                {renderStepContent()}
            </div>
        </main>
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-96 border-l overflow-y-auto p-6 bg-background">
          <BookingSummary selectedServices={selectedServices} onNextStep={handleNextStep} />
        </aside>
      </div>

       {/* Floating Bottom Bar for Mobile */}
       <div className="lg:hidden p-4 border-t bg-background/80 backdrop-blur-sm">
          <Button className="w-full" size="lg" onClick={handleNextStep} disabled={selectedServices.length === 0}>
              Continue
          </Button>
       </div>
    </div>
  );
}
