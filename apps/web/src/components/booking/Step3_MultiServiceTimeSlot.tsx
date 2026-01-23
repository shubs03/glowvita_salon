"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@repo/ui/button';
import { addDays, format, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@repo/ui/cn';
import { StaffMember, WorkingHours, Service, ServiceStaffAssignment, calculateTotalDuration, validateServiceStaffAssignments } from '@/hooks/useBookingData';
import { useGetMultiServiceSlotsMutation } from '@repo/store/api';
import { toast } from 'react-toastify';

const Breadcrumb = ({ currentStep, setCurrentStep }: { currentStep: number; setCurrentStep: (step: number) => void; }) => {
  const steps = ['Services', 'Select Professionals', 'Time Slot'];
  return (
    <nav className="flex items-center text-sm font-medium text-muted-foreground mb-4">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <button
            onClick={() => currentStep > index + 1 && setCurrentStep(index + 1)}
            className={cn(
              "transition-colors",
              currentStep > index + 1 ? "hover:text-primary" : "cursor-default",
              currentStep === index + 1 && "text-primary font-semibold"
            )}
          >
            {step}
          </button>
          {index < steps.length - 1 && <ChevronRight className="h-4 w-4 mx-2" />}
        </React.Fragment>
      ))}
    </nav>
  );
};

interface Step3MultiServiceTimeSlotProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  selectedTime: string | null;
  onSelectTime: (time: string | null) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  serviceStaffAssignments: ServiceStaffAssignment[];
  staff: StaffMember[];
  workingHours: WorkingHours[];
  isLoading: boolean;
  error?: any;
  selectedServices: Service[];
  vendorId?: string;
  platformFee?: number;
  serviceTax?: number;
  taxRate?: number;
  couponCode?: string | null;
  discountAmount?: number;
  isHomeService?: boolean;
  homeServiceLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

interface MultiServiceSlot {
  startTime: string;
  endTime: string;
  totalDuration: number;
  serviceDuration: number;
  travelTime?: number;
  sequence: Array<{
    serviceId: string;
    serviceName: string;
    staffId: string;
    staffName: string;
    startTime: string;
    endTime: string;
    duration: number;
  }>;
  isHomeService: boolean;
  travelInfo?: {
    timeInMinutes: number;
    distanceInKm: number;
    source: string;
  };
}

