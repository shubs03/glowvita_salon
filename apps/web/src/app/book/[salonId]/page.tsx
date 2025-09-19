
"use client";

import { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { PageContainer } from "@repo/ui/page-container";
import { Step1_Services } from "@/components/booking/Step1_Services";
import { Step2_Staff } from "@/components/booking/Step2_Staff";
import { Step3_TimeSlot } from "@/components/booking/Step3_TimeSlot";
import { BookingSummary } from "@/components/booking/BookingSummary";

const steps = [
  { id: 1, name: "Services" },
  { id: 2, name: "Professional" },
  { id: 3, name: "Time" },
  { id: 4, name: "Confirm" },
];

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
    <div className="flex flex-col h-screen bg-background">
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
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-96 border-r overflow-y-auto p-6">
          <div className="space-y-4 mb-8">
            <h2 className="font-semibold text-xl">Booking Steps</h2>
            <ul className="space-y-2">
              {steps.map((step) => (
                <li key={step.id} className={`flex items-center p-3 rounded-lg transition-colors ${currentStep === step.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 border-2 ${currentStep >= step.id ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>
                    {currentStep > step.id ? '✔' : step.id}
                  </div>
                  <span className="font-medium">{step.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <BookingSummary selectedServices={selectedServices} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderStepContent()}
        </main>
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
