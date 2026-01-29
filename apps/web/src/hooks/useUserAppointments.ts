import { useGetPublicAppointmentsQuery } from '@repo/store/api';
import { useAuth } from './useAuth';
import { useMemo } from 'react';

interface Appointment {
  id: string;
  service: string;
  date: string;
  staff: string;
  status: 'Completed' | 'Confirmed' | 'Cancelled';
  price: number;
  duration: number;
  salon: {
    name: string;
    address: string;
  };
  vendorId?: string;
  startTime?: string;
  endTime?: string;
  serviceItems?: Array<{
    service: string;
    serviceName: string;
    staff: string | null;
    staffName: string;
    startTime: string;
    endTime: string;
    duration: number;
    amount: number;
  }>;
  amount?: number;
  totalAmount?: number;
  platformFee?: number;
  serviceTax?: number;
  discountAmount?: number;
  finalAmount?: number;
  cancellationReason?: string;
}

export const useUserAppointments = () => {
  const { user, isAuthenticated } = useAuth();

  // Memoize the user ID to prevent unnecessary re-renders
  const userId = useMemo(() => {
    return isAuthenticated && user ? user._id : null;
  }, [isAuthenticated, user]);

  // If user is not authenticated, return empty appointments
  if (!isAuthenticated || !user || !userId) {
    return {
      appointments: [],
      isLoading: false,
      error: null
    };
  }

  // Fetch appointments for the current user
  const { data: appointments = [], isLoading, error } = useGetPublicAppointmentsQuery({
    userId
  });

  // Memoize the transformed appointments to prevent unnecessary re-renders
  const transformedAppointments: Appointment[] = useMemo(() => {
    return appointments.map((appointment: any) => {
      // Debug log to see what data we're receiving
      console.log('Raw appointment data:', appointment);

      // For multi-service appointments, use the first service as the main service
      let service = appointment.serviceName || appointment.service || 'Unknown Service';
      let staff = appointment.staffName || appointment.staff || 'Any Professional';
      let duration = appointment.duration || 60;

      // If there are service items, use the first one for main service info
      // But for duration, calculate total duration of all services
      if (appointment.serviceItems && appointment.serviceItems.length > 0) {
        const firstService = appointment.serviceItems[0];
        service = firstService.serviceName || service;
        staff = firstService.staffName || staff;

        // Calculate total duration from all service items
        duration = appointment.serviceItems.reduce((total: number, item: { duration?: number }): number => total + (item.duration || 0), 0);
      }

      // Status transformation - match backend logic
      let status = appointment.status || 'Confirmed';
      if (typeof status === 'string') {
        const lowerStatus = status.toLowerCase();

        if (lowerStatus === 'completed' || lowerStatus === 'partially-completed') {
          status = 'Completed';
        } else if (lowerStatus === 'cancelled' || lowerStatus === 'no-show') {
          status = 'Cancelled';
        } else if (lowerStatus === 'scheduled') {
          status = 'Scheduled';
        } else if (lowerStatus === 'pending') {
          status = 'Pending';
        } else {
          status = 'Confirmed';
        }
      }

      // Check if appointment is in the past and should be marked as Completed
      // Only strictly apply this to confirmed/scheduled/pending appointments
      if (status !== 'Cancelled' && status !== 'Completed') {
        try {
          const now = new Date();
          const apptDate = new Date(appointment.date);

          if (appointment.endTime) {
            const [hours, minutes] = appointment.endTime.split(':').map(Number);
            // reset to midnight first to ensure clean state
            apptDate.setHours(hours || 0, minutes || 0, 0, 0);
          } else {
            // If no end time, assume end of day for safety, or don't auto-complete
            apptDate.setHours(23, 59, 59, 999);
          }

          if (apptDate < now) {
            status = 'Completed';
          }
        } catch (e) {
          console.error("Error calculating past date for appointment", appointment.id, e);
        }
      }

      return {
        id: appointment._id || appointment.id,
        service: service,
        date: appointment.date,
        staff: staff,
        status: status,
        price: appointment.finalAmount || appointment.price || 0,
        duration: duration,
        amount: appointment.amount || 0,
        totalAmount: appointment.totalAmount || 0,
        platformFee: appointment.platformFee || 0,
        serviceTax: appointment.serviceTax || 0,
        discountAmount: appointment.discountAmount || 0,
        finalAmount: appointment.finalAmount || 0,
        salon: {
          name: appointment.salon?.name || 'Unknown Salon',
          address: appointment.salon?.address || 'Unknown Address'
        },
        vendorId: appointment.vendorId,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        serviceItems: appointment.serviceItems || [],
        cancellationReason: appointment.cancellationReason
      };
    });
  }, [appointments]);

  return {
    appointments: transformedAppointments,
    isLoading,
    error
  };
};