"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Textarea } from '@repo/ui/textarea';
import { Button } from '@repo/ui/button';
import { format, addMinutes } from 'date-fns';
import { Calendar as CalendarIcon, Trash2, Loader2 } from 'lucide-react';
import { glowvitaApi } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';

// Simple toast notification function
const toast = {
  success: (title: string, description?: string) => {
    alert(`${title}\n${description || ''}`);
  },
  error: (title: string, description?: string) => {
    alert(`Error: ${title}\n${description || ''}`);
  }
};

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
  totalAmount: number;
  paymentStatus?: string;
  tax?: number;
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
  onSubmit?: (appointment: Appointment) => Promise<void>;
  onCancel?: () => void;
  onSuccess?: () => void;
  onDelete?: (id: string) => void;
}

export default function NewAppointmentForm({
  defaultValues,
  defaultDate,
  isEditing = false,
  onSubmit,
  onCancel = () => {},
  onSuccess,
  onDelete
}: NewAppointmentFormProps) {
  const router = useRouter();
  const { user } = useCrmAuth();
  const vendorId = user?.vendorId || user?._id;

  // Fetch staff data using the getStaff query
  const { data: staffResponse = [], isLoading: isLoadingStaff } = glowvitaApi.useGetStaffQuery(undefined, {
    refetchOnMountOrArgChange: true,
    selectFromResult: ({ data = [], isLoading }) => ({
      // Map the API response to match the StaffMember interface
      data: (Array.isArray(data) ? data : []).map(staff => ({
        _id: staff._id,
        name: staff.fullName,
        email: staff.emailAddress,
        phone: staff.mobileNo
      })),
      isLoading
    })
  });

  // Update the staff data transformation
  const staffData = React.useMemo(() => {
    console.log('Raw staff response:', staffResponse);
    
    // Handle different response structures
    let rawStaff = [];
    if (Array.isArray(staffResponse)) {
      // Case 1: Response is already an array
      rawStaff = staffResponse;
    } else if (staffResponse?.data) {
      // Case 2: Response has a data property that might be an array
      rawStaff = Array.isArray(staffResponse.data) ? staffResponse.data : [];
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
    
  // Get the first staff member as default if available
  const defaultStaff = staffData?.[0];

  // Get current time with 15-minute buffer
  const getCurrentTimeWithBuffer = () => {
    const now = new Date();
    const bufferTime = new Date(now.getTime() + 15 * 60 * 1000);
    const hours = bufferTime.getHours().toString().padStart(2, '0');
    const minutes = bufferTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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

  // Track initial mount to prevent double-setting defaults
  const isInitialMount = useRef(true);

  // Handle default values on initial load
  useEffect(() => {
    if (!defaultValues || !isInitialMount.current) return;
    
    isInitialMount.current = false;
    console.log('Default values received:', defaultValues);
    
    const updates: Partial<Appointment> = {};
    
    // Handle ID mapping - this is crucial for editing
    if (defaultValues._id || defaultValues.id) {
      updates._id = defaultValues._id || defaultValues.id;
      updates.id = defaultValues._id || defaultValues.id; // Ensure both are set
    }
    
    // Handle service mapping
    if (defaultValues.service || defaultValues.serviceName) {
      // First try to find service by ID
      const serviceId = defaultValues.service || 
        (defaultValues.serviceName && services.find(s => s.name === defaultValues.serviceName)?._id);
      
      if (serviceId) {
        updates.service = serviceId;
        // If we have the service in our services list, use its name
        const service = services.find(s => s._id === serviceId);
        updates.serviceName = service ? service.name : defaultValues.serviceName || '';
      } else if (defaultValues.serviceName) {
        // If we couldn't find by ID but have a name, just use the name
        updates.serviceName = defaultValues.serviceName;
      }
    }
    
    // Handle staff mapping - support both object and string formats
    if (defaultValues.staff) {
      if (typeof defaultValues.staff === 'object' && defaultValues.staff !== null) {
        // If staff is an object, extract the ID and name
        updates.staff = (defaultValues.staff as any)._id;
        updates.staffName = (defaultValues.staff as any).fullName || defaultValues.staffName || '';
      } else if (typeof defaultValues.staff === 'string') {
        // If staff is a string ID, find the corresponding staff member
        const staff = staffData.find(s => s._id === defaultValues.staff);
        if (staff) {
          updates.staff = staff._id;
          updates.staffName = staff.name || defaultValues.staffName || '';
        }
      }
    } else if (defaultValues.staffName) {
      // If only staffName is provided, try to find the staff by name
      const staff = staffData.find(s => s.name === defaultValues.staffName);
      if (staff) {
        updates.staff = staff._id;
        updates.staffName = staff.name;
      }
    }
    
    // Apply all updates
    if (Object.keys(updates).length > 0) {
      setAppointmentData(prev => ({
        ...prev,
        ...defaultValues,
        ...updates,
        date: defaultValues.date ? new Date(defaultValues.date) : prev.date,
      }));
    }
  }, [defaultValues, services, staffData]);

  // Update the staff change handler
  const handleStaffChange = (staffId: string) => {
    const selectedStaff = staffData.find(s => s._id === staffId);
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
        const selectedStaff = staffData.find(s => s._id === appointmentData.staff);
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

  // Update the getMinTime function to return current time with buffer
  const getMinTime = (selectedDate: Date): string => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    
    if (selectedDay.getTime() === today.getTime()) {
      // For today, add 15 minutes buffer
      const bufferTime = new Date(now.getTime() + 15 * 60 * 1000);
      const hours = bufferTime.getHours().toString().padStart(2, '0');
      const minutes = bufferTime.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return '00:00';
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
    const selectedService = services.find(s => s.id === serviceId);
    if (selectedService) {
      const now = new Date();
      const currentTime = getMinTime(now);
      
      // Calculate total amount based on service price, discount and tax
      const amount = selectedService.price || 0;
      const discount = appointmentData.discount || 0;
      const tax = appointmentData.tax || 0;
      const totalAmount = Math.max(0, amount - discount + tax);
      
      setAppointmentData(prev => ({
        ...prev,
        service: selectedService.id,
        serviceName: selectedService.name,
        duration: selectedService.duration || 60,
        amount: amount,
        totalAmount: totalAmount,
        endTime: calculateEndTime(prev.startTime, selectedService.duration || 60)
      }));
    }
  };

  // Update the start time handler to also update end time
  const handleStartTimeChange = (time: string) => {
    setAppointmentData(prev => ({
      ...prev,
      startTime: time,
      // Only update end time if duration is set
      ...(prev.duration > 0 && {
        endTime: calculateEndTime(time, prev.duration)
      })
    }));
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
    return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!appointmentData.clientName || !appointmentData.clientName.trim()) {
        toast.error('Error', 'Please enter client name');
        return;
      }

      if (!appointmentData.service) {
        toast.error('Error', 'Please select a service');
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
        staffName: appointmentData.staffName || staffData.find(s => s._id === appointmentData.staff)?.name || '',
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
        toast.success('Success', 'Appointment updated successfully');
      } else {
        // For new appointments, ensure we don't send an ID
        const { _id, id, ...newAppointment } = appointmentPayload;
        await createAppointment(newAppointment).unwrap();
        toast.success('Success', 'Appointment created successfully');
      }
      
      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to save appointment. Please check all fields and try again.';
      console.error('Detailed error:', error);
      toast.error('Error', errorMessage);
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
          toast.success('Success', 'Appointment deleted successfully');
          if (onSuccess) onSuccess();
        }
      } catch (error: any) {
        console.error('Error deleting appointment:', error);
        toast.error('Error', 'Failed to delete appointment');
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

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? 'Edit Appointment' : 'New Appointment'}
        </h2>
        <p className="text-sm text-gray-500">
          {isEditing ? 'Update the appointment details' : 'Fill in the details to schedule a new appointment'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Name */}
        <div className="space-y-2">
          <Label htmlFor="clientName" className="text-sm font-medium text-gray-700">
            Client Name <span className="text-red-500">*</span>
          </Label>
          <Input  
            id="clientName"
            value={appointmentData.clientName || ''}
            onChange={(e) => {
              const name = e.target.value; 
              setAppointmentData(prev => ({
                ...prev,
                client: '', // Clear any existing client ID when typing a new name
                clientName: name 
              }));
            }}
            placeholder="Enter client name"
            className="w-full"
            required
          />
        </div>

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
                    handleFieldChange('date', selectedDate);
                    
                    // If the selected date is today, update the minimum time
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selectedDate.getTime() === today.getTime()) {
                      const minTime = getMinTime(selectedDate);
                      if (appointmentData.startTime < minTime) {
                        handleFieldChange('startTime', minTime);
                      }
                    }
                  } else {
                    toast.error('Error', 'Cannot select past dates');
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
                } />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
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
              <>
                {/* <div className="text-xs text-gray-500 mb-1">
                  Available staff: {staffData.length} members loaded
                </div> */}
                <Select
                  value={appointmentData.staff}
                  onValueChange={handleStaffChange}
                  disabled={isLoadingStaff || staffData.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={
                      isLoadingStaff ? 'Loading staff...' : 
                      staffData.length === 0 ? 'No staff available' : 'Select a staff member'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {staffData.map((staff) => {
                      console.log('Staff item:', staff); // Debug log
                      return (
                        <SelectItem key={staff._id} value={staff._id}>
                          <div className="flex flex-col">
                            <span>{staff.name}</span>
                            {staff.email && (
                              <span className="text-xs text-gray-500">{staff.email}</span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <div className="text-sm text-gray-500">
                {isLoadingStaff ? 'Loading staff...' : 'No staff members found'}
                <div className="text-xs text-gray-400 mt-1">
                  Staff response: {JSON.stringify(staffResponse, null, 2)}
                </div>
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

      
    </div>
  );
}