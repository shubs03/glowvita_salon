"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { MapPin, Loader2, ChevronRight, Home, Edit2, Info, CheckCircle, Trash2 } from 'lucide-react';
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
  address: string;
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
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registeredAddress, setRegisteredAddress] = useState<HomeServiceLocation | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const lastSavedLocationKeyRef = useRef<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const hasInitiallyLoadedAddress = useRef(false); // Track if we've loaded address on mount
  const [searchQuery, setSearchQuery] = useState('');
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

  // When form is complete (from map selection), enable summary button by setting location
  useEffect(() => {
    const isFormComplete = 
      showMapSelector &&
      locationForm.address && 
      locationForm.city && 
      locationForm.state && 
      locationForm.pincode && 
      locationForm.lat && 
      locationForm.lng;

    if (isFormComplete) {
      const locationData: HomeServiceLocation = {
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
      // Silently enable the button without toast
      console.log('[Step3_Location] Form complete, confirming location:', locationData);
      onLocationConfirm(locationData);
      hasInitiallyLoadedAddress.current = true; // Mark as loaded to prevent future auto-selects

      const existingMatch = savedAddresses.some((address) => {
        const addrLat = Number(address.location?.lat ?? address.lat ?? 0);
        const addrLng = Number(address.location?.lng ?? address.lng ?? 0);
        return addrLat === locationData.lat && addrLng === locationData.lng;
      });
      const locationKey = `${locationData.lat},${locationData.lng}`;

      if (!existingMatch && lastSavedLocationKeyRef.current !== locationKey) {
        lastSavedLocationKeyRef.current = locationKey;
        saveAddressToProfile(locationData);
      }
    }
  }, [
    locationForm.address,
    locationForm.city,
    locationForm.state,
    locationForm.pincode,
    locationForm.lat,
    locationForm.lng,
    savedAddresses,
    showMapSelector
  ]);

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
            // This prevents overwriting user's manual selection
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

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!searchInputRef.current || !window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'in' }
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (!place.geometry || !place.geometry.location) {
        toast.error('No location details available for this place');
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      // Update location form and trigger reverse geocoding
      handleMapLocationSelect(lat, lng);
      setSearchQuery(place.formatted_address || '');
      
      toast.success('Location found!');
    });

    return () => {
      window.google?.maps.event?.clearInstanceListeners(autocomplete);
    };
  }, [searchInputRef.current, showMapSelector]);

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

  // Reverse geocoding to get address from coordinates
  const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results[0]) {
        const result = data.results[0];
        const addressComponents = result.address_components;

        let address = '';
        let city = '';
        let state = '';
        let pincode = '';

        addressComponents.forEach((component: any) => {
          if (component.types.includes('street_number') || component.types.includes('route')) {
            address += component.long_name + ' ';
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
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      toast.error('Could not fetch address details');
    }
  };

  // Handle using registered address
  const handleUseRegisteredAddress = () => {
    if (registeredAddress) {
      console.log('[Step3_Location] Using registered address:', registeredAddress);
      onLocationConfirm(registeredAddress);
      hasInitiallyLoadedAddress.current = true; // Mark to prevent auto-overwrite
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
    hasInitiallyLoadedAddress.current = true; // Mark to prevent auto-overwrite
    toast.success(`${savedAddress.label} address selected!`);
  };

  // Handle selecting new address from map
  const handleSelectNewAddress = () => {
    setShowMapSelector(true);
    // Clear form for new selection
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
  const saveAddressToProfile = async (locationData: HomeServiceLocation) => {
    // Don't save addresses for wedding packages - they're one-time events
    if (isAuthenticated && !selectedWeddingPackage) {
      try {
        const response = await fetch('/api/client/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...locationData,
            label: 'Home',
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
    // Check if coordinates match
    if (address.lat && address.lng && serviceLocation.lat && serviceLocation.lng) {
      return Math.abs(address.lat - serviceLocation.lat) < 0.0001 && 
             Math.abs(address.lng - serviceLocation.lng) < 0.0001;
    }
    // Fallback to address string comparison
    return address.address === serviceLocation.address && 
           address.city === serviceLocation.city && 
           address.pincode === serviceLocation.pincode;
  };

  // Handle opening delete confirmation modal
  const handleRemoveAddress = (addressId: string, addressLabel: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the card click
    setDeleteConfirmModal({
      show: true,
      addressId,
      addressLabel
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
        
        // If the removed address was selected, clear the selection
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

  return (
    <div className="w-full">
      <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} />
      
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <MapPin className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold font-headline">
            {selectedWeddingPackage ? 'Wedding Location' : 'Select Service Location'}
          </h2>
        </div>
        <p className="text-muted-foreground">
          {selectedWeddingPackage 
            ? 'Choose where the wedding service will take place'
            : "Choose where you'd like the service to be provided"}
        </p>
      </div>

      {/* Wedding Package Venue Selection */}
      {selectedWeddingPackage && (
        <Card className="mb-6 border-2 border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Where will the wedding service take place?
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
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-primary/50"
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

            {/* Option 2: At Venue */}
            <div
              onClick={() => {
                onVenueTypeChange?.('venue');
              }}
              className={cn(
                "p-4 border-2 rounded-lg cursor-pointer transition-all",
                weddingVenueType === 'venue'
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-primary/50"
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
                <p className="text-xs text-muted-foreground">
                  Click <span className="font-semibold text-foreground">"Select Time Slot"</span> button to continue
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show address collection only for: home service OR wedding at venue */}
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
      {!isLoading && !showMapSelector && (registeredAddress || savedAddresses.length > 0) && !selectedWeddingPackage && (
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

          {/* Add New Address Button */}
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={handleSelectNewAddress}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Add New Address from Map
          </Button>
        </div>
      )}

      {/* No Saved Addresses (Only for non-wedding bookings) */}
      {!isLoading && !showMapSelector && !registeredAddress && savedAddresses.length === 0 && !selectedWeddingPackage && (
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
              onClick={handleSelectNewAddress}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Select Address from Map
            </Button>
          </CardContent>
        </Card>
      )}

      {/* For Wedding Packages: Show map selector button when venue is selected */}
      {selectedWeddingPackage && weddingVenueType === 'venue' && !showMapSelector && (
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
              onClick={handleSelectNewAddress}
              className="min-w-[250px]"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Select Venue from Map
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Map Selector and Form */}
      {showMapSelector && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Select Location on Map</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGetCurrentLocation}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Current Location
            </Button>
          </div>

          {/* Location Search Bar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Location
            </label>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for an address or place..."
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Google Map */}
          <div className="h-96 border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <GoogleMapSelector
              onLocationSelect={handleMapLocationSelect}
              initialLat={locationForm.lat || registeredAddress?.lat || 19.0760}
              initialLng={locationForm.lng || registeredAddress?.lng || 72.8777}
            />
          </div>

          {locationForm.lat && locationForm.lng && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="font-medium">Location pinned:</span>
              <span className="text-muted-foreground">{locationForm.lat.toFixed(4)}, {locationForm.lng.toFixed(4)}</span>
            </div>
          )}

          {/* Address Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Address Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={locationForm.address}
                  onChange={handleLocationChange}
                  placeholder="Full street address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={locationForm.city}
                    onChange={handleLocationChange}
                    placeholder="City"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={locationForm.state}
                    onChange={handleLocationChange}
                    placeholder="State"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={locationForm.pincode}
                    onChange={handleLocationChange}
                    placeholder="Pincode"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={locationForm.landmark}
                    onChange={handleLocationChange}
                    placeholder="Nearby landmark"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info message about using summary button */}
          <div className="bg-muted border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Pin your location on the map and fill in the address details. The <span className="font-semibold text-foreground">"Select Time Slot"</span> button will be enabled once completed.
              </p>
            </div>
          </div>
        </div>
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
    </div>
  );
}
