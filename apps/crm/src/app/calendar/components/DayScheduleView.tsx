"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Calendar, Clock, User, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { format, addDays, subDays, isToday, isSameDay } from 'date-fns';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import NewAppointmentForm from './NewAppointmentForm';
import { AppointmentDetailView } from '../../../components/AppointmentDetailView';

type Appointment = {
  id: string;
  clientName: string;
  service: string;
  serviceName?: string;
  staffName: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'pending';
  isBlocked?: boolean;
  description?: string;
};

interface StaffMember {
  id: string;
  name: string;
  position?: string;
  image?: string;
  isActive: boolean;
  isAvailable: boolean;
  // Staff availability data from your database
  mondayAvailable?: boolean;
  mondaySlots?: TimeSlot[];
  tuesdayAvailable?: boolean;
  tuesdaySlots?: TimeSlot[];
  wednesdayAvailable?: boolean;
  wednesdaySlots?: TimeSlot[];
  thursdayAvailable?: boolean;
  thursdaySlots?: TimeSlot[];
  fridayAvailable?: boolean;
  fridaySlots?: TimeSlot[];
  saturdayAvailable?: boolean;
  saturdaySlots?: TimeSlot[];
  sundayAvailable?: boolean;
  sundaySlots?: TimeSlot[];
  hasWeekdayAvailability?: boolean;
  hasWeekendAvailability?: boolean;
  totalWeeklyHours?: number;
  blockedTimes?: Array<{startTime: string, endTime: string, date?: string}>;
  timezone?: string;
  isCurrentlyAvailable?: boolean;
  // Add missing properties
  startDate?: string | Date;
  endDate?: string | Date;
  workingHours?: {
    startTime: string;
    endTime: string;
    startHour: number;
    endHour: number;
  };
  fullName?: string;
}

interface TimeSlot {
  time: string;
  formattedTime: string;
  id: string;
  isAvailable: boolean;
  staffId: string;
  startTime?: string;
  endTime?: string;
}

interface BlockedTime {
  date: string | Date;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  isRecurring?: boolean;
  _id?: string;
  [key: string]: any;
}

interface StaffAppointmentGroup {
  staff: StaffMember;
  appointments: Appointment[];
  availability: {
    isAvailable: boolean;
    slots: TimeSlot[];
    workingHours: {
      startTime: string;
      endTime: string;
      startHour: number;
      endHour: number;
    };
  };
}

interface DayScheduleViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  timeSlots: TimeSlot[];
  staffList?: StaffMember[];
  workingHours?: {
    startHour: number;
    endHour: number;
  };
  blockedTimes?: BlockedTime[];
  isLoading?: boolean;
  error?: any;
  onAppointmentClick?: (appointment: Appointment) => void;
  onTimeSlotClick?: (time: string) => void;
  onCreateAppointment?: (appointment: Omit<Appointment, 'id'>) => void;
  onDateChange?: (date: Date) => void;
}

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const getStatusConfig = (status: Appointment['status']) => {
  switch (status) {
    case 'scheduled':
      return {
        label: 'Scheduled',
        icon: '📅',
        className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
      };
    case 'confirmed': 
      return { 
        label: 'Confirmed',
        icon: '✓',
        className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      };
    case 'in_progress':
      return {
        label: 'In Progress',
        icon: '🔄',
        className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
      };
    case 'completed': 
      return { 
        label: 'Completed',
        icon: '✓',
        className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
      };
    case 'pending': 
      return { 
        label: 'Pending',
        icon: '⏳',
        className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        icon: '✕',
        className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
      };
    case 'no_show':
      return {
        label: 'No Show',
        icon: '👻',
        className: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
      };
    default: 
      return { 
        label: 'Unknown',
        icon: '?',
        className: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
      };
  }
};

const groupAppointmentsByStaff = (appointments: Appointment[]) => {
  const staffMap = new Map<string, Appointment[]>();
  
  appointments.forEach(appointment => {
    if (!staffMap.has(appointment.staffName)) {
      staffMap.set(appointment.staffName, []);
    }
    staffMap.get(appointment.staffName)?.push(appointment);
  });
  
  return Array.from(staffMap.entries()).sort(([nameA], [nameB]) => 
    nameA.localeCompare(nameB)
  );
};

// Employee color mapping
const employeeColors = [
  'text-blue-600 dark:text-blue-400',
  'text-green-600 dark:text-green-400',
  'text-purple-600 dark:text-purple-400',
  'text-pink-600 dark:text-pink-400',
  'text-indigo-600 dark:text-indigo-400',
  'text-yellow-600 dark:text-yellow-400',
  'text-red-600 dark:text-red-400',
  'text-teal-600 dark:text-teal-400',
  'text-orange-600 dark:text-orange-400',
  'text-cyan-600 dark:text-cyan-400'
];

const getEmployeeColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % employeeColors.length;
  return employeeColors[index];
};

