import React, { useMemo } from 'react';
import { 
  useGetPublicVendorServicesQuery, 
  useGetPublicVendorStaffQuery, 
  useGetPublicVendorStaffByServiceQuery,
  useGetPublicVendorWorkingHoursQuery,
  useGetPublicVendorsQuery,
  useGetPublicVendorWeddingPackagesQuery
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
  discountedPrice?: string | null;
  category: string;
  image?: string;
  description?: string;
  staff?: string[];
  homeService?: {
    available: boolean;
    charges: number | null;
  };
  weddingService?: {
    available: boolean;
    charges: number | null;
  };
  isAddon?: boolean;
  quantity?: number; // Add quantity field for wedding package customization
  // Enhanced properties for wedding package services
  serviceHomeService?: {
    available: boolean;
    charges: number | null;
  };
  serviceWeddingService?: {
    available: boolean;
    charges: number | null;
  };
  serviceIsAddon?: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  specialties?: string[];
  rating?: number;
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

export interface ServiceStaffAssignment {
  service: Service;
  staff: StaffMember | null;
}

export interface WeddingPackage {
  id: string;
  _id?: string;
  name: string;
  description: string;
  services: Array<{
    serviceId: string;
    serviceName: string;
    quantity: number;
    staffRequired: boolean;
  }>;
  totalPrice: number;
  discountedPrice?: number | null;
  duration: number;
  image?: string;
  status: string;
  isActive: boolean;
}

export const convertDurationToMinutes = (duration: string | number): number => {
  if (typeof duration === 'string') {
    const match = duration.match(/(\d+)\s*(min|hour|hours)/);
    if (!match) return 60; // default to 60 minutes
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    if (unit === 'min') return value;
    if (unit === 'hour' || unit === 'hours') return value * 60;
  } else if (typeof duration === 'number') {
    return duration;
  }
  
  return 60; // default to 60 minutes
};

export const calculateTotalDuration = (services: Service[]): number => {
  return services.reduce((total, service) => {
    return total + convertDurationToMinutes(service.duration);
  }, 0);
};

export const isStaffCompatibleWithService = (staff: StaffMember, service: Service): boolean => {
  if (!service.staff || service.staff.length === 0) {
    return true;
  }
  
  const isIdMatch = service.staff.includes(staff.id);
  const isNameMatch = service.staff.includes(staff.name);
  
  return isIdMatch || isNameMatch;
};

export const validateServiceStaffAssignments = (assignments: ServiceStaffAssignment[]): boolean => {
  // Check if all assignments have valid data
  const isValid = assignments.every(assignment => {
    // Validate service exists
    if (!assignment.service || !assignment.service.id) {
      console.warn('Invalid service in assignment:', assignment);
      return false;
    }
    
    // Staff can be null ("Any Professional"), but if provided, must be valid
    if (assignment.staff !== null) {
      if (!assignment.staff || !assignment.staff.id) {
        console.warn('Invalid staff in assignment:', assignment);
        return false;
      }
      
      // Check staff compatibility with service
      if (!isStaffCompatibleWithService(assignment.staff, assignment.service)) {
        console.warn('Staff not compatible with service:', assignment);
        return false;
      }
    }
    
    return true;
  });
  
  return isValid;
};

export const findOverlappingAvailability = (assignments: ServiceStaffAssignment[], date: Date, workingHours: WorkingHours[]): string[] => {
  const allAnyProfessional = assignments.every(assignment => !assignment.staff);
  if (allAnyProfessional) {
    return [];
  }
  
  const assignedStaff = assignments.filter(assignment => assignment.staff);
  if (assignedStaff.length === 1) {
    return [];
  }
  
  return [];
};

/**
 * Hook to fetch salon services with formatted data for the booking flow
 */
export const useSalonServices = (salonId: string) => {
  const { data: rawServices, isLoading, error } = useGetPublicVendorServicesQuery(salonId);
  
  const services = useMemo((): Service[] => {
    if (!rawServices) return [];
    
    let servicesArray: any[] = [];
    
    if (rawServices.data && Array.isArray(rawServices.data)) {
      servicesArray = rawServices.data;
    } else if (rawServices.services && Array.isArray(rawServices.services)) {
      servicesArray = rawServices.services;
    } else if (Array.isArray(rawServices)) {
      servicesArray = rawServices;
    } else {
      return [];
    }
    
    if (!Array.isArray(servicesArray)) {
      return [];
    }
    
    return servicesArray.map((service: any): Service => {
      return {
        id: service._id || service.id,
        name: service.serviceName || service.name,
        duration: `${service.duration || 60} min` || '60 min',
        price: (service.price || 0).toString(),
        discountedPrice: service.discountedPrice !== null && service.discountedPrice !== undefined ? 
          service.discountedPrice.toString() : 
          null,
        category: service.category || 'General',
        image: service.image || `https://picsum.photos/seed/${service.serviceName}/200/200`,
        description: service.description,
        staff: service.staff || [],
        homeService: service.homeService || { available: false, charges: null },
        weddingService: service.weddingService || { available: false, charges: null },
        isAddon: service.category?.toLowerCase().includes('addon') || false
      };
    });
  }, [rawServices]);

  const servicesByCategory = useMemo(() => {
    const grouped: { [key: string]: Service[] } = {};
    if (services && Array.isArray(services)) {
      services.forEach((service: Service) => {
        if (!grouped[service.category]) {
          grouped[service.category] = [];
        }
        grouped[service.category].push(service);
      });
    }
    return grouped;
  }, [services]);

  const categories = useMemo(() => {
    if (!services || !Array.isArray(services)) {
      return [{ name: "All" }];
    }
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

export const useWeddingPackages = (salonId: string) => {
  const { data: rawPackages, isLoading, error } = useGetPublicVendorWeddingPackagesQuery(salonId);
  
  // Helper function to process wedding packages regardless of input format
  const processWeddingPackages = (packages: any[]): WeddingPackage[] => {
    if (!Array.isArray(packages)) {
      return [];
    }
        
    return packages.map((pkg: any): WeddingPackage => {
      // Process services properly
      const processedServices = Array.isArray(pkg.services) 
        ? pkg.services.map((service: any) => ({
            serviceId: service.serviceId || service._id || service.id || '',
            serviceName: service.serviceName || service.name || '',
            quantity: service.quantity || 1,
            staffRequired: service.staffRequired !== undefined ? service.staffRequired : true
          })) 
        : [];
          
      return {
        id: pkg.id || pkg._id || '',
        _id: pkg._id || pkg.id || '',
        name: pkg.name || '',
        description: pkg.description || '',
        services: processedServices,
        totalPrice: pkg.totalPrice || 0,
        discountedPrice: pkg.discountedPrice !== undefined ? pkg.discountedPrice : null,
        duration: pkg.duration || 0,
        image: pkg.image || '',
        status: pkg.status || 'approved',
        isActive: pkg.isActive !== undefined ? pkg.isActive : true
      };
    });
  };
      
  const weddingPackages = useMemo((): WeddingPackage[] => {
    if (!rawPackages) {
      return [];
    }
    
    // Handle different response formats from the API
    if (rawPackages.hasOwnProperty('success') && rawPackages.success) {
      // Format: { success: true, weddingPackages: [...] }
      if (Array.isArray(rawPackages.weddingPackages)) {
        return processWeddingPackages(rawPackages.weddingPackages);
      }
    } else if (rawPackages.hasOwnProperty('weddingPackages')) {
      // Format: { weddingPackages: [...] }
      if (Array.isArray(rawPackages.weddingPackages)) {
        return processWeddingPackages(rawPackages.weddingPackages);
      }
    } else if (Array.isArray(rawPackages)) {
      // Format: [...]
      return processWeddingPackages(rawPackages);
    } else if (rawPackages.data && Array.isArray(rawPackages.data)) {
      // Format: { data: [...] }
      return processWeddingPackages(rawPackages.data);
    }
    
    return [];
  }, [rawPackages]);

  return {
    weddingPackages,
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
  
  const shouldUseServiceSpecificEndpoint = !!(serviceId && serviceId.trim() !== '');
  
  const { data: rawStaff, isLoading, error } = shouldUseServiceSpecificEndpoint
    ? useGetPublicVendorStaffByServiceQuery({ vendorId: salonId, serviceId: serviceId! })
    : useGetPublicVendorStaffQuery(salonId);
  
  const staff = useMemo(() => {
    if (!rawStaff) return [];
    
    let staffArray = [];
    
    if (rawStaff.data && Array.isArray(rawStaff.data)) {
      staffArray = rawStaff.data;
    } else if (rawStaff.staff && Array.isArray(rawStaff.staff)) {
      staffArray = rawStaff.staff;
    } else if (Array.isArray(rawStaff)) {
      staffArray = rawStaff;
    } else {
      return [];
    }
    
    if (!Array.isArray(staffArray)) {
      return [];
    }
    
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
    
    let workingHoursData = null;
    
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
      return [];
    }
    
    if (!Array.isArray(workingHoursData)) {
      return [];
    }
    
    const transformedHours = workingHoursData.map((dayHours: any): WorkingHours => {
      if (!dayHours.isOpen || !dayHours.open || !dayHours.close) {
        return {
          dayOfWeek: dayHours.day,
          startTime: '',
          endTime: '',
          isAvailable: false
        };
      }
      
      const startTime = dayHours.open;
      const endTime = dayHours.close;
      
      return {
        dayOfWeek: dayHours.day,
        startTime,
        endTime,
        isAvailable: true
      };
    });
    
    return Array.isArray(transformedHours) ? transformedHours : [];
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
    
    if (!Array.isArray(vendorsArray)) {
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
  const weddingPackagesQuery = useWeddingPackages(salonId);
  
  // Debug logging
  console.log('useBookingData - weddingPackagesQuery:', weddingPackagesQuery);
  console.log('useBookingData - weddingPackagesQuery.weddingPackages:', weddingPackagesQuery.weddingPackages);
  console.log('useBookingData - weddingPackagesQuery.weddingPackages length:', weddingPackagesQuery.weddingPackages?.length);
  console.log('useBookingData - weddingPackagesQuery.isLoading:', weddingPackagesQuery.isLoading);
  console.log('useBookingData - weddingPackagesQuery.error:', weddingPackagesQuery.error);
  console.log('useBookingData - weddingPackagesQuery type:', typeof weddingPackagesQuery.weddingPackages);
  console.log('useBookingData - weddingPackagesQuery is array:', Array.isArray(weddingPackagesQuery.weddingPackages));
  
  const isLoading = servicesQuery.isLoading || 
                   staffQuery.isLoading || 
                   workingHoursQuery.isLoading || 
                   salonInfoQuery.isLoading ||
                   weddingPackagesQuery.isLoading;

  const error = servicesQuery.error || 
               staffQuery.error || 
               workingHoursQuery.error || 
               salonInfoQuery.error ||
               weddingPackagesQuery.error;
  
  console.log('useBookingData - Final wedding packages:', weddingPackagesQuery.weddingPackages);
  console.log('useBookingData - weddingPackagesQuery.weddingPackages type:', typeof weddingPackagesQuery.weddingPackages);
  console.log('useBookingData - weddingPackagesQuery.weddingPackages is array:', Array.isArray(weddingPackagesQuery.weddingPackages));
  
  // Ensure weddingPackages is always an array
  const weddingPackages = Array.isArray(weddingPackagesQuery.weddingPackages) 
    ? weddingPackagesQuery.weddingPackages 
    : [];
  
  // Additional validation to ensure we have valid packages
  const validWeddingPackages = weddingPackages.filter(pkg => pkg && (pkg.id || pkg._id || pkg.name));
  
  console.log('useBookingData - Processed wedding packages:', weddingPackages);
  
  console.log('useBookingData - Final wedding packages (ensured array):', validWeddingPackages);
  console.log('useBookingData - Final wedding packages length:', validWeddingPackages.length);
  console.log('useBookingData - Final wedding packages type:', typeof validWeddingPackages);
  
  // Log individual packages
  if (validWeddingPackages && validWeddingPackages.length > 0) {
    validWeddingPackages.forEach((pkg, index) => {
      console.log(`useBookingData - Package ${index}:`, pkg);
      console.log(`useBookingData - Package ${index} keys:`, Object.keys(pkg));
      console.log(`useBookingData - Package ${index} id:`, pkg.id);
      console.log(`useBookingData - Package ${index} _id:`, pkg._id);
      console.log(`useBookingData - Package ${index} name:`, pkg.name);
    });
  } else {
    console.log('useBookingData - No wedding packages found or empty array');
  }
  
  return {
    services: servicesQuery.services,
    servicesByCategory: servicesQuery.servicesByCategory,
    categories: servicesQuery.categories,
    staff: staffQuery.staff,
    workingHours: workingHoursQuery.workingHours,
    salonInfo: salonInfoQuery.salonInfo,
    weddingPackages: validWeddingPackages,
    isLoading,
    error
  };
};