"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Button } from '@repo/ui/button';
import { addDays, format, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Loader2, AlertCircle, RefreshCw, CalendarDays } from 'lucide-react';
import { cn } from '@repo/ui/cn';
import { StaffMember, WorkingHours, Service, ServiceStaffAssignment, calculateTotalDuration, validateServiceStaffAssignments } from '@/hooks/useBookingData';
import { useGetMultiServiceSlotsMutation } from '@repo/store/api';
import { toast } from 'react-toastify';

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
  packageId?: string;
  weddingPackage?: any;
}

interface MultiServiceSlot {
  startTime: string;
  endTime: string;
  totalDuration: number;
  serviceDuration: number;
  travelTime?: number;
  totalTravelTime?: number;
  travelDistance?: number;
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
// UI simplified to match design: plain time-range pill, no duration/staff/travel breakdown shown.
// All slot data is still passed through untouched for functional/logic purposes.
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
        "py-2 px-2 border rounded-lg transition-colors text-center relative overflow-hidden",
        isSelected ? "bg-[#EBF3FD] border-black" : "bg-white border-black/40",
        isLocking && "opacity-50 cursor-wait"
      )}
    >
      {isLocking && isSelected && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60">
          <Loader2 className="h-5 w-5 animate-spin text-[#422A3C]" />
        </div>
      )}
      <span className="text-sm font-medium text-black">
        {slot.startTime} - {slot.endTime}
      </span>
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
  isWeddingService = false,
  packageId,
  weddingPackage
}: Step3MultiServiceTimeSlotProps) {
  // RTK Query mutation hook
  const [getMultiServiceSlots, { data: slotsData, isLoading: isLoadingSlots, error: slotsError }] = useGetMultiServiceSlotsMutation();
  const [slotsErrorMsg, setSlotsErrorMsg] = useState<string | null>(null);

  // Get day name helper
  const getDayName = useCallback((date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[getDay(date)];
  }, []);

  // Check if a date is available based on working hours
  const isDateAvailable = useCallback((date: Date): boolean => {
    if (!workingHours || workingHours.length === 0) return true;

    const dayName = getDayName(date);
    const dayWorkingHours = workingHours.find((wh: WorkingHours) =>
      wh.dayOfWeek.toLowerCase() === dayName.toLowerCase()
    );

    return dayWorkingHours ? dayWorkingHours.isAvailable : false;
  }, [workingHours, getDayName]);

  // Check if salon is closed every day
  const isSalonClosedEveryDay = useMemo(() => {
    if (!workingHours || workingHours.length === 0) return false;
    return workingHours.every(wh => !wh.isAvailable);
  }, [workingHours]);

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
        isWeddingService,
        isWeddingPackage: isWeddingService,
        packageId,
        stepMinutes: 15,
        bufferBefore: 5,
        bufferAfter: 5
      }).unwrap();

      console.log('Multi-service slots received:', {
        slotsCount: result.slots?.length || 0,
        metadata: result.metadata
      });

      const newSlots = result.slots || [];
      setSlotsErrorMsg(null);

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
      let errMsg = 'Could not load available time slots. Please try again.';
      const data = error?.data || error;
      if (data) {
        if (typeof data === 'string') {
          try {
            const parsed = JSON.parse(data);
            errMsg = parsed.message || parsed.error?.message || data;
          } catch {
            errMsg = data;
          }
        } else if (typeof data === 'object') {
          errMsg = data.message || data.error?.message || error.message || errMsg;
        }
      } else if (error?.message) {
        errMsg = error.message;
      }

      try {
        if (typeof errMsg === 'string' && errMsg.startsWith('{')) {
          const parsed = JSON.parse(errMsg);
          errMsg = parsed.message || parsed.error?.message || errMsg;
        }
      } catch (e) {}

      if (!isBackgroundFetch) {
        setSlotsErrorMsg(errMsg);
        toast.error(errMsg);
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

  // [NEW] Auto-select first available date if current date is closed
  useEffect(() => {
    if (workingHours && workingHours.length > 0 && !isDateAvailable(selectedDate)) {
      const firstAvailableDate = dates.find(date => {
        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
        return !isPast && isDateAvailable(date);
      });

      if (firstAvailableDate) {
        console.log('Current date is closed, auto-selecting first available:', firstAvailableDate);
        onSelectDate(firstAvailableDate);
      }
    }
  }, [workingHours, dates, selectedDate, isDateAvailable, onSelectDate]);

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

      // For wedding packages, use the specialized lock endpoint
      if (isWeddingService && (packageId || weddingPackage)) {
        console.log('Using wedding package specialized lock endpoint');

        const weddingLockRequest = {
          packageId: packageId || weddingPackage?.id || weddingPackage?._id,
          selectedSlot: {
            date: selectedDate.toISOString(),
            startTime: slot.startTime,
            endTime: slot.endTime,
            location: isHomeService && homeServiceLocation ? homeServiceLocation : null,
            totalAmount: weddingPackage?.discountedPrice || weddingPackage?.totalPrice || 0,
            depositAmount: weddingPackage?.depositAmount || 0
          },
          clientId: user?._id || user?.id || 'temp-client-id',
          clientName: user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Customer') : 'Customer',
          customerDetails: {
            name: user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Customer') : 'Customer',
            phone: user?.mobileNo || user?.phone || null
          }
        };

        const response = await fetch('/api/scheduling/wedding-package', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(weddingLockRequest)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Slot no longer available');
        }

        const lockData = await response.json();
        console.log('Wedding package lock response received:', lockData);

        setLockedSlot({
          slot,
          lockToken: lockData.lockId,
          appointmentId: lockData.appointmentId,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes for wedding packages
        } as any);

        if (onLockAcquired && lockData.lockId) {
          onLockAcquired(lockData.lockId, lockData.appointmentId);
        }

        setSelectedSlot(slot);
        onSelectTime(slot.startTime);
        toast.success('Time slot reserved for 30 minutes');
        return;
      }

      // Prepare standard lock request
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
        clientName: user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Customer') : 'Customer',
        clientEmail: user?.emailAddress || user?.email || '',
        clientPhone: user?.mobileNo || user?.phone || '',
        // Financials (if provided)
        platformFee: parseFloat(Number(platformFee || 0).toFixed(2)),
        serviceTax: parseFloat(Number(serviceTax || 0).toFixed(2)),
        taxRate: taxRate,
        couponCode,
        discountAmount: parseFloat(Number(discountAmount || 0).toFixed(2))
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

  // Reusable back-arrow + title header (matches design; replaces old step Breadcrumb)
  const PageHeader = () => (
    <div className="flex items-center gap-2 mb-1 cursor-pointer w-fit" onClick={() => setCurrentStep(currentStep - 1)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/back 1.png" alt="back" className="h-5 w-5" />
      <h2 className="text-2xl font-bold font-headline text-black">
        Select Time Slot
      </h2>
    </div>
  );

  // Loading state
  if (parentLoading || (isLoadingSlots && slots.length === 0)) {
    return (
      <div className="w-full">
        <PageHeader />
        <div className="mb-6 px-[26px]">
          <p className="text-sm text-black mt-1">
            Pick the perfect date and time that suits your schedule, so your appointment feels effortless and well-timed.
          </p>
        </div>

        <div className="flex items-center justify-center py-12 rounded-[11px] bg-[#EBF3FD]">
          <Loader2 className="h-10 w-10 animate-spin text-[#422A3C]" />
          <span className="ml-4 text-black/70">Loading available slots...</span>
        </div>
      </div>
    );
  }

  // Error state
  const errorMsgStr = slotsError ? getErrorMessage(slotsError) : '';
  const isRangeError = errorMsgStr && errorMsgStr.includes('We do not reach that point');

  if (parentError || (slotsError && !isRangeError)) {
    return (
      <div className="w-full">
        <PageHeader />
        <div className="mb-6 px-[26px]">
          <p className="text-sm text-black mt-1">
            Pick the perfect date and time that suits your schedule, so your appointment feels effortless and well-timed.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 rounded-[11px] bg-[#EBF3FD]">
          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
          <p className="text-destructive mb-4">{getErrorMessage(slotsError)}</p>
          <Button onClick={() => fetchMultiServiceSlots()} variant="outline" className="border-[#422A3C] text-[#422A3C] hover:bg-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PageHeader />

      {/* Page subheading */}
      <div className="mb-6 px-[26px]">
        <p className="text-black mt-1">
          Pick the perfect date and time that suits your schedule, so your appointment feels effortless and well-timed.
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

      {/* Card wrapper — bg #EBF3FD, rounded-[11px], shadow exactly as in the Figma frame */}
      <div className="rounded-[11px]  px-[26px] py-5">
        <div className="bg-[#EBF3FD] rounded-[11px] px-3 py-2 mb-3 shadow-sm">

          {/* Select Date label */}
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-[17px] w-[17px] text-black" strokeWidth={1.75} />
            <span className="text-black">Select Date</span>
          </div>

          <div className="flex items-center mb-6">
            <button
              type="button"
              onClick={() => handleDateScroll('left')}
              className="flex-shrink-0 flex items-center justify-center h-6 w-6 mr-1 text-black/70 hover:text-black transition-colors"
              aria-label="Scroll dates left"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
            </button>

            <div id="date-scroller" className="flex gap-6 overflow-y-visible pt-4 overflow-x-auto no-scrollbar scroll-smooth">
              {dates.map((date: Date) => {
                const isToday = date.toDateString() === new Date().toDateString();
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                const isAvailable = isDateAvailable(date);
                const isSelected = selectedDate.toDateString() === date.toDateString();
                const isDisabled = isPast || !isAvailable;
                const isHighlighted = isToday || isSelected;

                return (
                  <div key={date.toISOString()} className="relative flex-shrink-0">
                    {isToday && (
                      <span className="absolute -top-2 -right-2 z-20 rounded-full bg-[#422A3C] px-[9px] py-[3px] text-[10px] font-medium text-white whitespace-nowrap">
                        Today
                      </span>
                    )}
                    <button
                      id={`date-${format(date, 'yyyy-MM-dd')}`}
                      type="button"
                      onClick={() => !isPast && isAvailable && onSelectDate(date)}
                      disabled={isDisabled}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 h-[91px] w-[85px] rounded-lg border bg-transparent transition-colors",
                        isDisabled
                          ? "border-black/35 text-black/35 cursor-not-allowed"
                          : isHighlighted
                            ? "border-[#422A3C] text-[#422A3C]"
                            : "border-black text-black"
                      )}
                    >
                      <span className="text-sm font-medium leading-none">
                        {isToday ? 'Today' : format(date, 'EEE')}
                      </span>
                      <span className="text-base font-semibold leading-none">{format(date, 'd')}</span>
                      <span className="text-sm font-medium leading-none">{format(date, 'MMM')}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleDateScroll('right')}
              className="flex-shrink-0 flex items-center justify-center h-6 w-6 ml-1 text-black/70 hover:text-black transition-colors"
              aria-label="Scroll dates right"
            >
              <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Select Time label */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-[17px] w-[17px] text-black" strokeWidth={1.75} />
            <span className="text-black">Select Time</span>
          </div>
          <button
            type="button"
            onClick={() => fetchMultiServiceSlots()}
            disabled={isLoadingSlots}
            className="flex items-center justify-center h-6 w-6 text-black/50 hover:text-black transition-colors disabled:opacity-50"
            aria-label="Refresh slots"
          >
            <RefreshCw className={cn("h-4 w-4", (isLoadingSlots || isBackgroundRefreshing) && "animate-spin", isBackgroundRefreshing && "opacity-50")} />
          </button>
        </div>

        {isLoadingSlots ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#422A3C] mr-3" />
            <span className="text-[#141414]/70">Checking availability...</span>
          </div>
        ) : slotsErrorMsg ? (
          <div className="text-center py-10 bg-white rounded-[11px] border border-amber-200 p-8 shadow-sm max-w-lg mx-auto">
            <div className="p-3 bg-amber-100 rounded-full text-amber-600 w-fit mx-auto mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-amber-900 mb-2">Service Area Range</h3>
            <p className="text-amber-700 mb-6 text-sm">{slotsErrorMsg}</p>
            <Button onClick={() => setCurrentStep(3)} className="bg-[#422A3C] hover:bg-[#3a2434] text-white font-medium px-6 py-2 rounded-lg">
              Select Another Location
            </Button>
          </div>
        ) : isSalonClosedEveryDay ? (
          <div className="text-center py-10 bg-white rounded-[11px] border border-red-100 p-8">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-800 mb-2">Salon is Currently Closed</h3>
          </div>
        ) : !isDateAvailable(selectedDate) ? (
          <div className="text-center py-10 bg-white rounded-[11px] border border-amber-100 p-8 shadow-sm">
            <Clock className="h-10 w-10 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-amber-800 mb-2">Salon is Closed Today</h3>
            <p className="text-amber-600 mb-4">
              The salon is closed on this particular day ({format(selectedDate, 'EEEE')}). Please select another date from the calendar above to see available times.
            </p>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-[11px] border border-dashed border-gray-200">
            <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700 mb-1">No available slots</h3>
            <p className="text-sm text-muted-foreground">We couldn't find any available time slots for {format(selectedDate, 'MMMM d')}.</p>
            <p className="text-xs text-muted-foreground mt-2">Try selecting a different date or different professional combinations.</p>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto pr-2 no-scrollbar space-y-5">
            {(() => {
              const morningSlots = slots.filter((s: MultiServiceSlot) => {
                const h = parseInt(s.startTime.split(':')[0], 10);
                return h < 12;
              });
              const afternoonSlots = slots.filter((s: MultiServiceSlot) => {
                const h = parseInt(s.startTime.split(':')[0], 10);
                return h >= 12 && h < 16;
              });
              const eveningSlots = slots.filter((s: MultiServiceSlot) => {
                const h = parseInt(s.startTime.split(':')[0], 10);
                return h >= 16;
              });

              const renderGroup = (label: string, dotColor: string, groupSlots: MultiServiceSlot[]) => {
                if (groupSlots.length === 0) return null;
                return (
                  <div key={label}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: dotColor }} />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {groupSlots.map((slot: MultiServiceSlot, index: number) => {
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
                );
              };

              return (
                <>
                  {renderGroup('Morning', '#F5A623', morningSlots)}
                  {renderGroup('Afternoon', '#E07B39', afternoonSlots)}
                  {renderGroup('Evening', '#27AE60', eveningSlots)}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Next Button - Removed as per user request */}
    </div>
  );
}