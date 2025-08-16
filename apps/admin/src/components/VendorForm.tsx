"use client";

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Image as ImageIcon, X, Upload, Plus } from 'lucide-react';

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { Checkbox } from "@repo/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from "@repo/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Badge } from "@repo/ui/badge";

import { addVendor, updateVendor, selectVendorError, selectVendorMessage, clearVendorMessage } from '@repo/store/slices/vendorSlice';
import stateCityData from '@/lib/state-city.json';

type SalonCategory = 'unisex' | 'men' | 'women';
type SubCategory = 'shop' | 'shop-at-home' | 'onsite';
type ServiceCategory = 'hair' | 'nails' | 'skincare' | 'makeup' | 'hair-removal' | 'massage' | 'barber' | 'spa' | 'eyelash' | 'tanning' | 'other';

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
  serviceCategories?: ServiceCategory[];
  website?: string;
  description?: string;
  profileImage?: string;
}

interface VendorFormProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
  isEditMode?: boolean;
  onSuccess?: () => void;
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
  serviceCategories: ServiceCategory[];
  profileImage: string;
}

interface State {
  state: string;
  districts: string[];
}

const states: State[] = stateCityData.states;
export function VendorForm({ isOpen, onClose, vendor, isEditMode = false, onSuccess = () => {} }: VendorFormProps) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedState, setSelectedState] = useState(vendor?.state || "");
  const [cities, setCities] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
    const successMessage = useSelector(selectVendorMessage);
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
    salonCategory: (vendor?.category as SalonCategory) || 'unisex',
    subCategories: vendor?.subCategories || [],
    serviceCategories: vendor?.serviceCategories || [],
    profileImage: vendor?.profileImage || '',
  });

  // Category options
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

  const serviceCategories: { id: ServiceCategory; label: string }[] = [
    { id: 'hair', label: 'Hair' },
    { id: 'nails', label: 'Nails' },
    { id: 'skincare', label: 'Skincare' },
    { id: 'makeup', label: 'Makeup' },
    { id: 'hair-removal', label: 'Hair Removal' },
    { id: 'massage', label: 'Massage' },
    { id: 'barber', label: 'Barber' },
    { id: 'spa', label: 'Spa' },
    { id: 'eyelash', label: 'Eyelash' },
    { id: 'tanning', label: 'Tanning' },
    { id: 'other', label: 'Other' },
  ];

  // Load cities when state changes
  useEffect(() => {
    if (selectedState) {
      const stateData = states.find(s => s.state === selectedState);
      if (stateData) {
        setCities(stateData.districts);
        if (!formData.state) {
          setFormData(prev => ({ ...prev, state: selectedState }));
        }
      }
    }
  }, [selectedState]);

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
        salonCategory: (vendor.category as SalonCategory) || '',
        subCategories: vendor.subCategories || [],
        serviceCategories: vendor.serviceCategories || [],
        profileImage: vendor.profileImage || '',
      });
      if (vendor.state) {
        setSelectedState(vendor.state);
      }
    }
  }, [vendor]);

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
  };

  const handleCheckboxChange = <T extends 'subCategories' | 'serviceCategories'>(
    field: T,
    id: T extends 'subCategories' ? SubCategory : ServiceCategory,
    checked: boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? Array.from(new Set([...prev[field] as any[], id as any])) as T extends 'subCategories' ? SubCategory[] : ServiceCategory[]
        : (prev[field] as any[]).filter((item: any) => item !== id)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
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
    if (formData.serviceCategories.length === 0) newErrors.serviceCategories = 'At least one service category is required';

    // Password validation (only if password is being set or changed)
    if (formData.password || formData.confirmPassword) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    // Email format validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone number validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    // Pincode validation
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
      serviceCategories: [],
      profileImage: ''
    });
    setPreviewImage('');
    setSelectedState('');
    setErrors({});
  };

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submissionData = {
      ...formData,
      businessName: formData.salonName,
      category: formData.salonCategory as SalonCategory,
    };

    console.log('Form Submission Data:', submissionData);

    if (isEditMode) {
      dispatch(updateVendor({ ...submissionData, id: vendor?.id }));
    } else {
      dispatch(addVendor(submissionData));
    }

    if (onSuccess) {
      onSuccess();
    }

    // Optionally close and reset form after a delay to show success message
    setTimeout(() => {
        resetForm();
        onClose();
        dispatch(clearVendorMessage());
    }, 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setFormData(prev => ({
          ...prev,
          profileImage: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage('');
    setFormData(prev => ({
      ...prev,
      profileImage: ''
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Vendor' : 'Register New Vendor'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update vendor details below.' : 'Fill in the details to register a new vendor.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {successMessage}
            </div>
          )}
          <div className="space-y-6">
            {/* Personal Information */}
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => {
                    handleInputChange(e);
                    // Clear error when user types
                    if (errors.password) {
                      setErrors(prev => ({
                        ...prev,
                        password: ''
                      }));
                    }
                  }}
                  className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
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
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    handleInputChange(e);
                    // Clear error when user types
                    if (errors.confirmPassword) {
                      setErrors(prev => ({
                        ...prev,
                        confirmPassword: ''
                      }));
                    }
                  }}
                  className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
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

          <div className="space-y-2 col-span-2">
            <Label>Salon Category <span className="text-red-500">*</span></Label>
            <Select 
              value={formData.salonCategory}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, salonCategory: value as SalonCategory }));
                // Clear error when value is selected
                if (errors.salonCategory) {
                  setErrors(prev => ({
                    ...prev,
                    salonCategory: ''
                  }));
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
                    onCheckedChange={(checked) => {
                      handleCheckboxChange('subCategories', subCat.id, checked as boolean);
                      // Clear error when a sub-category is selected
                      if (errors.subCategories) {
                        setErrors(prev => ({
                          ...prev,
                          subCategories: ''
                        }));
                      }
                    }}
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
            <Label>Service Categories <span className="text-red-500">*</span></Label>
            <div className="flex gap-2">
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value=""
                onChange={(e) => {
                  const value = e.target.value as ServiceCategory;
                  if (value && !formData.serviceCategories.includes(value)) {
                    handleCheckboxChange('serviceCategories', value, true);
                    if (errors.serviceCategories) {
                      setErrors(prev => ({
                        ...prev,
                        serviceCategories: ''
                      }));
                    }
                  }
                }}
              >
                <option value="">Select a service</option>
                {serviceCategories.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.label}
                  </option>
                ))}
              </select>
              <div className="relative flex-grow">
                <Input
                  type="text"
                  id="customService"
                  placeholder="Add custom service"
                  className="pr-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      e.preventDefault();
                      const newService = e.currentTarget.value.trim() as ServiceCategory;
                      if (!formData.serviceCategories.includes(newService)) {
                        handleCheckboxChange('serviceCategories', newService, true);
                        if (errors.serviceCategories) {
                          setErrors(prev => ({ ...prev, serviceCategories: '' }));
                        }
                      }
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => {
                    const input = document.getElementById('customService') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      const newService = input.value.trim() as ServiceCategory;
                      if (!formData.serviceCategories.includes(newService)) {
                        handleCheckboxChange('serviceCategories', newService, true);
                        if (errors.serviceCategories) {
                          setErrors(prev => ({ ...prev, serviceCategories: '' }));
                        }
                      }
                      input.value = '';
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add Service</span>
                </Button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.serviceCategories.length > 0 ? (
                formData.serviceCategories.map((service) => (
                  <Badge key={service} variant="secondary" className="flex items-center gap-1">
                    {service}
                    <button
                      type="button"
                      className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                      onClick={() => handleCheckboxChange('serviceCategories', service, false)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {service}</span>
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Selected services will appear here.
                </p>
              )}
            </div>
            {errors.serviceCategories && (
              <p className="text-sm text-red-500 mt-1">{errors.serviceCategories}</p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Complete Address <span className="text-red-500">*</span></Label>
            <Textarea 
              id="address" 
              name="address"
              value={formData.address}
              onChange={(e) => {
                handleInputChange(e);
                // Clear error when user types
                if (errors.address) {
                  setErrors(prev => ({
                    ...prev,
                    address: ''
                  }));
                }
              }}
              placeholder="Enter complete salon address"
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-500 mt-1">{errors.address}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Salon Logo/Image</Label>
            <div className={`flex items-center gap-4 p-3 rounded-md ${errors.profileImage ? 'border border-red-200 bg-red-50' : ''}`}>
              <div className="w-24 h-24 bg-secondary rounded-md flex items-center justify-center overflow-hidden">
                {formData.profileImage ? (
                  <img 
                    src={formData.profileImage} 
                    alt="Salon preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      document.getElementById('profileImage')?.click();
                      // Clear error when user clicks upload
                      if (errors.profileImage) {
                        setErrors(prev => ({
                          ...prev,
                          profileImage: ''
                        }));
                      }
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    disabled={!formData.profileImage}
                    onClick={() => {
                      handleRemoveImage();
                      // Clear error when image is removed
                      if (errors.profileImage) {
                        setErrors(prev => ({
                          ...prev,
                          profileImage: ''
                        }));
                      }
                    }}
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
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validate file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        setErrors(prev => ({
                          ...prev,
                          profileImage: 'Image size should be less than 5MB'
                        }));
                        return;
                      }
                      
                      // Validate file type
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
                        setFormData(prev => ({
                          ...prev,
                          profileImage: reader.result as string
                        }));
                        // Clear any previous errors
                        if (errors.profileImage) {
                          setErrors(prev => ({
                            ...prev,
                            profileImage: ''
                          }));
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended size: 500x500px. Max 5MB. Formats: JPG, PNG, GIF
                </p>
              </div>
            </div>
          </div>
          
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{isEditMode ? 'Save Changes' : 'Register Vendor'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
