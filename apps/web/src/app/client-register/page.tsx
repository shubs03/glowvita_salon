"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Eye, EyeOff, Map as MapIcon, Gift, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import customerImage from '../../../public/images/web_registration.jpg';

import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from '@repo/config/config';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';

const rawApiKey = NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const GOOGLE_MAPS_API_KEY = rawApiKey.toString().trim().replace(/['"“”]/g, '');

interface GooglePlacesResult {
  description: string;
  place_id: string;
}

function ClientRegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  // Extract referral code from URL on component mount
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      toast.success('Referral code applied!', {
        description: `You're signing up with referral code: ${refCode}`
      });
    }
  }, [searchParams]);

  // Map functionality states
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GooglePlacesResult[]>([]);
  const [authError, setAuthError] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
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

  // Load Google Maps script
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;

    // Suppress Google Maps IntersectionObserver internal error
    const originalError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('IntersectionObserver')) return;
      originalError.apply(console, args);
    };

    const checkGoogleMaps = () => {
      if ((window as any).google?.maps) {
        setIsGoogleMapsLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGoogleMaps()) return;

    const scriptId = 'google-maps-native-script';
    const existingScript = document.getElementById(scriptId);
    
    if (existingScript) {
      if (checkGoogleMaps()) return;
      
      const checkInterval = setInterval(() => {
        if (checkGoogleMaps()) {
          clearInterval(checkInterval);
        }
      }, 500);
      return () => clearInterval(checkInterval);
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,drawing&v=weekly`;
    script.async = true;
    script.defer = true;
    
    (window as any).gm_authFailure = () => {
      console.error("Google Maps API Key Authentication Failure - This usually means the API Key is invalid, has no billing, or is restricted incorrectly.");
      toast.error("Google Maps Authentication Failed. Please check your API key.");
      setAuthError(true);
    };

    script.onload = () => setIsGoogleMapsLoaded(true);
    document.head.appendChild(script);

    return () => {
      console.error = originalError;
    };
  }, []);

  // Initialize Map when modal opens
  useEffect(() => {
    if (!isMapOpen || !isGoogleMapsLoaded || !GOOGLE_MAPS_API_KEY) return;

    const initMap = () => {
      if (!mapContainer.current || !window.google) return;

      if (map.current) {
        google.maps.event.clearInstanceListeners(map.current);
      }

      const center = location 
        ? { lat: location.lat, lng: location.lng }
        : { lat: 23.2599, lng: 77.4126 };

      // Ensure container still exists and has height
      if (mapContainer.current) {
        const rect = mapContainer.current.getBoundingClientRect();
        if (rect.height === 0) {
          setTimeout(initMap, 200);
          return;
        }
      } else {
        return;
      }

      map.current = new google.maps.Map(mapContainer.current, {
        center,
        zoom: location ? 15 : 5,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: false,
      });

      geocoder.current = new google.maps.Geocoder();
      autocompleteService.current = new google.maps.places.AutocompleteService();
      placesService.current = new google.maps.places.PlacesService(map.current);

      if (marker.current) {
        marker.current.setMap(null);
      }

      marker.current = new google.maps.Marker({
        position: center,
        map: map.current,
        draggable: true,
        animation: google.maps.Animation.DROP,
      });

      marker.current.addListener('dragend', () => {
        const position = marker.current!.getPosition();
        if (position) {
          setLocation({ lat: position.lat(), lng: position.lng() });
          fetchAddress({ lat: position.lat(), lng: position.lng() });
        }
      });

      map.current.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setLocation({ lat, lng });
        if (marker.current) {
          marker.current.setPosition({ lat, lng });
        }
        fetchAddress({ lat, lng });
      });
    };

    const timeoutId = setTimeout(initMap, 500);

    return () => {
      clearTimeout(timeoutId);
      if (marker.current) {
        marker.current.setMap(null);
      }
    };
  }, [isMapOpen, isGoogleMapsLoaded]);

  const handleSearch = async (query: string) => {
    if (!query || !autocompleteService.current) {
      setSearchResults([]);
      return;
    }
    
    try {
      autocompleteService.current.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'IN' },
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSearchResults(predictions.map(p => ({
              description: p.description,
              place_id: p.place_id,
            })));
          } else {
            setSearchResults([]);
          }
        }
      );
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    }
  };

  const fetchAddress = async (location: { lat: number; lng: number }) => {
    if (!geocoder.current) return;
    
    try {
      geocoder.current.geocode({ location }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          
          let state = '';
          let city = '';
          let pincode = '';
          
          result.address_components.forEach((component) => {
            if (component.types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
            if (component.types.includes('postal_code')) {
              pincode = component.long_name;
            }
          });
          
          setState(state || '');
          setCity(city || '');
          setPincode(pincode || '');
        }
      });
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const handleSearchResultSelect = (result: GooglePlacesResult) => {
    if (!placesService.current) return;

    placesService.current.getDetails(
      {
        placeId: result.place_id,
        fields: ['geometry', 'address_components'],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const newLocation = { lat, lng };

          setLocation(newLocation);

          let state = '';
          let city = '';
          let pincode = '';

          place.address_components?.forEach((component) => {
            if (component.types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
            if (component.types.includes('postal_code')) {
              pincode = component.long_name;
            }
          });
          
          setState(state || '');
          setCity(city || '');
          setPincode(pincode || '');
          
          if (map.current) {
            map.current.setCenter({ lat, lng });
            map.current.setZoom(15);
          }
          
          if (marker.current) {
            marker.current.setPosition({ lat, lng });
          }
          
          setSearchResults([]);
          setSearchQuery('');
        }
      }
    );
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
                        <MapIcon className="h-5 w-5" />
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
                    <div className="relative">
                      <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="referralCode"
                        type="text"
                        placeholder="Enter referral code"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        className="w-full h-11 pl-10 pr-5 text-sm font-medium bg-gray-50 hover:bg-gray-0 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      />
                    </div>
                    {referralCode && (
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <Gift className="h-3 w-3" />
                        You'll earn rewards when you complete your first booking!
                      </p>
                    )}
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
        <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
          <DialogContent className="sm:max-w-5xl h-[85vh] p-0 overflow-hidden flex flex-col border-none shadow-2xl rounded-3xl">
            <DialogHeader className="p-6 bg-gradient-to-r from-primary/10 to-transparent border-b">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Find Your Salon</DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium">
                    Search for your area and pin your exact location for accurate home service mapping.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="flex-1 flex flex-col relative overflow-hidden">
              {/* Floating Search Bar with Glassmorphism */}
              <div className="absolute top-6 left-6 right-6 z-[100] max-w-md">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <MapIcon className="h-5 w-5" />
                  </div>
                  <Input
                    placeholder="Where are you located?"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    className="w-full h-14 pl-12 pr-6 rounded-2xl border-none shadow-2xl bg-white/90 backdrop-blur-xl text-lg font-medium ring-1 ring-slate-200 focus:ring-2 focus:ring-primary transition-all"
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] max-h-[350px] overflow-y-auto overflow-x-hidden p-2 z-[110] animate-in slide-in-from-top-2 duration-200">
                      {searchResults.map((result) => (
                        <div
                          key={result.place_id}
                          className="group flex items-start gap-3 p-4 hover:bg-primary/5 cursor-pointer rounded-xl transition-all border-b border-slate-50 last:border-0"
                          onClick={() => {
                            handleSearchResultSelect(result);
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                        >
                          <div className="mt-0.5 p-2 rounded-full bg-slate-100 group-hover:bg-primary/10 text-slate-500 group-hover:text-primary transition-colors">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-800 group-hover:text-primary truncate transition-colors font-headline">
                              {result.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Map Container */}
              <div className="flex-1 relative bg-slate-100">
                <div 
                  ref={mapContainer} 
                  className="w-full h-full"
                />
                
                {authError && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 z-[200]">
                    <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md text-center border border-red-100">
                      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <MapPin className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Map Connection Lost</h3>
                      <p className="text-slate-500 text-sm mb-6">
                        We're having trouble connecting to Google Maps. Please check your connection or reload the page.
                      </p>
                      <Button 
                        onClick={() => window.location.reload()}
                        className="w-full rounded-xl bg-red-600 hover:bg-red-700 h-12 text-lg font-headline"
                      >
                        Reload Page
                      </Button>
                    </div>
                  </div>
                )}

                {!isGoogleMapsLoaded && !authError && (
                  <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
                      <p className="text-slate-600 font-medium">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Bottom Action Area */}
              <div className="p-6 bg-slate-50 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {location && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium truncate">
                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button variant="outline" className="flex-1 sm:flex-none rounded-xl" onClick={() => setIsMapOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 sm:flex-none rounded-xl px-8" 
                    onClick={() => {
                      setConfirmedLocation(location);
                      setIsMapOpen(false);
                    }}
                    disabled={!location || !city || !pincode}
                  >
                    Confirm Location
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function ClientRegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading registration form...</p>
        </div>
      </div>
    }>
      <ClientRegisterForm />
    </Suspense>
  );
}