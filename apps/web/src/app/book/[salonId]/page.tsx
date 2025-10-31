"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { ChevronLeft, X, Scissors, User, Calendar, Clock, MapPin, Star, ChevronUp, ChevronDown, Wallet, CreditCard, Hourglass, Loader2, AlertCircle, Search } from "lucide-react";
import { Button } from "@repo/ui/button";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { Step1_Services } from "@/components/booking/Step1_Services";
import { Step2_Staff } from "@/components/booking/Step2_Staff";
import { Step3_TimeSlot } from "@/components/booking/Step3_TimeSlot";
import { Step2_MultiService } from "@/components/booking/Step2_MultiService";
import { Step3_MultiServiceTimeSlot } from "@/components/booking/Step3_MultiServiceTimeSlot";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/card';
import { Separator } from '@repo/ui/separator';
import { format } from 'date-fns';
import { useBookingData, Service, StaffMember, ServiceStaffAssignment, calculateTotalDuration, convertDurationToMinutes } from '@/hooks/useBookingData';
import { useCreatePublicAppointmentMutation, useGetPublicVendorOffersQuery } from '@repo/store/api';
import { useAuth } from '@/hooks/useAuth';
// Add import for payment calculator - use cleaner @repo alias
import { calculateBookingAmount, validateOfferCode } from '@repo/lib/utils';
import { toast } from 'sonner';

