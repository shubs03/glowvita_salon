"use client";

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { Button } from '@repo/ui/button';
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

interface Vendor {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  businessCategory: string;
  businessEmail: string;
  businessDescription: string;
  profileImage?: string;
  website?: string;
  state: string;
  city: string;
  pincode: string;
  address: string;
  subscription?: Subscription;
  gallery?: string[];
  documents?: Document[];
  bankDetails?: BankDetails;
  [key: string]: any; // For dynamic access
}
import { updateVendor } from '@repo/store/slices/vendorSlice';
import stateCityData from '@/lib/state-city.json';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { 
  Trash2, 
  UploadCloud, 
  CheckCircle2, 
  Search, 
  Phone, 
  Calendar, 
  UserCheck, 
  IndianRupee, 
  MessageSquareText, 
  MoreHorizontal, 
  Users, 
  Plus 
} from 'lucide-react';

// Tab Components defined in-file
const PersonalInformationTab = ({ formData, handleInputChange, errors, states, cities, selectedState, setSelectedState, setFormData }) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('File size should not exceed 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: Vendor) => ({
          ...prev,
          profileImage: reader.result as string,
          // Ensure all required fields are maintained
          firstName: prev.firstName || '',
          lastName: prev.lastName || '',
          email: prev.email || '',
          phone: prev.phone || '',
          businessName: prev.businessName || '',
          businessType: prev.businessType || '',
          businessCategory: prev.businessCategory || '',
          businessEmail: prev.businessEmail || '',
          businessDescription: prev.businessDescription || '',
          state: prev.state || '',
          city: prev.city || '',
          pincode: prev.pincode || '',
          address: prev.address || ''
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Personal & Business Information</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Photo Section */}
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
        
        {/* Business Information Section */}
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
              <Label htmlFor="businessType">Business Type <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.businessType || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}
              >
                <SelectTrigger className={errors.businessType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salon">Salon</SelectItem>
                  <SelectItem value="spa">Spa</SelectItem>
                  <SelectItem value="barber">Barber Shop</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.businessType && <p className="text-sm text-red-500 mt-1">{errors.businessType}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessCategory">Business Category <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.businessCategory || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, businessCategory: value }))}
              >
                <SelectTrigger className={errors.businessCategory ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beauty">Beauty & Wellness</SelectItem>
                  <SelectItem value="hair">Hair Care</SelectItem>
                  <SelectItem value="nails">Nails</SelectItem>
                  <SelectItem value="spa">Spa & Massage</SelectItem>
                  <SelectItem value="barber">Barber Services</SelectItem>
                </SelectContent>
              </Select>
              {errors.businessCategory && <p className="text-sm text-red-500 mt-1">{errors.businessCategory}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessEmail">Business Email <span className="text-red-500">*</span></Label>
              <Input 
                id="businessEmail" 
                name="businessEmail" 
                type="email" 
                value={formData.businessEmail || ''} 
                onChange={handleInputChange} 
                className={errors.businessEmail ? 'border-red-500' : ''} 
              />
              {errors.businessEmail && <p className="text-sm text-red-500 mt-1">{errors.businessEmail}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
              <Input 
                id="phone" 
                name="phone" 
                type="tel" 
                value={formData.phone || ''} 
                onChange={handleInputChange} 
                className={errors.phone ? 'border-red-500' : ''} 
              />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
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
            <Label htmlFor="businessDescription">Business Description</Label>
            <Textarea 
              id="businessDescription" 
              name="businessDescription" 
              rows={3}
              value={formData.businessDescription || ''} 
              onChange={handleInputChange} 
              placeholder="Tell us about your business..."
              className={errors.businessDescription ? 'border-red-500' : ''}
            />
            {errors.businessDescription && <p className="text-sm text-red-500 mt-1">{errors.businessDescription}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
            <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} className={errors.firstName ? 'border-red-500' : ''} />
            {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
            <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} className={errors.lastName ? 'border-red-500' : ''} />
            {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="salonName">Salon Name <span className="text-red-500">*</span></Label>
          <Input id="salonName" name="salonName" value={formData.salonName} onChange={handleInputChange} className={errors.salonName ? 'border-red-500' : ''} />
          {errors.salonName && <p className="text-sm text-red-500 mt-1">{errors.salonName}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className={errors.email ? 'border-red-500' : ''} />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number <span className="text-red-500">*</span></Label>
            <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className={errors.phone ? 'border-red-500' : ''} />
            {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
          </div>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
          <Select value={formData.state} onValueChange={(value) => { setSelectedState(value); setFormData(prev => ({ ...prev, state: value, city: '' })); }}>
            <SelectTrigger className={errors.state ? 'border-red-500' : ''}><SelectValue placeholder="Select state" /></SelectTrigger>
            <SelectContent className="max-h-48 overflow-y-auto">
              {states.map((state) => (<SelectItem key={state.state} value={state.state}>{state.state}</SelectItem>))}
            </SelectContent>
          </Select>
          {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
          <Select value={formData.city} onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))} disabled={!selectedState}>
            <SelectTrigger className={errors.city ? 'border-red-500' : ''}><SelectValue placeholder="Select city" /></SelectTrigger>
            <SelectContent className="max-h-48 overflow-y-auto">
              {cities.length > 0 ? (cities.map((city) => (<SelectItem key={city} value={city}>{city}</SelectItem>))) : (<SelectItem value="-" disabled>Select a state first</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode <span className="text-red-500">*</span></Label>
          <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} className={errors.pincode ? 'border-red-500' : ''} />
          {errors.pincode && <p className="text-sm text-red-500 mt-1">{errors.pincode}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Complete Address <span className="text-red-500">*</span></Label>
        <Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter complete salon address" className={errors.address ? 'border-red-500' : ''} />
        {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
      </div>
    </CardContent>
  </Card>
  );
};

const SubscriptionTab = ({ vendor, formData, handleInputChange, errors }) => {
  // Set default values if not present
  const subscription = formData.subscription || {
    startDate: '',
    endDate: '',
    package: '',
    isActive: false
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subscriptionPackage">Package <span className="text-red-500">*</span></Label>
            <Select 
              value={subscription.package}
              onValueChange={(value) => handleInputChange({
                target: {
                  name: 'subscription.package',
                  value
                }
              })}
            >
              <SelectTrigger className={errors?.subscription?.package ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a package" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            {errors?.subscription?.package && (
              <p className="text-sm text-red-500 mt-1">{errors.subscription.package}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="statusActive"
                  name="subscription.isActive"
                  checked={subscription.isActive === true}
                  onChange={() => handleInputChange({
                    target: {
                      name: 'subscription.isActive',
                      value: true
                    }
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <Label htmlFor="statusActive" className="font-normal">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="statusInactive"
                  name="subscription.isActive"
                  checked={subscription.isActive === false}
                  onChange={() => handleInputChange({
                    target: {
                      name: 'subscription.isActive',
                      value: false
                    }
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <Label htmlFor="statusInactive" className="font-normal">Inactive</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
            <Input
              id="startDate"
              type="date"
              name="subscription.startDate"
              value={subscription.startDate || ''}
              onChange={handleInputChange}
              className={errors?.subscription?.startDate ? 'border-red-500' : ''}
            />
            {errors?.subscription?.startDate && (
              <p className="text-sm text-red-500 mt-1">{errors.subscription.startDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date <span className="text-red-500">*</span></Label>
            <Input
              id="endDate"
              type="date"
              name="subscription.endDate"
              value={subscription.endDate || ''}
              onChange={handleInputChange}
              className={errors?.subscription?.endDate ? 'border-red-500' : ''}
              min={subscription.startDate || undefined}
            />
            {errors?.subscription?.endDate && (
              <p className="text-sm text-red-500 mt-1">{errors.subscription.endDate}</p>
            )}
          </div>
        </div>

        {subscription.startDate && subscription.endDate && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-700">Subscription Summary</h4>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>Package: <span className="font-medium">{subscription.package || 'Not selected'}</span></div>
              <div>Status: 
                <span className={`font-medium ${subscription.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                  {subscription.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>Start Date: <span className="font-medium">{subscription.startDate}</span></div>
              <div>End Date: <span className="font-medium">{subscription.endDate}</span></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const GalleryTab = ({ vendor, formData, handleInputChange, errors }) => {
  // Initialize gallery with empty array if not present
  const gallery = formData.gallery || [];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter for image files and limit to 10 images
    const imageFiles = files
      .filter(file => file.type.startsWith('image/'))
      .slice(0, 10 - gallery.length); // Limit to 10 images max

    if (imageFiles.length === 0) {
      alert('Please upload valid image files (JPEG, PNG, GIF)');
      return;
    }

    // Process each image file
    const newImages: string[] = [];
    let processed = 0;

    imageFiles.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit per image
        alert(`Image ${file.name} exceeds 5MB limit and was not uploaded`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        processed++;
        if (reader.result) {
          newImages.push(reader.result as string);
        }
        
        // Update form data after all images are processed
        if (processed === imageFiles.length && newImages.length > 0) {
          handleInputChange({
            target: {
              name: 'gallery',
              value: [...gallery, ...newImages]
            }
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const updatedGallery = [...gallery];
    updatedGallery.splice(index, 1);
    handleInputChange({
      target: {
        name: 'gallery',
        value: updatedGallery
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salon Gallery</CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload up to 10 images (5MB max per image)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="gallery-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF (MAX. 5MB per image)
              </p>
            </div>
            <input
              id="gallery-upload"
              type="file"
              className="hidden"
              multiple
              accept="image/png, image/jpeg, image/gif"
              onChange={handleImageUpload}
              disabled={gallery.length >= 10}
            />
          </label>
        </div>

        {errors?.gallery && (
          <p className="text-sm text-red-500">{errors.gallery}</p>
        )}

        {gallery.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {gallery.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square overflow-hidden rounded-lg border">
                  <img
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No images uploaded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const BankDetailsTab = ({ vendor, formData, handleInputChange, errors }) => {
  // Initialize bank details with default values
  const bankDetails = formData.bankDetails || {
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    branchName: '',
    ifscCode: '',
    accountType: 'savings',
    upiId: ''
  };

  const accountTypes = [
    { value: 'savings', label: 'Savings Account' },
    { value: 'current', label: 'Current Account' },
    { value: 'salary', label: 'Salary Account' },
    { value: 'nre', label: 'NRE Account' },
    { value: 'nro', label: 'NRO Account' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Account Details</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add your business bank account details for payouts
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accountHolderName">Account Holder Name <span className="text-red-500">*</span></Label>
            <Input
              id="accountHolderName"
              name="bankDetails.accountHolderName"
              value={bankDetails.accountHolderName}
              onChange={handleInputChange}
              placeholder="Enter account holder name"
              className={errors?.bankDetails?.accountHolderName ? 'border-red-500' : ''}
            />
            {errors?.bankDetails?.accountHolderName && (
              <p className="text-sm text-red-500 mt-1">{errors.bankDetails.accountHolderName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number <span className="text-red-500">*</span></Label>
            <Input
              id="accountNumber"
              name="bankDetails.accountNumber"
              value={bankDetails.accountNumber}
              onChange={handleInputChange}
              placeholder="Enter account number"
              className={errors?.bankDetails?.accountNumber ? 'border-red-500' : ''}
            />
            {errors?.bankDetails?.accountNumber && (
              <p className="text-sm text-red-500 mt-1">{errors.bankDetails.accountNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name <span className="text-red-500">*</span></Label>
            <Input
              id="bankName"
              name="bankDetails.bankName"
              value={bankDetails.bankName}
              onChange={handleInputChange}
              placeholder="Enter bank name"
              className={errors?.bankDetails?.bankName ? 'border-red-500' : ''}
            />
            {errors?.bankDetails?.bankName && (
              <p className="text-sm text-red-500 mt-1">{errors.bankDetails.bankName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="branchName">Branch Name <span className="text-red-500">*</span></Label>
            <Input
              id="branchName"
              name="bankDetails.branchName"
              value={bankDetails.branchName}
              onChange={handleInputChange}
              placeholder="Enter branch name"
              className={errors?.bankDetails?.branchName ? 'border-red-500' : ''}
            />
            {errors?.bankDetails?.branchName && (
              <p className="text-sm text-red-500 mt-1">{errors.bankDetails.branchName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ifscCode">IFSC Code <span className="text-red-500">*</span></Label>
            <Input
              id="ifscCode"
              name="bankDetails.ifscCode"
              value={bankDetails.ifscCode}
              onChange={handleInputChange}
              placeholder="Enter IFSC code"
              className={errors?.bankDetails?.ifscCode ? 'border-red-500' : ''}
              style={{ textTransform: 'uppercase' }}
            />
            {errors?.bankDetails?.ifscCode && (
              <p className="text-sm text-red-500 mt-1">{errors.bankDetails.ifscCode}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type <span className="text-red-500">*</span></Label>
            <Select
              value={bankDetails.accountType}
              onValueChange={(value) => handleInputChange({
                target: {
                  name: 'bankDetails.accountType',
                  value
                }
              })}
            >
              <SelectTrigger className={errors?.bankDetails?.accountType ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.bankDetails?.accountType && (
              <p className="text-sm text-red-500 mt-1">{errors.bankDetails.accountType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              name="bankDetails.upiId"
              value={bankDetails.upiId || ''}
              onChange={handleInputChange}
              placeholder="Enter UPI ID (optional)"
              className={errors?.bankDetails?.upiId ? 'border-red-500' : ''}
            />
            <p className="text-xs text-muted-foreground">Example: yourname@upi</p>
            {errors?.bankDetails?.upiId && (
              <p className="text-sm text-red-500 mt-1">{errors.bankDetails.upiId}</p>
            )}
          </div>
        </div>

        {/* Preview Section */}
        {(bankDetails.accountNumber || bankDetails.accountHolderName) && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md border">
            <h4 className="font-medium text-gray-700 mb-3">Bank Details Preview</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Account Holder</p>
                <p className="font-medium">{bankDetails.accountHolderName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-500">Account Number</p>
                <p className="font-mono">
                  {bankDetails.accountNumber ? `••••${bankDetails.accountNumber.slice(-4)}` : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Bank & Branch</p>
                <p className="font-medium">
                  {bankDetails.bankName || 'Not provided'}
                  {bankDetails.branchName && `, ${bankDetails.branchName}`}
                </p>
              </div>
              <div>
                <p className="text-gray-500">IFSC Code</p>
                <p className="font-mono">{bankDetails.ifscCode || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-500">Account Type</p>
                <p className="capitalize">
                  {bankDetails.accountType ? 
                    accountTypes.find(t => t.value === bankDetails.accountType)?.label || 
                    bankDetails.accountType : 'Not provided'}
                </p>
              </div>
              {bankDetails.upiId && (
                <div>
                  <p className="text-gray-500">UPI ID</p>
                  <p>{bankDetails.upiId}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface Document {
  id: string;
  name: string;
  type: 'aadhar' | 'pan' | 'gst' | 'license' | 'other';
  file: string; // base64 or URL
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

const documentTypes = [
  { value: 'aadhar', label: 'Aadhar Card' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'gst', label: 'GST Certificate' },
  { value: 'license', label: 'Business License' },
  { value: 'other', label: 'Other Document' },
];

const DocumentsTab = ({ vendor, formData, handleInputChange, errors }) => {
  const [documents, setDocuments] = useState<Document[]>(formData.documents || []);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [documentNotes, setDocumentNotes] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should not exceed 5MB');
      return;
    }

    // Check file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Only PDF, JPEG, and PNG files are allowed');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: selectedDocType as any || 'other',
        file: reader.result as string,
        uploadDate: new Date().toISOString(),
        status: 'pending',
        notes: documentNotes
      };
      
      const updatedDocs = [...documents, newDoc];
      setDocuments(updatedDocs);
      handleInputChange({
        target: {
          name: 'documents',
          value: updatedDocs
        }
      });
      
      // Reset form
      setSelectedDocType('');
      setDocumentNotes('');
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const removeDocument = (id: string) => {
    const updatedDocs = documents.filter(doc => doc.id !== id);
    setDocuments(updatedDocs);
    handleInputChange({
      target: {
        name: 'documents',
        value: updatedDocs
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getDocumentIcon = (type: string) => {
    const icons = {
      aadhar: '📝',
      pan: '💳',
      gst: '🏢',
      license: '📜',
      other: '📄'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Documents</CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload and manage your business documents for verification
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <UploadCloud className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h4 className="font-medium">Upload Documents</h4>
              <p className="text-sm text-gray-500">
                Upload your business documents for verification (PDF, JPG, PNG up to 5MB)
              </p>
            </div>
            
            <div className="w-full max-w-md space-y-4">
              <Select 
                value={selectedDocType}
                onValueChange={setSelectedDocType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Textarea
                placeholder="Add notes (optional)"
                value={documentNotes}
                onChange={(e) => setDocumentNotes(e.target.value)}
                className="text-sm"
                rows={2}
              />
              
              <label className="flex flex-col items-center px-4 py-2 bg-white text-blue-600 rounded-md border border-blue-200 cursor-pointer hover:bg-blue-50">
                <span className="text-sm font-medium">Choose File</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  disabled={!selectedDocType || isUploading}
                />
              </label>
              <p className="text-xs text-gray-500">
                {isUploading ? 'Uploading...' : 'Select a file to upload'}
              </p>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div>
          <h4 className="font-medium mb-4">Uploaded Documents</h4>
          {documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-lg">{getDocumentIcon(doc.type)}</span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {documentTypes.find(t => t.value === doc.type)?.label || 'Document'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(doc.status)}
                    <a 
                      href={doc.file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </a>
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No documents uploaded yet</p>
              <p className="text-sm mt-1">Upload your first document using the form above</p>
            </div>
          )}
        </div>

        {/* Required Documents List */}
        <div className="mt-8">
          <h4 className="font-medium mb-3">Required Documents</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Aadhar Card</span>
              </div>
              <span className="text-gray-500">
                {documents.some(d => d.type === 'aadhar') ? 'Uploaded' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>PAN Card</span>
              </div>
              <span className="text-gray-500">
                {documents.some(d => d.type === 'pan') ? 'Uploaded' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>GST Certificate</span>
              </div>
              <span className="text-gray-500">
                {documents.some(d => d.type === 'gst') ? 'Uploaded' : 'Required'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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

interface ClientsTabProps {
  vendor: Vendor;
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const ClientsTab = ({ vendor, formData = {} }: ClientsTabProps) => {
  const clients: Client[] = formData?.clients || [];

  if (clients.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Clients</CardTitle></CardHeader>
        <CardContent className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
          <p className="mt-1 text-sm text-gray-500">This vendor has no clients yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Visit
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Visits
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Spent
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {client.phone}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(client.lastVisit).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {client.totalVisits}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ₹{client.totalSpent.toLocaleString('en-IN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface VendorEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
}

export function VendorEditForm({ isOpen, onClose, vendor }: VendorEditFormProps) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<Vendor>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    businessCategory: '',
    businessEmail: '',
    businessDescription: '',
    profileImage: '',
    website: '',
    state: '',
    city: '',
    pincode: '',
    address: '',
    subscription: {
      startDate: '',
      endDate: '',
      package: '',
      isActive: false
    },
    gallery: [],
    ...(vendor || {})
  });
  const [errors, setErrors] = useState<Partial<Vendor>>({});
  const [selectedState, setSelectedState] = useState<string>('');

  useEffect(() => {
    if (vendor) {
      setFormData({
        firstName: vendor.firstName || '',
        lastName: vendor.lastName || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        businessName: vendor.businessName || '',
        businessType: vendor.businessType || '',
        businessCategory: vendor.businessCategory || '',
        businessEmail: vendor.businessEmail || '',
        businessDescription: vendor.businessDescription || '',
        profileImage: vendor.profileImage || '',
        website: vendor.website || '',
        state: vendor.state || '',
        city: vendor.city || '',
        pincode: vendor.pincode || '',
        address: vendor.address || '',
        subscription: vendor.subscription || {
          startDate: '',
          endDate: '',
          package: '',
          isActive: false
        },
        gallery: vendor.gallery || []
      });
      setSelectedState(vendor.state || '');
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        businessName: '',
        businessType: '',
        businessCategory: '',
        businessEmail: '',
        businessDescription: '',
        profileImage: '',
        website: '',
        state: '',
        city: '',
        pincode: '',
        address: '',
        subscription: {
          startDate: '',
          endDate: '',
          package: '',
          isActive: false
        },
        gallery: []
      });
      setSelectedState('');
    }
  }, [vendor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const validateForm = () => {
    if (!formData) return false;
    const newErrors: Partial<Vendor> = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required.';
    if (!formData.lastName) newErrors.lastName = 'Last name is required.';
    if (!formData.salonName) newErrors.salonName = 'Salon name is required.';
    // Add other validations as needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && formData) {
      dispatch(updateVendor(formData));
      onClose();
    }
  };

  if (!vendor || !formData) return null;

  const states = stateCityData.states;
  const cities = states.find(s => s.state === selectedState)?.districts || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Vendor: {vendor.businessName}</DialogTitle>
            <DialogDescription>
              Update vendor details across the various sections below.
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
                errors={errors}
                states={states}
                cities={cities}
                selectedState={selectedState}
                setSelectedState={setSelectedState}
                setFormData={setFormData}
              />
            </TabsContent>
            <TabsContent value="subscription" className="mt-4">
              <SubscriptionTab 
                vendor={vendor} 
                formData={formData} 
                handleInputChange={handleInputChange} 
                errors={errors}
              />
            </TabsContent>
            <TabsContent value="gallery" className="mt-4">
              <GalleryTab 
                vendor={vendor} 
                formData={formData} 
                handleInputChange={handleInputChange} 
                errors={errors}
              />
            </TabsContent>
            <TabsContent value="bank" className="mt-4">
              <BankDetailsTab 
                vendor={vendor} 
                formData={formData} 
                handleInputChange={handleInputChange} 
                errors={errors}
              />
            </TabsContent>
            <TabsContent value="documents" className="mt-4">
              <DocumentsTab 
                vendor={vendor} 
                formData={formData} 
                handleInputChange={handleInputChange} 
                errors={errors}
              />
            </TabsContent>
            <TabsContent value="clients" className="mt-4">
              <ClientsTab vendor={vendor} />
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
