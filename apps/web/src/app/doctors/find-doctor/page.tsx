"use client";

import { useState, useEffect } from 'react';
import * as React from 'react';
import { Card, CardContent } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Calendar, 
  User, 
  Phone,
  Video,
  Filter,
  Navigation,
  Award,
  GraduationCap,
  Building,
  Heart,
  Stethoscope,
  Loader2,
  ArrowRight,
  MessageSquare,
  Users,
  TrendingUp,
  CheckCircle,
  Shield,
  Globe,
  Sparkles
} from 'lucide-react';
import { cn } from '@repo/ui/cn';
import Link from 'next/link';
import Image from 'next/image';
import { useGetDoctorsQuery } from '@repo/store/services/api';

interface Doctor {
  _id: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  specialties?: string[];
  doctorType?: string;
  subSpecialty?: string;
  experience?: string | number;
  rating?: number;
  totalReviews?: number;
  patientSatisfaction?: number; // Percentage of positive patient feedback
  consultationFee?: number;
  location?: {
    clinic: string;
    address: string;
    distance: string;
  };
  clinicName?: string;
  clinicAddress?: string;
  city?: string;
  state?: string;
  education?: string[];
  qualification?: string;
  languages?: string[];
  availableToday?: boolean;
  nextAvailable?: string;
  image?: string;
  profileImage?: string;
  isVerified?: boolean;
  hasVideoConsult?: boolean;
  videoConsultation?: boolean;
  hasHomeVisit?: boolean;
  status?: string;
  registrationNumber?: string;
}

const locations = [
  "All Locations",
  "Downtown",
  "Central District", 
  "Suburbs",
  "Medical District",
  "North Side",
  "South Side"
];

// Transform API doctor data to component format
const transformDoctor = (apiDoctor: any): Doctor => {
  // Calculate patient satisfaction percentage based on rating if not provided
  const calculateSatisfaction = (rating: number, totalReviews: number): number => {
    if (totalReviews === 0) return 0;
    // Convert rating (out of 5) to percentage
    // Assuming 4+ rating is considered positive feedback
    return Math.round((rating / 5) * 100);
  };

  const doctorRating = apiDoctor.rating || 4.5;
  const doctorReviews = apiDoctor.totalReviews || 0;

  return {
    _id: apiDoctor._id,
    id: apiDoctor.id || apiDoctor._id,
    name: apiDoctor.name || 'Unknown Doctor',
    email: apiDoctor.email,
    phone: apiDoctor.phone,
    specialty: apiDoctor.doctorType || (apiDoctor.specialties && apiDoctor.specialties[0]) || 'General Medicine',
    specialties: apiDoctor.specialties || [],
    doctorType: apiDoctor.doctorType,
    experience: typeof apiDoctor.experience === 'string' ? parseInt(apiDoctor.experience) || 0 : apiDoctor.experience || 0,
    rating: doctorRating,
    totalReviews: doctorReviews,
    patientSatisfaction: apiDoctor.patientSatisfaction || calculateSatisfaction(doctorRating, doctorReviews),
    consultationFee: apiDoctor.consultationFee || 100,
    location: {
      clinic: apiDoctor.clinicName || 'Clinic',
      address: apiDoctor.clinicAddress || `${apiDoctor.city || ''}, ${apiDoctor.state || ''}`.trim() || 'Address not available',
      distance: '0 km'
    },
    clinicName: apiDoctor.clinicName,
    clinicAddress: apiDoctor.clinicAddress,
    city: apiDoctor.city,
    state: apiDoctor.state,
    education: apiDoctor.qualification ? [apiDoctor.qualification] : [],
    qualification: apiDoctor.qualification,
    languages: ['English'], // Default language
    availableToday: apiDoctor.status === 'Approved',
    nextAvailable: apiDoctor.status === 'Approved' ? 'Available' : 'Not Available',
    image: apiDoctor.profileImage,
    profileImage: apiDoctor.profileImage,
    isVerified: apiDoctor.status === 'Approved',
    hasVideoConsult: apiDoctor.videoConsultation || false,
    videoConsultation: apiDoctor.videoConsultation,
    hasHomeVisit: false,
    status: apiDoctor.status,
    registrationNumber: apiDoctor.registrationNumber
  };
};

