/**
 * Custom hooks for fetching dynamic booking data
 * These hooks provide salon-specific data for the booking flow
 */

import { useMemo } from 'react';
import { 
  useGetPublicVendorServicesQuery, 
  useGetPublicVendorStaffQuery, 
  useGetPublicVendorStaffByServiceQuery, // Add this import
  useGetPublicVendorWorkingHoursQuery,
  useGetPublicVendorsQuery 
} from '@repo/store/api';

export interface TimeSlot {
  startMinutes: number;
  endMinutes: number;
  startTime: string;
  endTime: string;
}

export interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
  category: string;
  image?: string;
  description?: string;
  staff?: string[]; // Add staff array to track which staff provide this service
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  specialties?: string[];
  rating?: number;
  // Add availability information
  mondayAvailable?: boolean;
  tuesdayAvailable?: boolean;
  wednesdayAvailable?: boolean;
  thursdayAvailable?: boolean;
  fridayAvailable?: boolean;
  saturdayAvailable?: boolean;
  sundayAvailable?: boolean;
  blockedTimes?: Array<{
    date: string;
    startMinutes: number;
    endMinutes: number;
    startTime: string;
    endTime: string;
    reason?: string;
  }>;
  // Add time slots for each day
  mondaySlots?: TimeSlot[];
  tuesdaySlots?: TimeSlot[];
  wednesdaySlots?: TimeSlot[];
  thursdaySlots?: TimeSlot[];
  fridaySlots?: TimeSlot[];
  saturdaySlots?: TimeSlot[];
  sundaySlots?: TimeSlot[];
}

export interface WorkingHours {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface SalonInfo {
  id: string;
  name: string;
  address: string;
  rating?: number;
  reviews?: number;
  image?: string;
  phone?: string;
}

/**
 * Hook to fetch salon services with formatted data for the booking flow
 */
export const useSalonServices = (salonId: string) => {
  const { data: rawServices, isLoading, error } = useGetPublicVendorServicesQuery(salonId);
  
  const services = useMemo(() => {
    if (!rawServices) return [];
    
    console.log('useSalonServices - Raw services data:', rawServices);
    
    // Handle different possible response structures
    let servicesArray = [];
    
    if (rawServices.data && Array.isArray(rawServices.data)) {
      servicesArray = rawServices.data;
    } else if (rawServices.services && Array.isArray(rawServices.services)) {
      servicesArray = rawServices.services;
    } else if (Array.isArray(rawServices)) {
      servicesArray = rawServices;
    } else {
      console.warn('Unexpected services data structure:', rawServices);
      return [];
    }
    
    console.log('useSalonServices - Services array:', servicesArray);
    
    return servicesArray.map((service: any): Service => {
      console.log(`Service ${service.name || service.serviceName} has staff array:`, service.staff);
      return {
        id: service._id || service.id,
        name: service.serviceName || service.name,
        duration: `${service.duration || 60} min`,
        price: (service.price || 0).toString(),
        category: service.category || 'General',
        image: service.image || `https://picsum.photos/seed/${service.serviceName}/200/200`,
        description: service.description,
        staff: service.staff || [] // Include staff array if available
      };
    });
  }, [rawServices]);

  const servicesByCategory = useMemo(() => {
    const grouped: { [key: string]: Service[] } = {};
    services.forEach((service: Service) => {
      if (!grouped[service.category]) {
        grouped[service.category] = [];
      }
      grouped[service.category].push(service);
    });
    return grouped;
  }, [services]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(services.map((s: Service) => s.category)));
    return [{ name: "All" }, ...uniqueCategories.map(cat => ({ name: cat as string }))];
  }, [services]);

  return {
    services,
    servicesByCategory,
    categories,
    isLoading,
    error
  };
};

/**
 * Hook to fetch salon staff with formatted data for the booking flow
 * Filtered by service if provided
 */
