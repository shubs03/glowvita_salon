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
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places'],
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
    return (
      <div className="border rounded-lg h-full relative bg-gray-50 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="h-8 w-8 mx-auto text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Map error. Check API key.
          </p>
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