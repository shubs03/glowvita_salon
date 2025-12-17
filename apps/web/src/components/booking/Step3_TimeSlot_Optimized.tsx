"use client";

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import { Clock, Loader2, RefreshCw, Lock, AlertCircle } from 'lucide-react';
import { cn } from '@repo/ui/cn';
import { toast } from 'react-toastify';
import { Service, StaffMember, WeddingPackage } from '@/hooks/useBookingData';

// Simple Calendar implementation (replace with your actual calendar component)
const Calendar = ({ mode, selected, onSelect, disabled, className }: any) => (
  <div className={className}>
    <input 
      type="date" 
      value={selected?.toISOString().split('T')[0]} 
      onChange={(e) => onSelect?.(new Date(e.target.value))}
      min={new Date().toISOString().split('T')[0]}
      className="w-full p-2 border rounded-md"
    />
  </div>
);

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
  vendorId: string;
  selectedService: Service | null;
  isHomeService?: boolean;
  isWeddingService?: boolean;
  weddingPackage?: WeddingPackage | null;
  homeServiceLocation?: any;
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
  selectedService,
  isHomeService = false,
  isWeddingService = false,
  weddingPackage,
  homeServiceLocation
}: Step3TimeSlotProps) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [lockedSlot, setLockedSlot] = useState<SlotLock | null>(null);
  const [lockCountdown, setLockCountdown] = useState<number | null>(null);
  const [isLocking, setIsLocking] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isStale, setIsStale] = useState(false);

  // Fetch slots from API
  const fetchSlots = useCallback(async () => {
    if (!vendorId || !selectedDate || !selectedService) return;

    setIsLoadingSlots(true);
    setSlotsError(null);

    try {
      const params = new URLSearchParams({
        vendorId,
        staffId: selectedStaff?.id || 'any',
        serviceIds: selectedService.id,
        date: selectedDate.toISOString(),
        isHomeService: isHomeService.toString(),
        isWeddingService: isWeddingService.toString(),
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
  }, [vendorId, selectedDate, selectedService, selectedStaff, isHomeService, isWeddingService, 
      weddingPackage, homeServiceLocation]);

  // Fetch slots on mount and when dependencies change
  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Auto-refresh slots every 30 seconds
  useEffect(() => {
    if (!vendorId || !selectedDate) return;

    const refreshInterval = setInterval(() => {
      fetchSlots();
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, [vendorId, selectedDate, fetchSlots]);

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

    setIsLocking(true);

    try {
      // Prepare lock request
      const lockRequest = {
        vendorId,
        staffId: selectedStaff?.id || 'any',
        serviceId: selectedService?.id,
        serviceName: selectedService?.name,
        date: selectedDate.toISOString(),
        startTime: slot.startTime,
        endTime: slot.endTime,
        clientId: 'temp-client-id', // TODO: Replace with actual client ID from auth
        clientName: 'Customer', // TODO: Replace with actual client name
        staffName: selectedStaff?.name || 'Any Professional',
        isHomeService,
        isWeddingService,
        location: homeServiceLocation,
        duration: slot.duration,
        amount: slot.services?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0,
        totalAmount: slot.services?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0,
        finalAmount: slot.services?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0
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

      // Store lock
      setLockedSlot({
        slot,
        lockToken: lockData.lockToken,
        expiresAt: new Date(lockData.lockExpiration)
      });

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
  }, [vendorId, selectedStaff, selectedService, selectedDate, isHomeService, isWeddingService, 
      homeServiceLocation, onSelectTime, fetchSlots, isLocking]);

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

  // Loading state
  if (parentLoading || isLoadingSlots) {
    return (
      <div className="w-full">
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Date Selection */}
        <div>
          <h3 className="font-semibold mb-3">Select Date</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onSelectDate(date)}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            className="rounded-md border"
          />
        </div>

        {/* Time Slots */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Available Time Slots</h3>
            <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={isLoadingSlots}>
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
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
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
                      {slot.startTime} - {slot.endTime}
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
