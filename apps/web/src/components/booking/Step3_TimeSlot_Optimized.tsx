"use client";

import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import { Clock, Loader2, RefreshCw, Lock, AlertCircle, ChevronRight, ChevronLeft, CalendarDays, Scissors } from 'lucide-react';
import { cn } from '@repo/ui/cn';
import { toast } from 'react-toastify';
import { Service, StaffMember, WeddingPackage } from '@/hooks/useBookingData';
import { format, addDays } from 'date-fns';

// Breadcrumb navigation component
const Breadcrumb = ({ currentStep, setCurrentStep, isWeddingPackage, isHomeService }: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isWeddingPackage?: boolean;
  isHomeService?: boolean;
}) => {
  const steps = isWeddingPackage
    ? [
      { name: 'Select Package', step: 1 },
      { name: 'Select Location', step: 3 },
      { name: 'Select Date & Time', step: 4 }
    ]
    : isHomeService
      ? [
        { name: 'Services', step: 1 },
        { name: 'Select Professionals', step: 2 },
        { name: 'Select Location', step: 3 },
        { name: 'Select Date & Time', step: 4 }
      ]
      : [
        { name: 'Services', step: 1 },
        { name: 'Select Professionals', step: 2 },
        { name: 'Select Date & Time', step: 3 }
      ];

  return (
    <nav className="flex items-center text-sm font-medium text-muted-foreground mb-4">
      {steps.map((stepObj, index) => (
        <React.Fragment key={stepObj.name}>
          <button
            onClick={() => currentStep > stepObj.step && setCurrentStep(stepObj.step)}
            className={cn(
              "transition-colors",
              currentStep > stepObj.step ? "hover:text-primary cursor-pointer" : "cursor-default",
              currentStep === stepObj.step && "text-primary font-semibold"
            )}
          >
            {stepObj.name}
          </button>
          {index < steps.length - 1 && <ChevronRight className="h-4 w-4 mx-2" />}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Skeleton loader for time slots
const TimeSlotSkeleton = memo(() => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg" />
    ))}
  </div>
));
TimeSlotSkeleton.displayName = 'TimeSlotSkeleton';

// Slot lock interface
interface SlotLock {
  slot: TimeSlot;
  lockToken: string;
  expiresAt: Date;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
  travelTime?: number;
  distance?: number;
  score?: number;
  services?: any[];
  availableStaff?: any[];
}

interface Step3TimeSlotProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  selectedTime: string | null;
  onSelectTime: (time: string | null) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  selectedStaff: StaffMember | null;
  onSelectStaff?: (staff: StaffMember | null) => void;
  staff: StaffMember[];
  workingHours: any;
  isLoading: boolean;
  error?: any;
  vendorId?: string;
  salonId?: string;
  service?: Service | null;
  selectedServices?: Service[];
  selectedService?: Service | null;
  isHomeService?: boolean;
  isWeddingService?: boolean;
  isWeddingPackage?: boolean;
  weddingPackage?: WeddingPackage | null;
  weddingPackageServices?: any[];
  homeServiceLocation?: any;
  onLockAcquired?: (lockToken: string, appointmentId?: string) => void; // Callback when lock is acquired
  platformFee?: number;
  serviceTax?: number;
  taxRate?: number;
  couponCode?: string | null;
  discountAmount?: number;
  user?: any;
}