// Add a custom hook to fetch tax fee settings
const useTaxFeeSettings = () => {
  const [taxFeeSettings, setTaxFeeSettings] = useState<null | any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<null | Error>(null);

  useEffect(() => {
    const fetchTaxFeeSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/tax-fees');
        if (response.ok) {
          const data = await response.json();
          setTaxFeeSettings(data);
        } else {
          setError(new Error('Failed to fetch tax fee settings'));
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaxFeeSettings();
  }, []);

  return { taxFeeSettings, isLoading, error };
};

function BookingPageContent() {
  console.log('BookingPageContent - Component rendered');
  
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { salonId } = params;
  
  // Add debugging for route parameters
  console.log('BookingPageContent - Route parameters:', { params, salonId });

  // State for tracking the selected service
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // State declarations
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [serviceStaffAssignments, setServiceStaffAssignments] = useState<ServiceStaffAssignment[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [serviceSchedule, setServiceSchedule] = useState<Array<{
    service: Service;
    staff: StaffMember | null;
    startTime: string;
    endTime: string;
    duration: number;
  }>>([]);

  // Fetch dynamic data using our custom hook
  const {
    services,
    servicesByCategory,
    categories,
    staff,
    workingHours,
    salonInfo,
    isLoading,
    error
  } = useBookingData(salonId as string);

  // Fetch vendor offers
  const { data: vendorOffersData, isLoading: isOffersLoading } = useGetPublicVendorOffersQuery(salonId as string);
  const vendorOffers = vendorOffersData?.data || [];
  
  // Fetch tax fee settings using our custom hook
  const { taxFeeSettings, isLoading: isTaxFeeSettingsLoading } = useTaxFeeSettings();
  
  // State for offer dropdown
  const [isOfferDropdownOpen, setIsOfferDropdownOpen] = useState(false);
  const [offerSearchTerm, setOfferSearchTerm] = useState('');
  const [showOfferDropdown, setShowOfferDropdown] = useState(false);

  // Add useEffect to handle click outside of offer dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('offer-dropdown');
      const input = document.getElementById('offer-input');
      if (dropdown && input && 
          !dropdown.contains(event.target as Node) && 
          !input.contains(event.target as Node)) {
        setShowOfferDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter offers based on search term
  const filteredOffers = useMemo(() => {
    if (!vendorOffers || vendorOffers.length === 0) return [];
    if (!offerSearchTerm) return vendorOffers;
    
    return vendorOffers.filter((offer: { code: string; type: string; value: number }) => 
      offer.code.toLowerCase().includes(offerSearchTerm.toLowerCase()) ||
      (offer.type === 'percentage' && `${offer.value}%`.includes(offerSearchTerm)) ||
      (offer.type === 'fixed' && `₹${offer.value}`.includes(offerSearchTerm))
    );
  }, [vendorOffers, offerSearchTerm]);

  // Fetch service-specific staff data when a service is selected
  const serviceStaffData = useBookingData(salonId as string, selectedService?.id || (selectedServices.length > 0 ? selectedServices[0]?.id : undefined));
  
  // Add additional debugging for serviceStaffData
  useEffect(() => {
    console.log('serviceStaffData updated:', serviceStaffData);
  }, [serviceStaffData]);
  
  // Add debugging to see what's happening with serviceStaffData
  console.log('BookingPage - serviceStaffData:', serviceStaffData);
  console.log('BookingPage - selectedService:', selectedService);

  // Make sure currentStep is always a valid number
  if (typeof currentStep !== 'number' || currentStep < 1 || currentStep > 3) {
    console.warn('Invalid currentStep value, resetting to 1:', currentStep);
    setCurrentStep(1);
  }

  // Mutation for creating appointments
  const [createAppointment, { isLoading: isCreatingAppointment }] = useCreatePublicAppointmentMutation();

  // Get authentication state from the useAuth hook
  const { isAuthenticated, user } = useAuth();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // State for offer code and price breakdown
  const [offerCode, setOfferCode] = useState('');
  const [priceBreakdown, setPriceBreakdown] = useState<any>(null);
  const [offer, setOffer] = useState<any>(null);

  // Handle navigation between steps
  const handleNextStep = () => {
    // For multi-service bookings, validate assignments before proceeding
    const isMultiService = selectedServices.length > 1 || serviceStaffAssignments.length > 0;
    
    if (currentStep < 3) {
      // For step 2 in multi-service flow, validate assignments
      if (currentStep === 2 && isMultiService) {
        // Check if all services have staff assigned (or "Any Professional" is acceptable)
        const allAssigned = serviceStaffAssignments.every(assignment => assignment.staff !== undefined);
        if (allAssigned) {
          setCurrentStep(currentStep + 1);
        } else {
          toast.error('Please assign staff to all services or select "Any Professional".');
          return;
        }
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      if (isAuthenticated) {
        setIsConfirmationModalOpen(true);
      } else {
        // Save booking data to sessionStorage before redirecting to login
        const bookingData = {
          selectedServices,
          serviceStaffAssignments,
          selectedStaff,
          selectedDate: selectedDate.toISOString(),
          selectedTime,
          salonId
        };
        sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
        router.push(`/client-login?redirect=/book/${salonId}`);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      window.history.back();
    }
  };

  // Check if an appointment was just created and clear the flag
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('appointmentJustCreated') === 'true') {
      console.log("Detected that an appointment was just created, clearing flag");
      sessionStorage.removeItem('appointmentJustCreated');
    }
  }, []);

  // Restore pending booking data after login
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      const pendingBooking = sessionStorage.getItem('pendingBooking');
      if (pendingBooking) {
        try {
          const bookingData = JSON.parse(pendingBooking);
          // Only restore if it's for the current salon
          if (bookingData.salonId === salonId) {
            setSelectedServices(bookingData.selectedServices);
            setServiceStaffAssignments(bookingData.serviceStaffAssignments);
            setSelectedStaff(bookingData.selectedStaff);
            setSelectedDate(new Date(bookingData.selectedDate));
            setSelectedTime(bookingData.selectedTime);
            // Clear the pending booking data
            sessionStorage.removeItem('pendingBooking');
            // Set current step to confirmation
            setIsConfirmationModalOpen(true);
          }
        } catch (error) {
          console.error('Failed to restore pending booking data:', error);
          sessionStorage.removeItem('pendingBooking');
        }
      }
    }
  }, [isAuthenticated, salonId]);

  // Ensure service-staff assignments are properly initialized when selectedServices change
  useEffect(() => {
    console.log('useEffect - Ensuring service-staff assignments', { selectedServicesLength: selectedServices.length, serviceStaffAssignmentsLength: serviceStaffAssignments.length });
    if (selectedServices.length > 0) {
      // Create service-staff assignments for all selected services if they don't exist
      const newAssignments = selectedServices.map(service => {
        // Validate service data
        if (!service || !service.id) {
          console.warn('Invalid service data found:', service);
          return null;
        }
        
        // Check if this service already has an assignment
        const existingAssignment = serviceStaffAssignments.find(assignment => assignment.service.id === service.id);
        if (existingAssignment) {
          return existingAssignment;
        }
        // Create a new assignment with no staff selected
        return { service, staff: null };
      }).filter(Boolean) as ServiceStaffAssignment[]; // Filter out any null values
      
      // Only update if there are changes
      if (newAssignments.length !== serviceStaffAssignments.length || 
          newAssignments.some((newAssignment, index) => 
            newAssignment?.service?.id !== serviceStaffAssignments[index]?.service?.id)) {
        console.log('useEffect - Updating service-staff assignments', { newAssignments, serviceStaffAssignments });
        setServiceStaffAssignments(newAssignments);
      }
    } else if (serviceStaffAssignments.length > 0) {
      // If no services are selected but we have assignments, clear them
      console.log('useEffect - Clearing service-staff assignments');
      setServiceStaffAssignments([]);
    }
  }, [selectedServices, serviceStaffAssignments]);

  // Calculate service schedule when selectedTime or selectedStaff changes
  useEffect(() => {
    if (selectedTime) {
      try {
        console.log("Recalculating service schedule...");
        console.log("Selected time:", selectedTime);
        console.log("Service staff assignments:", serviceStaffAssignments);
        console.log("Selected services:", selectedServices);
        console.log("Selected staff:", selectedStaff);
        console.log("Is single service?", selectedServices.length === 1);
        
        // Validate inputs
        if (!selectedTime || !selectedServices || selectedServices.length === 0) {
          console.warn("Missing required data for service schedule calculation");
          setServiceSchedule([]);
          return;
        }
        
        // Calculate the detailed schedule for each service
        const totalDuration = calculateTotalDuration(selectedServices);
        console.log("Total duration:", totalDuration);
        
        // Calculate start and end times for each service
        const newServiceSchedule: Array<{
          service: Service;
          staff: StaffMember | null;
          startTime: string;
          endTime: string;
          duration: number;
        }> = [];
        
        let currentTimeMinutes = parseInt(selectedTime?.split(':')[0] || '0') * 60 + parseInt(selectedTime?.split(':')[1] || '0');
        
        // Check if this is a single service booking (no service-staff assignments)
        if (selectedServices.length === 1 && (!serviceStaffAssignments || serviceStaffAssignments.length === 0)) {
          console.log("Processing SINGLE SERVICE booking");
          const service = selectedServices[0];
          
          // Validate service
          if (!service || !service.duration) {
            console.error("Invalid service data for single service booking:", service);
            setServiceSchedule([]);
            return;
          }
          
          const serviceDuration = convertDurationToMinutes(service.duration);
          const startTime = `${Math.floor(currentTimeMinutes / 60).toString().padStart(2, '0')}:${(currentTimeMinutes % 60).toString().padStart(2, '0')}`;
          const endTimeMinutes = currentTimeMinutes + serviceDuration;
          const endTime = `${Math.floor(endTimeMinutes / 60).toString().padStart(2, '0')}:${(endTimeMinutes % 60).toString().padStart(2, '0')}`;
          
          newServiceSchedule.push({
            service,
            staff: selectedStaff, // Use the selectedStaff from Step2
            startTime,
            endTime,
            duration: serviceDuration
          });
          
          console.log("Single service schedule created:", newServiceSchedule);
        } else {
          // Multi-service flow - use service-staff assignments
          console.log("Processing MULTI-SERVICE booking");
          
          // Validate service-staff assignments
          if (!serviceStaffAssignments || serviceStaffAssignments.length === 0) {
            console.warn("No service-staff assignments found for multi-service booking");
            setServiceSchedule([]);
            return;
          }
          
          // Group services by staff member to determine the sequence
          const staffServiceMap: { [key: string]: { staff: StaffMember; services: Service[] } } = {};
          
          for (const assignment of serviceStaffAssignments) {
            // Validate assignment
            if (!assignment || !assignment.service) {
              console.warn("Invalid assignment found:", assignment);
              continue;
            }
            
            if (assignment.staff) {
              const staffId = assignment.staff.id;
              if (staffServiceMap[staffId]) {
                staffServiceMap[staffId].services.push(assignment.service);
              } else {
                staffServiceMap[staffId] = {
                  staff: assignment.staff,
                  services: [assignment.service]
                };
              }
          }
          }
          
          console.log("Staff service map:", staffServiceMap);
          
          // Process each staff member's services in order
          Object.keys(staffServiceMap).forEach(staffId => {
            const entry = staffServiceMap[staffId];
            entry.services.forEach((service: Service) => {
              // Validate service
              if (!service || !service.duration) {
                console.warn("Invalid service data:", service);
                return;
              }
              
              const serviceDuration = convertDurationToMinutes(service.duration);
              const startTime = `${Math.floor(currentTimeMinutes / 60).toString().padStart(2, '0')}:${(currentTimeMinutes % 60).toString().padStart(2, '0')}`;
              currentTimeMinutes += serviceDuration;
              const endTime = `${Math.floor(currentTimeMinutes / 60).toString().padStart(2, '0')}:${(currentTimeMinutes % 60).toString().padStart(2, '0')}`;
              
              newServiceSchedule.push({
                service,
                staff: entry.staff,
                startTime,
                endTime,
                duration: serviceDuration
              });
            });
          });
          
          // If there are services with "Any Professional", add them at the end
          const anyProfessionalAssignments = serviceStaffAssignments.filter(assignment => !assignment.staff);
          anyProfessionalAssignments.forEach((assignment: ServiceStaffAssignment) => {
            // Validate assignment
            if (!assignment || !assignment.service || !assignment.service.duration) {
              console.warn("Invalid assignment for 'Any Professional':", assignment);
              return;
            }
            
            const serviceDuration = convertDurationToMinutes(assignment.service.duration);
            const startTime = `${Math.floor(currentTimeMinutes / 60).toString().padStart(2, '0')}:${(currentTimeMinutes % 60).toString().padStart(2, '0')}`;
            currentTimeMinutes += serviceDuration;
            const endTime = `${Math.floor(currentTimeMinutes / 60).toString().padStart(2, '0')}:${(currentTimeMinutes % 60).toString().padStart(2, '0')}`;
            
            newServiceSchedule.push({
              service: assignment.service,
              staff: null,
              startTime,
              endTime,
              duration: serviceDuration
            });
          });
        }
        
        console.log("Final service schedule:", newServiceSchedule);
        setServiceSchedule(newServiceSchedule);
      } catch (error) {
        console.error("Error calculating service schedule:", error);
        setServiceSchedule([]); // Set empty schedule on error to prevent blank screen
      }
    }
  }, [selectedTime, serviceStaffAssignments, selectedServices, selectedStaff]);

  // Handle offer code application
  const handleApplyOffer = async () => {
    if (!offerCode) return;
    
    try {
      // Validate the offer code using the API endpoint
      const response = await fetch('/api/validate-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offerCode,
          vendorId: salonId
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setOffer(result.data); // Set the offer data directly
        // Use toast instead of alert
        toast.success('Offer applied successfully!');
      } else {
        toast.error(result.message || 'Invalid or expired offer code');
      }
    } catch (error) {
      console.error('Error applying offer:', error);
      toast.error('Failed to validate offer code. Please try again.');
    }
  };

  // Handle offer selection from dropdown
  const handleSelectOffer = (selectedOffer: { code: string }) => {
    setOfferCode(selectedOffer.code);
    setOffer(selectedOffer);
    setShowOfferDropdown(false);
    setOfferSearchTerm('');
    toast.success('Offer applied successfully!');
  };

  // Clear applied offer
  const handleClearOffer = () => {
    setOfferCode('');
    setOffer(null);
    setShowOfferDropdown(false);
    toast.success('Offer removed successfully!');
  };

  // Update the handleFinalBookingConfirmation function to include payment details
  const handleFinalBookingConfirmation = async () => {
    if (!selectedTime) {
      toast.error("Please select a time slot");
      return;
    }

    if (!isAuthenticated) {
      // Save booking data to sessionStorage
      const bookingData = {
        salonId,
        selectedServices,
        serviceStaffAssignments,
        selectedStaff,
        selectedDate,
        selectedTime,
      };
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
      
      // Redirect to login
      router.push(`/login?redirect=/book/${salonId}`);
      return;
    }

    // Create appointment data
    const appointmentData = {
      vendorId: salonId,
      client: user?._id,
      clientName: `${user?.firstName} ${user?.lastName}`,
      date: selectedDate,
      startTime: selectedTime,
      endTime: serviceSchedule[serviceSchedule.length - 1].endTime,
      duration: calculateTotalDuration(selectedServices),
      amount: selectedServices.reduce((acc, s) => {
        const price = s.discountedPrice !== null && s.discountedPrice !== undefined ? 
          parseFloat(s.discountedPrice) : 
          parseFloat(s.price);
        return acc + price;
      }, 0),
      totalAmount: selectedServices.reduce((acc, s) => {
        const price = s.discountedPrice !== null && s.discountedPrice !== undefined ? 
          parseFloat(s.discountedPrice) : 
          parseFloat(s.price);
        return acc + price;
      }, 0),
      platformFee: priceBreakdown?.platformFee || 0,
      serviceTax: priceBreakdown?.serviceTax || 0,
      discountAmount: priceBreakdown?.discountAmount || 0,
      finalAmount: priceBreakdown?.finalTotal || selectedServices.reduce((acc, s) => {
        const price = s.discountedPrice !== null && s.discountedPrice !== undefined ? 
          parseFloat(s.discountedPrice) : 
          parseFloat(s.price);
        return acc + price;
      }, 0),
      paymentMethod: 'Pay at Salon', // Default to Pay at Salon
      paymentStatus: 'pending',
    };

    try {
      // Create the appointment in the database
      console.log("Calling createAppointment...");
      const result = await createAppointment(appointmentData).unwrap();
      console.log("Appointment created successfully:", result);
      
      // Close the payment modal
      setIsPaymentModalOpen(false);
      
      // Show confirmation message
      alert(`Booking Confirmed! Payment Method: ${appointmentData.paymentMethod}\nAppointment created successfully with ${selectedServices.length} services.`);
      
      // Set a flag in sessionStorage to indicate that an appointment was just created
      // This will help the time slot component know to refetch data when it mounts again
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('appointmentJustCreated', 'true');
      }
      
      // Clear the selected time to ensure the time slot component refetches data
      // This will help ensure that the newly created appointment is reflected in the available time slots
      setSelectedTime(null);
      
      // Redirect to the appointments page after a short delay
      setTimeout(() => {
        router.push('/profile/appointments');
      }, 2000);
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      // Check if it's a validation error from the API
      if (error?.data?.message) {
        toast.error(`Failed to create appointment: ${error.data.message}`);
      } else {
        toast.error("Failed to create appointment. Please try again.");
      }
    }
  };

  const handlePaymentMethodSelection = async (method: string) => {
    console.log("=== PAYMENT METHOD SELECTION ===");
    console.log("Selected payment method:", method);
    console.log("Service schedule length:", serviceSchedule.length);
    console.log("Service schedule:", serviceSchedule);
    console.log("Selected services:", selectedServices);
    console.log("Service staff assignments:", serviceStaffAssignments);
    console.log("Selected staff:", selectedStaff);
    
    // Prevent multiple calls
    if (isCreatingAppointment) {
      console.log("Appointment creation already in progress, skipping...");
      return;
    }
    
    try {
      // Check if we have a service schedule or need to create one for single service
      let finalServiceSchedule = serviceSchedule;
      
      // If no service schedule exists, create one for single service appointments
      if (serviceSchedule.length === 0 && selectedServices.length === 1 && selectedTime) {
        console.log("Creating service schedule for single service appointment");
        const service = selectedServices[0];
        const serviceDuration = convertDurationToMinutes(service.duration);
        
        // Create a service schedule entry for the single service
        finalServiceSchedule = [{
          service,
          staff: selectedStaff, // This should already be correct
          startTime: selectedTime,
          endTime: calculateEndTime(selectedTime, serviceDuration),
          duration: serviceDuration
        }];
        
        console.log("Created single service schedule:", finalServiceSchedule);
      }
      
      // For multiple services or single service with schedule, create appointment
      if (finalServiceSchedule.length > 0) {
        console.log("Creating appointment with method:", method);
        
        // Use the first service as the primary service for the appointment
        const primarySchedule = finalServiceSchedule[0];
        console.log("Primary schedule:", primarySchedule);
        
        // Format the appointment date with the correct time
        const appointmentDate = new Date(selectedDate);
        const [hours, minutes] = primarySchedule.startTime.split(':').map(Number);
        appointmentDate.setHours(hours, minutes, 0, 0);
        console.log("Appointment date:", appointmentDate);
        
        // Create service items for all services
        const serviceItems = finalServiceSchedule.map(schedule => ({
          service: schedule.service.id,
          serviceName: schedule.service.name,
          staff: schedule.staff ? schedule.staff.id : null,
          staffName: schedule.staff ? schedule.staff.name : "Any Professional",
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          duration: schedule.duration,
          amount: schedule.service.discountedPrice !== null && schedule.service.discountedPrice !== undefined ? 
            parseFloat(schedule.service.discountedPrice) : 
            parseFloat(schedule.service.price)
        }));
        
        console.log("Service items:", serviceItems);
        
        // Calculate total amount for all services
        const totalAmount = finalServiceSchedule.reduce((sum, schedule) => {
          const price = schedule.service.discountedPrice !== null && schedule.service.discountedPrice !== undefined ? 
            parseFloat(schedule.service.discountedPrice) : 
            parseFloat(schedule.service.price);
          return sum + price;
        }, 0);

        console.log("Total amount:", totalAmount);
        
        // Calculate total duration
        const totalDuration = finalServiceSchedule.reduce((sum, schedule) => sum + schedule.duration, 0);
        console.log("Total duration:", totalDuration);
        
        // Use the last service's end time as the appointment end time
        const endTime = finalServiceSchedule[finalServiceSchedule.length - 1].endTime;
        console.log("End time:", endTime);
        
        // Handle staff field - it can now be null for "Any Professional"
        let staffId = primarySchedule.staff ? primarySchedule.staff.id : null;
        let staffName = primarySchedule.staff ? primarySchedule.staff.name : "Any Professional";
        let clientName = user.firstName + " " + user.lastName;
        console.log("Client Name:", clientName)
        console.log("Client ID:", user._id);
        console.log("Staff ID:", staffId, "Staff Name:", staffName);
        
        console.log("user",user);
        // Prepare appointment data - ensure all required fields are provided
        const appointmentData = {
          vendorId: salonId,
          client: user._id,
          clientName: clientName, // In a real implementation, this would come from user authentication
          service: primarySchedule.service.id,
          serviceName: primarySchedule.service.name,
          staff: staffId, // This can now be null for "Any Professional"
          staffName: staffName,
          date: appointmentDate,
          startTime: primarySchedule.startTime,
          endTime: endTime,
          duration: totalDuration,
          amount: totalAmount,
          totalAmount: totalAmount,
          // Add payment details
          platformFee: priceBreakdown?.platformFee || 0,
          serviceTax: priceBreakdown?.serviceTax || 0,
          taxRate: priceBreakdown?.taxFeeSettings?.serviceTax || 0,
          discountAmount: priceBreakdown?.discountAmount || 0,
          finalAmount: priceBreakdown?.finalTotal || totalAmount,
          paymentMethod: method,
          paymentStatus: method === 'Pay Online' ? 'pending' : 'pending',
          status: "scheduled",
          notes: finalServiceSchedule.length > 1 ? "Multi-service appointment" : "Single service appointment",
          serviceItems: serviceItems,
          isMultiService: finalServiceSchedule.length > 1
        };
        
        console.log("Final appointment data:", appointmentData);
        
        // Create the appointment in the database
        console.log("Calling createAppointment...");
        const result = await createAppointment(appointmentData).unwrap();
        console.log("Appointment created successfully:", result);
        
        // Handle online payment if selected
        if (method === 'Pay Online' && priceBreakdown?.finalTotal > 0) {
          try {
            // In a real implementation, you would integrate with Razorpay or another payment gateway here
            // For now, we'll simulate this
            console.log("Processing online payment...");
            
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update payment status to completed
            // In a real implementation, you would call an API to update the appointment
            console.log("Payment processed successfully");
          } catch (paymentError) {
            console.error("Payment processing error:", paymentError);
            // Update payment status to failed
            // In a real implementation, you would call an API to update the appointment
            toast.error("Payment failed. Please try again or pay at the salon.");
            return;
          }
        }
        
        // Close the payment modal
        setIsPaymentModalOpen(false);
        
        // Show confirmation message
        alert(`Booking Confirmed! Payment Method: ${method}\nAppointment created successfully with ${finalServiceSchedule.length} services.`);
        
        // Set a flag in sessionStorage to indicate that an appointment was just created
        // This will help the time slot component know to refetch data when it mounts again
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('appointmentJustCreated', 'true');
        }
        
        // Clear the selected time to ensure the time slot component refetches data
        // This will help ensure that the newly created appointment is reflected in the available time slots
        setSelectedTime(null);
        
        // Redirect to the appointments page after a short delay
        setTimeout(() => {
          router.push('/profile/appointments');
        }, 2000);
      } else {
        console.log("No service schedule found and unable to create one, skipping appointment creation");
        toast.error("Unable to create appointment. Please try again.");
      }
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      // Check if it's a validation error from the API
      if (error?.data?.message) {
        toast.error(`Failed to create appointment: ${error.data.message}`);
      } else {
        toast.error("Failed to create appointment. Please try again.");
      }
    }
  };
  
  // Helper function to calculate end time
  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };
  
  // Add a function to refetch appointment data after creation
  const refetchAppointments = async () => {
    // This function can be called after appointment creation to ensure data is refreshed
    console.log("Refetching appointment data...");
  };

  const handleSelectService = (service: Service) => {
    // Validate service data before processing
    if (!service || !service.id) {
      console.error('Invalid service data:', service);
      return;
    }
    
    console.log('handleSelectService called with:', service);
    
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      console.log('Service is already selected:', isSelected);
      
      if (isSelected) {
        // If deselecting the service, clear the selected service if it matches
        if (selectedService?.id === service.id) {
          setSelectedService(null);
        }
        // Also remove the service from service-staff assignments
        setServiceStaffAssignments(prevAssignments => 
          prevAssignments.filter(assignment => assignment.service.id !== service.id)
        );
        return prev.filter(s => s.id !== service.id);
      } else {
        // When selecting a service, update the selected service state
        setSelectedService(service);
        console.log('Updated selectedService state to:', service);
        
        // Add a new service-staff assignment with no staff selected initially
        setServiceStaffAssignments(prevAssignments => {
          // Check if this service is already in assignments to prevent duplicates
          const isAlreadyAssigned = prevAssignments.some(assignment => assignment.service.id === service.id);
          if (isAlreadyAssigned) {
            // Update the existing assignment
            return prevAssignments.map(assignment => 
              assignment.service.id === service.id ? { ...assignment, service } : assignment
            );
          }
          const newAssignment = { service, staff: null };
          console.log('Adding new service-staff assignment:', newAssignment);
          return [
            ...prevAssignments,
            newAssignment
          ];
        });
        return [...prev, service];
      }
    });
  };

  // Handle staff selection with automatic navigation to Step 3
  const handleSelectStaff = (staff: StaffMember | null) => {
    setSelectedStaff(staff);
    // Note: Navigation to Step 3 is now handled in Step2_Staff component
  };

  const renderStepContent = () => {
    try {
      // Use multi-service flow if more than one service is selected
      // Also use multi-service flow if there are service-staff assignments (which indicates we're in multi-service workflow)
      const isMultiService = selectedServices.length > 1 || serviceStaffAssignments.length > 0;
      
      // Add debugging
      console.log('renderStepContent - Current state:', { 
        currentStep, 
        isMultiService, 
        selectedServicesLength: selectedServices.length,
        serviceStaffAssignmentsLength: serviceStaffAssignments.length,
        selectedService: selectedService?.id,
        serviceStaffDataLoading: serviceStaffData?.isLoading,
        serviceStaffDataError: serviceStaffData?.error,
        serviceStaffData: serviceStaffData
      });
      
      // Add a simple test to ensure we always return something
      if (currentStep < 1 || currentStep > 3) {
        console.warn('Invalid currentStep value:', currentStep);
        return <div className="w-full py-12 text-center">Invalid step: {currentStep}</div>;
      }
      
      // Add a simple test to see if we're getting to this point
      console.log('renderStepContent - About to render step:', currentStep);
      
      // Check if we have services data
      if (!services || services.length === 0) {
        return (
          <div className="w-full py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-muted-foreground">No services available at this salon.</p>
              <Button onClick={() => window.location.reload()}>Reload</Button>
            </div>
          </div>
        );
      }
      
      switch (currentStep) {
          case 1:
              console.log('Rendering Step1_Services');
              return (
                <Step1_Services 
                  selectedServices={selectedServices}
                  onSelectService={handleSelectService}
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
                  services={services}
                  servicesByCategory={servicesByCategory}
                  categories={categories}
                  isLoading={false} // Already handled at page level
                  error={null}
                  onServiceSelect={setSelectedService} // Pass the callback to set selected service
                />
              );
          case 2:
              console.log('Rendering Step2 - isMultiService:', isMultiService);
              if (isMultiService) {
                  // Multi-service flow
                  console.log('Rendering Step2_MultiService');
                  // Check if we have staff data
                  if (!staff || staff.length === 0) {
                    return (
                      <div className="w-full py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <AlertCircle className="h-8 w-8 text-destructive" />
                          <p className="text-muted-foreground">No staff available at this salon.</p>
                          <Button onClick={() => window.location.reload()}>Reload</Button>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <Step2_MultiService 
                      serviceStaffAssignments={serviceStaffAssignments}
                      onUpdateAssignment={(serviceId: string, staff: StaffMember | null) => {
                        setServiceStaffAssignments(prev => 
                          prev.map(assignment => 
                            assignment.service.id === serviceId 
                              ? { ...assignment, staff } 
                              : assignment
                          )
                        );
                      }}
                      currentStep={currentStep}
                      setCurrentStep={setCurrentStep}
                      staff={staff}
                      isLoading={false}
                      error={null}
                      onNext={() => setCurrentStep(3)}
                    />
                  );
              } else {
                  // Single service flow
                  console.log('Rendering Step2_Staff');
                  
                  // Check if serviceStaffData is still loading
                  if (serviceStaffData?.isLoading) {
                    return (
                      <div className="w-full">
                        <div className="flex items-center justify-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading staff members...</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // Check if there's an error with serviceStaffData
                  if (serviceStaffData?.error) {
                    return (
                      <div className="w-full">
                        <div className="flex items-center justify-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                            <p className="text-muted-foreground">Unable to load staff members. Please try again.</p>
                            <Button onClick={() => window.location.reload()}>Reload</Button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // Check if we have staff data
                  const staffData = serviceStaffData.staff || [];
                  if (!staffData || staffData.length === 0) {
                    return (
                      <div className="w-full py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <AlertCircle className="h-8 w-8 text-destructive" />
                          <p className="text-muted-foreground">No staff available for this service.</p>
                          <Button onClick={() => window.location.reload()}>Reload</Button>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <Step2_Staff 
                      selectedStaff={selectedStaff}
                      onSelectStaff={handleSelectStaff}
                      currentStep={currentStep}
                      setCurrentStep={setCurrentStep}
                      staff={staffData}
                      isLoading={serviceStaffData.isLoading || false}
                      error={serviceStaffData.error}
                      selectedService={selectedService}
                      onStaffSelect={setSelectedStaff}
                    />
                  );
              }
          case 3:
              console.log('Rendering Step3 - isMultiService:', isMultiService);
              if (isMultiService) {
                  // Multi-service time slot selection
                  console.log('Rendering Step3_MultiServiceTimeSlot');
                  // Check if we have staff data
                  if (!staff || staff.length === 0) {
                    return (
                      <div className="w-full py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <AlertCircle className="h-8 w-8 text-destructive" />
                          <p className="text-muted-foreground">No staff available at this salon.</p>
                          <Button onClick={() => window.location.reload()}>Reload</Button>
                        </div>
                      </div>
                    );
                  }
                  // Check if we have working hours data
                  if (!workingHours || workingHours.length === 0) {
                    return (
                      <div className="w-full py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <AlertCircle className="h-8 w-8 text-destructive" />
                          <p className="text-muted-foreground">Working hours not configured for this salon.</p>
                          <Button onClick={() => window.location.reload()}>Reload</Button>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <Step3_MultiServiceTimeSlot 
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                      selectedTime={selectedTime}
                      onSelectTime={setSelectedTime}
                      currentStep={currentStep}
                      setCurrentStep={setCurrentStep}
                      serviceStaffAssignments={serviceStaffAssignments}
                      staff={staff}
                      workingHours={workingHours}
                      isLoading={false}
                      error={null}
                      selectedServices={selectedServices}
                      vendorId={salonId as string}
                    />
                  );
              } else {
                  // Single service time slot selection
                  console.log('Rendering Step3_TimeSlot');
                  
                  // Check if serviceStaffData is still loading
                  if (serviceStaffData?.isLoading) {
                    return (
                      <div className="w-full">
                        <div className="flex items-center justify-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading time slots...</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // Check if there's an error with serviceStaffData
                  if (serviceStaffData?.error) {
                    return (
                      <div className="w-full">
                        <div className="flex items-center justify-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                            <p className="text-muted-foreground">Unable to load time slots. Please try again.</p>
                            <Button onClick={() => window.location.reload()}>Reload</Button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // Check if we have staff data
                  const staffData = serviceStaffData.staff || [];
                  if (!staffData || staffData.length === 0) {
                    return (
                      <div className="w-full py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <AlertCircle className="h-8 w-8 text-destructive" />
                          <p className="text-muted-foreground">No staff available for this service.</p>
                          <Button onClick={() => window.location.reload()}>Reload</Button>
                        </div>
                      </div>
                    );
                  }
                  
                  // Check if we have working hours data
                  if (!workingHours || workingHours.length === 0) {
                    return (
                      <div className="w-full py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <AlertCircle className="h-8 w-8 text-destructive" />
                          <p className="text-muted-foreground">Working hours not configured for this salon.</p>
                          <Button onClick={() => window.location.reload()}>Reload</Button>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <Step3_TimeSlot 
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                      selectedTime={selectedTime}
                      onSelectTime={setSelectedTime}
                      currentStep={currentStep}
                      setCurrentStep={setCurrentStep}
                      selectedStaff={selectedStaff}
                      onSelectStaff={setSelectedStaff}
                      staff={staffData}
                      workingHours={workingHours}
                      isLoading={serviceStaffData.isLoading || false}
                      error={serviceStaffData.error}
                      vendorId={salonId as string}
                      selectedService={selectedService}
                    />
                  );
              }
          default:
              console.log('Rendering default case - step not found');
              return <div className="w-full py-12 text-center">Step not found: {currentStep}</div>;
      }
    } catch (error) {
      console.error('Error rendering step content:', error);
      return (
        <div className="w-full">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-muted-foreground">Unable to load booking step. Please try again.</p>
              <Button onClick={() => window.location.reload()}>Reload Page</Button>
            </div>
          </div>
        </div>
      );
    }
  };

  // Calculate price breakdown when selected services change
  useEffect(() => {
    const calculatePrices = async () => {
      // Validate that we have valid services before calculating prices
      if (selectedServices && selectedServices.length > 0) {
        // Filter out any invalid services
        const validServices = selectedServices.filter(service => 
          service && service.id && (service.price !== undefined && service.price !== null) && !isNaN(parseFloat(String(service.price)))
        );
        
        if (validServices.length === 0) {
          console.warn('No valid services found for price calculation');
          setPriceBreakdown(null);
          return;
        }
        
        try {
          console.log('Calculating prices for services:', validServices);
          console.log('Current offer:', offer);
          console.log('Tax fee settings:', taxFeeSettings);
          // Call calculateBookingAmount and await the result
          const breakdown = await calculateBookingAmount(validServices, offer, taxFeeSettings);
          console.log('Price breakdown calculated:', breakdown);
          setPriceBreakdown(breakdown);
        } catch (error) {
          console.error('Error calculating prices:', error);
          // Set a default price breakdown to prevent blank screen
          const subtotal = validServices.reduce((sum, service) => {
            const price = service.discountedPrice !== null && service.discountedPrice !== undefined ? 
              parseFloat(service.discountedPrice) : 
              parseFloat(service.price || '0');
            return sum + price;
          }, 0);
          
          const defaultBreakdown = {
            subtotal: subtotal,
            discountAmount: 0,
            amountAfterDiscount: subtotal,
            platformFee: 0,
            serviceTax: 0,
            vendorServiceTax: 0,
            totalTax: 0,
            finalTotal: subtotal,
            taxFeeSettings: null
          };
          setPriceBreakdown(defaultBreakdown);
        }
      } else {
        setPriceBreakdown(null);
      }
    };

    calculatePrices();
  }, [selectedServices, offer, taxFeeSettings]);

  // Check for pre-selected service from salon details page
  useEffect(() => {
    console.log('Pre-selected service useEffect running with:', { 
      hasWindow: typeof window !== 'undefined',
      servicesLength: services?.length,
      isLoading,
      hasStoredService: typeof window !== 'undefined' ? sessionStorage.getItem('selectedService') : null,
      currentStep
    });
    
    if (typeof window !== 'undefined' && services && services.length > 0 && !isLoading) {
      const storedService = sessionStorage.getItem('selectedService');
      console.log('Checking for stored service:', storedService);
      
      if (storedService) {
        try {
          const serviceData = JSON.parse(storedService);
          console.log('Found pre-selected service in sessionStorage:', serviceData);
          console.log('Available services:', services);
          
          // Find the corresponding service in the loaded services
          // Check multiple possible ID fields since the data might have different structures
          let service = services.find(s => 
            s.id === (serviceData.id || serviceData._id) || 
            s.id === serviceData._id ||
            s.id === serviceData.id
          );
          
          console.log('Found service match by ID:', service);
          
          // If we still haven't found a match, try matching by name as a fallback
          if (!service) {
            service = services.find(s => s.name === serviceData.name);
            console.log('Fallback - Found service match by name:', service);
          }
          
          if (service) {
            console.log('Found matching service in loaded services:', service);
            // Select the service
            handleSelectService(service);
            // Make sure we're on step 1
            if (currentStep !== 1) {
              console.log('Setting current step to 1');
              setCurrentStep(1);
            }
          } else {
            console.warn('Could not find matching service in loaded services, creating new service object');
            console.log('Service data keys:', Object.keys(serviceData));
            // If we can't find the service by ID, try to create a service object from the stored data
            const newService: Service = {
              id: serviceData.id || serviceData._id || '',
              name: serviceData.name || '',
              duration: serviceData.duration || '60 min',
              price: String(serviceData.price || 0),
              discountedPrice: serviceData.discountedPrice !== undefined && serviceData.discountedPrice !== null ? 
                String(serviceData.discountedPrice) : null,
              category: serviceData.category || 'General',
              image: serviceData.image,
              description: serviceData.description,
              staff: serviceData.staff || []
            };
            
            // Select the service
            handleSelectService(newService);
            // Make sure we're on step 1
            if (currentStep !== 1) {
              console.log('Setting current step to 1');
              setCurrentStep(1);
            }
          }
          
          // Remove the stored service to prevent it from being processed again
          sessionStorage.removeItem('selectedService');
        } catch (error) {
          console.error('Error parsing selected service from sessionStorage:', error);
          sessionStorage.removeItem('selectedService');
        }
      }
    }
  }, [salonId, services, isLoading, currentStep]); // Run when salonId, services, isLoading, or currentStep change

  // Additional useEffect to handle service selection when services are first loaded
  useEffect(() => {
    console.log('Services loaded useEffect running with:', { 
      servicesLength: services?.length,
      isLoading,
      selectedServicesLength: selectedServices.length
    });
    
    // Only run this if we haven't already selected a service and there are services loaded
    if (services && services.length > 0 && !isLoading && selectedServices.length === 0) {
      const storedService = typeof window !== 'undefined' ? sessionStorage.getItem('selectedService') : null;
      console.log('Checking for stored service in services loaded effect:', storedService);
      
      if (storedService) {
        // Trigger the main useEffect by ensuring all conditions are met
        // This will cause the main useEffect to run again
        console.log('Services loaded and stored service found, will trigger selection in main useEffect');
      }
    }
  }, [services, isLoading, selectedServices.length]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
       <header className="flex-shrink-0 sticky top-0 flex items-center justify-between h-20 px-6 md:px-12 border-b z-20 bg-background/80 backdrop-blur-sm">
        <Button variant="ghost" onClick={handlePrevStep} className="flex items-center gap-2">
          <ChevronLeft className="mr-1 h-5 w-5" />
          {currentStep === 1 ? 'Back' : 'Back'}
        </Button>
        <div className="font-bold text-lg font-headline bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            GlowVita
        </div>
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <X className="h-5 w-5" />
        </Button>
      </header>
      <div className="flex-1 grid lg:grid-cols-12 gap-8 px-8">
        <main className="lg:col-span-7 xl:col-span-8 overflow-y-auto no-scrollbar">
            <div className="max-w-4xl mx-auto pb-24 lg:pb-8 pt-8">
                {/* Debug info
                <div className="mb-4 p-3 bg-secondary/30 rounded-lg text-sm">
                  <div>Current step: {currentStep}</div>
                  <div>Is loading: {isLoading ? 'true' : 'false'}</div>
                  <div>Has error: {error ? 'true' : 'false'}</div>
                  <div>Services length: {services?.length || 0}</div>
                  <div>Staff length: {staff?.length || 0}</div>
                  <div>Selected services: {selectedServices.length}</div>
                </div> */}
                {renderStepContent()}
            </div>
        </main>
        
        <aside className="hidden lg:block lg:col-span-5 xl:col-span-4 py-8">
          <div className="sticky top-28">
            <BookingSummary 
              selectedServices={selectedServices}
              selectedStaff={selectedStaff}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onNextStep={handleNextStep}
              currentStep={currentStep}
              salonInfo={salonInfo}
              serviceStaffAssignments={serviceStaffAssignments}
              priceBreakdown={priceBreakdown}
            />
          </div>
        </aside>
      </div>

      <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-30">
        <BookingSummary 
            selectedServices={selectedServices}
            selectedStaff={selectedStaff}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onNextStep={handleNextStep}
            currentStep={currentStep}
            isMobileFooter={true}
            salonInfo={salonInfo}
            serviceStaffAssignments={serviceStaffAssignments}
            priceBreakdown={priceBreakdown}
        />
      </div>

      <Dialog open={isConfirmationModalOpen} onOpenChange={setIsConfirmationModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Confirm Your Booking</DialogTitle>
            <DialogDescription>Review your appointment details before confirming.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
              <div className="space-y-4">
                  {/* Salon Info Card */}
                  <Card className="bg-background/80">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Scissors className="h-5 w-5 text-primary" />
                        {salonInfo?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {salonInfo?.address}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Offer Code Section */}
                  <Card className="bg-background/80">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        Apply Offer
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Offer Code Input with Dropdown */}
                      <div className="relative">
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <input
                              id="offer-input"
                              type="text"
                              placeholder="Enter offer code or select from dropdown"
                              value={offerCode}
                              onChange={(e) => setOfferCode(e.target.value)}
                              onFocus={() => setShowOfferDropdown(true)}
                              className="w-full px-3 py-2 border rounded-md text-sm pr-10"
                            />
                            <button 
                              type="button"
                              onClick={() => setShowOfferDropdown(!showOfferDropdown)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                            >
                              <Search className="h-4 w-4" />
                            </button>
                          </div>
                          <Button onClick={handleApplyOffer} size="sm">Apply</Button>
                        </div>

                        {/* Offer Dropdown */}
                        {showOfferDropdown && (
                          <div id="offer-dropdown" className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                            <div className="p-2 border-b">
                              <input
                                type="text"
                                placeholder="Search offers..."
                                value={offerSearchTerm}
                                onChange={(e) => setOfferSearchTerm(e.target.value)}
                                className="w-full px-2 py-1 text-sm border rounded"
                              />
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {isOffersLoading ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                  Loading offers...
                                </div>
                              ) : filteredOffers.length > 0 ? (
                                filteredOffers.map((offer: { _id: string; code: string; type: string; value: number }) => (
                                  <div
                                    key={offer._id}
                                    className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                    onClick={() => handleSelectOffer(offer)}
                                  >
                                    <div className="font-medium">{offer.code}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {offer.type === 'percentage' ? `${offer.value}% off` : `₹${offer.value} off`}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                  No offers found
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {offer && (
                        <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                          <div className="text-sm text-green-700">
                            <div>Offer applied: {offer.code}</div>
                            <div className="font-medium">
                              {offer.type === 'percentage' ? `${offer.value}% off` : `₹${offer.value} off`}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleClearOffer}
                            className="text-green-700 hover:text-green-900 hover:bg-green-100"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Appointment Details Card */}
                  <Card className="bg-background/80">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Appointment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">Date:</span> {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">Start Time:</span> {selectedTime}
                      </div>
                      {serviceSchedule.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">End Time:</span> {serviceSchedule[serviceSchedule.length - 1].endTime}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Service Schedule Card */}
                  <Card className="bg-background/80">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Service Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {serviceSchedule.map((schedule, index) => (
                        <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                          <div>
                            <div className="font-semibold">{schedule.service.name}</div>
                            <div className="text-muted-foreground text-xs">
                              with {schedule.staff ? schedule.staff.name : 'Any Professional'} | {schedule.startTime} - {schedule.endTime}
                            </div>
                          </div>
                          <div className="text-right">
                            {schedule.service.discountedPrice !== null && schedule.service.discountedPrice !== undefined && schedule.service.discountedPrice !== schedule.service.price ? (
                              <>
                                <div className="flex items-center justify-end gap-2">
                                  <span className="text-muted-foreground line-through text-sm">
                                    ₹{schedule.service.price}
                                  </span>
                                  <span className="font-semibold">
                                    ₹{schedule.service.discountedPrice}
                                  </span>
                                </div>
                                <div className="text-xs text-green-600 font-medium">
                                  {(() => {
                                    const originalPrice = parseFloat(schedule.service.price);
                                    const discountedPrice = parseFloat(schedule.service.discountedPrice || '0');
                                    if (originalPrice > 0) {
                                      return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
                                    }
                                    return 0;
                                  })()}% OFF
                                </div>
                              </>
                            ) : (
                              <div className="font-semibold">
                                ₹{schedule.service.price}
                              </div>
                            )}
                            <div className="text-muted-foreground text-xs">
                              {schedule.duration} min
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/10 border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-primary">Total Amount</span>
                          <span className="text-2xl font-bold text-primary">
                            ₹{priceBreakdown?.finalTotal.toFixed(2) || selectedServices.reduce((acc, s) => {
                              const price = s.discountedPrice !== null && s.discountedPrice !== undefined ? 
                                parseFloat(s.discountedPrice) : 
                                parseFloat(s.price || '0');
                              return acc + price;
                            }, 0).toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                  </Card>
              </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmationModalOpen(false)}>Edit Booking</Button>
            <Button onClick={handleFinalBookingConfirmation}>Confirm & Pay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Choose Payment Method</DialogTitle>
            <DialogDescription className="text-center">Select how you'd like to pay for your appointment.</DialogDescription>
          </DialogHeader>
          <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className="text-center p-6 cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-200"
              onClick={() => handlePaymentMethodSelection('Pay at Salon')}
            >
              <Wallet className="h-10 w-10 mx-auto text-primary mb-3" />
              <h3 className="font-semibold text-lg">Pay at Salon</h3>
              <p className="text-sm text-muted-foreground">Pay with cash or card at your appointment.</p>
            </Card>
            <Card 
              className="text-center p-6 cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-200"
              onClick={() => handlePaymentMethodSelection('Pay Online')}
            >
              <CreditCard className="h-10 w-10 mx-auto text-primary mb-3" />
              <h3 className="font-semibold text-lg">Pay Online</h3>
              <p className="text-sm text-muted-foreground">Pay now with our secure online gateway.</p>
            </Card>
            <Card 
              className="text-center p-6 cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-200"
              onClick={() => handlePaymentMethodSelection('Pay Later')}
            >
              <Hourglass className="h-10 w-10 mx-auto text-primary mb-3" />
              <h3 className="font-semibold text-lg">Pay Later</h3>
              <p className="text-sm text-muted-foreground">Pay after your service is completed.</p>
            </Card>
          </div>
          {isCreatingAppointment && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating your appointments...</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BookingPageWrapper() {
  console.log('BookingPageWrapper - Component rendered');
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingPageContent />
    </Suspense>
  );
}