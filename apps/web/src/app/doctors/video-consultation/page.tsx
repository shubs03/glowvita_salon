"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@repo/ui/button";
import { BasicInfoStep } from './components/BasicInfoStep';
import { ConfirmationStep } from './components/ConfirmationStep';
import { ChatPanel } from './components/ChatPanel';
import { ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@repo/ui/cn';
import { useCreateConsultationMutation, useCreatePaymentOrderMutation, useVerifyPaymentMutation } from '@repo/store/services/api';

export type ConsultationData = {
  // Basic Info
  patientName: string;
  consultationType: 'self' | 'other';
  concerns: string;
  phoneNumber: string;
  selectedSpecialty?: string;
  
  // Payment Info
  consultationFee: number;
  couponCode?: string;
  discount?: number;
  finalAmount: number;
  
  // Chat Info
  consultationId?: string;
  
  // Doctor Info
  doctorId?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  doctorRating?: number;
  doctorReviewCount?: number;
  doctorClinic?: string;
  doctorYearsOfExperience?: number;
};

// Breadcrumb Navigation Component (matching salon booking style)
const Breadcrumb = ({ currentStep, setCurrentStep }: { currentStep: number; setCurrentStep: (step: number) => void; }) => {
  const steps = ['Basic Information', 'Confirmation & Payment', 'Consultation'];
  return (
    <nav className="flex items-center text-sm font-medium text-muted-foreground mb-4">
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

export default function NewConsultationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const [consultationData, setConsultationData] = useState<ConsultationData>({
    patientName: '',
    consultationType: 'self',
    concerns: '',
    phoneNumber: '',
    consultationFee: 150,
    finalAmount: 150
  });

  // API Mutations
  const [createConsultation, { isLoading: isCreating }] = useCreateConsultationMutation();
  const [createPaymentOrder] = useCreatePaymentOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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
          
          const doctorParams = {
            doctorId: decoded.id || '',
            doctorName: decoded.name || '',
            doctorSpecialty: decoded.specialty || '',
            consultationFee: decoded.fee || 150,
            finalAmount: decoded.fee || 150,
            doctorImage: decoded.image || '',
            doctorRating: decoded.rating,
            doctorReviewCount: decoded.reviews,
            doctorClinic: decoded.clinic || '',
            doctorYearsOfExperience: decoded.experience
          };
          
          console.log('✅ Doctor params:', doctorParams);
          
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
    if (isInitialized && !consultationData.doctorId) {
      console.warn('❌ No doctor ID found, redirecting to doctors page');
      router.push('/doctors');
    } else if (isInitialized && consultationData.doctorId) {
      console.log('✅ Doctor data loaded successfully:', {
        doctorId: consultationData.doctorId,
        doctorName: consultationData.doctorName,
        doctorSpecialty: consultationData.doctorSpecialty,
        consultationFee: consultationData.consultationFee,
      });
    }
  }, [isInitialized, consultationData.doctorId, router, consultationData]);

  const updateConsultationData = (updates: Partial<ConsultationData>) => {
    setConsultationData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < 3 && isStepValid()) {
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
        // Validate basic information: name, phone, and health concerns are required
        return consultationData.patientName.trim() && 
               consultationData.phoneNumber.trim() && 
               consultationData.concerns.trim();
      case 2:
        return true; // Payment step is always valid once reached
      case 3:
        return true; // Chat step is always valid once reached
      default:
        return false;
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      console.log('💳 Creating video consultation booking...');
      console.log('📋 Consultation Data:', consultationData);
      
      // Prepare consultation data for API (similar to physical consultation)
      const consultationPayload = {
        // Doctor Information
        doctorId: consultationData.doctorId,
        doctorName: consultationData.doctorName,
        doctorSpecialty: consultationData.doctorSpecialty,
        
        // Patient Information
        patientName: consultationData.patientName,
        phoneNumber: consultationData.phoneNumber,
        reason: consultationData.concerns, // API expects 'reason' field
        concerns: consultationData.concerns, // Keep for compatibility
        
        // Consultation Type & Details
        consultationType: 'video',
        appointmentDate: new Date().toISOString(), // Video consultations start immediately
        appointmentTime: new Date().toTimeString().split(' ')[0].substring(0, 5), // Current time in HH:mm format
        consultationFee: consultationData.consultationFee,
        finalAmount: consultationData.finalAmount,
        discountAmount: consultationData.discount || 0,
        couponCode: consultationData.couponCode,
        duration: 30, // Default 30 min for video consultations
        
        // Payment Information - For now, marking as pending until Razorpay is configured
        paymentStatus: 'pending', // Will be 'completed' when Razorpay is integrated
        paymentMethod: 'online',
        
        // Additional Info
        selectedSpecialty: consultationData.selectedSpecialty,
      };

      console.log('📤 Creating consultation with payload:', consultationPayload);
      
      // Create consultation in database
      const result = await createConsultation(consultationPayload).unwrap();
      
      if (result.success) {
        console.log('✅ Consultation created successfully:', result.data._id);
        
        // Update local state with the consultation ID
        updateConsultationData({ 
          consultationId: result.data._id,
        });
        
        // Move to next step (Chat Panel)
        handleNext();
      } else {
        throw new Error('Failed to create consultation');
      }
      
    } catch (error: any) {
      console.error('❌ Consultation creation error:', error);
      alert(error?.data?.message || error?.message || 'Failed to book consultation. Please try again.');
    }
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading consultation details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} />
      
      {currentStep === 1 && (
        <BasicInfoStep
          data={consultationData}
          onUpdate={updateConsultationData}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
      )}
      
      {currentStep === 2 && (
        <ConfirmationStep
          data={consultationData}
          onUpdate={updateConsultationData}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onNext={handlePaymentSuccess}
        />
      )}
      
      {currentStep === 3 && (
        <ChatPanel
          consultationData={consultationData}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
      )}

      {/* Navigation Buttons (matching salon booking style) */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isCreating}
          className="px-6"
        >
          Back
        </Button>
        <Button
          onClick={currentStep === 2 ? handlePaymentSuccess : handleNext}
          disabled={!isStepValid() || isCreating}
          className="px-6"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            currentStep === 3 ? 'End Consultation' : currentStep === 2 ? 'Proceed to Payment' : 'Next'
          )}
        </Button>
      </div>
    </div>
  );
}