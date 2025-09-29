"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Building, Map, User, ArrowLeft, ArrowRight, Map as MapIcon } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { toast } from 'sonner';
import { useCreateSupplierMutation } from '@repo/store/api';
import { cn } from '@repo/ui/cn';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NEXT_PUBLIC_MAPBOX_API_KEY } from '../../../../packages/config/config';

// Mapbox access token
const MAPBOX_TOKEN = NEXT_PUBLIC_MAPBOX_API_KEY;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  shopName: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  address: string;
  supplierType: string;
  businessRegistrationNo: string;
  location: { lat: number; lng: number } | null;
  password: string;
  confirmPassword: string;
  referredByCode: string;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  geometry: {
    coordinates: [number, number];
  };
  context?: Array<{
    id: string;
    text: string;
  }>;
}

interface StepIndicatorProps {
  currentStep: number;
  setStep: (step: number) => void;
}

const StepIndicator = ({ currentStep, setStep }: StepIndicatorProps) => {
  return (
    <div className="w-full mb-4 mt-2">
      <div className="flex space-x-2">
        {/* Step 1 Line */}
        <div 
          className={cn(
            "h-1 flex-1 rounded-full transition-colors cursor-pointer",
            currentStep >= 1 ? "bg-purple-600" : "bg-gray-200"
          )}
          onClick={() => currentStep > 1 && setStep(1)}
        />
        {/* Step 2 Line */}
        <div 
          className={cn(
            "h-1 flex-1 rounded-full transition-colors cursor-pointer",
            currentStep >= 2 ? "bg-purple-600" : "bg-gray-200"
          )}
          onClick={() => currentStep > 2 && setStep(2)}
        />
        {/* Step 3 Line */}
        <div 
          className={cn(
            "h-1 flex-1 rounded-full transition-colors cursor-pointer",
            currentStep >= 3 ? "bg-purple-600" : "bg-gray-200"
          )}
          onClick={() => currentStep > 3 && setStep(3)}
        />
      </div>
    </div>
  );
};


interface VendorFormProps {
    onSuccess: () => void;
}

