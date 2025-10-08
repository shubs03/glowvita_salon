/**
 * Custom hooks for fetching dynamic booking data
 * These hooks provide salon-specific data for the booking flow
 */

import { useMemo } from 'react';
import { 
  useGetPublicVendorServicesQuery, 
  useGetPublicVendorStaffQuery, 
  useGetPublicVendorWorkingHoursQuery,
  useGetPublicVendorsQuery 
} from '@repo/store/api';

export interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
  category: string;
  image?: string;
  description?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  specialties?: string[];
  rating?: number;
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
    
    return servicesArray.map((service: any): Service => ({
      id: service._id || service.id,
      name: service.serviceName || service.name,
      duration: `${service.duration || 60} min`,
      price: (service.price || 0).toString(),
      category: service.category || 'General',
      image: service.image || `https://picsum.photos/seed/${service.serviceName}/200/200`,
      description: service.description
    }));
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
 */
export const useSalonStaff = (salonId: string) => {
  const { data: rawStaff, isLoading, error } = useGetPublicVendorStaffQuery(salonId);
  
  const staff = useMemo(() => {
    if (!rawStaff) return [];
    
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
    
    return staffArray.map((member: any): StaffMember => ({
      id: member._id || member.id,
      name: member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim(),
      role: member.role || member.position || 'Staff Member',
      image: member.image || member.profileImage || `https://picsum.photos/seed/${member.name}/400/400`,
      specialties: member.specialties || [],
      rating: member.rating || 4.5
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
    
    // Handle the structure returned by the public working hours API
    let workingHoursData = null;
    
    if (rawWorkingHours.data && Array.isArray(rawWorkingHours.data)) {
      workingHoursData = rawWorkingHours.data;
    } else if (rawWorkingHours.workingHoursArray) {
      workingHoursData = rawWorkingHours.workingHoursArray;
    } else if (Array.isArray(rawWorkingHours)) {
      workingHoursData = rawWorkingHours;
    } else {
      console.warn('Unexpected working hours data structure:', rawWorkingHours);
      return [];
    }
    
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
export const useBookingData = (salonId: string) => {
  const servicesQuery = useSalonServices(salonId);
  const staffQuery = useSalonStaff(salonId);
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