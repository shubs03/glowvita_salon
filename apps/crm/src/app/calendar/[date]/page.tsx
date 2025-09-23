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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@repo/ui/select';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { toast } from 'sonner';
import React from 'react';
import { format, parseISO, isSameDay, addMinutes, parse, isWithinInterval, addDays, startOfDay, endOfDay } from 'date-fns';

// Types
type Appointment = {
  id?: string;
  _id?: string;
  client?: string;
  clientName?: string;
  service?: string;
  serviceName?: string;
  staff?: string;
  staffName?: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration?: number;
  notes?: string;
  status?: string;
  paymentStatus?: string;
  amount?: number;
  discount?: number;
  tax?: number;
  totalAmount?: number;
};

// Components
import DayScheduleView from '../components/DayScheduleView';
import NewAppointmentForm from '../components/NewAppointmentForm';
import AppointmentDetailView from '../../../components/AppointmentDetailView';

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

// Helper function to format dates without timezone issues
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Move date validation outside the component
function validateAndParseDate(dateString: any): { isValid: boolean; date?: Date; dayName?: string } {
  if (!dateString || typeof dateString !== 'string') return { isValid: false };
  
  const [year, month, day] = dateString.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return { isValid: false };
  
  // Create date in local timezone to avoid timezone shift
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
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('All Staff');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{date: Date; time: string} | null>(null);

  // RTK Query hooks
  const [createAppointment] = glowvitaApi.useCreateAppointmentMutation();
  const [updateAppointment] = glowvitaApi.useUpdateAppointmentMutation();
  const [deleteAppointment] = glowvitaApi.useDeleteAppointmentMutation();
  const [updateAppointmentStatus] = glowvitaApi.useUpdateAppointmentStatusMutation();
  
  // Extract and validate date
  const { date: dateString } = params || {};
  const { isValid, date: selectedDate, dayName } = validateAndParseDate(dateString);
  
  // Get appointments from Redux store
  const allAppointments = useSelector(selectAllAppointments);
  
  // Fetch appointments for the selected date range using RTK Query
  const { data: appointmentsData, isLoading: isLoadingAppointments, refetch: refetchAppointments } = glowvitaApi.useGetAppointmentsQuery(
    {
      startDate: selectedDate ? formatDateForAPI(selectedDate) : '',
      endDate: selectedDate ? formatDateForAPI(selectedDate) : '',
    },
    { skip: !selectedDate }
  );

  // Transform appointments data to match the expected format
  const appointments = useMemo(() => {
    if (!appointmentsData || !Array.isArray(appointmentsData)) return [];
    return appointmentsData.map((appt: any) => ({
      id: appt._id || appt.id,
      client: appt.client || appt.clientName,
      clientName: appt.clientName || appt.client,
      service: appt.service,
      serviceName: appt.serviceName,
      staff: appt.staff,
      staffName: appt.staffName,
      date: new Date(appt.date),
      startTime: appt.startTime,
      endTime: appt.endTime,
      duration: appt.duration,
      notes: appt.notes || '',
      status: appt.status || 'scheduled',
      paymentStatus: appt.paymentStatus || 'pending',
      amount: appt.amount || 0,
      discount: appt.discount || 0,
      tax: appt.tax || 0,
      totalAmount: appt.totalAmount || appt.amount || 0,
    }));
  }, [appointmentsData]);
  
  // Filter appointments for the selected staff and date
  const filteredAppointments = useMemo(() => {
    if (!appointments || !Array.isArray(appointments)) return [];
    if (!selectedDate) return [];
    
    return appointments.filter(appointment => {
      // Filter by date
      if (!isSameDay(new Date(appointment.date), selectedDate)) return false;
      
      // Filter by staff if a specific staff is selected
      if (selectedStaff !== 'All Staff' && appointment.staffName !== selectedStaff) {
        return false;
      }
      
      return true;
    });
  }, [appointments, selectedDate, selectedStaff]);

  // Handle appointment form submission
  const handleAppointmentSubmit = async (appointmentData: any) => {
    const toastId = toast.loading('Saving appointment...');
    try {
      setIsLoading(true);
      
      // Always use the selected date from the URL for the appointment
      const appointmentDate = selectedDate || new Date();
      
      // Format the appointment data with timezone-safe date
      const formattedData = {
        ...appointmentData,
        date: formatDateForAPI(appointmentDate),
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        status: appointmentData.status || 'scheduled',
      };

      if (selectedAppointment?._id) {
        // Update existing appointment
        await updateAppointment({
          id: selectedAppointment._id,
          ...formattedData,
        });
        toast.success('Appointment updated successfully');
      } else {
        // Create new appointment
        await createAppointment(formattedData);
        toast.success('Appointment created successfully');
      }
      
      // Refresh appointments
      await refetchAppointments();
      
      // Close the form
      setIsNewAppointmentOpen(false);
      setSelectedAppointment(null);
      
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      toast.error('Failed to save appointment', {
        description: error?.data?.message || error.message || 'Please try again.'
      });
    } finally {
      setIsLoading(false);
      toast.dismiss(toastId);
    }
  };

  // Handle appointment status update
  const handleUpdateStatus = async (status: string, reason: string = '') => {
    if (!selectedAppointment?._id) return;
    
    try {
      setIsLoading(true);
      await updateAppointmentStatus({
        id: selectedAppointment._id,
        status,
        cancellationReason: status === 'cancelled' ? reason : undefined
      });
      
      toast.success('Appointment status updated successfully');
      await refetchAppointments();
      setShowCancelDialog(false);
      setCancelReason('');
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status', {
        description: error?.data?.message || error.message || 'Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle appointment deletion
  const handleDeleteAppointment = async (id: string) => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        setIsLoading(true);
        await deleteAppointment(id).unwrap();
        toast.success('Appointment deleted successfully');
        await refetchAppointments();
        setIsNewAppointmentOpen(false);
        setSelectedAppointment(null);
      } catch (error: any) {
        console.error('Error deleting appointment:', error);
        toast.error('Failed to delete appointment', {
          description: error?.data?.message || error.message || 'Please try again.'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle appointment click
  const handleAppointmentClick = useCallback((appointment: any) => {
    setSelectedAppointment(appointment);
    // setIsNewAppointmentOpen(true);
  }, []);

  // Handle new appointment button click
  const handleNewAppointment = useCallback(() => {
    setSelectedAppointment(null);
    setIsNewAppointmentOpen(true);
  }, []);

  // Handle edit appointment button click
  const handleEditAppointment = useCallback((appointment: any) => {
    setSelectedAppointment(appointment);
    // setIsNewAppointmentOpen(true);
  }, []);

  // Handle back button click
  const handleBackClick = useCallback(() => {
    router.push('/calendar');
  }, [router]);

  // Handle time slot click
  const handleTimeSlotClick = (time: string) => {
    if (!selectedDate) return;
    
    // Parse the time string to 24-hour format
    const [hours, minutes] = parseTimeString(time);
    const slotDate = new Date(selectedDate);
    slotDate.setHours(hours, minutes, 0, 0);
    
    setSelectedTimeSlot({
      date: slotDate,
      time: time
    });
    setIsNewAppointmentOpen(true);
  };

  // Fetch working hours
  const { data: workingHoursData, isLoading: isLoadingWorkingHours, error: workingHoursError } = glowvitaApi.useGetWorkingHoursQuery(
    selectedDate ? formatDateForAPI(selectedDate) : '',
    { skip: !selectedDate }
  );

  // Fetch staff list
  const { data: staffData, isLoading: isLoadingStaff, error: staffError } = glowvitaApi.useGetStaffQuery(undefined);

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
    const targetDay = dayName ? dayName.charAt(0).toUpperCase() + dayName.slice(1) : '';
    
    const found = workingHoursArray.find(
      (dayData: any) => dayData.day === targetDay
    );
    
    console.log('Target day:', targetDay);
    console.log('Found working hours for', targetDay, ':', found);
    
    return found || null;
  }, [workingHoursData, dayName]);
  
  // Get blocked times for the selected date
  const blockedTimes = useSelector((state: any) => 
    (state.blockTime?.blockedTimes || []).filter((block: any) => {
      if (!block?.date || !selectedDate) return false;
      const blockDate = new Date(block.date);
      return isSameDay(blockDate, selectedDate);
    })
  );
  
  // Handle status change from AppointmentDetailView
  const handleStatusChange = useCallback(async (newStatus: string, cancellationReason?: string) => {
    if (!selectedAppointment) return;
    
    try {
      setIsLoading(true);
      
      // Call the updateAppointmentStatus mutation
      await updateAppointmentStatus({
        id: selectedAppointment._id || selectedAppointment.id,
        status: newStatus,
        cancellationReason: cancellationReason || (newStatus === 'cancelled' ? 'No reason provided' : undefined)
      }).unwrap();
      
      // Show success message
      toast.success(`Appointment ${newStatus} successfully`);
      
      // Close the detail view
      setSelectedAppointment(null);
      
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      toast.error(`Failed to ${newStatus} appointment`, {
        description: error?.data?.message || error.message || 'Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedAppointment, updateAppointmentStatus]);

  // Handle collect payment
  const handleCollectPayment = async (paymentData: { amount: number; paymentMethod: string; notes?: string }) => {
    try {
      // Here you would typically make an API call to process the payment
      // For now, we'll just show a success message
      toast.success('Payment collected successfully', {
        description: `Payment of $${paymentData.amount} processed`
      });
      
      // Optionally refresh the appointments list
      // await dispatch(refreshAppointments());
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment', {
        description: error.message
      });
    }
  };

  // Handle updating an appointment
  const handleUpdateAppointment = useCallback(async (updatedAppointment: any) => {
    const toastId = toast.loading('Updating appointment...');
    try {
      const appointmentId = updatedAppointment?._id || updatedAppointment?.id;
      if (!appointmentId) {
        throw new Error('Cannot update appointment: Missing appointment ID');
      }

      console.log('Updating appointment with data:', updatedAppointment);
      
      // Format the data for the API
      const updateData = {
        id: appointmentId,
        _id: appointmentId, // Include both id and _id for backward compatibility
        ...updatedAppointment,
        // Ensure date is properly formatted for the API
        date: formatDateForAPI(new Date(updatedAppointment.date)),
        // Ensure all required fields are included
        clientName: updatedAppointment.clientName || updatedAppointment.client,
        serviceName: updatedAppointment.serviceName || updatedAppointment.service,
        staffName: updatedAppointment.staffName || updatedAppointment.staff,
      };

      console.log('Sending update request with data:', updateData);
      
      const result = await updateAppointment(updateData).unwrap();
      
      console.log('Update successful, refreshing appointments...');
      await refetchAppointments();
      
      toast.success('Appointment updated successfully');
      return result;
      
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment', {
        description: error?.data?.message || error.message || 'Please try again.'
      });
      throw error;
    } finally {
      toast.dismiss(toastId);
    }
  }, [updateAppointment, refetchAppointments]);

  // Handle appointment reschedule
  const handleRescheduleAppointment = async (appointmentData: any) => {
    const toastId = toast.loading('Rescheduling appointment...');
    try {
      const appointmentId = appointmentData?._id || appointmentData?.id;
      if (!appointmentId) {
        throw new Error('Cannot reschedule appointment: Missing appointment ID');
      }

      console.log('Rescheduling appointment with data:', appointmentData);
      
      // Format the data for the API
      const rescheduleData = {
        id: appointmentId,
        ...appointmentData,
        // Ensure date is properly formatted for the API
        date: formatDateForAPI(new Date(appointmentData.date)),
        // Ensure all required fields are included
        clientName: appointmentData.clientName || appointmentData.client,
        serviceName: appointmentData.serviceName || appointmentData.service,
        staffName: appointmentData.staffName || appointmentData.staff,
      };

      console.log('Sending reschedule request with data:', rescheduleData);
      
      const result = await updateAppointment(rescheduleData).unwrap();
      
      console.log('Reschedule successful, refreshing appointments...');
      await refetchAppointments();
      
      toast.success('Appointment rescheduled successfully');
      return result;
      
    } catch (error: any) {
      console.error('Error rescheduling appointment:', error);
      toast.error('Failed to reschedule appointment', {
        description: error?.data?.message || error.message || 'Please try again.'
      });
      throw error;
    } finally {
      toast.dismiss(toastId);
    }
  };

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
        
        <div className="flex items-center space-x-4">
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Staff">All Staff</SelectItem>
              {staffList.map(staff => (
                <SelectItem key={staff.id} value={staff.name}>
                  {staff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleNewAppointment}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </div>

      <DayScheduleView
        selectedDate={selectedDate}
        appointments={filteredAppointments}
        staffList={staffList}
        isLoading={isLoading || isLoadingStaff || isLoadingWorkingHours}
        error={staffError || workingHoursError}
        onAppointmentClick={handleAppointmentClick}
        onTimeSlotClick={handleTimeSlotClick}
        timeSlots={
          dayWorkingHours?.startTime && dayWorkingHours?.endTime
            ? (() => {
                // Generate time slots based on working hours (every 30 minutes)
                const slots: string[] = [];
                const [startHour, startMinute] = parseTimeString(dayWorkingHours.startTime);
                const [endHour, endMinute] = parseTimeString(dayWorkingHours.endTime);
                const start = new Date(selectedDate);
                start.setHours(startHour, startMinute, 0, 0);
                const end = new Date(selectedDate);
                end.setHours(endHour, endMinute, 0, 0);
                let current = new Date(start);
                while (current <= end) {
                  slots.push(format(current, 'hh:mmaaa').toLowerCase());
                  current = addMinutes(current, 30);
                }
                return slots.map((time, idx) => ({
                  id: `${formatDateForAPI(selectedDate)}-${time}-${idx}`,
                  time,
                  formattedTime: time
                }));
              })()
            : [
                "09:00am", "09:30am", "10:00am", "10:30am", "11:00am", "11:30am",
                "12:00pm", "12:30pm", "01:00pm", "01:30pm", "02:00pm", "02:30pm",
                "03:00pm", "03:30pm", "04:00pm", "04:30pm", "05:00pm", "05:30pm",
                "06:00pm", "06:30pm", "07:00pm"
              ].map((time, idx) => ({
                id: `${formatDateForAPI(selectedDate)}-${time}-${idx}`,
                time,
                formattedTime: time
              }))
        }
      />

      {/* New/Edit Appointment Dialog */}
      <Dialog 
        open={isNewAppointmentOpen} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setIsNewAppointmentOpen(false);
            setSelectedTimeSlot(null);
            setSelectedAppointment(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
            </DialogTitle>
          </DialogHeader>
          <NewAppointmentForm
            defaultDate={selectedTimeSlot?.date || selectedDate}
            defaultValues={{
              ...(selectedTimeSlot && {
                startTime: selectedTimeSlot.time,
                // Set end time to 1 hour after start time by default
                endTime: format(addMinutes(selectedTimeSlot.date, 60), 'hh:mmaaa').toLowerCase(),
              }),
              ...(selectedAppointment && {
                ...selectedAppointment,
                date: selectedDate,
              })
            }}
            isEditing={!!selectedAppointment}
            onSubmit={handleAppointmentSubmit}
            onCancel={() => {
              setIsNewAppointmentOpen(false);
              setSelectedTimeSlot(null);
              setSelectedAppointment(null);
            }}
            onDelete={selectedAppointment?._id ? () => handleDeleteAppointment(selectedAppointment._id) : undefined}
            onSuccess={async () => {
              await refetchAppointments();
              setIsNewAppointmentOpen(false);
              setSelectedTimeSlot(null);
              setSelectedAppointment(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Appointment Detail View */}
      {selectedAppointment && (
        <AppointmentDetailView
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onStatusChange={handleStatusChange}
          onCollectPayment={handleCollectPayment}
          onUpdateAppointment={handleUpdateAppointment}
          onRescheduleAppointment={handleRescheduleAppointment}
        />
      )}

      {/* Cancel Appointment Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to cancel this appointment?</p>
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Reason for cancellation</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelDialog(false)}
                disabled={isLoading}
              >
                No, Keep It
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleUpdateStatus('cancelled', cancelReason)}
                disabled={isLoading || !cancelReason.trim()}
              >
                {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}