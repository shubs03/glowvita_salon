
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useUpdateVendorDocumentStatusMutation, useGetAdminUsersQuery, useGetSubscriptionPlansQuery } from '@repo/store/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui/tabs';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Checkbox } from '@repo/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import { Trash2, UploadCloud, CheckCircle2, Users, Eye, EyeOff, Map, X, FileText, Clock, RefreshCw, MapPinIcon, MapPin } from 'lucide-react';
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from '../../../../packages/config/config';

// Google Maps API key
const rawApiKey = NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const GOOGLE_MAPS_API_KEY = rawApiKey.toString().trim().replace(/['"“”]/g, '');

interface SubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  duration: number;
  durationType: string;
}

interface SubscriptionHistoryItem {
  plan: SubscriptionPlan | string;
  startDate: string;
  endDate: string;
  status: string;
  archivedAt: string;
}

interface Subscription {
  startDate: string;
  endDate: string;
  plan?: SubscriptionPlan | string; // Changed from package to plan to match backend
  status?: string; // Added status
  history?: SubscriptionHistoryItem[]; // Added history
  isActive: boolean;
}

interface BankDetails {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  accountType: string;
  upiId?: string;
}

interface Document {
  id: string;
  name: string;
  type: 'aadhar' | 'pan' | 'gst' | 'license' | 'other';
  file: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

// Update type definitions
export type SalonCategory = 'unisex' | 'men' | 'women';
type SubCategory = 'at-salon' | 'at-home' | 'custom-location';

export interface Vendor {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  category: SalonCategory | '';
  subCategories: SubCategory[];
  description: string;
  profileImage?: string;
  website?: string;
  state: string;
  city: string;
  pincode: string;
  address: string;
  password?: string;
  subscription?: Subscription;
  gallery?: string[]; // Add gallery field
  documents?: Record<string, any>; // Add documents field to match vendor model
  bankDetails?: BankDetails;
  location?: { lat: number; lng: number } | null;
  confirmPassword?: string;
  businessType?: string;
  businessCategory?: string;
  businessEmail?: string;
  businessDescription?: string;
  serviceCategories?: string[];
  status?: 'Active' | 'Disabled' | 'Pending' | 'Approved' | 'Disapproved';
}


interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  totalVisits: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'new';
  avatar?: string;
}

interface GooglePlacesResult {
  description: string;
  place_id: string;
}

// Define props for the tab components
interface TabProps {
  formData: Vendor;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (field: 'subCategories', id: SubCategory, checked: boolean) => void;
  errors: Partial<Record<keyof Vendor, string>>;
  setFormData: React.Dispatch<React.SetStateAction<Vendor>>;
  isEditMode: boolean;
  onSave?: (data: Partial<Vendor>) => void;
  isSaving?: boolean;
}

const PersonalInformationTab = ({ formData, handleInputChange, handleCheckboxChange, errors, setFormData, isEditMode, onSave, isSaving }: TabProps) => {
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<GooglePlacesResult[]>([]);
  const [authError, setAuthError] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const [showPassword, setShowPassword] = useState(false);


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
      geocoder.current.geocode({ location }, (results, status) => {
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
      });
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a JPG or PNG image');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should not exceed 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: Vendor) => ({
          ...prev,
          profileImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const salonCategories = [
    { value: 'unisex' as const, label: 'Unisex Salon' },
    { value: 'men' as const, label: "Men's Salon" },
    { value: 'women' as const, label: "Women's Salon" },
  ];

  const subCategories: { id: SubCategory; label: string }[] = [
    { id: 'at-salon', label: 'At Salon' },
    { id: 'at-home', label: 'At Home' },
    { id: 'custom-location', label: 'Custom Location' },
  ];

  return (
    <>
      <Card>
        <CardHeader><CardTitle>Personal & Business Information</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                {formData.profileImage ? (
                  <img
                    src={formData.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Profile image failed to load in VendorEditForm:', formData.profileImage);
                      // Set a fallback image on error
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileImage" className="cursor-pointer block">
                  <span className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <svg className="-ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formData.profileImage ? 'Change Photo' : 'Upload Photo'}
                  </span>
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </Label>
                <p className="text-xs text-gray-500">JPG or PNG. Max size of 5MB</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name <span className="text-red-500">*</span></Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName || ''}
                  onChange={handleInputChange}
                  className={errors.businessName ? 'border-red-500' : ''}
                />
                {errors.businessName && <p className="text-sm text-red-500 mt-1">{errors.businessName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Salon Category <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.category || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as SalonCategory }))}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select salon category" />
                  </SelectTrigger>
                  <SelectContent>
                    {salonCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label>Sub Categories <span className="text-red-500">*</span></Label>
                <div className={`space-y-2 p-3 rounded-md ${errors.subCategories ? 'border border-red-200 bg-red-50' : ''}`}>
                  {subCategories.map((subCat: any) => (
                    <div key={subCat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={subCat.id}
                        checked={formData.subCategories.includes(subCat.id)}
                        onCheckedChange={(checked) => handleCheckboxChange('subCategories', subCat.id, checked as boolean)}
                      />
                      <label
                        htmlFor={subCat.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {subCat.label}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.subCategories && <p className="text-sm text-red-500 mt-1">{errors.subCategories}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website || ''}
                  onChange={handleInputChange}
                  className={errors.website ? 'border-red-500' : ''}
                />
                {errors.website && <p className="text-sm text-red-500 mt-1">{errors.website}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description || ''}
                onChange={handleInputChange}
                placeholder="Tell us about your business..."
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
              <Input id="firstName" name="firstName" value={formData.firstName || ''} onChange={handleInputChange} className={errors.firstName ? 'border-red-500' : ''} />
              {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
              <Input id="lastName" name="lastName" value={formData.lastName || ''} onChange={handleInputChange} className={errors.lastName ? 'border-red-500' : ''} />
              {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
              <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} readOnly={isEditMode} className={`${errors.email ? 'border-red-500' : ''} ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number <span className="text-red-500">*</span></Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} maxLength={10} className={errors.phone ? 'border-red-500' : ''} />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          {!isEditMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password || ''} onChange={handleInputChange} required className={errors.password ? 'border-red-500' : ''} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword || ''} onChange={handleInputChange} required className={errors.confirmPassword ? 'border-red-500' : ''} />
                {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-2">
              <Input
                id="location"
                value={formData.location ? `${formData.location.lat.toFixed(6)}, ${formData.location.lng.toFixed(6)}` : ''}
                placeholder="Select location from map"
                readOnly
                className={errors.location ? 'border-red-500' : ''}
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
            {errors.location && (
              <p className="text-sm text-red-500 mt-1">{errors.location}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
              <Input id="state" name="state" value={formData.state || ''} onChange={handleInputChange} className={errors.state ? 'border-red-500' : ''} />
              {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
              <Input id="city" name="city" value={formData.city || ''} onChange={handleInputChange} className={errors.city ? 'border-red-500' : ''} />
              {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode <span className="text-red-500">*</span></Label>
              <Input id="pincode" name="pincode" value={formData.pincode || ''} onChange={handleInputChange} className={errors.pincode ? 'border-red-500' : ''} />
              {errors.pincode && <p className="text-sm text-red-500 mt-1">{errors.pincode}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Complete Address <span className="text-red-500">*</span></Label>
            <Textarea id="address" name="address" value={formData.address || ''} onChange={handleInputChange} placeholder="Enter complete salon address" className={errors.address ? 'border-red-500' : ''} />
            {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
          </div>

          {isEditMode && (
            <div className="flex justify-end pt-4 border-t">
              <Button
                type="button"
                onClick={() => onSave?.(formData)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Personal Info'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Modal */}
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="sm:max-w-5xl h-[85vh] p-0 overflow-hidden flex flex-col border-none shadow-2xl">
          <DialogHeader className="p-6 bg-gradient-to-r from-primary/10 to-transparent border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Select Precise Location</DialogTitle>
                <DialogDescription className="text-slate-500 font-medium font-headline">
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
                  <Map className="h-5 w-5" />
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
                          <MapPinIcon className="h-4 w-4" />
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
                    <h3 className="text-xl font-bold text-slate-900 mb-2 font-headline">Google Maps Key Rejected</h3>
                    <p className="text-slate-500 text-sm mb-6">
                      The API key is invalid or rejected. Please check billing and project restrictions.
                    </p>
                    <Button 
                      onClick={() => window.location.reload()}
                      className="w-full rounded-xl bg-red-600 hover:bg-red-700 h-12 text-lg font-headline"
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
                        <Map className="h-8 w-8 text-primary/40" />
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
                  <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                     <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                     </div>
                     <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter font-headline">Coords Selected</div>
                     <div className="text-xs font-mono font-bold text-slate-800">
                       {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
                     </div>
                  </div>
                )}
             </div>
             <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setIsMapOpen(false)} className="rounded-xl h-12 px-6 font-bold text-slate-600 hover:bg-slate-200 transition-all font-headline">
                Dismiss
              </Button>
              <Button 
                onClick={() => setIsMapOpen(false)} 
                disabled={!formData.location}
                className="rounded-xl h-12 px-8 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all font-headline"
              >
                Verify & Select Position
              </Button>
             </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const SubscriptionTab = ({ formData, handleInputChange, errors, onSuccess }: { formData: Vendor, handleInputChange: any, errors: any, onSuccess?: () => void }) => {
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedRenewalPlan, setSelectedRenewalPlan] = useState<string | null>(null);
  const [isRenewing, setIsRenewing] = useState(false);
  const { data: plans = [], isLoading: plansLoading } = useGetSubscriptionPlansQuery(undefined);
  // Get token for manual fetch
  // Note: We need to access the store state safely. 
  // Since we can't easily use useSelector inside this sub-component if it's not wrapped properly or to keep it simple, 
  // we'll try to get it from local storage or assume the parent context/store is available if we lift state.
  // Actually, we are in a component rendered by VendorEditForm which is inside a provider likely.
  // We can use useSelector.
  const token = useSelector((state: any) => state.adminAuth?.token);


  const handleRenewClick = () => {
    setIsRenewModalOpen(true);
  };

  const submitRenewal = async () => {
    if (!formData._id || !selectedRenewalPlan) {
      toast.error("Please select a plan");
      return;
    }

    try {
      setIsRenewing(true);
      const response = await fetch('/api/admin/subscription-renewal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          vendorId: formData._id,
          planId: selectedRenewalPlan,
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Subscription renewed successfully!");
        setIsRenewModalOpen(false);
        if (onSuccess) onSuccess();
      } else {
        throw new Error(data.message || "Failed to renew");
      }
    } catch (error: any) {
      console.error("Renewal error:", error);
    } finally {
      setIsRenewing(false);
    }
  };

  const currentPlanName = formData.subscription?.plan && typeof formData.subscription.plan === 'object'
    ? (formData.subscription.plan as any).name
    : "No Active Plan";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Current Subscription</CardTitle>
          <Button type="button" onClick={handleRenewClick} size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Renew Subscription
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan Details */}
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Current Plan</Label>
                <div className="text-xl font-bold flex items-center gap-2">
                  {currentPlanName}
                  <Badge variant={formData.subscription?.status === 'Active' ? 'default' : 'destructive'}>
                    {formData.subscription?.status || 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Start Date</Label>
                  <div className="font-medium">
                    {formData.subscription?.startDate
                      ? new Date(formData.subscription.startDate).toLocaleDateString()
                      : '-'}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">End Date</Label>
                  <div className="font-medium">
                    {formData.subscription?.endDate
                      ? new Date(formData.subscription.endDate).toLocaleDateString()
                      : '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Status / Expiry Info */}
            <div className="bg-muted/30 p-4 rounded-lg flex flex-col justify-center items-center text-center">
              {formData.subscription?.endDate && (
                (() => {
                  const now = new Date();
                  const end = new Date(formData.subscription.endDate);
                  const diffTime = end.getTime() - now.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  if (diffDays > 0) return (
                    <>
                      <span className="text-3xl font-bold text-green-600">{diffDays}</span>
                      <span className="text-sm text-muted-foreground">Days Remaining</span>
                    </>
                  );
                  else return (
                    <>
                      <span className="text-3xl font-bold text-red-600">{Math.abs(diffDays)}</span>
                      <span className="text-sm text-muted-foreground">Days Overdue</span>
                    </>
                  );
                })()
              )}
              {!formData.subscription?.endDate && <span className="text-muted-foreground">No duration info</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" /> Subscription History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formData.subscription?.history && formData.subscription.history.length > 0 ? (
            <div className="relative border-l-2 border-muted ml-3 pl-6 space-y-6">
              {formData.subscription.history.slice().reverse().map((item, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-muted border-2 border-background" />
                  <div className="space-y-1">
                    <p className="font-medium">
                      {typeof item.plan === 'object' ? (item.plan as any).name : 'Plan'}
                      <span className="ml-2 text-xs text-muted-foreground border px-1 rounded">
                        {item.status}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No subscription history available</p>
          )}
        </CardContent>
      </Card>

      {/* Renew Modal */}
      <Dialog open={isRenewModalOpen} onOpenChange={setIsRenewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew Subscription</DialogTitle>
            <DialogDescription>Select a plan to renew this vendor's subscription.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              {plansLoading ? (
                <p>Loading plans...</p>
              ) : (
                plans.map((plan: any) => (
                  <div
                    key={plan._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedRenewalPlan === plan._id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                    onClick={() => setSelectedRenewalPlan(plan._id)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{plan.name}</span>
                      <span className="font-bold">₹{plan.discountedPrice || plan.price}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {plan.duration} {plan.durationType}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenewModalOpen(false)}>Cancel</Button>
            <Button type="button" onClick={submitRenewal} disabled={isRenewing || !selectedRenewalPlan}>
              {isRenewing ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Renewing...
                </>
              ) : 'Confirm Renewal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Add GalleryTab component for view-only mode
const GalleryTab = ({ vendor }: { vendor: Vendor | null }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!vendor) return <div>No vendor data available</div>;

  const openPreview = (src: string) => {
    setPreviewImage(src);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salon Gallery</CardTitle>
        {/* <CardDescription>View salon's photo gallery.</CardDescription> */}
      </CardHeader>
      <CardContent>
        {vendor.gallery && vendor.gallery.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {vendor.gallery.map((src, index) => (
              <div key={index} className="relative group aspect-video">
                <img
                  src={src}
                  alt={`Salon image ${index + 1}`}
                  className="object-cover rounded-lg cursor-pointer w-full h-full"
                  onClick={() => openPreview(src)}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPreview(src);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">No images uploaded yet</p>
        )}

        {/* Image Preview Modal */}
        {previewImage && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closePreview}>
            <div className="relative max-w-4xl max-h-full w-full" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="secondary"
                size="icon"
                className="absolute -top-12 right-0"
                onClick={closePreview}
              >
                <X className="h-4 w-4" />
              </Button>
              <img
                src={previewImage}
                alt="Preview"
                className="object-contain max-h-[80vh] mx-auto max-w-full"
                onError={(e) => {
                  console.log('Gallery image failed to load in VendorEditForm:', previewImage);
                  // Set a fallback image on error
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Add BankDetailsTab component for view-only mode
const BankDetailsTab = ({ formData, handleInputChange, onSave, isSaving }: { formData: Vendor, handleInputChange: any, onSave?: (data: any) => void, isSaving?: boolean }) => {
  if (!formData) return <div>No vendor data available</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Details</CardTitle>
        {/* <CardDescription>View vendor's bank account information.</CardDescription> */}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Account Holder Name</Label>
            <Input
              name="bankDetails.accountHolder"
              value={formData.bankDetails?.accountHolder || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input
              name="bankDetails.accountNumber"
              value={formData.bankDetails?.accountNumber || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label>Bank Name</Label>
            <Input
              name="bankDetails.bankName"
              value={formData.bankDetails?.bankName || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label>IFSC Code</Label>
            <Input
              name="bankDetails.ifscCode"
              value={formData.bankDetails?.ifscCode || ''}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t">
          <Button
            type="button"
            onClick={() => onSave?.(formData.bankDetails)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Bank Details'
            )}
          </Button>
        </div>
      </CardContent>
    </Card >
  );
};

// Add DocumentsTab component for view-only mode
const DocumentsTab = ({ vendor }: { vendor: Vendor | null }) => {
  const [previewDocument, setPreviewDocument] = useState<{ src: string; type: string } | null>(null);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [updateDocumentStatus] = useUpdateVendorDocumentStatusMutation();

  if (!vendor) return <div>No vendor data available</div>;

  const openDocumentPreview = (src: string, type: string) => {
    setPreviewDocument({ src, type });
  };

  const closeDocumentPreview = () => {
    setPreviewDocument(null);
  };

  // Document types based on the Vendor model
  const documentTypes = [
    { key: 'aadharCard', label: 'Aadhar Card' },
    { key: 'panCard', label: 'PAN Card' },
    { key: 'udyogAadhar', label: 'Udyog Aadhar' },
    { key: 'udhayamCert', label: 'Udhayam Certificate' },
    { key: 'shopLicense', label: 'Shop License' }
  ];

  // Get document status for a specific document type
  const getDocumentStatus = (docType: string) => {
    if (vendor.documents && typeof vendor.documents === 'object') {
      const statusKey = `${docType}Status`;
      return (vendor.documents as any)[statusKey] || 'pending';
    }
    return 'pending';
  };

  // Get rejection reason for a specific document type
  const getRejectionReason = (docType: string) => {
    if (vendor.documents && typeof vendor.documents === 'object') {
      const reasonKey = `${docType}RejectionReason`;
      return (vendor.documents as any)[reasonKey] || '';
    }
    return '';
  };

  // Get document value for a specific document type
  const getDocumentValue = (docType: string) => {
    if (vendor.documents && typeof vendor.documents === 'object') {
      return (vendor.documents as any)[docType] || null;
    }
    return null;
  };

  // Get status badge based on document status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="mr-1 h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><X className="mr-1 h-3 w-3" /> Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
    }
  };

  // Handle approve document
  const handleApproveDocument = async (docType: string) => {
    try {
      await updateDocumentStatus({
        vendorId: vendor._id!,
        documentType: docType,
        status: 'approved',
        rejectionReason: ''
      }).unwrap();

      // Add toast notification for successful approval
      const documentLabel = documentTypes.find(d => d.key === docType)?.label || docType;
      toast.success(`${documentLabel} approved successfully`);
    } catch (error) {
      console.error('Failed to approve document:', error);
      toast.error('Failed to approve document');
    }
  };

  // Handle reject document - open modal
  const handleRejectDocument = (docType: string) => {
    setSelectedDocumentType(docType);
    setRejectionReason('');
    setIsRejectionModalOpen(true);
  };

  // Handle confirm rejection
  const handleConfirmRejection = async () => {
    if (!selectedDocumentType) return;

    try {
      await updateDocumentStatus({
        vendorId: vendor._id!,
        documentType: selectedDocumentType,
        status: 'rejected',
        rejectionReason
      }).unwrap();

      // Add toast notification for successful rejection
      const documentLabel = documentTypes.find(d => d.key === selectedDocumentType)?.label || selectedDocumentType;
      toast.success(`${documentLabel} rejected successfully`);

      setIsRejectionModalOpen(false);
      setSelectedDocumentType(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Failed to reject document:', error);
      toast.error('Failed to reject document');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Documents</CardTitle>
        {/* <CardDescription>
          Review vendor's verification documents.
        </CardDescription> */}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {documentTypes.map(({ key, label }) => {
            const docValue = getDocumentValue(key);
            const docStatus = getDocumentStatus(key);
            const rejectionReasonText = getRejectionReason(key);

            return (
              <div key={key} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{label}</p>
                      {docValue ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center text-sm text-green-600">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Uploaded
                          </span>
                          {docStatus === 'pending' && (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                              <Clock className="mr-1 h-2 w-2" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center text-sm text-muted-foreground">
                          <X className="mr-1 h-3 w-3" />
                          Not uploaded
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {docValue ? (
                      <>
                        {docStatus !== 'pending' && getStatusBadge(docStatus)}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDocumentPreview(docValue as string, key)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {docStatus === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 text-xs"
                              onClick={() => handleApproveDocument(key)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 px-2 text-xs"
                              onClick={() => handleRejectDocument(key)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">No action</span>
                    )}
                  </div>
                </div>

                {/* Display rejection reason if document is rejected */}
                {docStatus === 'rejected' && rejectionReasonText && (
                  <div className="mt-3 p-3 bg-red-50 rounded-md border border-red-200">
                    <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                    <p className="text-sm text-red-700">{rejectionReasonText}</p>
                  </div>
                )}

                {/* Display admin rejection reason if document is rejected */}
                {docStatus === 'rejected' && vendor.documents && typeof vendor.documents === 'object' && (vendor.documents as any)[`${key}AdminRejectionReason`] && (
                  <div className="mt-3 p-3 bg-red-50 rounded-md border border-red-200">
                    <p className="text-sm font-medium text-red-800">Admin Rejection Reason:</p>
                    <p className="text-sm text-red-700">{(vendor.documents as any)[`${key}AdminRejectionReason`]}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Document Preview Modal */}
        {previewDocument && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closeDocumentPreview}>
            <div className="relative max-w-4xl max-h-full w-full" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="secondary"
                size="icon"
                className="absolute -top-12 right-0"
                onClick={closeDocumentPreview}
              >
                <X className="h-4 w-4" />
              </Button>
              {previewDocument.src?.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewDocument.src}
                  className="w-full h-[80vh]"
                  title="Document Preview"
                />
              ) : (
                <img
                  src={previewDocument.src || ''}
                  alt="Document Preview"
                  className="object-contain max-h-[80vh] mx-auto max-w-full"
                  onError={(e) => {
                    console.log('Document image failed to load in VendorEditForm:', previewDocument.src);
                    // Set a fallback image on error
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Rejection Reason Modal */}
        <Dialog open={isRejectionModalOpen} onOpenChange={setIsRejectionModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Document</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this document.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectionModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmRejection}
                disabled={!rejectionReason.trim()}
              >
                Reject Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

const ClientsTab = ({ vendor }: { vendor: Vendor | null }) => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch offline clients (existing implementation)
  useEffect(() => {
    const fetchClients = async () => {
      if (!vendor?._id) return;

      try {
        setLoading(true);

        // Get admin auth state from localStorage (same approach used in the app)
        const adminAuthState = typeof window !== 'undefined' ? localStorage.getItem('adminAuthState') : null;
        let token = null;

        if (adminAuthState) {
          try {
            const parsedState = JSON.parse(adminAuthState);
            token = parsedState.token;
          } catch (e) {
            console.error('Error parsing admin auth state:', e);
          }
        }

        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/admin/clients?vendorId=${vendor._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();

        if (data.success) {
          setClients(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch clients');
        }
      } catch (err) {
        setError('Failed to fetch clients');
        console.error('Error fetching clients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [vendor]);

  // Fetch online users using Redux hook
  const { data: onlineUsers = [], isLoading: onlineUsersLoading, error: onlineUsersError } = useGetAdminUsersQuery(
    vendor?._id ? { vendorId: vendor._id } : { vendorId: '' },
    { skip: !vendor?._id }
  );

  if (!vendor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No vendor selected</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading clients...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clients</CardTitle>
        <p className="text-sm text-muted-foreground">View clients associated with this vendor</p>
      </CardHeader>
      <CardContent>
        {/* Offline Clients */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Offline Clients</h3>
            <Badge className="bg-blue-100 text-blue-800">{clients.length} clients</Badge>
          </div>

          {clients.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No offline clients found for this vendor</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Name</th>
                    <th className="text-left py-2 px-4">Email</th>
                    <th className="text-left py-2 px-4">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client._id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          {client.profilePicture ? (
                            <img
                              src={client.profilePicture}
                              alt={client.fullName}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                          <span>{client.fullName}</span>
                        </div>
                      </td>
                      <td className="py-2 px-4">{client.email || 'N/A'}</td>
                      <td className="py-2 px-4">{client.phone || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Horizontal line separator */}
        <div className="my-8 border-t border-gray-200"></div>

        {/* Online Users */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Online Users</h3>
            <Badge className="bg-green-100 text-green-800">{onlineUsers.length} users</Badge>
          </div>

          {onlineUsersLoading ? (
            <p className="text-center py-4 text-muted-foreground">Loading online users...</p>
          ) : onlineUsersError ? (
            <p className="text-center py-4 text-red-500">Error loading online users</p>
          ) : onlineUsers.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No online users found for this vendor</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Name</th>
                    <th className="text-left py-2 px-4">Email</th>
                    <th className="text-left py-2 px-4">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {onlineUsers.map((user: any) => (
                    <tr key={user._id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <span>{user.firstName} {user.lastName}</span>
                        </div>
                      </td>
                      <td className="py-2 px-4">{user.emailAddress || 'N/A'}</td>
                      <td className="py-2 px-4">{user.mobileNo || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface VendorEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
  onSubmit: (vendor: any) => void | Promise<void>;
  onSuccess: () => void; // Added onSuccess prop
}

const getInitialFormData = (): Vendor => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  businessName: '',
  category: '',
  subCategories: [],
  description: '',
  profileImage: '',
  website: '',
  state: '',
  city: '',
  pincode: '',
  address: '',
  password: '',
  confirmPassword: '',
  subscription: { startDate: '', endDate: '', plan: '', isActive: false },
  gallery: [],
  documents: [],
  location: null
});

export function VendorEditForm({ isOpen, onClose, vendor, onSubmit, onSuccess }: VendorEditFormProps) {
  const [formData, setFormData] = useState<Vendor>(getInitialFormData());
  const [errors, setErrors] = useState<Partial<Record<keyof Vendor, string>>>({});
  const [isSavingTab, setIsSavingTab] = useState(false);
  const isEditMode = !!vendor;

  useEffect(() => {
    if (isOpen) {
      setFormData(vendor ? { ...getInitialFormData(), ...vendor } : getInitialFormData());
      setErrors({});
    }
  }, [vendor, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    let processedValue = value;

    // Mobile Number Restriction: Max 10 digits and numbers only
    if (name === 'phone') {
      const numbersOnly = value.replace(/\D/g, '');
      processedValue = numbersOnly.slice(0, 10);
    }

    // Name Restrictions: Only alphabets and spaces
    if (name === 'firstName' || name === 'lastName') {
      processedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Vendor] as any || {}),
          [child]: processedValue
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: processedValue }));
    }
  };

  const handleCheckboxChange = (field: 'subCategories', id: SubCategory, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? Array.from(new Set([...(prev[field] || []), id]))
        : (prev[field] || []).filter((item: SubCategory) => item !== id)
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof Vendor, string>> = {};
    let isValid = true;

    // Required fields check
    const requiredFields: (keyof Vendor)[] = ['firstName', 'lastName', 'email', 'phone', 'businessName', 'category', 'state', 'city', 'pincode', 'address'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = 'This field is required';
        isValid = false;
      }
    }

    // Business Name validation: only letters, numbers, spaces
    if (formData.businessName && !/^[a-zA-Z0-9\s]+$/.test(formData.businessName)) {
      newErrors.businessName = 'Only letters, numbers, and spaces allowed';
      isValid = false;
    }

    // First Name validation: only alphabets
    if (formData.firstName && !/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = 'Only alphabets allowed';
      isValid = false;
    }

    // Last Name validation: only alphabets
    if (formData.lastName && !/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Only alphabets allowed';
      isValid = false;
    }

    // Email validation
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Phone validation: exactly 10 digits
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Mobile number must be exactly 10 digits';
      isValid = false;
    }

    if (!isEditMode && !formData.password) {
      newErrors.password = "Password is required for new vendors";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  const handleSavePersonal = async (data: any) => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSavingTab(true);
      // Only include fields relevant to Personal/Business tab
      const personalFields: (keyof Vendor)[] = [
        'firstName', 'lastName', 'email', 'phone', 'businessName',
        'category', 'subCategories', 'description', 'profileImage',
        'website', 'state', 'city', 'pincode', 'address', 'location'
      ];

      const updatePayload: any = { id: vendor?._id };
      personalFields.forEach(field => {
        if (data[field] !== undefined) {
          updatePayload[field] = data[field];
        }
      });

      // We use the same onSubmit but with partial data
      // Since we refactored the API, it will handle this correctly.
      await onSubmit(updatePayload);
      toast.success("Personal information updated successfully");
      // Don't close modal, just keep it open as per user "each tab independent"
    } catch (err) {
      console.error("Failed to save personal info:", err);
    } finally {
      setIsSavingTab(false);
    }
  };

  const handleSaveBank = async (bankDetails: BankDetails) => {
    try {
      setIsSavingTab(true);
      await onSubmit({ id: vendor?._id, bankDetails });
      toast.success("Bank details updated successfully");
    } catch (err) {
      console.error("Failed to save bank info:", err);
    } finally {
      setIsSavingTab(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && formData) {
      const submissionData = { ...formData };

      // When creating a new vendor, don't send up _id or id fields.
      if (!isEditMode) {
        delete submissionData._id;
        delete submissionData.id;
      }

      onSubmit(submissionData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{vendor ? `Edit Vendor: ${vendor.businessName}` : 'Add New Vendor'}</DialogTitle>
            <DialogDescription>
              {vendor ? 'Update vendor details below.' : 'Fill in the details for the new vendor.'}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="personal" className="w-full py-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="bank">Bank Details</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="mt-4">
              <PersonalInformationTab
                formData={formData}
                handleInputChange={handleInputChange}
                handleCheckboxChange={handleCheckboxChange}
                errors={errors}
                setFormData={setFormData}
                isEditMode={isEditMode}
                onSave={handleSavePersonal}
                isSaving={isSavingTab}
              />
            </TabsContent>
            <TabsContent value="subscription">
              {isEditMode ? (
                <SubscriptionTab formData={vendor} handleInputChange={handleInputChange} errors={errors} onSuccess={onSuccess} />
              ) : (
                <SubscriptionTab formData={formData} handleInputChange={handleInputChange} errors={errors} onSuccess={onSuccess} />
              )}
            </TabsContent>
            <TabsContent value="gallery">
              {isEditMode ? (
                <GalleryTab vendor={vendor} />
              ) : (
                <GalleryTab vendor={formData} />
              )}
            </TabsContent>
            <TabsContent value="bank">
              <BankDetailsTab
                formData={formData}
                handleInputChange={handleInputChange}
                onSave={handleSaveBank}
                isSaving={isSavingTab}
              />
            </TabsContent>
            <TabsContent value="documents">
              {isEditMode ? (
                <DocumentsTab vendor={vendor} />
              ) : (
                <DocumentsTab vendor={formData} />
              )}
            </TabsContent>
            <TabsContent value="clients">
              <ClientsTab vendor={vendor} />
            </TabsContent>
          </Tabs>
          {!isEditMode && (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Create Vendor</Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
