"use client";

import React, { useState, useEffect } from 'react';
import { useBookingData } from '@/hooks/useBookingData';
import { Step1_Services } from './Step1_Services';
import { Step2_Staff } from './Step2_Staff';
import { Step3_TimeSlot } from './Step3_TimeSlot';
import { Button } from '@repo/ui/button';
import { Service, StaffMember } from '@/hooks/useBookingData';

// Separate component for Step 2 that handles service-specific data
const Step2WithServiceData = ({ 
  selectedStaff, 
  onSelectStaff, 
  currentStep, 
  setCurrentStep,
  salonId,
  selectedService
}: {
  selectedStaff: StaffMember | null;
  onSelectStaff: (staff: StaffMember | null) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  salonId: string;
  selectedService: Service;
}) => {
  const serviceStaffData = useBookingData(salonId, selectedService.id);
  
  return (
    <Step2_Staff
      selectedStaff={selectedStaff}
      onSelectStaff={onSelectStaff}
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      staff={serviceStaffData.staff}
      isLoading={serviceStaffData.isLoading}
      error={serviceStaffData.error}
      selectedService={selectedService}
    />
  );
};

// Separate component for Step 3 that handles service-specific data
const Step3WithServiceData = ({ 
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  selectedStaff,
  onSelectStaff,
  currentStep,
  setCurrentStep,
  salonId,
  selectedService,
  baseData
}: {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  selectedTime: string | null;
  onSelectTime: (time: string | null) => void;
  selectedStaff: StaffMember | null;
  onSelectStaff: (staff: StaffMember | null) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  salonId: string;
  selectedService: Service | null;
  baseData: any;
}) => {
  const serviceStaffData = useBookingData(salonId, selectedService?.id);
  
  return (
    <Step3_TimeSlot
      selectedDate={selectedDate}
      onSelectDate={onSelectDate}
      selectedTime={selectedTime}
      onSelectTime={onSelectTime}
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      selectedStaff={selectedStaff}
      onSelectStaff={onSelectStaff}
      staff={serviceStaffData.staff}
      workingHours={baseData.workingHours}
      isLoading={baseData.isLoading || serviceStaffData.isLoading}
      error={baseData.error || serviceStaffData.error}
    />
  );
};

interface BookingFlowProps {
  salonId: string;
  onBookingComplete: (bookingData: any) => void;
}

export function BookingFlow({ salonId, onBookingComplete }: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Get base data (services, working hours, salon info)
  const baseData = useBookingData(salonId);

  const handleSelectService = (service: Service) => {
    console.log('BookingFlow - Service selected:', service);
    // For simplicity, we're allowing only one service selection
    // You can modify this to allow multiple services
    setSelectedServices([service]);
    setSelectedService(service);
    console.log('BookingFlow - Selected service state updated:', service);
    console.log('BookingFlow - Current state after update:', { selectedServices: [service], selectedService: service });
  };

  const handleNext = () => {
    console.log('BookingFlow - handleNext called, currentStep:', currentStep, 'isStepValid:', isStepValid());
    if (currentStep < 3) {
      if (isStepValid()) {
        setCurrentStep(currentStep + 1);
        console.log('BookingFlow - Advanced to step:', currentStep + 1);
      } else {
        console.log('BookingFlow - Cannot advance, step validation failed');
      }
    } else {
      // Booking complete
      onBookingComplete({
        services: selectedServices,
        staff: selectedStaff,
        date: selectedDate,
        time: selectedTime,
        salon: baseData.salonInfo
      });
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
        return selectedServices.length > 0 && selectedService !== null;
      case 2:
        return selectedStaff !== null;
      case 3:
        return selectedDate !== null && selectedTime !== null;
      default:
        return false;
    }
  };

  // Reset staff selection when service changes
  useEffect(() => {
    console.log('BookingFlow - Selected service changed:', selectedService);
    setSelectedStaff(null);
  }, [selectedService]);

  // Debug effect to track all state changes
  useEffect(() => {
    console.log('BookingFlow - State updated:', { 
      currentStep, 
      selectedServices, 
      selectedStaff, 
      selectedService,
      selectedDate,
      selectedTime
    });
  }, [currentStep, selectedServices, selectedStaff, selectedService, selectedDate, selectedTime]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {currentStep === 1 && (
        <Step1_Services
          selectedServices={selectedServices}
          onSelectService={handleSelectService}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          services={baseData.services}
          servicesByCategory={baseData.servicesByCategory}
          categories={baseData.categories}
          isLoading={baseData.isLoading}
          error={baseData.error}
          onServiceSelect={setSelectedService}
        />
      )}

      {currentStep === 2 && selectedService && (
        <Step2WithServiceData
          selectedStaff={selectedStaff}
          onSelectStaff={setSelectedStaff}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          salonId={salonId}
          selectedService={selectedService}
        />
      )}

      {currentStep === 3 && selectedService && (
        <Step3WithServiceData
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          selectedTime={selectedTime}
          onSelectTime={setSelectedTime}
          selectedStaff={selectedStaff}
          onSelectStaff={setSelectedStaff}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          salonId={salonId}
          selectedService={selectedService}
          baseData={baseData}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isStepValid()}
        >
          {currentStep === 3 ? 'Confirm Booking' : 'Next'}
        </Button>
      </div>
    </div>
  );
}