export default function FindDoctorPage() {
  const { data: doctorsData, isLoading, isError } = useGetDoctorsQuery(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);
  const [sortBy, setSortBy] = useState('rating');
  
  // State for hero search results
  const [showHeroResults, setShowHeroResults] = useState(false);
  const [heroSearchTerm, setHeroSearchTerm] = useState('');
  const [heroSelectedCity, setHeroSelectedCity] = useState('All Cities');

  console.log('Fetched Doctors Data:', doctorsData);

  // Transform and filter doctors
  const doctors: Doctor[] = doctorsData ? doctorsData.map(transformDoctor) : [];

  // Filter doctors based on hero search
  const heroFilteredDoctors = React.useMemo(() => {
    if (!heroSearchTerm.trim() && heroSelectedCity === 'All Cities') {
      return [];
    }

    return doctors.filter((doctor) => {
      const matchesSearch = heroSearchTerm.trim() === '' || 
        doctor.name.toLowerCase().includes(heroSearchTerm.toLowerCase()) ||
        doctor.specialty?.toLowerCase().includes(heroSearchTerm.toLowerCase()) ||
        (doctor.specialties && doctor.specialties.some(s => s.toLowerCase().includes(heroSearchTerm.toLowerCase())));

      const matchesCity = heroSelectedCity === 'All Cities' || 
        doctor.city === heroSelectedCity ||
        doctor.clinicAddress?.toLowerCase().includes(heroSelectedCity.toLowerCase());

      return matchesSearch && matchesCity;
    }).slice(0, 5); // Limit to 5 results
  }, [heroSearchTerm, heroSelectedCity, doctors]);

  // Show results when there's a search term or city selected
  React.useEffect(() => {
    setShowHeroResults((heroSearchTerm.trim() !== '' || heroSelectedCity !== 'All Cities') && heroFilteredDoctors.length > 0);
  }, [heroSearchTerm, heroSelectedCity, heroFilteredDoctors.length]);

  // Extract all unique specialties from doctors data
  const allSpecialties = React.useMemo(() => {
    const specialtiesSet = new Set<string>();
    doctors.forEach(doctor => {
      if (doctor.specialties && doctor.specialties.length > 0) {
        doctor.specialties.forEach(specialty => {
          if (specialty && specialty.trim()) {
            specialtiesSet.add(specialty.trim());
          }
        });
      }
    });
    return ['All Specialties', ...Array.from(specialtiesSet).sort()];
  }, [doctors]);

  // Extract all unique cities from doctors data
  const allCities = React.useMemo(() => {
    const citiesSet = new Set<string>();
    doctors.forEach(doctor => {
      if (doctor.city && doctor.city.trim()) {
        citiesSet.add(doctor.city.trim());
      }
    });
    return ['All Cities', ...Array.from(citiesSet).sort()];
  }, [doctors]);

  const filteredDoctors = doctors
    .filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (doctor.specialty && doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (doctor.clinicName && doctor.clinicName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSpecialty = selectedSpecialty === 'All Specialties' || 
                               doctor.specialty === selectedSpecialty ||
                               (doctor.specialties && doctor.specialties.includes(selectedSpecialty));
      
      const matchesCity = selectedCity === 'All Cities' ||
                         doctor.city === selectedCity;
      
      const doctorRating = doctor.rating || 0;
      const matchesRating = doctorRating >= minRating && doctorRating <= maxRating;
      
      return matchesSearch && matchesSpecialty && matchesCity && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'experience':
          const expA = typeof a.experience === 'string' ? parseInt(a.experience) || 0 : a.experience || 0;
          const expB = typeof b.experience === 'string' ? parseInt(b.experience) || 0 : b.experience || 0;
          return expB - expA;
        case 'fee-low':
          return (a.consultationFee || 0) - (b.consultationFee || 0);
        case 'fee-high':
          return (b.consultationFee || 0) - (a.consultationFee || 0);
        default:
          return 0;
      }
    });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:20px_20px]" />
          <div className="container mx-auto px-4 max-w-7xl relative">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-foreground">Loading Doctors...</h2>
              <p className="text-muted-foreground text-base">Please wait while we fetch available doctors</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:20px_20px]" />
          <div className="container mx-auto px-4 max-w-7xl relative">
            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-red-500 font-bold">!</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-foreground">Error Loading Doctors</h2>
              <p className="text-muted-foreground mb-8 text-base">We couldn't load the doctors list. Please try again later.</p>
              <Button onClick={() => window.location.reload()} className="h-12 px-8 font-semibold rounded-md shadow-sm">
                Retry
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
  
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="max-w-5xl mx-auto">

            {/* Main Heading */}
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-4">
                Find Your Perfect Doctor
                <span className="block text-3xl sm:text-4xl lg:text-5xl mt-2">
                  Book Appointments Instantly
                </span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Connect with verified, experienced doctors across multiple specialties. 
                Get expert medical care with easy online booking and video consultations.
              </p>
            </div>

            {/* Quick Search Bar */}
            <div className="max-w-4xl mx-auto mb-6">
              <div className="bg-background rounded-xl border border-blue-400/30 p-2 transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  {/* Search Input */}
                  <div className="md:col-span-5 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                    <Input
                      placeholder="Search doctors, specialties..."
                      value={heroSearchTerm}
                      onChange={(e) => setHeroSearchTerm(e.target.value)}
                      className="pl-12 h-12 text-base border-0 bg-muted/30 focus:bg-background"
                    />
                  </div>
                  
                  {/* Location Select */}
                  <div className="md:col-span-4 relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                    <Select value={heroSelectedCity} onValueChange={setHeroSelectedCity}>
                      <SelectTrigger className="pl-12 h-12 text-base border-0 bg-muted/30 focus:bg-background">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Search Button */}
                  <div className="md:col-span-3">
                    <Button 
                      className="w-full h-12 text-base font-semibold"
                      onClick={() => {
                        setSearchTerm(heroSearchTerm);
                        setSelectedCity(heroSelectedCity);
                        setShowHeroResults(false);
                        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>

                {/* Hero Search Results Table */}
                {showHeroResults && (
                  <div className="mt-4 bg-background rounded-lg border border-border/50 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Doctor</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Specialty</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Location</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Experience</th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-foreground">Rating</th>
                            <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {heroFilteredDoctors.map((doctor) => (
                            <tr key={doctor.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {doctor.image || doctor.profileImage ? (
                                      <Image
                                        src={doctor.image || doctor.profileImage || ''}
                                        alt={doctor.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full object-cover"
                                      />
                                    ) : (
                                      <User className="h-5 w-5 text-primary" />
                                    )}
                                  </div>
                                  <div>
                                      <p className="text-sm font-semibold text-foreground">{doctor.name}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {doctor.city || 'N/A'}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-sm text-muted-foreground">{doctor.experience || 0} years</p>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                                  <span className="text-sm font-semibold text-foreground">{doctor.rating?.toFixed(1)}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button
                                  asChild
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs"
                                >
                                  <Link href={`/doctors/${doctor.id}`}>
                                    View Profile
                                  </Link>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-4 py-3 bg-muted/30 border-t border-border/50">
                      <Button
                        variant="link"
                        className="text-sm text-primary hover:text-primary/80"
                        onClick={() => {
                          setSearchTerm(heroSearchTerm);
                          setSelectedCity(heroSelectedCity);
                          setShowHeroResults(false);
                          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        View all results →
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats - Simple Text Format */}
            {/* <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mb-6 text-center">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-2xl font-bold text-foreground">{doctors.length}+</span>
                  <span className="text-sm text-muted-foreground ml-1">Doctors</span>
                </div>
              </div>
              
              <div className="hidden sm:block w-px h-8 bg-border/50" />
              
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-2xl font-bold text-foreground">{allSpecialties.length - 1}</span>
                  <span className="text-sm text-muted-foreground ml-1">Specialties</span>
                </div>
              </div>
              
              <div className="hidden sm:block w-px h-8 bg-border/50" />
              
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary fill-primary" />
                <div>
                  <span className="text-2xl font-bold text-foreground">
                    {doctors.length > 0 ? (doctors.reduce((acc, d) => acc + (d.rating || 0), 0) / doctors.length).toFixed(1) : '0.0'}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">Avg Rating</span>
                </div>
              </div>
              
              <div className="hidden sm:block w-px h-8 bg-border/50" />
              
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-2xl font-bold text-foreground">
                    {doctors.filter(d => d.isVerified).length}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">Verified</span>
                </div>
              </div>
            </div> */}

            {/* Enhanced Features Row */}
            <div className="bg-background/50 backdrop-blur-sm rounded-xl border border-border/50 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-start gap-3 group">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-0.5">Instant Booking</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">Book appointments in seconds with real-time availability</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 group">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-0.5">Video Consultation</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">Connect with doctors via secure video calls from home</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 group">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-0.5">100% Verified</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">All doctors verified with valid medical licenses</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 group">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-0.5">24/7 Support</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">Round-the-clock customer support for your queries</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <section id="results-section" className="py-8 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Sidebar - Specialties */}
            <div className="lg:col-span-3">
              <div className="sticky top-4">
                {/* Search Bar */}
                <div className="bg-background rounded-md shadow-sm border border-border/50 p-4 mb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Search Doctors</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      placeholder="Search by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 text-sm border-border/50"
                    />
                  </div>
                </div>

                {/* Specialties List */}
                <div className="bg-background rounded-md shadow-sm border border-border/50 p-4 mb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Specialties</h3>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {allSpecialties.map((specialty) => (
                      <button
                        key={specialty}
                        onClick={() => setSelectedSpecialty(specialty)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200",
                          selectedSpecialty === specialty
                            ? "bg-primary text-primary-foreground font-medium shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                </div>

                {/* City Filter */}
                <div className="bg-background rounded-md shadow-sm border border-border/50 p-4 mb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">City</h3>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {allCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => setSelectedCity(city)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200",
                          selectedCity === city
                            ? "bg-primary text-primary-foreground font-medium shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Range Filter */}
                <div className="bg-background rounded-md shadow-sm border border-border/50 p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Rating Range</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg font-bold text-foreground">
                          {minRating.toFixed(1)} - {maxRating.toFixed(1)}
                        </span>
                      </div>
                      {(minRating > 0 || maxRating < 5) && (
                        <button
                          onClick={() => {
                            setMinRating(0);
                            setMaxRating(5);
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    
                    {/* Minimum Rating Slider */}
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground flex items-center justify-between">
                        <span>Minimum Rating</span>
                        <span className="font-semibold text-foreground">{minRating.toFixed(1)}</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={minRating}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (value <= maxRating) {
                            setMinRating(value);
                          }
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Maximum Rating Slider */}
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground flex items-center justify-between">
                        <span>Maximum Rating</span>
                        <span className="font-semibold text-foreground">{maxRating.toFixed(1)}</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={maxRating}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (value >= minRating) {
                            setMaxRating(value);
                          }
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                      <span>0</span>
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Doctors Grid */}
            <div className="lg:col-span-9">
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-border/50">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {filteredDoctors.length} Doctors Found
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSpecialty !== 'All Specialties' && (
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                        {selectedSpecialty}
                      </Badge>
                    )}
                    {selectedCity !== 'All Cities' && (
                      <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600">
                        <MapPin className="h-3 w-3 mr-1" />
                        {selectedCity}
                      </Badge>
                    )}
                    {(minRating > 0 || maxRating < 5) && (
                      <Badge variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-600">
                        <Star className="h-3 w-3 mr-1" />
                        {minRating.toFixed(1)} - {maxRating.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-10 border-border/50">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="experience">Most Experienced</SelectItem>
                    <SelectItem value="fee-low">Fee: Low to High</SelectItem>
                    <SelectItem value="fee-high">Fee: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">Loading Doctors...</h3>
                  <p className="text-muted-foreground text-sm">Please wait</p>
                </div>
              )}

              {/* Error State */}
              {isError && (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl text-red-500 font-bold">!</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">Error Loading Doctors</h3>
                  <p className="text-muted-foreground mb-6 text-sm">Please try again later.</p>
                  <Button onClick={() => window.location.reload()} className="h-10 px-6 font-semibold">
                    Retry
                  </Button>
                </div>
              )}

              {/* Doctors Grid */}
              {!isLoading && !isError && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor) => (
                      <DoctorCard key={doctor.id} doctor={doctor} />
                    ))}
                  </div>

                  {/* Empty State */}
                  {filteredDoctors.length === 0 && (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-foreground">No doctors found</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                        Try adjusting your search or select a different specialty.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedSpecialty('All Specialties');
                          setSelectedCity('All Cities');
                          setMinRating(0);
                          setMaxRating(5);
                        }}
                        className="h-10 px-6 border-primary/30 hover:bg-primary/5 font-semibold"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Doctor Card Component matching the FeatureCard design
function DoctorCard({ doctor }: { doctor: Doctor }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative overflow-hidden rounded-md hover:shadow-lg border bg-card transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Upper Half: Doctor Image */}
      <div className="aspect-[3/2] relative w-full overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
        {doctor.image || doctor.profileImage ? (
          <Image
            src={doctor.image || doctor.profileImage || ''}
            alt={doctor.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="h-20 w-20 text-primary/40" />
          </div>
        )}
        
        {/* Rating Badge */}
        <Badge 
          variant="default"
          className="absolute top-2 right-2 bg-blue-500 text-white border-0 text-xs px-2 py-0.5 rounded-full font-medium"
        >
          <Star className="h-3 w-3 mr-1 fill-white" />
          {doctor.rating?.toFixed(1)}
        </Badge>
      </div>

      {/* Lower Half: Details */}
      <div className="p-4 flex flex-col justify-between h-fit bg-card">
        <div>
          {/* Doctor Header */}
          <div className="mb-3">
            <h3 className="text-base font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors line-clamp-1">
              {doctor.name}
            </h3>
            <p className="text-xs text-primary font-semibold line-clamp-1 mb-1">
              {doctor.experience} years experience
            </p>
            {/* Patient Satisfaction */}
            {doctor.patientSatisfaction !== undefined && doctor.patientSatisfaction > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-300"
                    style={{ width: `${doctor.patientSatisfaction}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-green-600">
                  {doctor.patientSatisfaction}%
                </span>
              </div>
            )}
            {(doctor.totalReviews || 0) > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Patient satisfaction based on {doctor.totalReviews} review{doctor.totalReviews !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Features List */}
          <div className="space-y-1 mb-3">
            {doctor.location?.clinic && (
              <p className="text-xs text-foreground flex items-start">
                <Building className="h-3 w-3 text-primary mr-1.5 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{doctor.location.clinic}</span>
              </p>
            )}
            <p className="text-xs text-foreground flex items-start">
              <MapPin className="h-3 w-3 text-primary mr-1.5 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{doctor.location?.address || 'Address not available'}</span>
            </p>
          </div>

          {/* Specialties Badges */}
          {doctor.specialties && doctor.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {doctor.specialties.map((specialty, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary hover:bg-primary/15 border-0"
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2">
          <Button
            asChild
            size="sm"
            className="transition-all duration-200 text-xs"
            variant="outline"
          >
            <Link href={`/doctors/${doctor.id}`} className="flex items-center justify-center gap-1">
              Book Appointment
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          {/* <Button
            size="sm"
            className="transition-all duration-200 text-xs"
            variant="default"
          >
            <Phone className="h-3 w-3 mr-1" />
            Contact Clinic
          </Button> */}
        </div>
      </div>
    </div>
  );
}
