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
      // For multi-service appointments, use the first service as the main service
      let service = appointment.serviceName || appointment.service || 'Unknown Service';
      let staff = appointment.staffName || appointment.staff || 'Any Professional';
      let duration = appointment.duration || 60;
      
      // If there are service items, use the first one for main service info
      if (appointment.serviceItems && appointment.serviceItems.length > 0) {
        const firstService = appointment.serviceItems[0];
        service = firstService.serviceName || service;
        staff = firstService.staffName || staff;
        duration = firstService.duration || duration;
      }
      
      return {
        id: appointment._id || appointment.id,
        service: service,
        date: appointment.date,
        staff: staff,
        status: appointment.status || 'Confirmed',
        price: appointment.amount || appointment.totalAmount || 0,
        duration: duration,
        salon: {
          name: appointment.salonName || appointment.salon?.name || 'Unknown Salon',
          address: appointment.salonAddress || appointment.salon?.address || 'Unknown Address'
        },
        serviceItems: appointment.serviceItems || []
      };
    });
  }, [appointments]);
  
  return {
    appointments: transformedAppointments,
    isLoading,
    error
  };
};