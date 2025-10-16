"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { ChevronLeft, X, Scissors, User, Calendar, Clock, MapPin, Star, ChevronUp, ChevronDown, Wallet, CreditCard, Hourglass, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@repo/ui/button";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { Step1_Services } from "@/components/booking/Step1_Services";
import { Step2_Staff } from "@/components/booking/Step2_Staff";
import { Step3_TimeSlot } from "@/components/booking/Step3_TimeSlot";
import { Step2_MultiService } from "@/components/booking/Step2_MultiService";
import { Step3_MultiServiceTimeSlot } from "@/components/booking/Step3_MultiServiceTimeSlot";
import { useRouter, useParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/card';
import { Separator } from '@repo/ui/separator';
import { format } from 'date-fns';
import { useBookingData, Service, StaffMember, ServiceStaffAssignment, calculateTotalDuration, convertDurationToMinutes } from '@/hooks/useBookingData';
import { useCreatePublicAppointmentMutation } from '@repo/store/api';

function BookingPageContent() {
  const router = useRouter();
  const params = useParams();
  const { salonId } = params;

  // State for tracking the selected service
  const [selectedService, setSelectedService] = useState<Service | null>(null);

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

  // Fetch service-specific staff data when a service is selected
  const serviceStaffData = useBookingData(salonId as string, selectedService?.id);

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

  // Mutation for creating appointments
  const [createAppointment, { isLoading: isCreatingAppointment }] = useCreatePublicAppointmentMutation();

  // Set to `true` to test the modal, `false` to test the redirect
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Calculate service schedule when selectedTime changes
  useEffect(() => {
    if (selectedTime) {
      console.log("Recalculating service schedule...");
      console.log("Selected time:", selectedTime);
      console.log("Service staff assignments:", serviceStaffAssignments);
      console.log("Selected services:", selectedServices);
      console.log("Selected staff:", selectedStaff);
      console.log("Is single service?", selectedServices.length === 1);
      
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
      if (selectedServices.length === 1 && serviceStaffAssignments.length === 0) {
        console.log("Processing SINGLE SERVICE booking");
        const service = selectedServices[0];
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
        
        // Group services by staff member to determine the sequence
        const staffServiceMap: { [key: string]: { staff: StaffMember; services: Service[] } } = {};
        
        for (const assignment of serviceStaffAssignments) {
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
    }
  }, [selectedTime, serviceStaffAssignments, selectedServices, selectedStaff]);

  // Check for pre-selected service from sessionStorage
  useEffect(() => {
    if (services.length > 0) {
      try {
        const storedService = sessionStorage.getItem('selectedService');
        if (storedService) {
          const serviceData = JSON.parse(storedService);
          // Find the service in our fetched services by name
          const matchingService = services.find((s: Service) => s.name === serviceData.name);
          if (matchingService) {
            setSelectedServices([matchingService]);
            setSelectedService(matchingService); // Set the selected service
            // Clear the stored service after using it
            sessionStorage.removeItem('selectedService');
          }
        }
      } catch (error) {
        console.error("Failed to parse service from sessionStorage:", error);
        // Clear invalid data
        sessionStorage.removeItem('selectedService');
      }
    }
  }, [services]);

  // Loading state for the entire page
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
        <header className="flex-shrink-0 sticky top-0 flex items-center justify-between h-20 px-6 md:px-12 border-b z-20 bg-background/80 backdrop-blur-sm">
          <Button variant="ghost" onClick={() => window.history.back()} className="flex items-center gap-2">
            <ChevronLeft className="mr-1 h-5 w-5" />
            Back
          </Button>
          <div className="font-bold text-lg font-headline bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            GlowVita
          </div>
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <X className="h-5 w-5" />
          </Button>
        </header>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state for the entire page
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
        <header className="flex-shrink-0 sticky top-0 flex items-center justify-between h-20 px-6 md:px-12 border-b z-20 bg-background/80 backdrop-blur-sm">
          <Button variant="ghost" onClick={() => window.history.back()} className="flex items-center gap-2">
            <ChevronLeft className="mr-1 h-5 w-5" />
            Back
          </Button>
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <X className="h-5 w-5" />
          </Button>
        </header>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-lg text-muted-foreground">Unable to load salon data</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleNextStep = () => {
    // For multi-service bookings, validate assignments before proceeding
    const isMultiService = selectedServices.length > 1;
    
    if (currentStep < 3) {
      // For step 2 in multi-service flow, validate assignments
      if (currentStep === 2 && isMultiService) {
        // Check if all services have staff assigned (or "Any Professional" is acceptable)
        const allAssigned = serviceStaffAssignments.every(assignment => assignment.staff !== undefined);
        if (allAssigned) {
          setCurrentStep(currentStep + 1);
        } else {
          alert('Please assign staff to all services or select "Any Professional".');
          return;
        }
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      if (isAuthenticated) {
        setIsConfirmationModalOpen(true);
      } else {
        router.push('/client-login');
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

  const handleFinalBookingConfirmation = () => {
    // Log the final booking data for debugging
    const totalDuration = calculateTotalDuration(selectedServices);
    const bookingData = {
      selectedServices,
      serviceStaffAssignments,
      selectedStaff,
      selectedDate,
      selectedTime,
      totalDuration,
      salonInfo,
      serviceSchedule
    };
    
    console.log("=== FINAL BOOKING DATA ===");
    console.log("Booking Details:", JSON.stringify(bookingData, null, 2));
    
    // Log detailed service-staff assignments with times
    console.log("Service Schedule:");
    serviceSchedule.forEach((schedule, index) => {
      console.log(`  ${index + 1}. Service: ${schedule.service.name}`);
      console.log(`     Staff: ${schedule.staff ? schedule.staff.name : 'Any Professional'}`);
      console.log(`     Time: ${schedule.startTime} - ${schedule.endTime}`);
      console.log(`     Duration: ${schedule.duration} minutes`);
      console.log(`     Price: ₹${schedule.service.price}`);
    });
    
    // Log time slot information
    console.log("Appointment Details:");
    console.log(`  Date: ${format(selectedDate, 'EEEE, MMMM d, yyyy')}`);
    console.log(`  Start Time: ${selectedTime}`);
    if (serviceSchedule.length > 0) {
      const endTime = serviceSchedule[serviceSchedule.length - 1].endTime;
      console.log(`  End Time: ${endTime}`);
    }
    console.log(`  Total Duration: ${totalDuration} minutes`);
    
    // Log total amount
    const totalAmount = selectedServices.reduce((acc, s) => acc + parseFloat(s.price), 0);
    console.log(`  Total Amount: ₹${totalAmount.toFixed(2)}`);
    
    console.log("==========================");
    
    // Check if service schedule is properly calculated
    if (serviceSchedule.length === 0 && selectedTime) {
      console.warn("Service schedule is empty but selectedTime is set. This might indicate a calculation issue.");
    }
    
    setIsConfirmationModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentMethodSelection = async (method: string) => {
    console.log("=== PAYMENT METHOD SELECTION ===");
    console.log("Selected payment method:", method);
    console.log("Service schedule length:", serviceSchedule.length);
    console.log("Service schedule:", serviceSchedule);
    
    // Prevent multiple calls
    if (isCreatingAppointment) {
      console.log("Appointment creation already in progress, skipping...");
      return;
    }
    
    try {
      // For multiple services, we'll create one appointment with details of all services in serviceItems
      if (serviceSchedule.length > 0) {
        console.log("Creating appointment with method:", method);
        
        // Use the first service as the primary service for the appointment
        const primarySchedule = serviceSchedule[0];
        console.log("Primary schedule:", primarySchedule);
        
        // Format the appointment date with the correct time
        const appointmentDate = new Date(selectedDate);
        const [hours, minutes] = primarySchedule.startTime.split(':').map(Number);
        appointmentDate.setHours(hours, minutes, 0, 0);
        console.log("Appointment date:", appointmentDate);
        
        // Create service items for all services
        const serviceItems = serviceSchedule.map(schedule => ({
          service: schedule.service.id,
          serviceName: schedule.service.name,
          staff: schedule.staff ? schedule.staff.id : null,
          staffName: schedule.staff ? schedule.staff.name : "Any Professional",
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          duration: schedule.duration,
          amount: parseFloat(schedule.service.price)
        }));
        
        console.log("Service items:", serviceItems);
        
        // Calculate total amount for all services
        const totalAmount = serviceSchedule.reduce((sum, schedule) => sum + parseFloat(schedule.service.price), 0);
        console.log("Total amount:", totalAmount);
        
        // Calculate total duration
        const totalDuration = serviceSchedule.reduce((sum, schedule) => sum + schedule.duration, 0);
        console.log("Total duration:", totalDuration);
        
        // Use the last service's end time as the appointment end time
        const endTime = serviceSchedule[serviceSchedule.length - 1].endTime;
        console.log("End time:", endTime);
        
        // Handle staff field - it can now be null for "Any Professional"
        let staffId = primarySchedule.staff ? primarySchedule.staff.id : null;
        let staffName = primarySchedule.staff ? primarySchedule.staff.name : "Any Professional";
        console.log("Staff ID:", staffId, "Staff Name:", staffName);
        
        // If no staff is assigned, we might need to find a default staff or handle this differently
        // For now, let's use the first staff member from the salon if available
        if (!staffId && staff.length > 0) {
          staffId = staff[0].id;
          staffName = staff[0].name;
          console.log("Using default staff:", staffId, staffName);
        }
        
        // Prepare appointment data - ensure all required fields are provided
        const appointmentData = {
          vendorId: salonId,
          clientName: "Web Customer", // In a real implementation, this would come from user authentication
          service: primarySchedule.service.id,
          serviceName: primarySchedule.service.name,
          staff: staffId, // This can now be null
          staffName: staffName,
          date: appointmentDate,
          startTime: primarySchedule.startTime,
          endTime: endTime,
          duration: totalDuration,
          amount: totalAmount,
          totalAmount: totalAmount,
          status: "scheduled",
          notes: "Multi-service appointment",
          serviceItems: serviceItems,
          isMultiService: serviceSchedule.length > 1
        };
        
        console.log("Final appointment data:", appointmentData);
        
        // Create the appointment in the database
        console.log("Calling createAppointment...");
        const result = await createAppointment(appointmentData).unwrap();
        console.log("Appointment created successfully:", result);
        
        // Close the payment modal
        setIsPaymentModalOpen(false);
        
        // Show confirmation message
        alert(`Booking Confirmed! Payment Method: ${method}\nAppointment created successfully with ${serviceSchedule.length} services.`);
        
        // Redirect to a confirmation page or back to the salon page
        router.push(`/salon/${salonId}`);
      } else {
        console.log("No service schedule found, skipping appointment creation");
      }
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      // Check if it's a validation error from the API
      if (error?.data?.message) {
        alert(`Failed to create appointment: ${error.data.message}`);
      } else {
        alert("Failed to create appointment. Please try again.");
      }
    }
  };
  
  const handleSelectService = (service: Service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
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
        // When selecting a service, set it as the selected service only if no service is currently selected
        // For multiple services, we don't want to override the selectedService state
        if (!selectedService) {
          setSelectedService(service);
        }
        // Add a new service-staff assignment with no staff selected initially
        setServiceStaffAssignments(prevAssignments => {
          // Check if this service is already in assignments to prevent duplicates
          const isAlreadyAssigned = prevAssignments.some(assignment => assignment.service.id === service.id);
          if (isAlreadyAssigned) {
            return prevAssignments;
          }
          return [
            ...prevAssignments,
            { service, staff: null }
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
    // Use multi-service flow if more than one service is selected
    const isMultiService = selectedServices.length > 1;
    
    switch (currentStep) {
        case 1:
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
            if (isMultiService) {
                // Multi-service flow
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
                return (
                  <Step2_Staff 
                    selectedStaff={selectedStaff}
                    onSelectStaff={handleSelectStaff}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    staff={serviceStaffData.staff} // Use service-specific staff data
                    isLoading={serviceStaffData.isLoading} // Use service-specific loading state
                    error={serviceStaffData.error} // Use service-specific error state
                    selectedService={selectedService} // Pass the selected service
                    onStaffSelect={setSelectedStaff} // Pass the callback to set selected staff
                  />
                );
            }
        case 3:
            if (isMultiService) {
                // Multi-service time slot selection
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
                    staff={serviceStaffData.staff} // Use service-specific staff data
                    workingHours={workingHours}
                    isLoading={serviceStaffData.isLoading} // Use service-specific loading state
                    error={serviceStaffData.error} // Use service-specific error state
                    vendorId={salonId as string}
                    selectedService={selectedService}
                  />
                );
            }
        default:
            return <div>Step not found</div>;
    }
  };

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
        />
      </div>

      <Dialog open={isConfirmationModalOpen} onOpenChange={setIsConfirmationModalOpen}>
        <DialogContent className="sm:max-w-4xl bg-secondary/80 backdrop-blur-md border-border/30 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Confirm Your Booking</DialogTitle>
              <DialogDescription className="text-center">
                Please review your appointment details before confirming.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 grid md:grid-cols-2 gap-6 max-h-[60vh] md:max-h-none overflow-y-auto">
                <Card className="bg-background/80 flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Scissors className="h-5 w-5 text-primary" />
                      Selected Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto space-y-2">
                    {selectedServices.map(s => (
                      <div key={s.name} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                        <span className="text-muted-foreground">{s.name}</span>
                        <span className="font-semibold">₹{s.price}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="space-y-4">
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
                              <div className="font-semibold">₹{schedule.service.price}</div>
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
                              ₹{selectedServices.reduce((acc, s) => acc + parseFloat(s.price), 0).toFixed(2)}
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
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingPageContent />
    </Suspense>
  );
}