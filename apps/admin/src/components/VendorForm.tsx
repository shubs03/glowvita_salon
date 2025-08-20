"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Image as ImageIcon, Upload, Map } from 'lucide-react';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { Checkbox } from "@repo/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from "@repo/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import stateCityData from '@/lib/state-city.json';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NEXT_PUBLIC_MAPBOX_API_KEY } from '../../../../packages/config/config';

// Mapbox access token
const MAPBOX_TOKEN = NEXT_PUBLIC_MAPBOX_API_KEY;

type SalonCategory = 'unisex' | 'men' | 'women';
type SubCategory = 'shop' | 'shop-at-home' | 'onsite';

export interface Vendor {
  id?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  state?: string;
  city?: string;
  address?: string;
  pincode?: string;
  category?: SalonCategory;
  subCategories?: SubCategory[];
  website?: string;
  description?: string;
  profileImage?: string;
  password?: string;
  location?: { lat: number; lng: number };
}

interface VendorFormProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
  isEditMode?: boolean;
  onSubmit?: (vendorData: Vendor) => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  salonName: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  address: string;
  pincode: string;
  password: string;
  confirmPassword: string;
  salonCategory: SalonCategory | '';
  subCategories: SubCategory[];
  profileImage: string;
  location: { lat: number; lng: number } | null;
}

