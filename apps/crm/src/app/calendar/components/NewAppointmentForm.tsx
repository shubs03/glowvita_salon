"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Textarea } from '@repo/ui/textarea';
import { Button } from '@repo/ui/button';
import { format, addMinutes, isWithinInterval, parseISO, isSameDay } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectBlockedTimesByStaffAndDate } from '@repo/store/slices/blockTimeSlice';
import { selectWorkingHours } from '@repo/store/slices/workingHoursSlice';

import { getDay } from 'date-fns';
import { Calendar as CalendarIcon, Trash2, Loader2, Search, X, PlusCircle } from 'lucide-react';
import { glowvitaApi, useCreateClientMutation, useGetWorkingHoursQuery } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { toast } from 'sonner';

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface StaffMember {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Client {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Appointment {
  id?: string;
  _id?: string;
  client: string;
  clientName: string;
  service: string;
  serviceName: string;
  staff: string;  // This should be a MongoDB ObjectId
  staffName: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  duration: number;
  notes: string;
  status: AppointmentStatus;
  amount: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

interface NewAppointmentFormProps {
  defaultValues?: Partial<Appointment>;
  defaultDate?: Date;
  isEditing?: boolean;
  isRescheduling?: boolean;
  onSubmit?: (appointment: Appointment) => Promise<void>;
  onCancel?: () => void;
  onSuccess?: () => void;
  onDelete?: (id: string) => void;
}

export default function NewAppointmentForm({
  defaultValues,
  defaultDate,
  isEditing = false,
  isRescheduling = false,
  onSubmit,
  onCancel = () => {},
  onSuccess,
  onDelete
}: NewAppointmentFormProps) {
  const router = useRouter();
  const { user } = useCrmAuth();
  const vendorId = user?.vendorId || user?._id;
  
  // Initialize form data with default values
  const [formData, setFormData] = useState<Partial<Appointment>>({
    client: '',
    clientName: '',
    service: '',
    serviceName: '',
    staff: '',
    staffName: '',
    date: defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: '',
    endTime: '',
    duration: 0,
    notes: '',
    status: 'scheduled',
    amount: 0,
    tax: 0,
    totalAmount: 0,
    ...defaultValues
  });
  
  // Fetch working hours when component mounts
  const { data: workingHoursResponse, error: workingHoursError, isLoading: isLoadingWorkingHours } = useGetWorkingHoursQuery(undefined, {
    // Force refetch when component mounts
    refetchOnMountOrArgChange: true
  });
  
  // Debug working hours state
  const [workingHours, setWorkingHours] = useState<Record<string, any> | null>(null);
  
  useEffect(() => {
    console.group('=== Working Hours Data ===');
    
    if (workingHoursError) {
      console.error('❌ Error fetching working hours:', workingHoursError);
    }
    
    if (workingHoursResponse) {
      console.log('📅 Raw API Response:', workingHoursResponse);
      
      // Extract the actual working hours data
      const workingHoursData = workingHoursResponse.data || workingHoursResponse;
      console.log('📊 Processed working hours data:', workingHoursData);
      
      if (workingHoursData && typeof workingHoursData === 'object') {
        console.log('📋 Raw working hours data:', workingHoursData);
        
        // Initialize with default values (closed)
        const processedHours: Record<string, any> = {
          sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
          monday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
          tuesday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
          wednesday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
          thursday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
          friday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
          saturday: { isOpen: false, openTime: '09:00', closeTime: '17:00' }
        };

        // Check if workingHours is an array (new format)
        if (Array.isArray(workingHoursData.workingHours)) {
          console.log('📅 Processing working hours array format');
          
          workingHoursData.workingHours.forEach((dayData: any) => {
            if (!dayData || !dayData.day) return;
            
            // Convert day name to lowercase for consistent access
            const dayName = dayData.day.toLowerCase();
            
            // Only update if we have a valid day
            if (processedHours[dayName] !== undefined) {
              processedHours[dayName] = {
                isOpen: dayData.isOpen !== undefined ? dayData.isOpen : true,
                openTime: dayData.open || '09:00',
                closeTime: dayData.close || '17:00'
              };
              
              console.log(`✅ Processed ${dayName}:`, {
                isOpen: processedHours[dayName].isOpen,
                openTime: processedHours[dayName].openTime,
                closeTime: processedHours[dayName].closeTime
              });
            } else {
              console.warn(`⚠️ Unknown day in working hours: ${dayData.day}`);
            }
          });
        } 
        // Fallback to old format if not an array
        else if (typeof workingHoursData === 'object') {
          console.log('ℹ️ Using legacy working hours format');
          
          const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          days.forEach(day => {
            // Check for day in various cases
            const dayData = workingHoursData[day] || 
                           workingHoursData[day.charAt(0).toUpperCase() + day.slice(1)] ||
                           workingHoursData[day.toUpperCase()];
            
            if (dayData) {
              processedHours[day] = {
                isOpen: dayData.isOpen !== undefined ? dayData.isOpen : true,
                openTime: dayData.openTime || dayData.open || '09:00',
                closeTime: dayData.closeTime || dayData.close || '17:00'
              };
            }
          });
        }
        
        console.log('🏁 Final working hours:', processedHours);
        setWorkingHours(processedHours);
      } else {
        console.warn('⚠️ Unexpected working hours format. Using default schedule.');
        // Set default working hours if data format is unexpected
        const defaultHours = days.reduce((acc, day) => ({
          ...acc,
          [day]: {
            isOpen: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day),
            openTime: '09:00',
            closeTime: '17:00'
          }
        }), {});
        
        setWorkingHours(defaultHours);
      }
    } else if (isLoadingWorkingHours) {
      console.log('⏳ Loading working hours...');
    } else {
      console.warn('⚠️ No working hours data received from API. Using default schedule.');
      // Set default working hours if no data is received
      const defaultHours = days.reduce((acc, day) => ({
        ...acc,
        [day]: {
          isOpen: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day),
          openTime: '09:00',
          closeTime: '17:00'
        }
      }), {});
      
      setWorkingHours(defaultHours);
    }
    
    console.groupEnd();
  }, [workingHoursResponse, workingHoursError, isLoadingWorkingHours]);
  
  // Log working hours state changes
  useEffect(() => {
    if (workingHours) {
      console.log('🔄 Working hours state updated:', {
        availableDays: Object.keys(workingHours).filter(day => workingHours[day]?.isOpen),
        tuesday: workingHours.tuesday || 'No Tuesday data'
      });
    }
  }, [workingHours]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  // Determine if client search should be enabled (only for new appointments)
  const isClientSearchEnabled = !isEditing && !isRescheduling;

  // Fetch staff data using the getStaff query
  const { data: staffResponse, isLoading: isLoadingStaff } = glowvitaApi.useGetStaffQuery(undefined, {
    refetchOnMountOrArgChange: true
  });

  // Update the staff data transformation
  const staffData: StaffMember[] = React.useMemo(() => {
    console.log('Raw staff response:', staffResponse);
    
    // Handle different response structures from the API
    let rawStaff = [];
    
    if (staffResponse) {
      if (Array.isArray(staffResponse)) {
        // Case 1: Response is directly an array
        rawStaff = staffResponse;
      } else if (staffResponse.data && Array.isArray(staffResponse.data)) {
        // Case 2: Response has a data property that contains the array
        rawStaff = staffResponse.data;
      } else if (staffResponse.staff && Array.isArray(staffResponse.staff)) {
        // Case 3: Response has a staff property that contains the array
        rawStaff = staffResponse.staff;
      }
    }
    
    console.log('Processed staff data:', rawStaff);
    
    return rawStaff.map((staff: any) => ({
      _id: staff._id || staff.id,
      name: staff.name || staff.fullName || staff.staffName,
      email: staff.email || staff.emailAddress,
      phone: staff.phone || staff.mobileNo
    }));
  }, [staffResponse]);

  // Fetch services data using the getVendorServices query
  const { data: servicesResponse, isLoading: isLoadingServices, error: servicesError } = glowvitaApi.useGetVendorServicesQuery(
    { 
      vendorId: vendorId || '', 
    },
    { 
      skip: !vendorId, // Skip if no vendorId is available
      refetchOnMountOrArgChange: true
    }
  );

  // Transform services data to match our expected format
  const services = React.useMemo(() => {
    let servicesData = [];
    
    // Handle different possible response structures
    if (servicesResponse?.data?.services) {
      servicesData = servicesResponse.data.services;
    } else if (servicesResponse?.services) {
      servicesData = servicesResponse.services;
    } else if (Array.isArray(servicesResponse?.data)) {
      servicesData = servicesResponse.data;
    } else if (Array.isArray(servicesResponse)) {
      servicesData = servicesResponse;
    }

    if (!Array.isArray(servicesData)) {
      console.error('Invalid services data format:', servicesResponse);
      return [];
    }

    return servicesData.map((service: any) => ({
      id: service._id || service.id,
      _id: service._id || service.id,
      name: service.name || service.serviceName || 'Unnamed Service',  // Added serviceName fallback
      duration: service.duration || 60,
      price: service.price || service.amount || 0,  // Added amount fallback
      category: service.category,
      staff: service.staff || [],
      description: service.description || '',
      gender: service.gender || 'unisex'
    }));
  }, [servicesResponse, servicesError]);

  const [createAppointment, { isLoading: isCreating }] = glowvitaApi.useCreateAppointmentMutation();
  const [updateAppointment, { isLoading: isUpdating }] = glowvitaApi.useUpdateAppointmentMutation();
  const [deleteAppointment, { isLoading: isDeleting }] = glowvitaApi.useDeleteAppointmentMutation();
  const [createClient, { isLoading: isCreatingClient }] = useCreateClientMutation();
    
  // Get the first staff member as default if available
  const defaultStaff = staffData?.[0];

  // Check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Get the minimum allowed time for a given date
  const getMinTimeForDate = (date: Date | string): string => {
    const targetDate = new Date(date);
    const now = new Date();
    
    // For future dates, return start of day (00:00)
    if (!isToday(targetDate)) {
      return '00:00'; // Allow any time for future dates
    }
    
    // For today, use current time + 15 minutes
    const minTime = new Date(now.getTime() + 15 * 60 * 1000);
    const hours = minTime.getHours().toString().padStart(2, '0');
    const minutes = minTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Use a ref to track the current duration without causing re-renders
  const durationRef = useRef(60); // Default to 60 minutes

  // Get current time with 15-minute buffer (only for today)
  const getCurrentTimeWithBuffer = (selectedDate?: Date | string) => {
    const now = new Date();
    const targetDate = selectedDate ? new Date(selectedDate) : now;
    
    // For future dates, return 09:00 as default start time
    if (targetDate > now && !isToday(targetDate)) {
      return '09:00';
    }
    
    // For today, use current time with buffer
    const minTime = getMinTimeForDate(now);
    return minTime;
  };

  const [appointmentData, setAppointmentData] = useState<Appointment>({
    _id: defaultValues?._id || defaultValues?.id || '',
    id: defaultValues?.id || defaultValues?._id || '',
    client: defaultValues?.client || '',
    clientName: defaultValues?.clientName || '',
    service: defaultValues?.service || '',
    serviceName: defaultValues?.serviceName || '',
    staff: defaultValues?.staff || '',
    staffName: defaultValues?.staffName || '',
    date: defaultValues?.date || defaultDate || new Date(),
    startTime: defaultValues?.startTime || getCurrentTimeWithBuffer(),
    endTime: defaultValues?.endTime || '',
    duration: defaultValues?.duration || 60,
    notes: defaultValues?.notes || '',
    status: defaultValues?.status || 'scheduled',
    amount: defaultValues?.amount || 0,
    discount: defaultValues?.discount || 0,
    tax: defaultValues?.tax || 0,
    totalAmount: defaultValues?.totalAmount || 0,
    paymentStatus: defaultValues?.paymentStatus || 'pending',
  });

  // Get blocked times for the selected staff and date - MOVED TO TOP LEVEL
  const blockedTimes = useSelector((state: any) => {
    if (!appointmentData.staff || !appointmentData.date) return [];
    
    try {
      const dateString = appointmentData.date instanceof Date 
        ? format(appointmentData.date, 'yyyy-MM-dd')
        : appointmentData.date;
      
      const result = selectBlockedTimesByStaffAndDate(state, { 
        staffId: appointmentData.staff, 
        date: dateString 
      });
      
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error getting blocked times:', error);
      return [];
    }
  });

  // Get blocked times for staff
  const { data: blockedTimesData, isLoading: isLoadingBlockedTimes } = glowvitaApi.useGetBlockedTimesQuery(
    formData.staff,
    { skip: !formData.staff || !formData.date }
  );
  
  // Check if the selected time is within working hours
  const isWithinWorkingHours = useCallback((startTime: string, endTime: string, selectedDate: Date | string) => {
    if (!workingHours) {
      console.warn('No working hours available');
      return false;
    }
    
    const date = new Date(selectedDate);
    const dayOfWeek = getDay(date);
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
    const daySchedule = workingHours[dayName];
    
    // Check if the business is closed on this day
    if (!daySchedule || !daySchedule.isOpen) {
      console.log('Business is closed on', dayName);
      return false;
    }
    
    // Parse times into minutes since midnight
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const [openH, openM] = daySchedule.openTime.split(':').map(Number);
    const [closeH, closeM] = daySchedule.closeTime.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    
    // Check if appointment is completely within working hours
    const isWithinHours = startMinutes >= openMinutes && endMinutes <= closeMinutes;
    
    // Debug logging
    if (!isWithinHours) {
      console.log('Appointment outside working hours:', {
        day: dayName,
        workingHours: `${daySchedule.openTime} - ${daySchedule.closeTime}`,
        appointmentTime: `${startTime} - ${endTime}`,
        startInMinutes: startMinutes,
        endInMinutes: endMinutes,
        openInMinutes: openMinutes,
        closeInMinutes: closeMinutes
      });
    }
    
    return isWithinHours;
  }, [workingHours]);
  
  // Check if staff is available at the selected time
  const isStaffAvailable = useCallback((startTime: string, endTime: string, staffId: string, appointmentId?: string) => {
    if (!staffId) return false;
    
    // Get existing appointments for the staff member
    const { data: existingAppointments } = glowvitaApi.useGetAppointmentsQuery(
      { staffId, date: formatDateForBackend(appointmentData.date) },
      { skip: !staffId || !appointmentData.date }
    );

    // Check for overlapping appointments (excluding current appointment if editing)
    const hasOverlappingAppointment = existingAppointments?.some((appt: any) => {
      // Skip the current appointment when editing
      if (appointmentId && (appt._id === appointmentId || appt.id === appointmentId)) {
        return false;
      }
      
      const apptStart = new Date(`${appt.date}T${appt.startTime}`).getTime();
      const apptEnd = new Date(`${appt.date}T${appt.endTime}`).getTime();
      const newStart = new Date(`${formatDateForBackend(appointmentData.date)}T${startTime}`).getTime();
      const newEnd = new Date(`${formatDateForBackend(appointmentData.date)}T${endTime}`).getTime();
      
      return newStart < apptEnd && newEnd > apptStart;
    });

    if (hasOverlappingAppointment) {
      return false;
    }

    // Check blocked times
    if (!blockedTimesData) return true; // If no blocked times data, assume available
    
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    
    // Check if there are any blocked times that overlap with the selected time
    const isBlocked = blockedTimesData.some((block: any) => {
      const [blockStartH, blockStartM] = block.startTime.split(':').map(Number);
      const [blockEndH, blockEndM] = block.endTime.split(':').map(Number);
      const blockStartMinutes = blockStartH * 60 + blockStartM;
      const blockEndMinutes = blockEndH * 60 + blockEndM;
      
      // Check for time overlap
      return startMinutes < blockEndMinutes && endMinutes > blockStartMinutes;
    });
    
    return !isBlocked; // If not blocked, staff is available
  }, [blockedTimesData]);
  
  // Check if time is blocked (using the same logic as isStaffAvailable for now)
  const isTimeBlocked = useCallback((startTime: string, endTime: string) => {
    return !isStaffAvailable(startTime, endTime);
  }, [isStaffAvailable]);
  
  // Log the current working hours state when validation starts
  useEffect(() => {
    console.log('🔄 Current working hours state:', workingHours);
  }, [workingHours]);

  // Validate appointment time with detailed checks
  const validateAppointmentTime = useCallback((startTime: string, endTime: string, selectedDate: Date | string) => {
    if (!workingHours) {
      return 'Working hours not loaded. Please try again.';
    }
    
    const date = new Date(selectedDate);
    const dayOfWeek = getDay(date);
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
    const daySchedule = workingHours[dayName];
    
    // Debug log to see the working hours data
    console.log('Working hours for', dayName, ':', daySchedule);
    
    // Check if the business is open on this day
    if (!daySchedule) {
      console.error(`❌ No schedule found for ${dayName}`);
      console.groupEnd();
      return `No working hours found for ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}. Please contact support.`;
    }
    
    if (!daySchedule.isOpen) {
      console.log(`ℹ️ ${dayName} is marked as closed in working hours`);
      console.groupEnd();
      return `Business is closed on ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}`;
    }
    
    // Parse times for comparison
    console.log('⏰ Parsing times:', {
      selectedTime: `${startTime} - ${endTime}`,
      workingHours: `${daySchedule.openTime} - ${daySchedule.closeTime}`
    });
    
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const [openH, openM] = daySchedule.openTime.split(':').map(Number);
    const [closeH, closeM] = daySchedule.closeTime.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    
    console.log('📊 Time comparison:', {
      startTime: { hours: startH, minutes: startM, totalMinutes: startMinutes },
      endTime: { hours: endH, minutes: endM, totalMinutes: endMinutes },
      openTime: { hours: openH, minutes: openM, totalMinutes: openMinutes },
      closeTime: { hours: closeH, minutes: closeM, totalMinutes: closeMinutes }
    });
    
    // Check if appointment is within working hours
    const isBeforeOpen = startMinutes < openMinutes;
    const isAfterClose = endMinutes > closeMinutes;
    
    console.log('✅ Time validation:', {
      isBeforeOpen,
      isAfterClose,
      isWithinHours: !isBeforeOpen && !isAfterClose
    });
    
    if (isBeforeOpen || isAfterClose) {
      console.warn(`❌ Time outside working hours. Before open: ${isBeforeOpen}, After close: ${isAfterClose}`);
      console.groupEnd();
      return `Selected time (${startTime} - ${endTime}) is outside of working hours (${daySchedule.openTime} - ${daySchedule.closeTime})`;
    }
    
    // Check staff availability
    const staffAvailable = isStaffAvailable(startTime, endTime);
    console.log('👤 Staff availability:', staffAvailable ? '✅ Available' : '❌ Not available');
    
    if (!staffAvailable) {
      console.groupEnd();
      return 'Staff member is not available at the selected time';
    }
    
    // Check for blocked times
    const timeBlocked = isTimeBlocked(startTime, endTime);
    console.log('🚫 Blocked time check:', timeBlocked ? 'Blocked' : 'Available');
    
    if (timeBlocked) {
      console.groupEnd();
      return 'The selected time is blocked';
    }
    
    console.log('🎉 Time slot is valid!');
    console.groupEnd();
    return null; // No errors, time slot is valid
  }, [workingHours, isWithinWorkingHours, isStaffAvailable, isTimeBlocked]);

  // Check if a time is within working hours and not blocked - FIXED
  const isTimeAvailable = useCallback((date: Date, time: string, staffId: string): boolean => {
    if (!staffId) return true;
    
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = addMinutes(startTime, durationRef.current);
    
    // Use the blockedTimes from the top-level selector
    const isBlocked = blockedTimes.some((block: any) => {
      if (block.staffId !== staffId && block.staffId !== 'all') return false;
      
      const blockStart = new Date(block.startTime);
      const blockEnd = new Date(block.endTime);
      
      // Check if the appointment overlaps with the blocked time
      return (
        (startTime.getTime() >= blockStart.getTime() && startTime.getTime() < blockEnd.getTime()) ||
        (endTime.getTime() > blockStart.getTime() && endTime.getTime() <= blockEnd.getTime()) ||
        (startTime.getTime() <= blockStart.getTime() && endTime.getTime() >= blockEnd.getTime())
      );
    });
    
    return !isBlocked;
  }, [blockedTimes]); // Add blockedTimes as dependency

  // A ref to track the ID of the appointment being edited to prevent re-initialization
  const processedAppointmentId = useRef<string | null>(null);

  // This one useEffect will handle all default value logic when editing/rescheduling
  useEffect(() => {
    const appointmentId = defaultValues?._id || defaultValues?.id;

    // Conditions to run:
    // 1. We must have defaultValues for an existing appointment.
    // 2. All dependent data (services, staff) must be loaded.
    // 3. We haven't already processed this specific appointment ID.
    if (!appointmentId || processedAppointmentId.current === appointmentId || isLoadingServices || isLoadingStaff) {
      return;
    }

    console.log('Initializing form with default values for appointment:', appointmentId);

    // Start with a clean state object based on the defaultValues
    const newAppointmentState = { ...appointmentData, ...defaultValues };

    // --- Data Hydration: Find and set correct names/details based on IDs --- 

    // 1. Hydrate Service Info
    // Try by ID first; if not present, try by name
    let hydratedService: any = null;
    if (newAppointmentState.service) {
      hydratedService = services.find(
        (s) => s._id === newAppointmentState.service || s.id === newAppointmentState.service
      ) || null;
    }
    if (!hydratedService && newAppointmentState.serviceName) {
      hydratedService = services.find((s) => s.name === newAppointmentState.serviceName) || null;
    }
    if (hydratedService) {
      newAppointmentState.service = hydratedService.id || hydratedService._id;
      newAppointmentState.serviceName = hydratedService.name;
      newAppointmentState.duration = hydratedService.duration;
      newAppointmentState.amount = hydratedService.price;
    }

    // 2. Hydrate Staff Info
    if (newAppointmentState.staff) {
      const staffId = typeof newAppointmentState.staff === 'object' 
        ? (newAppointmentState.staff as any)._id 
        : newAppointmentState.staff;
      const staffMember = staffData.find((s: StaffMember) => s._id === staffId);
      if (staffMember) {
        newAppointmentState.staff = staffMember._id;
        newAppointmentState.staffName = staffMember.name;
      }
    }
    
    // 3. Hydrate Client Info (if client is passed as a full object)
    if (newAppointmentState.client && typeof newAppointmentState.client === 'object') {
        newAppointmentState.clientName = (newAppointmentState.client as any).fullName || newAppointmentState.clientName;
        newAppointmentState.client = (newAppointmentState.client as any)._id;
    }

    // --- Final State Calculation ---
    
    // Recalculate total amount with the hydrated data
    newAppointmentState.totalAmount = calculateTotalAmount(
      newAppointmentState.amount || 0,
      newAppointmentState.discount || 0,
      newAppointmentState.tax || 0
    );

    // Set the final, hydrated state
    setAppointmentData({
        ...newAppointmentState,
        id: appointmentId,
        _id: appointmentId,
        date: newAppointmentState.date ? new Date(newAppointmentState.date) : new Date(),
    });

    // Mark this appointment ID as processed to prevent this effect from re-running unnecessarily
    processedAppointmentId.current = appointmentId;

  }, [defaultValues, services, staffData, isLoadingServices, isLoadingStaff]);

  // Reset the processed ID if the component is used for a new appointment (no defaultValues)
  useEffect(() => {
    if (!defaultValues) {
      processedAppointmentId.current = null;
    }
  }, [defaultValues]);

  // Set default service for NEW appointments when services load
  useEffect(() => {
    // Run only for new appointments (no defaultValues) after services have loaded
    if (!defaultValues && !isLoadingServices && services.length > 0 && !appointmentData.service) {
      const firstService = services[0];
      if (firstService) {
        setAppointmentData(prev => ({
          ...prev,
          service: firstService.id,
          serviceName: firstService.name,
          duration: firstService.duration || 60,
          amount: firstService.price || 0,
          totalAmount: calculateTotalAmount(
            firstService.price || 0,
            prev.discount,
            prev.tax
          )
        }));
      }
    }
  }, [services, isLoadingServices, defaultValues, appointmentData.service]);

  // Update the staff change handler
  const handleStaffChange = (staffId: string) => {
    const selectedStaff = staffData.find((s: StaffMember) => s._id === staffId);
    if (selectedStaff) {
      setAppointmentData(prev => ({
        ...prev,
        staff: staffId,
        staffName: selectedStaff.name
      }));
    }
  };

  // Initialize staff selection when staff data loads
  useEffect(() => {
    if (staffData.length > 0) {
      // If editing and staff is set, ensure staffName is set
      if (appointmentData.staff) {
        const selectedStaff = staffData.find((s: StaffMember) => s._id === appointmentData.staff);
        if (selectedStaff && selectedStaff.name !== appointmentData.staffName) {
          setAppointmentData(prev => ({
            ...prev,
            staffName: selectedStaff.name
          }));
        }
      } 
      // If no staff selected, select the first one
      else if (staffData[0]) {
        setAppointmentData(prev => ({
          ...prev,
          staff: staffData[0]._id,
          staffName: staffData[0].name
        }));
      }
    }
  }, [staffData, appointmentData.staff, appointmentData.staffName]);

  // Update the getMinTime function to return current time with buffer only for today
  const getMinTime = (selectedDate: Date): string => {
    const now = new Date();
    
    // If the selected date is not today, allow any time
    if (!isToday(selectedDate)) {
      return '00:00';
    }
    
    // For today, use current time + 15 minutes
    const bufferTime = new Date(now.getTime() + 15 * 60 * 1000);
    const hours = bufferTime.getHours().toString().padStart(2, '0');
    const minutes = bufferTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Function to calculate end time from start time and duration
  const calculateEndTime = (startTime: string, duration: number): string => {
    if (!startTime) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
    
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  // Update the service change handler to update both start and end times
  const handleServiceChange = (serviceId: string) => {
    const selectedService = services.find(s => s.id === serviceId || s._id === serviceId);
    if (selectedService) {      
      // Calculate total amount based on service price, discount and tax
      const amount = selectedService.price || 0;
      const discount = appointmentData.discount || 0;
      const tax = appointmentData.tax || 0;
      const totalAmount = Math.max(0, amount - discount + tax);
      
      setAppointmentData(prev => ({
        ...prev,
        service: selectedService.id || selectedService._id,
        serviceName: selectedService.name,
        duration: selectedService.duration || 60,
        amount: amount,
        totalAmount: totalAmount,
        endTime: calculateEndTime(prev.startTime, selectedService.duration || 60)
      }));
    }
  };

  // Find the next available time slot that fits the duration
  const findNextAvailableTimeSlot = async (date: Date, startTime: string, duration: number, staffId: string): Promise<string | null> => {
    if (!staffId) return startTime;
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    let currentTime = new Date(date);
    currentTime.setHours(startHours, startMinutes, 0, 0);
    
    // Get existing appointments for the staff member
    const { data: existingAppointments } = await glowvitaApi.endpoints.getAppointments.initiate(
      { 
        staffId, 
        date: formatDateForBackend(date)
      }
    );
    
    // Check up to 24 hours in the future
    for (let i = 0; i < 96; i++) { // 96 = 24 hours * 4 (15-minute intervals)
      const timeStr = format(currentTime, 'HH:mm');
      const endTime = calculateEndTime(timeStr, duration);
      
      // Check if time is available (not blocked)
      const isAvailable = isTimeAvailable(date, timeStr, staffId);
      
      // Check for overlapping appointments
      const hasOverlap = existingAppointments?.some((appt: any) => {
        const apptStart = new Date(`${appt.date}T${appt.startTime}`).getTime();
        const apptEnd = new Date(`${appt.date}T${appt.endTime}`).getTime();
        const newStart = currentTime.getTime();
        const newEnd = addMinutes(currentTime, duration).getTime();
        
        return newStart < apptEnd && newEnd > apptStart;
      });
      
      if (isAvailable && !hasOverlap) {
        return timeStr;
      }
      
      // Move to next 15-minute interval
      currentTime = addMinutes(currentTime, 15);
    }
    
    return null;
  };

  // Update the start time handler to also update end time
  const handleStartTimeChange = async (time: string) => {
    try {
      setAppointmentData(prev => {
        // Check if the selected time is available
        if (prev.staff && !isTimeAvailable(prev.date, time, prev.staff)) {
          // Find the next available time slot
          findNextAvailableTimeSlot(
            prev.date,
            time,
            prev.duration || 60,
            prev.staff
          ).then(nextAvailableTime => {
            if (nextAvailableTime) {
              setAppointmentData(current => ({
                ...current,
                startTime: nextAvailableTime,
                endTime: calculateEndTime(nextAvailableTime, current.duration || 60)
              }));
            } else {
              toast.error('No available time slots found. Please try a different time or staff member.');
            }
          });
          
          // Return current state while we check for availability
          return prev;
        }
        
        // Check for overlapping appointments
        if (prev.staff) {
          const endTime = calculateEndTime(time, prev.duration || 60);
          
          glowvitaApi.endpoints.getAppointments.initiate(
            { 
              staffId: prev.staff, 
              date: formatDateForBackend(prev.date)
            }
          ).then(({ data: existingAppointments }) => {
            const hasOverlap = existingAppointments?.some((appt: any) => {
              if (appointmentData._id && (appt._id === appointmentData._id)) {
                return false;
              }
              
              const apptStart = new Date(`${appt.date}T${appt.startTime}`).getTime();
              const apptEnd = new Date(`${appt.date}T${appt.endTime}`).getTime();
              const newStart = new Date(prev.date);
              const [hours, mins] = time.split(':').map(Number);
              newStart.setHours(hours, mins, 0, 0);
              const newEnd = addMinutes(newStart, prev.duration || 60);
              
              return newStart.getTime() < apptEnd && newEnd.getTime() > apptStart;
            });
            
            if (hasOverlap) {
              toast.error('The selected staff member already has an appointment at this time. Please choose a different time or staff member.');
            }
          });
        }
        
        return {
          ...prev,
          startTime: time,
          // Only update end time if duration is set
          ...(prev.duration > 0 && {
            endTime: calculateEndTime(time, prev.duration)
          })
        };
      });
    } catch (error) {
      console.error('Error checking appointment availability:', error);
      toast.error('Error checking appointment availability. Please try again.');
    }
  };

  // Update the end time handler
  const handleEndTimeChange = (time: string) => {
    setAppointmentData(prev => ({
      ...prev,
      endTime: time,
      // Update duration when end time is manually changed
      duration: calculateDuration(prev.startTime, time)
    }));
  };

  // Helper to calculate duration in minutes
  const calculateDuration = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startDate = new Date();
    startDate.setHours(startHours, startMinutes, 0, 0);
    
    let endDate = new Date();
    endDate.setHours(endHours, endMinutes, 0, 0);
    
    // Handle case where end time is on the next day
    if (endDate <= startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  };

  // Calculate total amount
  const calculateTotalAmount = (amount: number, discount: number, tax: number): number => {
    return Math.max(0, amount - discount + tax);
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof Appointment, value: any) => {
    setAppointmentData(prev => {
      // Convert string values to numbers for amount fields
      const numericValue = typeof value === 'string' && ['amount', 'discount', 'tax', 'totalAmount'].includes(field)
        ? parseFloat(value) || 0
        : value;

      const updated = { ...prev, [field]: numericValue };

      // Auto-calculate dependent fields
      if (field === 'startTime' || field === 'duration') {
        updated.endTime = calculateEndTime(
          field === 'startTime' ? value : prev.startTime,
          field === 'duration' ? value : prev.duration
        );
      }

      // Recalculate total amount when amount, discount, or tax changes
      if (['amount', 'discount', 'tax'].includes(field)) {
        const amount = field === 'amount' ? numericValue : updated.amount || 0;
        const discount = field === 'discount' ? numericValue : updated.discount || 0;
        const tax = field === 'tax' ? numericValue : updated.tax || 0;
        updated.totalAmount = Math.max(0, amount - discount + tax);
      }

      return updated;
    });
  };

  // Helper function to format dates without timezone issues
  const formatDateForForm = (date: Date | string): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateForBackend = (date: Date | string): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if the selected time is within working hours
    if (appointmentData.staff && appointmentData.date && appointmentData.startTime) {
      // Calculate end time based on duration
      const [hours, minutes] = appointmentData.startTime.split(':').map(Number);
      const startTime = new Date(appointmentData.date);
      startTime.setHours(hours, minutes, 0, 0);
      const endTime = addMinutes(startTime, appointmentData.duration || 60);
      
      // Format times for validation
      const startTimeStr = format(startTime, 'HH:mm');
      const endTimeStr = format(endTime, 'HH:mm');
      
      // 1. Validate appointment time against working hours
      const timeError = validateAppointmentTime(
        startTimeStr, 
        endTimeStr, 
        appointmentData.date
      );
      
      if (timeError) {
        toast.error(timeError);
        return;
      }
      
      // 2. Check if the selected time is blocked
      const isTimeBlocked = !isTimeAvailable(
        appointmentData.date,
        appointmentData.startTime,
        appointmentData.staff
      );
      
      if (isTimeBlocked) {
        toast.error('The selected time is blocked. Please choose a different time or staff member.');
        return;
      }
      
      // 3. Check for existing appointments for the same staff at the same time
      const { data: existingAppointments } = await glowvitaApi.endpoints.getAppointments.initiate(
        { 
          staffId: appointmentData.staff, 
          date: formatDateForBackend(appointmentData.date) 
        }
      );
      
      const hasOverlappingAppointment = existingAppointments?.some((appt: any) => {
        // Skip the current appointment when editing
        if (appointmentData._id && (appt._id === appointmentData._id)) {
          return false;
        }
        
        const apptStart = new Date(`${appt.date}T${appt.startTime}`).getTime();
        const apptEnd = new Date(`${appt.date}T${appt.endTime}`).getTime();
        const newStart = startTime.getTime();
        const newEnd = endTime.getTime();
        
        return newStart < apptEnd && newEnd > apptStart;
      });
      
      if (hasOverlappingAppointment) {
        toast.error('The selected staff member already has an appointment at this time. Please choose a different time or staff member.');
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      // Validate required fields
      if (!appointmentData.clientName || !appointmentData.clientName.trim()) {
        toast.error('Please enter client name');
        return;
      }
      if (!appointmentData.service) {
        toast.error('Please select a service');
        return;
      }

      // Prepare the appointment payload
      const appointmentPayload = {
        ...appointmentData,
        // Only include client ID if it's a valid ObjectId
        ...(appointmentData.client && isValidObjectId(appointmentData.client) 
          ? { client: appointmentData.client } 
          : { client: undefined }),
        // Always include clientName
        clientName: appointmentData.clientName,
        // Ensure staff is set
        staff: appointmentData.staff || (staffData[0]?._id || ''),
        staffName: appointmentData.staffName || staffData.find((s: StaffMember) => s._id === appointmentData.staff)?.name || '',
        // Ensure dates are properly formatted
        date: appointmentData.date instanceof Date 
          ? formatDateForBackend(appointmentData.date) 
          : appointmentData.date,
        // Ensure numeric fields are numbers
        amount: Number(appointmentData.amount) || 0,
        discount: Number(appointmentData.discount) || 0,
        tax: Number(appointmentData.tax) || 0,
        totalAmount: Number(appointmentData.totalAmount) || 0,
        duration: Number(appointmentData.duration) || 60,
      };

      // Remove empty or undefined fields
      Object.keys(appointmentPayload).forEach(key => {
        if (appointmentPayload[key as keyof typeof appointmentPayload] === undefined || 
            appointmentPayload[key as keyof typeof appointmentPayload] === '') {
          delete appointmentPayload[key as keyof typeof appointmentPayload];
        }
      });

      if (onSubmit) {
        await onSubmit(appointmentPayload as Appointment);
      } else if (isEditing && (appointmentData.id || appointmentData._id)) {
        await updateAppointment({
          ...appointmentPayload,
          _id: appointmentData._id || appointmentData.id
        }).unwrap();
        toast.success('Appointment updated successfully');
      } else {
        // For new appointments, ensure we don't send an ID
        const { _id, id, ...newAppointment } = appointmentPayload;
        await createAppointment(newAppointment).unwrap();
        toast.success('Appointment created successfully');
      }
      
      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to save appointment. Please check all fields and try again.';
      console.error('Detailed error:', error);
      toast.error('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!appointmentData.id) return;
    
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        if (onDelete) {
          onDelete(appointmentData.id);
        } else {
          await deleteAppointment(appointmentData.id).unwrap();
          toast.success('Appointment deleted successfully');
          if (onSuccess) onSuccess();
        }
      } catch (error: any) {
        console.error('Error deleting appointment:', error);
        toast.error('Failed to delete appointment');
      }
    }
  };

  const isLoading = isLoadingStaff || isLoadingServices || isCreating || isUpdating || isDeleting;

  // Add this function to check if a date is in the past
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Client search functionality - only used for new appointments
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const clientSearchRef = useRef<HTMLDivElement>(null);

  // Debounce the search term to improve performance
  const debouncedClientSearchTerm = useDebounce(clientSearchTerm, 300);

  // Fetch clients with search - only for new appointments
  const { 
    data: clientsResponse = [], 
    isLoading: isLoadingClients,
    isFetching: isFetchingClients,
    refetch: refetchClients
  } = glowvitaApi.useGetClientsQuery(
    { 
      search: debouncedClientSearchTerm,
      status: '',
      page: 1,
      limit: 100
    },
    { 
      skip: !user?._id || !debouncedClientSearchTerm || !isClientSearchEnabled, // Skip if not new appointment
      refetchOnMountOrArgChange: true
    }
  );

  // Handle client selection
  const handleClientSelect = (client: any) => {
    setAppointmentData(prev => ({
      ...prev,
      client: client._id,
      clientName: client.fullName || client.name || ''
    }));
    setClientSearchTerm('');
    setIsClientDropdownOpen(false);
  };

  // Clear selected client
  const clearClient = () => {
    setAppointmentData(prev => ({
      ...prev,
      client: '',
      clientName: ''
    }));
    setClientSearchTerm('');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientSearchRef.current && !clientSearchRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [newClientData, setNewClientData] = useState({
    fullName: '',
    email: '',
    phone: '',
    birthdayDate: '',
    gender: '' as 'Male' | 'Female' | 'Other' | '',
    country: '',
    occupation: '',
    profilePicture: '',
    address: '',
    preferences: ''
  });

  const handleNewClientInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewClientData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewClientSelectChange = (name: string, value: string) => {
    setNewClientData(prev => ({ ...prev, [name]: value as any }));
  };

  const handleNewClientFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewClientData(prev => ({ ...prev, profilePicture: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleCreateClient = async () => {
    if (!newClientData.fullName || !newClientData.phone) {
      toast.error('Full Name and Phone are required.');
      return;
    }
    try {
      const newClient = await createClient(newClientData).unwrap();
      toast.success('New client has been added successfully.');
      handleClientSelect(newClient.data);
      setIsAddClientModalOpen(false); 
      setNewClientData({ 
        fullName: '', 
        email: '', 
        phone: '',
        birthdayDate: '',
        gender: '',
        country: '',
        occupation: '',
        profilePicture: '',
        address: '',
        preferences: ''
      });
      refetchClients();
    } catch (error: any) {
      console.error('Failed to create client:', error);
      toast.error(error.data?.message || 'An error occurred while creating the client.');
    }
  };

  // Update the form title based on the mode
  const formTitle = isRescheduling 
    ? 'Reschedule Appointment' 
    : isEditing 
      ? 'Edit Appointment' 
      : 'New Appointment';

  const formDescription = isRescheduling
    ? 'Update the date and time for this appointment'
    : isEditing
      ? 'Update the appointment details'
      : 'Fill in the details to schedule a new appointment';

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900">
          {formTitle}
        </h2>
        <p className="text-sm text-gray-500">
          {formDescription}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Field - Different rendering based on mode */}
        {isClientSearchEnabled ? (
          /* Client Search - Only for new appointments */
          <div className="space-y-2 relative" ref={clientSearchRef}>
            <Label htmlFor="clientSearch" className="text-sm font-medium text-gray-700">
              Client <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <div className="relative">
                <Input
                  id="clientSearch"
                  type="text"
                  value={isClientDropdownOpen ? clientSearchTerm : appointmentData.clientName}
                  onChange={(e) => {
                    setClientSearchTerm(e.target.value);
                    if (!isClientDropdownOpen) setIsClientDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setIsClientDropdownOpen(true);
                  }}
                  placeholder="Search for a client..."
                  className="pl-10 w-full"
                  autoComplete="off"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                {(isLoadingClients || isFetchingClients) && (
                  <Loader2 className="absolute right-10 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                )}
                {appointmentData.clientName && (
                  <button
                    type="button"
                    onClick={clearClient}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Client Dropdown */}
              {isClientDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 max-h-60 overflow-auto border border-gray-200">
                  {isLoadingClients || isFetchingClients ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Loading clients...</div>
                  ) : Array.isArray(clientsResponse) && clientsResponse.length > 0 ? (
                    clientsResponse.map((client: any) => (
                      <button
                        key={client._id}
                        type="button"
                        onClick={() => handleClientSelect(client)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-0"
                      >
                        <div className="font-medium text-gray-900">{client.fullName || client.name}</div>
                        {client.email && (
                          <div className="text-sm text-gray-500 truncate">{client.email}</div>
                        )}
                        {client.phone && (
                          <div className="text-sm text-gray-500">{client.phone}</div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      {debouncedClientSearchTerm ? 'No matching clients found.' : 'Start typing to search...'}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsAddClientModalOpen(true)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-blue-600 font-medium flex items-center border-t"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Client
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Client Name Display - For edit and reschedule modes */
          <div className="space-y-2">
            <Label htmlFor="clientName" className="text-sm font-medium text-gray-700">
              Client <span className="text-red-500">*</span>
            </Label>
            <Input
              id="clientName"
              type="text"
              value={appointmentData.clientName}
              onChange={(e) => handleFieldChange('clientName', e.target.value)}
              placeholder="Client name"
              className="w-full"
              required
            />
          </div>
        )}

        {/* Date and Time Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-gray-700">
              Date <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={appointmentData.date ? formatDateForForm(appointmentData.date) : ''}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  if (!isDateDisabled(selectedDate)) {
                    // Update the date
                    handleFieldChange('date', selectedDate);
                    
                    // If the selected date is today, update the minimum time
                    if (isToday(selectedDate)) {
                      const minTime = getMinTime(selectedDate);
                      if (appointmentData.startTime < minTime) {
                        handleStartTimeChange(minTime);
                      }
                    } else {
                      // For future dates, set a default start time if not already set
                      if (!appointmentData.startTime) {
                        handleStartTimeChange('09:00');
                      }
                    }
                  } else {
                    toast.error('Cannot select past dates');
                  }
                }}
                min={formatDateForForm(new Date())}
                className="pl-10 w-full"
                required
              />
              <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
      

          <div className="space-y-2">
            <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">
              Start Time <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startTime"
              type="time"
              value={appointmentData.startTime}
              min={getMinTime(appointmentData.date instanceof Date ? appointmentData.date : new Date(appointmentData.date))}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime" className="text-sm font-medium text-gray-700">
              End Time <span className="text-red-500">*</span>
            </Label>
            <Input
              id="endTime"
              type="time"
              value={appointmentData.endTime}
              min={appointmentData.startTime} // Ensure end time is after start time
              onChange={(e) => handleEndTimeChange(e.target.value)}
              className="w-full"
              required
            />
          </div>
        </div>

        {/* Service and Staff Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="service" className="text-sm font-medium text-gray-700">
              Service <span className="text-red-500">*</span>
            </Label>
            {isLoadingServices ? (
              <div className="flex items-center justify-center p-2 bg-gray-100 rounded-md">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Loading services...</span>
              </div>
            ) : (
              <Select
                value={appointmentData.service}
                onValueChange={handleServiceChange}
                disabled={isLoadingServices || services.length === 0}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={
                    isLoadingServices ? 'Loading services...' : 
                    services.length === 0 ? 'No services available' : 'Select a service'
                  }>
                    {appointmentData.serviceName && (
                      <div className="flex justify-between w-full">
                        <span>{appointmentData.serviceName}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          ${appointmentData.amount?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id || service._id} value={service.id || service._id}>
                      <div className="flex justify-between w-full">
                        <span>{service.name}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          ${service.price?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!isLoadingServices && services.length === 0 && (
              <p className="text-sm text-red-500">No services found. Please add services first.</p>
            )}
            {servicesError && (
              <p className="text-sm text-red-500">Error loading services. Please try again.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff" className="text-sm font-medium text-gray-700">
              Staff <span className="text-red-500">*</span>
            </Label>
            {staffData.length > 0 ? (
              <Select
                value={appointmentData.staff}
                onValueChange={handleStaffChange}
                disabled={isLoadingStaff || staffData.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={
                    isLoadingStaff ? 'Loading staff...' : 
                    staffData.length === 0 ? 'No staff available' : 'Select a staff member'
                  }>
                    {appointmentData.staffName && (
                      <span>{appointmentData.staffName}</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {staffData.map((staff: StaffMember) => (
                    <SelectItem key={staff._id} value={staff._id}>
                      <div className="flex flex-col">
                        <span>{staff.name}</span>
                        {staff.email && (
                          <span className="text-xs text-gray-500">{staff.email}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-gray-500">
                {isLoadingStaff ? 'Loading staff...' : 'No staff members found'}
              </div>
            )}
          </div>
        </div>

        {/* Financial Information Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Amount ($)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={appointmentData.amount || ''}
              onChange={(e) => handleFieldChange('amount', e.target.value)}
              placeholder="0.00"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount" className="text-sm font-medium text-gray-700">
              Discount ($) <span className="text-gray-400 text-xs">(Optional)</span>
            </Label>
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.01"
              value={appointmentData.discount || ''}
              onChange={(e) => handleFieldChange('discount', e.target.value)}
              placeholder="0.00"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax" className="text-sm font-medium text-gray-700">
              Tax ($)
            </Label>
            <Input
              id="tax"
              type="number"
              step="0.01"
              min="0"
              value={appointmentData.tax || ''}
              onChange={(e) => handleFieldChange('tax', e.target.value)}
              placeholder="0.00"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalAmount" className="text-sm font-medium text-gray-700">
              Total Amount ($)
            </Label>
            <Input
              id="totalAmount"
              type="text"
              value={appointmentData.totalAmount ? appointmentData.totalAmount.toFixed(2) : '0.00'}
              readOnly
              className="w-full bg-gray-50"
            />
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
            Duration (minutes)
          </Label>
          <Input
            id="duration"
            type="number"
            min="1"
            value={appointmentData.duration || ''}
            onChange={(e) => {
              const duration = e.target.value ? parseInt(e.target.value) : 60;
              setAppointmentData(prev => ({
                ...prev,
                duration: Math.max(1, duration),
                endTime: calculateEndTime(prev.startTime, duration)
              }));
            }}
            placeholder="60"
            className="w-full"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
            Notes <span className="text-gray-400 text-xs">(Optional)</span>
          </Label>
          <Textarea
            id="notes"
            value={appointmentData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            placeholder="Add any additional notes..."
            rows={3}
            className="w-full"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          {isEditing && appointmentData.id && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="mr-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Saving...' : 'Scheduling...'}
              </>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Schedule Appointment'
            )}
          </Button>
        </div>
      </form>

      {/* Add New Client Modal - Only for new appointments */}
      {isClientSearchEnabled && (
        <Dialog open={isAddClientModalOpen} onOpenChange={setIsAddClientModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Enter the details for the new client.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Profile Picture */}
              <div className="space-y-2">
                  <div className="flex justify-center">
                      <div className="relative">
                          <p className="text-sm font-medium text-gray-700 text-center mb-2">Profile Photo</p>
                          <input 
                              id="profilePicture" 
                              type="file" 
                              accept="image/*"
                              onChange={handleNewClientFileChange}
                              className="hidden"
                          />
                          <label 
                              htmlFor="profilePicture" 
                              className="cursor-pointer block"
                          >
                              <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-300 hover:border-blue-400 transition-colors duration-200 flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-blue-50">
                                  {newClientData.profilePicture ? (
                                      <img 
                                          src={newClientData.profilePicture} 
                                          alt="Profile preview" 
                                          className="w-full h-full object-cover" 
                                      />
                                  ) : (
                                      <div className="text-center">
                                          <PlusCircle className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                          <span className="text-xs text-gray-500">Add Photo</span>
                                      </div>
                                  )}
                              </div>
                          </label>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                  <Input id="fullName" name="fullName" value={newClientData.fullName} onChange={handleNewClientInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                  <Input id="phone" name="phone" value={newClientData.phone} onChange={handleNewClientInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={newClientData.email} onChange={handleNewClientInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthdayDate">Birthday</Label>
                  <Input id="birthdayDate" name="birthdayDate" type="date" value={newClientData.birthdayDate} onChange={handleNewClientInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select name="gender" value={newClientData.gender} onValueChange={(value) => handleNewClientSelectChange('gender', value)}>
                      <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" value={newClientData.country} onChange={handleNewClientInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input id="occupation" name="occupation" value={newClientData.occupation} onChange={handleNewClientInputChange} />
                </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" name="address" value={newClientData.address} onChange={handleNewClientInputChange} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="preferences">Preferences</Label>
                  <Textarea id="preferences" name="preferences" value={newClientData.preferences} onChange={handleNewClientInputChange} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddClientModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateClient} disabled={isCreatingClient}>
                {isCreatingClient && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                Save Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}