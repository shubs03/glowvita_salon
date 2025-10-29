"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '@repo/ui/button';
import { Label } from '@repo/ui/label';
import { addDays, format, isSameDay, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Users, Clock, Loader2, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { cn } from '@repo/ui/cn';
import { StaffMember, WorkingHours, TimeSlot } from '@/hooks/useBookingData';
import { useGetPublicAppointmentsQuery } from '@repo/store/api';

const Breadcrumb = ({ currentStep, setCurrentStep }: { currentStep: number; setCurrentStep: (step: number) => void; }) => {
    const steps = ['Services', 'Select Professional', 'Time Slot'];
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

interface Step3TimeSlotProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    selectedTime: string | null;
    onSelectTime: (time: string | null) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    selectedStaff: StaffMember | null;
    onSelectStaff: (staff: StaffMember | null) => void;
    staff: StaffMember[];
    workingHours: WorkingHours[];
    isLoading: boolean;
    error?: any;
    vendorId?: string; // Add vendorId for checking existing appointments
    selectedService?: any; // Add selected service for duration calculation
}

// Helper function to generate time slots based on working hours
const generateTimeSlots = (startTime: string, endTime: string, interval: number = 30): string[] => {
    const slots: string[] = [];
    const start = new Date(`2023-01-01 ${startTime}`);
    const end = new Date(`2023-01-01 ${endTime}`);
    
    let current = new Date(start);
    while (current < end) {
        slots.push(format(current, 'HH:mm'));
        current.setMinutes(current.getMinutes() + interval);
    }
    
    return slots;
};

// Helper function to generate time slots from staff slots
const generateTimeSlotsFromStaffSlots = (slots: any[]): string[] => {
    const timeSlots: string[] = [];
    slots.forEach(slot => {
        // Convert start and end times to Date objects for easier manipulation
        const start = new Date(`2023-01-01 ${slot.startTime}`);
        const end = new Date(`2023-01-01 ${slot.endTime}`);
        
        // Generate 30-minute intervals between start and end times
        let current = new Date(start);
        while (current < end) {
            timeSlots.push(format(current, 'HH:mm'));
            current.setMinutes(current.getMinutes() + 30);
        }
    });
    return timeSlots;
};

// Helper function to check if a time slot conflicts with existing appointments FOR A SPECIFIC STAFF
const isTimeSlotBookedForStaff = (appointments: any[], date: Date, time: string, staffId: string, serviceDuration: number = 60): boolean => {
    if (!appointments || appointments.length === 0) {
        return false;
    }
    
    const timeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
    const endTimeMinutes = timeMinutes + serviceDuration;
    const dateString = format(date, 'yyyy-MM-dd');
    
    console.log(`Checking time slot ${time} (${timeMinutes}-${endTimeMinutes}) for staff ${staffId} on ${dateString}`);
    
    return appointments.some(appointment => {
        // Check if appointment is on the same date
        const appointmentDateString = format(new Date(appointment.date), 'yyyy-MM-dd');
        if (appointmentDateString !== dateString) {
            return false;
        }
        
        // Extract staff ID - for public appointments, staff is directly the staff ID
        let appointmentStaffId = null;
        if (appointment.staff) {
            // Handle different formats of staff data
            if (typeof appointment.staff === 'string') {
                appointmentStaffId = appointment.staff;
            } else if (typeof appointment.staff === 'object') {
                // If it's an object, check for _id or toString methods
                if (appointment.staff._id) {
                    appointmentStaffId = appointment.staff._id.toString();
                } else {
                    // Try to convert the object to string
                    try {
                        appointmentStaffId = appointment.staff.toString();
                    } catch (e) {
                        // If conversion fails, skip this appointment
                        return false;
                    }
                }
            } else {
                // Try to convert to string directly
                try {
                    appointmentStaffId = appointment.staff.toString();
                } catch (e) {
                    // If conversion fails, skip this appointment
                    return false;
                }
            }
        }
        
        console.log(`Comparing with appointment - Staff ID: ${appointmentStaffId}, Start: ${appointment.startTime}, End: ${appointment.endTime}`);
        
        // Special handling for "Any Professional" appointments (when staffId is null)
        // An "Any Professional" appointment should block ALL staff members for that time slot
        if (staffId === null && appointmentStaffId !== null) {
            // This is an "Any Professional" check, and the appointment has a specific staff
            // We need to check if there's any overlap regardless of staff
            console.log("Checking for 'Any Professional' availability - found specific staff appointment");
        } else if (staffId !== null && appointmentStaffId === null) {
            // This is a specific staff check, but the appointment is for "Any Professional"
            // This means the time slot is booked by "Any Professional" and should be blocked
            console.log("Specific staff check - found 'Any Professional' appointment, blocking slot");
        } else if (staffId !== null && appointmentStaffId !== null) {
            // Both are specific staff - only check if they're the same staff member
            if (appointmentStaffId.toString() !== staffId.toString()) {
                return false;
            }
        }
        // If both are null (both "Any Professional"), we still need to check time overlap
        
        // Check for time overlap
        const appointmentStartMinutes = parseInt(appointment.startTime.split(':')[0]) * 60 + parseInt(appointment.startTime.split(':')[1]);
        const appointmentEndMinutes = parseInt(appointment.endTime.split(':')[0]) * 60 + parseInt(appointment.endTime.split(':')[1]);
        
        // Check if the new time slot overlaps with existing appointment
        // Overlap occurs if: newStart < existingEnd AND newEnd > existingStart
        const isOverlapping = (timeMinutes < appointmentEndMinutes && endTimeMinutes > appointmentStartMinutes);
        console.log(`Time overlap check - New slot: ${timeMinutes}-${endTimeMinutes}, Appointment: ${appointmentStartMinutes}-${appointmentEndMinutes}, Overlapping: ${isOverlapping}`);
        
        return isOverlapping;
    });
};

// Helper function to check if a time slot conflicts with existing appointments
// For specific staff: checks if that staff is booked
// For "Any Professional": checks if ALL staff members are booked (returns true only if NO staff is available)
const isTimeSlotBooked = (appointments: any[], date: Date, time: string, staff: StaffMember | null, serviceDuration: number = 60, allStaff: StaffMember[] = []): boolean => {
    console.log('isTimeSlotBooked called with:', {
        appointmentsCount: appointments?.length || 0,
        date: format(date, 'yyyy-MM-dd'),
        time,
        staffId: staff?.id,
        serviceDuration,
        mode: staff ? 'Specific Staff' : 'Any Professional',
        totalStaffCount: allStaff.length
    });

    if (!appointments || appointments.length === 0) {
        console.log('No appointments to check - slot is available');
        return false;
    }
    
    // If specific staff is selected, check only their appointments
    if (staff) {
        const isBooked = isTimeSlotBookedForStaff(appointments, date, time, staff.id, serviceDuration);
        console.log(`Specific staff ${staff.name} (${staff.id}): ${isBooked ? 'BOOKED' : 'AVAILABLE'}`);
        return isBooked;
    }
    
    // For "Any Professional" case, check if the time slot is booked by:
    // 1. Any specific staff member
    // 2. Another "Any Professional" booking
    
    const timeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
    const endTimeMinutes = timeMinutes + serviceDuration;
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Check for any overlapping appointments
    for (const appointment of appointments) {
        const appointmentDateString = format(new Date(appointment.date), 'yyyy-MM-dd');
        if (appointmentDateString !== dateString) {
            continue;
        }
        
        const appointmentStartMinutes = parseInt(appointment.startTime.split(':')[0]) * 60 + parseInt(appointment.startTime.split(':')[1]);
        const appointmentEndMinutes = parseInt(appointment.endTime.split(':')[0]) * 60 + parseInt(appointment.endTime.split(':')[1]);
        
        // Check if the new time slot overlaps with existing appointment
        // Overlap occurs if: newStart < existingEnd AND newEnd > existingStart
        const isOverlapping = (timeMinutes < appointmentEndMinutes && endTimeMinutes > appointmentStartMinutes);
        
        if (isOverlapping) {
            console.log(`Time slot ${time} overlaps with appointment: ${appointment.startTime}-${appointment.endTime}`);
            return true;
        }
    }
    
    console.log(`No overlapping appointments found for time slot ${time}`);
    return false;
};

// Helper function to get day name from date
const getDayName = (date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[getDay(date)];
};

// Helper function to check if a time slot is blocked for a staff member
const isTimeSlotBlocked = (staff: StaffMember | null, date: Date, time: string): boolean => {
    if (!staff || !staff.blockedTimes || staff.blockedTimes.length === 0) {
        return false;
    }
    
    const dateString = format(date, 'yyyy-MM-dd');
    const timeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
    
    return staff.blockedTimes.some(blocked => {
        const blockedDate = new Date(blocked.date);
        const blockedDateString = format(blockedDate, 'yyyy-MM-dd');
        
        return (
            blockedDateString === dateString &&
            timeMinutes >= blocked.startMinutes &&
            timeMinutes < blocked.endMinutes
        );
    });
};

export function Step3_TimeSlot({
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
  isLoading,
  error,
  vendorId,
  selectedService
}: Step3TimeSlotProps) {
  const dateScrollerRef = useRef<HTMLDivElement>(null);
  const lastRefetchTimestamp = useRef<number>(Date.now());

  // Generate available dates (next 60 days)
  const dates = useMemo(() => Array.from({ length: 60 }, (_, i) => addDays(new Date(), i)), []);
  
  const currentMonthYear = useMemo(() => format(selectedDate, 'MMMM yyyy'), [selectedDate]);

  // Fetch existing appointments for the selected date and staff to check availability
  // For single service, we always fetch all appointments to properly handle "Any Professional" case
  const { data: existingAppointments = [], isLoading: isLoadingAppointments, refetch } = useGetPublicAppointmentsQuery(
    {
      vendorId: vendorId,
      // For single service, we need to check appointments for all staff to properly handle "Any Professional"
      // When a specific staff is selected, we still fetch all appointments to properly check conflicts
      staffId: undefined, // Always fetch all appointments for proper conflict detection
      date: format(selectedDate, 'yyyy-MM-dd')
    },
    {
      skip: !vendorId, // Skip if no vendorId provided
      refetchOnMountOrArgChange: true
    }
  );

  // Refetch appointments when selected date or staff changes to ensure we have the latest data
  // Also refetch when the component mounts to get the most recent appointments
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (vendorId && isMounted) {
        try {
          // Check if an appointment was just created
          const appointmentJustCreated = typeof window !== 'undefined' && sessionStorage.getItem('appointmentJustCreated') === 'true';
          
          // Add a small delay to ensure any pending writes are completed
          // This is especially important after appointment creation
          const delay = appointmentJustCreated ? 1500 : 100; // Longer delay if appointment was just created
          await new Promise(resolve => setTimeout(resolve, delay));
          
          console.log('Step3_TimeSlot: Refetching appointments data');
          await refetch();
          lastRefetchTimestamp.current = Date.now();
          
          // Clear the flag after refetching
          if (appointmentJustCreated && typeof window !== 'undefined') {
            console.log('Step3_TimeSlot: Cleared appointmentJustCreated flag after refetching');
            sessionStorage.removeItem('appointmentJustCreated');
          }
        } catch (error) {
          console.error('Step3_TimeSlot: Error refetching appointments:', error);
        }
      }
    };
    
    fetchData();
    
    // Refetch when the document becomes visible again (e.g., after switching tabs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && vendorId && isMounted) {
        fetchData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Periodically refetch appointments to ensure we have the latest data
    // This helps catch any appointments that might have been created by other users
    const intervalId = setInterval(() => {
      if (vendorId && isMounted && document.visibilityState === 'visible') {
        fetchData();
      }
    }, 30000); // Refetch every 30 seconds
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [vendorId, refetch]); // Simplified dependencies to prevent infinite loops

  // Additional check for appointment creation flag with a shorter interval
  useEffect(() => {
    let isMounted = true;
    
    const checkForNewAppointments = async () => {
      if (vendorId && isMounted && typeof window !== 'undefined' && sessionStorage.getItem('appointmentJustCreated') === 'true') {
        console.log('Step3_TimeSlot: Detected new appointment creation, forcing refetch');
        try {
          // Add a longer delay to ensure database consistency
          await new Promise(resolve => setTimeout(resolve, 1500));
          await refetch();
          sessionStorage.removeItem('appointmentJustCreated');
          lastRefetchTimestamp.current = Date.now();
          console.log('Step3_TimeSlot: Refetch completed after appointment creation');
        } catch (error) {
          console.error('Step3_TimeSlot: Error refetching after appointment creation:', error);
        }
      }
    };
    
    // Check immediately when component mounts
    checkForNewAppointments();
    
    // Check periodically
      const intervalId = setInterval(checkForNewAppointments, 5000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [vendorId, refetch]);

  console.log('Step3_TimeSlot - Fetching appointments:', {
    vendorId,
    staffId: selectedStaff?.id || 'Any Professional (all staff)',
    date: format(selectedDate, 'yyyy-MM-dd'),
    existingAppointments: existingAppointments,
    isLoadingAppointments,
    mode: selectedStaff ? 'Specific Staff' : 'Any Professional',
    lastRefetch: lastRefetchTimestamp.current
  });

  // Calculate service duration for overlap checking
  const serviceDuration = useMemo(() => {
    if (!selectedService) return 60; // Default 60 minutes
    
    const match = selectedService.duration?.match(/(\d+)\s*(min|hour|hours)/);
    if (!match) return 60;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    if (unit === 'min') return value;
    if (unit === 'hour' || unit === 'hours') return value * 60;
    return 60;
  }, [selectedService]);

  // Generate available time slots based on working hours for selected date
  const availableTimeSlots = useMemo(() => {
    console.log('=== Step3_TimeSlot - availableTimeSlots useMemo START ===');
    console.log('existingAppointments data:', existingAppointments);
    console.log('existingAppointments length:', existingAppointments?.length || 0);
    console.log('isLoadingAppointments:', isLoadingAppointments);
    console.log('Last refetch timestamp:', lastRefetchTimestamp.current);
    console.log('Step3_TimeSlot - Working Hours Details:', {
      selectedDate: format(selectedDate, 'EEEE, MMM d, yyyy'),
      workingHours: workingHours,
      selectedStaff: selectedStaff
    });
    
    // If no working hours data, return fallback slots
    if (!workingHours || workingHours.length === 0) {
      console.log('Step3_TimeSlot - No working hours data, using fallback time slots');
      return ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "16:00", "16:30", "17:00"];
    }

    const dayName = getDayName(selectedDate);
    
    // If a staff member is selected, use their specific working hours
    if (selectedStaff) {
      console.log(`Step3_TimeSlot - Using staff-specific hours for ${dayName}`);
      
      // Get the staff's slots for the selected day
      let staffSlots: TimeSlot[] = [];
      switch (dayName.toLowerCase()) {
        case 'monday':
          staffSlots = selectedStaff.mondaySlots || [];
          break;
        case 'tuesday':
          staffSlots = selectedStaff.tuesdaySlots || [];
          break;
        case 'wednesday':
          staffSlots = selectedStaff.wednesdaySlots || [];
          break;
        case 'thursday':
          staffSlots = selectedStaff.thursdaySlots || [];
          break;
        case 'friday':
          staffSlots = selectedStaff.fridaySlots || [];
          break;
        case 'saturday':
          staffSlots = selectedStaff.saturdaySlots || [];
          break;
        case 'sunday':
          staffSlots = selectedStaff.sundaySlots || [];
          break;
      }
      
      // If staff has specific slots, use them
      if (staffSlots.length > 0) {
        console.log('Step3_TimeSlot - Using staff slots:', staffSlots);
        const slots = generateTimeSlotsFromStaffSlots(staffSlots);
        console.log('Step3_TimeSlot - Generated slots from staff slots:', slots);
        
        // Filter out blocked time slots and existing appointments
        const filteredSlots = slots.filter((slot: string) => {
          const isBlocked = isTimeSlotBlocked(selectedStaff, selectedDate, slot);
          const isBooked = isTimeSlotBooked(existingAppointments, selectedDate, slot, selectedStaff, serviceDuration, staff);
          
          console.log(`Staff slot ${slot}: blocked=${isBlocked}, booked=${isBooked}, willShow=${!isBlocked && !isBooked}`);
          
          return !isBlocked && !isBooked;
        });
        console.log('Step3_TimeSlot - Filtered slots (after blocking and booking check):', filteredSlots);
        
        return filteredSlots;
      }
      
      // If staff has no specific slots, fall back to vendor hours
      console.log('Step3_TimeSlot - No staff slots, falling back to vendor hours');
    }
    
    // Use vendor working hours as fallback
    const dayWorkingHours = workingHours.find((wh: WorkingHours) => 
      wh.dayOfWeek.toLowerCase() === dayName.toLowerCase()
    );

    console.log('Step3_TimeSlot - Day working hours:', dayWorkingHours);

    if (!dayWorkingHours || !dayWorkingHours.isAvailable) {
      console.log('Step3_TimeSlot - Day not available, returning empty slots');
      return [];
    }

    const slots = generateTimeSlots(dayWorkingHours.startTime, dayWorkingHours.endTime);
    console.log('Step3_TimeSlot - Generated slots from vendor hours:', slots);
    
    // Filter out blocked time slots and existing appointments
    const filteredSlots = slots.filter((slot: string) => {
      const isBlocked = isTimeSlotBlocked(selectedStaff, selectedDate, slot);
      const isBooked = isTimeSlotBooked(existingAppointments, selectedDate, slot, selectedStaff, serviceDuration, staff);
      
      console.log(`Slot ${slot}: blocked=${isBlocked}, booked=${isBooked}, willShow=${!isBlocked && !isBooked}`);
      
      return !isBlocked && !isBooked;
    });
    console.log('Step3_TimeSlot - Filtered slots (after blocking and booking check):', filteredSlots);
    
    return filteredSlots;
  }, [selectedDate, workingHours, selectedStaff, existingAppointments, serviceDuration, staff, lastRefetchTimestamp.current]);

  // Check if a date is available based on working hours and staff availability
  const isDateAvailable = (date: Date): boolean => {
    if (!workingHours || workingHours.length === 0) return true;
    
    const dayName = getDayName(date);
    const dayWorkingHours = workingHours.find((wh: WorkingHours) => 
      wh.dayOfWeek.toLowerCase() === dayName.toLowerCase()
    );
    
    // Check if the staff is available on this day
    if (selectedStaff) {
      const dayKey = `${dayName.toLowerCase()}Available` as keyof StaffMember;
      if (selectedStaff[dayKey] === false) {
        console.log(`Step3_TimeSlot - Staff not available on ${dayName}`);
        return false;
      }
    }
    
    const result = dayWorkingHours?.isAvailable || false;
    console.log(`Step3_TimeSlot - Date ${format(date, 'yyyy-MM-dd')} availability:`, result);
    return result;
  };

  const handleDateScroll = (direction: 'left' | 'right') => {
    if (dateScrollerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      dateScrollerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Scroll the selected date into view
    const selectedDateElement = document.getElementById(`date-${format(selectedDate, 'yyyy-MM-dd')}`);
    if (selectedDateElement && dateScrollerRef.current) {
        const container = dateScrollerRef.current;
        const scrollLeft = selectedDateElement.offsetLeft - container.offsetLeft - (container.offsetWidth / 2) + (selectedDateElement.offsetWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [selectedDate]);

  useEffect(() => {
    // Clear selected time if it's not available for the new date
    if (selectedTime && !availableTimeSlots.includes(selectedTime)) {
      onSelectTime(null);
    }
  }, [selectedDate, availableTimeSlots, selectedTime, onSelectTime]);

  const allProfessionals = [{ id: 'any', name: 'Any Professional' }, ...(staff || [])];

  // Handle staff selection from the dropdown
  const handleSelectStaff = (staffId: string) => {
    const foundStaff = allProfessionals.find(s => s.id === staffId);
    if (foundStaff?.id === 'any') {
      onSelectStaff(null);
    } else {
      onSelectStaff(foundStaff as StaffMember || null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full">
        <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} />
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Calendar className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold font-headline">Select a Date & Time</h2>
          </div>
          <p className="text-muted-foreground">Choose a date and time slot that works for you.</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading available time slots...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full">
        <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} />
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Calendar className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold font-headline">Select a Date & Time</h2>
          </div>
          <p className="text-muted-foreground">Choose a date and time slot that works for you.</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-muted-foreground">Unable to load time slots. Please try again.</p>
          </div>
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
                    <Calendar className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold font-headline">Select a Date & Time</h2>
            </div>
            <p className="text-muted-foreground">Choose a date and time slot that works for you.</p>
        </div>

        {/* Staff Selector */}
        <div className="mb-6 max-w-sm">
            <Label htmlFor="staff-select" className="text-sm font-medium">Professional</Label>
            <Select 
                value={selectedStaff?.id || 'any'} 
                onValueChange={handleSelectStaff}
            >
                <SelectTrigger id="staff-select" className="mt-1">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <SelectValue />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {allProfessionals.map((professionalItem: any) => (
                        <SelectItem key={professionalItem.id} value={professionalItem.id}>
                            {professionalItem.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        
        {/* Date Scroller with Month and Navigation */}
        <div className="flex items-center justify-between mb-2">
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
                const isAvailable = isDateAvailable(date);
                return (
                    <Button
                        key={date.toISOString()}
                        id={`date-${format(date, 'yyyy-MM-dd')}`}
                        variant={isSameDay(date, selectedDate) ? 'default' : 'outline'}
                        className={cn(
                            "flex flex-col h-auto px-4 py-2 flex-shrink-0 rounded-xl shadow-sm",
                            !isAvailable && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => isAvailable && onSelectDate(date)}
                        disabled={!isAvailable}
                    >
                        <span className="font-semibold">{format(date, 'EEE')}</span>
                        <span className="text-2xl font-bold my-1">{format(date, 'd')}</span>
                        <span className="text-xs">{format(date, 'MMM')}</span>
                    </Button>
                );
            })}
        </div>

        {/* Time Slots */}
        <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
                 <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <Clock className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg">Available Slots for {format(selectedDate, 'MMMM d')}</h3>
            </div>
            <div className="max-h-64 overflow-y-auto pr-2 no-scrollbar">
                {availableTimeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {availableTimeSlots.map((time: string) => (
                            <Button
                                key={time}
                                variant={selectedTime === time ? 'default' : 'outline'}
                                className="h-12 text-base font-semibold rounded-lg shadow-sm"
                                onClick={() => onSelectTime(time)}
                            >
                                {time}
                            </Button>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center gap-2">
                            <Clock className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No available time slots for this date.</p>
                            <p className="text-sm text-muted-foreground">Please select a different date.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}