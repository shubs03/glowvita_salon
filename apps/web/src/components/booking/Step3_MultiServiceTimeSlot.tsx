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
import { StaffMember, WorkingHours, TimeSlot, Service, ServiceStaffAssignment, calculateTotalDuration, validateServiceStaffAssignments } from '@/hooks/useBookingData';
import { useGetPublicAppointmentsQuery } from '@repo/store/api';

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
    vendorId?: string; // Add vendorId for checking existing appointments
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

// Helper function to check if a time slot conflicts with existing appointments FOR A SPECIFIC STAFF
const isTimeSlotBookedForStaff = (appointments: any[], date: Date, time: string, staffId: string, serviceDuration: number = 60): boolean => {
    if (!appointments || appointments.length === 0) {
        return false;
    }
    
    const timeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
    const endTimeMinutes = timeMinutes + serviceDuration;
    const dateString = format(date, 'yyyy-MM-dd');
    
    return appointments.some(appointment => {
        // Check if appointment is on the same date
        const appointmentDateString = format(new Date(appointment.date), 'yyyy-MM-dd');
        if (appointmentDateString !== dateString) {
            return false;
        }
        
        // Extract staff ID - handle different formats (ObjectId, string, or populated object)
        let appointmentStaffId = null;
        if (appointment.staff) {
            if (typeof appointment.staff === 'string') {
                appointmentStaffId = appointment.staff;
            } else if (appointment.staff._id) {
                appointmentStaffId = appointment.staff._id.toString ? appointment.staff._id.toString() : appointment.staff._id;
            } else if (appointment.staff.toString) {
                appointmentStaffId = appointment.staff.toString();
            }
        }
        
        // Only check appointments for this specific staff member
        if (appointmentStaffId !== staffId) {
            return false;
        }
        
        // Check for time overlap
        const appointmentStartMinutes = parseInt(appointment.startTime.split(':')[0]) * 60 + parseInt(appointment.startTime.split(':')[1]);
        const appointmentEndMinutes = parseInt(appointment.endTime.split(':')[0]) * 60 + parseInt(appointment.endTime.split(':')[1]);
        
        // Check if the new time slot overlaps with existing appointment
        // Overlap occurs if: newStart < existingEnd AND newEnd > existingStart
        return (timeMinutes < appointmentEndMinutes && endTimeMinutes > appointmentStartMinutes);
    });
};

// Helper function to check if a time slot conflicts with existing appointments
const isTimeSlotBooked = (appointments: any[], date: Date, time: string, staff: StaffMember | null, serviceDuration: number = 60): boolean => {
    if (!appointments || appointments.length === 0) {
        return false;
    }
    
    // For multi-service, we always have a specific staff assigned, so use the simpler check
    if (staff) {
        return isTimeSlotBookedForStaff(appointments, date, time, staff.id, serviceDuration);
    }
    
    // Fallback: check all appointments
    const timeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
    const endTimeMinutes = timeMinutes + serviceDuration;
    const dateString = format(date, 'yyyy-MM-dd');
    
    return appointments.some(appointment => {
        const appointmentDateString = format(new Date(appointment.date), 'yyyy-MM-dd');
        if (appointmentDateString !== dateString) {
            return false;
        }
        
        const appointmentStartMinutes = parseInt(appointment.startTime.split(':')[0]) * 60 + parseInt(appointment.startTime.split(':')[1]);
        const appointmentEndMinutes = parseInt(appointment.endTime.split(':')[0]) * 60 + parseInt(appointment.endTime.split(':')[1]);
        
        return (timeMinutes < appointmentEndMinutes && endTimeMinutes > appointmentStartMinutes);
    });
};

