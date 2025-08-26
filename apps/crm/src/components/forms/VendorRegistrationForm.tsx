"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Image as ImageIcon, Upload, Map, CheckCircle2 } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Checkbox } from '@repo/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from '@repo/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import stateCityData from '@repo/lib/src/state-city.json';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NEXT_PUBLIC_MAPBOX_API_KEY } from '../../../../../packages/config/config';
import { toast } from 'sonner';
import { useVendorRegisterMutation } from '@repo/store/api';

const MAPBOX_TOKEN = NEXT_PUBLIC_MAPBOX_API_KEY;

type SalonCategory = 'unisex' | 'men' | 'women';
type SubCategory = 'shop' | 'shop-at-home' | 'onsite';

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

export function VendorRegistrationForm({ onSuccess }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    category: 'unisex' as SalonCategory,
    subCategories: [] as SubCategory[],
    description: '',
    website: '',
    profileImage: '',
    address: '',
    state: '',
    city: '',
    pincode: '',
    location: null,
    referredByCode: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [cities, setCities] = useState<string[]>([]);

  const [registerVendor, { isLoading }] = useVendorRegisterMutation();

  useEffect(() => {
    if (formData.state) {
      const stateData = states.find(s => s.state === formData.state);
      setCities(stateData ? stateData.districts : []);
    }
  }, [formData.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (id, checked) => {
    setFormData(prev => ({
      ...prev,
      subCategories: checked
        ? [...prev.subCategories, id]
        : prev.subCategories.filter(item => item !== id)
    }));
  };

  const handleImageUpload = (e) => {
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
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.businessName) newErrors.businessName = 'Business name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    if (!formData.location) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== 3) return;
    try {
      await registerVendor(formData).unwrap();
      onSuccess();
    } catch (err) {
      toast.error(err.data?.error || 'Registration failed');
    }
  };
  
  // MAPBOX LOGIC
  // Copied from VendorEditForm and adapted
  useEffect(() => {
    if (!isMapOpen || !MAPBOX_TOKEN) return;
    const initMap = () => {
      if (!mapContainer.current) return;
      mapboxgl.accessToken = MAPBOX_TOKEN;
      if (map.current) map.current.remove();
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: formData.location ? [formData.location.lng, formData.location.lat] : [77.4126, 23.2599],
        zoom: formData.location ? 15 : 5
      });
      if (marker.current) marker.current.remove();
      marker.current = new mapboxgl.Marker({ draggable: true, color: '#3B82F6' })
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
      map.current.on('load', () => setTimeout(() => map.current!.resize(), 100));
    };
    const timeoutId = setTimeout(initMap, 100);
    return () => {
      clearTimeout(timeoutId);
      if (map.current) map.current.remove();
      if (marker.current) marker.current.remove();
    };
  }, [isMapOpen]);
  
  const handleSearch = async (query: string) => {
    if (!query || !MAPBOX_TOKEN) { setSearchResults([]); return; }
    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=IN&types=place,locality,neighborhood,address`);
      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) { console.error('Error searching locations:', error); }
  };
  
  const fetchAddress = async (coordinates) => {
    if (!MAPBOX_TOKEN) return;
    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${MAPBOX_TOKEN}&types=place,locality,neighborhood,address`);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        const context = data.features[0].context || [];
        const state = context.find(c => c.id.includes('region'))?.text || '';
        const city = context.find(c => c.id.includes('place'))?.text || '';
        setFormData(prev => ({ ...prev, address, state: state || prev.state, city: city || prev.city }));
      }
    } catch (error) { console.error('Error fetching address:', error); }
  };

  const handleSearchResultSelect = (result) => {
    const coordinates = result.geometry.coordinates;
    const newLocation = { lat: coordinates[1], lng: coordinates[0] };
    const state = result.context?.find(c => c.id.includes('region'))?.text;
    setFormData(prev => ({
      ...prev,
      location: newLocation,
      address: result.place_name,
      state: state || prev.state,
      city: result.context?.find(c => c.id.includes('place'))?.text || prev.city,
    }));
    if (map.current) {
      map.current.setCenter(coordinates);
      map.current.setZoom(15);
      setTimeout(() => map.current!.resize(), 100);
    }
    if (marker.current) marker.current.setLngLat(coordinates);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Vendor Registration</CardTitle>
        <CardDescription>Complete the steps to create your vendor account.</CardDescription>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Step 1: Business & Owner Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input name="firstName" placeholder="First Name" onChange={handleInputChange} value={formData.firstName} required />
                <Input name="lastName" placeholder="Last Name" onChange={handleInputChange} value={formData.lastName} required />
              </div>
              <Input name="businessName" placeholder="Business Name" onChange={handleInputChange} value={formData.businessName} required />
              <Input name="email" type="email" placeholder="Email Address" onChange={handleInputChange} value={formData.email} required />
              <Input name="phone" type="tel" placeholder="Phone Number" onChange={handleInputChange} value={formData.phone} required />
              <div className="relative">
                <Input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" onChange={handleInputChange} value={formData.password} required />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
               <div className="relative">
                <Input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" onChange={handleInputChange} value={formData.confirmPassword} required />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Step 2: Location Details</h3>
               <div className="flex items-center gap-2">
                <Input value={formData.location ? `${formData.location.lat.toFixed(4)}, ${formData.location.lng.toFixed(4)}` : ''} placeholder="Select location from map" readOnly />
                <Button type="button" variant="outline" onClick={() => setIsMapOpen(true)}><Map className="mr-2 h-4 w-4" /> Choose from Map</Button>
              </div>
              <Input name="address" placeholder="Full Address" onChange={handleInputChange} value={formData.address} required />
               <div className="grid md:grid-cols-3 gap-4">
                <Select name="state" onValueChange={(value) => setFormData(prev => ({...prev, state: value, city: ''}))} value={formData.state}>
                  <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                  <SelectContent>{states.map(s => <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>)}</SelectContent>
                </Select>
                <Select name="city" onValueChange={(value) => setFormData(prev => ({...prev, city: value}))} value={formData.city} disabled={!formData.state}>
                  <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
                  <SelectContent>{cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Input name="pincode" placeholder="Pincode" onChange={handleInputChange} value={formData.pincode} required />
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Step 3: Salon Details</h3>
              <Select name="category" onValueChange={(value) => setFormData(prev => ({...prev, category: value as SalonCategory}))} value={formData.category}>
                <SelectTrigger><SelectValue placeholder="Salon Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unisex">Unisex</SelectItem>
                  <SelectItem value="men">Men</SelectItem>
                  <SelectItem value="women">Women</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-2">
                <Label>Sub Categories</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['shop', 'shop-at-home', 'onsite'] as SubCategory[]).map(sc => (
                    <div key={sc} className="flex items-center space-x-2">
                      <Checkbox id={sc} checked={formData.subCategories.includes(sc)} onCheckedChange={(checked) => handleCheckboxChange(sc, checked as boolean)} />
                      <Label htmlFor={sc} className="capitalize">{sc.replace('-', ' ')}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <Textarea name="description" placeholder="Business Description (Optional)" onChange={handleInputChange} value={formData.description} />
              <Input name="website" placeholder="Website URL (Optional)" onChange={handleInputChange} value={formData.website} />
              <Input name="referredByCode" placeholder="Referral Code (Optional)" onChange={handleInputChange} value={formData.referredByCode} />
            </div>
          )}
          <div className="flex justify-between mt-6">
            {step > 1 && <Button type="button" variant="outline" onClick={prevStep}>Back</Button>}
            {step < 3 && <Button type="button" onClick={nextStep} className="ml-auto">Next</Button>}
            {step === 3 && <Button type="submit" disabled={isLoading} className="ml-auto">{isLoading ? "Registering..." : "Complete Registration"}</Button>}
          </div>
        </form>
      </CardContent>

      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Location</DialogTitle>
            <DialogDescription>Search for a location or click on the map.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 flex flex-col h-[60vh]">
            <div className="relative">
              <Input placeholder="Search for a location" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }} />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 border rounded-md bg-white shadow-lg max-h-48 overflow-y-auto mt-1">
                  {searchResults.map(result => (
                    <div key={result.id} className="p-3 hover:bg-gray-100 cursor-pointer" onClick={() => handleSearchResultSelect(result)}>{result.place_name}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 relative border rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
              <div ref={mapContainer} className="w-full h-full" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsMapOpen(false)}>Cancel</Button>
            <Button type="button" onClick={() => setIsMapOpen(false)}>Confirm Location</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
