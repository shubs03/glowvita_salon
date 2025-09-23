
"use client";

import React, { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { Step1_Services } from "@/components/booking/Step1_Services";
import { Step2_Staff } from "@/components/booking/Step2_Staff";
import { Step3_TimeSlot } from "@/components/booking/Step3_TimeSlot";

// Define interfaces for our state
interface Service {
  name: string;
  duration: string;
  price: string;
  image: string;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  image: string;
}

const steps = [
  { id: 1, component: Step1_Services },
  { id: 2, component: Step2_Staff },
  { id: 3, component: Step3_TimeSlot },
];

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log("Booking Confirmed!");
      // Here you would typically navigate to a confirmation page or show a success message.
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // If on the first step, go back to the previous page (e.g., salon details)
      window.history.back();
    }
  };
  
  const handleSelectService = (service: Service) => {
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
    const CurrentStepComponent = steps.find(s => s.id === currentStep)?.component;

    if (!CurrentStepComponent) return <div>Step not found</div>;

    const props = {
      selectedServices,
      onSelectService: handleSelectService,
      selectedStaff,
      onSelectStaff: setSelectedStaff,
      selectedDate,
      onSelectDate: setSelectedDate,
      selectedTime,
      onSelectTime: setSelectedTime,
      currentStep,
      setCurrentStep,
    };
    
    // @ts-ignore
    return <CurrentStepComponent {...props} />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Header */}
      <header className="flex-shrink-0 sticky top-0 flex items-center justify-between h-20 px-4 md:px-8 border-b z-20 bg-background/80 backdrop-blur-sm">
        <Button variant="ghost" onClick={handlePrevStep} className="flex items-center gap-2">
          <ChevronLeft className="mr-1 h-5 w-5" />
          {currentStep === 1 ? 'Back to Salon' : 'Back'}
        </Button>
        
        <div className="font-bold text-lg font-headline bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            GlowVita
        </div>
        
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <X className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex-1 grid lg:grid-cols-12 lg:gap-6 overflow-hidden">
        {/* Main Content Area (scrollable) */}
        <main className="lg:col-span-7 xl:col-span-8 overflow-y-auto p-4 sm:p-6 md:p-8 no-scrollbar">
            <div className="max-w-4xl mx-auto pb-24 lg:pb-0">
                {renderStepContent()}
            </div>
        </main>
        
        {/* Desktop Sidebar (sticky) */}
        <aside className="hidden lg:block lg:col-span-5 xl:col-span-4 p-6">
          <div className="sticky top-24">
            <BookingSummary 
              selectedServices={selectedServices}
              selectedStaff={selectedStaff}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onNextStep={handleNextStep}
              currentStep={currentStep}
            />
          </div>
        </aside>
      </div>

      {/* Mobile & Tablet Footer (sticky) */}
      <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-30">
        <BookingSummary 
            selectedServices={selectedServices}
            selectedStaff={selectedStaff}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onNextStep={handleNextStep}
            currentStep={currentStep}
            isMobileFooter={true}
        />
      </div>
    </div>
  );
}
