"use client";

import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import { Clock, Loader2, RefreshCw, Lock, AlertCircle, ChevronRight, ChevronLeft, CalendarDays, Scissors } from 'lucide-react';
import { cn } from '@repo/ui/cn';
import { toast } from 'react-toastify';
import { Service, StaffMember, WeddingPackage } from '@/hooks/useBookingData';
import { format, addDays } from 'date-fns';

// Skeleton loader for time slots
const TimeSlotSkeleton = memo(() => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="h-10 bg-gray-200 animate-pulse rounded-[7px]" />
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
  totalTravelTime?: number;
  travelDistance?: number;
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

  const selectedSlot = useMemo(() => {
    return slots.find((slot) => slot.startTime === selectedTime) || null;
  }, [slots, selectedTime]);

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error?.message || 'Failed to fetch slots');
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
      let errMsg = error.message || 'Failed to load available slots';
      try {
        if (errMsg.startsWith('{')) {
          const parsed = JSON.parse(errMsg);
          errMsg = parsed.message || parsed.error?.message || errMsg;
        }
      } catch (e) {}
      setSlotsError(errMsg);
      toast.error(errMsg);
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
        // Wait for release lock to finish without triggering a background fetch
        await handleReleaseLock(true);
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
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error?.message || 'Slot no longer available');
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
        // Fetch fresh slots from the server to ensure UI is in sync
        await fetchSlots(true);
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error?.message || 'Slot no longer available');
      }

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
      // Fetch fresh slots from the server to ensure UI is in sync
      await fetchSlots(true);
    } catch (error: any) {
      toast.error(error.message || 'This slot was just booked.');
      await fetchSlots(false);
    } finally {
      setIsLocking(false);
    }
  }, [effectiveVendorId, selectedStaff, selectedService, service, selectedServices, selectedDate, isHomeService, isWeddingService,
    isWeddingPackage, weddingPackage, weddingPackageServices, homeServiceLocation, onSelectTime, fetchSlots, isLocking]);

  const handleReleaseLock = useCallback(async (skipFetch = false) => {
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
      if (!skipFetch) {
        fetchSlots(false);
      }
    } catch (error) {}
  }, [lockedSlot, onSelectTime, fetchSlots]);

  const handleRefresh = useCallback(() => {
    fetchSlots(false);
    toast.success('Slots refreshed!');
  }, [fetchSlots]);

  const currentMonthYear = useMemo(() => format(selectedDate, 'MMMM yyyy'), [selectedDate]);

  const handleDateScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('date-scroller');
    if (container) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const dates = useMemo(() => Array.from({ length: 60 }, (_, i) => addDays(new Date(), i)), []);

  // Reusable back-arrow + title header (matches MultiService design)
  const PageHeader = () => (
    <div className="flex items-center gap-2 mb-1 cursor-pointer w-fit"
      onClick={() => {
        if (lockedSlot) {
          handleReleaseLock(true);
        } else {
          onSelectTime(null);
        }
        setCurrentStep(currentStep - 1);
      }}
    >
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
  if (parentError) {
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
          <p className="text-destructive mb-4">{parentError?.message || 'An error occurred'}</p>
          <Button onClick={() => fetchSlots()} variant="outline" className="border-[#422A3C] text-[#422A3C] hover:bg-white">
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

        {lockCountdown !== null && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-amber-800 animate-pulse">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Slot reserved! Complete booking in:</span>
            </div>
            <span className="text-xl font-bold tabular-nums">
              {Math.floor(lockCountdown / 60)}:{(lockCountdown % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* Card wrapper — bg #eff5fcff, rounded-[11px] */}
      <div className="rounded-[11px] px-[26px] py-5">
        <div className="bg-[#eff5fcff] rounded-[11px] px-3 py-2 mb-3 shadow-sm">

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
                          : isSelected
                            ? "border-[#422A3C] border-2 bg-[#EBF3FD] text-[#422A3C]"
                            : isToday
                              ? "border-[#422A3C] text-[#422A3C]"
                              : "border-black text-black hover:border-[#422A3C]/50"
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
        <div className="flex items-center justify-between mb-4 mt-2">
          <div className="flex items-center gap-2">
            <Clock className="h-[17px] w-[17px] text-black" strokeWidth={1.75} />
            <span className="text-black">Select Time</span>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
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
        ) : slotsError ? (
          <div className="text-center py-10 bg-white rounded-[11px] border border-amber-200 p-8 shadow-sm max-w-lg mx-auto">
            <div className="p-3 bg-amber-100 rounded-full text-amber-600 w-fit mx-auto mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-amber-900 mb-2">Availability issue</h3>
            <p className="text-amber-700 mb-6 text-sm">{slotsError}</p>
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
            <p className="text-xs text-muted-foreground mt-2">Try selecting a different date or a different professional.</p>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto pr-2 no-scrollbar space-y-5">
            {(() => {
              const morningSlots = slots.filter((s: TimeSlot) => {
                const h = parseInt(s.startTime.split(':')[0], 10);
                return h < 12;
              });
              const afternoonSlots = slots.filter((s: TimeSlot) => {
                const h = parseInt(s.startTime.split(':')[0], 10);
                return h >= 12 && h < 16;
              });
              const eveningSlots = slots.filter((s: TimeSlot) => {
                const h = parseInt(s.startTime.split(':')[0], 10);
                return h >= 16;
              });

              const renderGroup = (label: string, dotColor: string, groupSlots: TimeSlot[]) => {
                if (groupSlots.length === 0) return null;
                return (
                  <div key={label}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: dotColor }} />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {groupSlots.map((slot: TimeSlot, index: number) => {
                        const isSelected = selectedTime === slot.startTime;
                        return (
                          <button
                            key={`${slot.startTime}-${index}`}
                            type="button"
                            onClick={() => !isLocking && handleTimeSelect(slot)}
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
    </div>
  );
});

Step3_TimeSlot.displayName = 'Step3_TimeSlot';