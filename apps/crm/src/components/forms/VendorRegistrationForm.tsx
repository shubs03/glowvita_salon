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
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from '@repo/config/config';

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
  gstNo: string;
}

interface GooglePlacesResult {
  description: string;
  place_id: string;
}

const StepIndicator = ({ currentStep, setStep }: { currentStep: number, setStep: (step: number) => void }) => {
  return (
    <div className="w-full mb-4 mt-2">
      <div className="flex space-x-2">
        <div
          className={cn(
            "h-1 flex-1 rounded-full transition-colors cursor-pointer",
            currentStep >= 1 ? "bg-purple-600" : "bg-gray-200"
          )}
          onClick={() => currentStep > 1 && setStep(1)}
        />
        <div
          className={cn(
            "h-1 flex-1 rounded-full transition-colors cursor-pointer",
            currentStep >= 2 ? "bg-purple-600" : "bg-gray-200"
          )}
          onClick={() => currentStep > 2 && setStep(2)}
        />
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

export function VendorRegistrationForm({ onSuccess }: { onSuccess: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const refCode = searchParams.get('ref');
  const [currentStep, setCurrentStep] = useState(1);

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
    gstNo: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerVendor, { isLoading }] = useVendorRegisterMutation();

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
      setFormData(prev => ({ ...prev, referredByCode: refCode }));
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

  const handleSetStep = (step: number) => {
    setCurrentStep(step);
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
    else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) newErrors.firstName = 'First name can only contain letters and spaces';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) newErrors.lastName = 'Last name can only contain letters and spaces';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    } else if (!/^[0-9]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone can only contain numbers';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    } else if (formData.confirmPassword && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.confirmPassword)) {
      newErrors.confirmPassword = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    if (formData.referredByCode && formData.referredByCode.trim() !== '' && (!/^[a-zA-Z0-9_]+$/.test(formData.referredByCode) || formData.referredByCode.length < 6 || formData.referredByCode.length > 20)) newErrors.referredByCode = 'Referral code must be 6-20 characters long and contain only letters, numbers, and underscores';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.businessName) newErrors.businessName = 'Business name is required';
    else if (!/^[a-zA-Z0-9\s&.,'-]+$/.test(formData.businessName)) newErrors.businessName = 'Business name can only contain letters, numbers, spaces, and common punctuation (&.,\'-)';
    if (formData.website && formData.website.trim() !== '' && !/^(https?:\/\/)?([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.)+[a-zA-Z]{2,}(\/[\w-@\+%.~#?&//=]*)?$/.test(formData.website)) newErrors.website = 'Please enter a valid website URL';

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
      await registerVendor(formData).unwrap();
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

  const backToRoleSelection = () => {
    router.push('/auth/register');
  };

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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,drawing&v=weekly`;
    script.async = true;
    script.defer = true;

    (window as any).gm_authFailure = () => {
      console.error("Google Maps API Key Authentication Failure - This usually means the API Key is invalid, has no billing, or is restricted incorrectly.");
      toast.error("Google Maps Authentication Failed. Please check your API key.");
      setAuthError(true);
    };

    script.onload = () => setIsGoogleMapsLoaded(true);
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

      if (map.current) {
        google.maps.event.clearInstanceListeners(map.current);
      }

      const center = formData.location
        ? { lat: formData.location.lat, lng: formData.location.lng }
        : { lat: 23.2599, lng: 77.4126 };

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

    return () => {
      clearTimeout(timeoutId);
      if (marker.current) {
        marker.current.setMap(null);
      }
    };
  }, [isMapOpen, isGoogleMapsLoaded]);

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

  const fetchAddress = async (location: { lat: number; lng: number }) => {
    if (!geocoder.current) return;

    try {
      geocoder.current.geocode({ location }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          const address = result.formatted_address;

          let state = '';
          let city = '';
          let pincode = '';

          result.address_components.forEach((component) => {
            if (component.types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
            if (component.types.includes('postal_code')) {
              pincode = component.long_name;
            }
          });

          setFormData(prev => ({
            ...prev,
            address,
            state: state || prev.state,
            city: city || prev.city,
            pincode: pincode || prev.pincode
          }));
        }
      });
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

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
          let pincode = '';

          place.address_components?.forEach((component) => {
            if (component.types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
            if (component.types.includes('postal_code')) {
              pincode = component.long_name;
            }
          });

          setFormData(prev => ({
            ...prev,
            location: newLocation,
            address: place.formatted_address || result.description,
            state: state || prev.state,
            city: city || prev.city,
            pincode: pincode || prev.pincode,
          }));

          // Update map
          if (map.current) {
            map.current.setCenter({ lat, lng });
            map.current.setZoom(15);
          }

          // Update marker
          if (marker.current) {
            marker.current.setPosition({ lat, lng });
          }

          // Clear search
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
      {/* Added responsive container with proper scrolling for mobile */}
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pt-2 overflow-y-auto max-h-[calc(100vh-20px)]">
        <div className="fixed top-4 sm:top-8 left-4 sm:left-10 right-4 sm:right-10 flex justify-between items-center z-20">
          <Button
            type="button"
            variant="outline"
            onClick={step === 1 ? () => window.history.back() : prevStep}
            className="px-3 sm:px-4 py-2 text-base sm:text-lg text-gray-600 border-gray-300 hover:bg-gray-50 h-10 sm:h-auto"
          >
            ← {step === 1 ? 'Back to Role Selection' : 'Back'}
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
          {/* Added responsive container for form content */}
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
                  <div className="relative">
                    <Input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" onChange={handleChange} value={formData.confirmPassword} required className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg w-full" />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </Button>
                    {renderError('confirmPassword')}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                  <Input name="referredByCode" placeholder="Referral Code (Optional)" onChange={handleChange} value={formData.referredByCode} className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                  <Input name="gstNo" placeholder="GST No (Optional)" onChange={handleChange} value={formData.gstNo} className="h-12 sm:h-14 px-4 sm:px-5 text-base sm:text-lg" />
                </div>
                {renderError('referredByCode')}
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
                    <Select name="category" onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as SalonCategory }))} value={formData.category}>
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
                    {renderError('website')}
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
                        key={result.place_id}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 text-sm"
                        onClick={() => handleSearchResultSelect(result)}
                      >
                        <div className="font-medium">{result.description}</div>
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

                {authError && (
                  <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center p-4 text-center z-10">
                    <p className="text-red-600 font-bold mb-2">Google Maps Error</p>
                    <p className="text-xs text-red-500 mb-4">
                      InvalidKeyMapError: The API key is rejected.
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 font-semibold"
                    >
                      Reload Page
                    </button>
                    <p className="text-[10px] text-gray-400 mt-4 max-w-xs">
                      Check billing, Maps JavaScript API enablement, and API restrictions in Google Cloud Console.
                    </p>
                  </div>
                )}

                {!isGoogleMapsLoaded && !authError && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-600">Loading map...</p>
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

export const VendorRegistrationFormWithSuspense = (props: { onSuccess: () => void }) => (
  <Suspense fallback={<div>Loading form...</div>}>
    <VendorRegistrationForm {...props} />
  </Suspense>
);