export function VendorForm({ onSuccess }: VendorFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const refCode = searchParams.get('ref');
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    shopName: '',
    country: 'India',
    state: '',
    city: '',
    pincode: '',
    address: '',
    supplierType: 'General',
    businessRegistrationNo: '',
    location: null,
    password: '',
    confirmPassword: '',
    referredByCode: refCode || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [createSupplier, { isLoading }] = useCreateSupplierMutation();

  // Map functionality states
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (refCode) {
      setFormData(prev => ({...prev, referredByCode: refCode}));
    }
  }, [refCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.shopName) newErrors.shopName = 'Shop name is required';
    if (!formData.supplierType) newErrors.supplierType = 'Supplier type is required';
    if (!formData.businessRegistrationNo) newErrors.businessRegistrationNo = 'Business registration number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.pincode) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }
    if (!formData.location) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
        toast.error("Please ensure all required fields are filled correctly.");
        return;
    }

    try {
      // Prepare form data with proper location format
      const submissionData = {
        ...formData,
        location: formData.location ? JSON.stringify(formData.location) : ''
      };
      
      await createSupplier(submissionData).unwrap();
      toast.success(`${formData.shopName} supplier registration submitted successfully!`);
      onSuccess();
    } catch (err: any) {
       toast.error(err.data?.message || "Registration failed. Please try again.");
    }
  };
  
  const nextStep = () => {
    if (step === 1 && validateStep1()) {
        setStep(2);
    } else if (step === 2 && validateStep2()) {
        setStep(3);
    } else {
      if ((step === 1 && !validateStep1()) || (step === 2 && !validateStep2())) {
        toast.error("Please fill all required fields correctly.");
      }
    }
  }

  const prevStep = () => setStep(s => s - 1);

  // Map functionality
  useEffect(() => {
    if (!isMapOpen || !MAPBOX_TOKEN) return;
    const initMap = () => {
      if (!mapContainer.current) return;
      mapboxgl.accessToken = MAPBOX_TOKEN;
      if (map.current) map.current.remove();
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: formData.location ? [formData.location.lng, formData.location.lat] : [77.4126, 23.2599],
        zoom: formData.location ? 15 : 5
      });
      if (marker.current) marker.current.remove();
      marker.current = new mapboxgl.Marker({ draggable: true, color: '#3B82F6' })
        .setLngLat(formData.location ? [formData.location.lng, formData.location.lat] : [77.4126, 23.2599])
        .addTo(map.current);
      marker.current.on('dragend', () => {
        const lngLat = marker.current!.getLngLat();
        setFormData(prev => ({ ...prev, location: { lat: lngLat.lat, lng: lngLat.lng } }));
        fetchAddress([lngLat.lng, lngLat.lat]);
      });
      map.current.on('click', (e: mapboxgl.MapLayerMouseEvent) => {
        const { lng, lat } = e.lngLat;
        setFormData(prev => ({ ...prev, location: { lat, lng } }));
        marker.current!.setLngLat([lng, lat]);
        fetchAddress([lng, lat]);
      });
      map.current.on('load', () => setTimeout(() => map.current!.resize(), 100));
    };
    const timeoutId = setTimeout(initMap, 100);
    return () => {
      clearTimeout(timeoutId);
      if (map.current) map.current.remove();
      if (marker.current) marker.current.remove();
    };
  }, [isMapOpen]);

  useEffect(() => {
    if (isMapOpen && map.current) {
      setTimeout(() => {
        if(map.current) {
            map.current.resize();
        }
      }, 300);
    }
  }, [isMapOpen]);

  const handleSearch = async (query: string) => {
    if (!query || !MAPBOX_TOKEN) { setSearchResults([]); return; }
    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=IN&types=place,locality,neighborhood,address`);
      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) { console.error('Error searching locations:', error); }
  };
  
  const fetchAddress = async (coordinates: [number, number]) => {
    if (!MAPBOX_TOKEN) return;
    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${MAPBOX_TOKEN}&types=place,locality,neighborhood,address`);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        const context = data.features[0].context || [];
        const state = context.find((c: any) => c.id.includes('region'))?.text || '';
        const city = context.find((c: any) => c.id.includes('place'))?.text || '';
        setFormData(prev => ({ ...prev, address, state: state || prev.state, city: city || prev.city }));
      }
    } catch (error) { console.error('Error fetching address:', error); }
  };

  const handleSearchResultSelect = (result: MapboxFeature) => {
    const coordinates = result.geometry.coordinates;
    const newLocation = { lat: coordinates[1], lng: coordinates[0] };
    setFormData(prev => ({
      ...prev,
      location: newLocation,
      address: result.place_name,
      state: result.context?.find((c: any) => c.id.includes('region'))?.text || prev.state,
      city: result.context?.find((c: any) => c.id.includes('place'))?.text || prev.city,
    }));
    if (map.current) {
      map.current.setCenter(coordinates);
    }
    if (marker.current) {
      marker.current.setLngLat(coordinates);
    }
    setSearchResults([]);
    setSearchQuery('');
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pt-2">
        <div className="fixed top-4 sm:top-8 left-4 sm:left-10 right-4 sm:right-10 flex justify-between items-center z-20">
          <Button 
            type="button" 
            variant="outline" 
            onClick={step === 1 ? () => router.back() : prevStep} 
            className="px-3 sm:px-4 py-2 text-base sm:text-lg text-gray-600 border-gray-300 hover:bg-gray-50 h-10 sm:h-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4"/>
            {step === 1 ? 'Back' : 'Back'}
          </Button>
          {step < 3 ? (
            <Button 
              type="button" 
              onClick={nextStep} 
              className="bg-black text-white px-4 sm:px-6 py-2 rounded-md hover:bg-gray-800 font-medium text-base sm:text-lg h-10 sm:h-auto"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4"/>
            </Button>
          ) : (
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="bg-black text-white px-4 sm:px-6 py-2 rounded-md hover:bg-gray-800 font-medium text-base sm:text-lg h-10 sm:h-auto"
              form="registration-form"
            >
              {isLoading ? "Submitting..." : "Complete Registration"}
            </Button>
          )}
        </div>
        
        <div className="mt-16 sm:mt-8">
          <StepIndicator currentStep={step} setStep={setStep} />
        </div>
      
        <form id="registration-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pb-8 mt-4">
          <div className="flex flex-col justify-start" style={{ minHeight: 'calc(100vh - 200px)' }}>
            {step === 1 && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-500">
                <div className="mb-4 sm:mb-6">
                  <p className="text-base sm:text-lg text-gray-500 mb-2">Step 1/3: Personal Details</p>
                  <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Create your account</h1>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                  <div>
                    <Input name="firstName" placeholder="First Name" onChange={handleChange} value={formData.firstName} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                    {renderError('firstName')}
                  </div>
                  <div>
                    <Input name="lastName" placeholder="Last Name" onChange={handleChange} value={formData.lastName} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                    {renderError('lastName')}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                  <div>
                    <Input name="email" type="email" placeholder="Email Address" onChange={handleChange} value={formData.email} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                    {renderError('email')}
                  </div>
                  <div>
                    <Input name="mobile" type="tel" placeholder="Mobile Number" onChange={handleChange} value={formData.mobile} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                    {renderError('mobile')}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                  <div className="relative">
                    <Input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" onChange={handleChange} value={formData.password} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg w-full" />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </Button>
                    {renderError('password')}
                  </div>
                  <div>
                    <Input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} value={formData.confirmPassword} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                    {renderError('confirmPassword')}
                  </div>
                </div>
                <Input name="referredByCode" placeholder="Referral Code (Optional)" onChange={handleChange} value={formData.referredByCode} className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-500">
                <div className="mb-4 sm:mb-6">
                  <p className="text-base sm:text-lg text-gray-500 mb-2">Step 2/3: Business Information</p>
                  <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Tell us about your Business</h1>
                </div>
                <div>
                  <Input name="shopName" placeholder="Shop Name" onChange={handleChange} value={formData.shopName} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                  {renderError('shopName')}
                </div>
                <div>
                  <Input name="supplierType" placeholder="Supplier Type (e.g., Cosmetics, Equipment)" onChange={handleChange} value={formData.supplierType} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                  {renderError('supplierType')}
                </div>
                <div>
                  <Input name="businessRegistrationNo" placeholder="Business Registration Number" onChange={handleChange} value={formData.businessRegistrationNo} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                  {renderError('businessRegistrationNo')}
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-500">
                <div className="mb-4 sm:mb-6">
                  <p className="text-base sm:text-lg text-gray-500 mb-2">Step 3/3: Business Location</p>
                  <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Business Address Details</h1>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base sm:text-lg">Location</Label>
                  <div className="flex flex-col gap-3">
                    <Input
                      id="location"
                      value={formData.location ? `${formData.location.lat.toFixed(6)}, ${formData.location.lng.toFixed(6)}` : ''}
                      placeholder="Select location from map"
                      readOnly
                      className="flex-1 h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg"
                    />
                    {renderError('location')}
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setIsMapOpen(true)}
                      className="w-full h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg"
                    >
                      <MapIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Choose from Map
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                  <div>
                    <Input name="city" placeholder="City" onChange={handleChange} value={formData.city} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                    {renderError('city')}
                  </div>
                  <div>
                    <Input name="state" placeholder="State" onChange={handleChange} value={formData.state} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                    {renderError('state')}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                  <div>
                    <Input name="address" placeholder="Business Address" onChange={handleChange} value={formData.address} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                    {renderError('address')}
                  </div>
                  <div>
                    <Input name="pincode" placeholder="Pincode" onChange={handleChange} value={formData.pincode} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                    {renderError('pincode')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Select Location</DialogTitle>
              <DialogDescription>
                Search for a location, click on the map, or drag the marker to select the exact position.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 flex flex-col max-h-[50vh] overflow-y-auto">
              <div className="relative">
                <Input
                  placeholder="Search for a location (e.g., Mumbai, Delhi, Bangalore)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="w-full"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 border rounded-md bg-white shadow-lg max-h-48 overflow-y-auto mt-1">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 text-sm"
                        onClick={() => handleSearchResultSelect(result)}
                      >
                        <div className="font-medium">{result.place_name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {formData.location && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Selected Location:</strong> {formData.location?.lat.toFixed(6)}, {formData.location?.lng.toFixed(6)}
                </div>
              )}
              
              <div className="relative border rounded-lg overflow-hidden" style={{ height: '300px' }}>
                <div 
                  ref={mapContainer} 
                  className="w-full h-full"
                />
                
                {!MAPBOX_TOKEN && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-600">Map unavailable</p>
                      <p className="text-sm text-gray-500">Mapbox API key not configured</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Click anywhere on the map to place the marker</p>
                <p>• Drag the marker to adjust the location</p>
                <p>• Use the search box to find specific places</p>
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsMapOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => setIsMapOpen(false)}
              >
                Confirm Location
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export const SupplierRegistrationFormWithSuspense = (props: any) => (
  <Suspense fallback={<div>Loading form...</div>}>
    <SupplierRegistrationForm {...props} />
  </Suspense>
);
