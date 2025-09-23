
"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { ChevronLeft, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { Step1_Services } from "@/components/booking/Step1_Services";
import { Step2_Staff } from "@/components/booking/Step2_Staff";
import { Step3_TimeSlot } from "@/components/booking/Step3_TimeSlot";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/dialog";
import { format } from 'date-fns';

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

const staffMembers = [
    { id: '1', name: 'Jessica Miller', role: 'Lead Stylist', image: 'https://picsum.photos/seed/staff1/400/400', hint: 'female stylist portrait' },
    { id: '2', name: 'Michael Chen', role: 'Massage Therapist', image: 'https://picsum.photos/seed/staff2/400/400', hint: 'male therapist portrait' },
    { id: '3', name: 'Emily White', role: 'Esthetician', image: 'https://picsum.photos/seed/staff3/400/400', hint: 'female esthetician portrait' },
];

function BookingPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { id } = params;

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  useEffect(() => {
    const serviceQuery = searchParams.get('service');
    if (serviceQuery) {
      try {
        const service = JSON.parse(decodeURIComponent(serviceQuery));
        setSelectedServices([service]);
      } catch (error) {
        console.error("Failed to parse service from URL:", error);
      }
    }
  }, [searchParams]);

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      if (isAuthenticated) {
        setIsConfirmationModalOpen(true);
      } else {
        router.push('/client-login');
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      window.history.back();
    }
  };

  const handleFinalBookingConfirmation = () => {
    console.log("Booking Confirmed & Payment Initialized!");
    setIsConfirmationModalOpen(false);
    alert("Booking Confirmed! (Simulated)");
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
        staffMembers
    };
    
    switch (currentStep) {
        case 1:
            return <Step1_Services {...props} />;
        case 2:
            return <Step2_Staff {...props} />;
        case 3:
            return <Step3_TimeSlot {...props} />;
        default:
            return <div>Step not found</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <header className="flex-shrink-0 sticky top-0 flex items-center justify-between h-20 px-6 md:px-12 border-b z-20 bg-background/80 backdrop-blur-sm">
        <Button variant="ghost" onClick={handlePrevStep} className="flex items-center gap-2">
          <ChevronLeft className="mr-1 h-5 w-5" />
          {currentStep === 1 ? 'Back' : 'Back'}
        </Button>
        <div className="font-bold text-lg font-headline bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            GlowVita
        </div>
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <X className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex-1 grid lg:grid-cols-12 lg:gap-4">
        <main className="lg:col-span-7 xl:col-span-8 overflow-y-auto no-scrollbar">
            <div className="max-w-4xl mx-auto pb-24 lg:pb-8 pt-8">
                {renderStepContent()}
            </div>
        </main>
        
        <aside className="hidden lg:block lg:col-span-5 xl:col-span-4 py-8">
          <div className="sticky top-28">
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

      <Dialog open={isConfirmationModalOpen} onOpenChange={setIsConfirmationModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogDescription>
              Please review your appointment details before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h4 className="font-semibold mb-2">Selected Services:</h4>
              <ul className="space-y-1 text-sm">
                {selectedServices.map(s => (
                  <li key={s.name} className="flex justify-between">
                    <span>{s.name}</span>
                    <span className="font-medium">₹{s.price}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
                <p><span className="font-semibold">Professional:</span> {selectedStaff?.name}</p>
                <p><span className="font-semibold">Date:</span> {format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                <p><span className="font-semibold">Time:</span> {selectedTime}</p>
            </div>
             <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-right">
                <p className="text-lg font-bold">
                    Total: ₹{selectedServices.reduce((acc, s) => acc + parseFloat(s.price), 0).toFixed(2)}
                </p>
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmationModalOpen(false)}>Edit</Button>
            <Button onClick={handleFinalBookingConfirmation}>Confirm & Pay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BookingPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingPageContent />
    </Suspense>
  );
}
