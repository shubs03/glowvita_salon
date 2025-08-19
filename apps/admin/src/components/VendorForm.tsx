"use client";

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Image as ImageIcon, X, Upload } from 'lucide-react';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { Checkbox } from "@repo/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from "@repo/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import stateCityData from '@/lib/state-city.json';

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
}

interface State {
  state: string;
  districts: string[];
}

const states: State[] = stateCityData.states;

export function VendorForm({ isOpen, onClose, vendor, isEditMode = false, onSubmit }: VendorFormProps) {
  const [selectedState, setSelectedState] = useState(vendor?.state || "");
  const [cities, setCities] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const handleCheckboxChange = (field: 'subCategories', id: SubCategory, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? Array.from(new Set([...prev[field], id]))
        : prev[field].filter((item: SubCategory) => item !== id)
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

    // Password validation (only if password is being set or changed)
    if (!isEditMode && (formData.password || formData.confirmPassword)) {
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
      category: formData.salonCategory as SalonCategory,
      subCategories: formData.subCategories,
      profileImage: formData.profileImage,
      description: formData.address,
      password: !isEditMode && formData.password ? formData.password : undefined,
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
                    onChange={(e) => {
                      handleInputChange(e);
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: '' }));
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
                <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (errors.confirmPassword) {
                        setErrors(prev => ({ ...prev, confirmPassword: '' }));
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
                    onCheckedChange={(checked) => {
                      handleCheckboxChange('subCategories', subCat.id, checked as boolean);
                      if (errors.subCategories) {
                        setErrors(prev => ({ ...prev, subCategories: '' }));
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
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Complete Address <span className="text-red-500">*</span></Label>
            <Textarea 
              id="address" 
              name="address"
              value={formData.address}
              onChange={(e) => {
                handleInputChange(e);
                if (errors.address) {
                  setErrors(prev => ({ ...prev, address: '' }));
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
                      if (errors.profileImage) {
                        setErrors(prev => ({ ...prev, profileImage: '' }));
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
                      if (errors.profileImage) {
                        setErrors(prev => ({ ...prev, profileImage: '' }));
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
                  onChange={handleImageUpload}
                />
                <p className="text-xs text-muted-foreground mt-1">
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
  );
}