"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { MapPin, Loader2, ChevronRight, Home, Edit2, Info, CheckCircle, Trash2, Briefcase, MoreHorizontal } from 'lucide-react';
import { cn } from '@repo/ui/cn';
import { toast } from 'sonner';
import { GoogleMapSelector } from '@/components/GoogleMapSelector';
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from '@repo/config/config';

// Breadcrumb navigation component
const Breadcrumb = ({ currentStep, setCurrentStep }: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}) => {
  const steps = ['Services', 'Select Professional', 'Select Location', 'Select Date & Time'];

  return (
    <nav className="flex items-center text-sm font-medium text-muted-foreground mb-6">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <button
            onClick={() => currentStep > index + 1 && setCurrentStep(index + 1)}
            className={cn(
              "transition-colors",
              currentStep > index + 1 ? "hover:text-primary cursor-pointer" : "cursor-default",
              currentStep === index + 1 && "text-primary font-semibold"
            )}
          >
            {step}
          </button>
          {index < steps.length - 1 && <ChevronRight className="h-4 w-4 mx-2" />}
        </React.Fragment>
      ))}
    </nav>
  );
};

interface HomeServiceLocation {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  lat?: number;
  lng?: number;
  coordinates?: { lat: number; lng: number };
}

interface Step3LocationSelectionProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  serviceLocation: HomeServiceLocation | null;
  onLocationConfirm: (location: HomeServiceLocation) => void;
  user?: any;
  isAuthenticated: boolean;
  selectedWeddingPackage?: any | null;
  weddingVenueType?: 'salon' | 'venue' | null;
  onVenueTypeChange?: (type: 'salon' | 'venue') => void;
  onRemoveAddress?: (addressId: string) => void;
}

