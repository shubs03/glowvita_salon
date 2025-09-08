"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { glowvitaApi } from '@repo/store/api';
import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Card } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import { ChevronLeft, Loader2, Clock, Plus, X } from 'lucide-react';
// Simple toast notification function
const toast = {
  success: (title: string, description?: string) => {
    alert(`${title}\n${description || ''}`);
  },
  error: (title: string, description?: string) => {
    alert(`Error: ${title}\n${description || ''}`);
  }
};
import React from 'react';
import { format, parseISO, isSameDay, addMinutes, parse, isWithinInterval, addDays, startOfDay, endOfDay } from 'date-fns';

// Components
import DayScheduleView from '../components/DayScheduleView';
import NewAppointmentForm from '../components/NewAppointmentForm';

// Store
import { 
  selectAllAppointments, 
  selectSelectedAppointment,
  setSelectedAppointment,
} from '@repo/store/slices/appointmentSlice';
import { useAppDispatch, useAppSelector } from '@repo/store/hooks';
import { setWorkingHours } from '@repo/store/slices/workingHoursSlice';
import { selectBlockedTimes } from '@repo/store/slices/blockTimeSlice';

// Helper function to parse time string (e.g., "09:00AM") to hours and minutes
const parseTimeString = (timeStr: string) => {
  const [time, period] = timeStr.match(/\d+|AM|PM/gi) || [];
  if (!time) return [0, 0];
  
  let [hours, minutes] = time.split(':').map(Number);
  
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return [hours, minutes || 0];
};

// Move date validation outside the component
function validateAndParseDate(dateString: any): { isValid: boolean; date?: Date; dayName?: string } {
  if (!dateString || typeof dateString !== 'string') return { isValid: false };
  
  const [year, month, day] = dateString.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return { isValid: false };
  
  const date = new Date(year, month - 1, day);
  const isValid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  
  if (!isValid) return { isValid: false };
  
  return {
    isValid: true,
    date,
    dayName: date.toLocaleString('en-US', { weekday: 'long' }).toLowerCase()
  };
}

