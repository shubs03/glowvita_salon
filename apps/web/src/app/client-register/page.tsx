"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Eye, EyeOff, Map } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import customerImage from '../../../public/images/web_registration.jpg';

// Dynamically import mapbox-gl only on client side
let mapboxgl: any = null;
if (typeof window !== 'undefined') {
  import('mapbox-gl').then((module) => {
    mapboxgl = module.default;
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;
  }).catch((err) => {
    console.warn('Mapbox failed to load:', err);
  });
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

export default function ClientRegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // Map functionality states
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<any | null>(null);
  const marker = useRef<any | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  
  // New state to track confirmed location
  const [confirmedLocation, setConfirmedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      // Check if email already exists
      const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          toast.error('This email is already registered. Please use a different email or log in.');
          return;
        } else {
          // Email doesn't exist, proceed to registration form
          setShowRegistrationForm(true);
        }
      } else {
        // If the check fails, we'll still proceed to avoid blocking legitimate users
        console.warn('Email check failed, proceeding with registration');
        setShowRegistrationForm(true);
      }
    } catch (error) {
      console.error('Error checking email:', error);
      // If there's a network error, we'll still proceed to avoid blocking legitimate users
      setShowRegistrationForm(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check each required field individually and provide specific error messages
    const missingFields = [];
    
    if (!firstName) missingFields.push('First name');
    if (!lastName) missingFields.push('Last name');
    if (!email) missingFields.push('Email');
    if (!mobileNo) missingFields.push('Mobile number');
    if (!confirmedLocation) missingFields.push('Location');
    if (!state) missingFields.push('State');
    if (!city) missingFields.push('City');
    if (!pincode) missingFields.push('Pincode');
    if (!password) missingFields.push('Password');
    if (!confirmPassword) missingFields.push('Confirm password');

    if (missingFields.length > 0) {
      const errorMessage = `Please fill in the following required fields: ${missingFields.join(', ')}`;
      toast.error(errorMessage);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorMessage = 'Please enter a valid email address';
      toast.error(errorMessage);
      return;
    }

    // Mobile number validation - must be exactly 10 digits
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobileNo)) {
      const errorMessage = 'Mobile number must be exactly 10 digits';
      toast.error(errorMessage);
      return;
    }

    // Password validation - must be at least 8 characters
    if (password.length < 8) {
      const errorMessage = 'Password must be at least 8 characters long';
      toast.error(errorMessage);
      return;
    }

    // Basic validation
    if (password !== confirmPassword) {
      const errorMessage = 'Passwords do not match';
      toast.error(errorMessage);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName, 
          lastName, 
          email, 
          mobileNo, 
          location: confirmedLocation, 
          state, 
          city, 
          pincode, 
          referralCode, 
          password 
        }),
      });

      // Check if response is OK and has content
      if (res.ok) {
        toast.success(`${firstName} ${lastName} registered successfully!`);
        router.push('/client-login');
      } else {
        // Try to parse JSON, but handle case where there's no JSON
        let errorMessage = 'Failed to sign up.';
        try {
          const data = await res.json();
          errorMessage = data.message || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, use status text or generic message
          errorMessage = res.statusText || errorMessage;
        }
        
        // If the error is about email already existing, automatically redirect to step 1
        if (errorMessage.includes('already registered') || errorMessage.includes('already exist')) {
          const toastId = toast.error(errorMessage);
          // Automatically redirect to step 1 after a short delay and dismiss the toast
          setTimeout(() => {
            toast.dismiss(toastId);
            setShowRegistrationForm(false);
          }, 2000);
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      const errorMessage = 'Network error. Please check your connection and try again.';
      toast.error(errorMessage);
    }
  };

  // Initialize Map when modal opens
  useEffect(() => {
    if (!isMapOpen || !mapboxgl || !process.env.NEXT_PUBLIC_MAPBOX_API_KEY) return;

    const initMap = () => {
      if (!mapContainer.current) return;

      try {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;
        if (map.current) {
          map.current.remove();
        }

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: location ? [location.lng, location.lat] : [77.4126, 23.2599],
          zoom: location ? 15 : 5,
          attributionControl: false
        });

        if (marker.current) {
          marker.current.remove();
        }

        marker.current = new mapboxgl.Marker({
          draggable: true,
          color: '#3B82F6'
        })
          .setLngLat(location ? [location.lng, location.lat] : [77.4126, 23.2599])
          .addTo(map.current);

        marker.current.on('dragend', () => {
          const lngLat = marker.current!.getLngLat();
          setLocation({ lat: lngLat.lat, lng: lngLat.lng });
          fetchAddress([lngLat.lng, lngLat.lat]);
        });

        map.current.on('click', (e: any) => {
          const { lng, lat } = e.lngLat;
          setLocation({ lat, lng });
          marker.current!.setLngLat([lng, lat]);
          fetchAddress([lng, lat]);
        });

        map.current.on('load', () => {
          setTimeout(() => {
            if (map.current) {
              map.current.resize();
            }
          }, 100);
        });
      } catch (error) {
        console.error('Error initializing Mapbox:', error);
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
  }, [isMapOpen, location]);

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
    if (!query || !mapboxgl || !process.env.NEXT_PUBLIC_MAPBOX_API_KEY) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}&country=IN&types=place,locality,neighborhood,address`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    }
  };

  // Fetch address from coordinates using reverse geocoding
  const fetchAddress = async (coordinates: [number, number]) => {
    if (!mapboxgl || !process.env.NEXT_PUBLIC_MAPBOX_API_KEY) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}&types=place,locality,neighborhood,address`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const context = data.features[0].context || [];
        const state = context.find((c: any) => c.id.includes('region'))?.text || '';
        const city = context.find((c: any) => c.id.includes('place'))?.text || '';
        const pincode = context.find((c: any) => c.id.includes('postcode'))?.text || '';

        setState(state || '');
        setCity(city || '');
        setPincode(pincode || '');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = (result: MapboxFeature) => {
    const coordinates = result.geometry.coordinates;
    const newLocation = { lat: coordinates[1], lng: coordinates[0] };

    setLocation(newLocation);

    // Update state, city, and pincode based on the selected location
    const context = result.context || [];
    const state = context.find((c: any) => c.id.includes('region'))?.text || '';
    const city = context.find((c: any) => c.id.includes('place'))?.text || '';
    const pincode = context.find((c: any) => c.id.includes('postcode'))?.text || '';

    setState(state || '');
    setCity(city || '');
    setPincode(pincode || '');

    if (map.current) {
      map.current.setCenter(coordinates);
      map.current.setZoom(15);
      setTimeout(() => {
        if (map.current) {
          map.current.resize();
        }
      }, 100);
    }

    if (marker.current) {
      marker.current.setLngLat(coordinates);
    }

    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row">
      {/* Back Button */}
      <button 
        onClick={() => showRegistrationForm ? setShowRegistrationForm(false) : router.back()} 
        className="absolute top-4 left-4 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-all duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Left Side - Registration Form */}
      <div className="flex-1 md:w-1/2 flex items-center justify-center p-4 sm:p-6 relative z-10 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md self-center py-6">
          {/* Heading - Only show when not on registration form */}
          {!showRegistrationForm && (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-gray-900 md:text-xl">Glowvita Salon for customers</h1>
              <p className="text-gray-600 text-l mt-3 lg:whitespace-nowrap md:whitespace-normal sm:whitespace-normal">Register to access booking and appointment management.</p>
            </div>
          )}

          {!showRegistrationForm ? (
            <div className="space-y-5">
              <form onSubmit={handleContinue} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 p-5 text-sm font-medium bg-gray-50 hover:bg-gray-0 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>

                {/* Continue Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Continue
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-gray-50 text-gray-500">OR CONTINUE WITH</span>
                  </div>
                </div>

                {/* Continue with Google Button */}
                <Button 
                  type="button"
                  className="w-full h-11 text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                >
                  <div className="flex items-center justify-center w-5 h-5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <span>Continue with Google</span>
                </Button>

                {/* Horizontal line above business account section */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-gray-50 text-gray-500"></span>
                  </div>
                </div>

                {/* Already have an account section */}
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">
                    Already have an account?
                  </p>
                  <Link 
                    href="/client-login" 
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 block mt-1"
                  >
                    Sign in to manage your appointments.
                  </Link>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-extrabold text-gray-900 md:text-xl">Create account</h2>
                  <p className="text-gray-600 mt-3 lg:whitespace-nowrap md:whitespace-normal sm:whitespace-normal">You're almost there! Create your new account for</p>
                  <p className="text-gray-600 lg:whitespace-nowrap md:whitespace-normal sm:whitespace-normal"><span className="font-bold">{email}</span> by completing these details</p>
                </div>

                {/* First Name and Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="firstName"
                      placeholder="First Name"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full h-11 p-5 text-sm font-medium bg-gray-50 hover:bg-gray-0 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="lastName"
                      placeholder="Last Name"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full h-11 p-5 text-sm font-medium bg-gray-50 hover:bg-gray-0 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile number <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="mobileNo"
                    type="tel"
                    placeholder="Enter your 10-digit mobile number"
                    required
                    value={mobileNo}
                    onChange={(e) => {
                      // Only allow numeric input and limit to 10 digits
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setMobileNo(value);
                    }}
                    maxLength={10}
                    pattern="\d{10}"
                    title="Please enter exactly 10 digits"
                    className="w-full h-11 p-5 text-sm font-medium bg-gray-50 hover:bg-gray-0 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>

                {/* Location and Referral Code - Same Line */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location <span className="text-destructive">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="location"
                        value={confirmedLocation ? `${confirmedLocation.lat.toFixed(6)}, ${confirmedLocation.lng.toFixed(6)}` : ''}
                        placeholder="Select location from map"
                        readOnly
                        required
                        className="w-full h-11 p-5 text-sm font-medium bg-gray-50 hover:bg-gray-0 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsMapOpen(true)}
                        className="h-11 w-11"
                      >
                        <Map className="h-5 w-5" />
                      </Button>
                    </div>
                    {/* Hidden fields for state, city, pincode - not displayed to user but sent to backend */}
                    <input type="hidden" value={state} />
                    <input type="hidden" value={city} />
                    <input type="hidden" value={pincode} />
                  </div>

                  {/* Referral Code */}
                  <div>
                    <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Referral Code (Optional)
                    </label>
                    <input
                      id="referralCode"
                      type="text"
                      placeholder="Enter referral code"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="w-full h-11 p-5 text-sm font-medium bg-gray-50 hover:bg-gray-0 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Create Password <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password "
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        className="w-full h-11 p-5 text-sm font-medium bg-gray-50 hover:bg-gray-0 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={8}
                        className="w-full h-11 p-5 text-sm font-medium bg-gray-50 hover:bg-gray-0 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Continue
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Background Image with Backdrop */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="absolute inset-0">
          <Image
            src={customerImage}
            alt="Salon Customer"
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>

      {/* Map Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Select Location</h3>
              <p className="text-sm text-gray-500">Search for a location or click on the map</p>
            </div>
            
            <div className="p-4 space-y-3 flex-1 overflow-auto">
              <div className="relative">
                <input
                  placeholder="Search for a location"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="w-full h-11 p-5 text-sm font-medium bg-gray-50 hover:bg-gray-0 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 border rounded-md bg-white shadow-lg max-h-48 overflow-y-auto mt-1">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 text-sm"
                        onClick={() => {
                          handleSearchResultSelect(result);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                      >
                        <div className="font-medium">{result.place_name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Show warning if location is selected but city/pincode are missing */}
              {location && (!city || !pincode) && (
                <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                  Please wait for the city and pincode to be automatically populated, or select a more specific location.
                </div>
              )}
              
              {location && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  Selected: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </div>
              )}
              
              <div 
                ref={mapContainer} 
                className="w-full h-64 rounded-lg overflow-hidden border"
              />
            </div>
            
            <div className="p-4 border-t flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsMapOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Check if location, city, and pincode are all populated
                  if (location && city && pincode) {
                    // Set the confirmed location only when all fields are populated
                    setConfirmedLocation(location);
                    setIsMapOpen(false);
                  } else {
                    toast.error('Please select a location and wait for city and pincode to be populated.');
                  }
                }}
                disabled={!location || !city || !pincode}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}