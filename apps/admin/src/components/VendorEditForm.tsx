
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui/tabs';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Checkbox } from '@repo/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Trash2, UploadCloud, CheckCircle2, Users, Eye, EyeOff, Map } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NEXT_PUBLIC_MAPBOX_API_KEY } from '../../../../packages/config/config';

// Mapbox access token
const MAPBOX_TOKEN = NEXT_PUBLIC_MAPBOX_API_KEY;

interface Subscription {
  startDate: string;
  endDate: string;
  package: string;
  isActive: boolean;
}

interface BankDetails {
  accountHolderName: string;
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

export type SalonCategory = 'unisex' | 'men' | 'women';
type SubCategory = 'shop' | 'shop-at-home' | 'onsite';

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
  gallery?: string[];
  documents?: Document[];
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

// Define props for the tab components
interface TabProps {
  formData: Vendor;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (field: 'subCategories', id: SubCategory, checked: boolean) => void;
  errors: Partial<Record<keyof Vendor, string>>;
  setFormData: React.Dispatch<React.SetStateAction<Vendor>>;
  isEditMode: boolean;
}

const PersonalInformationTab = ({ formData, handleInputChange, handleCheckboxChange, errors, setFormData, isEditMode }: TabProps) => {
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [showPassword, setShowPassword] = useState(false);


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

        map.current.on('click', (e: mapboxgl.MapLayerMouseEvent) => {
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
        setFormData(prev => ({ ...prev, errors: { ...prev.errors, location: 'Failed to load map.' } } as Vendor));
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
  }, [isMapOpen, formData.location, setFormData]);

  // Resize map when modal is fully opened
  useEffect(() => {
    if (isMapOpen && map.current) {
      setTimeout(() => {
        map.current!.resize();
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

      const data: { features: MapboxFeature[] } = await response.json();
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

      const data: { features: MapboxFeature[] } = await response.json();
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        const context = data.features[0].context || [];
        const state = context.find(c => c.id.includes('region'))?.text || '';
        const city = context.find(c => c.id.includes('place'))?.text || '';

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
  const handleSearchResultSelect = (result: MapboxFeature) => {
    const coordinates = result.geometry.coordinates;
    const newLocation = { lat: coordinates[1], lng: coordinates[0] };

    setFormData(prev => ({
      ...prev,
      location: newLocation,
      address: result.place_name,
      state: result.context?.find(c => c.id.includes('region'))?.text || prev.state,
      city: result.context?.find(c => c.id.includes('place'))?.text || prev.city,
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size should not exceed 2MB');
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
    { id: 'shop', label: 'Shop' },
    { id: 'shop-at-home', label: 'Shop at Home' },
    { id: 'onsite', label: 'Onsite' },
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
                    accept="image/jpeg,image/png,image/gif" 
                    className="hidden" 
                    onChange={handleImageUpload}
                  />
                </Label>
                <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 2MB</p>
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
              <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} className={errors.email ? 'border-red-500' : ''} />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number <span className="text-red-500">*</span></Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} className={errors.phone ? 'border-red-500' : ''} />
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
        </CardContent>
      </Card>

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
    </>
  );
};
// Stub components for other tabs
const SubscriptionTab = ({ formData, handleInputChange, errors }: { formData: Vendor, handleInputChange: any, errors: any }) => <div>Subscription Info</div>;
const GalleryTab = ({ formData, handleInputChange, errors }: { formData: Vendor, handleInputChange: any, errors: any }) => <div>Gallery</div>;
const BankDetailsTab = ({ formData, handleInputChange, errors }: { formData: Vendor, handleInputChange: any, errors: any }) => <div>Bank Details</div>;
const DocumentsTab = ({ formData, handleInputChange, errors }: { formData: Vendor, handleInputChange: any, errors: any }) => <div>Documents</div>;
const ClientsTab = ({ vendor }: { vendor: Vendor | null }) => <div>Clients</div>;

interface VendorEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
  onSubmit: (vendor: Vendor) => void;
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
    subscription: { startDate: '', endDate: '', package: '', isActive: false },
    gallery: [],
    documents: [],
    location: null
});

export function VendorEditForm({ isOpen, onClose, vendor, onSubmit, onSuccess }: VendorEditFormProps) {
  const [formData, setFormData] = useState<Vendor>(getInitialFormData());
  const [errors, setErrors] = useState<Partial<Record<keyof Vendor, string>>>({});
  const isEditMode = !!vendor;

  useEffect(() => {
    if (isOpen) {
        setFormData(vendor ? { ...getInitialFormData(), ...vendor } : getInitialFormData());
        setErrors({});
    }
  }, [vendor, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    // A more robust validation would go here
    const requiredFields: (keyof Vendor)[] = ['firstName', 'lastName', 'email', 'phone', 'businessName', 'category', 'state', 'city', 'pincode', 'address'];
    const newErrors: Partial<Record<keyof Vendor, string>> = {};
    let isValid = true;
    for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
            newErrors[field] = 'This field is required';
            isValid = false;
        }
    }
    if (!isEditMode && !formData.password) {
        newErrors.password = "Password is required for new vendors";
        isValid = false;
    }
    setErrors(newErrors);
    return isValid;
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
              />
            </TabsContent>
            {/* Other Tabs would be here */}
             <TabsContent value="subscription"><SubscriptionTab formData={formData} handleInputChange={handleInputChange} errors={errors} /></TabsContent>
            <TabsContent value="gallery"><GalleryTab formData={formData} handleInputChange={handleInputChange} errors={errors} /></TabsContent>
            <TabsContent value="bank"><BankDetailsTab formData={formData} handleInputChange={handleInputChange} errors={errors} /></TabsContent>
            <TabsContent value="documents"><DocumentsTab formData={formData} handleInputChange={handleInputChange} errors={errors} /></TabsContent>
            <TabsContent value="clients"><ClientsTab vendor={vendor} /></TabsContent>
          </Tabs>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{vendor ? 'Save Changes' : 'Create Vendor'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
