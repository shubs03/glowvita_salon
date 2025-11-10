"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetDoctorWorkingHoursQuery, useCreateConsultationMutation } from '@repo/store/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Calendar, User, Clock, CheckCircle, Home, Eye, ChevronRight, Loader2 } from "lucide-react";
import { cn } from '@repo/ui/cn';
import { TimeSlotSelection, BasicDetailsForm, NotificationConfirmation, AppointmentConfirmation } from './components';

// Types for our consultation data
export type ConsultationData = {
  // Time Slot Selection
  selectedDate?: string;
  selectedTime?: string;
  selectedDoctorId?: string;
  selectedDoctorName?: string;
  selectedDoctorSpecialty?: string;
  consultationFee?: number;
  doctorImage?: string;
  doctorRating?: number;
  doctorReviewCount?: number;
  doctorClinic?: string;
  doctorAddress?: string;
  
  // Basic Details
  patientName: string;
  phoneNumber: string;
  email?: string;
  reason: string;
  
  // Notification Preferences
  whatsappNotifications: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  
  // Confirmation
  appointmentId?: string;
};

// Breadcrumb Navigation Component (matching video consultation style)
const Breadcrumb = ({ currentStep, setCurrentStep }: { currentStep: number; setCurrentStep: (step: number) => void; }) => {
  const steps = ['Select Time Slot', 'Basic Details', 'Notifications', 'Confirmation'];
  return (
    <nav className="flex items-center text-sm font-medium text-muted-foreground mb-6">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <button
            onClick={() => currentStep > index + 1 && setCurrentStep(index + 1)}
            className={cn(
              "transition-colors",
              currentStep > index + 1 ? "hover:text-primary cursor-pointer" : "cursor-default",
              currentStep === index + 1 && "text-primary font-semibold"
            )}
            disabled={currentStep < index + 1}
          >
            {step}
          </button>
          {index < steps.length - 1 && <ChevronRight className="h-4 w-4 mx-2" />}
        </div>
      ))}
    </nav>
  );
};

