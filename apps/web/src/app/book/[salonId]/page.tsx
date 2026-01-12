"use client";

<style jsx global>{`
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes pulseOnce {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
  
  .animate-pulseOnce {
    animation: pulseOnce 0.5s ease-out forwards;
  }
`}</style>

import React, { useState, useEffect, useMemo, Suspense } from "react";
import {
  ChevronLeft,
  X,
  Scissors,
  User,
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Star,
  ChevronUp,
  ChevronDown,
  Wallet,
  CreditCard,
  Hourglass,
  Loader2,
  AlertCircle,
  Search,
  Home,
  List,
  UserCircle,
  Phone,
  CheckCircle,
  Info,
  ChevronRight,
  Heart
} from "lucide-react";
import { Button } from "@repo/ui/button";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { Step1_Services } from "@/components/booking/Step1_Services";
import { Step1_WeddingPackageCustomizer } from "@/components/booking/Step1_WeddingPackageCustomizer";
import { Step2_Staff } from "@/components/booking/Step2_Staff";
import { Step3_TimeSlot as TimeSlotSelector } from "@/components/booking/Step3_TimeSlot_Optimized";
import { Step2_MultiService } from "@/components/booking/Step2_MultiService";
import { Step3_MultiServiceTimeSlot } from "@/components/booking/Step3_MultiServiceTimeSlot";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@repo/ui/card';
import { Separator } from '@repo/ui/separator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@repo/ui/select';
import { Label } from '@repo/ui/label';
import { Input } from '@repo/ui/input';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { useBookingData, Service, StaffMember, ServiceStaffAssignment, calculateTotalDuration, convertDurationToMinutes, WeddingPackage } from '@/hooks/useBookingData';
import {
  useCreatePublicAppointmentMutation, useGetPublicVendorOffersQuery,
  useAcquireSlotLockMutation, useConfirmBookingMutation,
  useLockWeddingPackageMutation
} from '@repo/store/api';
import { useAuth } from '@/hooks/useAuth';
// Add import for payment calculator - use cleaner @repo alias
import { calculateBookingAmount, validateOfferCode } from '@repo/lib/utils';
import { toast } from 'sonner';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { GoogleMapSelector } from '@/components/GoogleMapSelector';
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from "@repo/config/config";

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

// Add interface for home service location
interface HomeServiceLocation {
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  lat?: number;
  lng?: number;
  coordinates?: { lat: number; lng: number };
}

