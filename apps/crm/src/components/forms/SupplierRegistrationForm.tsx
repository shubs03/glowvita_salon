"use client";

import React, { useState, Suspense, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { toast } from 'sonner';
import { useCreateSupplierMutation } from '@repo/store/api';
import { User, Building, ArrowRight, ArrowLeft, Map } from 'lucide-react';
import { cn } from '@repo/ui/cn';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// Import environment variable directly
const NEXT_PUBLIC_MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

// Mapbox access token
const MAPBOX_TOKEN = NEXT_PUBLIC_MAPBOX_API_KEY;

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
    const steps = [
        { id: 1, name: 'Create Account', icon: User },
        { id: 2, name: 'Business Details', icon: Building },
    ];
    
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={cn("relative", stepIdx !== steps.length - 1 ? 'flex-1' : '')}>
                         <div className="flex items-center text-sm font-medium">
                            <span className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                                currentStep > step.id ? "bg-primary text-white" :
                                currentStep === step.id ? "border-2 border-primary bg-primary/10 text-primary" :
                                "border-2 border-gray-300 bg-background text-muted-foreground"
                            )}>
                                {currentStep > step.id ? <User className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                            </span>
                            <span className={cn(
                                "ml-3 hidden font-medium text-muted-foreground md:inline",
                                currentStep >= step.id && "text-foreground"
                            )}>
                                {step.name}
                            </span>
                        </div>
                        {stepIdx !== steps.length - 1 && (
                            <div className="absolute right-0 top-4 -z-10 hidden h-0.5 w-full bg-gray-200 md:block" aria-hidden="true" />
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export function SupplierRegistrationForm({ onSuccess }: { onSuccess: () => void }) {
  const searchParams = useSearchParams();
  const refCode = searchParams?.get('ref');
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    shopName: '',
    country: 'India',
    state: 'N/A',
    city: 'N/A',
    pincode: '000000',
    address: 'N/A',
    supplierType: 'General',
    businessRegistrationNo: '',
    location: null as { lat: number; lng: number } | null,
    password: '',
    confirmPassword: '',
    referredByCode: refCode || '',
  });

  const [createSupplier, { isLoading }] = useCreateSupplierMutation();

  // Map functionality states
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Initialize Mapbox when modal opens
  useEffect(() => {
    if (!isMapOpen || !MAPBOX_TOKEN) return;

    const initMap = () => {
      if (!mapContainer.current) return;

      try {
        mapboxgl.accessToken = MAPBOX_TOKEN;
        if (map.current) {
          map.current.remove();
        }

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: formData.location ? [formData.location.lng, formData.location.lat] : [77.4126, 23.2599],
          zoom: formData.location ? 15 : 5,
          attributionControl: false
        });

        if (marker.current) {
          marker.current.remove();
        }

        marker.current = new mapboxgl.Marker({
          draggable: true,
          color: '#3B82F6'
        })
          .setLngLat(formData.location ? [formData.location.lng, formData.location.lat] : [77.4126, 23.2599])
          .addTo(map.current);

        marker.current.on('dragend', () => {
          const lngLat = marker.current!.getLngLat();
          setFormData(prev => ({ 
            ...prev, 
            location: { lat: lngLat.lat, lng: lngLat.lng } 
          }));
          fetchAddress([lngLat.lng, lngLat.lat]);
        });

        map.current.on('click', (e: any) => {
          const { lng, lat } = e.lngLat;
          setFormData(prev => ({ 
            ...prev, 
            location: { lat, lng } 
          }));
          marker.current!.setLngLat([lng, lat]);
          fetchAddress([lng, lat]);
        });

        map.current.on('load', () => {
          setTimeout(() => {
            map.current!.resize();
          }, 100);
        });
      } catch (error) {
        console.error('Error initializing Mapbox:', error);
      }
    };

    const timeoutId = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timeoutId);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
    };
  }, [isMapOpen, formData.location]);

  // Resize map when modal is fully opened
  useEffect(() => {
    if (isMapOpen && map.current) {
      setTimeout(() => {
      if (map.current) {
        map.current.resize();
      }
      }, 300);
    }
  }, [isMapOpen]);

  // Search for locations using Mapbox Geocoding API
  const handleSearch = async (query: string) => {
    if (!query || !MAPBOX_TOKEN) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${MAPBOX_TOKEN}&country=IN&types=place,locality,neighborhood,address`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    }
  };

  // Fetch address from coordinates using reverse geocoding
  const fetchAddress = async (coordinates: [number, number]) => {
    if (!MAPBOX_TOKEN) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${MAPBOX_TOKEN}&types=place,locality,neighborhood,address`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        const context = data.features[0].context || [];
        const state = context.find((c: any) => c.id.includes('region'))?.text || '';
        const city = context.find((c: any) => c.id.includes('place'))?.text || '';

        setFormData(prev => ({ 
          ...prev, 
          address, 
          state: state || prev.state, 
          city: city || prev.city 
        }));
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = (result: any) => {
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
      map.current.setZoom(15);
      setTimeout(() => map.current!.resize(), 100);
    }

    if (marker.current) {
      marker.current.setLngLat(coordinates);
    }

    setSearchResults([]);
    setSearchQuery('');
  };
  
  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.mobile || !formData.password) {
        toast.error("Please fill all required fields in this step.");
        return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateStep1()) return;

    try {
      // Prepare form data with proper location format
      const submissionData = {
        ...formData,
        location: formData.location ? JSON.stringify(formData.location) : ''
      };
      
      await createSupplier(submissionData).unwrap();
      toast.success("Supplier registration submitted successfully!");
      onSuccess();
    } catch (err) {
       toast.error((err as any)?.data?.message || "Registration failed. Please try again.");
    }
  };
  
  const nextStep = () => {
      if (validateStep1()) {
          setStep(2);
      }
  }

  const prevStep = () => setStep(1);

  return (
    <div className="w-full max-w-xl mx-auto">
        <div className="bg-background/70 backdrop-blur-sm border-white/20 shadow-2xl shadow-blue-500/10 p-8 rounded-lg">
            <div className="mb-8">
                <StepIndicator currentStep={step} />
            </div>
            <form onSubmit={handleSubmit} className="mt-8">
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in-50 duration-500">
                        <h2 className="text-xl font-semibold text-center">Create Your Supplier Account</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input name="firstName" placeholder="First Name" onChange={handleChange} required />
                            <Input name="lastName" placeholder="Last Name" onChange={handleChange} required />
                        </div>
                        <Input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
                        <Input name="mobile" type="tel" placeholder="Mobile Number" onChange={handleChange} required />
                        <Input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                        <Input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />
                        <Input name="referredByCode" placeholder="Referral Code (Optional)" onChange={handleChange} value={formData.referredByCode} />
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in-50 duration-500">
                        <h2 className="text-xl font-semibold text-center">Tell us about your Business</h2>
                        <Input name="shopName" placeholder="Shop Name" onChange={handleChange} required />
                        <Input name="supplierType" placeholder="Supplier Type (e.g., Cosmetics, Equipment)" onChange={handleChange} required />
                        <Input name="businessRegistrationNo" placeholder="Business Registration Number (Optional)" onChange={handleChange} value={formData.businessRegistrationNo} />
                        
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="location"
                                    value={formData.location ? `${formData.location.lat.toFixed(6)}, ${formData.location.lng.toFixed(6)}` : ''}
                                    placeholder="Select location from map"
                                    readOnly
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsMapOpen(true)}
                                >
                                    <Map className="mr-2 h-4 w-4" />
                                    Choose from Map
                                </Button>
                            </div>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4">
                            <Input name="city" placeholder="City" onChange={handleChange} value={formData.city} required />
                            <Input name="state" placeholder="State" onChange={handleChange} value={formData.state} required />
                            <Input name="pincode" placeholder="Pincode" onChange={handleChange} value={formData.pincode} required />
                        </div>
                        
                        <Input name="address" placeholder="Business Address" onChange={handleChange} value={formData.address} required />
                    </div>
                )}
                <div className="flex justify-between pt-6 border-t mt-8">
                    <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    {step < 2 ? (
                        <Button type="button" onClick={nextStep}>
                            Next <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Complete Registration'}
                        </Button>
                    )}
                </div>
            </form>

            {/* Map Modal */}
            <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                <DialogContent className="sm:max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Select Location</DialogTitle>
                        <DialogDescription>
                            Search for a location, click on the map, or drag the marker to select the exact position.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 flex flex-col h-[60vh]">
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
                        
                        <div className="flex-1 relative border rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
                            <div 
                                ref={mapContainer} 
                                className="w-full h-full"
                                style={{ minHeight: '400px' }}
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
    </div>
  );
}

export const SupplierRegistrationFormWithSuspense = (props: any) => (
    <Suspense fallback={<div>Loading...</div>}>
        <SupplierRegistrationForm {...props} />
    </Suspense>
);