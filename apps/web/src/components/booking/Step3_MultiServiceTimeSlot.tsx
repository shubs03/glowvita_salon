"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  onLockAcquired?: (lockToken: string, appointmentId?: string) => void;
  user?: any;
  isWeddingService?: boolean;
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

// Memoized slot card to prevent unnecessary re-renders
const SlotCard = React.memo<{
  slot: MultiServiceSlot;
  isSelected: boolean;
  isLocking: boolean;
  onClick: () => void;
}>(({ slot, isSelected, isLocking, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLocking}
      className={cn(
        "p-4 border-2 rounded-lg transition-all text-left hover:shadow-md relative overflow-hidden",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-gray-200 hover:border-primary hover:bg-primary/5",
        isLocking && "opacity-50 cursor-wait"
      )}
    >
      {isLocking && isSelected && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
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
}, (prevProps, nextProps) => {
  // Custom comparison to prevent re-renders
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isLocking === nextProps.isLocking &&
    prevProps.slot.startTime === nextProps.slot.startTime &&
    prevProps.slot.endTime === nextProps.slot.endTime
  );
});

SlotCard.displayName = 'SlotCard';

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
  homeServiceLocation,
  onLockAcquired,
  platformFee = 0,
  serviceTax = 0,
  taxRate = 0,
  couponCode = null,
  discountAmount = 0,
  user,
  isWeddingService = false
}: Step3MultiServiceTimeSlotProps) {
  // RTK Query mutation hook
  const [getMultiServiceSlots, { data: slotsData, isLoading: isLoadingSlots, error: slotsError }] = useGetMultiServiceSlotsMutation();

  const [selectedSlot, setSelectedSlot] = useState<MultiServiceSlot | null>(null);
  const [isLocking, setIsLocking] = useState(false);
  const [lockedSlot, setLockedSlot] = useState<{
    slot: MultiServiceSlot;
    lockToken: string;
    expiresAt: Date;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
  const previousSlotsRef = useRef<MultiServiceSlot[]>([]);
  
  // Use stable local state instead of RTK Query reactive state
  const [stableSlots, setStableSlots] = useState<MultiServiceSlot[]>([]);
  const slots = stableSlots;

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
  const fetchMultiServiceSlots = useCallback(async (isBackgroundFetch = false) => {
    if (!vendorId || !selectedDate || !isAssignmentsValid) {
      console.log('Missing required data:', { vendorId, selectedDate, isAssignmentsValid });
      return;
    }

    if (isBackgroundFetch) {
      setIsBackgroundRefreshing(true);
    }

    try {
      // Prepare assignments payload including addons
      const assignments = serviceStaffAssignments.map(assignment => ({
        serviceId: assignment.service.id,
        staffId: assignment.staff?.id || 'any',
        // Include addons from the service object
        addOnIds: assignment.service.selectedAddons?.map(a => a._id) || [],
        selectedAddOns: assignment.service.selectedAddons?.map(a => a._id) || []
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
      
      const newSlots = result.slots || [];
      
      // Only update state if slots actually changed (prevents unnecessary re-renders)
      const slotsChanged = JSON.stringify(previousSlotsRef.current) !== JSON.stringify(newSlots);
      
      if (slotsChanged || !isBackgroundFetch) {
        setStableSlots(newSlots);
        previousSlotsRef.current = newSlots;
        console.log('Slots updated:', { isBackground: isBackgroundFetch, count: newSlots.length });
      } else {
        console.log('Slots unchanged, skipping update');
      }
      
      if (isBackgroundFetch) {
        setIsBackgroundRefreshing(false);
      }
    } catch (error: any) {
      console.error('Error fetching multi-service slots:', error);
      if (!isBackgroundFetch) {
        toast.error(error?.data?.message || 'Could not load available time slots. Please try again.');
      }
      setIsBackgroundRefreshing(false);
    }
  }, [vendorId, selectedDate, serviceStaffAssignments, isAssignmentsValid, isHomeService, homeServiceLocation, getMultiServiceSlots]);

  // Fetch slots when dependencies change
  useEffect(() => {
    fetchMultiServiceSlots();
  }, [fetchMultiServiceSlots]);

  // [NEW] Background refresh every 10 seconds (smooth, no UI blink)
  useEffect(() => {
    if (!vendorId || !selectedDate || !isAssignmentsValid) return;

    const refreshInterval = setInterval(() => {
      fetchMultiServiceSlots(true);
    }, 10000); // 10 seconds

    return () => clearInterval(refreshInterval);
  }, [vendorId, selectedDate, isAssignmentsValid, fetchMultiServiceSlots]);

  // Release lock manually
  const handleReleaseLock = async () => {
    if (!lockedSlot) return;

    try {
      // Find the appointment ID from the lock token if possible, 
      // but the backend handleReleaseLock now supports appointmentId + lockToken
      // We should ideally have stored the appointmentId

      await fetch('/api/booking/release-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lockToken: lockedSlot.lockToken,
          appointmentId: (lockedSlot as any).appointmentId // Store this in the state
        })
      });

      setLockedSlot(null);
      setTimeLeft(null);
      setSelectedSlot(null);
      onSelectTime(null);
    } catch (error) {
      console.error('Error releasing lock:', error);
    }
  };

  // Handle slot selection (with locking)
  const handleSlotSelect = async (slot: MultiServiceSlot) => {
    if (isLocking) return;

    // INDUSTRY BEST PRACTICE: Release existing lock before acquiring a new one
    if (lockedSlot) {
      console.log('Releasing existing lock before acquiring new one');
      await handleReleaseLock();
    }

    try {
      setIsLocking(true);
      console.log('Acquiring lock for multi-service slot:', slot);

      // Prepare lock request
      const lockRequest = {
        vendorId,
        serviceId: 'combo', // Multi-service identifier
        serviceName: 'Multi-service Booking',
        date: selectedDate.toISOString(),
        startTime: slot.startTime,
        endTime: slot.endTime,
        isMultiService: true,
        serviceItems: slot.sequence.map(item => {
          const service = selectedServices?.find(s => s.id === item.serviceId);
          const serviceAmount = service ? (service.discountedPrice || service.price || 0) : 0;
          
          // Include addons from the selected service
          const addOns = service?.selectedAddons?.map(addon => ({
            _id: addon._id,
            id: addon._id,
            name: addon.name,
            price: addon.price || 0,
            duration: addon.duration || 0
          })) || [];
          
          return {
            service: item.serviceId,
            serviceName: item.serviceName,
            staff: item.staffId,
            staffName: item.staffName,
            startTime: item.startTime,
            endTime: item.endTime,
            duration: item.duration,
            amount: Number(serviceAmount),
            addOns: service?.selectedAddons || []
          };
        }),
        isHomeService,
        location: homeServiceLocation,
        duration: slot.totalDuration,
        amount: slot.sequence.reduce((sum, item) => {
          const service = selectedServices?.find(s => s.id === item.serviceId);
          const servicePrice = Number(service?.discountedPrice || service?.price || 0);
          const addOnsPrice = service?.selectedAddons?.reduce((aSum, a) => aSum + (a.price || 0), 0) || 0;
          return sum + servicePrice + addOnsPrice;
        }, 0),
        totalAmount: slot.sequence.reduce((sum, item) => {
          const service = selectedServices?.find(s => s.id === item.serviceId);
          const servicePrice = Number(service?.discountedPrice || service?.price || 0);
          const addOnsPrice = service?.selectedAddons?.reduce((aSum, a) => aSum + (a.price || 0), 0) || 0;
          return sum + servicePrice + addOnsPrice;
        }, 0),
        addOnIds: selectedServices?.flatMap(s => s.selectedAddons?.map(a => a._id) || []),
        selectedAddOns: selectedServices?.flatMap(s => s.selectedAddons?.map(a => a._id) || []),
        isWeddingService,
        // Client Info
        clientId: user?._id || user?.id || 'temp-client-id',
        clientName: user ? `${user.firstName} ${user.lastName}` : 'Customer',
        clientEmail: user?.emailAddress || user?.email || '',
        clientPhone: user?.mobileNo || user?.phone || '',
        // Financials (if provided)
        platformFee: Math.round(platformFee || 0),
        serviceTax: Math.round(serviceTax || 0),
        taxRate: taxRate,
        couponCode,
        discountAmount: Math.round(discountAmount || 0)
      };

      const response = await fetch('/api/booking/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lockRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Slot no longer available');
      }

      const lockData = await response.json();
      console.log('Lock acquired:', lockData);

      setLockedSlot({
        slot,
        lockToken: lockData.lockId,
        appointmentId: lockData.appointmentId,
        expiresAt: new Date(Date.now() + (lockData.expiresIn || 15) * 60 * 1000)
      } as any);

      if (onLockAcquired) {
        onLockAcquired(lockData.lockId, lockData.appointmentId);
      }

      setSelectedSlot(slot);
      onSelectTime(slot.startTime);
      toast.success('Time slot reserved for 15 minutes');
    } catch (error: any) {
      console.error('Lock acquisition failed:', error);
      toast.error(error.message || 'Failed to reserve time slot. Please try another.');
      
      // [NEW] Refresh slots immediately (not background) to get updated availability
      await fetchMultiServiceSlots(false);
    } finally {
      setIsLocking(false);
    }
  };

  // Timer for locked slot
  useEffect(() => {
    if (!lockedSlot) {
      setTimeLeft(null);
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expires = lockedSlot.expiresAt.getTime();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));

      setTimeLeft(diff);

      if (diff === 0) {
        setLockedSlot(null);
        setSelectedSlot(null);
        onSelectTime(null);
        toast.info('Reservation expired. Please select a time slot again.');
        fetchMultiServiceSlots(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockedSlot, onSelectTime, fetchMultiServiceSlots]);

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

        {timeLeft !== null && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-amber-800 animate-pulse">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Slot reserved! Complete booking in:</span>
            </div>
            <span className="text-xl font-bold tabular-nums">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
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
            <RefreshCw className={cn("h-4 w-4", (isLoadingSlots || isBackgroundRefreshing) && "animate-spin", isBackgroundRefreshing && "opacity-50")} />
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
                  <SlotCard
                    key={`${slot.startTime}-${index}`}
                    slot={slot}
                    isSelected={isSelected}
                    isLocking={isLocking}
                    onClick={() => !isLocking && handleSlotSelect(slot)}
                  />
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