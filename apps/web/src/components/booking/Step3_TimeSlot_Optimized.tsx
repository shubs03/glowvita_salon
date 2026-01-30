"use client";

import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import { Clock, Loader2, RefreshCw, Lock, AlertCircle, ChevronRight, ChevronLeft, CalendarDays } from 'lucide-react';
import { cn } from '@repo/ui/cn';
import { toast } from 'react-toastify';
import { Service, StaffMember, WeddingPackage } from '@/hooks/useBookingData';
import { format, addDays } from 'date-fns';

// Breadcrumb navigation component
const Breadcrumb = ({ currentStep, setCurrentStep, isWeddingPackage }: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isWeddingPackage?: boolean;
}) => {
  // Wedding packages skip step 2 (staff selection)
  // Step mapping: 
  // Regular: [1, 2, 3, 4] -> ['Select Service', 'Select Professional', 'Select Date & Time', 'Confirm Booking']
  // Wedding: [1, 3, 4, 5] -> ['Select Package', 'Select Date & Time', 'Location Selection', 'Confirm Booking']
  
  const steps = isWeddingPackage
    ? [
        { name: 'Select Package', step: 1 },
        { name: 'Select Date & Time', step: 3 },
        { name: 'Confirm Booking', step: 4 }
      ]
    : [
        { name: 'Select Service', step: 1 },
        { name: 'Select Professional', step: 2 },
        { name: 'Select Date & Time', step: 3 },
        { name: 'Confirm Booking', step: 4 }
      ];

  return (
    <nav className="flex items-center text-sm font-medium text-muted-foreground mb-6">
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
    {[...Array(12)].map((_, i) => (
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
  const dateScrollerRef = useRef<HTMLDivElement>(null);

  // Use salonId or vendorId (they're the same)
  const effectiveVendorId = vendorId || salonId;
  // Use service or selectedService
  const effectiveService = service || selectedService;

  // Fetch slots from API
  const fetchSlots = useCallback(async () => {
    if (!effectiveVendorId || !selectedDate || !effectiveService) return;

    setIsLoadingSlots(true);
    setSlotsError(null);

    try {
      // For wedding packages, we need to send the service IDs from the package services
      let serviceIdsParam = effectiveService.id;
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
      setSlots(data.slots || []);
      setLastRefresh(new Date());
    } catch (error: any) {
      console.error('Error fetching slots:', error);
      setSlotsError(error.message || 'Failed to load available slots');
      toast.error('Could not load available time slots. Please try again.');
    } finally {
      setIsLoadingSlots(false);
    }
  }, [effectiveVendorId, selectedDate, effectiveService, selectedStaff, isHomeService, isWeddingService,
    isWeddingPackage, weddingPackage, weddingPackageServices, homeServiceLocation]);

  // Fetch slots on mount and when dependencies change
  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Auto-refresh slots every 30 seconds
  useEffect(() => {
    if (!effectiveVendorId || !selectedDate) return;

    const refreshInterval = setInterval(() => {
      fetchSlots();
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, [effectiveVendorId, selectedDate, fetchSlots]);

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
        fetchSlots(); // Refresh slots
      } else {
        setLockCountdown(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedSlot, onSelectTime, fetchSlots]);

  // Handle slot lock acquisition
  const handleTimeSelect = useCallback(async (slot: TimeSlot) => {
    if (isLocking) return;

    // INDUSTRY BEST PRACTICE: Release existing lock before acquiring a new one
    // This prevents one user from blocking multiple slots.
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
      // Use effectiveVendorId to ensure we have a valid vendor ID
      if (!effectiveVendorId) {
        throw new Error('Vendor ID is required but not available');
      }

      // Prepare lock request
      // For wedding packages, use the package ID and get service IDs from package services
      const effectiveService = service || selectedService || (selectedServices && selectedServices[0]);
      let serviceIdForLock = effectiveService?.id;

      // If it's a wedding package, we still need a serviceId for the lock
      // Use the first service from the package or the package ID itself
      if (isWeddingPackage && weddingPackage) {
        // Use the first service from wedding package services, or fallback to a placeholder
        if (weddingPackageServices && weddingPackageServices.length > 0) {
          serviceIdForLock = weddingPackageServices[0].serviceId || weddingPackageServices[0].id || weddingPackageServices[0]._id;
        } else if (weddingPackage.services && weddingPackage.services.length > 0) {
          const firstService = weddingPackage.services[0];
          serviceIdForLock = typeof firstService === 'object' && 'serviceId' in firstService ? firstService.serviceId : String(firstService);
        } else {
          // Use the package ID as serviceId if no services found
          serviceIdForLock = weddingPackage.id || weddingPackage._id;
        }
      }

      // For wedding packages, use the wedding-package specific lock endpoint
      // which doesn't create a temporary appointment
      if (isWeddingPackage && weddingPackage) {
        console.log('Using wedding package lock endpoint');

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
          clientId: (weddingPackage as any).clientId || 'temp-client-id', 
          clientName: 'Customer', 
          customerDetails: {
            name: 'Customer',
            phone: null
          }
        };

        console.log('Sending wedding package lock request:', weddingLockRequest);

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

        // Store lock - backend returns lockId
        setLockedSlot({
          slot,
          lockToken: lockData.lockId,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
        });

        console.log('Wedding package slot locked successfully');

        // Notify parent component about the lock token
        if (onLockAcquired && lockData.lockId) {
          onLockAcquired(lockData.lockId, lockData.appointmentId);
        }

        // Trigger the next step by calling onSelectTime
        onSelectTime(slot.startTime);
        toast.success('Slot locked! You have 30 minutes to complete booking.');

        // Remove locked slot from available slots (optimistic update)
        setSlots(prev => prev.filter(s => s.startTime !== slot.startTime));

        return;
      }

      // For regular services, use the standard booking lock endpoint
      // Build lock request - only include location if it's actually for a home service
      // Calculate amounts and add-ons from selectedServices state
      let serviceAmount = 0;
      let addOnsAmount = 0;
      const addOns: { _id: string; name: string; price: number; duration: number; }[] = [];

      if (selectedServices && selectedServices.length > 0) {
        selectedServices.forEach(service => {
          const basePrice = service.discountedPrice !== null && service.discountedPrice !== undefined
            ? Number(service.discountedPrice)
            : Number(service.price || 0);
          serviceAmount += basePrice;

          if (service.selectedAddons) {
            service.selectedAddons.forEach(addon => {
              const addonPrice = Number(addon.price) || 0;
              addOnsAmount += addonPrice;
              addOns.push({
                _id: addon._id || (addon as any).id,
                name: addon.name,
                price: addonPrice,
                duration: addon.duration || 0
              });
            });
          }
        });
      } else if (effectiveService) {
        // Fallback for single service if selectedServices is not populated
        const basePrice = effectiveService.discountedPrice !== null && effectiveService.discountedPrice !== undefined
          ? Number(effectiveService.discountedPrice)
          : Number(effectiveService.price || 0);
        serviceAmount += basePrice;
      }

      const totalAmount = serviceAmount + addOnsAmount;

      const lockRequest: any = {
        vendorId: effectiveVendorId,
        staffId: selectedStaff?.id || 'any',
        serviceId: serviceIdForLock,
        serviceName: effectiveService?.name || 'Service',
        date: selectedDate.toISOString(),
        startTime: slot.startTime,
        endTime: slot.endTime,
        clientId: user?._id || user?.id || (effectiveService as any)?.clientId || 'temp-client-id', 
        clientName: user ? `${user.firstName} ${user.lastName}` : 'Customer', 
        staffName: selectedStaff?.name || 'Any Professional',
        isHomeService,
        isWeddingService: isWeddingService,
        duration: slot.duration || effectiveService?.duration,
        amount: Math.round(serviceAmount),
        addOnsAmount: Math.round(addOnsAmount),
        totalAmount: Math.round(totalAmount),
        finalAmount: Math.round((totalAmount + (platformFee || 0) + (serviceTax || 0)) - (discountAmount || 0)),
        platformFee: Math.round(platformFee || 0),
        serviceTax: Math.round(serviceTax || 0),
        taxRate: taxRate,
        couponCode,
        discountAmount: Math.round(discountAmount || 0),
        addOns: selectedService?.selectedAddons || addOns, // Ensure this is passed as well
        addOnIds: (selectedService?.selectedAddons || addOns).map((a: any) => a._id || a.id),
        selectedAddOns: (selectedService?.selectedAddons || addOns).map((a: any) => a._id || a.id),
      };

      // Only include location if it's actually provided and valid
      if (isHomeService && homeServiceLocation && homeServiceLocation.lat && homeServiceLocation.lng) {
        lockRequest.location = homeServiceLocation;
      }

      console.log('Sending lock request:', lockRequest);

      // Only include location if it's actually provided and valid
      if (isHomeService && homeServiceLocation && homeServiceLocation.lat && homeServiceLocation.lng) {
        lockRequest.location = homeServiceLocation;
      }

      console.log('Sending lock request:', lockRequest);

      const response = await fetch('/api/booking/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lockRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.message || 'Slot no longer available');
      }

      const lockData = await response.json();

      console.log('Lock response received:', lockData);

      if (onLockAcquired && lockData.lockId) {
        onLockAcquired(lockData.lockId, lockData.appointmentId);
      }

      // Store lock state locally
      setLockedSlot({
        slot,
        lockToken: lockData.lockId,
        appointmentId: lockData.appointmentId,
        expiresAt: new Date(lockData.expiresAt || (Date.now() + 15 * 60 * 1000))
      } as any);

      onSelectTime(slot.startTime);
      toast.success('Slot locked! You have 15 minutes to complete booking.');

      // Remove locked slot from available slots (optimistic update)
      setSlots(prev => prev.filter(s => s.startTime !== slot.startTime));

    } catch (error: any) {
      console.error('Slot lock error:', error);
      toast.error(error.message || 'This slot was just booked. Please select another time.');

      // Refresh slots to get updated availability
      await fetchSlots();
    } finally {
      setIsLocking(false);
    }
  }, [effectiveVendorId, selectedStaff, selectedService, service, selectedServices, selectedDate, isHomeService, isWeddingService,
    isWeddingPackage, weddingPackage, weddingPackageServices, homeServiceLocation, onSelectTime, fetchSlots, isLocking]);

  // Release lock manually
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
      toast.info('Slot lock released');
      fetchSlots();
    } catch (error) {
      console.error('Error releasing lock:', error);
    }
  }, [lockedSlot, onSelectTime, fetchSlots]);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    fetchSlots();
    toast.success('Slots refreshed!');
  }, [fetchSlots]);

  // Memoized formatted countdown
  const formattedCountdown = useMemo(() => {
    if (!lockCountdown) return null;
    const minutes = Math.floor(lockCountdown / 60);
    const seconds = lockCountdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [lockCountdown]);

  // Memoized grouped slots (for "Any Staff" view)
  const groupedSlots = useMemo(() => {
    return slots.reduce((acc, slot) => {
      const key = `${slot.startTime}-${slot.endTime}`;
      if (!acc[key]) {
        acc[key] = { ...slot, staffCount: slot.availableStaff?.length || 1 };
      }
      return acc;
    }, {} as Record<string, any>);
  }, [slots]);

  const displaySlots = useMemo(() => {
    return selectedStaff?.id === 'any' || !selectedStaff
      ? Object.values(groupedSlots)
      : slots;
  }, [selectedStaff, slots, groupedSlots]);

  // Generate available dates (next 60 days)
  const dates = useMemo(() => Array.from({ length: 60 }, (_, i) => addDays(new Date(), i)), []);

  const currentMonthYear = useMemo(() => format(selectedDate, 'MMMM yyyy'), [selectedDate]);

  // Handle date scroll
  const handleDateScroll = (direction: 'left' | 'right') => {
    if (dateScrollerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      dateScrollerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Scroll selected date into view
  useEffect(() => {
    const selectedDateElement = document.getElementById(`date-${format(selectedDate, 'yyyy-MM-dd')}`);
    if (selectedDateElement && dateScrollerRef.current) {
      const container = dateScrollerRef.current;
      const scrollLeft = selectedDateElement.offsetLeft - container.offsetLeft - (container.offsetWidth / 2) + (selectedDateElement.offsetWidth / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [selectedDate]);

  // Loading state
  if (parentLoading || isLoadingSlots) {
    return (
      <div className="w-full">
        <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} isWeddingPackage={isWeddingPackage} />
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold font-headline">Select Date & Time</h2>
          </div>
          <p className="text-muted-foreground">Choose a convenient date and time for your appointment.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">Select Date</h3>
            <div className="h-80 bg-gray-100 animate-pulse rounded-lg" />
          </div>

          <div>
            <h3 className="font-semibold mb-3">Available Time Slots</h3>
            <TimeSlotSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (parentError || slotsError) {
    return (
      <div className="w-full">
        <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} isWeddingPackage={isWeddingPackage} />
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
          <p className="text-destructive mb-4">Failed to load time slots</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} isWeddingPackage={isWeddingPackage} />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Clock className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold font-headline">Select Date & Time</h2>
        </div>
        <p className="text-muted-foreground">Choose a convenient date and time for your appointment.</p>
      </div>

      {/* Stale data warning */}
      {isStale && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-yellow-800">
            Availability may have changed. Refresh to see latest slots.
          </span>
          <Button size="sm" variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      )}

      {/* Locked slot indicator */}
      {lockedSlot && formattedCountdown && (
        <div className="mb-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">
                  Slot Locked: {lockedSlot.slot.startTime} - {lockedSlot.slot.endTime}
                </p>
                <p className="text-sm text-green-700">
                  Time remaining: <span className="font-mono font-bold">{formattedCountdown}</span>
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleReleaseLock}>
              Release Lock
            </Button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-1 gap-6">
        {/* Date Scroller with Month and Navigation */}
        <div>
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
          <div id="date-scroller" ref={dateScrollerRef} className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
            {dates.map((date: Date) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
              return (
                <Button
                  key={date.toISOString()}
                  id={`date-${format(date, 'yyyy-MM-dd')}`}
                  variant={selectedDate.toDateString() === date.toDateString() ? 'default' : 'outline'}
                  className={cn(
                    'flex-shrink-0 flex flex-col items-center justify-center h-20 w-16 rounded-lg',
                    selectedDate.toDateString() === date.toDateString() && 'ring-2 ring-primary ring-offset-2',
                    isPast && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => !isPast && onSelectDate(date)}
                  disabled={isPast}
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
            <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={isLoadingSlots} className="ml-auto">
              <RefreshCw className={cn("h-4 w-4", isLoadingSlots && "animate-spin")} />
            </Button>
          </div>

          {displaySlots.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No available slots for this date</p>
              <p className="text-sm text-muted-foreground mt-2">Try selecting a different date</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto pr-2 no-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {displaySlots.map((slot) => {
                  const isSelected = selectedTime === slot.startTime;
                  const isLocked = lockedSlot?.slot.startTime === slot.startTime;

                  return (
                    <button
                      key={slot.startTime}
                      onClick={() => !isLocked && handleTimeSelect(slot)}
                      disabled={isLocking || isLocked}
                      className={cn(
                        "p-3 border-2 rounded-lg transition-all text-left",
                        isLocked
                          ? "border-green-500 bg-green-50 cursor-default"
                          : isSelected
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-primary hover:bg-primary/5",
                        isLocking && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="font-semibold text-sm">
                        {slot.startTime}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {slot.duration} min
                      </div>
                      {slot.travelTime && slot.travelTime > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          +{slot.travelTime} min travel
                        </div>
                      )}
                      {slot.staffCount && slot.staffCount > 1 && (
                        <div className="text-xs text-purple-600 mt-1">
                          {slot.staffCount} staff available
                        </div>
                      )}
                      {isLocked && (
                        <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Locked
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay during lock acquisition */}
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