export function Step3_LocationSelection({
  currentStep,
  setCurrentStep,
  serviceLocation,
  onLocationConfirm,
  user,
  isAuthenticated,
  selectedWeddingPackage,
  weddingVenueType,
  onVenueTypeChange,
  onRemoveAddress
}: Step3LocationSelectionProps) {
  // showMapModal is the single unified modal state for ALL three flows
  const [showMapModal, setShowMapModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registeredAddress, setRegisteredAddress] = useState<HomeServiceLocation | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteInstanceRef = useRef<any>(null);
  const hasInitiallyLoadedAddress = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addressLabel, setAddressLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ show: boolean; addressId: string | null; addressLabel: string }>({
    show: false,
    addressId: null,
    addressLabel: ''
  });
  const [locationForm, setLocationForm] = useState<HomeServiceLocation>({
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    lat: undefined,
    lng: undefined
  });

  // Fetch user's registered address and saved addresses (skip for wedding packages)
  useEffect(() => {
    const fetchUserAddress = async () => {
      // Skip fetching addresses for wedding packages - they use map selection only
      if (!isAuthenticated || selectedWeddingPackage) return;

      setIsLoading(true);
      try {
        const response = await fetch('/api/client/addresses', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          if (data.address || data.city) {
            const addressData = {
              address: data.address,
              city: data.city,
              state: data.state,
              pincode: data.pincode,
              landmark: data.landmark,
              lat: data.coordinates?.lat,
              lng: data.coordinates?.lng,
              coordinates: data.coordinates
            };
            setRegisteredAddress(addressData);
            setLocationForm(addressData);

            // Only auto-select on initial load if no address is already selected
            if (!hasInitiallyLoadedAddress.current && !serviceLocation) {
              console.log('[Step3_Location] Auto-selecting registered address on initial load');
              onLocationConfirm(addressData);
              hasInitiallyLoadedAddress.current = true;
            } else {
              console.log('[Step3_Location] Skipping auto-select - address already loaded or selected');
            }
          }
          // Set saved addresses from API
          if (data.savedAddresses && data.savedAddresses.length > 0) {
            setSavedAddresses(data.savedAddresses);
          }
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAddress();
  }, [isAuthenticated, selectedWeddingPackage]);

  // Initialize Google Places Autocomplete whenever the modal opens
  useEffect(() => {
    if (!showMapModal) {
      // Cleanup when modal is closed
      if (autocompleteInstanceRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteInstanceRef.current);
        autocompleteInstanceRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (!searchInputRef.current || !window.google?.maps?.places) return;
      if (autocompleteInstanceRef.current) return; // Already attached

      const autocomplete = new window.google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          componentRestrictions: { country: 'in' },
          fields: ['address_components', 'geometry', 'formatted_address']
        }
      );
      autocompleteInstanceRef.current = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          toast.error('No location details available for this place');
          return;
        }
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        // Extract address components directly from the selected Google Place
        const addressComponents = place.address_components || [];
        let address = '';
        let city = '';
        let state = '';
        let pincode = '';

        addressComponents.forEach((component: any) => {
          if (component.types.includes('street_number') || component.types.includes('route')) {
            address += (address ? ' ' : '') + component.long_name;
          }
          if (component.types.includes('sublocality_level_1') || component.types.includes('sublocality')) {
            if (!address) {
              address = component.long_name;
            } else {
              address += ', ' + component.long_name;
            }
          }
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (component.types.includes('postal_code')) {
            pincode = component.long_name;
          }
        });

        // If the parsed address is still empty, fall back to formatted_address
        const finalAddress = address.trim() || place.formatted_address || '';

        setLocationForm({
          address: finalAddress,
          city,
          state,
          pincode,
          landmark: '',
          lat,
          lng
        });

        setSearchQuery(place.formatted_address || finalAddress);
        toast.success('Address auto-filled successfully!');
      });
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [showMapModal]);

  // Handle location form field changes
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle map location selection
  const handleMapLocationSelect = (lat: number, lng: number) => {
    setLocationForm(prev => ({
      ...prev,
      lat,
      lng
    }));

    // Fetch address details from coordinates
    fetchAddressFromCoordinates(lat, lng);
  };

  // Reverse geocoding — uses the Google Maps JS API Geocoder
  const fetchAddressFromCoordinates = useCallback((lat: number, lng: number) => {
    const parseAndSet = (results: any[]) => {
      const result = results[0];
      const addressComponents: any[] = result.address_components;

      let address = '';
      let city = '';
      let state = '';
      let pincode = '';

      addressComponents.forEach((component: any) => {
        if (component.types.includes('street_number') || component.types.includes('route')) {
          address += component.long_name + ' ';
        }
        if (component.types.includes('sublocality_level_1') || component.types.includes('sublocality')) {
          if (!address) address = component.long_name + ' ';
        }
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (component.types.includes('postal_code')) {
          pincode = component.long_name;
        }
      });

      setLocationForm(prev => ({
        ...prev,
        address: address.trim() || result.formatted_address,
        city,
        state,
        pincode,
        lat,
        lng
      }));
    };

    // Prefer JS API Geocoder
    if (window.google?.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === 'OK' && results && results.length > 0) {
          parseAndSet(results);
        } else {
          console.error('Geocoder failed:', status);
          toast.error('Could not fetch address details. Please type manually.');
        }
      });
    } else {
      // Fallback: HTTP REST endpoint
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      )
        .then(r => r.json())
        .then(data => {
          if (data.results && data.results[0]) {
            parseAndSet(data.results);
          }
        })
        .catch(err => {
          console.error('Error fetching address:', err);
          toast.error('Could not fetch address details. Please type manually.');
        });
    }
  }, []);

  // Handle using registered address
  const handleUseRegisteredAddress = () => {
    if (registeredAddress) {
      console.log('[Step3_Location] Using registered address:', registeredAddress);
      onLocationConfirm(registeredAddress);
      hasInitiallyLoadedAddress.current = true;
      toast.success('Address selected!');
    }
  };

  // Handle selecting a saved address
  const handleUseSavedAddress = (savedAddress: any) => {
    const locationData: HomeServiceLocation = {
      address: savedAddress.address,
      city: savedAddress.city,
      state: savedAddress.state,
      pincode: savedAddress.pincode,
      landmark: savedAddress.landmark || '',
      lat: savedAddress.location?.lat,
      lng: savedAddress.location?.lng,
      coordinates: savedAddress.location
    };
    console.log('[Step3_Location] Using saved address:', locationData);
    onLocationConfirm(locationData);
    hasInitiallyLoadedAddress.current = true;
    toast.success(`${savedAddress.label} address selected!`);
  };

  // Open the unified map modal (clears form for fresh selection)
  const openMapModal = () => {
    setShowMapModal(true);
    setSearchQuery('');
    setAddressLabel('Home');
    setLocationForm({
      address: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      lat: undefined,
      lng: undefined
    });
  };

  // Save new address to user profile (called when proceeding to next step)
  const saveAddressToProfile = async (locationData: HomeServiceLocation, label: string = 'Home') => {
    // Don't save addresses for wedding packages - they're one-time events
    if (isAuthenticated && !selectedWeddingPackage) {
      try {
        const response = await fetch('/api/client/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...locationData,
            fullName: user ? `${user.firstName} ${user.lastName}`.trim() : 'Guest User',
            mobileNo: user?.mobileNo || '0000000000',
            label,
            isPrimary: savedAddresses.length === 0
          })
        });

        if (response.ok) {
          const result = await response.json();
          setSavedAddresses(result.savedAddresses || []);
        }
      } catch (error) {
        console.error('Error saving address:', error);
      }
    }
  };

  // Get current location using browser's Geolocation API
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.info('Getting your current location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          handleMapLocationSelect(lat, lng);
          toast.success('Current location detected');
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Could not get your location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  // Helper function to check if an address is currently selected
  const isAddressSelected = (address: HomeServiceLocation) => {
    if (!serviceLocation) return false;
    if (address.lat && address.lng && serviceLocation.lat && serviceLocation.lng) {
      return Math.abs(address.lat - serviceLocation.lat) < 0.0001 &&
        Math.abs(address.lng - serviceLocation.lng) < 0.0001;
    }
    return address.address === serviceLocation.address &&
      address.city === serviceLocation.city &&
      address.pincode === serviceLocation.pincode;
  };

  // Handle opening delete confirmation modal
  const handleRemoveAddress = (addressId: string, label: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDeleteConfirmModal({
      show: true,
      addressId,
      addressLabel: label
    });
  };

  // Handle confirming address deletion
  const confirmDeleteAddress = async () => {
    if (!isAuthenticated || !deleteConfirmModal.addressId) {
      toast.error('Please login to remove addresses');
      return;
    }

    try {
      const response = await fetch(`/api/client/addresses/${deleteConfirmModal.addressId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        setSavedAddresses(result.savedAddresses || []);
        toast.success('Address removed successfully');

        if (serviceLocation) {
          const removedAddr = savedAddresses.find(a => (a as any)._id === deleteConfirmModal.addressId);
          if (removedAddr && isAddressSelected({
            address: removedAddr.address,
            city: removedAddr.city,
            state: removedAddr.state,
            pincode: removedAddr.pincode,
            landmark: removedAddr.landmark,
            lat: removedAddr.location?.lat,
            lng: removedAddr.location?.lng,
            coordinates: removedAddr.location
          })) {
            onLocationConfirm(null as any);
          }
        }
      } else {
        toast.error('Failed to remove address');
      }
    } catch (error) {
      console.error('Error removing address:', error);
      toast.error('Error removing address');
    } finally {
      setDeleteConfirmModal({ show: false, addressId: null, addressLabel: '' });
    }
  };

  // Handler for the unified modal confirm button
  const handleModalConfirm = async () => {
    if (!locationForm.lat || !locationForm.lng || !locationForm.address) {
      toast.error('Please pin a location on the map and enter an address');
      return;
    }
    const locationData: HomeServiceLocation = {
      address: locationForm.address,
      city: locationForm.city || '',
      state: locationForm.state || '',
      pincode: locationForm.pincode || '',
      landmark: locationForm.landmark || '',
      lat: Number(locationForm.lat),
      lng: Number(locationForm.lng),
      coordinates: {
        lat: Number(locationForm.lat),
        lng: Number(locationForm.lng)
      }
    };
    onLocationConfirm(locationData);
    await saveAddressToProfile(locationData, addressLabel);
    hasInitiallyLoadedAddress.current = true;
    toast.success('Address confirmed!');
    setShowMapModal(false);
  };

  return (
    <div className="w-full">

      <div className="mb-6">
        <div
          className="flex items-center gap-2 mb-1 cursor-pointer w-fit"
          onClick={() => {
            // Reset venue type when navigating back from wedding location step
            if (selectedWeddingPackage && weddingVenueType) {
              onVenueTypeChange?.(undefined as any);
            }
            setCurrentStep(currentStep - 1);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/back 1.png" alt="back" className="h-5 w-5" />
          <h2 className="text-xl font-medium font-headline text-black">Back</h2>
        </div>
      </div>

      {/* Wedding Package Venue Selection */}
      {selectedWeddingPackage && (
        <Card className="mb-6 border-2 border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <img src="/uploads/MapPin.png" alt="location" className="h-5 w-5" />
                <span className='font-bold'>Where will the wedding service take place?</span>
              </div>
              <p className="text-gray-500 text-sm font-normal pl-7">
                {selectedWeddingPackage
                  ? 'Wedding services can be provided at your venue or at our salon. Please select your preferred location'
                  : "Choose where you'd like the service to be provided"}
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Option 1: At Salon */}
            <div
              onClick={() => {
                onVenueTypeChange?.('salon');
              }}
              className={cn(
                "p-4 border-2 rounded-lg cursor-pointer transition-all",
                weddingVenueType === 'salon'
                  ? "border-primary  bg-[#EBF3FD]"
                  : "border-gray-200 hover:bg-[#EBF3FD] hover:border-primary/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                  weddingVenueType === 'salon' ? "border-primary" : "border-gray-300"
                )}>
                  {weddingVenueType === 'salon' && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">At Salon</h3>
                  <p className="text-sm text-muted-foreground">
                    The wedding service will be provided at the salon premises
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: At Venue — opens the unified map modal */}
            <div
              onClick={() => {
                onVenueTypeChange?.('venue');
                openMapModal();
              }}
              className={cn(
                "p-4 border-2 rounded-lg cursor-pointer transition-all",
                weddingVenueType === 'venue'
                  ? "border-primary  bg-[#EBF3FD]"
                  : "border-gray-200 hover:bg-[#EBF3FD] hover:border-primary/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                  weddingVenueType === 'venue' ? "border-primary" : "border-gray-300"
                )}>
                  {weddingVenueType === 'venue' && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">At Venue</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide the venue address where services will be provided
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show confirmation for "At Salon" selection */}
      {selectedWeddingPackage && weddingVenueType === 'salon' && (
        <Card className="border-2 border-primary/20 bg-card mb-6 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base mb-2">
                  Salon Location Confirmed
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Your wedding service will take place at the salon. Our team will ensure everything is perfectly set up for your special day.
                </p>
                <p className="text-xs text-muted-foreground">
                  Click <span className="font-semibold text-foreground">"Select Time Slot"</span> button to continue
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show confirmation when wedding venue address is selected */}
      {selectedWeddingPackage && weddingVenueType === 'venue' && serviceLocation && (serviceLocation as any)?.address && (
        <Card className="border-2 border-primary/20 bg-card mb-6 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-3">
                  Wedding Venue Address Confirmed
                </h3>
                <div className="space-y-1 mb-3">
                  <p className="text-sm font-medium">{(serviceLocation as any).address}</p>
                  <p className="text-sm text-muted-foreground">
                    {(serviceLocation as any).city}, {(serviceLocation as any).state} - {(serviceLocation as any).pincode}
                  </p>
                </div>
                <button
                  onClick={openMapModal}
                  className="text-xs text-primary font-medium underline underline-offset-2 hover:opacity-75 transition-opacity"
                >
                  Change Venue
                </button>
                <p className="text-xs text-muted-foreground mt-2">
                  Click <span className="font-semibold text-foreground">"Select Time Slot"</span> button to continue
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show address collection only for: home service OR wedding at venue (no address yet) */}
      {(!selectedWeddingPackage || weddingVenueType === 'venue') && (
        <>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading your address...</span>
            </div>
          )}

          {/* Show Registered Address and Saved Addresses (ONLY for non-wedding bookings) */}
          {!isLoading && (registeredAddress || savedAddresses.length > 0) && !selectedWeddingPackage && (
            <div className="space-y-6 mb-6">
              {/* Registered Address */}
              {registeredAddress && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Your Registered Address</h3>
                  <Card className={cn(
                    "border-2 transition-all",
                    isAddressSelected(registeredAddress)
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                      : "border-gray-200 hover:border-primary/30"
                  )}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "p-3 rounded-lg",
                          isAddressSelected(registeredAddress) ? "bg-primary/10" : "bg-muted"
                        )}>
                          {isAddressSelected(registeredAddress) ? (
                            <CheckCircle className="h-6 w-6 text-primary" />
                          ) : (
                            <Home className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium">{registeredAddress.address}</p>
                            {isAddressSelected(registeredAddress) && (
                              <span className="text-xs bg-primary text-primary-foreground px-2.5 py-1 rounded-full font-medium shadow-sm">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {registeredAddress.city}, {registeredAddress.state} - {registeredAddress.pincode}
                          </p>
                          {registeredAddress.landmark && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Landmark: {registeredAddress.landmark}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        {isAddressSelected(registeredAddress) ? (
                          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
                            <p className="text-sm font-medium text-primary flex items-center justify-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              This address is selected. Use the summary button to proceed.
                            </p>
                          </div>
                        ) : (
                          <Button
                            size="lg"
                            className="w-full"
                            onClick={handleUseRegisteredAddress}
                          >
                            Use This Address
                            <ChevronRight className="h-5 w-5 ml-2" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Add New Address Button — placed ABOVE saved addresses so no scrolling needed */}
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={openMapModal}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Add New Address from Map
              </Button>

              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Your Saved Addresses</h3>
                  <div className="space-y-3">
                    {savedAddresses.map((addr, index) => {
                      const locationData: HomeServiceLocation = {
                        address: addr.address,
                        city: addr.city,
                        state: addr.state,
                        pincode: addr.pincode,
                        landmark: addr.landmark || '',
                        lat: addr.location?.lat,
                        lng: addr.location?.lng,
                        coordinates: addr.location
                      };
                      const isSelected = isAddressSelected(locationData);

                      return (
                        <Card
                          key={index}
                          className={cn(
                            "border-2 transition-all cursor-pointer",
                            isSelected
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                              : "border-gray-200 hover:border-primary/30 hover:shadow-sm"
                          )}
                          onClick={() => !isSelected && handleUseSavedAddress(addr)}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              <div className={cn(
                                "p-2 rounded-lg",
                                isSelected ? "bg-primary/10" : "bg-muted"
                              )}>
                                {isSelected ? (
                                  <CheckCircle className="h-5 w-5 text-primary" />
                                ) : (
                                  <MapPin className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {isSelected && (
                                    <span className="text-xs bg-primary text-primary-foreground px-2.5 py-1 rounded-full font-medium shadow-sm">
                                      Selected
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-medium mb-1">{addr.address}</p>
                                <p className="text-xs text-muted-foreground">
                                  {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                                {addr.landmark && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Landmark: {addr.landmark}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={(e) => handleRemoveAddress((addr as any)._id, addr.address, e)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Saved Addresses (Only for non-wedding bookings) — opens unified map modal */}
          {!isLoading && !registeredAddress && savedAddresses.length === 0 && !selectedWeddingPackage && (
            <Card className="border-2 border-dashed">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-muted rounded-full">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">No Saved Addresses</h3>
                <p className="text-muted-foreground mb-6">
                  Please select your service location from the map
                </p>
                <Button
                  size="lg"
                  onClick={openMapModal}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Select Address from Map
                </Button>
              </CardContent>
            </Card>
          )}

          {/* For Wedding Packages: Show button to open map modal if no address yet */}
          {selectedWeddingPackage && weddingVenueType === 'venue' && !serviceLocation?.address && (
            <Card className="border-2 border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Select Wedding Venue Location</h3>
                <p className="text-muted-foreground mb-6">
                  Choose the exact location where the wedding service will take place
                </p>
                <Button
                  size="lg"
                  onClick={openMapModal}
                  className="min-w-[250px]"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Select Venue from Map
                </Button>
              </CardContent>
            </Card>
          )}

        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                Delete Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this address? This action cannot be undone.
              </p>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{deleteConfirmModal.addressLabel}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleteConfirmModal({ show: false, addressId: null, addressLabel: '' })}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={confirmDeleteAddress}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          UNIFIED MAP MODAL
          Used by: Home Service (Add New Address / No Saved Addresses)
                   Wedding Package (At Venue)
          ───────────────────────────────────────────────────────────── */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden"
            style={{ maxWidth: '1140px', maxHeight: '92vh' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <button
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => {
                  setShowMapModal(false);
                  // For wedding venue: reset to salon if no address confirmed
                  if (selectedWeddingPackage && weddingVenueType === 'venue' && !serviceLocation?.address) {
                    onVenueTypeChange?.('salon');
                  }
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/back 1.png" alt="back" className="h-5 w-5" />
                <span className="font-medium text-base">Back</span>
              </button>
              <button
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                onClick={() => {
                  setShowMapModal(false);
                  if (selectedWeddingPackage && weddingVenueType === 'venue' && !serviceLocation?.address) {
                    onVenueTypeChange?.('salon');
                  }
                }}
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body — split layout */}
            <div
              className="flex overflow-hidden"
              style={{ height: 'calc(92vh - 73px)' }}
            >
              {/* LEFT: Map */}
              <div className="relative flex-1 min-w-0">
                {/* Search bar overlay */}
                <div className="absolute top-3 left-3 right-3 z-10">
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
                    </svg>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for area or location..."
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10M11 20h2" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="w-full h-full">
                  <GoogleMapSelector
                    onLocationSelect={handleMapLocationSelect}
                    initialLat={locationForm.lat || 19.0760}
                    initialLng={locationForm.lng || 72.8777}
                  />
                </div>

                {/* Current Location button overlay */}
                <div className="absolute bottom-4 left-4 z-10">
                  <button
                    onClick={handleGetCurrentLocation}
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium shadow-md hover:shadow-lg transition-all hover:bg-gray-50"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
                    Current Location
                  </button>
                </div>
              </div>

              {/* RIGHT: Address Form Panel */}
              <div
                className="bg-white border-l border-gray-100 flex flex-col"
                style={{ width: '400px', flexShrink: 0 }}
              >
                {/* Panel Header */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Select Address</h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {locationForm.lat && locationForm.lng
                      ? 'Location pinned — review and complete the address below'
                      : 'Pin a location on the map, then fill in the details'}
                  </p>
                </div>

                {/* Scrollable form body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                  {/* Pinned location indicator */}
                  {locationForm.lat && locationForm.lng && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-primary font-medium">Location pinned on map</span>
                    </div>
                  )}

                  {/* Address Line */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Address Line <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={locationForm.address}
                      onChange={handleLocationChange}
                      placeholder="Full street address"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 placeholder:text-gray-400"
                    />
                  </div>

                  {/* Landmark */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Landmark <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={locationForm.landmark}
                      onChange={handleLocationChange}
                      placeholder="Nearby landmark"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 placeholder:text-gray-400"
                    />
                  </div>

                  {/* City & State */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={locationForm.city}
                        onChange={handleLocationChange}
                        placeholder="City"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={locationForm.state}
                        onChange={handleLocationChange}
                        placeholder="State"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={locationForm.pincode}
                      onChange={handleLocationChange}
                      placeholder="Pincode"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 placeholder:text-gray-400"
                    />
                  </div>

                  {/* Address Type — only shown for non-wedding bookings (weddings don't save) */}
                  {!selectedWeddingPackage && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Address Type
                      </label>
                      <div className="flex gap-2">
                        {(['Home', 'Work', 'Other'] as const).map((type) => {
                          const icons = {
                            Home: <Home className="h-3.5 w-3.5" />,
                            Work: <Briefcase className="h-3.5 w-3.5" />,
                            Other: <MoreHorizontal className="h-3.5 w-3.5" />
                          };
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setAddressLabel(type)}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                                addressLabel === type
                                  ? "border-primary bg-primary text-white shadow-sm"
                                  : "border-gray-200 text-gray-600 hover:border-primary/50 hover:bg-gray-50"
                              )}
                            >
                              {icons[type]}
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>

                {/* Confirm & Continue */}
                <div className="px-6 py-4 border-t border-gray-100 bg-white">
                  <button
                    disabled={!locationForm.lat || !locationForm.lng || !locationForm.address}
                    onClick={handleModalConfirm}
                    className="w-full py-3.5 border border-primary bg-primary hover:bg-primary/80 disabled:bg-primary/40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    Confirm &amp; Continue
                  </button>
                  {(!locationForm.lat || !locationForm.lng) && (
                    <p className="text-center text-xs text-gray-400 mt-2">
                      Pin a location on the map to continue
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
