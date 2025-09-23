
"use client";

import { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { BookingSummary } from "@/components/booking/BookingSummary";

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);

  const handleNextStep = () => {
    // Placeholder for future logic
  };

  const handlePrevStep = () => {
    window.history.back();
  };

  const renderStepContent = () => {
    // The content for steps is removed as requested.
    return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold">Booking UI Removed</h2>
            <p className="text-muted-foreground mt-2">The previous step-based UI has been removed as requested.</p>
        </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between h-20 px-4 md:px-8 border-b z-20 bg-background/80 backdrop-blur-sm">
        <Button variant="ghost" onClick={handlePrevStep} className="flex items-center gap-2">
          <ChevronLeft className="mr-1 h-5 w-5" />
          Back to Salon
        </Button>
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
