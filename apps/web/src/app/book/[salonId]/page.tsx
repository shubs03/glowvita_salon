
"use client";

import { useState } from "react";
import { ChevronLeft, X, ArrowRight, Check } from "lucide-react";
import { Button } from "@repo/ui/button";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { Step1_Services } from "@/components/booking/Step1_Services";
import { Step2_Staff } from "@/components/booking/Step2_Staff";
import { Step3_TimeSlot } from "@/components/booking/Step3_TimeSlot";
import { cn } from "@repo/ui/cn";

const bookingSteps = [
  { id: 1, name: 'Services' },
  { id: 2, name: 'Professional' },
  { id: 3, name: 'Time' },
];

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);

  const handleNextStep = () => {
    if (currentStep < bookingSteps.length) {
      setCurrentStep(currentStep + 1);
    } else {
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between h-20 px-4 md:px-8 border-b z-20 bg-background/80 backdrop-blur-sm">
        <Button variant="ghost" onClick={handlePrevStep} className="flex items-center gap-2">
          <ChevronLeft className="mr-1 h-5 w-5" />
          {currentStep === 1 ? 'Back to Salon' : 'Back'}
        </Button>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">Step {currentStep} of {bookingSteps.length}:</span>
          <span className="font-bold text-sm">{bookingSteps[currentStep-1].name}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <X className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex-1 grid lg:grid-cols-12 lg:gap-8 overflow-hidden">
        {/* Main Content Area */}
        <main className="lg:col-span-7 xl:col-span-8 overflow-y-auto p-4 sm:p-6 md:p-8 no-scrollbar">
            {/* Step Breadcrumbs for larger screens */}
            <div className="mb-8">
              <nav aria-label="Progress">
                <ol role="list" className="flex items-center">
                  {bookingSteps.map((step, stepIdx) => (
                    <li key={step.name} className={cn("relative", stepIdx !== bookingSteps.length - 1 ? "flex-1" : "")}>
                      {currentStep > step.id ? (
                        <>
                          <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="h-0.5 w-full bg-primary"></div>
                          </div>
                          <button
                            onClick={() => setCurrentStep(step.id)}
                            className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary hover:bg-primary/90"
                          >
                            <Check className="h-5 w-5 text-white" aria-hidden="true" />
                            <span className="sr-only">{step.name}</span>
                          </button>
                        </>
                      ) : currentStep === step.id ? (
                        <>
                          <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="h-0.5 w-full bg-gray-200"></div>
                          </div>
                          <div
                            className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background"
                            aria-current="step"
                          >
                            <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true"></span>
                            <span className="sr-only">{step.name}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="h-0.5 w-full bg-gray-200"></div>
                          </div>
                          <div
                            className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-background hover:border-gray-400"
                          >
                            <span className="sr-only">{step.name}</span>
                          </div>
                        </>
                      )}
                      <p className={cn("absolute -bottom-6 w-max", currentStep >= step.id ? "text-primary font-semibold" : "text-muted-foreground")}>{step.name}</p>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
            <div className="max-w-4xl mx-auto pt-8">
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