function BookingPageContent() {
  // Helper function to calculate end time
  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { salonId } = params;

  // State for tracking the selected service
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // State for tracking the selected wedding package
  const [selectedWeddingPackage, setSelectedWeddingPackage] = useState<WeddingPackage | null>(null);
  const [isCustomizingPackage, setIsCustomizingPackage] = useState(false);
  const [customizedPackageServices, setCustomizedPackageServices] = useState<Service[]>([]);
  const [weddingPackageMode, setWeddingPackageMode] = useState<'default' | 'customized' | null>(null);

  // State declarations
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [serviceStaffAssignments, setServiceStaffAssignments] = useState<ServiceStaffAssignment[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingMode, setBookingMode] = useState<'salon' | 'home'>('salon'); // Global booking mode
  const [serviceSchedule, setServiceSchedule] = useState<Array<{
    service: Service;
    staff: StaffMember | null;
    startTime: string;
    endTime: string;
    duration: number;
  }>>([]);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [homeServiceLocation, setHomeServiceLocation] = useState<HomeServiceLocation | null>(null);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [locationForm, setLocationForm] = useState<HomeServiceLocation>({
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    lat: undefined,
    lng: undefined
  });

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<string>('Pay at Salon');

  // Defensive: Ensure location is cleared if mode is salon (catches state inconsistencies)
  useEffect(() => {
    if (bookingMode === 'salon' && homeServiceLocation) {
      console.log("Defensive Cleanup: Clearing homeServiceLocation because mode is salon");
      setHomeServiceLocation(null);
    }
  }, [bookingMode, homeServiceLocation]);

  // Wrapper to handle mode switching with cleanup
  const handleBookingModeChange = (mode: 'salon' | 'home') => {
    console.log(`=== Switching booking mode to: ${mode} at step ${currentStep} ===`);
    
    setBookingMode(mode);

    if (mode === 'salon') {
      // Clear home service location when switching to salon mode
      setHomeServiceLocation(null);
      setLocationForm({
        address: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        lat: undefined,
        lng: undefined
      });
    } else if (mode === 'home') {
      // For home mode, we only open the map automatically if we are already at the location step (Step 4 for weddings)
      // For regular services, the location modal is triggered by an effect in Step 3
      if (currentStep === 4 && selectedWeddingPackage) {
        console.log('Opening map selector for wedding venue');
        setShowMapSelector(true);
      }
    }
  };

  // Fetch dynamic data using our custom hook
  const {
    services,
    servicesByCategory,
    categories,
    staff,
    workingHours,
    salonInfo,
    weddingPackages,
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
    if (!vendorOffers || vendorOffers.length === 0) {
      console.log('No vendor offers available');
      return [];
    }
    if (!offerSearchTerm) {
      console.log('Returning all vendor offers:', vendorOffers);
      return vendorOffers;
    }

    const filtered = vendorOffers.filter((offer: { code: string; type: string; value: number }) =>
      offer.code.toLowerCase().includes(offerSearchTerm.toLowerCase()) ||
      (offer.type === 'percentage' && `${offer.value}%`.includes(offerSearchTerm)) ||
      (offer.type === 'fixed' && `₹${offer.value}`.includes(offerSearchTerm))
    );

    console.log('Filtered offers:', filtered);
    return filtered;
  }, [vendorOffers, offerSearchTerm]);

  // Fetch service-specific staff data when a service is selected
  const serviceStaffData = useBookingData(salonId as string, selectedService?.id || (selectedServices.length > 0 ? selectedServices[0]?.id : undefined));


  // Make sure currentStep is always a valid number (allow up to step 5 for wedding packages)
  if (typeof currentStep !== 'number' || currentStep < 1 || currentStep > 5) {
    console.warn('Invalid currentStep value, resetting to 1:', currentStep);
    setCurrentStep(1);
  }

  // Mutations for booking flow
  const [createAppointment, { isLoading: isCreatingAppointment }] = useCreatePublicAppointmentMutation();
  const [acquireSlotLock] = useAcquireSlotLockMutation();
  const [confirmBooking] = useConfirmBookingMutation();
  const [lockWeddingPackage] = useLockWeddingPackageMutation();

  // Get authentication state from the useAuth hook
  const { isAuthenticated, user } = useAuth();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isServiceScheduleOpen, setIsServiceScheduleOpen] = useState(false);

  // Add missing state variables
  const [isStaffScheduleOpen, setIsStaffScheduleOpen] = useState(false);
  const [isLocationFormOpen, setIsLocationFormOpen] = useState(false);
  const [isCustomerInfoFormOpen, setIsCustomerInfoFormOpen] = useState(false);
  const [isStaffSelectionOpen, setIsStaffSelectionOpen] = useState(false);
  const [isTimeSelectionOpen, setIsTimeSelectionOpen] = useState(false);
  const [isDateSelectionOpen, setIsDateSelectionOpen] = useState(false);
  const [isServiceSelectionOpen, setIsServiceSelectionOpen] = useState(false);
  const [isVendorSelectionOpen, setIsVendorSelectionOpen] = useState(false);

  // Add state to store lock token from Step3 for wedding packages
  const [slotLockToken, setSlotLockToken] = useState<string | null>(null);

  // Add missing form state variables
  const [customerInfoForm, setCustomerInfoForm] = useState({
    name: '',
    phone: ''
  });

  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');

  // Mock data for missing components
  const staffList = staff || [];
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const vendors: any[] = [];
  const staffSchedule: any[] = [];

  // State for offer code and price breakdown
  const [offerCode, setOfferCode] = useState('');
  const [priceBreakdown, setPriceBreakdown] = useState<any>(null);
  const [offer, setOffer] = useState<any>(null);
  const [appliedOffer, setAppliedOffer] = useState<any>(null);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentTime, setAppointmentTime] = useState(new Date());
  const [totalAmount, setTotalAmount] = useState(0);

  // Update totalAmount when selectedServices or wedding package change
  useEffect(() => {
    if (selectedWeddingPackage) {
      const packagePrice = selectedWeddingPackage.discountedPrice || selectedWeddingPackage.totalPrice || 0;
      setTotalAmount(packagePrice);
    } else if (priceBreakdown?.finalTotal) {
      setTotalAmount(priceBreakdown.finalTotal);
    } else {
      const amount = selectedServices.reduce((sum, service) => {
        const price = service.discountedPrice !== null && service.discountedPrice !== undefined ?
          parseFloat(service.discountedPrice) :
          parseFloat(service.price || '0');
        return sum + price;
      }, 0);
      setTotalAmount(amount);
    }
  }, [selectedServices, selectedWeddingPackage, priceBreakdown]);

  // Handle map click to select location
  const handleMapClick = () => {
    // This function is for the div click handler
    // The actual map click handling is done by the GoogleMap component
  };

  // Handle map marker position change
  const handleMapMarkerChange = (lat: number, lng: number) => {
    setLocationForm(prev => ({
      ...prev,
      lat: lat,
      lng: lng
    }));
  };

  // Get current location using Geolocation API
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocationForm(prev => ({
            ...prev,
            lat: latitude,
            lng: longitude
          }));
          toast.success('Current location detected successfully');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get your current location. Please try again or enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  // Handle home service location form changes
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle location form submission
  const handleLocationFormSubmit = () => {
    // Use the existing handleLocationSubmit function
    handleLocationSubmit();
  };

  // Handle customer info form submission
  const handleCustomerInfoFormSubmit = () => {
    // Set customer info from form
    setCustomerInfo(customerInfoForm);
    setIsCustomerInfoFormOpen(false);
  };

  // Handle staff selection
  const handleStaffSelection = () => {
    // Find selected staff member
    const staffMember = staffList.find((staff: any) => staff.id === selectedStaffId);
    if (staffMember) {
      setSelectedStaff(staffMember);
    }
    setIsStaffSelectionOpen(false);
  };

  // Handle time selection
  const handleTimeSelection = () => {
    setIsTimeSelectionOpen(false);
  };

  // Handle date selection
  const handleDateSelection = () => {
    setIsDateSelectionOpen(false);
  };

  // Handle service selection
  const handleServiceSelection = () => {
    // Find selected services
    const selectedServices = services.filter((service: any) =>
      selectedServiceIds.includes(service.id)
    );
    setSelectedServices(selectedServices);
    setIsServiceSelectionOpen(false);
  };

  // Handle vendor selection
  const handleVendorSelection = () => {
    setIsVendorSelectionOpen(false);
  };

  // Handle home service location submission
  const handleLocationSubmit = () => {
    console.log("=== LOCATION SUBMISSION DEBUG ===");
    console.log("Location form data:", locationForm);
    console.log("Required fields check:");
    console.log("- lat:", !!locationForm.lat);
    console.log("- lng:", !!locationForm.lng);
    console.log("- address:", !!locationForm.address);
    console.log("- city:", !!locationForm.city);
    console.log("- state:", !!locationForm.state);
    console.log("- pincode:", !!locationForm.pincode);

    if (!locationForm.lat || !locationForm.lng) {
      toast.error('Please select a location on the map');
      console.log("❌ Validation failed - no location selected");
      return;
    }

    // Convert lat/lng to numbers and create proper structure with coordinates object
    const locationData = {
      address: locationForm.address,
      city: locationForm.city,
      state: locationForm.state,
      pincode: locationForm.pincode,
      landmark: locationForm.landmark || '',
      lat: Number(locationForm.lat),
      lng: Number(locationForm.lng),
      coordinates: {
        lat: Number(locationForm.lat),
        lng: Number(locationForm.lng)
      }
    };

    console.log("✅ Validation passed - setting location data");
    console.log("Setting homeServiceLocation to:", locationData);
    setHomeServiceLocation(locationData as any);
    setShowLocationModal(false);
    setShowMapSelector(false); // Reset map selector state

    toast.success('Location saved successfully!');

    // After setting location, if we have a time selected, try to proceed
    if (selectedTime) {
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
          salonId,
          homeServiceLocation: locationData
        };
        sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
        router.push(`/client-login?redirect=/book/${salonId}`);
      }
    }

  };
  
  const handleAddressDetailsFetched = (locationData: HomeServiceLocation) => {
    console.log("✅ Address details fetched - setting location data");
    console.log("Setting homeServiceLocation to:", locationData);

    // Ensure coordinates are present before setting state
    let finalLocation = locationData;
    if (locationData.lat !== undefined && locationData.lng !== undefined) {
      finalLocation = {
        ...locationData,
        coordinates: {
          lat: Number(locationData.lat),
          lng: Number(locationData.lng)
        }
      };
      setHomeServiceLocation(finalLocation as any);
    } else {
      setHomeServiceLocation(locationData as any);
    }
    setShowLocationModal(false);
    setShowMapSelector(false); // Reset map selector state

    // After setting location, if we have a time selected, try to proceed
    if (selectedTime) {
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
          salonId,
          homeServiceLocation: finalLocation
        };
        sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
        router.push(`/client-login?redirect=/book/${salonId}`);
      }
    }

    console.log("=== LOCATION SUBMISSION COMPLETE ===");
  };

  // Add a new function to fetch address details
  const fetchAddressDetails = async (lat: number, lng: number) => {
    try {
      console.log("Fetching address details for:", { lat, lng });

      // Check if we have the Google Maps API key
      const apiKey = NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        toast.error('Google Maps API key is not configured. Please contact support.');
        console.error('Google Maps API key is missing');
        return;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      const data = await response.json();
      console.log("Google Maps API response:", data);

      if (data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        const addressData: Partial<HomeServiceLocation> = {
          address: data.results[0].formatted_address,
          lat,
          lng
        };

        // Extract address components
        addressComponents.forEach((component: any) => {
          if (component.types.includes('locality')) {
            addressData.city = component.long_name;
          } else if (component.types.includes('administrative_area_level_1')) {
            addressData.state = component.long_name;
          } else if (component.types.includes('postal_code')) {
            addressData.pincode = component.long_name;
          }
        });

        console.log("Extracted address data:", addressData);

        // Update the location form with the fetched data
        setLocationForm(prev => ({
          ...prev,
          ...addressData
        }));

        // If we now have all required data, proceed with submission
        if (addressData.address && addressData.city && addressData.state && addressData.pincode) {
          const locationData = {
            ...addressData,
            lat: Number(lat),
            lng: Number(lng),
            coordinates: {
              lat: Number(lat),
              lng: Number(lng)
            }
          };

          console.log("✅ Address details fetched - setting location data");
          console.log("Setting homeServiceLocation to:", locationData);
          setHomeServiceLocation(locationData as any);
          setShowLocationModal(false);
          setShowMapSelector(false); // Reset map selector state
          
          // After setting location, if we have a time selected, try to proceed
          if (selectedTime) {
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
                  salonId,
                  homeServiceLocation: locationData
                };
                sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
                router.push(`/client-login?redirect=/book/${salonId}`);
            }
          }
        } else {
          toast.error('Could not fetch complete address details. Please try again or enter manually.');
          console.log("❌ Incomplete address data fetched:", addressData);
        }
      } else {
        toast.error('Could not fetch address details. Please enter manually.');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      toast.error('Could not fetch address details. Please enter manually.');
    }
  };

  // Add useEffect to monitor homeServiceLocation changes
  useEffect(() => {
    console.log("homeServiceLocation state updated:", homeServiceLocation);
  }, [homeServiceLocation]);

  // Set customer info when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerInfo({
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Guest User',
        phone: user.phone || 'Not provided'
      });
    }
  }, [isAuthenticated, user]);

  // Handle offer code application
  const handleApplyOffer = async () => {
    if (!offerCode) return;

    try {
      // Correctly validate the offer using the validate-offer API
      console.log("Validating offer code:", offerCode, "for vendor:", salonId);
      const response = await fetch('/api/validate-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offerCode: offerCode.toUpperCase().trim(),
          vendorId: salonId
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOffer(result.data); // Set the offer data directly
        setAppliedOffer(result.data); // Also set the applied offer

        // Calculate savings for the message
        const savings = result.data.type === 'percentage'
          ? (totalAmount * result.data.value / 100).toFixed(2)
          : result.data.value.toFixed(2);

        toast.success(`Offer ${result.data.code} applied successfully! You saved ₹${savings}.`);
        // Hide the dropdown after successful application
        setShowOfferDropdown(false);
      } else {
        toast.error(result.message || 'Invalid or expired offer code');
      }
    } catch (error) {
      console.error('Error applying offer:', error);
      toast.error('Failed to validate offer code. Please try again.');
    }
  };

  // Handle offer selection from dropdown
  const handleSelectOffer = (selectedOffer: { code: string; type: string; value: number }) => {
    setOfferCode(selectedOffer.code);
    setOffer(selectedOffer);
    setAppliedOffer(selectedOffer);
    setShowOfferDropdown(false);
    setOfferSearchTerm('');
    const savings = selectedOffer.type === 'percentage' ? (totalAmount * selectedOffer.value / 100).toFixed(2) : selectedOffer.value.toFixed(2);
    toast.success(`Offer ${selectedOffer.code} applied successfully! You saved ₹${savings}.`);
  };

  // Clear applied offer
  const handleClearOffer = () => {
    setOfferCode('');
  };

  // Handle confirm appointment
  const handleConfirmAppointment = async () => {
    // Create the appointment
    try {
      await handleFinalBookingConfirmation();
      setIsConfirmationModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Error confirming appointment:", error);
      toast.error("Failed to confirm appointment. Please try again.");
    }
  };

  // Handle navigation between steps
  const handleNextStep = () => {
    // Validate Step 1 (Services or Wedding Package) transition
    if (currentStep === 1) {
      // Wedding package selected - skip to time/date selection
      if (selectedWeddingPackage) {
        if (!weddingPackageMode) {
          setWeddingPackageMode('default');
        }
        setCurrentStep(3); // Skip staff selection, go directly to time/date
        return;
      }

      // Check if user selected at least one service (only for regular service bookings)
      if (selectedServices.length === 0) {
        toast.error("Please select at least one service to continue.");
        return;
      }

      // For regular services: Check for incompatible services based on Booking Mode
      if (selectedServices.length > 0 && bookingMode === 'home') {
        const incompatibleServices = selectedServices.filter(service =>
          !service.homeService?.available && !service.serviceHomeService?.available
        );

        if (incompatibleServices.length > 0) {
          const names = incompatibleServices.map(s => s.name).join(", ");
          toast.error(`Some services are not available for Home Service: ${names}. Please remove them or switch to Salon mode.`);
          return;
        }
      }

      // OPTIONAL: Check for Salon-only services? 
      // Current logic assumes if it's NOT home service, it works in salon.
      // But if we wanted to enforce strict Salon-only vs Home-only, we could add checks here.
    }
    // For multi-service bookings, validate assignments before proceeding
    const isMultiService = selectedServices.length > 1 || serviceStaffAssignments.length > 0;

    // Check if any selected service is a home service
    const hasHomeService = selectedServices.some(service =>
      service.homeService?.available || service.serviceHomeService?.available
    );

    console.log("hasHomeService", hasHomeService)
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
        // For single service or non-multi-service flow, just proceed to next step
        // Home service location collection will be handled in the useEffect when we reach step 3
        setCurrentStep(currentStep + 1);
      }
    } else {
      // We're at step 3 (time selection) - check for home service location if needed
      // Only require location if we are in 'home' mode
      if (bookingMode === 'home' && !homeServiceLocation) {
        console.log("Blocking next step: Home mode without location");
        toast.error("Please select a location for home service");
        setShowLocationModal(true); // Force show location modal
        return;
      }

      console.log("Step 3 Next: Checking Auth...", { isAuthenticated });
      if (isAuthenticated) {
        console.log("User authenticated, opening confirmation modal");
        // toast.info("Reviewing appointment details..."); // Optional status update
        setIsConfirmationModalOpen(true);
      } else {
        console.log("User NOT authenticated, redirecting to login");
        toast.info("Please login to complete your booking");
        // Save booking data to sessionStorage before redirecting to login
        const bookingData = {
          selectedServices,
          serviceStaffAssignments,
          selectedStaff,
          selectedDate: selectedDate.toISOString(),
          selectedTime,
          salonId,
          homeServiceLocation
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
            setHomeServiceLocation(bookingData.homeServiceLocation || null);
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

  // Check if any selected service is a home service and show location modal if needed
  useEffect(() => {
    // Disabled auto-trigger for location modal in Step 3.
    // Location is now requested when clicking 'Continue' from Step 3 for better UX.
    /*
    if (selectedWeddingPackage) {
      return;
    }

    const requiresLocation = bookingMode === 'home';

    if (requiresLocation && currentStep === 3 && !homeServiceLocation) {
      setShowLocationModal(true);
    }
    */
  }, [selectedServices, currentStep, homeServiceLocation, bookingMode, selectedWeddingPackage]);

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

        // Check if this is a single service booking
        const isMultiService = selectedServices.length > 1 || serviceStaffAssignments.length > 0;

        if (!isMultiService) {
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

          // Process services in the order they were assigned
          serviceStaffAssignments.forEach(assignment => {
            // Validate assignment
            if (!assignment || !assignment.service) {
              console.warn("Invalid assignment found:", assignment);
              return;
            }

            const service = assignment.service;

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
              staff: assignment.staff, // Use the staff from the assignment
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

  // Auto-advance wedding package booking flow after time selection - always go to location
  useEffect(() => {
    if (selectedWeddingPackage && currentStep === 3 && selectedTime) {
      console.log('Wedding package time selected, moving to location selection');

      // Automatically move to location selection after a brief delay (for UX)
      // Weddings are typically done at the wedding venue, so location is always required
      const timer = setTimeout(() => {
        console.log('Moving to step 4 (location selection) for wedding package');
        setCurrentStep(4);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [selectedWeddingPackage, currentStep, selectedTime, weddingPackageMode, customizedPackageServices, isAuthenticated, salonId, router]);

  // Handle wedding package booking submission
  const handleSubmit = async () => {
    if (!selectedWeddingPackage) {
      toast.error("No wedding package selected");
      return;
    }

    if (!selectedTime) {
      toast.error("Please select a time slot");
      return;
    }

    if (!isAuthenticated) {
      // Save booking data to sessionStorage
      const bookingData = {
        salonId,
        selectedWeddingPackage,
        weddingPackageMode,
        customizedPackageServices,
        selectedStaff,
        selectedDate,
        selectedTime,
        bookingMode,
        homeServiceLocation,
        paymentMethod
      };
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));

      // Redirect to login
      router.push(`/client-login?redirect=/book/${salonId}`);
      return;
    }

    try {
      const isCustomized = weddingPackageMode === 'customized';
      const packageDuration = isCustomized
        ? customizedPackageServices.reduce((total, service) => total + convertDurationToMinutes(service.duration), 0)
        : selectedWeddingPackage.duration || 0;
      const endTime = calculateEndTime(selectedTime, packageDuration);

      const firstServiceId = isCustomized
        ? (customizedPackageServices[0]?.id || (customizedPackageServices[0] as any)?._id)
        : (selectedWeddingPackage.services[0]?.serviceId || (selectedWeddingPackage.services[0] as any)?._id || selectedWeddingPackage.id);

      // Create appointment data for wedding package
      const appointmentData = {
        vendorId: salonId,
        client: user?._id || user?.id,
        clientName: `${user?.firstName} ${user?.lastName}`,
        // For wedding package, use the first service as primary
        service: firstServiceId,
        serviceName: selectedWeddingPackage.name,
        staff: selectedStaff?.id || null,
        staffName: selectedStaff?.name || "Any Professional",
        date: selectedDate instanceof Date ? selectedDate.toISOString() : new Date(selectedDate).toISOString(),
        startTime: selectedTime,
        endTime: endTime,
        duration: packageDuration,
        amount: selectedWeddingPackage.discountedPrice || selectedWeddingPackage.totalPrice,
        totalAmount: selectedWeddingPackage.discountedPrice || selectedWeddingPackage.totalPrice,
        platformFee: 0,
        serviceTax: 0,
        discountAmount: selectedWeddingPackage.totalPrice - (selectedWeddingPackage.discountedPrice || selectedWeddingPackage.totalPrice),
        finalAmount: selectedWeddingPackage.discountedPrice || selectedWeddingPackage.totalPrice,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending',
        status: 'scheduled',
        notes: `Wedding Package: ${selectedWeddingPackage.name} (${weddingPackageMode === 'customized' ? 'Customized' : 'Default'})`,
        serviceItems: (isCustomized ? customizedPackageServices : selectedWeddingPackage.services).map((service: any) => ({
          service: service.id || service.serviceId || service._id,
          serviceName: service.name || service.serviceName,
          staff: selectedStaff?.id || null,
          staffName: selectedStaff?.name || "Any Professional",
          startTime: selectedTime,
          endTime: endTime,
          duration: convertDurationToMinutes(service.duration || selectedWeddingPackage.duration / (selectedWeddingPackage.services?.length || 1)),
          amount: service.discountedPrice !== null && service.discountedPrice !== undefined ?
            Number(service.discountedPrice) :
            Number(service.price || (selectedWeddingPackage.discountedPrice || selectedWeddingPackage.totalPrice) / (selectedWeddingPackage.services?.length || 1))
        })),
        isMultiService: true,
        isHomeService: bookingMode === 'home' && !!homeServiceLocation,
        isWeddingService: true,
        weddingPackageId: selectedWeddingPackage.id || selectedWeddingPackage._id,
        weddingPackageMode: weddingPackageMode,
        ...(bookingMode === 'home' && homeServiceLocation ? {
          homeServiceLocation: {
            address: homeServiceLocation.address,
            city: homeServiceLocation.city || '',
            state: homeServiceLocation.state || '',
            pincode: homeServiceLocation.pincode || '',
            landmark: homeServiceLocation.landmark || '',
            lat: homeServiceLocation.coordinates?.lat || 0,
            lng: homeServiceLocation.coordinates?.lng || 0
          }
        } : {}),
        bufferBefore: 0,
        bufferAfter: 0,
        blockingWindows: [],
        blockedTravelWindows: []
      };

      console.log("Creating wedding package booking:", appointmentData);

      // Create the appointment using the API
      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const result = await response.json();

      toast.success("Wedding package booking confirmed!");

      // Mark that an appointment was just created
      sessionStorage.setItem('appointmentJustCreated', 'true');

      // Redirect to success page or appointments page
      router.push(`/appointments/${result.appointment._id}`);

    } catch (error: any) {
      console.error('Error creating wedding package booking:', error);
      toast.error(error.message || 'Failed to confirm booking. Please try again.');
    }
  };

  // Update the handleFinalBookingConfirmation function to use enhanced booking
  const handleFinalBookingConfirmation = async () => {
    console.log('=== handleFinalBookingConfirmation Called ===');
    console.log('Selected Time:', selectedTime);
    console.log('Selected Wedding Package:', selectedWeddingPackage);
    console.log('Home Service Location:', homeServiceLocation);
    console.log('Payment Method:', paymentMethod);
    console.log('Is Authenticated:', isAuthenticated);

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
        homeServiceLocation
      };
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));

      // Redirect to login
      router.push(`/login?redirect=/book/${salonId}`);
      return;
    }

    // Validate that we have at least one service or wedding package
    if (selectedServices.length === 0 && !selectedWeddingPackage) {
      toast.error("Please select at least one service");
      return;
    }

    // Check if this is a multi-service booking
    const isMultiService = selectedServices.length > 1 || serviceStaffAssignments.length > 0;

    let staffId, staffName;

    if (isMultiService) {
      // For multi-service, use the first service assignment
      const firstAssignment = serviceStaffAssignments[0];
      if (firstAssignment) {
        staffId = firstAssignment.staff ? firstAssignment.staff.id : null;
        staffName = firstAssignment.staff ? firstAssignment.staff.name : "Any Professional";
      } else {
        staffId = null;
        staffName = "Any Professional";
      }
    } else {
      // For single service, use the selectedStaff
      staffId = selectedStaff?.id || null;
      staffName = selectedStaff?.name || "Any Professional";
    }

    // Get the primary service - either from selected services or wedding package
    let primaryService;
    if (selectedWeddingPackage) {
      // Create a service-like object from wedding package
      primaryService = {
        id: selectedWeddingPackage.id || selectedWeddingPackage._id,
        name: selectedWeddingPackage.name,
        price: selectedWeddingPackage.totalPrice,
        discountedPrice: selectedWeddingPackage.discountedPrice,
        duration: selectedWeddingPackage.duration,
        category: 'Wedding Package',
        description: selectedWeddingPackage.description
      };
    } else {
      // Use the first selected service
      primaryService = selectedServices[0];
    }

    // Validate primary service has required fields
    if (!primaryService || !primaryService.id || !primaryService.name) {
      toast.error("Invalid service data. Please try again.");
      return;
    }

    // Calculate end time
    const duration = convertDurationToMinutes(primaryService.duration);
    const endTime = calculateEndTime(selectedTime, duration);

    // Check if any selected service is a home service or if wedding package is for wedding venue
    const isHomeService = selectedWeddingPackage
      ? false // Wedding packages handle location separately
      : selectedServices.some(service =>
        service.homeService?.available || service.serviceHomeService?.available
      );

    // Check if this is a wedding service (either wedding package or wedding service)
    const isWeddingService = !!selectedWeddingPackage || selectedServices.some(service =>
      service.weddingService?.available || service.serviceWeddingService?.available
    );

    // Log home service location data
    console.log("Home service location data:", {
      isHomeService,
      homeServiceLocation,
      locationForm,
      hasLocationData: !!homeServiceLocation,
      locationData: homeServiceLocation
    });

    // Update the appointment data creation to properly set service type flags

    // DEBUG: Log home service detection and location data
    console.log("=== HOME SERVICE DEBUG INFO ===");
    console.log("isHomeService:", isHomeService);
    console.log("homeServiceLocation:", homeServiceLocation);
    console.log("homeServiceLocation type:", typeof homeServiceLocation);
    if (homeServiceLocation) {
      console.log("homeServiceLocation keys:", Object.keys(homeServiceLocation));
      console.log("homeServiceLocation values:", homeServiceLocation);
    }
    console.log("===============================");

    // Create appointment data with all required fields
    const appointmentData = {
      vendorId: salonId,
      client: user?._id || user?.id, // Try both _id and id
      clientName: `${user?.firstName} ${user?.lastName}`,
      service: primaryService.id,
      serviceName: primaryService.name,
      staff: staffId, // Use the properly determined staffId
      staffName: staffName, // Use the properly determined staffName
      date: selectedDate instanceof Date ? selectedDate.toISOString() : new Date(selectedDate).toISOString(),
      startTime: selectedTime,
      endTime: endTime,
      duration: duration,
      amount: primaryService.discountedPrice !== null && primaryService.discountedPrice !== undefined ?
        Number(primaryService.discountedPrice) :
        Number(primaryService.price),
      totalAmount: primaryService.discountedPrice !== null && primaryService.discountedPrice !== undefined ?
        Number(primaryService.discountedPrice) :
        Number(primaryService.price),
      platformFee: priceBreakdown?.platformFee || 0,
      serviceTax: priceBreakdown?.serviceTax || 0,
      discountAmount: priceBreakdown?.discountAmount || 0,
      finalAmount: priceBreakdown?.finalTotal || (primaryService.discountedPrice !== null && primaryService.discountedPrice !== undefined ?
        Number(primaryService.discountedPrice) :
        Number(primaryService.price)),
      paymentMethod: paymentMethod, // Use selected payment method
      paymentStatus: 'pending',
      status: 'scheduled',
      notes: selectedWeddingPackage
        ? `Wedding Package: ${selectedWeddingPackage.name}`
        : isMultiService ? "Multi-service appointment" : "Single service appointment",
      serviceItems: selectedWeddingPackage
        ? // For wedding packages, create service items from package services
        selectedWeddingPackage.services.map((pkgService: any) => ({
          service: pkgService.serviceId || pkgService.id,
          serviceName: pkgService.serviceName || pkgService.name,
          staff: staffId,
          staffName: staffName,
          startTime: selectedTime,
          endTime: endTime,
          duration: duration,
          amount: primaryService.discountedPrice !== null && primaryService.discountedPrice !== undefined ?
            Number(primaryService.discountedPrice) :
            Number(primaryService.price)
        }))
        : // For regular services
        selectedServices.map(service => {
          // For multi-service, find the specific staff assignment for this service
          let serviceStaffId = null;
          let serviceStaffName = "Any Professional";

          if (isMultiService) {
            const assignment = serviceStaffAssignments.find(a => a.service.id === service.id);
            if (assignment) {
              serviceStaffId = assignment.staff ? assignment.staff.id : null;
              serviceStaffName = assignment.staff ? assignment.staff.name : "Any Professional";
            }
          } else {
            // For single service, use the selectedStaff
            serviceStaffId = selectedStaff?.id || null;
            serviceStaffName = selectedStaff?.name || "Any Professional";
          }

          return {
            service: service.id,
            serviceName: service.name,
            staff: serviceStaffId,
            staffName: serviceStaffName,
            startTime: selectedTime, // This would need to be more specific for multi-service
            endTime: calculateEndTime(selectedTime, convertDurationToMinutes(service.duration)), // This would need to be more specific for multi-service
            duration: convertDurationToMinutes(service.duration),
            amount: service.discountedPrice !== null && service.discountedPrice !== undefined ?
              Number(service.discountedPrice) :
              Number(service.price)
          };
        }),
      isMultiService: isMultiService,
      // STRICT FIX: Only set isHomeService to true if bookingMode is 'home' AND location is provided.
      // This prevents "Phantom Home Mode" where bookingMode is 'home' but user is booking for salon.
      isHomeService: bookingMode === 'home' && !!homeServiceLocation,
      isWeddingService: isWeddingService,
      // Add home service location if it's a home service - ensure proper structure
      ...(bookingMode === 'home' && homeServiceLocation ? {
        homeServiceLocation: {
          address: homeServiceLocation.address || locationForm.address || '',
          city: homeServiceLocation.city || locationForm.city || '',
          state: homeServiceLocation.state || locationForm.state || '',
          pincode: homeServiceLocation.pincode || locationForm.pincode || '',
          landmark: homeServiceLocation.landmark || locationForm.landmark || '',
          lat: homeServiceLocation.coordinates?.lat || homeServiceLocation.lat || Number(locationForm.lat) || 0,
          lng: homeServiceLocation.coordinates?.lng || homeServiceLocation.lng || Number(locationForm.lng) || 0
        }
      } : {}),
      // Add travel time fields with default values if not already present
      // Let backend calculate travel time based on location data
      bufferBefore: 0,
      bufferAfter: 0,
      blockingWindows: [],
      blockedTravelWindows: []
    };

    // DEBUG: Log the complete appointment data being sent
    console.log("=== COMPLETE APPOINTMENT DATA ===");
    console.log("Full appointment data:", JSON.stringify(appointmentData, null, 2));
    console.log("isHomeService flag:", appointmentData.isHomeService);
    console.log("homeServiceLocation in data:", appointmentData.homeServiceLocation);
    console.log("================================");

    // DEBUG: Log the complete appointment data being sent
    console.log("=== APPOINTMENT DATA BEING SENT ===");
    console.log("Full appointment data:", JSON.stringify(appointmentData, null, 2));
    console.log("===================================");
    try {
      // Determine if this is a home service based on booking mode and location availability
      // Payment method should NOT affect whether it's a home service or not
      const finalIsHomeService = bookingMode === 'home' && !!homeServiceLocation;

      console.log("=== FINAL BOOKING DECISION ===");
      console.log("Booking Mode:", bookingMode);
      console.log("Payment Method:", paymentMethod);
      console.log("Home Service Location exists:", !!homeServiceLocation);
      console.log("FINAL isHomeService:", finalIsHomeService);
      console.log("==============================");
      console.log("Has Location:", !!homeServiceLocation);
      console.log("Computed isHomeService:", finalIsHomeService);
      console.log("==============================");

      if (isWeddingService && selectedWeddingPackage) {
        // Handle wedding package booking
        console.log("=== WEDDING PACKAGE BOOKING START ===");
        console.log("Package ID:", selectedWeddingPackage._id || selectedWeddingPackage.id);
        console.log("Existing lock token from Step3:", slotLockToken);
        console.log("Selected Slot:", {
          date: selectedDate,
          startTime: selectedTime,
          endTime: endTime,
          location: finalIsHomeService ? homeServiceLocation : null,
        });

        let lockId = slotLockToken;

        // Only acquire lock if we don't already have one from Step3
        if (!lockId) {
          console.log("No existing lock found, acquiring new lock...");
          const lockResult = await lockWeddingPackage({
            packageId: selectedWeddingPackage._id || selectedWeddingPackage.id,
            selectedSlot: {
              date: selectedDate,
              startTime: selectedTime,
              endTime: endTime,
              location: finalIsHomeService ? homeServiceLocation : null,
              teamMembers: [], // Will be populated by the backend
              totalAmount: appointmentData.totalAmount,
              depositAmount: (selectedWeddingPackage as any).depositAmount || 0
            },
            clientId: user?._id || user?.id,
            clientName: `${user?.firstName} ${user?.lastName}`,
            customerDetails: {
              name: `${user?.firstName} ${user?.lastName}`,
              phone: user?.phone
            }
          }).unwrap();

          console.log("=== LOCK RESULT ===", lockResult);

          if (!lockResult.success || !lockResult.lockId) {
            throw new Error(lockResult.message || "Failed to acquire lock");
          }

          lockId = lockResult.lockId;
        } else {
          console.log("Using existing lock token from Step3");
        }

        // Now confirm the booking with the lock ID
        console.log("=== CONFIRMING WEDDING PACKAGE BOOKING ===");
        console.log("Lock ID:", lockId);

        // Call the wedding package specific endpoint
        const response = await fetch('/api/scheduling/wedding-package', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            packageId: selectedWeddingPackage._id || selectedWeddingPackage.id,
            lockId: lockId,
            selectedSlot: {
              date: selectedDate,
              startTime: selectedTime,
              endTime: endTime,
              location: finalIsHomeService ? homeServiceLocation : null,
              totalAmount: appointmentData.totalAmount,
            },
            clientName: `${user?.firstName} ${user?.lastName}`,
            customerDetails: {
              userId: user?._id || user?.id,
              name: `${user?.firstName} ${user?.lastName}`,
              phone: user?.phone,
              email: user?.email
            },
            paymentDetails: {
              method: paymentMethod,
              status: 'pending'
            }
          })
        });

        const confirmResult = await response.json();
        console.log("=== CONFIRM RESULT ===", confirmResult);

        if (confirmResult.success) {
          toast.success("Wedding package booking confirmed!");
          setIsConfirmationModalOpen(false);
          setIsSuccessModalOpen(true);
        } else {
          throw new Error(confirmResult.message || "Failed to confirm booking");
        }
      } else {
        // Handle regular booking with enhanced slot locking
        const lockResult = await acquireSlotLock({
          vendorId: salonId,
          staffId: staffId,
          serviceId: primaryService.id,
          serviceName: primaryService.name,
          date: selectedDate,
          startTime: selectedTime,
          endTime: endTime,
          clientId: user?._id || user?.id,
          clientName: `${user?.firstName} ${user?.lastName}`,
          staffName: staffName,
          // Use the correctly determined home service flag
          isHomeService: finalIsHomeService,
          isWeddingService: isWeddingService,
          location: finalIsHomeService && homeServiceLocation ? {
            address: homeServiceLocation.address || locationForm.address || '',
            city: homeServiceLocation.city || locationForm.city || '',
            state: homeServiceLocation.state || locationForm.state || '',
            pincode: homeServiceLocation.pincode || locationForm.pincode || '',
            landmark: homeServiceLocation.landmark || locationForm.landmark || '',
            lat: Number(homeServiceLocation.coordinates?.lat || homeServiceLocation.lat || locationForm.lat || 0),
            lng: Number(homeServiceLocation.coordinates?.lng || homeServiceLocation.lng || locationForm.lng || 0)
          } : null,
          duration: duration,
          amount: appointmentData.amount,
          totalAmount: appointmentData.totalAmount,
          finalAmount: appointmentData.finalAmount
        }).unwrap();

        if (lockResult.success) {
          // Confirm the booking
          const confirmResult = await confirmBooking({
            appointmentId: lockResult.appointmentId,
            lockId: lockResult.lockId,
            paymentDetails: {
              method: paymentMethod,
              status: 'pending'
            }
          }).unwrap();

          toast.success("Booking confirmed!");
          setIsPaymentModalOpen(false);
          setIsSuccessModalOpen(true);
        } else {
          throw new Error(lockResult.message || "Failed to acquire slot lock");
        }
      }

      // Set a flag in sessionStorage to indicate that an appointment was just created
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('appointmentJustCreated', 'true');
      }

      // Clear the selected time to ensure the time slot component refetches data
      setSelectedTime(null);

    } catch (error: any) {
      console.error("Error creating appointment:", error);
      toast.error(error?.data?.message || error?.message || "Failed to create appointment. Please try again.");
    }
  };

  const handlePaymentMethodSelection = async (method: string) => {
    console.log("=== PAYMENT METHOD SELECTION ===");
    console.log("Selected payment method:", method);

    // Check if this is a home service booking based on mode
    // We strictly use the bookingMode state, NOT service capabilities
    const isHomeService = bookingMode === 'home';

    console.log(`Payment selection - Booking Mode: ${bookingMode}, Is Home Service: ${isHomeService}`);

    // Check if any selected service is a wedding service
    const isWeddingService = selectedServices.some(service =>
      service.weddingService?.available || service.serviceWeddingService?.available
    );

    // If it's a home service, we need to go through the slot-lock process first
    // STRICTER CHECK: Must have mode=home AND a valid location
    if (isHomeService && selectedTime && homeServiceLocation) {
      console.log("Processing home service booking through slot-lock process");

      // Get the first service as the primary service
      const primaryService = selectedServices[0];

      // Validate primary service has required fields
      if (!primaryService.id || !primaryService.name) {
        toast.error("Invalid service data. Please try again.");
        return;
      }

      // Check if any selected service is a wedding service
      const isWeddingService = selectedServices.some(service =>
        service.weddingService?.available || service.serviceWeddingService?.available
      );

      try {
        // Acquire slot lock for home service
        const lockData = {
          vendorId: bookingMode === 'home' ? salonId : (Array.isArray(salonId) ? salonId[0] : salonId), // Ensure vendorId is string
          staffId: selectedStaff?.id || null,
          serviceId: primaryService.id,
          serviceName: primaryService.name,
          date: selectedDate,
          startTime: selectedTime,
          endTime: calculateEndTime(selectedTime, convertDurationToMinutes(primaryService.duration)),
          clientId: user?._id || user?.id,
          clientName: `${user?.firstName} ${user?.lastName}`,
          staffName: selectedStaff?.name || "Any Professional",
          isHomeService: true,
          isWeddingService: isWeddingService,
          location: homeServiceLocation ? {
            address: homeServiceLocation.address,
            city: homeServiceLocation.city,
            state: homeServiceLocation.state,
            pincode: homeServiceLocation.pincode,
            landmark: homeServiceLocation.landmark || '',
            lat: Number(homeServiceLocation.coordinates?.lat || homeServiceLocation.lat || 0),
            lng: Number(homeServiceLocation.coordinates?.lng || homeServiceLocation.lng || 0)
          } : null,
          duration: convertDurationToMinutes(primaryService.duration),
          amount: primaryService.discountedPrice !== null && primaryService.discountedPrice !== undefined ?
            Number(primaryService.discountedPrice) :
            Number(primaryService.price),
          totalAmount: primaryService.discountedPrice !== null && primaryService.discountedPrice !== undefined ?
            Number(primaryService.discountedPrice) :
            Number(primaryService.price),
          finalAmount: primaryService.discountedPrice !== null && primaryService.discountedPrice !== undefined ?
            Number(primaryService.discountedPrice) :
            Number(primaryService.price)
        };

        console.log("Acquiring slot lock with data:", lockData);
        const lockResult = await acquireSlotLock(lockData).unwrap();

        if (lockResult.success) {
          // Confirm the booking
          const confirmResult = await confirmBooking({
            appointmentId: lockResult.appointmentId,
            lockId: lockResult.lockId
          }).unwrap();

          // Handle online payment if selected
          if (method === 'Pay Online' && confirmResult.appointment.finalAmount > 0) {
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

          // Show confirmation message with toast
          toast.success("Booking Confirmed! Payment Method: " + method);

          // Set a flag in sessionStorage to indicate that an appointment was just created
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('appointmentJustCreated', 'true');
          }

          // Clear the selected time to ensure the time slot component refetches data
          setSelectedTime(null);

          // Redirect to the appointments page after a short delay
          setTimeout(() => {
            router.push('/profile/appointments');
          }, 2000);
        } else {
          throw new Error(lockResult.message || "Failed to acquire slot lock");
        }
      } catch (error: any) {
        console.error("Error creating home service appointment:", error);
        if (error?.data?.message) {
          toast.error(`Failed to create appointment: ${error.data.message}`);
        } else {
          toast.error("Failed to create appointment. Please try again.");
        }
      }
    } else {
      // Handle regular (non-home service) appointments as before
      console.log("Processing regular appointment (step check passed or fallback)");

      // FALLBACK LOG: If bookingMode is home but we are here, it means location was missing
      if (bookingMode === 'home' && !homeServiceLocation) {
        console.warn("Booking Mode is Home but no location found. Falling back to Salon booking.");
        // Optional: toast.warning("Missing home location details. Proceeding as salon booking.");
      }

      // Prevent multiple calls
      if (isCreatingAppointment) {
        console.log("Appointment creation already in progress, skipping...");
        return;
      }

      // Validate that we have at least one service or a wedding package
      if (selectedServices.length === 0 && !selectedWeddingPackage) {
        toast.error("Please select at least one service or a wedding package");
        return;
      }

      // Check if this is a multi-service booking or wedding package
      const isMultiService = selectedServices.length > 1 || serviceStaffAssignments.length > 0;
      const isWeddingPackageBooking = !!selectedWeddingPackage;

      // For wedding packages, use package data; otherwise use first service
      let primaryService;
      if (isWeddingPackageBooking && selectedWeddingPackage) {
        // Create a service-like object from wedding package
        const packageServices = weddingPackageMode === 'customized' ? customizedPackageServices : selectedWeddingPackage.services;
        primaryService = {
          id: selectedWeddingPackage.id || selectedWeddingPackage._id,
          name: selectedWeddingPackage.name,
          price: selectedWeddingPackage.discountedPrice || selectedWeddingPackage.totalPrice,
          discountedPrice: selectedWeddingPackage.discountedPrice,
          duration: selectedWeddingPackage.duration,
          category: 'Wedding Package',
          description: selectedWeddingPackage.description
        };
      } else {
        primaryService = selectedServices[0];
      }

      // Validate primary service has required fields
      if (!primaryService.id || !primaryService.name) {
        toast.error("Invalid service data. Please try again.");
        return;
      }

      try {
        // Check if we have a service schedule or need to create one
        let finalServiceSchedule = serviceSchedule;

        // If no service schedule exists, create one based on whether it's single or multi-service
        if (serviceSchedule.length === 0 && selectedTime) {
          console.log("Creating service schedule - is multi-service:", isMultiService);

          if (isMultiService && serviceStaffAssignments.length > 0) {
            // MULTI-SERVICE: Create sequential schedule with proper start/end times
            console.log("Creating MULTI-service schedule with sequential times");
            let currentStartTime = selectedTime;

            finalServiceSchedule = serviceStaffAssignments.map((assignment, index) => {
              const serviceDuration = convertDurationToMinutes(assignment.service.duration);
              const endTime = calculateEndTime(currentStartTime, serviceDuration);

              console.log(`\n📝 Creating Service ${index + 1} Schedule Entry:`);
              console.log(`   Service: ${assignment.service.name}`);
              console.log(`   Duration: ${serviceDuration} minutes`);
              console.log(`   Current Start Time (BEFORE this service): ${currentStartTime}`);
              console.log(`   Calculated End Time: ${endTime}`);

              const scheduleEntry = {
                service: assignment.service,
                staff: assignment.staff,
                startTime: currentStartTime,  // This service starts at currentStartTime
                endTime: endTime,              // This service ends at endTime
                duration: serviceDuration
              };

              console.log(`   ✅ Service ${index + 1} will run: ${currentStartTime} - ${endTime}\n`);

              // CRITICAL: Update start time for next service (sequential)
              const previousStartTime = currentStartTime;
              currentStartTime = endTime;  // Next service starts where this one ends
              console.log(`   🔄 Next service will start at: ${currentStartTime}\n`);

              return scheduleEntry;
            });

            console.log("Created multi-service schedule with sequential times:", finalServiceSchedule);
          } else if (selectedServices.length === 1) {
            // SINGLE-SERVICE: Create simple schedule
            console.log("Creating service schedule for single service appointment");
            const service = selectedServices[0];
            console.log("Service for schedule:", service);
            console.log("Service properties:", {
              service: service,
              serviceType: typeof service,
              serviceKeys: service ? Object.keys(service) : null,
              hasId: !!(service && service.id),
              hasName: !!(service && service.name),
              hasPrice: !!(service && service.price),
              id: service?.id,
              name: service?.name,
              price: service?.price
            });

            // Validate service has required properties
            if (!service) {
              console.error("No service selected for schedule creation");
              toast.error("No service selected. Please try again.");
              return;
            }

            if (!service.id) {
              console.error("Service missing ID:", service);
              toast.error("Invalid service data - missing ID. Please try again.");
              return;
            }

            if (!service.name) {
              console.error("Service missing name:", service);
              toast.error("Invalid service data - missing name. Please try again.");
              return;
            }

            // Determine staff for single service
            let staffForSchedule = selectedStaff;
            if (isMultiService && serviceStaffAssignments.length > 0) {
              const assignment = serviceStaffAssignments.find(a => a.service.id === service.id);
              if (assignment) {
                staffForSchedule = assignment.staff;
              }
            }

            const serviceDuration = convertDurationToMinutes(service.duration);
            console.log("Service duration:", serviceDuration);

            // Create a service schedule entry for the single service
            finalServiceSchedule = [{
              service,
              staff: staffForSchedule, // Use the properly determined staff
              startTime: selectedTime,
              endTime: calculateEndTime(selectedTime, serviceDuration),
              duration: serviceDuration
            }];

            console.log("Created single service schedule:", finalServiceSchedule);
            console.log("Created schedule service details:", {
              service: finalServiceSchedule[0].service,
              staff: finalServiceSchedule[0].staff,
              staffType: typeof finalServiceSchedule[0].staff,
              staffKeys: finalServiceSchedule[0].staff ? Object.keys(finalServiceSchedule[0].staff) : null,
              hasStaff: !!finalServiceSchedule[0].staff,
              hasStaffId: finalServiceSchedule[0].staff && finalServiceSchedule[0].staff.id,
              hasStaffName: finalServiceSchedule[0].staff && finalServiceSchedule[0].staff.name,
              staffId: finalServiceSchedule[0].staff?.id,
              staffName: finalServiceSchedule[0].staff?.name,
              startTime: finalServiceSchedule[0].startTime,
              endTime: finalServiceSchedule[0].endTime,
              duration: finalServiceSchedule[0].duration
            });
          }
        }

        console.log("Final service schedule:", finalServiceSchedule);

        // For multiple services or single service with schedule, create appointment
        if (finalServiceSchedule.length > 0) {
          console.log("Creating appointment with method:", method);

          // Use the first service as the primary service for the appointment
          const primarySchedule = finalServiceSchedule[0];
          console.log("Primary schedule:", primarySchedule);
          console.log("Primary schedule service details:", {
            service: primarySchedule.service,
            serviceType: typeof primarySchedule.service,
            serviceKeys: primarySchedule.service ? Object.keys(primarySchedule.service) : null,
            hasService: !!primarySchedule.service,
            hasServiceId: primarySchedule.service && primarySchedule.service.id,
            hasServiceName: primarySchedule.service && primarySchedule.service.name,
            serviceId: primarySchedule.service?.id,
            serviceName: primarySchedule.service?.name
          });

          // Validate that we have all required service data
          if (!primarySchedule.service || !primarySchedule.service.id || !primarySchedule.service.name) {
            console.error("Missing required service data:", primarySchedule.service);
            toast.error("Invalid service data. Please try again.");
            return;
          }

          // Validate that we have all required staff data (staff can be null for "Any Professional")
          console.log("Primary schedule staff details:", {
            staff: primarySchedule.staff,
            staffType: typeof primarySchedule.staff,
            staffKeys: primarySchedule.staff ? Object.keys(primarySchedule.staff) : null,
            hasStaff: !!primarySchedule.staff,
            hasStaffId: primarySchedule.staff && primarySchedule.staff.id,
            hasStaffName: primarySchedule.staff && primarySchedule.staff.name,
            staffId: primarySchedule.staff?.id,
            staffName: primarySchedule.staff?.name
          });

          if (primarySchedule.staff && (!primarySchedule.staff.id || !primarySchedule.staff.name)) {
            console.error("Invalid staff data:", primarySchedule.staff);
            toast.error("Invalid staff data. Please try again.");
            return;
          }

          console.log("Primary service data:", {
            id: primarySchedule.service.id,
            name: primarySchedule.service.name,
            hasId: !!primarySchedule.service.id,
            hasName: !!primarySchedule.service.name
          });

          console.log("Primary staff data:", {
            id: primarySchedule.staff ? primarySchedule.staff.id : null,
            name: primarySchedule.staff ? primarySchedule.staff.name : "Any Professional",
            hasId: primarySchedule.staff ? !!primarySchedule.staff.id : true, // Can be null
            hasName: primarySchedule.staff ? !!primarySchedule.staff.name : true
          });

          // Format the appointment date with the correct time
          const appointmentDate = selectedDate instanceof Date ? new Date(selectedDate) : new Date(selectedDate);
          const [hours, minutes] = primarySchedule.startTime.split(':').map(Number);
          appointmentDate.setHours(hours, minutes, 0, 0);
          console.log("Appointment date:", appointmentDate);

          // Create service items for all services
          const serviceItems = finalServiceSchedule.map(schedule => {
            // Validate service data
            if (!schedule.service || !schedule.service.id || !schedule.service.name) {
              console.error("Missing required service data in schedule:", schedule.service);
              throw new Error("Invalid service data in schedule");
            }

            // Validate staff data (staff can be null for "Any Professional")
            if (schedule.staff && (!schedule.staff.id || !schedule.staff.name)) {
              console.error("Invalid staff data in schedule:", schedule.staff);
              throw new Error("Invalid staff data in schedule");
            }

            console.log("Creating service item:", {
              serviceId: schedule.service.id,
              serviceName: schedule.service.name,
              staffId: schedule.staff ? schedule.staff.id : null,
              staffName: schedule.staff ? schedule.staff.name : "Any Professional",
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              duration: schedule.duration,
              amount: schedule.service.discountedPrice !== null && schedule.service.discountedPrice !== undefined ?
                parseFloat(schedule.service.discountedPrice) :
                parseFloat(schedule.service.price)
            });

            return {
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
            };
          });

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
          const endTime = finalServiceSchedule[finalServiceSchedule.length - 1].endTime ||
            calculateEndTime(primarySchedule.startTime, totalDuration);

          console.log("\n🕐 === APPOINTMENT TIME DETAILS ===");
          console.log("Start time:", primarySchedule.startTime);
          console.log("End time:", endTime);
          console.log("Total duration:", totalDuration, "minutes");
          console.log("Service schedule breakdown:");
          finalServiceSchedule.forEach((sched, idx) => {
            console.log(`  Service ${idx + 1}: ${sched.service.name}`);
            console.log(`    Staff: ${sched.staff ? sched.staff.name : 'Any Professional'}`);
            console.log(`    Time: ${sched.startTime} - ${sched.endTime} (${sched.duration} min)`);
          });
          console.log("=================================\n");

          // Handle staff field - it can now be null for "Any Professional"
          let staffId = primarySchedule.staff ? primarySchedule.staff.id : null;
          let staffName = primarySchedule.staff ? primarySchedule.staff.name : "Any Professional";
          let clientName = user.firstName + " " + user.lastName;
          let clientId = user._id || user.id; // Try both _id and id
          console.log("Client Name:", clientName)
          console.log("Client ID:", clientId);
          console.log("Staff ID:", staffId, "Staff Name:", staffName);
          console.log("User object:", user);
          console.log("User properties:", {
            hasFirstName: !!user.firstName,
            hasLastName: !!user.lastName,
            hasId: !!clientId,
            firstName: user.firstName,
            lastName: user.lastName,
            id: clientId
          });

          // Fix salonId if it's an array
          const vendorId = Array.isArray(salonId) ? salonId[0] : salonId;
          console.log("Vendor ID check:", {
            salonId: salonId,
            vendorId: vendorId,
            salonIdType: typeof salonId,
            isSalonIdArray: Array.isArray(salonId)
          });

          // Update the appointment data creation to properly set service type flags
          // STRICT FIX: Only set isHomeService to true if the user explicitly chose 'home' mode AND provided location
          // This serves as the final safety net against phantom home bookings
          const isHomeService = bookingMode === 'home' && !!homeServiceLocation;

          // Check if any selected service is a wedding service
          const isWeddingService = selectedServices.some(service =>
            service.weddingService?.available || service.serviceWeddingService?.available
          );

          const appointmentData = {
            vendorId: vendorId, // Use the fixed vendorId
            client: clientId, // Use the fixed client ID
            clientName: clientName, // In a real implementation, this would come from user authentication
            service: primarySchedule.service.id,
            serviceName: primarySchedule.service.name,
            staff: staffId, // This can now be null for "Any Professional"
            staffName: staffName,
            date: appointmentDate.toISOString(), // Ensure date is in ISO format
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
            isMultiService: isMultiService,
            isHomeService: isHomeService, // Keeping strict mode consistency
            isWeddingService: isWeddingService,
            // Add home service location if applicable
            // CRITICAL: Send as both 'homeServiceLocation' and 'location' to ensure backend compatibility
            ...(isHomeService && homeServiceLocation && {
              homeServiceLocation: {
                address: homeServiceLocation.address,
                city: homeServiceLocation.city,
                state: homeServiceLocation.state,
                pincode: homeServiceLocation.pincode,
                landmark: homeServiceLocation.landmark || '',
                lat: Number(homeServiceLocation.lat),
                lng: Number(homeServiceLocation.lng)
              },
              location: {
                address: homeServiceLocation.address,
                city: homeServiceLocation.city,
                state: homeServiceLocation.state,
                pincode: homeServiceLocation.pincode,
                landmark: homeServiceLocation.landmark || '',
                lat: Number(homeServiceLocation.lat),
                lng: Number(homeServiceLocation.lng)
              }
            }),
            // Add travel time fields -- Pass null/undefined to let backend calculate if not available
            travelTime: undefined,
            bufferBefore: 0,
            bufferAfter: 0,
            blockingWindows: []
          };

          // DEBUG: Log the complete appointment data being sent
          console.log("\n🚀 === ABOUT TO CREATE APPOINTMENT ===");
          console.log("Appointment Data:", {
            startTime: appointmentData.startTime,
            endTime: appointmentData.endTime,
            duration: appointmentData.duration,
            isMultiService: appointmentData.isMultiService,
            serviceItemsCount: serviceItems.length,
            serviceItems: serviceItems.map(si => ({
              serviceName: si.serviceName,
              staffName: si.staffName,
              startTime: si.startTime,
              endTime: si.endTime,
              duration: si.duration
            })),
            isHomeService: appointmentData.isHomeService
            // homeServiceLocation is added conditionally to appointmentData but not logged here due to type constraints
          });
          console.log("========================================\n");

          // Log all required fields to make sure they're present
          console.log("Required fields check:", {
            vendorId: appointmentData.vendorId,
            client: appointmentData.client,
            clientName: appointmentData.clientName,
            service: appointmentData.service,
            serviceName: appointmentData.serviceName,
            staff: appointmentData.staff,
            staffName: appointmentData.staffName,
            date: appointmentData.date,
            booking_mode: bookingMode
          });

          // Create the appointment using the mutation
          console.log("Creating appointment via mutation...");

          try {
            const result = await createAppointment(appointmentData).unwrap();
            console.log("Appointment created successfully:", result);

            // Handle online payment trigger if needed
            if (method === 'Pay Online' && result.data?.finalAmount > 0) {
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
          } catch (error) {
            console.error("Error during appointment creation mutation:", error);
            throw error;
          }

          // Close the payment modal
          setIsPaymentModalOpen(false);

          // Show confirmation message with toast
          toast.success(`Booking Confirmed! Payment Method: ${method}\nAppointment created successfully with ${finalServiceSchedule.length} services.`);

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
    }
  };
  // Add a function to refetch appointment data after creation
  const refetchAppointments = async () => {
    // This function can be called after appointment creation to ensure data is refreshed
    console.log("Refetching appointment data...");
  };

  // Handle service selection
  const handleSelectService = (service: Service) => {
    // Validate service data before processing
    if (!service || !service.id) {
      console.error('Invalid service data:', service);
      return;
    }

    // Ensure service has all required properties
    if (!service.name) {
      console.error('Service missing name property:', service);
      return;
    }

    console.log('handleSelectService called with:', service);
    console.log('Service properties:', {
      id: service.id,
      name: service.name,
      price: service.price,
      hasId: !!service.id,
      hasName: !!service.name,
      hasPrice: !!service.price,
      serviceKeys: Object.keys(service)
    });

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

        // Clear wedding package selection when individual service is selected
        setSelectedWeddingPackage(null);

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

  // Handle wedding package selection
  const handleSelectWeddingPackage = (pkg: WeddingPackage | null) => {
    console.log('handleSelectWeddingPackage called with:', pkg);
    setSelectedWeddingPackage(pkg);

    if (pkg) {
      // Package selected - keep on step 1 to show decision modal
      // Don't auto-advance, let the rendering logic show the decision modal
      setWeddingPackageMode(null); // Reset mode to trigger decision modal
    }

    // Clear individual service selection when package is selected
    setSelectedServices([]);
    setSelectedService(null);
    setServiceStaffAssignments([]);
    setIsCustomizingPackage(false);
    setCustomizedPackageServices([]);
  };

  // Handle wedding package customization start
  const handleCustomizePackage = () => {
    if (selectedWeddingPackage) {
      setIsCustomizingPackage(true);
      setWeddingPackageMode('customized');
      // Initialize customized services from package
      const packageServices = selectedWeddingPackage.services.map(pkgSvc => {
        const service = services.find(s => s.id === pkgSvc.serviceId);
        return service;
      }).filter(Boolean) as Service[];
      setCustomizedPackageServices(packageServices);
    }
  };

  // Handle proceeding with default package
  const handleProceedWithDefault = () => {
    if (selectedWeddingPackage) {
      setWeddingPackageMode('default');
      setIsCustomizingPackage(false);
      // Skip staff selection for wedding packages - go directly to time slots
      setCurrentStep(3);
    }
  };

  // Handle customization complete
  const handleCustomizationComplete = (customServices: Service[]) => {
    setCustomizedPackageServices(customServices);
    setIsCustomizingPackage(false);
    // Skip staff selection for wedding packages - go directly to time slots
    setCurrentStep(3);
  };

  // Handle back from customization
  const handleBackFromCustomization = () => {
    setIsCustomizingPackage(false);
    setWeddingPackageMode(null);
    setCustomizedPackageServices([]);
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

      // Add a simple test to ensure we always return something (allow up to step 5 for wedding packages)
      if (currentStep < 1 || currentStep > 5) {
        console.warn('Invalid currentStep value:', currentStep);
        return <div className="w-full py-12 text-center">Invalid step: {currentStep}</div>;
      }

      // Add a simple test to see if we're getting to this point
      console.log('renderStepContent - About to render step:', currentStep);

      // Show skeleton loader while services are being fetched
      if (isLoading) {
        return (
          <div className="w-full space-y-6">
            {/* Skeleton for service categories */}
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skeleton for continue button */}
            <div className="flex justify-end">
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        );
      }

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

          // If wedding package selected and customization started, show customizer
          if (selectedWeddingPackage && isCustomizingPackage) {
            return (
              <div className="w-full max-w-4xl mx-auto space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <button
                    onClick={() => handleBackFromCustomization()}
                    className="hover:text-primary transition-colors"
                  >
                    Packages
                  </button>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-primary font-medium">Customize Package</span>
                </div>

                {/* Package Header */}
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-rose-100 rounded-full">
                        <Heart className="h-6 w-6 text-rose-600" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold">{selectedWeddingPackage.name}</h2>
                        <p className="text-muted-foreground mt-1">{selectedWeddingPackage.description}</p>
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedWeddingPackage.duration} min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Scissors className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedWeddingPackage.services.length} services</span>
                          </div>
                          <div className="flex items-center gap-2 ml-auto">
                            <span className="text-2xl font-bold text-primary">
                              ₹{selectedWeddingPackage.discountedPrice || selectedWeddingPackage.totalPrice}
                            </span>
                            {selectedWeddingPackage.discountedPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{selectedWeddingPackage.totalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customization Interface */}
                <Step1_WeddingPackageCustomizer
                  weddingPackage={selectedWeddingPackage}
                  allServices={services}
                  onPackageUpdate={(updatedPackage, customServices) => {
                    handleCustomizationComplete(customServices);
                  }}
                  onBack={handleBackFromCustomization}
                  currentStep={1}
                  setCurrentStep={setCurrentStep}
                />
              </div>
            );
          }

          // Wedding package is handled inline in Step1_Services component
          // No separate modal or screen needed

          // Default: Show service selection with wedding packages
          return (
            <Step1_Services
              selectedServices={selectedServices}
              onSelectService={handleSelectService}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              services={services}
              servicesByCategory={servicesByCategory}
              categories={categories}
              isLoading={isLoading}
              error={error}
              onServiceSelect={handleSelectService}
              weddingPackages={weddingPackages}
              onWeddingPackageSelect={handleSelectWeddingPackage}
              selectedWeddingPackage={selectedWeddingPackage}
              bookingMode={bookingMode}
              setBookingMode={handleBookingModeChange}
            />
          );
        case 2:
          console.log('Rendering Step2 - Wedding Package Mode:', weddingPackageMode);

          // Wedding Package Flow - Skip staff selection and go directly to time/date
          if (selectedWeddingPackage && weddingPackageMode) {
            // Automatically advance to step 3 for wedding packages
            setCurrentStep(3);
            return null;
          }


          // Regular service flow
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
                <div className="w-full space-y-6">
                  {/* Skeleton for staff selection */}
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      ))}
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
          break;

        case 3:
          console.log('Rendering Step3 - Wedding Package:', selectedWeddingPackage, 'isMultiService:', isMultiService);

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

          // CENTRALIZED TIME SLOT GENERATION FOR ALL SERVICE TYPES
          // Determine service data for time slot generation
          let serviceForTimeSlot;
          let totalDuration = 0;

          if (selectedWeddingPackage) {
            // Wedding package
            const packageServices = weddingPackageMode === 'customized' ? customizedPackageServices : selectedWeddingPackage.services;
            totalDuration = selectedWeddingPackage.duration || packageServices.reduce((total, service: any) => {
              const dur = service.duration || service.serviceDuration || 0;
              const duration = convertDurationToMinutes(dur);
              return total + (duration || 0);
            }, 0);

            serviceForTimeSlot = {
              id: selectedWeddingPackage.id || (selectedWeddingPackage as any)._id || 'wedding-package',
              name: selectedWeddingPackage.name,
              duration: `${totalDuration} min`,
              price: (selectedWeddingPackage.discountedPrice || selectedWeddingPackage.totalPrice).toString(),
              category: 'Wedding Package',
              description: selectedWeddingPackage.description
            } as any;
          } else if (isMultiService) {
            // Multi-service
            totalDuration = selectedServices.reduce((total, service) => {
              const duration = convertDurationToMinutes(service.duration);
              return total + (duration || 0);
            }, 0);

            serviceForTimeSlot = {
              id: 'multi-service',
              name: `${selectedServices.length} Services`,
              duration: `${totalDuration} min`,
              price: selectedServices.reduce((total, s) => total + Number(s.discountedPrice || s.price || 0), 0).toString(),
              category: 'Multi-Service',
              description: selectedServices.map(s => s.name).join(', ')
            } as any;
          } else {
            // Single service
            if (selectedServices.length === 0) {
              console.warn('Step3 Rendering: No services selected for single service flow');
              return (
                <div className="w-full py-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <p className="text-muted-foreground">No services selected. Please go back and select a service.</p>
                    <Button onClick={() => setCurrentStep(1)}>Go to Step 1</Button>
                  </div>
                </div>
              );
            }
            const service = selectedServices[0];
            const duration = convertDurationToMinutes(service?.duration || 0);
            totalDuration = duration || 0;
            serviceForTimeSlot = service;
          }

          // UNIFIED TIME SLOT SELECTOR - Same UI for all service types
          return isMultiService ? (
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
          ) : (
            <TimeSlotSelector
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              selectedStaff={selectedStaff}
              onSelectStaff={setSelectedStaff}
              staff={selectedStaff ? [selectedStaff] : staff}
              workingHours={workingHours}
              isLoading={false}
              error={null}
              salonId={salonId as string}
              service={serviceForTimeSlot}
              isWeddingPackage={!!selectedWeddingPackage}
              weddingPackage={selectedWeddingPackage}
              weddingPackageServices={selectedWeddingPackage ? (weddingPackageMode === 'customized' ? customizedPackageServices : selectedWeddingPackage.services) : undefined}
              onLockAcquired={setSlotLockToken}
            />
          );
          break;

        case 4:
          // Step 4: Location Selection (for wedding packages and home services)
          console.log('Rendering Step4 - Wedding Package or Service Location');

          if (selectedWeddingPackage) {
            // Wedding package: Always show location selection since weddings are typically at venue
            return (
              <div className="w-full space-y-6">
                {/* Wedding Package Info */}
                <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-white">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-rose-600" />
                      Select Wedding Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Wedding services can be provided at your venue or at our salon. Please select your preferred location.
                    </div>

                    {/* Location Options */}
                    <div className="space-y-3">
                      <Card
                        className={`cursor-pointer transition-all ${bookingMode === 'salon' ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-200' : 'border-gray-200 hover:border-rose-300'}`}
                        onClick={() => handleBookingModeChange('salon')}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${bookingMode === 'salon' ? 'border-rose-500' : 'border-gray-300'}`}>
                              {bookingMode === 'salon' && <div className="h-3 w-3 rounded-full bg-rose-500" />}
                            </div>
                            <div>
                              <div className="font-medium">At Salon</div>
                              <div className="text-sm text-muted-foreground">Come to our salon</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all ${bookingMode === 'home' ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-200' : 'border-gray-200 hover:border-rose-300'}`}
                        onClick={() => handleBookingModeChange('home')}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${bookingMode === 'home' ? 'border-rose-500' : 'border-gray-300'}`}>
                              {bookingMode === 'home' && <div className="h-3 w-3 rounded-full bg-rose-500" />}
                            </div>
                            <div>
                              <div className="font-medium">Wedding Venue</div>
                              <div className="text-sm text-muted-foreground">We'll come to your venue</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Location Details for Wedding Venue */}
                    {bookingMode === 'home' && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Wedding Venue Location</h3>
                          {homeServiceLocation && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowMapSelector(true)}
                            >
                              Change Location
                            </Button>
                          )}
                        </div>

                        {homeServiceLocation ? (
                          <Card className="bg-green-50 border-green-200">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                  <div className="font-medium text-green-900">Location Selected</div>
                                  <div className="text-sm text-green-700 mt-1">{homeServiceLocation.address}</div>
                                  <div className="text-xs text-green-600 mt-2">
                                    Click "Confirm Booking" button below to proceed
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <Button
                            onClick={() => setShowMapSelector(true)}
                            className="w-full"
                            variant="outline"
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Select Location on Map
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          }

          // Regular service location selection (existing logic would go here)
          return <div className="w-full py-12 text-center">Location selection for regular services</div>;

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

  // Calculate price breakdown when selected services or wedding package changes
  useEffect(() => {
    const calculatePrices = async () => {
      // Handle wedding package pricing
      if (selectedWeddingPackage) {
        const packagePrice = selectedWeddingPackage.discountedPrice || selectedWeddingPackage.totalPrice || 0;
        const defaultBreakdown = {
          subtotal: packagePrice,
          discountAmount: 0,
          amountAfterDiscount: packagePrice,
          platformFee: 0,
          serviceTax: 0,
          vendorServiceTax: 0,
          totalTax: 0,
          finalTotal: packagePrice,
          taxFeeSettings: null
        };
        setPriceBreakdown(defaultBreakdown);
        return;
      }

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
  }, [selectedServices, selectedWeddingPackage, offer, taxFeeSettings]);

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
        <Button variant="ghost" onClick={handlePrevStep} className="flex items-center text-md gap-2">
          <ChevronLeft className="mr-1 h-6 w-6" />
          {currentStep === 1 ? 'Back' : 'Back'}
        </Button>

        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <X className="h-6 w-6" />
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
              selectedServices={selectedWeddingPackage ? [] : selectedServices}
              selectedStaff={selectedStaff}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onNextStep={handleNextStep}
              currentStep={currentStep}
              salonInfo={salonInfo}
              serviceStaffAssignments={serviceStaffAssignments}
              priceBreakdown={priceBreakdown}
              weddingPackage={selectedWeddingPackage}
              weddingPackageMode={weddingPackageMode}
              customizedPackageServices={customizedPackageServices}
              onEditPackage={handleCustomizePackage}
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
          weddingPackage={selectedWeddingPackage}
          weddingPackageMode={weddingPackageMode}
          customizedPackageServices={customizedPackageServices}
          onEditPackage={handleCustomizePackage}
        />
      </div>

      {/* Home Service Location Modal */}
      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogContent className="sm:max-w-2xl h-[95vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Home Service Location
            </DialogTitle>
            <DialogDescription className="text-sm">
              Please provide your address for the home service appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="py-0 space-y-0 flex-grow flex flex-col">
            {/* Full screen map selector - only element in the modal */}
            <div className="space-y-3 flex flex-col flex-grow">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Select Location on Map</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                    onClick={handleGetCurrentLocation}
                  >
                    <MapPin className="h-3 w-3" />
                    Use Current
                  </button>
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:underline"
                    onClick={() => {
                      setShowLocationModal(false);
                      setShowMapSelector(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className="flex-grow rounded-lg overflow-hidden border flex flex-col">
                <div className="flex-grow">
                  <GoogleMapSelector
                    onLocationSelect={async (lat: number, lng: number) => {
                      setLocationForm(prev => ({
                        ...prev,
                        lat,
                        lng
                      }));

                      // Automatically fetch address details from coordinates
                      fetchAddressDetails(lat, lng);
                    }}
                    initialLat={locationForm.lat}
                    initialLng={locationForm.lng}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500 flex justify-between items-center">
                <span className="truncate">
                  {locationForm.lat && locationForm.lng ? (
                    <span>Lat: {locationForm.lat.toFixed(6)}, Lng: {locationForm.lng.toFixed(6)}</span>
                  ) : (
                    <span>No location selected</span>
                  )}
                </span>
                {locationForm.lat && locationForm.lng && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Selected
                  </span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              setShowLocationModal(false);
              setShowMapSelector(false);
            }}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleLocationSubmit}>
              Save Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmationModalOpen} onOpenChange={setIsConfirmationModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center pb-2 bg-gradient-to-r from-background to-primary/5 rounded-t-xl">
            <div className="mx-auto bg-primary/10 p-3 rounded-full mb-3 animate-pulseOnce">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            {/* V2 Update: Changed title to verify deployment */}
            <DialogTitle className="text-2xl font-bold">Confirm Appointment Details</DialogTitle>
            <DialogDescription className="text-center mt-2 text-muted-foreground">
              Please review your service and payment details
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6 animate-fadeIn bg-background/50 rounded-b-xl">
            {/* Salon Info */}
            <Card className="bg-background/80 border-l-4 border-l-primary shadow-sm">
              <CardHeader className="pb-3 bg-primary/5 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-primary" />
                  Salon Information
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Booking details for your selected salon
                </p>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-gray-100">
                  <div className="bg-primary/10 p-2 rounded-lg mt-0.5">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-base">{salonInfo?.name}</div>
                    <div className="text-muted-foreground text-sm mt-1">{salonInfo?.address}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card className="bg-background/80 border-l-4 border-l-primary shadow-sm">
              <CardHeader className="pb-3 bg-primary/5 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2">
                  <List className="h-5 w-5 text-primary" />
                  Selected Services
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected for your appointment
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-3">
                  {selectedServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-gray-100 hover:bg-white/80 transition-colors">
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          <Scissors className="h-4 w-4 text-primary" />
                          {service.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {service.duration}
                          {service.staff && service.staff.length > 0 && (
                            <>
                              <span>•</span>
                              <User className="h-3 w-3" />
                              {service.staff.length} staff available
                            </>
                          )}
                        </div>
                      </div>
                      <div className="font-semibold text-primary">₹{service.price}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-3 font-semibold text-lg border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    Subtotal
                  </div>
                  <div className="text-primary">₹{totalAmount.toFixed(2)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Offer Code Section */}
            <Card className="bg-background/80 border-l-4 border-l-primary shadow-lg rounded-xl overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-xl border-b border-gray-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="bg-primary/10 p-1.5 rounded-lg">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  Apply Discount Code
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter a discount code or browse available offers to reduce your total amount
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Offer Code Input with Dropdown */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        id="offer-input"
                        type="text"
                        placeholder="Enter discount code (e.g. SAVE10)"
                        value={offerCode}
                        onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                        onFocus={() => vendorOffers && vendorOffers.length > 0 && setShowOfferDropdown(true)}
                        className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm focus:shadow-md"
                      />
                      {vendorOffers && vendorOffers.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowOfferDropdown(!showOfferDropdown)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary bg-white border border-gray-200 rounded-md p-1 shadow-sm"
                          aria-label="Browse offers"
                        >
                          <Search className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <Button
                      onClick={handleApplyOffer}
                      disabled={!offerCode.trim()}
                      className="bg-primary hover:bg-primary/90 px-4 flex items-center gap-2"
                    >
                      {isOffersLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>

                  {/* Offer Dropdown */}
                  {showOfferDropdown && vendorOffers && vendorOffers.length > 0 && (
                    <div id="offer-dropdown" className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-2xl border-gray-200 overflow-hidden">
                      <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Search available offers..."
                            value={offerSearchTerm}
                            onChange={(e) => setOfferSearchTerm(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border-0 focus:ring-0 p-0 bg-transparent"
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1">
                        {isOffersLoading ? (
                          <div className="p-6 text-center text-sm text-muted-foreground">
                            <div className="flex justify-center mb-3">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                            <p>Loading available offers...</p>
                            <p className="text-xs mt-1 text-muted-foreground/70">Please wait while we fetch the best deals for you</p>
                          </div>
                        ) : filteredOffers.length > 0 ? (
                          filteredOffers.map((offer: { _id: string; code: string; type: string; value: number }) => (
                            <div
                              key={offer._id}
                              className="px-4 py-3 hover:bg-primary/5 cursor-pointer border-b last:border-b-0 transition-colors flex justify-between items-center group"
                              onClick={() => handleSelectOffer(offer)}
                            >
                              <div>
                                <div className="font-bold text-primary group-hover:text-primary/80">{offer.code}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {offer.type === 'percentage' ? `${offer.value}% off` : `₹${offer.value} off`}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full group-hover:bg-primary/20 transition-colors">
                                  Click to apply
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-sm text-muted-foreground">
                            <div className="mx-auto bg-gray-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                              <Search className="h-5 w-5 text-muted-foreground/50" />
                            </div>
                            <p className="font-medium">No offers found</p>
                            <p className="text-xs mt-1 text-muted-foreground/70">Try adjusting your search terms</p>
                          </div>
                        )}
                      </div>
                      <div className="px-3 py-2 text-xs text-muted-foreground border-t border-gray-100 bg-gray-50/50">
                        Showing {filteredOffers.length} of {vendorOffers.length} offers
                      </div>
                    </div>
                  )}
                </div>

                {/* Applied Offer Details */}
                {appliedOffer && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-xl text-sm space-y-3 animate-fadeIn shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="bg-green-500 p-2 rounded-full mt-0.5">
                          <Star className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-green-800 flex items-center gap-2 text-base">
                            {appliedOffer.code}
                            <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                              Applied
                            </span>
                          </div>
                          <div className="text-green-700 text-sm mt-1 font-medium">
                            {appliedOffer.type === 'percentage' ? `${appliedOffer.value}% discount` : `₹${appliedOffer.value} discount`}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearOffer}
                        className="h-7 px-2 text-xs border-green-300 text-green-700 hover:bg-green-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-green-700 text-xs bg-white/50 px-3 py-2 rounded-lg border border-green-100">
                      <span className="font-semibold">Success!</span> Your discount has been applied to the total amount.
                    </div>
                  </div>
                )}

                {/* No Offers Message */}
                {!vendorOffers || vendorOffers.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                    <div className="mx-auto bg-gray-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                      <Star className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      No discount offers available at this time
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Check back later for exciting deals and discounts!
                    </p>
                  </div>
                ) : null}

                {/* Offer Tips */}
                <div className="text-xs text-muted-foreground bg-blue-50/50 border border-blue-100 rounded-xl p-4 shadow-sm">
                  <div className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Important Offer Information
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="bg-blue-100 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px]">1</span>
                      </div>
                      <span>Offers can only be applied once per booking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-blue-100 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px]">2</span>
                      </div>
                      <span>Some offers may have minimum purchase requirements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-blue-100 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px]">3</span>
                      </div>
                      <span>Multiple offers cannot be combined</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Details */}
            <Card className="bg-background/80 border-l-4 border-l-primary shadow-sm">
              <CardHeader className="pb-3 bg-primary/5 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Appointment Details
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Date, time, and professional for your appointment
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-gray-100">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</div>
                      <div className="text-muted-foreground text-xs mt-1">Appointment Date</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-gray-100">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{selectedTime}</div>
                      <div className="text-muted-foreground text-xs mt-1">Appointment Time</div>
                    </div>
                  </div>
                  {selectedStaff && (
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-gray-100 sm:col-span-2">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{selectedStaff ? selectedStaff.name : 'Any Professional'}</div>
                        <div className="text-muted-foreground text-xs mt-1">Assigned Professional</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card className="bg-background/80 border-l-4 border-l-primary shadow-sm">
              <CardHeader className="pb-3 bg-primary/5 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Customer Information
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Your contact details and appointment location
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-gray-100">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <UserCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{customerInfo?.name || 'Guest User'}</div>
                      <div className="text-muted-foreground text-xs mt-1">Full Name</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-gray-100">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{customerInfo?.phone || 'Not provided'}</div>
                      <div className="text-muted-foreground text-xs mt-1">Phone Number</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-gray-100 sm:col-span-2">
                    <div className="bg-primary/10 p-2 rounded-lg mt-0.5">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{homeServiceLocation?.address || salonInfo?.address || 'Salon Address'}</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        {homeServiceLocation ? 'Home Service Location' : 'Appointment Location'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Amount */}
            <Card className="bg-background/80 border-l-4 border-l-primary shadow-sm">
              <CardHeader className="pb-3 bg-primary/5 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Summary
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Final amount to be paid for your appointment
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-3 bg-white/50 rounded-lg border border-gray-100 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      Subtotal
                    </div>
                    <div className="font-medium">₹{totalAmount.toFixed(2)}</div>
                  </div>
                  {appliedOffer && (
                    <div className="flex items-center justify-between text-sm text-green-600 bg-green-50/50 p-3 rounded-lg border border-green-100">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-100 p-1 rounded-full">
                          <Star className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold">Discount Applied</div>
                          <div className="text-xs text-green-700">{appliedOffer.code}</div>
                        </div>
                      </div>
                      <div className="font-semibold text-lg">
                        -₹{(appliedOffer.type === 'percentage' ? (totalAmount * appliedOffer.value) / 100 : appliedOffer.value).toFixed(2)}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 font-semibold text-lg">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Total Amount
                    </div>
                    <div className="text-primary">
                      ₹{(
                        totalAmount -
                        (appliedOffer ?
                          (appliedOffer.type === 'percentage' ? (totalAmount * appliedOffer.value) / 100 : appliedOffer.value)
                          : 0)
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                  <div className="font-medium text-blue-800 mb-1 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Payment Information
                  </div>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Payment will be collected at the salon</li>
                    <li>All prices include applicable taxes</li>
                    <li>Prices may vary based on service requirements</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            {/* Payment Method Selection */}
            <Card className="bg-background/80 border-l-4 border-l-primary shadow-sm mt-4">
              <CardHeader className="pb-3 bg-primary/5 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Select Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'Pay at Salon' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => setPaymentMethod('Pay at Salon')}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'Pay at Salon' ? 'border-primary' : 'border-gray-400'}`}>
                    {paymentMethod === 'Pay at Salon' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Pay at Salon</div>
                    <div className="text-muted-foreground text-xs">Pay with cash or card after your service</div>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'Pay Online' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => setPaymentMethod('Pay Online')}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'Pay Online' ? 'border-primary' : 'border-gray-400'}`}>
                    {paymentMethod === 'Pay Online' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Pay Online</div>
                    <div className="text-muted-foreground text-xs">Securely pay now using UPI, Card, or Netbanking</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter className="sm:justify-end gap-3 pt-4 border-t border-gray-200 mt-2">
            <Button variant="outline" onClick={() => setIsConfirmationModalOpen(false)} className="px-6">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
            <Button onClick={handleFinalBookingConfirmation} className="bg-primary hover:bg-primary/90 px-6">
              Confirm & Proceed
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-green-600">
              <div className="flex flex-col items-center gap-2">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                Appointment Confirmed!
              </div>
            </DialogTitle>
            <DialogDescription className="text-center">
              Your appointment has been successfully booked. A confirmation has been sent to your email.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</div>
                    <div className="text-muted-foreground text-xs">Date</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{selectedTime}</div>
                    <div className="text-muted-foreground text-xs">Time</div>
                  </div>
                </div>
                {selectedStaff && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{selectedStaff ? selectedStaff.name : 'Any Professional'}</div>
                      <div className="text-muted-foreground text-xs">Professional</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{customerInfo?.name || 'Guest User'}</div>
                    <div className="text-muted-foreground text-xs">Name</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{customerInfo?.phone || 'Not provided'}</div>
                    <div className="text-muted-foreground text-xs">Phone</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">{homeServiceLocation?.address || 'Salon Address'}</div>
                    <div className="text-muted-foreground text-xs">
                      {homeServiceLocation ? 'Home Service Location' : 'Appointment Location'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-primary" />
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {selectedServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between py-1">
                    <div className="flex-1">
                      <div className="font-medium">{service.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {service.duration}
                      </div>
                    </div>
                    <div className="font-semibold">₹{service.price}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div>Subtotal</div>
                  <div>₹{totalAmount.toFixed(2)}</div>
                </div>
                {appliedOffer && (
                  <div className="flex items-center justify-between text-green-600">
                    <div>Discount ({appliedOffer.code})</div>
                    <div className="font-medium">
                      -₹{(appliedOffer.type === 'percentage' ? (totalAmount * appliedOffer.value) / 100 : appliedOffer.value).toFixed(2)}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t font-semibold">
                  <div>Total Paid</div>
                  <div className="text-primary">
                    ₹{(
                      totalAmount -
                      (appliedOffer ?
                        (appliedOffer.type === 'percentage' ? (totalAmount * appliedOffer.value) / 100 : appliedOffer.value)
                        : 0)
                    ).toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 p-3 rounded-md text-sm">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-blue-800">Next Steps</div>
                  <div className="text-blue-700 text-xs mt-1">
                    You will receive a reminder 1 hour before your appointment. Please arrive 10 minutes early.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsSuccessModalOpen(false)}>
              Close
            </Button>
            <Button size="sm" onClick={() => router.push('/profile/appointments')} className="bg-primary hover:bg-primary/90">
              View Appointments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Schedule Dialog */}
      <Dialog open={isServiceScheduleOpen} onOpenChange={setIsServiceScheduleOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Service Schedule</DialogTitle>
            <DialogDescription className="text-center">
              Review your service schedule before confirming your appointment
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
            {/* Service Schedule Card */}
            <Card className="bg-background/80 border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Detailed Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {serviceSchedule.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-start border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{schedule.service.name}</div>
                      <div className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                        <User className="h-3 w-3" />
                        with {schedule.staff ? schedule.staff.name : 'Any Professional'}
                      </div>
                      <div className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {schedule.startTime} - {schedule.endTime} ({schedule.duration} min)
                      </div>
                    </div>
                    <div className="text-right">
                      {schedule.service.discountedPrice !== null && schedule.service.discountedPrice !== undefined && schedule.service.discountedPrice !== schedule.service.price ? (
                        <>
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-muted-foreground line-through text-sm">
                              ₹{schedule.service.price}
                            </span>
                            <span className="font-semibold text-lg">
                              ₹{schedule.service.discountedPrice}
                            </span>
                          </div>
                          <div className="text-xs text-green-600 font-medium mt-1">
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
                        <div className="font-semibold text-lg">
                          ₹{schedule.service.price}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-primary/80">Total Amount</div>
                    <div className="text-2xl font-bold text-primary">
                      ₹{priceBreakdown?.finalTotal.toFixed(2) || selectedServices.reduce((acc, s) => {
                        const price = s.discountedPrice !== null && s.discountedPrice !== undefined ?
                          parseFloat(s.discountedPrice) :
                          parseFloat(s.price || '0');
                        return acc + price;
                      }, 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    {serviceSchedule.length} {serviceSchedule.length === 1 ? 'Service' : 'Services'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsServiceScheduleOpen(false)} className="w-full">
              Continue to Confirmation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Schedule Dialog */}
      <Dialog open={isStaffScheduleOpen} onOpenChange={setIsStaffScheduleOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Staff Schedule</DialogTitle>
            <DialogDescription className="text-center">Review your staff schedule before confirming.</DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Staff Schedule Card */}
            <div>
              <Card className="bg-background/80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Staff Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {staffSchedule.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <div className="font-semibold">{schedule.staff.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">Available</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsStaffScheduleOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Location Form */}
      <Dialog open={isLocationFormOpen} onOpenChange={setIsLocationFormOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Enter Home Service Location</DialogTitle>
            <DialogDescription className="text-center">Please enter the address where you would like the service to be provided.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Enter your address"
                value={locationForm.address}
                onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Enter your city"
                value={locationForm.city}
                onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                placeholder="Enter your pincode"
                value={locationForm.pincode}
                onChange={(e) => setLocationForm({ ...locationForm, pincode: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsLocationFormOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleLocationFormSubmit} className="bg-primary hover:bg-primary/90">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Info Form */}
      <Dialog open={isCustomerInfoFormOpen} onOpenChange={setIsCustomerInfoFormOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Enter Customer Information</DialogTitle>
            <DialogDescription className="text-center">Please enter the customer's details for the appointment.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter customer's name"
                value={customerInfoForm.name}
                onChange={(e) => setCustomerInfoForm({ ...customerInfoForm, name: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="Enter customer's phone number"
                value={customerInfoForm.phone}
                onChange={(e) => setCustomerInfoForm({ ...customerInfoForm, phone: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsCustomerInfoFormOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCustomerInfoFormSubmit} className="bg-primary hover:bg-primary/90">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Selection Dialog */}
      <Dialog open={isStaffSelectionOpen} onOpenChange={setIsStaffSelectionOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Select Professional</DialogTitle>
            <DialogDescription className="text-center">Please select a professional for the appointment.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="staff">Professional</Label>
              <Select
                value={selectedStaffId}
                onValueChange={(value) => setSelectedStaffId(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a professional" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsStaffSelectionOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleStaffSelection} className="bg-primary hover:bg-primary/90">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Selection Dialog */}
      <Dialog open={isTimeSelectionOpen} onOpenChange={setIsTimeSelectionOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Select Time</DialogTitle>
            <DialogDescription className="text-center">Please select a time for the appointment.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="time">Time</Label>
              <Select
                value={selectedTime || undefined}
                onValueChange={(value) => setSelectedTime(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsTimeSelectionOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleTimeSelection} className="bg-primary hover:bg-primary/90">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Date Selection Dialog */}
      <Dialog open={isDateSelectionOpen} onOpenChange={setIsDateSelectionOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Select Date</DialogTitle>
            <DialogDescription className="text-center">Please select a date for the appointment.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => date && setSelectedDate(date)}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsDateSelectionOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleDateSelection} className="bg-primary hover:bg-primary/90">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Selection Dialog */}
      <Dialog open={isServiceSelectionOpen} onOpenChange={setIsServiceSelectionOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Select Services</DialogTitle>
            <DialogDescription className="text-center">Please select the services for the appointment.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="services">Services</Label>
              <Select
                value={selectedServiceIds[0] || ''}
                onValueChange={(value) => setSelectedServiceIds([value])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select services" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsServiceSelectionOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleServiceSelection} className="bg-primary hover:bg-primary/90">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vendor Selection Dialog */}
      <Dialog open={isVendorSelectionOpen} onOpenChange={setIsVendorSelectionOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Select Vendor</DialogTitle>
            <DialogDescription className="text-center">Please select a vendor for the appointment.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Select
                value={selectedVendorId}
                onValueChange={(value) => setSelectedVendorId(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsVendorSelectionOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleVendorSelection} className="bg-primary hover:bg-primary/90">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Google Map Selector Modal for Wedding Package Location */}
      <Dialog open={showMapSelector} onOpenChange={setShowMapSelector}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Select Wedding Venue Location</DialogTitle>
            <DialogDescription>
              Click on the map to select the exact location of your wedding venue.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[500px] w-full">
            <GoogleMapSelector
              onLocationSelect={(lat, lng) => {
                console.log('Location selected from map:', { lat, lng });
                console.log('Is wedding package:', !!selectedWeddingPackage);
                console.log('Is authenticated:', isAuthenticated);

                // Fetch address from coordinates
                fetchAddressDetails(lat, lng);

                setHomeServiceLocation({
                  address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, // Temporary, will be updated by fetchAddressDetails
                  coordinates: { lat, lng }
                });

                setLocationForm(prev => ({
                  ...prev,
                  lat,
                  lng
                }));
              }}
              initialLat={homeServiceLocation?.coordinates?.lat || locationForm.lat}
              initialLng={homeServiceLocation?.coordinates?.lng || locationForm.lng}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMapSelector(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log('=== Location Confirm Button Clicked ===');
                console.log('Location Form:', locationForm);
                console.log('Selected Wedding Package:', selectedWeddingPackage);
                console.log('Selected Time:', selectedTime);
                console.log('Booking Mode:', bookingMode);

                if (!locationForm.lat || !locationForm.lng) {
                  toast.error('Please select a location on the map');
                  return;
                }

                if (!selectedTime) {
                  toast.error('Please select a time slot first');
                  setShowMapSelector(false);
                  setCurrentStep(3);
                  return;
                }

                // Set the home service location from the location form
                const newLocation = {
                  address: locationForm.address,
                  city: locationForm.city,
                  state: locationForm.state,
                  pincode: locationForm.pincode,
                  landmark: locationForm.landmark,
                  coordinates: {
                    lat: locationForm.lat,
                    lng: locationForm.lng
                  }
                };

                console.log('Setting homeServiceLocation to:', newLocation);
                setHomeServiceLocation(newLocation);

                // Close map modal
                setShowMapSelector(false);
                toast.success('Location selected successfully. Click "Continue to Confirmation" to proceed.');

                console.log('Location saved. User can now click Continue to Confirmation button.');
              }}
              disabled={!locationForm.lat || !locationForm.lng}
            >
              Confirm Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty placeholder - modals are already defined above */}
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
