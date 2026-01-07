"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from '@repo/config/config';
import Image from "next/image";

interface MultiSalonMapProps {
  vendors: any[];
  onMarkerClick?: (vendor: any) => void;
  searchQuery?: string;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 19.076090, // Mumbai
  lng: 72.877426
};

export const MultiSalonMap = ({ vendors, onMarkerClick, searchQuery }: MultiSalonMapProps) => {
  const apiKey = NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || "",
    libraries: ['places'] as any,
  });

  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  // Sync map center with searchQuery or vendors
  useEffect(() => {
    if (!isLoaded) return;

    if (searchQuery) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: searchQuery }, (results, status) => {
        if (status === "OK" && results?.[0]?.geometry?.location) {
          setMapCenter({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          });
        }
      });
      return;
    }

    if (vendors.length > 0) {
      const firstWithCoords = vendors.find(v => v.coordinates?.lat && v.coordinates?.lng);
      if (firstWithCoords) {
        setMapCenter({ lat: firstWithCoords.coordinates.lat, lng: firstWithCoords.coordinates.lng });
      }
    }
  }, [vendors, searchQuery, isLoaded]);

  if (loadError) return <div className="h-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold p-8 text-center">Map failed to load. Check API key.</div>;
  if (!isLoaded) return <div className="h-full bg-gray-50 flex items-center justify-center animate-pulse"><p className="text-gray-400 font-black uppercase tracking-widest text-xs">Loading Live Map...</p></div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={12}
      options={{
        styles: mapStyles,
        disableDefaultUI: false,
        zoomControl: true,
      }}
    >
      {vendors.map((vendor) => {
        // Fallback coordinates if not provided (mocking for now if missing)
        const position = { 
          lat: vendor.coordinates?.lat || (defaultCenter.lat + (Math.random() - 0.5) * 0.1), 
          lng: vendor.coordinates?.lng || (defaultCenter.lng + (Math.random() - 0.5) * 0.1) 
        };

        return (
          <Marker
            key={vendor._id}
            position={position}
            onClick={() => {
              setSelectedVendor(vendor);
              if (onMarkerClick) onMarkerClick(vendor);
            }}
            icon={{
              url: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Premium looking pin
              scaledSize: new google.maps.Size(40, 40),
            }}
          />
        );
      })}

      {selectedVendor && (
        <InfoWindow
          position={{ 
            lat: selectedVendor.coordinates?.lat || defaultCenter.lat, 
            lng: selectedVendor.coordinates?.lng || defaultCenter.lng 
          }}
          onCloseClick={() => setSelectedVendor(null)}
        >
          <div className="p-2 max-w-[200px]">
            <div className="relative h-24 w-full mb-2 rounded-lg overflow-hidden">
               <Image 
                src={selectedVendor.profileImage || `https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200`}
                alt={selectedVendor.businessName}
                fill
                className="object-cover"
              />
            </div>
            <h3 className="font-black text-gray-900 text-sm mb-1">{selectedVendor.businessName}</h3>
            <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase">{selectedVendor.city}</p>
            <button 
              onClick={() => window.location.href = `/salon-details/${selectedVendor._id}`}
              className="w-full bg-primary text-white py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest"
            >
              View Details
            </button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

const mapStyles = [
  {
    "featureType": "all",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry",
    "stylers": [{ "visibility": "on" }]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#f2f2f2" }]
  },
  {
      "featureType": "poi.park",
      "elementType": "geometry.fill",
      "stylers": [{ "color": "#e2efda" }]
  },
  {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [{ "color": "#d3e2f4" }]
  }
];