export default function DailySchedulePage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  
  // State
  const [showBlockTimeModal, setShowBlockTimeModal] = useState(false);
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // RTK Query hooks
  const [createAppointment] = glowvitaApi.useCreateAppointmentMutation();
  const [updateAppointment] = glowvitaApi.useUpdateAppointmentMutation();
  const [deleteAppointment] = glowvitaApi.useDeleteAppointmentMutation();
  
  // Extract and validate date
  const { date: dateString } = params || {};
  const { isValid, date: selectedDate, dayName } = validateAndParseDate(dateString);
  
  // Get appointments from Redux store
  const allAppointments = useSelector(selectAllAppointments);
  const selectedAppointment = useSelector(selectSelectedAppointment);
  
  // Fetch appointments for the selected date range using RTK Query
  const { data: appointmentsData, isLoading: isLoadingAppointments } = glowvitaApi.useGetAppointmentsQuery(
    {
      startDate: selectedDate ? startOfDay(selectedDate).toISOString() : '',
      endDate: selectedDate ? endOfDay(selectedDate).toISOString() : '',
    },
    { skip: !selectedDate }
  );

  // Handle appointments data
  useEffect(() => {
    if (appointmentsData && Array.isArray(appointmentsData)) {
      // Process and store appointments in Redux if needed
      console.log('Fetched appointments:', appointmentsData);
    }
  }, [appointmentsData]);
  
  // Fetch working hours
  const { data: workingHoursData, isLoading: isLoadingWorkingHours, error: workingHoursError } = glowvitaApi.useGetWorkingHoursQuery(
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    { skip: !selectedDate }
  );

  // Fetch staff list
  const { data: staffData, isLoading: isLoadingStaff, error: staffError } = glowvitaApi.useGetStaffQuery();

  // Transform staff data for the schedule view
  const staffList = useMemo(() => {
    if (!staffData || !Array.isArray(staffData)) return [];
    
    return staffData.map(staff => ({
      id: staff._id || staff.id,
      name: staff.fullName || staff.name,
      position: staff.position,
      image: staff.photo,
      isActive: staff.status === 'active' || staff.status === 'Active'
    }));
  }, [staffData]);

  // Debug: Log the response structure
  useEffect(() => {
    if (workingHoursData) {
      console.log('Working Hours API Response:', workingHoursData);
      console.log('Response structure:', JSON.stringify(workingHoursData, null, 2));
    }
    if (workingHoursError) {
      console.error('Working Hours API Error:', workingHoursError);
    }
    
    // Debug: Log staff data
    console.log('Staff Data:', staffData);
    console.log('Staff List (transformed):', staffList);
  }, [workingHoursData, workingHoursError, staffData, staffList]);

  // Get working hours for the current day from the response
  const dayWorkingHours = useMemo(() => {
    if (!workingHoursData?.workingHours) {
      console.log('No working hours data available');
      return null;
    }
    
    const workingHoursArray = workingHoursData.workingHours;
    
    if (!Array.isArray(workingHoursArray)) {
      console.log('Working hours is not an array:', workingHoursArray);
      return null;
    }

    // Find the day - convert dayName to match API format (Monday, Tuesday, etc.)
    const targetDay = dayName?.charAt(0).toUpperCase() + dayName?.slice(1);
    
    const found = workingHoursArray.find(
      (dayData: any) => dayData.day === targetDay
    );
    
    console.log('Target day:', targetDay);
    console.log('Found working hours for', targetDay, ':', found);
    
    return found || null;
  }, [workingHoursData, dayName]);
  
  // Get appointments for the selected date
  const filteredAppointments = useMemo(() => {
    if (!selectedDate || !appointmentsData || !Array.isArray(appointmentsData)) return [];
    
    return appointmentsData.filter((appointment: any) => {
      if (!appointment?.date) return false;
      
      try {
        const appointmentDate = new Date(appointment.date);
        return isSameDay(appointmentDate, selectedDate);
      } catch (error) {
        console.error('Error parsing appointment date:', error);
        return false;
      }
    });
  }, [appointmentsData, selectedDate]);

  // Get blocked times for the selected date
  const blockedTimes = useSelector((state: any) => 
    (state.blockTime?.blockedTimes || []).filter((block: any) => {
      if (!block?.date) return false;
      const blockDate = new Date(block.date);
      return isSameDay(blockDate, selectedDate);
    })
  );
  
  // Callback functions
  const handleAppointmentClick = useCallback((appointment: any) => {
    // This will be handled by DayScheduleView directly
  }, []);

  const handleBackClick = () => {
    router.push('/calendar');
  };

  // Handle form submission
  const handleAppointmentSubmit = useCallback(async (appointmentData: any) => {
    if (isLoading) return;

    console.group('=== Handling Appointment Submission ===');
    console.log('Submitting appointment data:', JSON.stringify(appointmentData, null, 2));

    try {
      // Format date for backend (YYYY-MM-DD)
      let formattedDate = appointmentData.date;
      if (appointmentData.date instanceof Date) {
        formattedDate = format(appointmentData.date, 'yyyy-MM-dd');
      } else if (selectedDate instanceof Date) {
        formattedDate = format(selectedDate, 'yyyy-MM-dd');
      }

      // Create a clean appointment object with only the fields we want to send
      const appointmentToSubmit = {
        client: appointmentData.client,
        service: appointmentData.service,
        staff: appointmentData.staff,
        date: formattedDate,
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        duration: Number(appointmentData.duration) || 60,
        notes: appointmentData.notes || '',
        status: appointmentData.status || 'scheduled',
        amount: Number(appointmentData.amount) || 0,
        discount: Number(appointmentData.discount) || 0,
        totalAmount: (Number(appointmentData.amount) || 0) - (Number(appointmentData.discount) || 0)
      };

      // Remove any undefined or null values
      Object.keys(appointmentToSubmit).forEach(key => {
        if (appointmentToSubmit[key] === undefined || appointmentToSubmit[key] === null) {
          delete appointmentToSubmit[key];
        }
      });

      console.log('Submitting appointment to API:', JSON.stringify(appointmentToSubmit, null, 2));

      if (selectedAppointment?.id) {
        console.log('Updating existing appointment with ID:', selectedAppointment.id);
        await updateAppointment({
          id: selectedAppointment.id,
          ...appointmentToSubmit
        }).unwrap();
        toast.success('Appointment updated successfully');
      } else {
        console.log('Creating new appointment');
        await createAppointment(appointmentToSubmit).unwrap();
        toast.success('Appointment created successfully');
      }

      setShowNewAppointmentForm(false);
      setSelectedAppointment(null);

      dispatch(glowvitaApi.util.invalidateTags(['Appointment']));
  
    } catch (error) {
      console.error('Error in handleAppointmentSubmit:', {
        error,
        message: error?.message,
        data: error?.data,
        status: error?.status
      });

      let errorMessage = `Failed to create appointment`;
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      console.groupEnd();
    }
  }, [createAppointment, updateAppointment, selectedDate, selectedAppointment, isLoading, dispatch]);

  const handleEditAppointment = useCallback((appointment: any) => {
    setSelectedAppointment(appointment);
    setShowNewAppointmentForm(true);
  }, []);

  const handleOpenBlockTimeModal = () => {
    setShowBlockTimeModal(true);
  };

  const handleCloseBlockTimeModal = () => {
    setShowBlockTimeModal(false);
  };

  // Handle appointment update
  const handleUpdateAppointment = useCallback(async (id: string, updates: any) => {
    try {
      await updateAppointment({ id, ...updates }).unwrap();
      toast.success('Appointment updated successfully');
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  }, [updateAppointment]);

  // Handle appointment deletion
  const handleDeleteAppointment = useCallback(async (id: string) => {
    try {
      await deleteAppointment(id).unwrap();
      toast.success('Appointment deleted successfully');
      setShowNewAppointmentForm(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
    }
  }, [deleteAppointment]);

  if (!isValid || !selectedDate) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Invalid date selected</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={handleBackClick}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Calendar
        </Button>
        <Button onClick={() => setShowNewAppointmentForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      <DayScheduleView
        selectedDate={selectedDate}
        appointments={filteredAppointments}
        staffList={staffList}
        isLoading={isLoadingStaff || isLoadingWorkingHours}
        error={staffError || workingHoursError}
      />

      <Dialog 
        open={!!selectedAppointment} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedAppointment(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[800px] max-w-[95vw] max-h-[90vh] h-auto overflow-y-auto p-6">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full"
              onClick={() => setSelectedAppointment(null)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            {selectedAppointment && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Appointment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p>{selectedAppointment.clientName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Service</p>
                    <p>{selectedAppointment.serviceName || selectedAppointment.service || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p>{format(new Date(selectedAppointment.date), 'PPP')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p>{selectedAppointment.startTime} - {selectedAppointment.endTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="capitalize">{selectedAppointment.status || 'N/A'}</p>
                  </div>
                  {selectedAppointment.notes && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="whitespace-pre-line">{selectedAppointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showNewAppointmentForm}
        onOpenChange={(open) => {
          setShowNewAppointmentForm(open);
          if (!open) {
            setSelectedAppointment(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAppointment ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
          </DialogHeader>
          <NewAppointmentForm
            onSubmit={handleAppointmentSubmit}
            onDelete={selectedAppointment ? handleDeleteAppointment : undefined}
            onCancel={() => {
              setShowNewAppointmentForm(false);
              setSelectedAppointment(null);
            }}
            onSuccess={() => {
              setShowNewAppointmentForm(false);
              setSelectedAppointment(null);
            }}
            defaultDate={selectedDate}
            defaultValues={selectedAppointment}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}