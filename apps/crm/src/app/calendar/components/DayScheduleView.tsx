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
  duration?: number;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'pending';
  isBlocked?: boolean;
  description?: string;
  mode?: 'online' | 'offline'; // Booking mode
  isMultiService?: boolean;
  serviceItems?: Array<{
    _id?: string;
    service: string;
    serviceName: string;
    staff: string;
    staffName: string;
    startTime: string;
    endTime: string;
    duration: number;
    amount: number;
  }>;
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
  role?: string;
  onAppointmentClick?: (appointment: Appointment) => void;
  onTimeSlotClick?: (time: string) => void;
  onCreateAppointment?: (appointment: Omit<Appointment, 'id'>) => void;
  onDateChange?: (date: Date) => void;
}


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

const groupAppointmentsByStaff = (appointments: Appointment[], role?: string, staffList?: StaffMember[]) => {
  // For doctors, group all appointments under the doctor's name
  if (role === 'doctor' && staffList && staffList.length > 0) {
    const doctor = staffList[0]; // Doctor is the only entry in staffList for doctors
    return [[doctor.name || 'Doctor', appointments]] as [string, Appointment[]][];
  }
  
  // For vendors/staff, use the original grouping logic
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

// Constants
const PIXELS_PER_HOUR = 160; // Increased height for one hour (160px for more spacing)
const MIN_APPOINTMENT_HEIGHT = 50; // Balanced minimum height
const MINUTES_PER_SLOT = 15; // 15-minute intervals
const PIXELS_PER_MINUTE = PIXELS_PER_HOUR / 60; // ~2.67px per minute

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

/**
 * Convert time string to minutes since midnight in local time
 * Supports multiple time formats:
 * - 12-hour format: 9:00 AM, 9:00AM, 9:00 am, 9:00am, 9:00 A, 9:00P
 * - 24-hour format: 09:00, 9:00, 21:00
 * - With or without leading zeros
 */
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) {
    console.error('Empty time string provided');
    return 0;
  }
  
  try {
    // Clean and normalize the time string
    const cleanTime = timeStr.toString().trim().toUpperCase();
    
    // Debug the raw input
    console.log('Raw time input:', { timeStr, cleanTime });
    
    // Handle empty string
    if (!cleanTime) {
      console.error('Empty time string after cleaning');
      return 0;
    }
    
    // Extract period (AM/PM) if it exists
    let period = '';
    let timePart = cleanTime;
    
    if (cleanTime.endsWith('AM') || cleanTime.endsWith('PM')) {
      period = cleanTime.slice(-2);
      timePart = cleanTime.slice(0, -2).trim();
    } else if (cleanTime.endsWith('A') || cleanTime.endsWith('P')) {
      // Handle single letter period (A/P)
      period = cleanTime.slice(-1) + 'M';
      timePart = cleanTime.slice(0, -1).trim();
    }
    
    // Split into hours and minutes
    const [hoursStr, minutesStr = '00'] = timePart.split(/[:.\s]+/);
    
    // Parse hours and minutes
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10) || 0;
    
    // Debug parsing
    console.log('Time parts:', { 
      timeStr, 
      cleanTime, 
      period, 
      timePart, 
      hoursStr, 
      minutesStr, 
      parsedHours: hours, 
      parsedMinutes: minutes 
    });
    
    // Handle 12-hour to 24-hour conversion
    if (period) {
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
    }
    
    // Validate the time values
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.error('Invalid time values:', { 
        timeStr, 
        cleanTime, 
        hours, 
        minutes, 
        period,
        error: 'Invalid hour or minute value'
      });
      return 0;
    }
    
    // Calculate total minutes since midnight
    const totalMinutes = (hours * 60) + minutes;
    
    // Debug the final calculation
    console.log('Time calculation:', {
      input: timeStr,
      cleanInput: cleanTime,
      period,
      hours24: hours,
      minutes,
      totalMinutes,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currentTime: new Date().toLocaleTimeString(),
      timezoneOffset: new Date().getTimezoneOffset()
    });
    
    return totalMinutes;
  } catch (error) {
    console.error('Error parsing time:', { 
      timeStr, 
      error: error instanceof Error ? error.message : String(error)
    });
    return 0;
  }
};

