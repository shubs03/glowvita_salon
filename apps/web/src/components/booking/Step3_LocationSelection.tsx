"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { MapPin, Loader2, ChevronRight, Home, Edit2, Info } from 'lucide-react';
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
  homeServiceLocation: HomeServiceLocation | null;
  onLocationConfirm: (location: HomeServiceLocation) => void;
  user?: any;
  isAuthenticated: boolean;
}

export function Step3_LocationSelection({
  currentStep,
  setCurrentStep,
  homeServiceLocation,
  onLocationConfirm,
  user,
  isAuthenticated
}: Step3LocationSelectionProps) {
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registeredAddress, setRegisteredAddress] = useState<HomeServiceLocation | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const lastSavedLocationKeyRef = useRef<string | null>(null);
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
      onLocationConfirm(locationData);

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

  // Fetch user's registered address and saved addresses
  useEffect(() => {
    const fetchUserAddress = async () => {
      if (!isAuthenticated) return;

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
            // Enable button with registered address by default
            onLocationConfirm(addressData);
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
  }, [isAuthenticated, user]);

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
      onLocationConfirm(registeredAddress);
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
    onLocationConfirm(locationData);
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
    if (isAuthenticated) {
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

  return (
    <div className="w-full">
      <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} />
      
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <MapPin className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold font-headline">Select Service Location</h2>
        </div>
        <p className="text-muted-foreground">Choose where you'd like the service to be provided</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading your address...</span>
        </div>
      )}

      {/* Show Registered Address and Saved Addresses */}
      {!isLoading && !showMapSelector && (registeredAddress || savedAddresses.length > 0) && (
        <div className="space-y-6 mb-6">
          {/* Registered Address */}
          {registeredAddress && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Your Registered Address</h3>
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Home className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium mb-2">{registeredAddress.address}</p>
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
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleUseRegisteredAddress}
                    >
                      Use This Address
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
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
                {savedAddresses.map((addr, index) => (
                  <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                          <MapPin className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{addr.label || 'Address'}</span>
                            {addr.isPrimary && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Primary</span>
                            )}
                          </div>
                          <p className="text-sm mb-1">{addr.address}</p>
                          <p className="text-xs text-muted-foreground">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          {addr.landmark && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Landmark: {addr.landmark}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleUseSavedAddress(addr)}
                        >
                          Use
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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

      {/* No Saved Addresses */}
      {!isLoading && !showMapSelector && !registeredAddress && savedAddresses.length === 0 && (
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

          {/* Google Map */}
          <div className="h-96 border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <GoogleMapSelector
              onLocationSelect={handleMapLocationSelect}
              initialLat={locationForm.lat || registeredAddress?.lat || 19.0760}
              initialLng={locationForm.lng || registeredAddress?.lng || 72.8777}
            />
          </div>

          {locationForm.lat && locationForm.lng && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location selected: {locationForm.lat.toFixed(4)}, {locationForm.lng.toFixed(4)}
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Review & Continue</p>
                <p>Pin your location on the map and review the address details. The <span className="font-semibold">"Select Time Slot"</span> button on the right will be enabled once a valid location is selected.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