export const useSalonStaff = (salonId: string, serviceId?: string) => {
  console.log('useSalonStaff - Called with:', { salonId, serviceId });
  
  // Use the service-specific endpoint only if we have a valid serviceId
  const shouldUseServiceSpecificEndpoint = !!(serviceId && serviceId.trim() !== '');
  
  // Use the service-specific endpoint if serviceId is provided and valid
  const { data: rawStaff, isLoading, error } = shouldUseServiceSpecificEndpoint
    ? useGetPublicVendorStaffByServiceQuery({ vendorId: salonId, serviceId: serviceId! })
    : useGetPublicVendorStaffQuery(salonId);
  
  console.log('useSalonStaff - API response:', { rawStaff, isLoading, error, shouldUseServiceSpecificEndpoint });
  
  const staff = useMemo(() => {
    if (!rawStaff) return [];
    
    console.log('useSalonStaff - Raw staff data:', rawStaff);
    
    // Handle different possible response structures
    let staffArray = [];
    
    if (rawStaff.data && Array.isArray(rawStaff.data)) {
      staffArray = rawStaff.data;
    } else if (rawStaff.staff && Array.isArray(rawStaff.staff)) {
      staffArray = rawStaff.staff;
    } else if (Array.isArray(rawStaff)) {
      staffArray = rawStaff;
    } else {
      console.warn('Unexpected staff data structure:', rawStaff);
      return [];
    }
    
    console.log('useSalonStaff - Staff array:', staffArray);
    
    return staffArray.map((member: any): StaffMember => ({
      id: member._id || member.id,
      name: member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim(),
      role: member.role || member.position || 'Staff Member',
      image: member.image || member.profileImage || `https://picsum.photos/seed/${member.name}/400/400`,
      specialties: member.specialties || [],
      rating: member.rating || 4.5,
      mondayAvailable: member.mondayAvailable,
      tuesdayAvailable: member.tuesdayAvailable,
      wednesdayAvailable: member.wednesdayAvailable,
      thursdayAvailable: member.thursdayAvailable,
      fridayAvailable: member.fridayAvailable,
      saturdayAvailable: member.saturdayAvailable,
      sundayAvailable: member.sundayAvailable,
      blockedTimes: member.blockedTimes || [],
      mondaySlots: member.mondaySlots || [],
      tuesdaySlots: member.tuesdaySlots || [],
      wednesdaySlots: member.wednesdaySlots || [],
      thursdaySlots: member.thursdaySlots || [],
      fridaySlots: member.fridaySlots || [],
      saturdaySlots: member.saturdaySlots || [],
      sundaySlots: member.sundaySlots || []
    }));
  }, [rawStaff]);

  return {
    staff,
    isLoading,
    error
  };
};

/**
 * Hook to fetch salon working hours for time slot availability
 */
export const useSalonWorkingHours = (salonId: string) => {
  const { data: rawWorkingHours, isLoading, error } = useGetPublicVendorWorkingHoursQuery(salonId);
  
  const workingHours = useMemo(() => {
    if (!rawWorkingHours) return [];
    
    console.log('useSalonWorkingHours - Raw data:', rawWorkingHours);
    
    // Handle the structure returned by the public working hours API
    let workingHoursData = null;
    
    // Prioritize workingHours over workingHoursArray since workingHours has the correct data
    if (rawWorkingHours.data && Array.isArray(rawWorkingHours.data.workingHours) && rawWorkingHours.data.workingHours.length > 0) {
      workingHoursData = rawWorkingHours.data.workingHours;
    } else if (rawWorkingHours.data && Array.isArray(rawWorkingHours.data.workingHoursArray) && rawWorkingHours.data.workingHoursArray.length > 0) {
      workingHoursData = rawWorkingHours.data.workingHoursArray;
    } else if (rawWorkingHours.workingHours && Array.isArray(rawWorkingHours.workingHours) && rawWorkingHours.workingHours.length > 0) {
      workingHoursData = rawWorkingHours.workingHours;
    } else if (rawWorkingHours.workingHoursArray && Array.isArray(rawWorkingHours.workingHoursArray) && rawWorkingHours.workingHoursArray.length > 0) {
      workingHoursData = rawWorkingHours.workingHoursArray;
    } else if (Array.isArray(rawWorkingHours)) {
      workingHoursData = rawWorkingHours;
    } else {
      console.warn('Unexpected working hours data structure:', rawWorkingHours);
      return [];
    }
    
    console.log('useSalonWorkingHours - Working hours data:', workingHoursData);
    
    if (!Array.isArray(workingHoursData)) {
      console.warn('Working hours data is not an array:', workingHoursData);
      return [];
    }
    
    // Transform the working hours data from the API format to the format expected by Step3_TimeSlot
    const transformedHours = workingHoursData.map((dayHours: any): WorkingHours => {
      // Handle the new format from the working hours API
      if (!dayHours.isOpen || !dayHours.open || !dayHours.close) {
        return {
          dayOfWeek: dayHours.day,
          startTime: '',
          endTime: '',
          isAvailable: false
        };
      }
      
      // The API now returns times in 24-hour format directly
      const startTime = dayHours.open;
      const endTime = dayHours.close;
      
      return {
        dayOfWeek: dayHours.day,
        startTime,
        endTime,
        isAvailable: true
      };
    });
    
    console.log('useSalonWorkingHours - Transformed hours:', transformedHours);
    return transformedHours;
  }, [rawWorkingHours]);

  return {
    workingHours,
    isLoading,
    error
  };
};

