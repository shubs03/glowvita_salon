
"use client";

import { useState } from "react";
import { ChevronLeft, X, Scissors, Users, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Step1_Services } from "@/components/booking/Step1_Services";
import { Step2_Staff } from "@/components/booking/Step2_Staff";
import { Step3_TimeSlot } from "@/components/booking/Step3_TimeSlot";
import { BookingSummary } from "@/components/booking/BookingSummary";

const steps = [
  { id: 1, name: "Services", icon: Scissors },
  { id: 2, name: "Professional", icon: Users },
  { id: 3, name: "Time", icon: Calendar },
  { id: 4, name: "Confirm", icon: CheckCircle },
];

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle final confirmation logic
      console.log("Booking confirmed!");
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
         return (
            <div className="text-center py-20">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
                <p className="text-muted-foreground mt-2">Check your email for confirmation details.</p>
            </div>
        );
      default:
        return <Step1_Services selectedServices={selectedServices} onSelectService={handleSelectService} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between h-20 px-4 md:px-8 border-b z-20 bg-background/80 backdrop-blur-sm">
        <Button variant="ghost" onClick={handlePrevStep} className="flex items-center gap-2">
          <ChevronLeft className="mr-1 h-5 w-5" />
          {currentStep === 1 ? 'Back to Salon' : 'Previous Step'}
        </Button>
        <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight">{steps.find(s => s.id === currentStep)?.name}</h1>
            <p className="text-sm text-muted-foreground">Step {currentStep} of {steps.length}</p>
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

       {/* Floating Bottom Bar for Mobile */}
       <div className="lg:hidden p-4 border-t bg-background/80 backdrop-blur-sm sticky bottom-0 z-20">
          <Button 
            className="w-full h-14 text-lg" 
            size="lg" 
            onClick={handleNextStep} 
            disabled={selectedServices.length === 0 && currentStep === 1}
          >
              {currentStep === 1 && "Select Staff"}
              {currentStep === 2 && "Find a Time"}
              {currentStep === 3 && "Confirm Booking"}
              {currentStep === 4 && "Finish"}
          </Button>
       </div>
    </div>
  );
}