// Employee background color mapping
const employeeBgColors = [
  'bg-blue-50 dark:bg-blue-900/20',
  'bg-green-50 dark:bg-green-900/20',
  'bg-purple-50 dark:bg-purple-900/20',
  'bg-pink-50 dark:bg-pink-900/20',
  'bg-indigo-50 dark:bg-indigo-900/20',
  'bg-yellow-50 dark:bg-yellow-900/20',
  'bg-red-50 dark:bg-red-900/20',
  'bg-teal-50 dark:bg-teal-900/20',
  'bg-orange-50 dark:bg-orange-900/20',
  'bg-cyan-50 dark:bg-cyan-900/20'
];

const getEmployeeBgColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % employeeBgColors.length;
  return employeeBgColors[index];
};

// Move date validation outside the component
function validateDate(date: Date | null | undefined): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

export default function DayScheduleView({ 
  selectedDate, 
  appointments = [], 
  timeSlots = [],
  staffList = [],
  workingHours = { startHour: 9, endHour: 18 }, // Default to 9 AM - 6 PM if not provided
  isLoading = false,
  error = null,
  onAppointmentClick: onAppointmentClickProp,
  onTimeSlotClick,
  onCreateAppointment,
  onDateChange
}: DayScheduleViewProps) {
  // Hooks must be called at the top level
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [newAppointmentDate, setNewAppointmentDate] = useState<Date | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  // Validate date after hooks
  const safeSelectedDate = selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Helper function to get staff availability for a specific day
  const getStaffAvailabilityForDay = (staff: StaffMember, date: Date) => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[date.getDay()];
    
    const availableKey = `${dayName}Available` as keyof StaffMember;
    const slotsKey = `${dayName}Slots` as keyof StaffMember;
    
    // Check if staff is within their active date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Use optional chaining and provide default values for startDate and endDate
    const startDate = (staff as any).startDate ? new Date((staff as any).startDate) : null;
    const endDate = (staff as any).endDate ? new Date((staff as any).endDate) : null;
    
    // Check if current date is within staff's active period
    const isWithinDateRange = (!startDate || today >= new Date(startDate.toISOString().split('T')[0])) &&
                            (!endDate || today <= new Date(endDate.toISOString().split('T')[0]));
    
    // Check if staff is generally available and active
    const isStaffAvailable = staff.isAvailable !== false && 
                           staff.isActive !== false &&
                           isWithinDateRange;
    
    // Check specific day availability (default to true if not specified)
    const isDayAvailable = staff[availableKey] !== false;
    
    // Check if staff is currently available (for real-time status)
    const isCurrentlyAvailable = staff.isCurrentlyAvailable !== false;
    
    // Staff is available if all conditions are met
    const isAvailable = isStaffAvailable && isDayAvailable && isCurrentlyAvailable;
    
    const slots = staff[slotsKey] as TimeSlot[] || [];
    
    // Default working hours (9 AM to 6 PM)
    let workingHours = {
      startTime: '09:00',
      endTime: '18:00',
      startHour: 9,
      endHour: 18
    };
    
    // Calculate actual working hours from slots if available
    if (slots.length > 0) {
      try {
        // Sort slots by time to get proper start/end
        const sortedSlots = [...slots].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
        const startTime = sortedSlots[0].time || '09:00';
        let endTime = sortedSlots[sortedSlots.length - 1].time || '18:00';
        
        // Add one hour to end time to show the full working slot
        const endHour = Math.min(parseInt(endTime.split(':')[0]) + 1, 23);
        const adjustedEndTime = `${endHour.toString().padStart(2, '0')}:00`;
        
        workingHours = {
          startTime,
          endTime: adjustedEndTime,
          startHour: Math.max(parseInt(startTime.split(':')[0]), 0),
          endHour: Math.min(endHour, 23)
        };
      } catch (error) {
        console.error('Error processing staff slots:', error, { staff, slots });
      }
    }
    
    // If staff has specific working hours, use those
    if (staff.workingHours) {
      workingHours = {
        ...workingHours,
        ...staff.workingHours,
        startHour: staff.workingHours.startHour || workingHours.startHour,
        endHour: staff.workingHours.endHour || workingHours.endHour
      };
    }
    
    // If staff has slots but is marked as not available, log a warning
    if (slots.length > 0 && !isAvailable) {
      console.warn(`Staff ${staff.name} has time slots but is marked as not available on ${dayName}`, {
        staff: {
          name: staff.name,
          isAvailable: staff.isAvailable,
          isActive: staff.isActive,
          isCurrentlyAvailable: staff.isCurrentlyAvailable,
          startDate: staff.startDate,
          endDate: staff.endDate,
          isWithinDateRange: isWithinDateRange
        },
        dayName,
        isStaffAvailable,
        isDayAvailable,
        isCurrentlyAvailable,
        isWithinDateRange,
        currentDate: today.toISOString().split('T')[0],
        slots: slots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable
        }))
      });
    }
    
    return {
      isAvailable,
      slots,
      workingHours
    };
  };

  // Helper function to check if staff is available at a specific time
  const isStaffAvailableAtTime = (staff: StaffMember, date: Date, time: string) => {
    const availability = getStaffAvailabilityForDay(staff, date);
    if (!availability.isAvailable) return false;
    
    // Check if time falls within any available slot
    const timeMinutes = timeToMinutes(time);
    return availability.slots.some(slot => {
      const slotMinutes = timeToMinutes(slot.time);
      // Assuming each slot is 1 hour, adjust as needed
      return timeMinutes >= slotMinutes && timeMinutes < slotMinutes + 60;
    });
  };

  // Helper to convert time string to minutes since midnight
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  // Check if a time is within blocked times
  const isTimeBlocked = (time: string, staffBlockedTimes: Array<{startTime: string, endTime: string, date?: string | Date}>) => {
    if (!staffBlockedTimes || !staffBlockedTimes.length) return false;
    
    const timeMins = timeToMinutes(time);
    return staffBlockedTimes.some(block => {
      // Skip if this block is for a different date
      if (block.date) {
        const blockDate = new Date(block.date);
        if (!isSameDay(blockDate, safeSelectedDate)) {
          return false;
        }
      }
      
      const blockStart = timeToMinutes(block.startTime);
      const blockEnd = timeToMinutes(block.endTime);
      return timeMins >= blockStart && timeMins < blockEnd;
    });
  };

  // Transform staff data to ensure all required fields are present
  const transformStaffData = (staff: any): StaffMember => {
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = safeSelectedDate.getDay();
    const dayKey = [
      'sunday', 'monday', 'tuesday', 'wednesday', 
      'thursday', 'friday', 'saturday'
    ][dayOfWeek] as keyof StaffMember;
    
    // Filter blocked times for this specific date
    const staffBlockedTimes = staff.blockedTimes
      ? staff.blockedTimes.filter((block: any) => {
          if (!block.date) return false;
          const blockDate = new Date(block.date);
          return isSameDay(blockDate, safeSelectedDate);
        })
      : [];
    
    const availabilityKey = `${dayKey}Available` as keyof StaffMember;
    const slotsKey = `${dayKey}Slots` as keyof StaffMember;
    
    // Get working hours for the day
    let workingHours = {
      startTime: '09:00',
      endTime: '18:00',
      startHour: 9,
      endHour: 18
    };
    
    // If staff has specific slots for the day, use those
    if (staff[slotsKey] && staff[slotsKey].length > 0) {
      const slot = staff[slotsKey][0];
      workingHours = {
        startTime: slot.startTime || '09:00',
        endTime: slot.endTime || '18:00',
        startHour: Math.floor(slot.startMinutes / 60) || 9,
        endHour: Math.ceil(slot.endMinutes / 60) || 18
      };
    }
    
    // Check if staff is available today based on weekday/weekend flags
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
    const hasDayAvailability = staff[availabilityKey] !== false;
    const isAvailableToday = (isWeekday && staff.hasWeekdayAvailability !== false) || 
                           (!isWeekday && staff.hasWeekendAvailability !== false);
    
    // Helper function to determine day availability
    const getDayAvailability = (day: string) => {
      // If specific day availability is set, use that
      if (staff[`${day}Available`] !== undefined) {
        return staff[`${day}Available`] === true;
      }
      
      // Otherwise, use the weekday/weekend default
      const isDayWeekend = ['saturday', 'sunday'].includes(day);
      return isDayWeekend 
        ? staff.hasWeekendAvailability !== false
        : staff.hasWeekdayAvailability !== false;
    };
    
    return {
      id: staff._id || staff.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
      name: staff.fullName || staff.name || 'Unknown Staff',
      position: staff.position || '',
      image: staff.photo || staff.image || undefined,
      isActive: staff.isActive !== undefined ? staff.isActive : true,
      isAvailable: isAvailableToday && hasDayAvailability,
      
      // Set individual day availability
      mondayAvailable: getDayAvailability('monday'),
      tuesdayAvailable: getDayAvailability('tuesday'),
      wednesdayAvailable: getDayAvailability('wednesday'),
      thursdayAvailable: getDayAvailability('thursday'),
      fridayAvailable: getDayAvailability('friday'),
      saturdayAvailable: getDayAvailability('saturday'),
      sundayAvailable: getDayAvailability('sunday'),
      
      // Copy slots
      mondaySlots: staff.mondaySlots || [],
      tuesdaySlots: staff.tuesdaySlots || [],
      wednesdaySlots: staff.wednesdaySlots || [],
      thursdaySlots: staff.thursdaySlots || [],
      fridaySlots: staff.fridaySlots || [],
      saturdaySlots: staff.saturdaySlots || [],
      sundaySlots: staff.sundaySlots || [],
      
      timezone: staff.timezone || 'Asia/Kolkata',
      hasWeekdayAvailability: staff.hasWeekdayAvailability !== false,
      hasWeekendAvailability: staff.hasWeekendAvailability !== false,
      totalWeeklyHours: staff.totalWeeklyHours || 0,
      blockedTimes: staffBlockedTimes,
      workingHours, // Add working hours to the staff object
      isCurrentlyAvailable: staff.isCurrentlyAvailable !== false
    };
  };

  // Transform staff list to ensure all required fields are present
  const transformedStaffList = useMemo(() => {
    if (!staffList || !Array.isArray(staffList)) {
      console.warn('No valid staff list provided, using empty array');
      return [];
    }
    
    // Log the raw staff data for debugging
    console.log('Raw staff list data:', staffList);
    
    const transformed = staffList.map(staff => {
      const transformedStaff = transformStaffData(staff);
      
      // Log each staff member's transformed data
      console.log(`Transformed staff ${transformedStaff.name}:`, {
        ...transformedStaff,
        image: transformedStaff.image ? 'Image available' : 'No image'
      });
      
      return transformedStaff;
    });
    
    return transformed;
  }, [staffList]);

  // Filter staff list to show only available staff for the selected day
  const availableStaffForDay = transformedStaffList.filter(staff => {
    const availability = getStaffAvailabilityForDay(staff, safeSelectedDate);
    return availability.isAvailable;
  });

  // Update staff appointments to include availability info
  const staffAppointmentsWithAvailability = useMemo<StaffAppointmentGroup[]>(() => {
    if (transformedStaffList.length > 0) {
      return transformedStaffList
        .filter(staff => staff.isActive)
        .map(staff => ({
          staff,
          appointments: appointments.filter(appt => appt.staffName === staff.name || appt.staffName === staff.id),
          availability: getStaffAvailabilityForDay(staff, safeSelectedDate)
        }));
    }
    
    // Fallback to grouping by staff name if no staff data is available
    console.warn('No staff data available, falling back to appointment-based grouping');
    const grouped = groupAppointmentsByStaff(appointments);
    return grouped.map(([staffName, staffAppointments]) => {
      const defaultStaff: StaffMember = {
        id: `temp-${staffName.toLowerCase().replace(/\s+/g, '-')}`,
        name: staffName,
        isActive: true,
        isAvailable: true,
        // Add default availability for all days
        mondayAvailable: true,
        tuesdayAvailable: true,
        wednesdayAvailable: true,
        thursdayAvailable: true,
        fridayAvailable: true,
        saturdayAvailable: false,
        sundayAvailable: false,
        timezone: 'UTC'
      };
      
      return {
        staff: defaultStaff,
        appointments: staffAppointments,
        availability: { 
          isAvailable: true, 
          slots: [], 
          workingHours: {
            startTime: '09:00',
            endTime: '18:00',
            startHour: 9,
            endHour: 18
          }
        }
      };
    });
  }, [transformedStaffList, appointments, safeSelectedDate]);
  
  // Log the processed data for debugging
  useEffect(() => {
    console.log('Processed staff data:', {
      rawStaffList: staffList,
      transformedStaffList,
      staffAppointmentsWithAvailability
    });
  }, [staffList, transformedStaffList, staffAppointmentsWithAvailability]);

  const handleDateChange = (direction: 'prev' | 'next') => {
    if (!onDateChange) return;
    const newDate = new Date(safeSelectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1));
    onDateChange(newDate);
  };

  const handleNewAppointment = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      console.error('Invalid date selected for new appointment');
      return;
    }
    setNewAppointmentDate(date);
    setIsNewAppointmentOpen(true);
  };

  const handleCreateAppointment = (date: Date) => {
    handleNewAppointment(date);
  };

  const handleFormSubmit = (appointment: Appointment) => {
    console.log('Appointment updated:', appointment);
    setIsFormOpen(false);
    setSelectedAppointment(null);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedAppointment(null);
  };

  const handleCreateNewAppointment = async (appointment: import('./NewAppointmentForm').Appointment) => {
    if (onCreateAppointment) {
      const appointmentDate = newAppointmentDate && !isNaN(newAppointmentDate.getTime())
        ? newAppointmentDate
        : new Date();
      
      // Convert the NewAppointmentForm Appointment type to DayScheduleView Appointment type
      const convertedAppointment: Omit<Appointment, 'id'> = {
        clientName: appointment.clientName,
        service: appointment.service,
        serviceName: appointment.serviceName,
        staffName: appointment.staffName,
        date: typeof appointment.date === 'string' ? new Date(appointment.date) : appointmentDate,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        notes: appointment.notes,
        status: appointment.status as Appointment['status'], // Type assertion since we've aligned the status types
        description: ''
      };
      
      onCreateAppointment(convertedAppointment);
    }
    setIsNewAppointmentOpen(false);
  };

  const handleAppointmentClick = async (appointment: Appointment) => {
    try {
      setSelectedAppointment(appointment);
      setIsDetailViewOpen(true);
      // Call the prop if provided
      onAppointmentClickProp?.(appointment);
    } catch (error) {
      console.error('Error handling appointment click:', error);
    }
  };

  const handleCloseDetailView = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsDetailViewOpen(false);
    setSelectedAppointment(null);
  };

  const handleUpdateStatus = (status: Appointment['status']) => {
    if (selectedAppointment) {
      onAppointmentClickProp?.({ ...selectedAppointment, status });
      setSelectedAppointment({ ...selectedAppointment, status });
    }
  };

  const handleCollectPayment = (paymentData: { amount: number; paymentMethod: string; notes?: string }) => {
    if (selectedAppointment) {
      console.log('Payment collected:', { ...paymentData, appointmentId: selectedAppointment.id });
      handleUpdateStatus('completed');
    }
  };

  const handleTimeSlotClick = (time: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onTimeSlotClick?.(time);
  };

  const visibleAppointments = appointments.filter(a => a.status !== 'cancelled');
  const sortedAppointments = [...visibleAppointments].sort((a, b) => {
    if (a.isBlocked && !b.isBlocked) return -1;
    if (!a.isBlocked && b.isBlocked) return 1;
    return 0;
  });
  const staffAppointments: [string, Appointment[]][] = staffList && staffList.length > 0 
    ? staffList.filter(staff => staff.isActive).map(staff => [
        staff.name,
        appointments.filter(appt => appt.staffName === staff.name)
      ] as [string, Appointment[]])
    : groupAppointmentsByStaff(appointments);

  const timeSlotsByHour = useMemo(() => {
    if (!timeSlots.length) return null;
    
    return timeSlots.reduce((acc, slot) => {
      const [hour] = slot.time.split(':').map(Number);
      if (!acc[hour]) {
        acc[hour] = [];
      }
      acc[hour].push(slot);
      return acc;
    }, {} as Record<number, typeof timeSlots>);
  }, [timeSlots]);

  // Get working hours for a specific staff member
  const getStaffWorkingHours = useCallback((staff: StaffMember) => {
    if (staff.workingHours) {
      return {
        startHour: Math.max(0, staff.workingHours.startHour - 1), // Add buffer
        endHour: Math.min(24, staff.workingHours.endHour + 1)    // Add buffer
      };
    }
    
    // Default working hours if not specified
    return {
      startHour: workingHours?.startHour || 8,  // Default to 8 AM
      endHour: workingHours?.endHour || 20      // Default to 8 PM
    };
  }, [workingHours]);
  
  // Calculate the global working hours range for the time column
  const getGlobalWorkingHours = useCallback(() => {
    if (staffAppointmentsWithAvailability.length === 0) {
      return { startHour: 8, endHour: 20 }; // Default hours if no staff
    }
    
    let earliestStart = 24;
    let latestEnd = 0;
    
    staffAppointmentsWithAvailability.forEach(({ staff }) => {
      const hours = getStaffWorkingHours(staff);
      earliestStart = Math.min(earliestStart, hours.startHour);
      latestEnd = Math.max(latestEnd, hours.endHour);
    });
    
    return {
      startHour: earliestStart,
      endHour: latestEnd
    };
  }, [staffAppointmentsWithAvailability, getStaffWorkingHours]);
  
  // Generate global hours array for the time column
  const { startHour: globalStartHour, endHour: globalEndHour } = getGlobalWorkingHours();
  const workingHoursArray = useMemo(() => {
    const result = [];
    for (let i = globalStartHour; i <= globalEndHour; i++) {
      result.push(i);
    }
    return result;
  }, [globalStartHour, globalEndHour]);
  
  // Calculate current time position for the time indicator
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const isWithinWorkingHours = currentMinutes >= globalStartHour * 60 && currentMinutes <= globalEndHour * 60;
  const currentTimePosition = ((currentMinutes - globalStartHour * 60) * (80 / 60)) + 64; // 64px for header

  const getCurrentTimePosition = useCallback(() => {
    if (!isToday(safeSelectedDate)) return null;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Calculate position in pixels (assuming each hour is 80px)
    const position = (currentHour - globalStartHour) * 80 + (currentMinute * 80 / 60);
    
    // Only show if within the visible hours
    if (position < 0 || position > (globalEndHour - globalStartHour) * 80) return null;
    
    return position;
  }, [safeSelectedDate, globalStartHour, globalEndHour]);

  const isCurrentDate = isToday(safeSelectedDate);

  useEffect(() => {
    if (isToday(safeSelectedDate)) {
      const currentTimePosition = getCurrentTimePosition();
      if (currentTimePosition !== null) {
        const scrollContainer = document.querySelector('.time-slots-container');
        if (scrollContainer) {
          // Scroll to show the current time indicator, with some padding
          scrollContainer.scrollTop = Math.max(0, currentTimePosition - 60);
        }
      }
    }
  }, [safeSelectedDate, getCurrentTimePosition]);

  const renderAppointment = (appointment: Appointment, index: number, staffIndex: number) => {
    // Get the staff's working hours or use default
    const staffData = staffAppointmentsWithAvailability[staffIndex];
    const staffWorkingHours = staffData?.availability?.workingHours || workingHours;
    const startHour = staffWorkingHours.startHour || 9; // Default to 9 AM if not set
    
    if (appointment.isBlocked) {
      const startTime = new Date(`${selectedDate.toISOString().split('T')[0]}T${appointment.startTime}`);
      const endTime = new Date(`${selectedDate.toISOString().split('T')[0]}T${appointment.endTime}`);
      
      return (
        <div 
          key={`blocked-${index}`}
          className="absolute left-0 right-0 mx-1 p-2 rounded-lg border-l-4 border-amber-500 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 text-amber-800 dark:text-amber-200 text-xs shadow-sm"
          style={{
            top: `${(timeToMinutes(appointment.startTime) - startHour * 60) * (80 / 60)}px`,
            height: `${Math.max(60, (timeToMinutes(appointment.endTime) - timeToMinutes(appointment.startTime)) * (80 / 60))}px`,
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <div className="font-medium truncate">Blocked: {appointment.description || 'Not Available'}</div>
          </div>
          <div className="mt-1 text-[10px] text-amber-600 dark:text-amber-300/80">
            {format(startTime, 'h:mma')} - {format(endTime, 'h:mma')}
          </div>
        </div>
      );
    }
    
    const top = (timeToMinutes(appointment.startTime) - startHour * 60) * (80 / 60);
    const height = Math.max(60, (timeToMinutes(appointment.endTime) - timeToMinutes(appointment.startTime)) * (80 / 60));
    
    // Get status configuration
    const statusConfig = getStatusConfig(appointment.status);
    const serviceTheme = {
      hair: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-l-blue-400',
      facial: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-l-blue-400',
      nail: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-l-blue-400',
      massage: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-l-blue-400',
      default: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-l-blue-400',
    };
    
    const serviceType = appointment.service?.toLowerCase() || 'default';
    const themeClass = 
      serviceType.includes('hair') ? serviceTheme.hair :
      serviceType.includes('facial') || serviceType.includes('skin') ? serviceTheme.facial :
      serviceType.includes('nail') || serviceType.includes('manicure') || serviceType.includes('pedicure') ? serviceTheme.nail :
      serviceType.includes('massage') || serviceType.includes('spa') ? serviceTheme.massage :
      serviceTheme.default;
    
    return (
      <div
        key={appointment.id}
        className={`absolute left-1 right-1 p-3 rounded-lg border-l-4 ${themeClass} bg-white/95 dark:bg-blue-900/20 backdrop-blur-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group`}
        style={{
          top: `${top}px`,
          height: `${height + 4}px`, // Slightly increase height
        }}
        onClick={() => onAppointmentClickProp?.(appointment) || handleAppointmentClick(appointment)}
      >
        <div className="h-full flex flex-col">
          {/* Header with client name and status */}
          <div className="flex justify-between items-start mb-1.5">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-2">
              {appointment.clientName}
            </h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.className} whitespace-nowrap`}>
              {statusConfig.label}
            </span>
          </div>
          
          {/* Service and time */}
          <div className="mb-1.5">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
              {appointment.serviceName || appointment.service}
            </p>
            <div className="flex items-center text-xs text-blue-600 dark:text-blue-300 mt-1">
              <Clock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
              <span>
                {format(new Date(`2000-01-01T${appointment.startTime}`), 'h:mma').toLowerCase()} - 
                {format(new Date(`2000-01-01T${appointment.endTime}`), 'h:mma').toLowerCase()}
              </span>
            </div>
          </div>
          
          {/* Staff and notes (if any) */}
          <div className="mt-auto pt-2 border-t border-blue-100 dark:border-blue-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-2 flex-shrink-0">
                  <User className="w-3 h-3 text-blue-600 dark:text-blue-300" />
                </div>
                <span className="text-xs font-medium text-blue-700 dark:text-blue-200 truncate">
                  {appointment.staffName}
                </span>
              </div>
              
              {appointment.notes && (
                <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 group-hover:bg-blue-300 transition-colors" />
              )}
            </div>
          </div>
        </div>
        
        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent dark:from-blue-800/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      </div>
    );
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading schedule...</span>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Error loading schedule data. Please try again later.</p>
        {error?.message && <p className="text-sm mt-2">{error.message}</p>}
      </div>
    );
  }

  // Handle no staff or appointments
  if (staffAppointmentsWithAvailability.length === 0) {
    return (
      <div className="flex flex-col h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col h-full w-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {format(safeSelectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDateChange('prev')}
                  className="rounded-full"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDateChange('next')}
                  className="rounded-full"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
      
      {/* Add CSS to hide scrollbars */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
            </div>
          </div>
          <div className="flex items-center justify-center flex-grow bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-20 animate-pulse"></div>
                <Calendar className="w-24 h-24 text-blue-500 dark:text-blue-400 relative z-10" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {staffList && staffList.length === 0 
                  ? 'No staff members available' 
                  : 'No appointments scheduled for this day'}
              </h3>
              {staffList && staffList.length === 0 && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Please add staff members to start scheduling appointments.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col h-full w-full">
        {/* Top header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDateChange('prev')}
                className="rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {format(safeSelectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDateChange('next')}
                className="rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Calendar grid container */}
        <div className="flex-grow bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col relative overflow-hidden">
          {/* Fixed header row */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-20">
            {/* Fixed time header */}
            <div className="w-20 border-r border-gray-200 dark:border-gray-700 p-3 font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex-shrink-0">
              Time
            </div>
            {/* Scrollable staff headers */}
            <div 
              className="flex overflow-x-auto overflow-y-hidden scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onScroll={(e) => {
                // Sync scroll with content area
                const contentScroll = document.getElementById('staff-content-scroll');
                if (contentScroll) {
                  contentScroll.scrollLeft = e.currentTarget.scrollLeft;
                }
              }}
              id="staff-header-scroll"
            >
              {staffAppointmentsWithAvailability.map(({ staff, availability }) => {
                const bgColor = getEmployeeBgColor(staff.name);
                const textColor = getEmployeeColor(staff.name);
                const isAvailable = availability?.isAvailable ?? true;
                
                return (
                  <div 
                    key={staff.id} 
                    className={`min-w-[250px] p-3 font-medium border-r border-gray-200 dark:border-gray-700 ${
                      isAvailable ? bgColor : 'bg-gray-100 dark:bg-gray-800'
                    } flex-shrink-0 ${!isAvailable ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className={`w-4 h-4 mr-2 ${isAvailable ? textColor : 'text-gray-400'}`} />
                        <span className={`font-semibold ${isAvailable ? textColor : 'text-gray-500'}`}>
                          {staff.fullName}
                        </span>
                      </div>
                      {!isAvailable && (
                        <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                          Unavailable
                        </span>
                      )}
                      {isAvailable && availability?.workingHours && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {availability.workingHours.startTime} - {availability.workingHours.endTime}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Scrollable content area */}
          <div className="flex-grow overflow-y-auto relative">
            <div className="flex h-full">
              {/* Fixed time column */}
              <div className="w-20 border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex-shrink-0 sticky left-0 z-10">
                {workingHoursArray.map(hour => {
                  const timeString = `${hour.toString().padStart(2, '0')}:00`;
                  return (
                    <div 
                      key={`time-${hour}`}
                      className="h-20 border-b border-gray-100 dark:border-gray-800 flex items-center justify-center"
                    >
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {timeString}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {/* Scrollable staff columns container */}
              <div 
                className="flex overflow-x-auto min-h-full scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onScroll={(e) => {
                  // Sync scroll with header
                  const headerScroll = document.getElementById('staff-header-scroll');
                  if (headerScroll) {
                    headerScroll.scrollLeft = e.currentTarget.scrollLeft;
                  }
                }}
                id="staff-content-scroll"
              >
                {staffAppointmentsWithAvailability.map(({ staff, appointments, availability }, staffIndex) => {
                  const isAvailable = availability?.isAvailable ?? true;
                  
                  return (
                    <div key={staff.id} className={`min-w-[250px] border-r border-gray-200 dark:border-gray-700 relative flex-shrink-0 ${!isAvailable ? 'bg-gray-50 dark:bg-gray-900/50' : ''}`}>
                      {/* Unavailable overlay */}
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-gray-200/50 dark:bg-gray-800/50 z-30 flex items-center justify-center">
                          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Not Available Today
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Hour lines - use staff-specific working hours */}
                      {(() => {
                        const staffHours = getStaffWorkingHours(staff);
                        const filteredWorkingHours = workingHoursArray
                          .filter(hour => hour >= staffHours.startHour && hour <= staffHours.endHour);
                        
                        return filteredWorkingHours.map(hour => {
                          const timeString = `${hour.toString().padStart(2, '0')}:00`;
                          const isBlocked = isTimeBlocked(timeString, staff.blockedTimes || []);
                          const isWithinWorkingHours = staff.workingHours
                            ? hour >= staff.workingHours.startHour && hour < staff.workingHours.endHour
                            : false;
                          
                          const isClickable = isAvailable && isWithinWorkingHours && !isBlocked;
                          
                          return (
                            <div 
                              key={`${staff.name}-${hour}`}
                              className={`h-20 border-b border-gray-100 dark:border-gray-800 relative transition-colors ${
                                !isAvailable 
                                  ? 'bg-gray-200/70 dark:bg-gray-800/70' 
                                  : isBlocked
                                    ? 'bg-red-50/50 dark:bg-red-900/20 cursor-not-allowed'
                                    : !isWithinWorkingHours 
                                      ? 'bg-gray-100/50 dark:bg-gray-700/30 cursor-not-allowed'
                                      : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                              }`}
                              onClick={(e) => {
                                if (isClickable) {
                                  handleTimeSlotClick(timeString, e);
                                } else if (isBlocked) {
                                  e.stopPropagation();
                                }
                              }}
                              title={
                                !isAvailable 
                                  ? `${staff.name} is not available today` 
                                  : isBlocked
                                    ? `This time slot is blocked`
                                    : !isWithinWorkingHours 
                                      ? `${staff.name} is not working at ${hour}:00 (Working hours: ${staff.workingHours?.startTime || '09:00'} - ${staff.workingHours?.endTime || '18:00'})` 
                                      : `Book appointment with ${staff.name} at ${hour}:00`
                              }
                          >
                              {/* Dashed line for time separation */}
                              <div className="absolute top-1/2 w-full border-t border-dashed border-gray-200 dark:border-gray-600"></div>
                              
                              {isClickable && (
                                <div className="absolute top-2 right-2">
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              </div>
                            )}
                            
                            {/* Not working hours indicator */}
                            {isAvailable && !isWithinWorkingHours && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm">
                                  Not Working
                                </span>
                              </div>
                            )}
                            
                            {/* Blocked time indicator */}
                            {isAvailable && isWithinWorkingHours && isTimeBlocked(
                              `${hour.toString().padStart(2, '0')}:00`, 
                              staff.blockedTimes || []
                            ) && (
                              <div className="absolute inset-0 flex items-center justify-center bg-red-50/50 dark:bg-red-900/20">
                                <span className="text-xs text-red-500 dark:text-red-300 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm">
                                  Blocked
                                </span>
                              </div>
                            )}
                            
                              {/* Completely unavailable indicator */}
                              {!isAvailable && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded shadow-sm">
                                    Unavailable
                                  </span>
                                </div>
                              )}
                              
                              {/* Blocked time indicator */}
                              {isBlocked && isAvailable && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded shadow-sm">
                                    Blocked
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                      
                      {/* Appointments for this staff */}
                      {isAvailable && staffAppointmentsWithAvailability[staffIndex]?.appointments?.map((appointment: Appointment, index: number) => 
                        renderAppointment(appointment, index, staffIndex)
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Current Time Indicator */}
            {isCurrentDate && isWithinWorkingHours && (
              <div 
                className="absolute left-0 right-0 h-px bg-red-500 z-50 flex items-center"
                style={{ top: `${currentTimePosition}px` }}
              >
                <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-r">
                  {format(new Date(), 'h:mm a')}
                </div>
                <div className="h-px bg-red-500 flex-1"></div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add CSS to hide scrollbars */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* New Appointment Dialog */}
      <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
        <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              New Appointment for {newAppointmentDate && format(newAppointmentDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <NewAppointmentForm 
            onSubmit={handleCreateNewAppointment}
            defaultDate={newAppointmentDate || undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Appointment Detail View */}
      {selectedAppointment && (
        <Dialog open={isDetailViewOpen} onOpenChange={(open) => !open && handleCloseDetailView()}>
          <DialogContent 
            className="max-w-3xl"
            onInteractOutside={(e) => {
              e.preventDefault();
              handleCloseDetailView();
            }}
            onEscapeKeyDown={(e) => {
              e.preventDefault();
              handleCloseDetailView();
            }}
          >
            <AppointmentDetailView 
              appointment={{
                ...selectedAppointment,
                date: selectedAppointment.date,
                serviceName: selectedAppointment.serviceName || selectedAppointment.service,
                _id: selectedAppointment.id,
                clientName: selectedAppointment.clientName,
                staff: '',
                staffName: selectedAppointment.staffName,
                service: selectedAppointment.service,
                startTime: selectedAppointment.startTime,
                endTime: selectedAppointment.endTime,
                duration: 0,
                amount: 0,
                totalAmount: 0,
                status: selectedAppointment.status,
                notes: selectedAppointment.notes || '',
                client: '', // Add missing client property
                discount: 0, // Add missing discount property
                tax: 0, // Add missing tax property
                paymentStatus: '', // Add missing paymentStatus property
                vendorId: '', // Add vendorId property
              }}
              onClose={handleCloseDetailView}
              onStatusChange={(status, reason) => {
                handleUpdateStatus(status as any);
              }}
              onCollectPayment={handleCollectPayment}
              onUpdateAppointment={async (updatedAppointment) => {
                // Handle update if needed
                console.log('Appointment updated:', updatedAppointment);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}