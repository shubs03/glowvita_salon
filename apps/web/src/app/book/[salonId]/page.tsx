
"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { ChevronLeft, X, Scissors, User, Calendar, Clock } from "lucide-react";
import { Button } from "@repo/ui/button";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { Step1_Services } from "@/components/booking/Step1_Services";
import { Step2_Staff } from "@/components/booking/Step2_Staff";
import { Step3_TimeSlot } from "@/components/booking/Step3_TimeSlot";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/card';
import { Separator } from '@repo/ui/separator';
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

  // Set to `true` to test the modal, `false` to test the redirect
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
      <div className="flex-1 grid lg:grid-cols-12 gap-8 px-8">
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
        <DialogContent className="sm:max-w-4xl bg-secondary/80 backdrop-blur-md border-border/30 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Confirm Your Booking</DialogTitle>
            <DialogDescription className="text-center">
              Please review your appointment details before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 grid md:grid-cols-2 gap-6 max-h-[60vh] md:max-h-none md:overflow-y-visible">
              <Card className="bg-background/80 flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Scissors className="h-5 w-5 text-primary" />
                    Selected Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-2">
                  {selectedServices.map(s => (
                    <div key={s.name} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                      <span className="text-muted-foreground">{s.name}</span>
                      <span className="font-semibold">₹{s.price}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-4">
                  <Card className="bg-background/80">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Appointment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">With:</span> {selectedStaff?.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">On:</span> {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">At:</span> {selectedTime}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/10 border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-primary">Total Amount</span>
                          <span className="text-2xl font-bold text-primary">
                            ₹{selectedServices.reduce((acc, s) => acc + parseFloat(s.price), 0).toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                  </Card>
              </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmationModalOpen(false)}>Edit Booking</Button>
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
