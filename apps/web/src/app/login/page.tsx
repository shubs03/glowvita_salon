"use client";

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Eye, EyeOff, Map } from 'lucide-react';
import Image from 'next/image';
import customerImage from '../../../public/images/web_login.jpg';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';

import Link from 'next/link';
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from '@repo/config/config';

const rawApiKey = NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const GOOGLE_MAPS_API_KEY = rawApiKey.toString().trim().replace(/['"“”]/g, '');

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const router = useRouter();

  // Map functionality states
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [authError, setAuthError] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      const data = await res.json();
      setError(data.message || 'Failed to log in.');
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
            setSearchResults(predictions);
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

  const handleSearchResultSelect = (result: any) => {
    if (!placesService.current) return;

    placesService.current.getDetails(
      {
        placeId: result.place_id,
        fields: ['geometry', 'formatted_address'],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const newLocation = { lat, lng };

          setLocation(newLocation);
          
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
      {/* Left Side - Login Form */}
      <div className="flex-1 md:w-1/2 flex items-center justify-center p-4 sm:p-6 relative z-10 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md self-center py-6">
          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 whitespace-nowrap">Glowvita Salon for customers</h1>
            <p className="text-gray-600 text-l mt-3 whitespace-nowrap">Create an account or log in to book and manage your appointments.</p>
          </div>

          {/* Login Form */}
          <div className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email and Password Fields First */}
              <div className="space-y-5">
                <div>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 p-5 text-sm font-medium bg-gray-50 hover:bg-gray-0 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 text-sm p-5 font-medium bg-gray-50 hover:bg-gray-0 text-gray-700 border border-gray-200 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
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
              </div>

              {/* Location Field */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                  Location
                </Label>
                <div className="flex flex-col gap-2">
                  <Input
                    id="location"
                    value={location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : ''}
                    placeholder="Select your location"
                    readOnly
                    className="flex-1 h-12 px-4 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsMapOpen(true)}
                    className="w-full h-12 px-4 text-sm"
                  >
                    <Map className="mr-2 h-4 w-4" />
                    Choose from Map
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Continue
              </Button>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => router.push('/forgot-password')}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-gray-50 text-gray-500">OR CONTINUE WITH</span>
                </div>
              </div>

              {/* Continue with Google Button After OR Divider */}
              <Button 
                type="button"
                onClick={() => {/* Add Google OAuth handler */}}
                className="w-full h-12 text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
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

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link 
                    href="/client-register" 
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Create Account
                  </Link>
                </p>
              </div>

              {/* Simplified Business Account Section */}
              <div className="mt-4 pt-5 border-t border-gray-200 text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  HAVE A BUSINESS ACCOUNT?
                </p>
                <a 
                  href="http://localhost:3001" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sign in as a professional
                </a>
              </div>
            </form>
          </div>
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
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Location</DialogTitle>
            <DialogDescription>
              Search for a location, click on the map, or drag the marker to select your location.
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
                        key={result.place_id}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 text-sm"
                        onClick={() => handleSearchResultSelect(result)}
                      >
                        <div className="font-medium">{result.description}</div>
                      </div>
                  ))}
                </div>
              )}
            </div>
            
            {location && (
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <strong>Selected Location:</strong> {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}
              </div>
            )}
            
            <div className="relative border rounded-lg overflow-hidden" style={{ height: '300px' }}>
              <div 
                ref={mapContainer} 
                className="w-full h-full"
              />
              
              {authError && (
                <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center p-4 text-center z-10">
                  <p className="text-red-600 font-bold mb-2">Google Maps Error</p>
                  <p className="text-xs text-red-500 mb-4 px-4 overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                    InvalidKeyMapError: The API key is invalid or rejected.
                  </p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 font-semibold"
                  >
                    Reload Page
                  </button>
                  <p className="text-[10px] text-gray-400 mt-4 max-w-xs">
                    Check billing, Maps JavaScript API enablement, and API restrictions in Google Cloud Console.
                  </p>
                </div>
              )}

              {!isGoogleMapsLoaded && !authError && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-600">Loading map...</p>
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
    </div>
  );
}