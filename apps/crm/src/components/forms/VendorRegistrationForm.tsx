
"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Building, MapPin, User, ChevronRight, ArrowLeft, ArrowRight, Map as MapIcon } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { toast } from 'sonner';
import { useVendorRegisterMutation } from '@repo/store/api';
import { cn } from '@repo/ui/cn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Checkbox } from '@repo/ui/checkbox';
import { Textarea } from '@repo/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NEXT_PUBLIC_MAPBOX_API_KEY } from '../../../../../packages/config/config';

const MAPBOX_TOKEN = NEXT_PUBLIC_MAPBOX_API_KEY;

type SalonCategory = 'unisex' | 'men' | 'women';
type SubCategory = 'shop' | 'shop-at-home' | 'onsite';

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

const StepIndicator = ({ currentStep }) => {
    const steps = [
        { id: 1, name: 'Create Account', icon: User },
        { id: 2, name: 'Business Details', icon: Building },
        { id: 3, name: 'Location', icon: MapPin },
    ];
    
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={cn("relative", stepIdx !== steps.length - 1 ? "flex-1" : "")}>
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

export function VendorRegistrationForm({ onSuccess }) {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    category: '' as SalonCategory | '',
    subCategories: [] as SubCategory[],
    description: '',
    website: '',
    profileImage: '',
    address: '',
    state: '',
    city: '',
    pincode: '',
    location: null,
    referredByCode: refCode || '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [registerVendor, { isLoading }] = useVendorRegisterMutation();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (id, checked) => {
    setFormData(prev => ({
      ...prev,
      subCategories: checked
        ? [...prev.subCategories, id]
        : prev.subCategories.filter(item => item !== id)
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.businessName) newErrors.businessName = 'Business name is required';
    if (!formData.category) newErrors.category = 'Salon category is required';
    if (formData.subCategories.length === 0) newErrors.subCategories = 'At least one sub-category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    if (!formData.location) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
        toast.error("Please ensure all required fields are filled correctly.");
        return;
    }

    try {
      await registerVendor(formData).unwrap();
      onSuccess();
    } catch (err) {
      toast.error(err.data?.error || 'Registration failed');
    }
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
        setStep(2);
    } else if (step === 2 && validateStep2()) {
        setStep(3);
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
      map.current.on('click', (e) => {
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
      setTimeout(() => map.current!.resize(), 300);
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
        const state = context.find(c => c.id.includes('region'))?.text || '';
        const city = context.find(c => c.id.includes('place'))?.text || '';
        setFormData(prev => ({ ...prev, address, state: state || prev.state, city: city || prev.city }));
      }
    } catch (error) { console.error('Error fetching address:', error); }
  };

  const handleSearchResultSelect = (result) => {
    const coordinates = result.geometry.coordinates;
    const newLocation = { lat: coordinates[1], lng: coordinates[0] };
    setFormData(prev => ({
      ...prev,
      location: newLocation,
      address: result.place_name,
      state: result.context?.find(c => c.id.includes('region'))?.text || prev.state,
      city: result.context?.find(c => c.id.includes('place'))?.text || prev.city,
    }));
    if (map.current) map.current.setCenter(coordinates);
    if (marker.current) marker.current.setLngLat(coordinates);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-background/70 backdrop-blur-sm border-white/20 shadow-2xl shadow-blue-500/10 p-8 rounded-lg">
        <div className="mb-8">
            <StepIndicator currentStep={step} />
        </div>
        <form onSubmit={handleSubmit} className="mt-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
                <h2 className="text-xl font-semibold text-center">Create your account</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <Input name="firstName" placeholder="First Name" onChange={handleChange} value={formData.firstName} required />
                    <Input name="lastName" placeholder="Last Name" onChange={handleChange} value={formData.lastName} required />
                </div>
                <Input name="email" type="email" placeholder="Email Address" onChange={handleChange} value={formData.email} required />
                <Input name="phone" type="tel" placeholder="Phone Number" onChange={handleChange} value={formData.phone} required />
                 <div className="relative">
                    <Input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password (min. 8 characters)" onChange={handleChange} value={formData.password} required />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                       {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="relative">
                    <Input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} value={formData.confirmPassword} required />
                </div>
            </div>
          )}

          {step === 2 && (
             <div className="space-y-6 animate-in fade-in-50 duration-500">
                <h2 className="text-xl font-semibold text-center">Tell us about your business</h2>
                <Input name="businessName" placeholder="Business Name" onChange={handleChange} value={formData.businessName} required />
                 <Select name="category" onValueChange={(value) => setFormData(prev => ({...prev, category: value as SalonCategory}))} value={formData.category}>
                    <SelectTrigger><SelectValue placeholder="Salon Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unisex">Unisex</SelectItem>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                    </SelectContent>
                </Select>
                <div className="space-y-2">
                    <Label>Sub Categories</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['shop', 'shop-at-home', 'onsite'] as SubCategory[]).map(sc => (
                        <div key={sc} className="flex items-center space-x-2 p-2 border rounded-md">
                          <Checkbox id={sc} checked={formData.subCategories.includes(sc)} onCheckedChange={(checked) => handleCheckboxChange(sc, checked)} />
                          <Label htmlFor={sc} className="capitalize">{sc.replace('-', ' ')}</Label>
                        </div>
                      ))}
                    </div>
                </div>
                <Textarea name="description" placeholder="Business Description (Optional)" onChange={handleChange} value={formData.description} />
                <Input name="website" placeholder="Website URL (Optional)" onChange={handleChange} value={formData.website} />
                <Input name="referredByCode" placeholder="Referral Code (Optional)" onChange={handleChange} value={formData.referredByCode} />
            </div>
          )}

          {step === 3 && (
             <div className="space-y-6 animate-in fade-in-50 duration-500">
                <h2 className="text-xl font-semibold text-center">Where is your business located?</h2>
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
                            <MapIcon className="mr-2 h-4 w-4" />
                            Choose Map
                        </Button>
                    </div>
                </div>
                <Input name="address" placeholder="Full Address" onChange={handleChange} value={formData.address} required />
                 <div className="grid md:grid-cols-3 gap-4">
                    <Input name="state" placeholder="State" onChange={handleChange} value={formData.state} required />
                    <Input name="city" placeholder="City" onChange={handleChange} value={formData.city} required />
                    <Input name="pincode" placeholder="Pincode" onChange={handleChange} value={formData.pincode} required />
                </div>
             </div>
          )}
          
          <div className="flex justify-between pt-6 border-t mt-8">
            <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            {step < 3 ? (
              <Button type="button" onClick={nextStep}>
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Complete Registration"}
              </Button>
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
};

export const VendorRegistrationFormWithSuspense = (props) => (
  <Suspense fallback={<div>Loading form...</div>}>
    <VendorRegistrationForm {...props} />
  </Suspense>
);

    