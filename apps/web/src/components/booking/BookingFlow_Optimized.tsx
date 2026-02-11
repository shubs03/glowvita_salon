"use client";

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useBookingData } from '@/hooks/useBookingData';
import { useAuth } from '@/hooks/useAuth';
import { Step1_Services } from './Step1_Services';
import { Step1_WeddingPackageCustomizer } from './Step1_WeddingPackageCustomizer';
import { Step2_Staff } from './Step2_Staff';
import { Step3_LocationSelection } from './Step3_LocationSelection';
import { Step3_TimeSlot } from './Step3_TimeSlot_Optimized';
import { Button } from '@repo/ui/button';
import { Service, StaffMember, WeddingPackage } from '@/hooks/useBookingData';
import { Heart, Scissors, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { GoogleMapSelector } from '@/components/GoogleMapSelector';
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from '@repo/config/config';

// Memoized wrapper for Step 2 with service data
const Step2WithServiceData = memo(({
  selectedStaff,
  onSelectStaff,
  currentStep,
  setCurrentStep,
  salonId,
  selectedService,
  isWeddingPackage = false,
  weddingPackage
}: {
  selectedStaff: StaffMember | null;
  onSelectStaff: (staff: StaffMember | null) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  salonId: string;
  selectedService: Service;
  isWeddingPackage?: boolean;
  weddingPackage?: WeddingPackage | null;
}) => {
  const serviceStaffData = useBookingData(salonId, selectedService.id);

  return (
    <Step2_Staff
      selectedStaff={selectedStaff}
      onSelectStaff={onSelectStaff}
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      staff={serviceStaffData.staff}
      isLoading={serviceStaffData.isLoading}
      error={serviceStaffData.error}
      selectedService={selectedService}
      isWeddingPackage={isWeddingPackage}
      weddingPackage={weddingPackage}
    />
  );
});
Step2WithServiceData.displayName = 'Step2WithServiceData';

// Memoized wrapper for Step 3 with service data
const Step3WithServiceData = memo(({
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  selectedStaff,
  onSelectStaff,
  currentStep,
  setCurrentStep,
  salonId,
  selectedService,
  baseData,
  isHomeService,
  isWeddingService,
  weddingPackage,
  homeServiceLocation
}: {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  selectedTime: string | null;
  onSelectTime: (time: string | null) => void;
  selectedStaff: StaffMember | null;
  onSelectStaff: (staff: StaffMember | null) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  salonId: string;
  selectedService: Service | null;
  baseData: any;
  isHomeService?: boolean;
  isWeddingService?: boolean;
  weddingPackage?: WeddingPackage | null;
  homeServiceLocation?: any;
}) => {
  const serviceStaffData = useBookingData(salonId, selectedService?.id);

  return (
    <Step3_TimeSlot
      selectedDate={selectedDate}
      onSelectDate={onSelectDate}
      selectedTime={selectedTime}
      onSelectTime={onSelectTime}
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      selectedStaff={selectedStaff}
      onSelectStaff={onSelectStaff}
      staff={serviceStaffData.staff}
      workingHours={baseData.workingHours}
      isLoading={baseData.isLoading || serviceStaffData.isLoading}
      error={baseData.error || serviceStaffData.error}
      vendorId={salonId}
      selectedService={selectedService}
      isHomeService={isHomeService}
      isWeddingService={isWeddingService}
      weddingPackage={weddingPackage}
      homeServiceLocation={homeServiceLocation}
    />
  );
});
Step3WithServiceData.displayName = 'Step3WithServiceData';

// Location capture component - memoized
const LocationCapture = memo(({
  homeServiceLocation,
  setHomeServiceLocation,
  homeServiceOption,
  isRequired
}: {
  homeServiceLocation: any;
  setHomeServiceLocation: (value: any) => void;
  homeServiceOption: 'home' | 'salon' | null;
  isRequired: boolean;
}) => {
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setHomeServiceLocation((prev: any) => ({ ...prev, lat, lng }));
  }, [setHomeServiceLocation]);

  const handleAddressChange = useCallback((field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setHomeServiceLocation((prev: any) => ({ ...prev, [field]: e.target.value }));
  }, [setHomeServiceLocation]);

  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        {homeServiceOption === 'home' ? 'Home Service Location' : 'Location Reference'}
      </h3>
      <p className="text-sm text-blue-700 mb-4">
        {homeServiceOption === 'home'
          ? 'Please provide your address where the service will be provided.'
          : 'Mark the location on the map for reference (optional).'
        }
      </p>

      <div className="space-y-4">
        {/* Address Input Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address {isRequired && '*'}
          </label>
          <input
            type="text"
            value={homeServiceLocation?.address || ''}
            onChange={handleAddressChange('address')}
            placeholder="Full street address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={isRequired}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City {isRequired && '*'}</label>
            <input
              type="text"
              value={homeServiceLocation?.city || ''}
              onChange={handleAddressChange('city')}
              placeholder="City"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={isRequired}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State {isRequired && '*'}</label>
            <input
              type="text"
              value={homeServiceLocation?.state || ''}
              onChange={handleAddressChange('state')}
              placeholder="State"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={isRequired}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode {isRequired && '*'}</label>
            <input
              type="text"
              value={homeServiceLocation?.pincode || ''}
              onChange={handleAddressChange('pincode')}
              placeholder="Pincode"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={isRequired}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
            <input
              type="text"
              value={homeServiceLocation?.landmark || ''}
              onChange={handleAddressChange('landmark')}
              placeholder="Nearby landmark"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Google Maps Integration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Pin Your Location {!isRequired && '(Optional)'}
          </label>
          <div className="h-64 border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <GoogleMapSelector
              onLocationSelect={handleLocationSelect}
              initialLat={homeServiceLocation?.lat || 19.0760}
              initialLng={homeServiceLocation?.lng || 72.8777}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Click on the map to set your exact location for accurate travel time calculation
          </p>
          {homeServiceLocation?.lat && homeServiceLocation?.lng && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
              ✓ Location pinned: {homeServiceLocation.lat.toFixed(4)}, {homeServiceLocation.lng.toFixed(4)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
LocationCapture.displayName = 'LocationCapture';

interface BookingFlowProps {
  salonId: string;
  onBookingComplete: (bookingData: any) => void;
}

export function BookingFlow({ salonId, onBookingComplete }: BookingFlowProps) {
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedWeddingPackage, setSelectedWeddingPackage] = useState<WeddingPackage | null>(null);
  const [customizedWeddingPackage, setCustomizedWeddingPackage] = useState<WeddingPackage | null>(null);
  const [isHomeService, setIsHomeService] = useState(false);
  const [isWeddingService, setIsWeddingService] = useState(false);
  const [showPackageCustomizer, setShowPackageCustomizer] = useState(false);
  const [homeServiceOption, setHomeServiceOption] = useState<'home' | 'salon' | null>(null);
  const [bookingMode, setBookingMode] = useState<'salon' | 'home'>('salon');
  const [homeServiceLocation, setHomeServiceLocation] = useState<{
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
    lat?: number;
    lng?: number;
  } | null>(null);

  // Get base data (services, working hours, salon info, wedding packages)
  const baseData = useBookingData(salonId);

  // Memoized handlers to prevent re-renders
  const handleSelectService = useCallback((service: Service) => {
    setSelectedServices([service]);
    setSelectedService(service);

    const serviceOption = (service as any).selectedServiceOption;
    if (serviceOption) {
      setHomeServiceOption(serviceOption);
      setIsHomeService(serviceOption === 'home');
    } else {
      const isHome = !!(service.homeService?.available || service.serviceHomeService?.available);
      setIsHomeService(isHome);
    }

    const isWedding = !!(service.weddingService?.available || service.serviceWeddingService?.available);
    setIsWeddingService(isWedding);

    setTimeout(() => setCurrentStep(2), 100);
  }, []);

  const handleSelectWeddingPackage = useCallback((pkg: WeddingPackage | null) => {
    setSelectedWeddingPackage(pkg);

    if (pkg === null) {
      setSelectedServices([]);
      setSelectedService(null);
      setIsHomeService(false);
      setIsWeddingService(false);
      return;
    }

    setSelectedServices([]);
    setSelectedService(null);
    setIsHomeService(false);
    setIsWeddingService(true);
    setTimeout(() => setCurrentStep(2), 100);
  }, []);

  const handleCustomizeWeddingPackage = useCallback(() => {
    setShowPackageCustomizer(true);
    setCurrentStep(2);
  }, []);

  const handlePackageUpdate = useCallback((updatedPackage: WeddingPackage, services: Service[]) => {
    setCustomizedWeddingPackage(updatedPackage);
    setSelectedServices(services);
    setShowPackageCustomizer(false);
    setTimeout(() => setCurrentStep(3), 100);
  }, []);

  const handleBackToPackages = useCallback(() => {
    setShowPackageCustomizer(false);
    setCurrentStep(1);
  }, []);

  // Auto-geocoding for addresses without lat/lng
  const geocodeAddress = useCallback(async () => {
    if (!homeServiceLocation || (homeServiceLocation.lat && homeServiceLocation.lng)) {
      return true;
    }

    const { address, city, state, pincode } = homeServiceLocation;
    if (!address || !city || !state || !pincode) {
      return false;
    }

    try {
      const fullAddress = `${address}, ${city}, ${state}, ${pincode}`;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results[0]) {
        const location = data.results[0].geometry.location;
        setHomeServiceLocation(prev => ({
          ...prev!,
          lat: location.lat,
          lng: location.lng
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Geocoding error:", error);
      return false;
    }
  }, [homeServiceLocation]);

  const handleNext = useCallback(async () => {
    if (currentStep === 1) {
      if (selectedServices.length === 0 && !selectedWeddingPackage && !customizedWeddingPackage) {
        toast.error("Please select at least one service or a wedding package");
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      // For home services, proceed to location selection (Step 3)
      // For salon services, proceed to time slot selection (Step 3)
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      // If home service, validate location and proceed to time slot (Step 4)
      if (bookingMode === 'home') {
        if (!homeServiceLocation) {
          toast.error("Please select your service location");
          return;
        }
        setCurrentStep(4);
      } else {
        // For salon services, Step 3 is time slot, proceed to Step 4 (booking details)
        if (!selectedTime) {
          toast.error("Please select a time slot");
          return;
        }
        setCurrentStep(4);
      }
      return;
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      onBookingComplete({
        services: selectedServices,
        staff: selectedStaff,
        date: selectedDate,
        time: selectedTime,
        salon: baseData.salonInfo,
        weddingPackage: customizedWeddingPackage || selectedWeddingPackage,
        isHomeService,
        isWeddingService,
        homeServiceLocation
      });
    }
  }, [currentStep, selectedServices, selectedWeddingPackage, customizedWeddingPackage, bookingMode,
    homeServiceLocation, selectedStaff, selectedDate, selectedTime, baseData.salonInfo,
    isWeddingService, onBookingComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Memoized validation
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (selectedServices.length > 0 && selectedService !== null) || selectedWeddingPackage !== null;
      case 2:
        if (showPackageCustomizer) {
          return customizedWeddingPackage !== null;
        }
        if (selectedWeddingPackage || customizedWeddingPackage) {
          return true;
        }
        return selectedStaff !== null;
      case 3:
        // For home services, validate location selection
        if (bookingMode === 'home') {
          return homeServiceLocation !== null;
        }
        // For salon services, validate time slot
        return selectedDate !== null && selectedTime !== null;
      case 4:
        return selectedDate !== null && selectedTime !== null;
      default:
        return false;
    }
  }, [currentStep, selectedServices, selectedService, selectedWeddingPackage, showPackageCustomizer,
    customizedWeddingPackage, selectedStaff, selectedDate, selectedTime, bookingMode, homeServiceLocation]);

  // Reset staff when service changes
  useEffect(() => {
    setSelectedStaff(null);
  }, [selectedService]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {currentStep === 1 && !showPackageCustomizer && (
        <Step1_Services
          selectedServices={selectedServices}
          onSelectService={handleSelectService}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          services={baseData.services}
          servicesByCategory={baseData.servicesByCategory}
          categories={baseData.categories}
          isLoading={baseData.isLoading}
          error={baseData.error}
          onServiceSelect={setSelectedService}
          weddingPackages={baseData.weddingPackages}
          onWeddingPackageSelect={handleSelectWeddingPackage}
          selectedWeddingPackage={selectedWeddingPackage}
          bookingMode={bookingMode}
          setBookingMode={setBookingMode}
        />
      )}

      {showPackageCustomizer && selectedWeddingPackage && (
        <Step1_WeddingPackageCustomizer
          weddingPackage={selectedWeddingPackage}
          allServices={baseData.services}
          onPackageUpdate={handlePackageUpdate}
          onBack={handleBackToPackages}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
      )}

      {currentStep === 2 && !showPackageCustomizer && (selectedService || selectedWeddingPackage || customizedWeddingPackage) && (
        <>
          {selectedWeddingPackage && !customizedWeddingPackage ? (
            <div className="text-center py-12">
              <div className="p-4 bg-rose-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-rose-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Wedding Package Selected</h2>
              <p className="text-muted-foreground mb-2">
                You've selected the <span className="font-semibold text-rose-600">{selectedWeddingPackage.name}</span> package.
              </p>
              <p className="text-muted-foreground mb-6">
                Would you like to customize this package by adding or removing services?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setCurrentStep(3)}>Proceed with Default Package</Button>
                <Button variant="outline" onClick={handleCustomizeWeddingPackage}>
                  <Scissors className="h-4 w-4 mr-2" />
                  Customize Package
                </Button>
              </div>
            </div>
          ) : customizedWeddingPackage ? (
            <Step2WithServiceData
              selectedStaff={selectedStaff}
              onSelectStaff={setSelectedStaff}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              salonId={salonId}
              selectedService={selectedServices[0]}
              isWeddingPackage={true}
              weddingPackage={customizedWeddingPackage}
            />
          ) : (
            <Step2WithServiceData
              selectedStaff={selectedStaff}
              onSelectStaff={setSelectedStaff}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              salonId={salonId}
              selectedService={selectedService!}
              isWeddingPackage={!!selectedWeddingPackage}
              weddingPackage={customizedWeddingPackage || selectedWeddingPackage}
            />
          )}
        </>
      )}

      {/* Step 3: Location Selection (for home services) OR Time Slot (for salon services) */}
      {currentStep === 3 && !showPackageCustomizer && (selectedService || selectedWeddingPackage || customizedWeddingPackage) && (
        <>
          {bookingMode === 'home' ? (
            <Step3_LocationSelection
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              homeServiceLocation={homeServiceLocation}
              onLocationConfirm={(location) => {
                setHomeServiceLocation(location);
                // Don't auto-advance - let user review and use summary button
              }}
              user={user}
              isAuthenticated={isAuthenticated}
            />
          ) : (
            <Step3WithServiceData
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
              selectedStaff={selectedStaff}
              onSelectStaff={setSelectedStaff}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              salonId={salonId}
              selectedService={selectedService}
              baseData={baseData}
              isHomeService={false}
              isWeddingService={isWeddingService}
              weddingPackage={customizedWeddingPackage || selectedWeddingPackage}
              homeServiceLocation={homeServiceLocation}
            />
          )}
        </>
      )}

      {/* Step 4: Time Slot for home services */}
      {currentStep === 4 && bookingMode === 'home' && !showPackageCustomizer && (selectedService || selectedWeddingPackage || customizedWeddingPackage) && (
        <Step3WithServiceData
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          selectedTime={selectedTime}
          onSelectTime={setSelectedTime}
          selectedStaff={selectedStaff}
          onSelectStaff={setSelectedStaff}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          salonId={salonId}
          selectedService={selectedService}
          baseData={baseData}
          isHomeService={true}
          isWeddingService={isWeddingService}
          weddingPackage={customizedWeddingPackage || selectedWeddingPackage}
          homeServiceLocation={homeServiceLocation}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
