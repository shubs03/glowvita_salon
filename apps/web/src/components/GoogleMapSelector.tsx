"use client";

import React, { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

interface GoogleMapSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 19.076090, // Default Mumbai coordinates
  lng: 72.877426
};

export function GoogleMapSelector({ 
  onLocationSelect, 
  initialLat, 
  initialLng 
}: GoogleMapSelectorProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  // Check if API key is available
  if (!apiKey) {
    console.error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not defined');
  }
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || "",
    libraries: ['places'] as any,
  });

  const [center, setCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);

  useEffect(() => {
    if (initialLat && initialLng) {
      const initialPosition = { lat: initialLat, lng: initialLng };
      setCenter(initialPosition);
      setMarkerPosition(initialPosition);
    }
  }, [initialLat, initialLng]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const newPosition = { lat, lng };
      setMarkerPosition(newPosition);
      // Call the parent's onLocationSelect callback
      onLocationSelect(lat, lng);
    }
  };

  if (loadError) {
    console.error('Google Maps load error:', loadError);
    return (
      <div className="border rounded-lg h-full relative bg-red-50 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="h-12 w-12 mx-auto text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-base font-semibold text-red-600 mb-2">
            Google Maps Failed to Load
          </p>
          <p className="text-sm text-gray-600 mb-4">
            {loadError.message || 'Unable to load Google Maps. This may be due to:'}
          </p>
          <div className="text-left bg-white rounded-lg p-4 mb-4 text-xs text-gray-600">
            <ul className="space-y-2 list-disc list-inside">
              <li>API key not enabled for Maps JavaScript API</li>
              <li>Billing not enabled in Google Cloud Console</li>
              <li>API key restrictions blocking localhost</li>
              <li>Network connectivity issues</li>
            </ul>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs">
            <p className="font-semibold text-yellow-800 mb-1">Manual Entry Available</p>
            <p className="text-yellow-700">
              You can still enter your address details manually and use "Get Current Location" if available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="border rounded-lg h-full relative bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto bg-gray-200 rounded-full animate-pulse"></div>
          <p className="mt-2 text-sm text-gray-500">
            Loading map...
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      onClick={handleMapClick}
      options={{
        streetViewControl: true,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeId: 'roadmap',
      }}
    >
      <Marker position={markerPosition} />
    </GoogleMap>
  );
}