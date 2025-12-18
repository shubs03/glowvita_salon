
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
import { Trash2, UploadCloud, CheckCircle2, Users, Eye, EyeOff, Map, X, FileText, Clock, RefreshCw } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NEXT_PUBLIC_MAPBOX_API_KEY } from '../../../../packages/config/config';

// Mapbox access token
const MAPBOX_TOKEN = NEXT_PUBLIC_MAPBOX_API_KEY;

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

      mapboxgl.accessToken = MAPBOX_TOKEN;

      // Clean up existing map
      if (map.current) map.current.remove();

      // Create new map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: formData.location ? [formData.location.lng, formData.location.lat] : [77.4126, 23.2599],
        zoom: formData.location ? 15 : 5
      });

      // Remove existing marker
      if (marker.current) marker.current.remove();

      // Add marker if location exists
      if (formData.location) {
        marker.current = new mapboxgl.Marker({ draggable: true, color: '#3B82F6' })
          .setLngLat([formData.location.lng, formData.location.lat])
          .addTo(map.current);

        marker.current.on('dragend', () => {
          const lngLat = marker.current!.getLngLat();
          setFormData(prev => ({ ...prev, location: { lat: lngLat.lat, lng: lngLat.lng } }));
          fetchAddress([lngLat.lng, lngLat.lat]);
        });
      }

      // Handle map clicks
      map.current.on('click', (e: mapboxgl.MapLayerMouseEvent) => {
        const { lng, lat } = e.lngLat;
        setFormData(prev => ({ ...prev, location: { lat, lng } }));

        // Remove existing marker and add new one
        if (marker.current) marker.current.remove();
        if (map.current) {
          marker.current = new mapboxgl.Marker({ draggable: true, color: '#3B82F6' })
            .setLngLat([lng, lat])
            .addTo(map.current);

          marker.current.on('dragend', () => {
            const lngLat = marker.current!.getLngLat();
            setFormData(prev => ({ ...prev, location: { lat: lngLat.lat, lng: lngLat.lng } }));
            fetchAddress([lngLat.lng, lngLat.lat]);
          });
        }

        fetchAddress([lng, lat]);
      });

      // Resize map after load
      map.current.on('load', () => setTimeout(() => map.current?.resize(), 100));
    };

    // Initialize with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(initMap, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (map.current) map.current.remove();
      if (marker.current) marker.current.remove();
    };
  }, [isMapOpen]);

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
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=IN&types=place,locality,neighborhood,address`);
      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    }
  };

  // Fetch address details based on coordinates
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

  // Handle selection of a search result
  const handleSearchResultSelect = (result: any) => {
    const coordinates = result.geometry.coordinates;
    const newLocation = { lat: coordinates[1], lng: coordinates[0] };
    const state = result.context?.find((c: any) => c.id.includes('region'))?.text;

    setFormData(prev => ({
      ...prev,
      location: newLocation,
      address: result.place_name,
      state: state || prev.state,
      city: result.context?.find((c: any) => c.id.includes('place'))?.text || prev.city,
    }));

    // Update map
    if (map.current) {
      map.current.setCenter(coordinates);
      map.current.setZoom(15);
      setTimeout(() => map.current?.resize(), 100);
    }

    // Update marker
    if (marker.current) marker.current.setLngLat(coordinates);

    // Clear search
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
      toast.error(error.message || "Failed to renew subscription");
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
const BankDetailsTab = ({ vendor }: { vendor: Vendor | null }) => {
  if (!vendor) return <div>No vendor data available</div>;

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
              value={vendor.bankDetails?.accountHolder || ''}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input
              value={vendor.bankDetails?.accountNumber || ''}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label>Bank Name</Label>
            <Input
              value={vendor.bankDetails?.bankName || ''}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label>IFSC Code</Label>
            <Input
              value={vendor.bankDetails?.ifscCode || ''}
              readOnly
            />
          </div>
        </div>
      </CardContent>
    </Card>
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
              {isEditMode ? (
                <BankDetailsTab vendor={vendor} />
              ) : (
                <BankDetailsTab vendor={formData} />
              )}
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{vendor ? 'Save Changes' : 'Create Vendor'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
