
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Upload, User, Briefcase, MapPin, Eye, EyeOff, Check, ChevronsUpDown, Map as MapIcon } from 'lucide-react';
import { Checkbox } from "@repo/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { useGetSuperDataQuery } from "@repo/store/api";
import { toast } from "sonner";
import { cn } from "@repo/ui/cn";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NEXT_PUBLIC_MAPBOX_API_KEY } from '../../../../packages/config/config';

// Mapbox Access Token
if (NEXT_PUBLIC_MAPBOX_API_KEY) {
  mapboxgl.accessToken = NEXT_PUBLIC_MAPBOX_API_KEY;
}

export interface Doctor {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  registrationNumber: string;
  doctorType: string;
  specialties: string[];
  diseases: string[];
  experience: string;
  clinicName: string;
  clinicAddress: string;
  state: string;
  city: string;
  pincode: string;
  location?: { lat: number, lng: number } | null;
  status?: 'Approved' | 'Pending' | 'Rejected';
  profileImage?: string;
  qualification?: string;
  registrationYear?: string;
  password?: string;
  confirmPassword?: string;
  physicalConsultationStartTime: string;
  physicalConsultationEndTime: string;
  faculty?: string;
  assistantName: string;
  assistantContact: string;
  doctorAvailability: 'Online' | 'Offline';
  createdAt?: string;
  updatedAt?: string;
  landline?: string;
  workingWithHospital?: boolean;
  videoConsultation?: boolean;
}

interface DoctorFormProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  isEditMode: boolean;
  onSubmit: (data: Omit<Doctor, 'confirmPassword'>) => void;
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

interface SuperDataItem {
  _id: string;
  name: string;
  type: string;
  doctorType?: string;
  parentId?: string;
}


// Initial form data template
const initialFormData: Doctor & { password: string; confirmPassword: string } = {
  name: '',
  email: '',
  phone: '',
  gender: 'male',
  password: '',
  confirmPassword: '',
  registrationNumber: '',
  doctorType: '',
  specialties: [],
  diseases: [],
  experience: '',
  physicalConsultationStartTime: '09:00',
  physicalConsultationEndTime: '17:00',
  faculty: '',
  assistantName: '',
  assistantContact: '',
  doctorAvailability: 'Online',
  landline: '',
  clinicName: '',
  clinicAddress: '',
  state: '',
  city: '',
  pincode: '',
  location: null,
  workingWithHospital: false,
  videoConsultation: false,
};

