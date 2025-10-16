"use client";

import { useState } from 'react';
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
  Stethoscope
} from 'lucide-react';
import { cn } from '@repo/ui/cn';
import Link from 'next/link';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  subSpecialty?: string;
  experience: number;
  rating: number;
  totalReviews: number;
  consultationFee: number;
  location: {
    clinic: string;
    address: string;
    distance: string;
  };
  education: string[];
  languages: string[];
  availableToday: boolean;
  nextAvailable: string;
  image: string;
  isVerified: boolean;
  hasVideoConsult: boolean;
  hasHomeVisit: boolean;
}

const sampleDoctors: Doctor[] = [
  {
    id: "DR-001",
    name: "Dr. Sarah Johnson",
    specialty: "Dermatology",
    subSpecialty: "Cosmetic Dermatology",
    experience: 8,
    rating: 4.9,
    totalReviews: 234,
    consultationFee: 150,
    location: {
      clinic: "GlowVita Skin Clinic",
      address: "123 Beauty Boulevard, Downtown",
      distance: "2.3 km"
    },
    education: ["MD - Harvard Medical School", "Fellowship - Johns Hopkins"],
    languages: ["English", "Spanish"],
    availableToday: true,
    nextAvailable: "Today 2:30 PM",
    image: "https://placehold.co/400x400/3B82F6/FFFFFF?text=Dr.+Sarah",
    isVerified: true,
    hasVideoConsult: true,
    hasHomeVisit: false
  },
  {
    id: "DR-002",
    name: "Dr. Michael Chen",
    specialty: "General Medicine",
    subSpecialty: "Family Medicine",
    experience: 12,
    rating: 4.8,
    totalReviews: 156,
    consultationFee: 120,
    location: {
      clinic: "HealthFirst Medical Center",
      address: "456 Wellness Way, Central District",
      distance: "1.8 km"
    },
    education: ["MBBS - Stanford University", "MD - UCLA"],
    languages: ["English", "Mandarin", "Cantonese"],
    availableToday: false,
    nextAvailable: "Tomorrow 9:00 AM",
    image: "https://placehold.co/400x400/10B981/FFFFFF?text=Dr.+Michael",
    isVerified: true,
    hasVideoConsult: true,
    hasHomeVisit: true
  },
  {
    id: "DR-003",
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    subSpecialty: "Child Development",
    experience: 6,
    rating: 4.9,
    totalReviews: 189,
    consultationFee: 140,
    location: {
      clinic: "Kids Care Pediatric Clinic",
      address: "789 Children's Lane, Suburbs",
      distance: "3.1 km"
    },
    education: ["MD - Yale School of Medicine", "Pediatric Residency - Boston Children's"],
    languages: ["English", "Spanish"],
    availableToday: true,
    nextAvailable: "Today 4:00 PM",
    image: "https://placehold.co/400x400/8B5CF6/FFFFFF?text=Dr.+Emily",
    isVerified: true,
    hasVideoConsult: false,
    hasHomeVisit: true
  },
  {
    id: "DR-004",
    name: "Dr. James Wilson",
    specialty: "Cardiology",
    subSpecialty: "Interventional Cardiology",
    experience: 15,
    rating: 4.7,
    totalReviews: 298,
    consultationFee: 200,
    location: {
      clinic: "Heart Specialists Center",
      address: "321 Cardiac Court, Medical District",
      distance: "4.2 km"
    },
    education: ["MD - Johns Hopkins", "Cardiology Fellowship - Mayo Clinic"],
    languages: ["English"],
    availableToday: false,
    nextAvailable: "Tomorrow 10:30 AM",
    image: "https://placehold.co/400x400/F97316/FFFFFF?text=Dr.+James",
    isVerified: true,
    hasVideoConsult: true,
    hasHomeVisit: false
  }
];

const specialties = [
  "All Specialties",
  "Dermatology",
  "General Medicine",
  "Pediatrics",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Gynecology",
  "Psychiatry",
  "Ophthalmology"
];

const locations = [
  "All Locations",
  "Downtown",
  "Central District", 
  "Suburbs",
  "Medical District",
  "North Side",
  "South Side"
];

