import { useGetPublicAppointmentsQuery } from '@repo/store/api';
import { useAuth } from './useAuth';
import { useMemo } from 'react';

interface Appointment {
  id: string;
  service: string;
  date: string;
  staff: string;
  status: 'Completed' | 'Confirmed' | 'Cancelled' | 'Pending' | 'Scheduled' | 'partially-completed';
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
  paymentMethod?: string;
  isPackage?: boolean;
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
      if (appointment.status?.toLowerCase() === 'scheduled' || appointment.isMultiService) {
        console.log('🔍 Appointment Transform Debug:');
        console.log('  Status:', appointment.status);
        console.log('  isMultiService:', appointment.isMultiService);
        console.log('  ServiceItems (raw):', appointment.serviceItems?.map((s: any) => ({ 
          name: s.serviceName, 
          amount: s.amount 
        })));
        console.log('  Appointment amount:', appointment.amount);
        console.log('  Appointment totalAmount:', appointment.totalAmount);
        console.log('  Appointment finalAmount:', appointment.finalAmount);
      }

      // For multi-service appointments, use the first service as the main service
      let service = appointment.weddingPackageDetails?.packageName || appointment.serviceName || appointment.service || 'Unknown Service';
      let staff = appointment.staffName || appointment.staff || 'Any Professional';
      let duration = appointment.duration || 60;

      // For wedding packages, use packageServices amount as fallback when serviceItems exists without amounts
      let serviceItems = appointment.serviceItems || [];
      const packageServices = appointment.weddingPackageDetails?.packageServices || [];

      const buildServiceItem = (srv: any, idx: number) => {
        const member = appointment.weddingPackageDetails?.teamMembers?.[idx];
        let staffName = 'Wedding Team';
        let staffId = null;

        if (member) {
          if (typeof member === 'object') {
            staffName = member.name || member.firstName || member.staffName || 'Wedding Team';
            staffId = member._id || member.id || null;
          } else if (typeof member === 'string') {
            if (/^[a-f\d]{24}$/i.test(member.trim())) {
              staffId = member;
              staffName = 'Assigned Staff';
            } else {
              staffName = member;
              staffId = null;
            }
          }
        }

        return {
          service: srv.serviceId || srv._id || '',
          serviceName: srv.serviceName || 'Service',
          staff: staffId,
          staffName: staffName,
          startTime: appointment.startTime || '',
          endTime: appointment.endTime || '',
          duration: Math.round((appointment.weddingPackageDetails?.totalDuration || appointment.duration || 60) / packageServices.length),
          amount: srv.amount || 0
        };
      };

      const shouldUsePackageItems = (appointment.isWeddingService || appointment.isMultiService) && packageServices.length > 0;
      if (shouldUsePackageItems) {
        if (serviceItems.length === 0) {
          serviceItems = packageServices.map(buildServiceItem);
        } else {
          serviceItems = serviceItems.map((item: any, idx: number) => {
            const packageItem = packageServices[idx] || packageServices.find((srv: any) => srv.serviceName === item.serviceName || srv.serviceId === item.service || srv._id === item.service);
            return {
              ...item,
              amount: Number(item.amount || packageItem?.amount || 0),
              serviceName: item.serviceName || packageItem?.serviceName || 'Service',
              service: item.service || packageItem?.serviceId || packageItem?._id || ''
            };
          });
        }
      } else if (serviceItems && serviceItems.length > 0) {
        // For any multi-service appointment, ensure amount is properly normalized as a number
        // If amounts are all zero/missing and we have a total appointment amount, distribute it
        const hasAmounts = serviceItems.some((item: any) => Number(item.amount || 0) > 0);
        
        if (!hasAmounts && (appointment.amount || appointment.totalAmount || appointment.finalAmount)) {
          // Distribute the total appointment amount across services equally
          const totalForDistribution = appointment.amount || appointment.totalAmount || appointment.finalAmount || 0;
          const amountPerService = Math.round((totalForDistribution / serviceItems.length) * 100) / 100;
          
          serviceItems = serviceItems.map((item: any) => ({
            ...item,
            amount: amountPerService
          }));
        } else {
          // Otherwise just ensure amounts are normalized
          serviceItems = serviceItems.map((item: any) => ({
            ...item,
            amount: Number(item.amount || 0)
          }));
        }
      }

      // If there are service items, use the first one for main service info
      // But for duration, calculate total duration of all services
      if (serviceItems && serviceItems.length > 0) {
        const firstService = serviceItems[0];
        if (!appointment.isWeddingService) {
          service = firstService.serviceName || service;
          staff = firstService.staffName || staff;
        } else {
          // For wedding services, let's aggregate the assigned staff names
          const assignedNames = serviceItems
            .map((item: any) => item.staffName)
            .filter((name: string) => name && name !== 'Wedding Team');
          if (assignedNames.length > 0) {
            staff = Array.from(new Set(assignedNames)).join(', ');
          } else {
            staff = 'Wedding Team';
          }
        }

        // Calculate total duration from all service items
        duration = serviceItems.reduce((total: number, item: { duration?: number }): number => total + (item.duration || 0), 0);
      }

      // Final debug log for transformed service items
      if (appointment.status?.toLowerCase() === 'scheduled' || appointment.isMultiService) {
        console.log('  ServiceItems (after transform):', serviceItems.map((s: any) => ({ 
          name: s.serviceName, 
          amount: s.amount 
        })));
      }

      // Status transformation - match backend logic
      let status = appointment.status || 'Confirmed';
      if (typeof status === 'string') {
        const lowerStatus = status.toLowerCase();

        if (lowerStatus === 'completed' || lowerStatus === 'completed without payment') {
          status = 'Completed';
        } else if (lowerStatus === 'partially-completed' || lowerStatus === 'partially completed' || appointment.paymentStatus === 'partial') {
          status = 'partially-completed';
        } else if (lowerStatus === 'cancelled' || lowerStatus === 'no-show') {
          status = 'Cancelled';
        } else if (lowerStatus === 'scheduled') {
          status = 'Scheduled';
        } else if (lowerStatus === 'pending') {
          status = 'Pending';
        } else if (lowerStatus === 'confirmed') {
          status = 'Confirmed';
        } else {
          status = 'Confirmed';
        }
      }

      // Check if appointment is in the past and should be marked as Completed
      // Only strictly apply this to confirmed/scheduled/pending appointments
      if (status !== 'Cancelled' && status !== 'Completed' && status !== 'partially-completed') {
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
        amountPaid: appointment.amountPaid || 0,
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
        serviceItems: serviceItems,
        cancellationReason: appointment.cancellationReason,
        paymentMethod: appointment.paymentMethod,
        isPackage: shouldUsePackageItems
      };
    });
  }, [appointments]);

  return {
    appointments: transformedAppointments,
    isLoading,
    error
  };
};