export function Step3_MultiServiceTimeSlot({
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  currentStep,
  setCurrentStep,
  serviceStaffAssignments,
  staff,
  workingHours,
  isLoading: parentLoading,
  error: parentError,
  selectedServices,
  vendorId,
  isHomeService = false,
  homeServiceLocation
}: Step3MultiServiceTimeSlotProps) {
  // RTK Query mutation hook
  const [getMultiServiceSlots, { data: slotsData, isLoading: isLoadingSlots, error: slotsError }] = useGetMultiServiceSlotsMutation();
  
  const [selectedSlot, setSelectedSlot] = useState<MultiServiceSlot | null>(null);

  // Extract slots from RTK Query response
  const slots = slotsData?.slots || [];

  // Generate available dates (next 60 days)
  const dates = useMemo(() => Array.from({ length: 60 }, (_, i) => addDays(new Date(), i)), []);

  const currentMonthYear = useMemo(() => format(selectedDate, 'MMMM yyyy'), [selectedDate]);

  // Calculate total duration for all selected services
  const totalDuration = useMemo(() => {
    return calculateTotalDuration(selectedServices);
  }, [selectedServices]);

  // Validate service-staff assignments
  const isAssignmentsValid = useMemo(() => {
    return validateServiceStaffAssignments(serviceStaffAssignments);
  }, [serviceStaffAssignments]);

  // Fetch slots using the RTK Query mutation
  const fetchMultiServiceSlots = useCallback(async () => {
    if (!vendorId || !selectedDate || !isAssignmentsValid) {
      console.log('Missing required data:', { vendorId, selectedDate, isAssignmentsValid });
      return;
    }

    try {
      // Prepare assignments payload
      const assignments = serviceStaffAssignments.map(assignment => ({
        serviceId: assignment.service.id,
        staffId: assignment.staff?.id || 'any'
      }));

      console.log('Fetching multi-service slots with:', {
        vendorId,
        date: selectedDate.toISOString(),
        assignments,
        isHomeService,
        homeServiceLocation
      });

      // Use RTK Query mutation
      const result = await getMultiServiceSlots({
        vendorId,
        date: selectedDate.toISOString(),
        assignments,
        isHomeService,
        location: homeServiceLocation,
        stepMinutes: 15,
        bufferBefore: 5,
        bufferAfter: 5
      }).unwrap();

      console.log('Multi-service slots received:', {
        slotsCount: result.slots?.length || 0,
        metadata: result.metadata
      });
    } catch (error: any) {
      console.error('Error fetching multi-service slots:', error);
      toast.error(error?.data?.message || 'Could not load available time slots. Please try again.');
    }
  }, [vendorId, selectedDate, serviceStaffAssignments, isAssignmentsValid, isHomeService, homeServiceLocation, getMultiServiceSlots]);

  // Fetch slots when dependencies change
  useEffect(() => {
    fetchMultiServiceSlots();
  }, [fetchMultiServiceSlots]);

  // Handle slot selection
  const handleSlotSelect = (slot: MultiServiceSlot) => {
    setSelectedSlot(slot);
    onSelectTime(slot.startTime);
  };

  // Handle date scroll
  const handleDateScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('date-scroller');
    if (container) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Check if a date is available based on working hours
  const isDateAvailable = (date: Date): boolean => {
    if (!workingHours || workingHours.length === 0) return true;

    const dayName = getDayName(date);
    const dayWorkingHours = workingHours.find((wh: WorkingHours) =>
      wh.dayOfWeek.toLowerCase() === dayName.toLowerCase()
    );

    return dayWorkingHours ? dayWorkingHours.isAvailable : false;
  };

  // Get day name helper
  const getDayName = (date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[getDay(date)];
  };

  // Format error message from RTK Query error
  const getErrorMessage = (error: any): string => {
    if (!error) return 'Failed to load time slots';
    if ('data' in error && typeof error.data === 'object' && error.data && 'message' in error.data) {
      return String(error.data.message);
    }
    if ('error' in error) {
      return String(error.error);
    }
    return 'Failed to load time slots';
  };

  // Loading state
  if (parentLoading || (isLoadingSlots && slots.length === 0)) {
    return (
      <div className="w-full">
        <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} />
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold font-headline">Select Date & Time</h2>
          </div>
          <p className="text-muted-foreground">Choose a convenient date and time for your appointments.</p>
        </div>

        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <span className="ml-4 text-muted-foreground">Loading available slots...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (parentError || slotsError) {
    return (
      <div className="w-full">
        <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} />
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold font-headline">Select Date & Time</h2>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-destructive mb-4">{getErrorMessage(slotsError)}</p>
          <Button onClick={fetchMultiServiceSlots} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} />
      
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Clock className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold font-headline">Select Date & Time</h2>
        </div>
        <p className="text-muted-foreground">
          Choose a convenient time for your {serviceStaffAssignments.length} service{serviceStaffAssignments.length > 1 ? 's' : ''}.
        </p>
      </div>

      {/* Service Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Your Services:</h3>
        <div className="space-y-2">
          {serviceStaffAssignments.map((assignment, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span>{assignment.service.name}</span>
              <span className="text-muted-foreground">
                with {assignment.staff?.name || 'Any Professional'}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between font-semibold">
            <span>Total Duration:</span>
            <span>{totalDuration} minutes</span>
          </div>
        </div>
      </div>

      {/* Date Scroller */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">{currentMonthYear}</h3>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDateScroll('left')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDateScroll('right')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div id="date-scroller" className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
          {dates.map((date: Date) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
            const isAvailable = isDateAvailable(date);
            const isSelected = selectedDate.toDateString() === date.toDateString();
            
            return (
              <Button
                key={date.toISOString()}
                id={`date-${format(date, 'yyyy-MM-dd')}`}
                variant={isSelected ? 'default' : 'outline'}
                className={cn(
                  'flex-shrink-0 flex flex-col items-center justify-center h-20 w-16 rounded-lg',
                  isSelected && 'ring-2 ring-primary ring-offset-2',
                  (isPast || !isAvailable) && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => !isPast && isAvailable && onSelectDate(date)}
                disabled={isPast || !isAvailable}
              >
                <span className="text-xs font-medium">
                  {isToday ? 'Today' : format(date, 'EEE')}
                </span>
                <span className="text-2xl font-bold">{format(date, 'd')}</span>
                <span className="text-xs">{format(date, 'MMM')}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div className="mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-lg">Available Slots for {format(selectedDate, 'MMMM d')}</h3>
          <Button size="sm" variant="ghost" onClick={fetchMultiServiceSlots} disabled={isLoadingSlots} className="ml-auto">
            <RefreshCw className={cn("h-4 w-4", isLoadingSlots && "animate-spin")} />
          </Button>
        </div>

        {isLoadingSlots ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Checking availability...</span>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No available slots for this date</p>
            <p className="text-sm text-muted-foreground mt-2">Try selecting a different date</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto pr-2 no-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {slots.map((slot: MultiServiceSlot, index: number) => {
                const isSelected = selectedSlot?.startTime === slot.startTime;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleSlotSelect(slot)}
                    className={cn(
                      "p-4 border-2 rounded-lg transition-all text-left hover:shadow-md",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary hover:bg-primary/5"
                    )}
                  >
                    {/* Slot Time */}
                    <div className="font-semibold text-lg mb-2">
                      {slot.startTime} - {slot.endTime}
                    </div>
                    
                    {/* Duration Info */}
                    <div className="text-sm text-gray-600 mb-3">
                      {slot.totalDuration} min total
                      {slot.travelTime && slot.travelTime > 0 && (
                        <span className="text-blue-600 ml-2">
                          (+{slot.travelTime} min travel)
                        </span>
                      )}
                    </div>

                    {/* Service Sequence */}
                    <div className="space-y-2">
                      {slot.sequence.map((item: any, idx: number) => (
                        <div key={idx} className="text-xs bg-white p-2 rounded border border-gray-100">
                          <div className="font-medium">{item.serviceName}</div>
                          <div className="text-gray-500">
                            {item.staffName} • {item.startTime}-{item.endTime}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Travel Info */}
                    {slot.travelInfo && (
                      <div className="mt-3 text-xs text-blue-600 border-t border-gray-100 pt-2">
                        📍 {slot.travelInfo.distanceInKm.toFixed(1)} km away
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Next Button */}
      {selectedSlot && (
        <div className="mt-8 flex justify-end">
          <Button
            size="lg"
            onClick={() => setCurrentStep(currentStep + 1)}
            className="px-8"
          >
            Continue to Booking Details
          </Button>
        </div>
      )}
    </div>
  );
}