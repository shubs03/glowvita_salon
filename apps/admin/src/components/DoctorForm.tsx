"use client";

import { useState, useEffect } from 'react';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Upload, User, Briefcase, MapPin, Eye, EyeOff } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import stateCityData from '@/lib/state-city.json';

export interface Doctor {
  id?: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  registrationNumber: string;
  specialization: string;
  experience: string;
  clinicName: string;
  clinicAddress: string;
  state: string;
  city: string;
  pincode: string;
  status?: 'Approved' | 'Pending' | 'Rejected';
  profileImage?: string;
  qualification?: string;
  registrationYear?: string;
  password?: string;
  confirmPassword?: string;
  physicalConsultationStartTime?: string;
  physicalConsultationEndTime?: string;
  faculty?: string;
  assistantName?: string;
  assistantContact?: string;
  doctorAvailability?: 'Online' | 'Offline';
  landline?: string;
}

interface State {
  state: string;
  districts: string[];
}

const states: State[] = stateCityData.states;
const specializations = [
  'Dermatologist',
  'Cosmetologist',
  'Trichologist',
  'Aesthetic Physician',
  'Plastic Surgeon'
];

interface DoctorFormProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  isEditMode: boolean;
  onSubmit: (data: Omit<Doctor, 'confirmPassword'>) => void;
}

// Initial form data template
const initialFormData = {
  name: '',
  email: '',
  phone: '',
  gender: 'male',
  password: '',
  confirmPassword: '',
  registrationNumber: '',
  specialization: '',
  experience: '',
  physicalConsultationStartTime: '09:00',
  physicalConsultationEndTime: '17:00',
  faculty: '',
  assistantName: '',
  assistantContact: '',
  doctorAvailability: 'Online' as const,
  landline: '',
  clinicName: '',
  clinicAddress: '',
  state: '',
  city: '',
  pincode: ''
};