// Helper function to check if a time slot is available for all assigned staff members
const isTimeSlotAvailableForAllStaff = (
  time: string, 
  date: Date, 
  assignments: ServiceStaffAssignment[],
  duration: number,
  existingAppointments: any[] = []
): boolean => {
  console.log('Checking time slot availability for all staff:', { time, date, duration });
  
  // Get all assigned staff members
  const assignedStaff = assignments
    .map(assignment => assignment.staff)
    .filter(staff => staff !== null && staff !== undefined) as StaffMember[];
  
  console.log('Assigned staff members:', assignedStaff.map(s => s.name));
  
  // If no staff assigned, time slot is available
  if (assignedStaff.length === 0) {
    console.log('No staff assigned, time slot is available');
    return true;
  }
  
  // Check availability for each staff member
  for (const staffMember of assignedStaff) {
    // Check if time slot is blocked for this staff member
    if (isTimeSlotBlocked(staffMember, date, time)) {
      console.log(`Time slot ${time} is blocked for staff ${staffMember.name}`);
      return false;
    }
    
    // Check if staff member has existing appointments at this time
    if (isTimeSlotBooked(existingAppointments, date, time, staffMember, duration)) {
      console.log(`Time slot ${time} is already booked for staff ${staffMember.name}`);
      return false;
    }
    
    // Check if staff member has sufficient availability for the service duration
    const timeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
    const endTimeMinutes = timeMinutes + duration;
    
    // Check if the staff member's slots can accommodate the service duration
    const dayName = getDayName(date);
    let staffSlots: TimeSlot[] = [];
    
    switch (dayName.toLowerCase()) {
      case 'monday':
        staffSlots = staffMember.mondaySlots || [];
        break;
      case 'tuesday':
        staffSlots = staffMember.tuesdaySlots || [];
        break;
      case 'wednesday':
        staffSlots = staffMember.wednesdaySlots || [];
        break;
      case 'thursday':
        staffSlots = staffMember.thursdaySlots || [];
        break;
      case 'friday':
        staffSlots = staffMember.fridaySlots || [];
        break;
      case 'saturday':
        staffSlots = staffMember.saturdaySlots || [];
        break;
      case 'sunday':
        staffSlots = staffMember.sundaySlots || [];
        break;
    }
    
    console.log(`Staff ${staffMember.name} slots for ${dayName}:`, staffSlots);
    
    // Check if any slot can accommodate the duration
    let canAccommodate = false;
    for (const slot of staffSlots) {
      const slotStartMinutes = slot.startMinutes;
      const slotEndMinutes = slot.endMinutes;
      
      // Check if the requested time falls within this slot and has enough duration
      if (timeMinutes >= slotStartMinutes && 
          endTimeMinutes <= slotEndMinutes &&
          (endTimeMinutes - timeMinutes) >= duration) {
        canAccommodate = true;
        break;
      }
    }
    
    if (!canAccommodate) {
      console.log(`Staff ${staffMember.name} cannot accommodate service duration at ${time}`);
      return false;
    }
  }
  
  console.log('Time slot is available for all staff members');
  return true;
};

// Helper function to calculate sequential time slots for different staff
const calculateSequentialTimeSlots = (
  assignments: ServiceStaffAssignment[],
  date: Date,
  workingHours: WorkingHours[],
  staff: StaffMember[]
): { startTime: string; endTime: string; schedule: Array<{ service: Service; staff: StaffMember; startTime: string; endTime: string }> } | null => {
  console.log('Calculating sequential time slots for assignments:', assignments);
  
  // Group services by staff member
  const staffServiceMap: { [key: string]: { staff: StaffMember; services: Service[] } } = {};
  
  for (const assignment of assignments) {
    if (assignment.staff) {
      const staffId = assignment.staff.id;
      if (staffServiceMap[staffId]) {
        staffServiceMap[staffId].services.push(assignment.service);
      } else {
        staffServiceMap[staffId] = {
          staff: assignment.staff,
          services: [assignment.service]
        };
      }
    }
  }
  
  console.log('Staff service map:', staffServiceMap);
  
  // Calculate total duration for each staff member
  const staffDurations: { [key: string]: number } = {};
  Object.keys(staffServiceMap).forEach(staffId => {
    const entry = staffServiceMap[staffId];
    const totalDuration = entry.services.reduce((sum: number, service: Service) => 
      sum + convertDurationToMinutes(service.duration), 0);
    staffDurations[staffId] = totalDuration;
  });
  
  console.log('Staff durations:', staffDurations);
  
  // For now, we'll keep the existing logic but add better logging
  // In a more advanced implementation, we would calculate the actual sequential schedule
  return null;
};