/**
 * Hook to fetch salon information for booking summary
 */
export const useSalonInfo = (salonId: string) => {
  const { data: rawSalonData, isLoading, error } = useGetPublicVendorsQuery({});
  
  const salonInfo = useMemo(() => {
    if (!rawSalonData) return null;
    
    // Handle different possible response structures
    let vendorsArray = [];
    
    if (rawSalonData.data && Array.isArray(rawSalonData.data)) {
      vendorsArray = rawSalonData.data;
    } else if (rawSalonData.vendors && Array.isArray(rawSalonData.vendors)) {
      vendorsArray = rawSalonData.vendors;
    } else if (Array.isArray(rawSalonData)) {
      vendorsArray = rawSalonData;
    } else {
      console.warn('Unexpected salon data structure:', rawSalonData);
      return null;
    }
    
    const salon = vendorsArray.find((vendor: any) => vendor._id === salonId || vendor.id === salonId);
    if (!salon) return null;
    
    return {
      id: salon._id || salon.id,
      name: salon.businessName || salon.name,
      address: salon.address || '',
      rating: salon.rating || '4.5',
      reviews: salon.reviewCount || salon.reviews || 0,
      image: salon.logo || salon.image || `https://picsum.photos/seed/${salon.businessName}/400/400`,
      phone: salon.phone || salon.contactNumber
    } as SalonInfo;
  }, [rawSalonData, salonId]);

  return {
    salonInfo,
    isLoading,
    error
  };
};

/**
 * Combined hook for all booking data
 */
export const useBookingData = (salonId: string, serviceId?: string) => {
  console.log('useBookingData - Called with:', { salonId, serviceId });
  
  const servicesQuery = useSalonServices(salonId);
  const staffQuery = useSalonStaff(salonId, serviceId); // Pass serviceId to filter staff
  const workingHoursQuery = useSalonWorkingHours(salonId);
  const salonInfoQuery = useSalonInfo(salonId);

  const isLoading = servicesQuery.isLoading || 
                   staffQuery.isLoading || 
                   workingHoursQuery.isLoading || 
                   salonInfoQuery.isLoading;

  const error = servicesQuery.error || 
               staffQuery.error || 
               workingHoursQuery.error || 
               salonInfoQuery.error;

  console.log('useBookingData - Queries:', { servicesQuery, staffQuery, workingHoursQuery, salonInfoQuery });
  
  return {
    services: servicesQuery.services,
    servicesByCategory: servicesQuery.servicesByCategory,
    categories: servicesQuery.categories,
    staff: staffQuery.staff,
    workingHours: workingHoursQuery.workingHours,
    salonInfo: salonInfoQuery.salonInfo,
    isLoading,
    error
  };
};