export function DoctorForm({ isOpen, onClose, doctor, isEditMode, onSubmit }: DoctorFormProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const [selectedState, setSelectedState] = useState(doctor?.state || "");
  const [cities, setCities] = useState<string[]>([]);
  const [formData, setFormData] = useState<Doctor & { 
    password: string; 
    confirmPassword: string;
    physicalConsultationStartTime: string;
    physicalConsultationEndTime: string;
  }>({ ...initialFormData, ...(doctor || {}) });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // State for profile image preview
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    doctor?.profileImage || null
  );

  // Reset form when the dialog is opened for a new doctor
  useEffect(() => {
    if (isOpen && !isEditMode) {
      // Create a complete reset of the form data
      const resetData = {
        ...initialFormData,
        // Keep the password fields empty for new doctor
        password: '',
        confirmPassword: ''
      };
      
      setFormData(resetData);
      setSelectedState('');
      setActiveTab('personal');
      setProfileImagePreview(null);
      setPasswordError('');
      
      // Also clear any file input
      const fileInput = document.getElementById('profileImage') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }, [isOpen, isEditMode]);

  useEffect(() => {
    if (selectedState) {
      const stateData = states.find(s => s.state === selectedState);
      setCities(stateData ? stateData.districts : []);
    } else {
      setCities([]);
    }
  }, [selectedState]);

  const validatePassword = (password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (password.length > 0 && password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target;
    
    // Handle file input separately
    if (type === 'file' && name === 'profileImage') {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0];
      
      if (file) {
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setProfileImagePreview(base64String);
          setFormData(prev => ({
            ...prev,
            profileImage: base64String
          }));
        };
        
        reader.readAsDataURL(file);
      }
      return;
    }
    
    // Handle regular input fields
    const { value } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only validate passwords if this is a new doctor or password fields are not empty
    if (!isEditMode || formData.password || formData.confirmPassword) {
      if (!validatePassword(formData.password, formData.confirmPassword)) {
        return; // Don't submit if validation fails
      }
    }
    
    // Remove confirmPassword before submitting
    const { confirmPassword, ...submitData } = formData;
    
    // Log the form data to console
    console.log('Doctor Form Data:', JSON.stringify(submitData, null, 2));
    
    onSubmit(submitData);
  };

  const renderFileUpload = (label: string, fieldName: string, isReadOnly: boolean) => (
    <div className="space-y-2">
      <Label htmlFor={fieldName}>{label}</Label>
      <div className="flex items-center gap-4">
        <Input 
          id={fieldName} 
          name={fieldName} 
          type="file" 
          disabled={isReadOnly} 
          className="flex-grow" 
          onChange={(e) => {
            if (e.target.files?.[0]) {
              const file = e.target.files[0];
              // Handle file upload logic here
              // For now, just store the file name
              setFormData(prev => ({
                ...prev,
                [fieldName]: file.name
              }));
            }
          }}
        />
        {formData[fieldName as keyof Doctor] && (
          <Button type="button" variant="outline" size="sm" onClick={() => {
            // Handle view file logic
            console.log('View file:', formData[fieldName as keyof Doctor]);
          }}>
            View
          </Button>
        )}
      </div>
    </div>
  );

  const personalInfoContent = (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-base font-medium text-gray-900">Personal Information</h3>
        <p className="mt-1 text-sm text-gray-500">Update doctor's personal details</p>
      </div>
      
      <div className="p-6 pb-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 bg-white">
              {profileImagePreview ? (
                <img 
                  src={profileImagePreview} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-300" />
                </div>
              )}
              <label 
                htmlFor="profileImage" 
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                title="Click to change photo"
              >
                <Upload className="w-5 h-5 text-white" />
              </label>
              <input 
                id="profileImage" 
                name="profileImage" 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleInputChange}
              />
            </div>
            <p className="mt-2 text-xs text-center text-gray-500">
              JPG, PNG, max 5MB
            </p>
          </div>
          
          {/* Personal Details */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Dr. Keshav Pawar"
                  className="h-10 bg-white"
                  required 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="doctor@example.com"
                  className="h-10 bg-white"
                  required 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                  className="h-10 bg-white"
                  required 
                />
              </div>

              {!isEditMode && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter password"
                        className="h-10 bg-white pr-10 w-full"
                        required={!isEditMode}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm password"
                        className="h-10 bg-white pr-10 w-full"
                        required={!isEditMode}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-sm text-red-500">{passwordError}</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5 mb-6">
                <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange('gender', value)}
                >
                  <SelectTrigger className="h-10 bg-white">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5 mb-6">
                <Label htmlFor="qualification" className="text-sm font-medium text-gray-700">
                  Degree
                </Label>
                <Input 
                  id="qualification" 
                  name="qualification" 
                  value={formData.qualification || ''}
                  onChange={handleInputChange}
                  placeholder="MBBS, MD, etc."
                  className="h-10 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const professionalInfoContent = (
    <div>
      {/* Professional Info */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-base font-medium text-gray-900">Professional Information</h3>
          <p className="mt-1 text-sm text-gray-500">Update doctor's professional details</p>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Professional Details */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="registrationNumber" className="text-sm font-medium text-gray-700">
                    Registration Number <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="registrationNumber" 
                    name="registrationNumber" 
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    placeholder="Registration Number"
                    className="h-10 bg-white"
                    required 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="specialization" className="text-sm font-medium text-gray-700">
                    Specialization <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.specialization}
                    onValueChange={(value) => handleSelectChange('specialization', value)}
                  >
                    <SelectTrigger className="h-10 bg-white">
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map(specialization => (
                        <SelectItem key={specialization} value={specialization}>{specialization}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
                    Experience <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="experience" 
                    name="experience" 
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="Years of experience"
                    className="h-10 bg-white"
                    required 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="faculty" className="text-sm font-medium text-gray-700">
                    Faculty
                  </Label>
                  <Input 
                    id="faculty" 
                    name="faculty" 
                    value={formData.faculty || ''}
                    onChange={handleInputChange}
                    placeholder="Faculty name"
                    className="h-10 bg-white"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="physicalConsultationStartTime" className="text-sm font-medium text-gray-700">
                    Physical Consultation Start Time <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="physicalConsultationStartTime"
                    name="physicalConsultationStartTime"
                    type="time"
                    value={formData.physicalConsultationStartTime}
                    onChange={handleInputChange}
                    className="h-10 bg-white"
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="physicalConsultationEndTime" className="text-sm font-medium text-gray-700">
                    Physical Consultation End Time <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="physicalConsultationEndTime"
                    name="physicalConsultationEndTime"
                    type="time"
                    value={formData.physicalConsultationEndTime}
                    onChange={handleInputChange}
                    className="h-10 bg-white"
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 block">
                    Working With Hospital <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex space-x-4 mt-1">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="hospitalYes"
                        name="workingWithHospital"
                        value="yes"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <label htmlFor="hospitalYes" className="ml-2 block text-sm text-gray-700">
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="hospitalNo"
                        name="workingWithHospital"
                        value="no"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        defaultChecked
                      />
                      <label htmlFor="hospitalNo" className="ml-2 block text-sm text-gray-700">
                        No
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 block">
                    Video Call Consultation <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex space-x-4 mt-1">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="videoConsultationYes"
                        name="videoConsultation"
                        value="yes"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <label htmlFor="videoConsultationYes" className="ml-2 block text-sm text-gray-700">
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="videoConsultationNo"
                        name="videoConsultation"
                        value="no"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        defaultChecked
                      />
                      <label htmlFor="videoConsultationNo" className="ml-2 block text-sm text-gray-700">
                        No
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const clinicInfoContent = (
    <div>
      {/* Clinic Info */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-base font-medium text-gray-900">Clinic Information</h3>
          <p className="mt-1 text-sm text-gray-500">Update doctor's clinic details</p>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Clinic Details */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="clinicName" className="text-sm font-medium text-gray-700">
                    Clinic Name <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="clinicName" 
                    name="clinicName" 
                    value={formData.clinicName}
                    onChange={handleInputChange}
                    placeholder="Clinic Name"
                    className="h-10 bg-white"
                    required 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="clinicAddress" className="text-sm font-medium text-gray-700">
                    Clinic Address <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="clinicAddress" 
                    name="clinicAddress" 
                    value={formData.clinicAddress}
                    onChange={handleInputChange}
                    placeholder="Clinic Address"
                    className="h-10 bg-white"
                    required 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.state}
                    onValueChange={(value) => {
                      setSelectedState(value);
                      handleSelectChange('state', value);
                      setFormData(prev => ({ ...prev, city: '' }));
                    }}
                  >
                    <SelectTrigger className="h-10 bg-white">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      {states.map((state) => (
                        <SelectItem key={state.state} value={state.state}>
                          {state.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.city}
                    onValueChange={(value) => handleSelectChange('city', value)}
                    disabled={!formData.state}
                  >
                    <SelectTrigger className="h-10 bg-white">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="pincode" className="text-sm font-medium text-gray-700">
                    Pincode <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="pincode" 
                    name="pincode" 
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Pincode"
                    className="h-10 bg-white"
                    required 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 block">
                    Doctor Availability <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex space-x-4 mt-1">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="availabilityOnline"
                        name="doctorAvailability"
                        value="Online"
                        checked={formData.doctorAvailability === 'Online'}
                        onChange={() => handleSelectChange('doctorAvailability', 'Online')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <label htmlFor="availabilityOnline" className="ml-2 block text-sm text-gray-700">
                        Online
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="availabilityOffline"
                        name="doctorAvailability"
                        value="Offline"
                        checked={formData.doctorAvailability === 'Offline'}
                        onChange={() => handleSelectChange('doctorAvailability', 'Offline')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <label htmlFor="availabilityOffline" className="ml-2 block text-sm text-gray-700">
                        Offline
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="assistantName" className="text-sm font-medium text-gray-700">
                    Assistant Name <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="assistantName" 
                    name="assistantName" 
                    value={formData.assistantName || ''}
                    onChange={handleInputChange}
                    placeholder="Assistant's full name"
                    className="h-10 bg-white"
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="assistantContact" className="text-sm font-medium text-gray-700">
                    Assistant Contact <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="assistantContact" 
                    name="assistantContact" 
                    value={formData.assistantContact || ''}
                    onChange={handleInputChange}
                    placeholder="Assistant's contact number"
                    className="h-10 bg-white"
                    required
                  />
                </div>
              
                <div className="space-y-1.5 mb-6">
                  <Label htmlFor="landline" className="text-sm font-medium text-gray-700">
                    Landline
                  </Label>
                  <Input 
                    id="landline" 
                    name="landline" 
                    value={formData.landline || ''}
                    onChange={handleInputChange}
                    placeholder="Landline number with STD code"
                    className="h-10 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFormContent = () => (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full">
      {/* Tabs Navigation */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex flex-col h-full"
      >
        <div className="px-6 pt-2 border-b sticky top-0 z-20 bg-background">
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger 
              value="personal" 
              className={`flex items-center gap-2 ${activeTab === 'personal' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <User className="h-4 w-4" />
              <span>1. Personal</span>
            </TabsTrigger>
            <TabsTrigger 
              value="professional" 
              className={`flex items-center gap-2 ${activeTab === 'professional' ? 'text-primary' : 'text-muted-foreground'}`}
              disabled={!formData.name || !formData.email || !formData.phone || !formData.gender}
            >
              <Briefcase className="h-4 w-4" />
              <span>2. Professional</span>
            </TabsTrigger>
            <TabsTrigger 
              value="clinic" 
              className={`flex items-center gap-2 ${activeTab === 'clinic' ? 'text-primary' : 'text-muted-foreground'}`}
              disabled={!formData.registrationNumber || !formData.specialization || !formData.experience}
            >
              <MapPin className="h-4 w-4" />
              <span>3. Clinic</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 transition-colors">
          <TabsContent value="personal" className="m-0">
            <div className="space-y-6 pb-8">
              {personalInfoContent}
            </div>
          </TabsContent>
          
          <TabsContent value="professional" className="m-0">
            <div className="space-y-6 pb-8">
              {professionalInfoContent}
            </div>
          </TabsContent>
          
          <TabsContent value="clinic" className="m-0">
            <div className="space-y-6 pb-8">
              {clinicInfoContent}
            </div>
          </TabsContent>
        </div>
        
        {/* Footer Buttons */}
        <div className="flex justify-between items-center p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-10">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          
          <div className="flex items-center gap-3">
            {activeTab !== 'personal' && (
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setActiveTab(activeTab === 'professional' ? 'personal' : 'professional')}
                className="min-w-[100px]"
              >
                Back
              </Button>
            )}
            
            {activeTab !== 'clinic' ? (
              <Button 
                type="button" 
                className="min-w-[100px] bg-primary hover:bg-primary/90"
                onClick={() => {
                  if (activeTab === 'personal') {
                    if (formData.name && formData.email && formData.phone && formData.gender) {
                      setActiveTab('professional');
                    }
                  } else if (activeTab === 'professional') {
                    if (formData.registrationNumber && formData.specialization && formData.experience) {
                      setActiveTab('clinic');
                    }
                  }
                }}
              >
                Next
              </Button>
            ) : (
              <Button 
                type="submit" 
                className="min-w-[150px] bg-primary hover:bg-primary/90"
              >
                {isEditMode ? 'Update Doctor' : 'Add Doctor'}
              </Button>
            )}
          </div>
        </div>
      </Tabs>
    </form>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content 
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-4xl h-[90vh] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-lg border bg-background shadow-lg transition-all duration-200 flex flex-col"
          style={{
            maxHeight: '90vh',
            height: '90vh',
            minHeight: 'min(700px, 90vh)'
          }}
        >
          <div className="flex flex-col space-y-1.5 p-6 pb-3 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-semibold leading-none tracking-tight">
                {isEditMode ? `Edit Doctor: ${doctor?.name}` : 'Add New Doctor'}
              </Dialog.Title>
              <Dialog.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>
            <Dialog.Description className="text-sm text-muted-foreground">
              {isEditMode ? 'Update doctor details below.' : 'Fill in the details to add a new doctor.'}
            </Dialog.Description>
          </div>
          {renderFormContent()}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