export function DoctorForm({ isOpen, onClose, doctor, isEditMode, onSubmit }: DoctorFormProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState<Doctor & { password: string; confirmPassword: string }>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);


  const { data: superData = [], isLoading: isSuperDataLoading } = useGetSuperDataQuery(undefined);
  
  const doctorTypes = useMemo(() => ['Physician', 'Surgeon'], []);
  const allSpecialties: SuperDataItem[] = useMemo(() => superData.filter((d: SuperDataItem) => d.type === 'specialization'), [superData]);
  const allDiseases: SuperDataItem[] = useMemo(() => superData.filter((d: SuperDataItem) => d.type === 'disease'), [superData]);
  
  const filteredSpecialties = useMemo(() => {
    return formData.doctorType ? allSpecialties.filter((s: SuperDataItem) => s.doctorType === formData.doctorType) : [];
  }, [allSpecialties, formData.doctorType]);

  const filteredDiseases = useMemo(() => {
    const diseaseMap = new Map<string, SuperDataItem[]>();
    if (formData.specialties.length > 0) {
      const selectedSpecialtyIds = formData.specialties;
      
      allDiseases.forEach((disease: SuperDataItem) => {
        if (disease.parentId && selectedSpecialtyIds.includes(disease.parentId)) {
          const specialty = allSpecialties.find((s: SuperDataItem) => s._id === disease.parentId);
          if (specialty) {
            if (!diseaseMap.has(specialty.name)) {
              diseaseMap.set(specialty.name, []);
            }
            diseaseMap.get(specialty.name)?.push(disease);
          }
        }
      });
    }
    return Array.from(diseaseMap.entries());
  }, [allDiseases, allSpecialties, formData.specialties]);

  // Update formData and profileImagePreview when doctor prop changes in edit mode
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && doctor) {
        // When editing, map names back to IDs for specialties and diseases
        const specialtyIds = doctor.specialties
          .map(name => allSpecialties.find((s: SuperDataItem) => s.name === name)?._id)
          .filter(Boolean) as string[];

        const diseaseIds = doctor.diseases
          .map(name => allDiseases.find((d: SuperDataItem) => d.name === name)?._id)
          .filter(Boolean) as string[];

        setFormData({
          ...initialFormData,
          ...doctor,
          specialties: specialtyIds,
          diseases: diseaseIds,
          password: '',
          confirmPassword: '',
          profileImage: doctor.profileImage || '',
          qualification: doctor.qualification || '',
          registrationYear: doctor.registrationYear || '',
          faculty: doctor.faculty || '',
          landline: doctor.landline || '',
          assistantName: doctor.assistantName || '',
          assistantContact: doctor.assistantContact || '',
          workingWithHospital: doctor.workingWithHospital || false,
          videoConsultation: doctor.videoConsultation || false,
        });
        setProfileImagePreview(doctor.profileImage || null);
      } else {
        setFormData(initialFormData);
        setProfileImagePreview(null);
      }
      setActiveTab('personal');
      setPasswordError('');
    }
  }, [isOpen, isEditMode, doctor, allSpecialties, allDiseases]);


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

    const { value } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSpecialtyChange = (specId: string) => {
    setFormData(prev => {
      const newSpecialties = prev.specialties.includes(specId)
        ? prev.specialties.filter(id => id !== specId)
        : [...prev.specialties, specId];
      
      const validDiseases = prev.diseases.filter(diseaseId => {
        const disease = allDiseases.find((d: SuperDataItem) => d._id === diseaseId);
        return disease?.parentId && newSpecialties.includes(disease.parentId);
      });
      return { ...prev, specialties: newSpecialties, diseases: validDiseases };
    });
  };

  const handleDiseaseChange = (diseaseId: string) => {
    setFormData(prev => ({
      ...prev,
      diseases: prev.diseases.includes(diseaseId)
        ? prev.diseases.filter(id => id !== diseaseId)
        : [...prev.diseases, diseaseId],
    }));
  };

  const handleRadioChange = (name: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
     if (name === 'doctorType') {
      setFormData(prev => ({ ...prev, specialties: [], diseases: [] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditMode || formData.password || formData.confirmPassword) {
      if (!validatePassword(formData.password, formData.confirmPassword)) {
        return;
      }
    }

    const { confirmPassword, ...submitData } = formData;
    
    // Map specialty and disease IDs to names before submission
    const specialtyNames = submitData.specialties.map(id => {
      const spec = allSpecialties.find((s: SuperDataItem) => s._id === id);
      return spec ? spec.name : id;
    });

    const diseaseNames = submitData.diseases.map(id => {
      const disease = allDiseases.find((d: SuperDataItem) => d._id === id);
      return disease ? disease.name : id;
    });

    onSubmit({ ...submitData, specialties: specialtyNames, diseases: diseaseNames });
  };

  // Map functionality
  useEffect(() => {
    if (!isMapOpen || !NEXT_PUBLIC_MAPBOX_API_KEY) return;
    const initMap = () => {
      if (!mapContainer.current) return;
      if (map.current) map.current.remove();

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: formData.location ? [formData.location.lng, formData.location.lat] : [77.4126, 23.2599],
        zoom: formData.location ? 14 : 4,
      });

      if (marker.current) marker.current.remove();
      
      marker.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat(formData.location ? [formData.location.lng, formData.location.lat] : [77.4126, 23.2599])
        .addTo(map.current);

      marker.current.on('dragend', () => {
        const lngLat = marker.current!.getLngLat();
        setFormData(prev => ({ ...prev, location: { lat: lngLat.lat, lng: lngLat.lng } }));
        fetchAddress([lngLat.lng, lngLat.lat]);
      });

      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        setFormData(prev => ({ ...prev, location: { lat, lng } }));
        marker.current!.setLngLat([lng, lat]);
        fetchAddress([lng, lat]);
      });
    };
    
    const timer = setTimeout(initMap, 100);
    return () => clearTimeout(timer);
  }, [isMapOpen]);

  // Resize map when modal is fully opened
  useEffect(() => {
    if (isMapOpen && map.current) {
      setTimeout(() => {
        if(map.current) {
            map.current.resize();
        }
      }, 300);
    }
  }, [isMapOpen]);

  const handleSearch = async (query: string) => {
    if (!query.trim() || !NEXT_PUBLIC_MAPBOX_API_KEY) return;
    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${NEXT_PUBLIC_MAPBOX_API_KEY}&country=IN`);
      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      toast.error("Failed to search location.");
    }
  };

  const fetchAddress = async (coordinates: [number, number]) => {
    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${NEXT_PUBLIC_MAPBOX_API_KEY}`);
      const data = await response.json();
      if (data.features.length > 0) {
        const feature = data.features[0];
        setFormData(prev => ({
          ...prev,
          clinicAddress: feature.place_name,
          city: feature.context?.find((c: MapboxFeature["context"] extends (infer U)[] | undefined ? U : never) => c.id.startsWith('place'))?.text || '',
          state: feature.context?.find((c: MapboxFeature["context"] extends (infer U)[] | undefined ? U : never) => c.id.startsWith('region'))?.text || '',
          pincode: feature.context?.find((c: MapboxFeature["context"] extends (infer U)[] | undefined ? U : never) => c.id.startsWith('postcode'))?.text || '',
        }));
      }
    } catch (error) {
      toast.error("Failed to fetch address.");
    }
  };

  const handleSearchResultSelect = (result: MapboxFeature) => {
    const coordinates: [number, number] = result.geometry.coordinates;
    setFormData(prev => ({
      ...prev,
      location: { lat: coordinates[1], lng: coordinates[0] },
      clinicAddress: result.place_name,
      city: result.context?.find((c: MapboxFeature["context"] extends (infer U)[] | undefined ? U : never) => c.id.startsWith('place'))?.text || '',
      state: result.context?.find((c: MapboxFeature["context"] extends (infer U)[] | undefined ? U : never) => c.id.startsWith('region'))?.text || '',
      pincode: result.context?.find((c: MapboxFeature["context"] extends (infer U)[] | undefined ? U : never) => c.id.startsWith('postcode'))?.text || '',
    }));
    map.current?.flyTo({ center: coordinates, zoom: 14 });
    marker.current?.setLngLat(coordinates);
    setSearchResults([]);
    setSearchQuery('');
  };

  const renderFormContent = () => (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
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
              disabled={!formData.registrationNumber || formData.specialties.length === 0 || !formData.experience}
            >
              <MapPin className="h-4 w-4" />
              <span>3. Clinic</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 transition-colors">
          <TabsContent value="personal" className="m-0">
             <div className="space-y-6 pb-8">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-base font-medium text-gray-900">Personal Information</h3>
                  <p className="mt-1 text-sm text-gray-500">Update doctor's personal details</p>
                </div>
                <div className="p-6 pb-4">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex flex-col items-center">
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 bg-white">
                        {profileImagePreview ? (
                          <img src={profileImagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
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
                      <p className="mt-2 text-xs text-center text-gray-500">JPG, PNG, max 5MB</p>
                    </div>
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
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                            </div>
                          </div>
                        )}
                        <div className="space-y-1.5 mb-6">
                          <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                            Gender <span className="text-red-500">*</span>
                          </Label>
                          <Select value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
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
            </div>
          </TabsContent>
          <TabsContent value="professional" className="m-0">
             <div className="space-y-6 pb-8">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-base font-medium text-gray-900">Professional Information</h3>
                  <p className="mt-1 text-sm text-gray-500">Update doctor's professional details</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <Label>Doctor Type <span className="text-red-500">*</span></Label>
                        <Select onValueChange={(value) => handleSelectChange('doctorType', value)} value={formData.doctorType}>
                            <SelectTrigger><SelectValue placeholder="Select doctor type" /></SelectTrigger>
                            <SelectContent>
                                {doctorTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.doctorType && (
                    <div className="space-y-2">
                      <Label>Specialties <span className="text-red-500">*</span></Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border p-3 rounded-md max-h-48 overflow-y-auto">
                        {isSuperDataLoading ? <p>Loading...</p> : (
                          filteredSpecialties.map((spec: SuperDataItem) => (
                            <div key={spec._id} className="flex items-center space-x-2">
                              <Checkbox
                                id={spec._id}
                                checked={formData.specialties.includes(spec._id)}
                                onCheckedChange={() => handleSpecialtyChange(spec._id)}
                              />
                              <Label htmlFor={spec._id} className="text-sm font-normal">{spec.name}</Label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    )}
                    
                    {filteredDiseases.length > 0 && (
                      <div className="space-y-2">
                        <Label>Diseases/Conditions</Label>
                        <div className="space-y-3">
                          {filteredDiseases.map(([specialtyName, diseases]) => (
                            <div key={specialtyName}>
                              <h4 className="font-semibold text-sm mb-2">{specialtyName}</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border p-3 rounded-md">
                                {diseases.map((disease: SuperDataItem) => (
                                  <div key={disease._id} className="flex items-center space-x-2">
                                    <Checkbox id={disease._id} checked={formData.diseases.includes(disease._id)} onCheckedChange={() => handleDiseaseChange(disease._id)} />
                                    <Label htmlFor={disease._id} className="text-sm font-normal">{disease.name}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
                                    checked={formData.workingWithHospital === true}
                                    onChange={() => handleRadioChange('workingWithHospital', true)}
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
                                    checked={formData.workingWithHospital === false}
                                    onChange={() => handleRadioChange('workingWithHospital', false)}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
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
                                    checked={formData.videoConsultation === true}
                                    onChange={() => handleRadioChange('videoConsultation', true)}
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
                                    checked={formData.videoConsultation === false}
                                    onChange={() => handleRadioChange('videoConsultation', false)}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
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
          </TabsContent>
          <TabsContent value="clinic" className="m-0">
             <div className="space-y-6 pb-8">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-base font-medium text-gray-900">Clinic Information</h3>
                  <p className="mt-1 text-sm text-gray-500">Update doctor's clinic details</p>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-8">
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
                          <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                          <Button type="button" variant="outline" onClick={() => setIsMapOpen(true)} className="w-full h-10 justify-start text-left font-normal">
                              <MapPin className="mr-2 h-4 w-4" />
                              {formData.location ? `${formData.location.lat.toFixed(4)}, ${formData.location.lng.toFixed(4)}` : "Choose on Map"}
                          </Button>
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
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
                          <Input
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="State"
                            className="h-10 bg-white"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                            City <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="City"
                            className="h-10 bg-white"
                            required
                          />
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
          </TabsContent>
        </div>
        <div className="flex justify-between items-center p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-10">
          <Button type="button" variant="outline" onClick={onClose} className="min-w-[100px]">
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
                    if (formData.registrationNumber && formData.specialties.length > 0 && formData.experience) {
                      setActiveTab('clinic');
                    }
                  }
                }}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" className="min-w-[150px] bg-primary hover:bg-primary/90">
                {isEditMode ? 'Update Doctor' : 'Add Doctor'}
              </Button>
            )}
          </div>
        </div>
      </Tabs>
      <Dialog.Root open={isMapOpen} onOpenChange={setIsMapOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-4xl max-h-[80vh] translate-x-[-50%] translate-y-[-50%] bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg border">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">Select Clinic Location</Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">Search, pan, or click on the map to set the exact location.</Dialog.Description>
              </div>
              <div className="space-y-4 h-[60vh] flex flex-col">
                  <div className="relative">
                      <Input
                          placeholder="Search for a location..."
                          value={searchQuery}
                          onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
                      />
                      {searchResults.length > 0 && (
                          <div className="absolute z-10 w-full bg-background border rounded-md mt-1 max-h-48 overflow-y-auto">
                              {searchResults.map((result: MapboxFeature) => (
                                  <div key={result.id} onClick={() => handleSearchResultSelect(result)} className="p-2 hover:bg-secondary cursor-pointer text-sm">
                                      {result.place_name}
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
                  <div ref={mapContainer} className="flex-grow w-full rounded-md border" />
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                  <Button variant="outline" onClick={() => setIsMapOpen(false)}>Cancel</Button>
                  <Button onClick={() => setIsMapOpen(false)}>Confirm Location</Button>
              </div>
            </div>
            <Dialog.Close asChild>
              <Button variant="outline" size="icon" className="absolute right-4 top-4">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </form>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-4xl h-[90vh] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-lg border bg-background shadow-lg transition-all duration-200 flex flex-col"
          style={{ maxHeight: '90vh', height: '90vh', minHeight: 'min(700px, 90vh)' }}
        >
          <div className="flex flex-col space-y-1.5 p-6 pb-3 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-semibold leading-none tracking-tight">
                {isEditMode ? `Edit Doctor: ${doctor?.name}` : 'Add New Doctor'}
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={onClose}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </Button>
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
}

