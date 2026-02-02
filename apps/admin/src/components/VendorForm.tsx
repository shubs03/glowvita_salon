
"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Building, MapPin, User, ChevronRight, ArrowLeft, ArrowRight, Map as MapIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { toast } from 'sonner';
import { useCreateVendorMutation } from '@repo/store/api';
import { cn } from '@repo/ui/cn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Checkbox } from '@repo/ui/checkbox';
import { Textarea } from '@repo/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from '../../../../packages/config/config';

const rawApiKey = NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const GOOGLE_MAPS_API_KEY = rawApiKey.toString().trim().replace(/['"“”]/g, '');

type SalonCategory = 'unisex' | 'men' | 'women';
type SubCategory = 'at-salon' | 'at-home' | 'custom-location';

interface FormData {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  category: SalonCategory | '';
  subCategories: SubCategory[];
  description: string;
  website: string;
  profileImage: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  location: { lat: number; lng: number } | null;
  referredByCode: string;
}

interface GooglePlacesResult {
  description: string;
  place_id: string;
}

interface StepIndicatorProps {
    currentStep: number;
    setStep: (step: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, setStep }) => {
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
    businessName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    category: '',
    subCategories: [],
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

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [createVendor, { isLoading }] = useCreateVendorMutation();

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GooglePlacesResult[]>([]);
  const [authError, setAuthError] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (refCode) {
      setFormData(prev => ({...prev, referredByCode: refCode}));
    }
  }, [refCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (id: SubCategory, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      subCategories: checked
        ? [...prev.subCategories, id]
        : prev.subCategories.filter(item => item !== id)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
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
    if (!formData.businessName) newErrors.businessName = 'Business name is required';
    if (!formData.category) newErrors.category = 'Salon category is required';
    if (formData.subCategories.length === 0) newErrors.subCategories = 'At least one sub-category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

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
      
      await createVendor(submissionData).unwrap();
      toast.success(`${formData.businessName} vendor registration submitted successfully!`);
      onSuccess();
    } catch (err: any) {
       toast.error(err.data?.error || 'Registration failed');
    }
  };
  
  const nextStep = () => {
    if (step === 1 && validateStep1()) {
        setStep(2);
    } else if (step === 2 && validateStep2()) {
        setStep(3);
    } else {
      // Show error toast if validation fails
      if ((step === 1 && !validateStep1()) || 
          (step === 2 && !validateStep2()) || 
          (step === 3 && !validateStep3())) {
        toast.error("Please fill all required fields correctly.");
      }
    }
  }

  const prevStep = () => setStep(s => s - 1);

  // Load Google Maps script
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;

    // Suppress Google Maps IntersectionObserver internal error
    const originalError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('IntersectionObserver')) return;
      originalError.apply(console, args);
    };

    const checkGoogleMaps = () => {
      if ((window as any).google?.maps) {
        setIsGoogleMapsLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGoogleMaps()) return;

    const scriptId = 'google-maps-native-script';
    const existingScript = document.getElementById(scriptId);
    
    if (existingScript) {
      if (checkGoogleMaps()) return;
      
      const checkInterval = setInterval(() => {
        if (checkGoogleMaps()) {
          clearInterval(checkInterval);
        }
      }, 500);
      return () => clearInterval(checkInterval);
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,drawing,geometry&v=weekly`;
    script.async = true;
    script.defer = true;
    
    (window as any).gm_authFailure = () => {
      console.error("Google Maps API Key Authentication Failure - This usually means the API Key is invalid, has no billing, or is restricted incorrectly.");
      toast.error("Google Maps Authentication Failed. Please check your API key.");
      setAuthError(true);
    };

    script.onload = () => {
      setIsGoogleMapsLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      console.error = originalError;
    };
  }, []);

  // Initialize map when modal opens
  useEffect(() => {
    if (!isMapOpen || !isGoogleMapsLoaded || !GOOGLE_MAPS_API_KEY) return;
    
    const initMap = () => {
      if (!mapContainer.current || !window.google) return;
      
      // Clean up existing map
      if (map.current) {
        google.maps.event.clearInstanceListeners(map.current);
      }
      
      const center = formData.location 
        ? { lat: formData.location.lat, lng: formData.location.lng }
        : { lat: 23.2599, lng: 77.4126 }; // Center of India
      
      // Ensure container still exists and has height
      if (mapContainer.current) {
        const rect = mapContainer.current.getBoundingClientRect();
        if (rect.height === 0) {
          setTimeout(initMap, 200);
          return;
        }
      } else {
        return;
      }

      // Create new map
      map.current = new google.maps.Map(mapContainer.current, {
        center,
        zoom: formData.location ? 15 : 5,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: false,
      });
      
      // Initialize services
      geocoder.current = new google.maps.Geocoder();
      autocompleteService.current = new google.maps.places.AutocompleteService();
      placesService.current = new google.maps.places.PlacesService(map.current);
      
      // Remove existing marker
      if (marker.current) {
        marker.current.setMap(null);
      }
      
      // Add marker if location exists
      if (formData.location) {
        marker.current = new google.maps.Marker({
          position: center,
          map: map.current,
          draggable: true,
          animation: google.maps.Animation.DROP,
        });
          
        marker.current.addListener('dragend', () => {
          const position = marker.current!.getPosition();
          if (position) {
            setFormData(prev => ({ 
              ...prev, 
              location: { lat: position.lat(), lng: position.lng() } 
            }));
            fetchAddress({ lat: position.lat(), lng: position.lng() });
          }
        });
      }
      
      // Handle map clicks
      map.current.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setFormData(prev => ({ ...prev, location: { lat, lng } }));
        
        // Remove existing marker and add new one
        if (marker.current) {
          marker.current.setMap(null);
        }
        
        if (map.current) {
          marker.current = new google.maps.Marker({
            position: { lat, lng },
            map: map.current,
            draggable: true,
            animation: google.maps.Animation.DROP,
          });
            
          marker.current.addListener('dragend', () => {
            const position = marker.current!.getPosition();
            if (position) {
              setFormData(prev => ({ 
                ...prev, 
                location: { lat: position.lat(), lng: position.lng() } 
              }));
              fetchAddress({ lat: position.lat(), lng: position.lng() });
            }
          });
        }
        
        fetchAddress({ lat, lng });
      });
    };
    
    // Initialize with a larger delay to ensure DOM is ready and modal animation finished
    const timeoutId = setTimeout(initMap, 500);
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (marker.current) {
        marker.current.setMap(null);
      }
    };
  }, [isMapOpen, isGoogleMapsLoaded]);

  // Search for locations using Google Places Autocomplete
  const handleSearch = async (query: string) => {
    if (!query || !autocompleteService.current) {
      setSearchResults([]);
      return;
    }
    
    try {
      autocompleteService.current.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'IN' },
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSearchResults(predictions.map(p => ({
              description: p.description,
              place_id: p.place_id,
            })));
          } else {
            setSearchResults([]);
          }
        }
      );
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    }
  };
  
  // Fetch address details based on coordinates using reverse geocoding
  const fetchAddress = async (location: { lat: number; lng: number }) => {
    if (!geocoder.current) return;
    
    try {
      geocoder.current.geocode(
        { location },
        (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            const result = results[0];
            const address = result.formatted_address;
            
            let state = '';
            let city = '';
            
            result.address_components.forEach((component) => {
              if (component.types.includes('administrative_area_level_1')) {
                state = component.long_name;
              }
              if (component.types.includes('locality')) {
                city = component.long_name;
              }
            });
            
            setFormData(prev => ({
              ...prev,
              address,
              state: state || prev.state,
              city: city || prev.city
            }));
          }
        }
      );
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };
  
  // Handle selection of a search result
  const handleSearchResultSelect = (result: GooglePlacesResult) => {
    if (!placesService.current) return;
    
    placesService.current.getDetails(
      {
        placeId: result.place_id,
        fields: ['geometry', 'formatted_address', 'address_components'],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const newLocation = { lat, lng };
          
          let state = '';
          let city = '';
          
          place.address_components?.forEach((component) => {
            if (component.types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
          });
          
          setFormData(prev => ({
            ...prev,
            location: newLocation,
            address: place.formatted_address || result.description,
            state: state || prev.state,
            city: city || prev.city,
          }));
          
          if (map.current) {
            map.current.setCenter({ lat, lng });
            map.current.setZoom(15);
          }
          
          if (marker.current) {
            marker.current.setPosition({ lat, lng });
          } else if (map.current) {
            marker.current = new google.maps.Marker({
              position: { lat, lng },
              map: map.current,
              draggable: true,
              animation: google.maps.Animation.DROP,
            });
            
            marker.current.addListener('dragend', () => {
              const position = marker.current!.getPosition();
              if (position) {
                setFormData(prev => ({ 
                  ...prev, 
                  location: { lat: position.lat(), lng: position.lng() } 
                }));
                fetchAddress({ lat: position.lat(), lng: position.lng() });
              }
            });
          }
          
          setSearchResults([]);
          setSearchQuery('');
        }
      }
    );
  };

  const renderError = (fieldName: keyof FormData) => {
    if (errors[fieldName]) {
      return <p className="text-red-500 text-sm mt-1">{errors[fieldName]}</p>;
    }
    return null;
  };

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
            ← {step === 1 ? 'Back' : 'Back'}
          </Button>
          {step < 3 ? (
            <Button 
              type="button" 
              onClick={nextStep} 
              className="bg-black text-white px-4 sm:px-6 py-2 rounded-md hover:bg-gray-800 font-medium text-base sm:text-lg h-10 sm:h-auto"
            >
              Continue →
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
                  <p className="text-base sm:text-lg text-gray-500 mb-2">Account setup</p>
                  <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Create your account</h1>
                  <p className="text-gray-600 text-base sm:text-lg">Enter your personal details to get started.</p>
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
                    <Input name="phone" type="tel" placeholder="Phone Number" onChange={handleChange} value={formData.phone} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                    {renderError('phone')}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                  <div className="relative">
                    <Input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password (min. 8 characters)" onChange={handleChange} value={formData.password} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg w-full" />
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
                  <p className="text-base sm:text-lg text-gray-500 mb-2">Business setup</p>
                  <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Tell us about your business</h1>
                  <p className="text-gray-600 text-base sm:text-lg">Provide your business information and services.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                  <div>
                    <Input name="businessName" placeholder="Enter business name" onChange={handleChange} value={formData.businessName} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                    {renderError('businessName')}
                  </div>
                  <div>
                    <Textarea name="description" placeholder="Enter business description" onChange={handleChange} value={formData.description} className="min-h-[70px] sm:min-h-[80px] px-4 sm:px-5 py-2 sm:py-3 text-base sm:text-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                  <div>
                    <Select name="category" onValueChange={(value) => setFormData(prev => ({...prev, category: value as SalonCategory}))} value={formData.category}>
                      <SelectTrigger className="h-12 sm:h-14 w-full text-base sm:text-lg">
                        <SelectValue placeholder="Select salon category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unisex" className="text-base sm:text-lg">Unisex</SelectItem>
                        <SelectItem value="men" className="text-base sm:text-lg">Men</SelectItem>
                        <SelectItem value="women" className="text-base sm:text-lg">Women</SelectItem>
                      </SelectContent>
                    </Select>
                    {renderError('category')}
                  </div>
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                      {(['at-salon', 'at-home', 'custom-location'] as SubCategory[]).map(sc => (
                        <div key={sc} className="flex items-center space-x-2 p-2 sm:p-3 border rounded-md hover:bg-gray-50">
                          <Checkbox 
                            id={sc} 
                            checked={formData.subCategories.includes(sc)} 
                            onCheckedChange={(checked) => handleCheckboxChange(sc, checked as boolean)}
                            className="h-3 w-3 sm:h-4 sm:w-4"
                          />
                          <Label htmlFor={sc} className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap">
                            {sc.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {renderError('subCategories')}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                  <div>
                    <Input name="website" placeholder="https://example.com" onChange={handleChange} value={formData.website} className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                  </div>
                  <div>
                    <Input name="referredByCode" placeholder="Enter referral code if any" onChange={handleChange} value={formData.referredByCode} className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-500">
                <div className="mb-4 sm:mb-6">
                  <p className="text-base sm:text-lg text-gray-500 mb-2">Location setup</p>
                  <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Where is your business located?</h1>
                  <p className="text-gray-600 text-base sm:text-lg">Set your business location and address details.</p>
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
                <div>
                  <Input name="address" placeholder="Full Address" onChange={handleChange} value={formData.address} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                  {renderError('address')}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
                  <div>
                    <Input name="state" placeholder="State" onChange={handleChange} value={formData.state} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                    {renderError('state')}
                  </div>
                  <div>
                    <Input name="city" placeholder="City" onChange={handleChange} value={formData.city} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                    {renderError('city')}
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
      
        {/* Map Modal */}
        <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
          <DialogContent className="sm:max-w-5xl h-[85vh] p-0 overflow-hidden flex flex-col border-none shadow-2xl">
            <DialogHeader className="p-6 bg-gradient-to-r from-primary/10 to-transparent border-b">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Select Precise Location</DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium">
                    Search for your business area and refine by dragging the marker.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="flex-1 flex flex-col relative overflow-hidden">
              {/* Floating Search Bar with Glassmorphism */}
              <div className="absolute top-6 left-6 right-6 z-[100] max-w-md">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <MapIcon className="h-5 w-5" />
                  </div>
                  <Input
                    placeholder="Enter city, area, or landmark..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    className="w-full h-14 pl-12 pr-6 rounded-2xl border-none shadow-2xl bg-white/90 backdrop-blur-xl text-lg font-medium ring-1 ring-slate-200 focus:ring-2 focus:ring-primary transition-all"
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] max-h-[350px] overflow-y-auto overflow-x-hidden p-2 z-[110] animate-in slide-in-from-top-2 duration-200">
                      {searchResults.map((result) => (
                        <div
                          key={result.place_id}
                          className="group flex items-start gap-3 p-4 hover:bg-primary/5 cursor-pointer rounded-xl transition-all border-b border-slate-50 last:border-0"
                          onClick={() => handleSearchResultSelect(result)}
                        >
                          <div className="mt-0.5 p-2 rounded-full bg-slate-100 group-hover:bg-primary/10 text-slate-500 group-hover:text-primary transition-colors">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-800 group-hover:text-primary truncate transition-colors font-headline">
                              {result.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Map Container */}
              <div className="flex-1 relative bg-slate-100">
                <div 
                  ref={mapContainer} 
                  className="w-full h-full"
                />
                <div className="absolute bottom-6 left-6 z-50">
                   <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-sm font-bold text-slate-700 font-headline uppercase tracking-wider">Live Mapper</span>
                   </div>
                </div>
                
                {authError && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 z-[200]">
                    <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md text-center border border-red-100">
                      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <MapPin className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Google Maps Key Rejected</h3>
                      <p className="text-slate-500 text-sm mb-6">
                        The API key is invalid or rejected. Please check billing and project restrictions.
                      </p>
                      <Button 
                        onClick={() => window.location.reload()}
                        className="w-full rounded-xl bg-red-600 hover:bg-red-700 h-12 text-lg"
                      >
                        Reload Interface
                      </Button>
                    </div>
                  </div>
                )}

                {!isGoogleMapsLoaded && !authError && (
                  <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center z-[150]">
                    <div className="relative">
                       <div className="h-24 w-24 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <MapIcon className="h-8 w-8 text-primary/40" />
                       </div>
                    </div>
                    <p className="mt-6 text-lg font-bold text-slate-800 tracking-tight font-headline">Synchronizing Maps...</p>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter className="p-6 bg-slate-50 border-t flex flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                  {formData.location && (
                    <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                       <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                       </div>
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Coords Selected</div>
                       <div className="text-xs font-mono font-bold text-slate-800">
                         {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
                       </div>
                    </div>
                  )}
               </div>
               <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => setIsMapOpen(false)} className="rounded-xl h-12 px-6 font-bold text-slate-600 hover:bg-slate-200">
                  Dismiss
                </Button>
                <Button 
                  onClick={() => setIsMapOpen(false)} 
                  disabled={!formData.location}
                  className="rounded-xl h-12 px-8 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  Verify & Select Position
                </Button>
               </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export const VendorRegistrationFormWithSuspense = (props: { onSuccess: () => void }) => (
  <Suspense fallback={<div>Loading form...</div>}>
    <VendorForm {...props} />
  </Suspense>
);