export const Step3_TimeSlot = memo(({
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  currentStep,
  setCurrentStep,
  selectedStaff,
  onSelectStaff,
  staff,
  workingHours,
  isLoading: parentLoading,
  error: parentError,
  vendorId,
  salonId,
  service,
  selectedServices,
  selectedService,
  isHomeService = false,
  isWeddingService = false,
  isWeddingPackage = false,
  weddingPackage,
  weddingPackageServices,
  homeServiceLocation,
  onLockAcquired,
  platformFee = 0,
  serviceTax = 0,
  taxRate = 0,
  couponCode = null,
  discountAmount = 0,
  user
}: Step3TimeSlotProps) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [lockedSlot, setLockedSlot] = useState<SlotLock | null>(null);
  const [lockCountdown, setLockCountdown] = useState<number | null>(null);
  const [isLocking, setIsLocking] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isStale, setIsStale] = useState(false);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);

  // [NEW] Get day name helper
  const getDayName = useCallback((date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }, []);

  // [NEW] Check if a date is available based on working hours
  const isDateAvailable = useCallback((date: Date): boolean => {
    if (!workingHours || workingHours.length === 0) return true;

    const dayName = getDayName(date);
    const dayWorkingHours = workingHours.find((wh: any) =>
      wh.dayOfWeek.toLowerCase() === dayName.toLowerCase()
    );

    return dayWorkingHours ? dayWorkingHours.isAvailable : false;
  }, [workingHours, getDayName]);

  // [NEW] Check if salon is closed every day
  const isSalonClosedEveryDay = useMemo(() => {
    if (!workingHours || workingHours.length === 0) return false;
    return workingHours.every((wh: any) => !wh.isAvailable);
  }, [workingHours]);

  const dateScrollerRef = useRef<HTMLDivElement>(null);
  const previousSlotsRef = useRef<TimeSlot[]>([]);

  // Use salonId or vendorId (they're the same)
  const effectiveVendorId = vendorId || salonId;
  // Use service or selectedService
  const effectiveService = service || selectedService;

  // Fetch slots from API
  const fetchSlots = useCallback(async (isBackgroundFetch = false) => {
    if (!effectiveVendorId || !selectedDate) return;

    // For background fetches, don't show loading state
    if (!isBackgroundFetch) {
      setIsLoadingSlots(true);
    } else {
      setIsBackgroundRefreshing(true);
    }
    setSlotsError(null);

    try {
      // For wedding packages, we need to send the service IDs from the package services
      let serviceIdsParam = effectiveService?.id || '';
      if (isWeddingPackage && weddingPackageServices && weddingPackageServices.length > 0) {
        // Extract service IDs from wedding package services
        serviceIdsParam = weddingPackageServices
          .map(s => s.serviceId || s.id || s._id)
          .filter(Boolean)
          .join(',');
      }

      // Extract addOnIds if any are selected
      let addOnIdsParam = '';
      if (effectiveService?.selectedAddons && effectiveService.selectedAddons.length > 0) {
        addOnIdsParam = effectiveService.selectedAddons.map(a => a._id).join(',');
      } else if (selectedServices && selectedServices.length > 0) {
        const allAddOnIds = selectedServices.flatMap(s => s.selectedAddons?.map(a => a._id) || []);
        if (allAddOnIds.length > 0) {
          addOnIdsParam = Array.from(new Set(allAddOnIds)).join(',');
        }
      }

      const params = new URLSearchParams({
        vendorId: effectiveVendorId,
        staffId: selectedStaff?.id || 'any',
        serviceIds: serviceIdsParam,
        addOnIds: addOnIdsParam,
        date: selectedDate.toISOString(),
        isHomeService: isHomeService.toString(),
        isWeddingService: (isWeddingService || isWeddingPackage).toString(),
        ...(weddingPackage && { packageId: weddingPackage.id || weddingPackage._id }),
        ...(homeServiceLocation?.lat && { lat: homeServiceLocation.lat.toString() }),
        ...(homeServiceLocation?.lng && { lng: homeServiceLocation.lng.toString() })
      });

      const response = await fetch(`/api/booking/slots?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch slots');
      }

      const data = await response.json();
      const newSlots = data.slots || [];

      // Only update if slots actually changed (prevents unnecessary re-renders)
      const slotsChanged = JSON.stringify(previousSlotsRef.current) !== JSON.stringify(newSlots);

      if (slotsChanged || !isBackgroundFetch) {
        setSlots(newSlots);
        previousSlotsRef.current = newSlots;
      }

      setLastRefresh(new Date());
    } catch (error: any) {
      console.error('Error fetching slots:', error);
      setSlotsError(error.message || 'Failed to load available slots');
      toast.error('Could not load available time slots. Please try again.');
    } finally {
      if (!isBackgroundFetch) {
        setIsLoadingSlots(false);
      } else {
        setIsBackgroundRefreshing(false);
      }
    }
  }, [effectiveVendorId, selectedDate, effectiveService, selectedStaff, isHomeService, isWeddingService,
    isWeddingPackage, weddingPackage, weddingPackageServices, homeServiceLocation]);

  // Fetch slots on mount and when dependencies change
  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Background refresh every 10 seconds (smooth, no UI blink)
  useEffect(() => {
    if (!effectiveVendorId || !selectedDate) return;

    const refreshInterval = setInterval(() => {
      // Pass true to indicate this is a background fetch
      fetchSlots(true);
    }, 10000); // 10 seconds

    return () => clearInterval(refreshInterval);
  }, [effectiveVendorId, selectedDate, fetchSlots]);

  // [NEW] Auto-select first available date if current date is closed
  useEffect(() => {
    if (workingHours && Object.keys(workingHours).length > 0 && !isDateAvailable(selectedDate)) {
      // Create dates array for searching (same logic as in useMemo below)
      const searchDates = Array.from({ length: 60 }, (_, i) => addDays(new Date(), i));

      const firstAvailableDate = searchDates.find(date => {
        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
        return !isPast && isDateAvailable(date);
      });

      if (firstAvailableDate) {
        console.log('Current date is closed, auto-selecting first available:', firstAvailableDate);
        onSelectDate(firstAvailableDate);
      }
    }
  }, [workingHours, selectedDate, isDateAvailable, onSelectDate]);

  // Check if data is stale (> 60 seconds)
  useEffect(() => {
    const staleCheck = setInterval(() => {
      const now = new Date().getTime();
      const lastRefreshTime = lastRefresh.getTime();
      const ageSeconds = (now - lastRefreshTime) / 1000;

      setIsStale(ageSeconds > 60);
    }, 10000); // Check every 10 seconds

    return () => clearInterval(staleCheck);
  }, [lastRefresh]);

  // Lock countdown timer
  useEffect(() => {
    if (!lockedSlot) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiresAt = new Date(lockedSlot.expiresAt).getTime();
      const remaining = Math.floor((expiresAt - now) / 1000);

      if (remaining <= 0) {
        setLockedSlot(null);
        setLockCountdown(null);
        onSelectTime(null);
        toast.warning("Slot lock expired. Please select another time.");
        fetchSlots(false); // Refresh slots immediately
      } else {
        setLockCountdown(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedSlot, onSelectTime, fetchSlots]);

  // Handle slot lock acquisition
  const handleTimeSelect = useCallback(async (slot: TimeSlot) => {
    if (isLocking) return;

    if (lockedSlot) {
      console.log('Releasing existing lock before acquiring new one');
      try {
        await handleReleaseLock();
      } catch (err) {
        console.error('Error auto-releasing lock:', err);
      }
    }

    setIsLocking(true);

    try {
      if (!effectiveVendorId) {
        throw new Error('Vendor ID is required but not available');
      }

      const effectiveService = service || selectedService || (selectedServices && selectedServices[0]);
      let serviceIdForLock = effectiveService?.id;

      if (isWeddingPackage && weddingPackage) {
        if (weddingPackageServices && weddingPackageServices.length > 0) {
          serviceIdForLock = weddingPackageServices[0].serviceId || weddingPackageServices[0].id || weddingPackageServices[0]._id;
        } else if (weddingPackage.services && weddingPackage.services.length > 0) {
          const firstService = weddingPackage.services[0];
          serviceIdForLock = typeof firstService === 'object' && 'serviceId' in firstService ? firstService.serviceId : String(firstService);
        } else {
          serviceIdForLock = weddingPackage.id || weddingPackage._id;
        }
      }

      if (isWeddingPackage && weddingPackage) {
        const weddingLockRequest = {
          packageId: weddingPackage.id || weddingPackage._id,
          selectedSlot: {
            date: selectedDate.toISOString(),
            startTime: slot.startTime,
            endTime: slot.endTime,
            location: isHomeService && homeServiceLocation ? homeServiceLocation : null,
            totalAmount: weddingPackage.discountedPrice || weddingPackage.totalPrice || 0,
            depositAmount: (weddingPackage as any).depositAmount || 0
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
        setLockedSlot({
          slot,
          lockToken: lockData.lockId,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000)
        });

        if (onLockAcquired && lockData.lockId) {
          onLockAcquired(lockData.lockId, lockData.appointmentId);
        }

        onSelectTime(slot.startTime);
        toast.success('Slot locked! You have 30 minutes to complete booking.');
        setSlots(prev => prev.filter(s => s.startTime !== slot.startTime));
        return;
      }

      // Standard Lock
      let serviceAmount = 0;
      let addOnsAmount = 0;
      const addOns: any[] = [];

      if (selectedServices && selectedServices.length > 0) {
        selectedServices.forEach(s => {
          serviceAmount += Number(s.discountedPrice || s.price || 0);
          if (s.selectedAddons) {
            s.selectedAddons.forEach(a => {
              addOnsAmount += Number(a.price || 0);
              addOns.push({ _id: a._id, name: a.name, price: a.price, duration: a.duration });
            });
          }
        });
      }

      const totalAmount = serviceAmount + addOnsAmount;

      const lockRequest = {
        vendorId: effectiveVendorId,
        staffId: selectedStaff?.id || 'any',
        serviceId: serviceIdForLock,
        serviceName: effectiveService?.name || 'Service',
        date: selectedDate.toISOString(),
        startTime: slot.startTime,
        endTime: slot.endTime,
        clientId: user?._id || user?.id || 'temp-client-id',
        clientName: user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Customer') : 'Customer',
        isHomeService,
        isWeddingService: isWeddingService,
        duration: slot.duration,
        amount: Math.round(serviceAmount),
        addOnsAmount: Math.round(addOnsAmount),
        totalAmount: Math.round(totalAmount),
        finalAmount: Math.round((totalAmount + (platformFee || 0) + (serviceTax || 0)) - (discountAmount || 0)),
        platformFee: Math.round(platformFee || 0),
        serviceTax: Math.round(serviceTax || 0),
        taxRate,
        couponCode,
        discountAmount: Math.round(discountAmount || 0),
        addOns,
        location: isHomeService ? homeServiceLocation : null
      };

      const response = await fetch('/api/booking/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lockRequest)
      });

      if (!response.ok) throw new Error('Slot no longer available');

      const lockData = await response.json();
      if (onLockAcquired && lockData.lockId) onLockAcquired(lockData.lockId, lockData.appointmentId);

      setLockedSlot({
        slot,
        lockToken: lockData.lockId,
        appointmentId: lockData.appointmentId,
        expiresAt: new Date(lockData.expiresAt || (Date.now() + 15 * 60 * 1000))
      } as any);

      onSelectTime(slot.startTime);
      toast.success('Slot locked! You have 15 minutes to complete booking.');
    } catch (error: any) {
      toast.error(error.message || 'This slot was just booked.');
      await fetchSlots(false);
    } finally {
      setIsLocking(false);
    }
  }, [effectiveVendorId, selectedStaff, selectedService, service, selectedServices, selectedDate, isHomeService, isWeddingService,
    isWeddingPackage, weddingPackage, weddingPackageServices, homeServiceLocation, onSelectTime, fetchSlots, isLocking]);

  const handleReleaseLock = useCallback(async () => {
    if (!lockedSlot) return;
    try {
      await fetch('/api/booking/release-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lockToken: lockedSlot.lockToken })
      });
      setLockedSlot(null);
      setLockCountdown(null);
      onSelectTime(null);
      fetchSlots(false);
    } catch (error) {}
  }, [lockedSlot, onSelectTime, fetchSlots]);

  const handleRefresh = useCallback(() => {
    fetchSlots(false);
    toast.success('Slots refreshed!');
  }, [fetchSlots]);

  const currentMonthYear = useMemo(() => format(selectedDate, 'MMMM yyyy'), [selectedDate]);

  const handleDateScroll = (direction: 'left' | 'right') => {
    if (dateScrollerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      dateScrollerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const dates = useMemo(() => Array.from({ length: 60 }, (_, i) => addDays(new Date(), i)), []);

  return (
    <div className="w-full">
      <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} isWeddingPackage={isWeddingPackage} isHomeService={isHomeService} />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Clock className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold font-headline">Select Date & Time</h2>
        </div>
        <p className="text-muted-foreground">Choose a convenient time for your appointment.</p>
      </div>

      {/* Service Summary for Weddings (Matching Existing UI Style) */}
      {isWeddingPackage && (weddingPackage || weddingPackageServices) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Scissors className="h-4 w-4" />
            Your Services:
          </h3>
          <div className="space-y-2">
            {(weddingPackageServices || []).map((assignment: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{assignment.name || assignment.serviceName}</span>
                <span className="text-muted-foreground">
                  {assignment.duration || assignment.serviceDuration} min
                </span>
              </div>
            ))}
          </div>
          {(weddingPackage as any)?.duration && (
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between font-semibold">
              <span>Total Duration:</span>
              <span>{(weddingPackage as any).duration} minutes</span>
            </div>
          )}
        </div>
      )}

      {/* Date Scroller (Matching Existing UI Style) */}
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

        <div id="date-scroller" ref={dateScrollerRef} className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
          {dates.map((date: Date) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
            const isAvailable = isDateAvailable(date);
            const isSelected = selectedDate.toDateString() === date.toDateString();

            return (
              <Button
                key={date.toISOString()}
                variant={isSelected ? 'default' : 'outline'}
                className={cn(
                  'flex-shrink-0 flex flex-col items-center justify-center h-20 w-16 rounded-lg transition-all',
                  isSelected && 'ring-2 ring-primary ring-offset-2',
                  (isPast || !isAvailable) && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => !isPast && isAvailable && onSelectDate(date)}
                disabled={isPast || !isAvailable}
              >
                <span className="text-[10px] font-medium uppercase">
                  {isToday ? 'Today' : format(date, 'EEE')}
                </span>
                <span className="text-2xl font-bold">{format(date, 'd')}</span>
                <span className="text-[10px] font-medium uppercase">{format(date, 'MMM')}</span>
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
          <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={isLoadingSlots} className="ml-auto">
            <RefreshCw className={cn("h-4 w-4", (isLoadingSlots || isBackgroundRefreshing) && "animate-spin")} />
          </Button>
        </div>

        {isLoadingSlots ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Checking availability...</span>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No available slots</h3>
            <p className="text-muted-foreground">We couldn't find any available time slots for {format(selectedDate, 'MMMM d')}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {slots.map((slot) => (
              <Button
                key={slot.startTime}
                variant={selectedTime === slot.startTime ? 'default' : 'outline'}
                className={cn(
                  "h-14 rounded-lg flex flex-col items-center justify-center transition-all",
                  selectedTime === slot.startTime && "ring-2 ring-primary ring-offset-2"
                )}
                onClick={() => handleTimeSelect(slot)}
                disabled={isLocking}
              >
                <span className="text-lg font-bold">{slot.startTime}</span>
                <span className="text-[10px] opacity-70 uppercase tracking-tighter">Available</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {isLocking && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="font-medium">Locking slot...</span>
          </div>
        </div>
      )}
    </div>
  );
});

Step3_TimeSlot.displayName = 'Step3_TimeSlot';