export default function FindDoctorPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  const filteredDoctors = sampleDoctors
    .filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doctor.location.clinic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = selectedSpecialty === 'All Specialties' || doctor.specialty === selectedSpecialty;
      const matchesLocation = selectedLocation === 'All Locations' || 
                             doctor.location.address.toLowerCase().includes(selectedLocation.toLowerCase());
      const matchesAvailability = selectedAvailability === 'All' || 
                                 (selectedAvailability === 'Today' && doctor.availableToday) ||
                                 (selectedAvailability === 'Video' && doctor.hasVideoConsult) ||
                                 (selectedAvailability === 'Home Visit' && doctor.hasHomeVisit);
      
      return matchesSearch && matchesSpecialty && matchesLocation && matchesAvailability;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return b.experience - a.experience;
        case 'fee-low':
          return a.consultationFee - b.consultationFee;
        case 'fee-high':
          return b.consultationFee - a.consultationFee;
        case 'distance':
          return parseFloat(a.location.distance) - parseFloat(b.location.distance);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:20px_20px]" />
        </div>
        <div className="container mx-auto px-4 max-w-7xl relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              Find Your Perfect Doctor
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-6">
              Find the Best Doctors Near You
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Search and book appointments with verified, experienced doctors in your area. Choose from various specialties and consultation types.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground mb-10">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-500" />
                <span>Verified Doctors</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span>100% Satisfaction</span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-500" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Section */}
      <section className="py-12 -mt-12 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-background rounded-lg shadow-lg p-6 border border-border/50">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search doctors, specialties, or clinics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button className="h-12 bg-primary hover:bg-primary/90 text-base">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Results */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {filteredDoctors.length} Doctors Found
              </h2>
              <p className="text-muted-foreground">
                Showing results for "{searchTerm || 'all doctors'}"
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Availability" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Doctors</SelectItem>
                  <SelectItem value="Today">Available Today</SelectItem>
                  <SelectItem value="Video">Video Consult</SelectItem>
                  <SelectItem value="Home Visit">Home Visit</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                  <SelectItem value="fee-low">Fee: Low to High</SelectItem>
                  <SelectItem value="fee-high">Fee: High to Low</SelectItem>
                  <SelectItem value="distance">Nearest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="grid gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Doctor Info */}
                    <div className="flex gap-4 flex-1">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          {doctor.image ? (
                            <img 
                              src={doctor.image} 
                              alt={doctor.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-12 w-12 text-primary" />
                          )}
                        </div>
                        {doctor.isVerified && (
                          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
                            <Award className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold">{doctor.name}</h3>
                            <p className="text-primary font-medium text-lg">{doctor.specialty}</p>
                            {doctor.subSpecialty && (
                              <p className="text-sm text-muted-foreground">{doctor.subSpecialty}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {doctor.hasVideoConsult && (
                              <Badge variant="outline" className="text-xs py-1">
                                <Video className="h-3 w-3 mr-1" />
                                Video
                              </Badge>
                            )}
                            {doctor.hasHomeVisit && (
                              <Badge variant="outline" className="text-xs py-1">
                                <Navigation className="h-3 w-3 mr-1" />
                                Home Visit
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{doctor.rating}</span> 
                            <span>({doctor.totalReviews} reviews)</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            {doctor.experience} years exp.
                          </span>
                        </div>
                        
                        <div className="flex items-start gap-2 text-sm mb-3">
                          <Building className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">{doctor.location.clinic}</span>
                            <p className="text-muted-foreground">{doctor.location.address}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <Badge variant="outline" className="text-xs">
                            {doctor.location.distance} away
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {doctor.education.slice(0, 2).map((edu, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/15">
                              {edu}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {doctor.languages.map((language) => (
                            <Badge key={language} variant="outline" className="text-xs">
                              {language}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className={cn(
                            "font-medium",
                            doctor.availableToday ? "text-green-600" : "text-orange-600"
                          )}>
                            {doctor.nextAvailable}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Booking Section */}
                    <div className="lg:w-80 space-y-4 border-l border-border/50 pl-6 lg:pl-0 lg:border-l-0 lg:border-t lg:border-t-border/50 lg:pt-6 lg:mt-4">
                      <div className="text-center lg:text-right">
                        <p className="text-3xl font-bold text-primary">${doctor.consultationFee}</p>
                        <p className="text-sm text-muted-foreground">Consultation fee</p>
                      </div>
                      
                      <div className="space-y-3">
                        <Button className="w-full bg-primary hover:bg-primary/90 h-11 text-base">
                          <Calendar className="h-5 w-5 mr-2" />
                          Book Appointment
                        </Button>
                        
                        {doctor.hasVideoConsult && (
                          <Button variant="outline" className="w-full h-11 text-base">
                            <Video className="h-5 w-5 mr-2" />
                            Video Consultation
                          </Button>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" className="h-9">
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                          <Button variant="outline" size="sm" className="h-9" asChild>
                            <Link href={`/doctors/${doctor.id}`}>
                              View Profile
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No doctors found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Try adjusting your search criteria or filters to find the right doctor for you.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('All Specialties');
                  setSelectedLocation('All Locations');
                  setSelectedAvailability('All');
                }}
                className="h-11 px-6"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Need Help Finding the Right Doctor?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Our medical concierge team can help you find the perfect doctor based on your specific needs and preferences. Get personalized recommendations today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 h-12 bg-primary hover:bg-primary/90 text-base">
                <Phone className="h-5 w-5 mr-2" />
                Call Support
              </Button>
              <Button variant="outline" size="lg" className="px-8 h-12 text-base border-primary/30 hover:border-primary/50">
                Request Callback
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}