interface State {
  state: string;
  districts: string[];
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

const states: State[] = stateCityData.states;

export function VendorForm({ isOpen, onClose, vendor, isEditMode = false, onSubmit }: VendorFormProps) {
  const [selectedState, setSelectedState] = useState<string>(vendor?.state || "");
  const [cities, setCities] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: vendor?.firstName || '',
    lastName: vendor?.lastName || '',
    salonName: vendor?.businessName || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    state: vendor?.state || '',
    city: vendor?.city || '',
    address: vendor?.address || '',
    pincode: vendor?.pincode || '',
    password: '',
    confirmPassword: '',
    salonCategory: vendor?.category || 'unisex',
    subCategories: vendor?.subCategories || [],
    profileImage: vendor?.profileImage || '',
    location: vendor?.location || null,
  });

  const salonCategories: { value: SalonCategory; label: string }[] = [
    { value: 'unisex', label: 'Unisex Salon' },
    { value: 'men', label: "Men's Salon" },
    { value: 'women', label: "Women's Salon" },
  ];

  const subCategories: { id: SubCategory; label: string }[] = [
    { id: 'shop', label: 'Shop' },
    { id: 'shop-at-home', label: 'Shop at Home' },
    { id: 'onsite', label: 'Onsite' },
  ];

  // Initialize Mapbox when modal opens - FIXED VERSION
  useEffect(() => {
    if (!isMapOpen || !MAPBOX_TOKEN) return;

    // Add a small delay to ensure the container is rendered
    const initMap = () => {
      if (!mapContainer.current) return;

      try {
        // Set the access token
        mapboxgl.accessToken = MAPBOX_TOKEN;
        
        // Remove existing map if it exists
        if (map.current) {
          map.current.remove();
        }

        // Create new map instance
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: formData.location ? [formData.location.lng, formData.location.lat] : [77.4126, 23.2599], // Default to center of India
          zoom: formData.location ? 15 : 5,
          attributionControl: false // Remove attribution for cleaner look
        });

        // Remove existing marker
        if (marker.current) {
          marker.current.remove();
        }

        // Create new marker
        marker.current = new mapboxgl.Marker({
          draggable: true,
          color: '#3B82F6' // Blue color
        })
          .setLngLat(formData.location ? [formData.location.lng, formData.location.lat] : [77.4126, 23.2599])
          .addTo(map.current);

        // Handle marker drag
        marker.current.on('dragend', () => {
          const lngLat = marker.current!.getLngLat();
          setFormData(prev => ({ 
            ...prev, 
            location: { lat: lngLat.lat, lng: lngLat.lng } 
          }));
          fetchAddress([lngLat.lng, lngLat.lat]);
        });

        // Handle map click to move marker
        map.current.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          setFormData(prev => ({ 
            ...prev, 
            location: { lat, lng } 
          }));
          marker.current!.setLngLat([lng, lat]);
          fetchAddress([lng, lat]);
        });

        // Ensure map resizes properly after load
        map.current.on('load', () => {
          setTimeout(() => {
            map.current!.resize();
          }, 100);
        });

      } catch (error) {
        console.error('Error initializing Mapbox:', error);
        setErrors(prev => ({ ...prev, location: 'Failed to load map. Please check Mapbox configuration.' }));
      }
    };

    // Small delay to ensure DOM is ready
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
  }, [isMapOpen, MAPBOX_TOKEN]);

  // Resize map when modal is fully opened
  useEffect(() => {
    if (isMapOpen && map.current) {
      setTimeout(() => {
        map.current!.resize();
      }, 300); // Wait for modal animation to complete
    }
  }, [isMapOpen]);

  // Load cities when state changes
  useEffect(() => {
    if (selectedState) {
      const stateData = states.find(s => s.state === selectedState);
      if (stateData) {
        setCities(stateData.districts);
        if (!formData.state) {
          setFormData(prev => ({ ...prev, state: selectedState }));
        }
      } else {
        setCities([]);
      }
    } else {
      setCities([]);
    }
  }, [selectedState, formData.state]);

  // Update form when vendor changes
  useEffect(() => {
    if (vendor) {
      setFormData({
        firstName: vendor.firstName || '',
        lastName: vendor.lastName || '',
        salonName: vendor.businessName || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        state: vendor.state || '',
        city: vendor.city || '',
        address: vendor.address || '',
        pincode: vendor.pincode || '',
        password: '',
        confirmPassword: '',
        salonCategory: vendor.category || 'unisex',
        subCategories: vendor.subCategories || [],
        profileImage: vendor.profileImage || '',
        location: vendor.location || null,
      });
      if (vendor.state) {
        setSelectedState(vendor.state);
      }
    }
  }, [vendor]);

  // Search for locations using Mapbox Geocoding API - FIXED VERSION
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

  // Fetch address from coordinates using reverse geocoding - FIXED VERSION
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
        
        if (state) setSelectedState(state);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
    } else if (name === 'pincode') {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= 6) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (id: SubCategory, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      subCategories: checked
        ? [...new Set([...prev.subCategories, id])]
        : prev.subCategories.filter(item => item !== id)
    }));
    if (errors.subCategories) {
      setErrors(prev => ({ ...prev, subCategories: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.salonName) newErrors.salonName = 'Salon name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.salonCategory) newErrors.salonCategory = 'Salon category is required';
    if (formData.subCategories.length === 0) newErrors.subCategories = 'At least one sub-category is required';
    if (!formData.location) newErrors.location = 'Please select a location on the map';

    if (!isEditMode) {
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      salonName: '',
      email: '',
      phone: '',
      state: '',
      city: '',
      pincode: '',
      address: '',
      password: '',
      confirmPassword: '',
      salonCategory: '',
      subCategories: [],
      profileImage: '',
      location: null,
    });
    setPreviewImage('');
    setSelectedState('');
    setSearchQuery('');
    setSearchResults([]);
    setErrors({});
    setIsMapOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submissionData: Vendor = {
      id: isEditMode ? vendor?.id : undefined,
      firstName: formData.firstName,
      lastName: formData.lastName,
      businessName: formData.salonName,
      email: formData.email,
      phone: formData.phone,
      state: formData.state,
      city: formData.city,
      address: formData.address,
      pincode: formData.pincode,
      category: formData.salonCategory || undefined,
      subCategories: formData.subCategories,
      profileImage: formData.profileImage || undefined,
      description: formData.address || undefined,
      password: !isEditMode && formData.password ? formData.password : undefined,
      location: formData.location || undefined,
    };

    if (onSubmit) {
      onSubmit(submissionData);
    }

    resetForm();
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profileImage: 'Image size should be less than 5MB'
        }));
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          profileImage: 'Only JPG, PNG, and GIF files are allowed'
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setFormData(prev => ({ ...prev, profileImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage('');
    setFormData(prev => ({ ...prev, profileImage: '' }));
    if (errors.profileImage) {
      setErrors(prev => ({ ...prev, profileImage: '' }));
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
    
    const state = result.context?.find(c => c.id.includes('region'))?.text;
    if (state) setSelectedState(state);
    
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Vendor' : 'Register New Vendor'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update vendor details below.' : 'Fill in the details to register a new vendor.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Salon Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="salonName">Salon Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="salonName"
                    name="salonName"
                    value={formData.salonName}
                    onChange={handleInputChange}
                    className={errors.salonName ? 'border-red-500' : ''}
                  />
                  {errors.salonName && (
                    <p className="text-sm text-red-500 mt-1">{errors.salonName}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="address">Complete Address <span className="text-red-500">*</span></Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter complete salon address"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => {
                    setSelectedState(value);
                    setFormData(prev => ({ ...prev, state: value, city: '' }));
                    if (errors.state) {
                      setErrors(prev => ({ ...prev, state: '' }));
                    }
                  }}
                >
                  <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 overflow-y-auto">
                    {states.map((state) => (
                      <SelectItem key={state.state} value={state.state}>
                        {state.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="text-sm text-red-500 mt-1">{errors.state}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, city: value }));
                    if (errors.city) {
                      setErrors(prev => ({ ...prev, city: '' }));
                    }
                  }}
                  disabled={!selectedState}
                >
                  <SelectTrigger className={errors.city ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 overflow-y-auto">
                    {cities.length > 0 ? (
                      cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="-" disabled>
                        Select a state first
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.city && (
                  <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode <span className="text-red-500">*</span></Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className={errors.pincode ? 'border-red-500' : ''}
                />
                {errors.pincode && (
                  <p className="text-sm text-red-500 mt-1">{errors.pincode}</p>
                )}
              </div>
            </div>
            {!isEditMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      className={errors.password ? 'border-red-500' : ''}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">Toggle password visibility</span>
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={errors.confirmPassword ? 'border-red-500' : ''}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">Toggle password visibility</span>
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Salon Category <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.salonCategory}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, salonCategory: value as SalonCategory }));
                  if (errors.salonCategory) {
                    setErrors(prev => ({ ...prev, salonCategory: '' }));
                  }
                }}
              >
                <SelectTrigger className={errors.salonCategory ? 'border-red-500' : ''}>
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
              {errors.salonCategory && (
                <p className="text-sm text-red-500 mt-1">{errors.salonCategory}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Sub Category <span className="text-red-500">*</span></Label>
              <div className={`space-y-2 p-3 rounded-md ${errors.subCategories ? 'border border-red-200 bg-red-50' : ''}`}>
                {subCategories.map((subCat) => (
                  <div key={subCat.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={subCat.id}
                      checked={formData.subCategories.includes(subCat.id)}
                      onCheckedChange={(checked) => handleCheckboxChange(subCat.id, checked as boolean)}
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
              {errors.subCategories && (
                <p className="text-sm text-red-500 mt-1">{errors.subCategories}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Salon Logo/Image</Label>
              <div className={`flex items-center gap-4 p-3 rounded-md ${errors.profileImage ? 'border border-red-200 bg-red-50' : ''}`}>
                <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                  {formData.profileImage ? (
                    <img 
                      src={formData.profileImage} 
                      alt="Salon preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('profileImage')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      disabled={!formData.profileImage}
                      onClick={handleRemoveImage}
                    >
                      Remove
                    </Button>
                  </div>
                  <Input 
                    id="profileImage" 
                    name="profileImage"
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended size: 500x500px. Max 5MB. Formats: JPG, PNG, GIF
                  </p>
                </div>
              </div>
              {errors.profileImage && (
                <p className="text-sm text-red-500 mt-1">{errors.profileImage}</p>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{isEditMode ? 'Save Changes' : 'Register Vendor'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Map Modal - IMPROVED VERSION */}
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Location</DialogTitle>
            <DialogDescription>
              Search for a location, click on the map, or drag the marker to select the exact position.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 flex flex-col h-[60vh]">
            {/* Search Input */}
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
            
            {/* Current Location Display */}
            {formData.location && (
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <strong>Selected Location:</strong> {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
              </div>
            )}
            
            {/* Map Container */}
            <div className="flex-1 relative border rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
              <div 
                ref={mapContainer} 
                className="w-full h-full"
                style={{ minHeight: '400px' }}
              />
              
              {/* Loading overlay */}
              {!MAPBOX_TOKEN && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-600">Map unavailable</p>
                    <p className="text-sm text-gray-500">Mapbox API key not configured</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Instructions */}
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
              onClick={() => {
                if (formData.location) {
                  setIsMapOpen(false);
                  // Clear any location-related errors
                  if (errors.location) {
                    setErrors(prev => ({ ...prev, location: '' }));
                  }
                } else {
                  setErrors(prev => ({ ...prev, location: 'Please select a location on the map' }));
                }
              }}
            >
              Confirm Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}