export default function PhysicalConsultationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [doctorId, setDoctorId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [createConsultation, { isLoading: isCreating, isSuccess, isError, error }] = useCreateConsultationMutation();
  
  // Initialize doctor data from URL params
  const [consultationData, setConsultationData] = useState<ConsultationData>({
    patientName: '',
    phoneNumber: '',
    email: '',
    reason: '',
    whatsappNotifications: true,
    smsNotifications: false,
    emailNotifications: false,
  });

  // Parse URL params and set doctor data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const encoded = urlParams.get('data');
      console.log('🔍 URL encoded data:', encoded);
      
      if (encoded) {
        try {
          const decoded = JSON.parse(atob(encoded));
          console.log('📦 Decoded doctor data:', decoded);
          console.log('🆔 Doctor ID from decoded:', decoded.id);
          
          const doctorParams = {
            selectedDoctorId: decoded.id || '',
            selectedDoctorName: decoded.name || '',
            selectedDoctorSpecialty: decoded.specialty || '',
            consultationFee: decoded.fee,
            doctorImage: decoded.image || '',
            doctorRating: decoded.rating,
            doctorReviewCount: decoded.reviews,
            doctorClinic: decoded.clinic || '',
            doctorAddress: decoded.address || ''
          };
          
          console.log('✅ Final doctorId:', decoded.id);
          console.log('✅ Doctor params:', doctorParams);
          
          setDoctorId(decoded.id || '');
          setConsultationData(prev => ({ ...prev, ...doctorParams }));
          setIsInitialized(true);
        } catch (e) {
          console.error('❌ Error decoding doctor data:', e);
          setIsInitialized(true);
        }
      } else {
        console.warn('⚠️ No encoded data found in URL');
        setIsInitialized(true);
      }
    }
  }, []); // Run only once on mount

  // Redirect to doctors page if no doctor data after initialization
  useEffect(() => {
    if (isInitialized && !doctorId) {
      console.warn('❌ No doctor ID found, redirecting to doctors page');
      router.push('/doctors');
    }
  }, [isInitialized, doctorId, router]);

  const { data: workingHours, isLoading: isWorkingHoursLoading, isError: isWorkingHoursError } = useGetDoctorWorkingHoursQuery(doctorId, { skip: !doctorId });

  useEffect(() => {
    if (doctorId && workingHours) {
      console.log('Doctor ID:', doctorId);
      console.log('Working Hours Data:', workingHours);
    }
  }, [doctorId, workingHours]);

  const updateConsultationData = (updates: Partial<ConsultationData>) => {
    setConsultationData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < 4 && isStepValid()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return consultationData.selectedDate && consultationData.selectedTime && consultationData.selectedDoctorId;
      case 2:
        return consultationData.patientName.trim() && 
               consultationData.phoneNumber.trim() && 
               consultationData.reason.trim();
      case 3:
        return true; // Notification preferences are optional
      case 4:
        return true; // Confirmation step is always valid
      default:
        return false;
    }
  };

  const handleConfirmAppointment = async () => {
    try {
      // Prepare consultation data for API
      const consultationPayload = {
        // Doctor Information
        doctorId: consultationData.selectedDoctorId,
        doctorName: consultationData.selectedDoctorName,
        doctorSpecialty: consultationData.selectedDoctorSpecialty,
        doctorImage: consultationData.doctorImage,
        doctorRating: consultationData.doctorRating,
        doctorReviewCount: consultationData.doctorReviewCount,
        doctorClinic: consultationData.doctorClinic,
        doctorAddress: consultationData.doctorAddress,
        
        // Patient Information
        patientName: consultationData.patientName,
        phoneNumber: consultationData.phoneNumber,
        email: consultationData.email,
        reason: consultationData.reason,
        
        // User ID (if logged in)
        userId: user?._id || null,
        
        // Consultation Type & Details
        consultationType: 'physical',
        appointmentDate: consultationData.selectedDate,
        appointmentTime: consultationData.selectedTime,
        consultationFee: consultationData.consultationFee || 0,
        duration: 20, // Default duration
        
        // Notification Preferences
        whatsappNotifications: consultationData.whatsappNotifications,
        smsNotifications: consultationData.smsNotifications,
        emailNotifications: consultationData.emailNotifications,
      };

      const result = await createConsultation(consultationPayload).unwrap();
      
      if (result.success) {
        // Update local state with the returned appointment ID
        updateConsultationData({ appointmentId: result.data._id });
        handleNext();
      }
    } catch (err: any) {
      console.error('Error creating consultation:', err);
      alert(err?.data?.message || 'Failed to book consultation. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">

      <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} />
      
      {/* Main content area with consistent spacing */}
      <div className="space-y-8">
        <Card>
          <CardContent className="p-6">
            {currentStep === 1 && (
              <TimeSlotSelection
                data={consultationData}
                onUpdate={updateConsultationData}
              />
            )}
            
            {currentStep === 2 && (
              <BasicDetailsForm
                data={consultationData}
                onUpdate={updateConsultationData}
              />
            )}
            
            {currentStep === 3 && (
              <NotificationConfirmation
                data={consultationData}
                onUpdate={updateConsultationData}
              />
            )}
            
            {currentStep === 4 && (
              <AppointmentConfirmation
                data={consultationData}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons (matching video consultation style) */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6"
          >
            Back
          </Button>
          
          {currentStep < 4 ? (
            <Button
              onClick={currentStep === 3 ? handleConfirmAppointment : handleNext}
              disabled={!isStepValid() || (currentStep === 3 && isCreating)}
              className="px-6"
            >
              {currentStep === 3 && isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                currentStep === 3 ? 'Confirm Appointment' : 'Next'
              )}
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <Button onClick={() => window.location.href = '/doctors/appointments'}>
                <Eye className="h-4 w-4 mr-2" />
                View Appointments
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}