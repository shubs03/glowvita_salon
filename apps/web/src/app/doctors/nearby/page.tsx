"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { MapPin, Navigation, Clock, Star, Phone, Video, User, Search, Filter, Car } from 'lucide-react';
import { cn } from '@repo/ui/cn';

interface NearbyDoctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  distance: number; // in miles
  estimatedTime: string; // travel time
  consultationFee: number;
  clinicName: string;
  clinicAddress: string;
  coordinates: { lat: number; lng: number };
  availability: string[];
  videoConsultation: boolean;
  phoneNumber: string;
  specializations: string[];
  insurance: string[];
  languages: string[];
  parkingAvailable: boolean;
  wheelchairAccessible: boolean;
}

const nearbyDoctors: NearbyDoctor[] = [
  {
    id: "DR-001",
    name: "Dr. Sarah Johnson",
    specialty: "Dermatology",
    rating: 4.9,
    reviewCount: 156,
    distance: 0.8,
    estimatedTime: "5 min drive",
    consultationFee: 200,
    clinicName: "Downtown Skin Care Center",
    clinicAddress: "123 Medical Plaza, Downtown",
    coordinates: { lat: 40.7128, lng: -74.0060 },
    availability: ["Today", "Tomorrow"],
    videoConsultation: true,
    phoneNumber: "+1 (555) 123-4567",
    specializations: ["Acne Treatment", "Anti-aging", "Skin Cancer Screening"],
    insurance: ["Blue Cross", "Aetna", "Cigna"],
    languages: ["English", "Spanish"],
    parkingAvailable: true,
    wheelchairAccessible: true
  },
  {
    id: "DR-002",
    name: "Dr. Michael Chen",
    specialty: "General Medicine",
    rating: 4.7,
    reviewCount: 234,
    distance: 1.2,
    estimatedTime: "8 min drive",
    consultationFee: 150,
    clinicName: "City Family Health Center",
    clinicAddress: "456 Health Street, Medical District",
    coordinates: { lat: 40.7589, lng: -73.9851 },
    availability: ["Today", "Tomorrow", "This Week"],
    videoConsultation: true,
    phoneNumber: "+1 (555) 234-5678",
    specializations: ["Preventive Care", "Chronic Disease Management", "Annual Checkups"],
    insurance: ["Medicare", "Blue Cross", "United Health"],
    languages: ["English", "Mandarin"],
    parkingAvailable: true,
    wheelchairAccessible: true
  },
  {
    id: "DR-003",
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    rating: 4.8,
    reviewCount: 189,
    distance: 2.1,
    estimatedTime: "12 min drive",
    consultationFee: 180,
    clinicName: "Children's Health Clinic",
    clinicAddress: "789 Family Way, Pediatric Center",
    coordinates: { lat: 40.7831, lng: -73.9712 },
    availability: ["Tomorrow", "This Week"],
    videoConsultation: true,
    phoneNumber: "+1 (555) 345-6789",
    specializations: ["Child Development", "Vaccinations", "Adolescent Health"],
    insurance: ["Medicaid", "Blue Cross", "Aetna"],
    languages: ["English", "Spanish"],
    parkingAvailable: false,
    wheelchairAccessible: true
  },
  {
    id: "DR-004",
    name: "Dr. Robert Kim",
    specialty: "Orthopedics",
    rating: 4.6,
    reviewCount: 298,
    distance: 3.5,
    estimatedTime: "18 min drive",
    consultationFee: 250,
    clinicName: "Sports Medicine Institute",
    clinicAddress: "321 Athletic Drive, Sports Complex",
    coordinates: { lat: 40.6892, lng: -74.0445 },
    availability: ["This Week", "Next Week"],
    videoConsultation: false,
    phoneNumber: "+1 (555) 456-7890",
    specializations: ["Sports Injuries", "Joint Replacement", "Physical Therapy"],
    insurance: ["Blue Cross", "Cigna", "UnitedHealth"],
    languages: ["English", "Korean"],
    parkingAvailable: true,
    wheelchairAccessible: true
  },
  {
    id: "DR-005",
    name: "Dr. Lisa Thompson",
    specialty: "Cardiology",
    rating: 4.9,
    reviewCount: 167,
    distance: 4.2,
    estimatedTime: "22 min drive",
    consultationFee: 300,
    clinicName: "Heart Center of Excellence",
    clinicAddress: "555 Cardiac Lane, Medical Campus",
    coordinates: { lat: 40.6782, lng: -73.9442 },
    availability: ["Next Week"],
    videoConsultation: true,
    phoneNumber: "+1 (555) 567-8901",
    specializations: ["Heart Disease", "Interventional Cardiology", "Preventive Cardiology"],
    insurance: ["Medicare", "Blue Cross", "Aetna", "Cigna"],
    languages: ["English"],
    parkingAvailable: true,
    wheelchairAccessible: true
  }
];

