"use client";

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Search, Filter, Grid, List, Star, MapPin, Calendar, UserCheck, X } from 'lucide-react';
import { useGetDoctorsQuery } from '@repo/store/services/api';
import { Badge } from '@repo/ui/badge';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

// Doctor type definition
interface Doctor {
  _id: string;
  id: string;
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
  profileImage?: string;
  status?: 'Approved' | 'Pending' | 'Rejected';
  createdAt?: string;
  updatedAt?: string;
  rating?: number;
  reviewCount?: number;
}

export default function DoctorsPage() {
  const { data: doctorsData, isLoading, isError, error: apiError } = useGetDoctorsQuery(undefined);
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [allSpecializations, setAllSpecializations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState('all');

  // Load view mode from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('doctorsViewMode');
    if (savedViewMode === 'grid' || savedViewMode === 'list') {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save view mode to localStorage
  useEffect(() => {
    localStorage.setItem('doctorsViewMode', viewMode);
  }, [viewMode]);

  // Extract all specializations and locations from doctors data
  useEffect(() => {
    if (doctorsData && Array.isArray(doctorsData)) {
      const specializationsSet = new Set<string>();
      const locationsSet = new Set<string>();
      
      doctorsData.forEach((doctor: Doctor) => {
        if (doctor.specialties && Array.isArray(doctor.specialties)) {
          doctor.specialties.forEach((specialty: string) => {
            if (specialty) specializationsSet.add(specialty);
          });
        }
        if (doctor.city) {
          locationsSet.add(doctor.city);
        }
      });
      
      setAllSpecializations(Array.from(specializationsSet).sort());
    }
  }, [doctorsData]);

  // Fetch doctors from API
  useEffect(() => {
    if (isLoading) {
      setLoading(true);
    } else if (isError) {
      let errorMessage = 'Failed to fetch doctors';
      if (apiError) {
        if ('status' in apiError) {
          const fetchError = apiError as { status: number; data?: any };
          errorMessage = `Error ${fetchError.status}: ${JSON.stringify(fetchError.data || 'Unknown error')}`;
        } else if ('message' in apiError) {
          errorMessage = apiError.message || errorMessage;
        }
      }
      setErrorState(errorMessage);
      setLoading(false);
    } else if (doctorsData) {
      // Transform API data
      const approvedDoctors = doctorsData.filter((doctor: any) => 
        doctor.status === 'Approved'
      );
      
      const transformedDoctors = approvedDoctors.map((doctor: any) => ({
        _id: doctor._id || doctor.id,
        id: doctor.id || doctor._id,
        name: doctor.name || 'Unnamed Doctor',
        email: doctor.email || '',
        phone: doctor.phone || '',
        gender: doctor.gender || '',
        registrationNumber: doctor.registrationNumber || '',
        doctorType: doctor.doctorType || 'General Physician',
        specialties: doctor.specialties || [],
        diseases: doctor.diseases || [],
        experience: doctor.experience || '0',
        clinicName: doctor.clinicName || 'No Clinic Specified',
        clinicAddress: doctor.clinicAddress || '',
        state: doctor.state || '',
        city: doctor.city || '',
        pincode: doctor.pincode || '',
        profileImage: doctor.profileImage || '/placeholder-doctor.jpg',
        status: doctor.status || 'Pending',
        createdAt: doctor.createdAt || '',
        updatedAt: doctor.updatedAt || '',
        rating: doctor.rating || 4.5,
        reviewCount: doctor.reviewCount || 15
      }));
      
      setDoctors(transformedDoctors);
      setFilteredDoctors(transformedDoctors);
      setLoading(false);
    }
  }, [doctorsData, isLoading, isError, apiError]);

  // Filter and sort doctors
  useEffect(() => {
    let result = [...doctors];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(doctor => 
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doctor.specialties && doctor.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }
    
    // Apply specialty filter
    if (selectedSpecialty !== 'all') {
      result = result.filter(doctor => 
        doctor.specialties && doctor.specialties.some(specialty => 
          specialty.toLowerCase() === selectedSpecialty.toLowerCase()
        )
      );
    }
    
    // Apply location filter
    if (locationFilter !== 'all') {
      result = result.filter(doctor => 
        doctor.city && doctor.city.toLowerCase() === locationFilter.toLowerCase()
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'experience-high':
        result.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return 0;
        });
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    
    setFilteredDoctors(result);
  }, [searchTerm, selectedSpecialty, sortBy, doctors, locationFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('all');
    setSortBy('featured');
    setLocationFilter('all');
  };

  const activeFiltersCount = [
    searchTerm ? 1 : 0,
    selectedSpecialty !== 'all' ? 1 : 0,
    sortBy !== 'featured' ? 1 : 0,
    locationFilter !== 'all' ? 1 : 0
  ].reduce((sum, val) => sum + val, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-muted rounded-3xl mb-12"></div>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/4">
                <div className="bg-card rounded-2xl p-6 shadow-lg h-96"></div>
              </div>
              <div className="lg:w-3/4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-card rounded-2xl h-96 shadow-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 flex items-center justify-center">
        <div className="text-center bg-card p-8 rounded-3xl shadow-xl max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Error Loading Doctors</h2>
          <p className="text-muted-foreground mb-8">{errorState}</p>
          <Button onClick={() => window.location.reload()} className="w-full rounded-full py-6 text-lg">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold font-headline mb-4 text-foreground">
              Find & Book Doctors Near You
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Instant appointments with verified doctors. Read reviews and book online.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-4xl mx-auto relative">
              <div className="relative rounded-xl shadow-xl bg-card border border-border overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 flex items-center border-r-0 md:border-r border-b md:border-b-0 border-border">
                    <Search className="absolute left-4 h-5 w-5 text-muted-foreground ml-2" />
                    <Input
                      placeholder="Search doctors, specialties, clinics..."
                      className="pl-12 pr-4 py-6 text-base rounded-none border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 flex items-center border-t md:border-t-0 border-border relative">
                    <MapPin className="absolute left-4 h-5 w-5 text-muted-foreground ml-2" />
                    <Input
                      placeholder="Location"
                      className="pl-12 pr-4 py-6 text-base rounded-none border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                      value={locationFilter === 'all' ? '' : locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value || 'all')}
                    />
                  </div>
                  <div className="bg-primary flex items-center justify-center p-2">
                    <Button className="rounded-none h-full rounded-r-xl px-6 py-4 text-base font-medium">
                      Search
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 pb-16">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">
              Doctors <span className="text-muted-foreground">({filteredDoctors.length})</span>
            </h2>
            {activeFiltersCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full px-3 text-xs"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">View:</span>
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'} 
                size="icon"
                className="rounded-full"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'} 
                size="icon"
                className="rounded-full"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              variant="outline"
              className="rounded-full flex items-center gap-2"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="bg-card rounded-2xl p-6 mb-8 shadow-lg border border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Specialty
                </h3>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="all" value="all">
                      All Specialties
                    </SelectItem>
                    {allSpecializations.map((specialty) => (
                      <SelectItem key={specialty} value={specialty.toLowerCase()}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </h3>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {Array.from(new Set(doctors.map(d => d.city))).filter(city => city).map((city) => (
                      <SelectItem key={city} value={city || ''}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Sort By</h3>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="experience-high">Experience: High to Low</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full rounded-full"
                  onClick={clearFilters}
                >
                  Reset All
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Doctors Grid/List */}
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl shadow-lg border border-border/50">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">No doctors found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Try adjusting your filters to see more doctors</p>
            <Button 
              onClick={clearFilters}
              className="rounded-full px-8 py-6"
            >
              Clear All Filters
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredDoctors.map((doctor) => (
              <div 
                key={doctor._id} 
                className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group"
              >
                <div className="p-6">
                  <div className="flex items-start gap-5">
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-md">
                        {doctor.profileImage ? (
                          <img 
                            src={doctor.profileImage} 
                            alt={doctor.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl font-bold text-primary">
                            {doctor.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <Star className="h-3 w-3 fill-current" />
                        {doctor.rating}
                      </div>
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <h3 className="font-bold text-lg truncate text-foreground">{doctor.name}</h3>
                      <p className="text-muted-foreground text-sm mb-2 truncate">{doctor.doctorType}</p>
                      <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate">{doctor.city}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <UserCheck className="h-4 w-4 mr-1 text-primary flex-shrink-0" />
                          <span className="font-medium">{doctor.experience}y exp</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {doctor.reviewCount} reviews
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4 mb-5 md:line-clamp-1 md:h-6">
                    {doctor.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="rounded-full px-3 py-1 text-xs hover:bg-primary/20 transition-colors">
                        {specialty}
                      </Badge>
                    ))}
                    {doctor.specialties.length > 3 && (
                      <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs hover:bg-primary/20 transition-colors">
                        +{doctor.specialties.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Link href={`/doctors/${doctor._id}`}>
                        <Button className="w-full rounded-sm py-2.5 text-sm h-10" variant="outline">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                    <Button className="flex-1 rounded-sm py-2.5 text-sm h-10 text-white">
                      Book Appointment
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDoctors.map((doctor) => (
              <div 
                key={doctor._id} 
                className="bg-card rounded-2xl p-5 shadow-lg border border-border/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-md">
                        {doctor.profileImage ? (
                          <img 
                            src={doctor.profileImage} 
                            alt={doctor.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-primary">
                            {doctor.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        {doctor.rating}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{doctor.name}</h3>
                        <p className="text-muted-foreground text-sm mb-1">{doctor.doctorType}</p>
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                          <span>{doctor.clinicName}, {doctor.city}</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <UserCheck className="h-3.5 w-3.5 mr-1 text-primary flex-shrink-0" />
                          <span className="font-medium">{doctor.experience}+ years experience</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button className="rounded-sm px-4 py-1.5 text-sm h-8 bg-blue-600 hover:bg-blue-700 text-white">
                          Book Appointment
                        </Button>
                        <div>
                          <Link href={`/doctors/${doctor._id}`}>
                            <Button variant="outline" className="rounded-sm px-4 py-1.5 text-sm h-8">
                              View Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {doctor.specialties.slice(0, 4).map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="rounded-full px-2 py-0.5 text-xs hover:bg-primary/20 transition-colors">
                          {specialty}
                        </Badge>
                      ))}
                      {doctor.specialties.length > 4 && (
                        <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs hover:bg-primary/20 transition-colors">
                          +{doctor.specialties.length - 4} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span>Available today • Next: 2:30 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}