// Helper function to convert duration string to minutes (duplicate from hook, but needed here)
const convertDurationToMinutes = (duration: string): number => {
  const match = duration.match(/(\d+)\s*(min|hour|hours)/);
  if (!match) return 60; // default to 60 minutes
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  if (unit === 'min') return value;
  if (unit === 'hour' || unit === 'hours') return value * 60;
  return 60; // default to 60 minutes
};

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
  isLoading,
  error,
  selectedServices,
  vendorId
}: Step3MultiServiceTimeSlotProps) {
  const dateScrollerRef = useRef<HTMLDivElement>(null);
  const lastRefetchTimestamp = useRef<number>(Date.now());

  // Generate available dates (next 60 days)
  const dates = useMemo(() => Array.from({ length: 60 }, (_, i) => addDays(new Date(), i)), []);
  
  const currentMonthYear = useMemo(() => format(selectedDate, 'MMMM yyyy'), [selectedDate]);

  // Get all assigned staff IDs for fetching appointments
  const assignedStaffIds = useMemo(() => {
    const staffIds = serviceStaffAssignments
      .map(assignment => assignment.staff?.id)
      .filter(Boolean);
    return staffIds.length > 0 ? staffIds : [null]; // Include null for "Any Professional"
  }, [serviceStaffAssignments]);

  // Fetch existing appointments for all assigned staff on the selected date
  const { data: existingAppointments = [], isLoading: isLoadingAppointments, refetch } = useGetPublicAppointmentsQuery(
    {
      vendorId: vendorId,
      // For multi-service, we need to check appointments for all assigned staff
      staffId: assignedStaffIds.length === 1 ? assignedStaffIds[0] : undefined,
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
          
          console.log('Step3_MultiServiceTimeSlot: Refetching appointments data');
          await refetch();
          lastRefetchTimestamp.current = Date.now();
          
          // Clear the flag after refetching
          if (appointmentJustCreated && typeof window !== 'undefined') {
            console.log('Step3_MultiServiceTimeSlot: Cleared appointmentJustCreated flag after refetching');
            sessionStorage.removeItem('appointmentJustCreated');
          }
        } catch (error) {
          console.error('Step3_MultiServiceTimeSlot: Error refetching appointments:', error);
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
  }, [vendorId, selectedDate.toISOString(), refetch]); // Add explicit dependencies

  // Additional check for appointment creation flag with a shorter interval
  useEffect(() => {
    let isMounted = true;
    
    const checkForNewAppointments = async () => {
      if (vendorId && isMounted && typeof window !== 'undefined' && sessionStorage.getItem('appointmentJustCreated') === 'true') {
        console.log('Step3_MultiServiceTimeSlot: Detected new appointment creation, forcing refetch');
        try {
          // Add a longer delay to ensure database consistency
          await new Promise(resolve => setTimeout(resolve, 1500));
          await refetch();
          sessionStorage.removeItem('appointmentJustCreated');
          lastRefetchTimestamp.current = Date.now();
          console.log('Step3_MultiServiceTimeSlot: Refetch completed after appointment creation');
        } catch (error) {
          console.error('Step3_MultiServiceTimeSlot: Error refetching after appointment creation:', error);
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

  console.log('Step3_MultiServiceTimeSlot - Fetching appointments:', {
    vendorId,
    assignedStaffIds,
    staffId: assignedStaffIds.length === 1 ? assignedStaffIds[0] : undefined,
    date: format(selectedDate, 'yyyy-MM-dd'),
    existingAppointments: existingAppointments,
    isLoadingAppointments,
    lastRefetch: lastRefetchTimestamp.current
  });

  // Calculate total duration for all selected services
  const totalDuration = useMemo(() => {
    return calculateTotalDuration(selectedServices);
  }, [selectedServices]);

  // Validate service-staff assignments
  const isAssignmentsValid = useMemo(() => {
    return validateServiceStaffAssignments(serviceStaffAssignments);
  }, [serviceStaffAssignments]);

  // Generate available time slots based on working hours for selected date and total duration
  const availableTimeSlots = useMemo(() => {
    console.log('Step3_MultiServiceTimeSlot - Working Hours Details:', {
      selectedDate: format(selectedDate, 'EEEE, MMM d, yyyy'),
      workingHours: workingHours,
      serviceStaffAssignments: serviceStaffAssignments,
      totalDuration: totalDuration
    });
    
    // Group services by staff member for sequential scheduling information
    const staffServiceMap: { [key: string]: { staff: StaffMember; services: Service[] } } = {};
    
    for (const assignment of serviceStaffAssignments) {
      if (assignment.staff) {
        const staffId = assignment.staff.id;
        if (staffServiceMap[staffId]) {
          staffServiceMap[staffId].services.push(assignment.service);
        } else {
          staffServiceMap[staffId] = {
            staff: assignment.staff,
            services: [assignment.service]
          };
        }
      }
    }
    
    // Calculate total duration for each staff member
    const staffDurations: { [key: string]: number } = {};
    Object.keys(staffServiceMap).forEach(staffId => {
      const entry = staffServiceMap[staffId];
      const totalDuration = entry.services.reduce((sum: number, service: Service) => 
        sum + convertDurationToMinutes(service.duration), 0);
      staffDurations[staffId] = totalDuration;
    });
    
    // Calculate sequential schedule information for logging
    if (Object.keys(staffServiceMap).length > 1) {
      console.log('=== SERVICE SEQUENCING INFORMATION ===');
      console.log('Services grouped by staff:');
      Object.keys(staffServiceMap).forEach(staffId => {
        const entry = staffServiceMap[staffId];
        console.log(`  ${entry.staff.name}:`);
        entry.services.forEach(service => {
          console.log(`    - ${service.name} (${convertDurationToMinutes(service.duration)} min)`);
        });
        console.log(`    Total duration: ${staffDurations[staffId]} min`);
      });
      console.log('====================================');
    }
    
    // If no working hours data, return fallback slots
    if (!workingHours || workingHours.length === 0) {
      console.log('Step3_MultiServiceTimeSlot - No working hours data, using fallback time slots');
      return ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "16:00", "16:30", "17:00"];
    }

    const dayName = getDayName(selectedDate);
    
    // Check if all assigned staff members are the same
    const assignedStaff = serviceStaffAssignments
      .map(assignment => assignment.staff)
      .filter(staff => staff !== null && staff !== undefined) as StaffMember[];
    
    const allSameStaff = assignedStaff.length > 0 && 
      assignedStaff.every(staff => staff.id === assignedStaff[0].id);
    
    // If all services are assigned to the same staff member, use their specific working hours
    if (allSameStaff && assignedStaff.length > 0) {
      const staffMember = assignedStaff[0];
      console.log(`Step3_MultiServiceTimeSlot - Using staff-specific hours for ${dayName} for staff ${staffMember.name}`);
      
      // Get the staff's slots for the selected day
      let staffSlots: TimeSlot[] = [];
      switch (dayName.toLowerCase()) {
        case 'monday':
          staffSlots = staffMember.mondaySlots || [];
          break;
        case 'tuesday':
          staffSlots = staffMember.tuesdaySlots || [];
          break;
        case 'wednesday':
          staffSlots = staffMember.wednesdaySlots || [];
          break;
        case 'thursday':
          staffSlots = staffMember.thursdaySlots || [];
          break;
        case 'friday':
          staffSlots = staffMember.fridaySlots || [];
          break;
        case 'saturday':
          staffSlots = staffMember.saturdaySlots || [];
          break;
        case 'sunday':
          staffSlots = staffMember.sundaySlots || [];
          break;
      }
      
      // If staff has specific slots, use them
      if (staffSlots.length > 0) {
        console.log('Step3_MultiServiceTimeSlot - Using staff slots:', staffSlots);
        const slots = generateTimeSlotsFromStaffSlots(staffSlots);
        console.log('Step3_MultiServiceTimeSlot - Generated slots from staff slots:', slots);
        
        // Filter out blocked time slots for the selected staff and check availability for duration
        const filteredSlots = slots.filter((slot: string) => {
          const isBlocked = isTimeSlotBlocked(staffMember, selectedDate, slot);
          const isAvailable = isTimeSlotAvailableForAllStaff(slot, selectedDate, serviceStaffAssignments, totalDuration, existingAppointments);
          return !isBlocked && isAvailable;
        });
        console.log('Step3_MultiServiceTimeSlot - Filtered slots (after blocking and availability check):', filteredSlots);
        
        // Filter slots to ensure enough time for all services
        const durationSlotsNeeded = Math.ceil(totalDuration / 30);
        const validSlots = [];
        for (let i = 0; i <= filteredSlots.length - durationSlotsNeeded; i++) {
          validSlots.push(filteredSlots[i]);
        }
        
        return validSlots;
      }
    }
    
    // Use vendor working hours as fallback
    const dayWorkingHours = workingHours.find((wh: WorkingHours) => 
      wh.dayOfWeek.toLowerCase() === dayName.toLowerCase()
    );

    console.log('Step3_MultiServiceTimeSlot - Day working hours:', dayWorkingHours);

    if (!dayWorkingHours || !dayWorkingHours.isAvailable) {
      console.log('Step3_MultiServiceTimeSlot - Day not available, returning empty slots');
      return [];
    }

    const slots = generateTimeSlots(dayWorkingHours.startTime, dayWorkingHours.endTime);
    console.log('Step3_MultiServiceTimeSlot - Generated slots from vendor hours:', slots);
    
    // Filter out blocked time slots and check availability for all assigned staff
    const filteredSlots = slots.filter((slot: string) => {
      // Check if time slot is available for all assigned staff members including existing appointments
      return isTimeSlotAvailableForAllStaff(slot, selectedDate, serviceStaffAssignments, totalDuration, existingAppointments);
    });
    console.log('Step3_MultiServiceTimeSlot - Filtered slots (after availability and booking check):', filteredSlots);
    
    // Filter slots to ensure enough time for all services
    const durationSlotsNeeded = Math.ceil(totalDuration / 30);
    const validSlots = [];
    for (let i = 0; i <= filteredSlots.length - durationSlotsNeeded; i++) {
      validSlots.push(filteredSlots[i]);
    }
    
    // Log the corrected understanding of how services will be sequenced
    if (validSlots.length > 0 && assignedStaff.length > 1) {
      console.log('=== CORRECTED SERVICE SEQUENCING ===');
      console.log('When customer selects a time slot, services will be sequenced as follows:');
      
      Object.keys(staffServiceMap).forEach(staffId => {
        const entry = staffServiceMap[staffId];
        const staffName = entry.staff.name;
        console.log(`  ${staffName} will provide:`);
        entry.services.forEach(service => {
          const duration = convertDurationToMinutes(service.duration);
          console.log(`    - ${service.name} (${duration} min)`);
        });
        const totalDuration = staffDurations[staffId] || 0;
        console.log(`    Total time with ${staffName}: ${totalDuration} minutes`);
      });
      console.log('====================================');
    }
    
    return validSlots;
  }, [selectedDate, workingHours, serviceStaffAssignments, totalDuration, existingAppointments, lastRefetchTimestamp.current]);

  // Check if a date is available based on working hours and staff availability
  const isDateAvailable = (date: Date): boolean => {
    if (!workingHours || workingHours.length === 0) return true;
    
    const dayName = getDayName(date);
    const dayWorkingHours = workingHours.find((wh: WorkingHours) => 
      wh.dayOfWeek.toLowerCase() === dayName.toLowerCase()
    );
    
    // Check if all assigned staff are available on this day
    const assignedStaff = serviceStaffAssignments
      .map(assignment => assignment.staff)
      .filter(staff => staff !== null && staff !== undefined) as StaffMember[];
    
    for (const staffMember of assignedStaff) {
      const dayKey = `${dayName.toLowerCase()}Available` as keyof StaffMember;
      // Check if the property exists and is set to false
      if (staffMember[dayKey] !== undefined && staffMember[dayKey] === false) {
        console.log(`Step3_MultiServiceTimeSlot - Staff ${staffMember.name} not available on ${dayName}`);
        return false;
      }
    }
    
    const result = dayWorkingHours?.isAvailable || false;
    console.log(`Step3_MultiServiceTimeSlot - Date ${format(date, 'yyyy-MM-dd')} availability:`, result);
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
    // This is for the dropdown selector, but in multi-service mode we don't use this
    console.log('Step3_MultiServiceTimeSlot - Staff selection from dropdown:', staffId);
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

  // Validation error state
  if (!isAssignmentsValid) {
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
            <p className="text-muted-foreground">Invalid service-staff assignments. Please go back and check your selections.</p>
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
            <p className="text-sm text-muted-foreground mt-2">
              Total appointment duration: {totalDuration} minutes
            </p>
        </div>

        {/* Service-Staff Assignments Summary */}
        <div className="mb-6 p-4 bg-secondary/30 rounded-lg">
          <h3 className="font-semibold mb-2">Your Services & Professionals</h3>
          <div className="space-y-2">
            {serviceStaffAssignments.map((assignment, index) => (
              <div key={assignment.service.id} className="flex justify-between text-sm">
                <span>{assignment.service.name}</span>
                <span className="text-muted-foreground">
                  {assignment.staff ? assignment.staff.name : 'Any Professional'}
                </span>
              </div>
            ))}
          </div>
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