export default function NearbyDoctorsPage() {
  const [doctors, setDoctors] = useState<NearbyDoctor[]>(nearbyDoctors);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [maxDistance, setMaxDistance] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [userLocation, setUserLocation] = useState<string>('Downtown Medical District');
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');

  useEffect(() => {
    // Check for geolocation permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationPermission('granted');
          // In a real app, you would use the coordinates to calculate actual distances
        },
        (error) => {
          setLocationPermission('denied');
        }
      );
    }
  }, []);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.clinicName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    
    const matchesDistance = maxDistance === 'all' || 
                           (maxDistance === '1' && doctor.distance <= 1) ||
                           (maxDistance === '3' && doctor.distance <= 3) ||
                           (maxDistance === '5' && doctor.distance <= 5);
    
    const matchesAvailability = availabilityFilter === 'all' || 
                               (availabilityFilter === 'today' && doctor.availability.includes('Today')) ||
                               (availabilityFilter === 'tomorrow' && doctor.availability.includes('Tomorrow')) ||
                               (availabilityFilter === 'thisweek' && doctor.availability.includes('This Week'));

    return matchesSearch && matchesSpecialty && matchesDistance && matchesAvailability;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return a.distance - b.distance;
      case 'rating':
        return b.rating - a.rating;
      case 'fee':
        return a.consultationFee - b.consultationFee;
      default:
        return a.distance - b.distance;
    }
  });

  const specialties = Array.from(new Set(doctors.map(doctor => doctor.specialty)));

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationPermission('granted');
          setUserLocation('Your Current Location');
          // In a real app, you would update distances based on actual location
        },
        (error) => {
          setLocationPermission('denied');
          alert('Location access denied. Showing doctors near default location.');
        }
      );
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctors Near Me</h1>
          <p className="text-gray-600 mt-2">Find qualified doctors in your area with directions and availability</p>
        </div>

        {/* Location Section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Your Location</p>
                  <p className="text-sm text-gray-600">{userLocation}</p>
                </div>
              </div>
              {locationPermission !== 'granted' && (
                <Button onClick={requestLocation} variant="outline" size="sm">
                  <Navigation className="h-4 w-4 mr-2" />
                  Use My Location
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{filteredDoctors.length}</p>
                  <p className="text-sm text-gray-600">Nearby Doctors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {filteredDoctors.length > 0 ? filteredDoctors[0].distance.toFixed(1) : '0'} mi
                  </p>
                  <p className="text-sm text-gray-600">Closest Doctor</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {filteredDoctors.filter(d => d.availability.includes('Today')).length}
                  </p>
                  <p className="text-sm text-gray-600">Available Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Video className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {filteredDoctors.filter(d => d.videoConsultation).length}
                  </p>
                  <p className="text-sm text-gray-600">Video Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by doctor name, specialty, or clinic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={maxDistance} onValueChange={setMaxDistance}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Distance</SelectItem>
                <SelectItem value="1">Within 1 mile</SelectItem>
                <SelectItem value="3">Within 3 miles</SelectItem>
                <SelectItem value="5">Within 5 miles</SelectItem>
              </SelectContent>
            </Select>

            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="thisweek">This Week</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="fee">Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Doctors List */}
      <div className="space-y-4">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Doctor Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{doctor.name}</h3>
                          <p className="text-gray-600">{doctor.specialty}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(doctor.rating)}
                            <span className="font-medium">{doctor.rating}</span>
                            <span className="text-sm text-gray-600">({doctor.reviewCount} reviews)</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">${doctor.consultationFee}</p>
                          <p className="text-sm text-gray-600">consultation</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clinic Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{doctor.clinicName}</p>
                        <p className="text-sm text-gray-600">{doctor.clinicAddress}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Car className="h-4 w-4" />
                        {doctor.distance} miles • {doctor.estimatedTime}
                      </span>
                      {doctor.parkingAvailable && (
                        <span className="text-green-600">Parking Available</span>
                      )}
                      {doctor.wheelchairAccessible && (
                        <span className="text-blue-600">Wheelchair Accessible</span>
                      )}
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Specializations</p>
                    <div className="flex flex-wrap gap-1">
                      {doctor.specializations.map((spec) => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Availability</p>
                    <div className="flex flex-wrap gap-1">
                      {doctor.availability.map((avail) => (
                        <Badge key={avail} className="text-xs bg-green-100 text-green-800">
                          {avail}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:w-48 space-y-3">
                  <Button className="w-full">
                    Book Appointment
                  </Button>
                  
                  {doctor.videoConsultation && (
                    <Button variant="outline" className="w-full">
                      <Video className="h-4 w-4 mr-2" />
                      Video Call
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full">
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                  
                  <Button variant="ghost" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Clinic
                  </Button>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 mb-1">Accepts Insurance:</p>
                    <div className="space-y-1">
                      {doctor.insurance.slice(0, 2).map((ins) => (
                        <p key={ins} className="text-xs text-gray-600">• {ins}</p>
                      ))}
                      {doctor.insurance.length > 2 && (
                        <p className="text-xs text-gray-500">+{doctor.insurance.length - 2} more</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 mb-1">Languages:</p>
                    <p className="text-xs text-gray-600">{doctor.languages.join(', ')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredDoctors.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-600 mb-4">
                Try expanding your search criteria or increasing the distance range.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedSpecialty('all');
                setMaxDistance('all');
                setAvailabilityFilter('all');
              }}>
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Map Integration Note */}
      <Card>
        <CardContent className="p-4 text-center text-gray-500">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">
            Map integration available with premium features. 
            Click "Get Directions" to open in your preferred maps app.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}