export default function DayScheduleView({ 
  selectedDate, 
  appointments = [], 
  timeSlots = [],
  staffList = [],
  workingHours = { startHour: 9, endHour: 18 }, // Default to 9 AM - 6 PM if not provided
  isLoading = false,
  error = null,
  role,
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
  
  // Removed current time indicator functionality
  const [isClient, setIsClient] = useState(false);

  // Validate date after hooks
  const safeSelectedDate = selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();

  useEffect(() => {
    setIsClient(true);
    
    // Set up interval to update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    // Clear interval on component unmount
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
        .map(staff => {
          // Get appointments for this staff
          const staffAppointments: Appointment[] = [];
          
          appointments.forEach(appt => {
            // Check if this is a multi-service appointment
            if (appt.isMultiService && appt.serviceItems && appt.serviceItems.length > 0) {
              // Find if this staff has a service in this multi-service appointment
              const staffServiceItem = appt.serviceItems.find(
                item => item.staffName === staff.name || item.staff === staff.id
              );
              
              if (staffServiceItem) {
                // Create a specialized appointment entry for this staff's service
                staffAppointments.push({
                  ...appt,
                  // Override with staff-specific times from serviceItem
                  startTime: staffServiceItem.startTime,
                  endTime: staffServiceItem.endTime,
                  duration: staffServiceItem.duration,
                  serviceName: staffServiceItem.serviceName,
                  service: staffServiceItem.service,
                  staffName: staffServiceItem.staffName,
                  // Keep the multi-service flag and items for detail view
                  isMultiService: true,
                  serviceItems: appt.serviceItems
                } as Appointment);
              }
            } else {
              // Regular single-service appointment
              if (appt.staffName === staff.name || appt.staffName === staff.id) {
                staffAppointments.push(appt);
              }
            }
          });
          
          return {
            staff,
            appointments: staffAppointments,
            availability: getStaffAvailabilityForDay(staff, safeSelectedDate)
          };
        });
    }
    
    // Fallback to grouping by staff name if no staff data is available
    console.warn('No staff data available, falling back to appointment-based grouping');
    const grouped = groupAppointmentsByStaff(appointments, role, transformedStaffList);
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
            startTime: '08:00',
            endTime: '20:00',
            startHour: 8,
            endHour: 20
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
    // For doctors, don't allow creating new appointments
    if (role === 'doctor') {
      e.stopPropagation();
      return;
    }
    
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
    : groupAppointmentsByStaff(appointments, role, transformedStaffList);

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
  
  // Generate global hours array for the time column with 15-minute intervals
  const { startHour: globalStartHour, endHour: globalEndHour } = getGlobalWorkingHours();
  const workingHoursArray = useMemo(() => {
    const result = [];
    for (let hour = globalStartHour; hour <= globalEndHour; hour++) {
      // Generate 15-minute intervals for each hour with additional spacing
      for (let minute = 0; minute < 60; minute += 15) {
        result.push({
          hour: hour,
          minute: minute,
          timeString: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          isHourMark: minute === 0, // Mark the top of the hour
          height: (PIXELS_PER_HOUR / 4) + 5, // 25px for 15 minutes (20px + 5px spacing)
          isGap: minute !== 0 && minute !== 30 // Gaps are 15 and 45 minute marks
        });
      }
    }
    // Filter out any slots that would be after the end hour
    return result.filter(slot => slot.hour < globalEndHour || (slot.hour === globalEndHour && slot.minute === 0));
  }, [globalStartHour, globalEndHour]);
  
  // Define the time slot height as a constant for consistency
  const TIME_SLOT_HEIGHT = (PIXELS_PER_HOUR / 4) + 10; // 50px for 15 minutes (40px + 10px spacing)
  
  const isCurrentDate = isToday(safeSelectedDate);

  const renderAppointment = (appointment: Appointment, index: number, staffIndex: number) => {
    // Define constants for time calculations
    const MINUTES_IN_HOUR = 60;
    const startHour = globalStartHour;
    
    // Format time for display (12-hour format with AM/PM)
  const formatTimeDisplay = (timeStr: string): string => {
    if (!timeStr) return '';
    
    try {
      // First try to parse as 24-hour format (HH:MM)
      if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          const period = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours % 12 || 12;
          return `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`;
        }
      }
      
      // If not in 24-hour format, try to parse as 12-hour format
      const cleanTime = timeStr.trim().toUpperCase();
      const hasAM = cleanTime.includes('AM');
      const hasPM = cleanTime.includes('PM');
      const timePart = cleanTime.replace(/[AP]M$/, '').trim();
      
      // If it's already in 12-hour format with AM/PM, just return it
      if ((hasAM || hasPM) && /^\d{1,2}:?\d{0,2}$/.test(timePart)) {
        return cleanTime;
      }
      
      // If we can't parse it, return the original string
      console.warn('Could not parse time string for display:', timeStr);
      return timeStr;
    } catch (error) {
      console.error('Error formatting time:', { timeStr, error });
      return timeStr; // Return original string if parsing fails
    }
  };

    // Calculate position and size for an appointment
    const calculateAppointmentLayout = (appointment: any) => {
      if (!appointment?.startTime || !appointment?.endTime || !selectedDate) {
        return { 
          top: 0, 
          height: MIN_APPOINTMENT_HEIGHT,
          startMinutes: 0,
          endMinutes: 0
        };
      }

      try {
        const startTime = appointment.startTime;
        const endTime = appointment.endTime;
        
        // Parse times to minutes since midnight in local time
        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);
        
        if (endMinutes <= startMinutes) {
          console.error('Invalid time range (end time before start):', { 
            appointmentId: appointment.id,
            startTime, 
            endTime, 
            startMinutes, 
            endMinutes 
          });
          return { 
            top: 0, 
            height: MIN_APPOINTMENT_HEIGHT,
            startMinutes: 0,
            endMinutes: 0
          };
        }
        
        // Calculate working day start in minutes (convert globalStartHour to minutes)
        const workDayStartMinutes = globalStartHour * 60;
        
        // Calculate minutes from start of work day
        const minutesFromStart = startMinutes - workDayStartMinutes;
        
        // Calculate position and height in pixels with consistent spacing
        // Each 15-minute slot is now 25px (20px + 5px spacing)
        const pixelsPerMinute = TIME_SLOT_HEIGHT / 15; // ~1.67px per minute
        
        // Calculate position without border offset to ensure accurate positioning
        const startPosition = Math.max(0, minutesFromStart * pixelsPerMinute);
        
        // Calculate height, ensuring it's at least the minimum height
        const minHeight = Math.max(MIN_APPOINTMENT_HEIGHT, (endMinutes - startMinutes) * pixelsPerMinute);
        const height = Math.max(MIN_APPOINTMENT_HEIGHT, minHeight);
        
        // Debug log for pixel calculations
        if (process.env.NODE_ENV === 'development') {
          console.log('Pixel calculation:', {
            appointmentId: appointment.id,
            clientName: appointment.clientName,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            startMinutes,
            endMinutes,
            workDayStartMinutes,
            minutesFromStart,
            pixelsPerMinute,
            TIME_SLOT_HEIGHT,
            PIXELS_PER_HOUR,
            calculatedTop: startPosition,
            calculatedHeight: height,
            minHeight,
            calculation: {
              startTime: `${startMinutes} minutes`,
              workDayStart: `${workDayStartMinutes} minutes`,
              minutesFromStart: `${minutesFromStart} minutes`,
              position: `${minutesFromStart} * ${pixelsPerMinute} = ${startPosition}px`,
              height: `max(${MIN_APPOINTMENT_HEIGHT}px, ${endMinutes - startMinutes}min * ${pixelsPerMinute}px/min) = ${height}px`
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          });
        }
        
        // Debug log for layout calculation
        if (process.env.NODE_ENV === 'development') {
          console.log('Appointment layout calculation:', {
            appointmentId: appointment.id,
            clientName: appointment.clientName,
            date: selectedDate.toISOString().split('T')[0],
            startTime,
            endTime,
            startMinutes,
            endMinutes,
            workDayStartMinutes,
            workDayStartHour: globalStartHour,
            calculatedTop: startPosition,
            calculatedHeight: height,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            currentTime: new Date().toLocaleTimeString(),
            timezoneOffset: new Date().getTimezoneOffset()
          });
        }
        
        return {
          top: startPosition,
          height: height,
          startMinutes,
          endMinutes
        };
      } catch (error) {
        console.error('Error calculating appointment layout:', {
          error,
          appointment: {
            id: appointment?.id,
            startTime: appointment?.startTime,
            endTime: appointment?.endTime
          }
        });
        return { 
          top: 0, 
          height: MIN_APPOINTMENT_HEIGHT,
          startMinutes: 0,
          endMinutes: 0
        };
      }
    };

    // Calculate layout and get display times
    const { top, height, startMinutes, endMinutes } = calculateAppointmentLayout(appointment);
    const startTime = formatTimeDisplay(appointment.startTime);
    const endTime = formatTimeDisplay(appointment.endTime);
    
    // Calculate duration in minutes for better debugging
    const durationMinutes = endMinutes - startMinutes;
    
    // Debug log for appointment positioning
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Appointment: ${appointment.clientName || 'Unnamed'}`, {
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        formatted: `${startTime} - ${endTime}`,
        startMinutes,
        endMinutes,
        durationMinutes,
        globalStartHour,
        calculatedTop: top,
        calculatedHeight: height,
        expectedHeight: durationMinutes * (PIXELS_PER_HOUR / 60),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currentTime: new Date().toLocaleTimeString()
      });
    }
    
    // Get status configuration
    const statusConfig = getStatusConfig(appointment.status);
    const serviceTheme = {
      hair: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-l-blue-400',
      facial: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 border-l-purple-400',
      nail: 'from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/20 border-l-pink-400',
      massage: 'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border-l-green-400',
      default: 'from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/20 border-l-gray-400',
    };
    
    const serviceType = (appointment.service?.toLowerCase() || 'default').trim();
    const themeClass = 
      serviceType.includes('hair') ? serviceTheme.hair :
      serviceType.includes('facial') || serviceType.includes('skin') ? serviceTheme.facial :
      serviceType.includes('nail') || serviceType.includes('manicure') || serviceType.includes('pedicure') ? serviceTheme.nail :
      serviceType.includes('massage') || serviceType.includes('spa') ? serviceTheme.massage :
      serviceTheme.default;
      
    // Debug log for service type theming
    if (process.env.NODE_ENV !== 'production') {
      console.log('Appointment service theming:', {
        serviceType,
        themeClass,
        serviceName: appointment.service
      });
    }
    
    if (appointment.isBlocked) {
      return (
        <div 
          key={`blocked-${index}`}
          className="absolute left-0 right-0 mx-4 p-2.5 rounded-lg border-l-4 border-amber-500 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/30 text-amber-800 dark:text-amber-200 shadow-md hover:shadow-lg transition-all duration-200"
          style={{
            top: `${top + 12}px`,
            height: `${Math.max(height - 24, MIN_APPOINTMENT_HEIGHT)}px`,
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <div className="font-semibold truncate text-amber-700 dark:text-amber-300 text-sm">Blocked Time</div>
          </div>
          <div className="text-sm text-amber-600 dark:text-amber-300/90 font-medium mb-1.5">
            {appointment.description || 'Not Available'}
          </div>
          <div className="text-sm text-amber-600 dark:text-amber-300/90 font-medium flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            {startTime} - {endTime}
          </div>
        </div>
      );
    }
    
    // Check if this is a web appointment (you can adjust this logic based on your data structure)
    const isWebAppointment = appointment.notes?.toLowerCase().includes('web') || 
                            appointment.notes?.toLowerCase().includes('online') ||
                            (appointment as any).source === 'web' ||
                            (appointment as any).bookingType === 'web';
    
    // Return statement for regular appointments
    return (
      <div 
        key={appointment.id}
        className={`absolute left-0 right-0 mx-4 p-2.5 rounded-lg border-l-4 shadow-md group cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 ${
          themeClass
        }`}
        style={{
          top: `${top + 12}px`,
          height: `${Math.max(height - 24, MIN_APPOINTMENT_HEIGHT)}px`,
        }}
        onClick={() => handleAppointmentClick(appointment)}
      >
        <div className="h-full flex flex-col">
          {/* Client Name & Status */}
          <div className="flex items-start justify-between mb-1.5 gap-2">
            <div className="font-semibold text-sm truncate pr-1 text-gray-900 dark:text-gray-100">
              {appointment.clientName || 'Unnamed Client'}
            </div>
            <div className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-medium ${statusConfig.className} flex-shrink-0`}>
              {statusConfig.label}
            </div>
          </div>
          
          {/* Service Name(s) - Show multi-service or single */}
          {/* For multi-service appointments in staff columns, show only this staff's service */}
          {(appointment.isMultiService || (appointment.serviceItems && appointment.serviceItems.length > 1)) ? (
            // Multi-service appointment - check if we're in a staff-specific view
            (() => {
              // If serviceItems exist and this card is for a specific staff's service,
              // show only that service (the serviceName is already set to the staff's specific service)
              const isStaffSpecificView = appointment.serviceName && 
                                         appointment.serviceItems?.some(item => item.serviceName === appointment.serviceName);
              
              if (isStaffSpecificView) {
                // Show only this staff's service in their column
                return (
                  <div className="text-sm text-gray-800 dark:text-gray-200 font-medium mb-1.5 truncate leading-snug">
                    {appointment.serviceName}
                  </div>
                );
              } else {
                // Show multi-service badge (fallback for non-staff-specific views)
                return (
                  <div className="mb-1.5">
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                      Multi-Service ({appointment.serviceItems?.length || 0} services)
                    </div>
                    <div className="space-y-0.5">
                      {appointment.serviceItems?.map((item: any, idx: number) => (
                        <div key={item._id || idx} className="text-xs text-gray-800 dark:text-gray-200 truncate">
                          • {item.serviceName}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            })()
          ) : (
            <div className="text-sm text-gray-800 dark:text-gray-200 font-medium mb-1.5 truncate leading-snug">
              {appointment.serviceName || appointment.service}
            </div>
          )}
          
          {/* Time - Medium size with better visibility */}
          <div className="text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center mb-1.5">
            <Clock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
            <span>{startTime} - {endTime}</span>
          </div>
          
          {/* Booking Mode Badge - Only show if mode field exists */}
          {appointment.mode && (
            <div className="mb-1.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                appointment.mode === 'online'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              }`}>
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  {appointment.mode === 'online' ? (
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/>
                  ) : (
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  )}
                </svg>
                {appointment.mode === 'online' ? 'Web Booking' : 'Offline Booking'}
              </span>
            </div>
          )}
        </div>
        
        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent dark:from-blue-800/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg"></div>
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
        <p>{role === 'doctor' 
          ? 'Error loading doctor schedule data. Please try again later.' 
          : 'Error loading schedule data. Please try again later.'}</p>
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
                  ? (role === 'doctor' ? 'Doctor profile not configured' : 'No staff members available')
                  : 'No appointments scheduled for this day'}
              </h3>
              {staffList && staffList.length === 0 && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {role === 'doctor' 
                    ? 'Please configure your doctor profile and working hours.'
                    : 'Please add staff members to start scheduling appointments.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="flex flex-col h-full w-full">
        {/* Top header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex-shrink-0 rounded-t-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {format(safeSelectedDate, 'EEEE, MMMM d, yyyy')}
            </h2>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDateChange('prev')}
                className="rounded-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDateChange('next')}
                className="rounded-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Calendar grid container */}
        <div className="flex-grow bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex flex-col relative overflow-hidden">
          {/* Fixed header row - sticky at top */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-20 sticky top-0">
            {/* Fixed time header */}
            <div className="w-20 border-r border-gray-200 dark:border-gray-700 p-4 font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex-shrink-0 rounded-tl-2xl flex items-center justify-center" style={{ minHeight: '80px' }}>
              <div className="text-center font-bold">Time</div>
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
                    className={`min-w-[250px] p-4 font-semibold border-r border-gray-200 dark:border-gray-700 ${
                      isAvailable ? bgColor : 'bg-gray-100 dark:bg-gray-800'
                    } flex-shrink-0 ${!isAvailable ? 'opacity-60' : ''} flex items-center`}
                    style={{ minHeight: '80px' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                          <User className={`w-5 h-5 ${isAvailable ? textColor : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <span className={`font-bold ${isAvailable ? textColor : 'text-gray-500'}`}>
                            {staff.name || staff.fullName}
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {staff.position || 'Staff Member'}
                          </div>
                        </div>
                      </div>
                      {!isAvailable && (
                        <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-bold shadow-sm">
                          Unavailable
                        </span>
                      )}
                      {isAvailable && availability?.workingHours && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full shadow-sm">
                          {availability.workingHours.startTime} - {availability.workingHours.endTime}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {/* Add empty column for scrollbar spacing */}
              <div className="w-4 flex-shrink-0"></div>
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto relative">
            <div className="flex h-full">
              {/* Fixed time column */}
              <div className="w-20 border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex-shrink-0 sticky left-0 z-10">
                {workingHoursArray.map((timeSlot, timeIndex) => {
                  // Use consistent time slot height
                  const slotHeight = TIME_SLOT_HEIGHT;
                  
                  return (
                    <div 
                      key={`time-${timeSlot.hour}-${timeSlot.minute}-${timeIndex}`}
                      className={`${timeSlot.isGap ? 'bg-gray-50 dark:bg-gray-800/50' : ''} border-b border-gray-100 dark:border-gray-800 flex items-center justify-center`}
                      style={{ 
                        height: `${slotHeight}px`,
                        boxSizing: 'border-box',
                        position: 'relative'
                      }}
                    >
                      {timeSlot.isHourMark && (
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {timeSlot.timeString}
                        </span>
                      )}
                      {timeSlot.isGap && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Current Time Indicator - Red Line */}
              {isCurrentDate && isClient && (() => {
                const now = new Date();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                const workDayStartMinutes = globalStartHour * 60;
                const minutesFromStart = currentMinutes - workDayStartMinutes;
                const pixelsPerMinute = TIME_SLOT_HEIGHT / 15;
                const currentTimePosition = minutesFromStart * pixelsPerMinute;
                
                // Only show if current time is within working hours
                if (currentMinutes >= workDayStartMinutes && currentMinutes <= (globalEndHour * 60)) {
                  return (
                    <div 
                      className="absolute left-0 right-0 z-40 pointer-events-none"
                      style={{ top: `${currentTimePosition}px` }}
                    >
                      {/* Red circle on the left */}
                      <div className="absolute -left-1 w-3 h-3 bg-red-500 rounded-full shadow-lg" style={{ top: '-6px' }} />
                      {/* Red line */}
                      <div className="h-0.5 bg-red-500 shadow-md" />
                      {/* Time label */}
                      <div className="absolute -top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded shadow-lg">
                        {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              
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
                          <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                              <span className="text-base font-bold text-gray-700 dark:text-gray-300">
                                Not Available Today
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Hour lines - use staff-specific working hours */}
                      {(() => {
                        const staffHours = getStaffWorkingHours(staff);
                        const filteredWorkingHours = workingHoursArray;
                        
                        return filteredWorkingHours.map(timeSlot => {
                          const timeString = timeSlot.timeString;
                          const isBlocked = isTimeBlocked(timeString, staff.blockedTimes || []);
                          const slotTimeInMinutes = timeSlot.hour * 60 + timeSlot.minute;
                          const staffStartMinutes = staff.workingHours?.startHour ? staff.workingHours.startHour * 60 : 13 * 60; // Default to 1 PM if not set
                          const staffEndMinutes = staff.workingHours?.endHour ? staff.workingHours.endHour * 60 : 18 * 60; // Default to 6 PM if not set
                          
                          const isWithinWorkingHours = slotTimeInMinutes >= staffStartMinutes && 
                                                    slotTimeInMinutes < staffEndMinutes;
                          
                          const isClickable = isAvailable && isWithinWorkingHours && !isBlocked;
                          
                          // Use consistent time slot height
                          const height = TIME_SLOT_HEIGHT;
                            
                          return (
                            <div 
                              key={`${staff.name}-${timeSlot.hour}-${timeSlot.minute}`}
                              className={`border-b border-gray-100 dark:border-gray-800 relative transition-all duration-150 ${
                                !isAvailable 
                                  ? 'bg-gray-200/70 dark:bg-gray-800/70' 
                                  : isBlocked
                                    ? 'bg-red-50/50 dark:bg-red-900/20 cursor-not-allowed'
                                    : !isWithinWorkingHours 
                                      ? 'bg-gray-100/50 dark:bg-gray-700/30 cursor-not-allowed'
                                      : role === 'doctor' 
                                        ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-default'
                                        : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                              }`}
                              style={{ 
                                height: `${height}px`,
                                boxSizing: 'border-box'
                              }}
                              onClick={(e) => {
                                // For doctors, disable time slot clicking
                                if (role === 'doctor') {
                                  e.stopPropagation();
                                  return;
                                }
                                                          
                                if (isClickable) {
                                  handleTimeSlotClick(timeString, e);
                                } else if (isBlocked) {
                                  e.stopPropagation();
                                }
                              }}
                              title={
                                role === 'doctor'
                                  ? `${staff.name}'s schedule - Doctors cannot create appointments here`
                                  : !isAvailable 
                                    ? `${staff.name} is not available today` 
                                    : isBlocked
                                      ? `This time slot is blocked`
                                      : !isWithinWorkingHours 
                                        ? `${staff.name} is not working at ${timeSlot.timeString} (Working hours: ${staff.workingHours?.startTime || '09:00'} - ${staff.workingHours?.endTime || '18:00'})` 
                                        : `Book appointment with ${staff.name} at ${timeSlot.timeString}`
                              }
                          >
                              {/* Dashed line for time separation */}
                              <div className="absolute top-1/2 w-full border-t border-dashed border-gray-200 dark:border-gray-600"></div>
                              
                              {isClickable && role !== 'doctor' && (
                                <div className="absolute top-2 right-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              </div>
                            )}
                            
                            {/* Not working hours indicator */}
                            {isAvailable && !isWithinWorkingHours && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded shadow-sm font-bold">
                                  {timeSlot.hour < (staff.workingHours?.startHour || 13) ? 'Not Started' : 'Not Working'}
                                </span>
                              </div>
                            )}
                            
                            {/* Blocked time indicator */}
                            {isAvailable && isWithinWorkingHours && isTimeBlocked(
                              timeSlot.timeString, 
                              staff.blockedTimes || []
                            ) && (
                              <div className="absolute inset-0 flex items-center justify-center bg-red-50/50 dark:bg-red-900/20">
                                <span className="text-xs text-red-500 dark:text-red-300 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm font-bold">
                                  Blocked
                                </span>
                              </div>
                            )}
                            
                              {/* Completely unavailable indicator */}
                              {!isAvailable && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded shadow-sm font-bold">
                                    Unavailable
                                  </span>
                                </div>
                              )}
                              
                              {/* Blocked time indicator */}
                              {isBlocked && isAvailable && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded shadow-sm font-bold">
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
                {/* Add empty column for scrollbar spacing */}
                <div className="w-4 flex-shrink-0"></div>
              </div>
            </div>
            
            {/* Current Time Indicator - Removed */}
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
      
      {/* New Appointment Dialog - only show for non-doctors */}
      {role !== 'doctor' && (
        <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
          <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                New Appointment for {newAppointmentDate && format(newAppointmentDate, 'EEEE, MMMM d, yyyy')}
              </DialogTitle>
            </DialogHeader>
            <NewAppointmentForm 
              onSubmit={handleCreateNewAppointment}
              defaultDate={newAppointmentDate || undefined}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Appointment Detail View */}
      {selectedAppointment && (
        <Dialog open={isDetailViewOpen} onOpenChange={(open) => !open && handleCloseDetailView()}>
          <DialogContent 
            className="max-w-3xl rounded-2xl border-gray-200 dark:border-gray-700"
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
                ...(selectedAppointment as any),
                // Ensure id field compatibility between types
                id: selectedAppointment.id || (selectedAppointment as any)._id,
                _id: selectedAppointment.id || (selectedAppointment as any)._id,
                date: selectedAppointment.date,
                serviceName: selectedAppointment.serviceName || selectedAppointment.service,
                clientName: selectedAppointment.clientName,
                staffName: selectedAppointment.staffName,
                service: selectedAppointment.service,
                startTime: selectedAppointment.startTime,
                endTime: selectedAppointment.endTime,
                status: selectedAppointment.status,
                notes: selectedAppointment.notes || '',
                // Add the critical payment fields that were missing
                amountPaid: (selectedAppointment as any).amountPaid,
                amountRemaining: (selectedAppointment as any).amountRemaining,
                finalAmount: (selectedAppointment as any).finalAmount,
              }}
              onClose={handleCloseDetailView}
              onStatusChange={(status, reason) => {
                handleUpdateStatus(status as any);
              }}
              onCollectPayment={handleCollectPayment}
              onUpdateAppointment={async (updatedAppointment) => {
                // Update the selectedAppointment state with the new data
                setSelectedAppointment(updatedAppointment || null);
                console.log('Appointment updated:', updatedAppointment);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}