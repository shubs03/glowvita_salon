"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { 
  Video, 
  Clock, 
  Calendar, 
  User, 
  Star, 
  Phone, 
  MessageSquare, 
  Search, 
  Filter,
  CheckCircle,
  Shield,
  Monitor,
  Users,
  ArrowRight
} from 'lucide-react';
import { cn } from '@repo/ui/cn';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  totalReviews: number;
  fee: number;
  image: string;
  languages: string[];
  availableSlots: string[];
  isOnline: boolean;
}

const sampleDoctors: Doctor[] = [
  {
    id: "DR-001",
    name: "Dr. Sarah Johnson",
    specialty: "Dermatology",
    experience: 8,
    rating: 4.9,
    totalReviews: 234,
    fee: 150,
    image: "/images/doctors/dr-sarah.jpg",
    languages: ["English", "Spanish"],
    availableSlots: ["10:00 AM", "2:30 PM", "4:00 PM"],
    isOnline: true
  },
  {
    id: "DR-002",
    name: "Dr. Michael Chen",
    specialty: "General Medicine",
    experience: 12,
    rating: 4.8,
    totalReviews: 156,
    fee: 120,
    image: "/images/doctors/dr-michael.jpg",
    languages: ["English", "Mandarin"],
    availableSlots: ["9:00 AM", "11:30 AM", "3:00 PM"],
    isOnline: true
  },
  {
    id: "DR-003",
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    experience: 6,
    rating: 4.9,
    totalReviews: 189,
    fee: 140,
    image: "/images/doctors/dr-emily.jpg",
    languages: ["English", "Spanish"],
    availableSlots: ["8:30 AM", "1:00 PM", "5:00 PM"],
    isOnline: false
  },
  {
    id: "DR-004",
    name: "Dr. James Wilson",
    specialty: "Cardiology",
    experience: 15,
    rating: 4.7,
    totalReviews: 298,
    fee: 200,
    image: "/images/doctors/dr-james.jpg",
    languages: ["English"],
    availableSlots: ["10:30 AM", "2:00 PM"],
    isOnline: true
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
  "Gynecology"
];

export default function VideoConsultationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedFeeRange, setSelectedFeeRange] = useState('All');

  const filteredDoctors = sampleDoctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All Specialties' || doctor.specialty === selectedSpecialty;
    const matchesFeeRange = selectedFeeRange === 'All' || 
                           (selectedFeeRange === 'Under $150' && doctor.fee < 150) ||
                           (selectedFeeRange === '$150-$200' && doctor.fee >= 150 && doctor.fee <= 200) ||
                           (selectedFeeRange === 'Over $200' && doctor.fee > 200);
    
    return matchesSearch && matchesSpecialty && matchesFeeRange;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
        <div className="container mx-auto px-4 max-w-7xl relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              Video Consultation Available
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-6">
              Video Consultation with Expert Doctors
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Connect with certified doctors from the comfort of your home. Get professional medical advice through secure video calls.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">HD Video Quality</span>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <span className="text-sm font-medium">Secure & Private</span>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <span className="text-sm font-medium">24/7 Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedFeeRange} onValueChange={setSelectedFeeRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Fee range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Fees</SelectItem>
                  <SelectItem value="Under $150">Under $150</SelectItem>
                  <SelectItem value="$150-$200">$150-$200</SelectItem>
                  <SelectItem value="Over $200">Over $200</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors List */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Available Doctors ({filteredDoctors.length})</h2>
            <p className="text-muted-foreground">Choose from our verified doctors for video consultation</p>
          </div>

          <div className="grid gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Doctor Info */}
                    <div className="flex gap-4 flex-1">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                          <User className="h-10 w-10 text-primary" />
                        </div>
                        {doctor.isOnline && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold">{doctor.name}</h3>
                            <p className="text-primary font-medium">{doctor.specialty}</p>
                          </div>
                          <Badge className={cn(
                            "ml-2",
                            doctor.isOnline 
                              ? "bg-green-500/10 text-green-500 border-green-500/20" 
                              : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                          )}>
                            {doctor.isOnline ? "Online" : "Offline"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {doctor.rating} ({doctor.totalReviews} reviews)
                          </span>
                          <span>{doctor.experience} years experience</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {doctor.languages.map((language) => (
                            <Badge key={language} variant="outline" className="text-xs">
                              {language}
                            </Badge>
                          ))}
                        </div>
                        
                        {doctor.isOnline && doctor.availableSlots.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Available slots today:</p>
                            <div className="flex flex-wrap gap-2">
                              {doctor.availableSlots.map((slot) => (
                                <Badge key={slot} variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {slot}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Consultation Options */}
                    <div className="lg:w-80 space-y-4">
                      <div className="text-center lg:text-right">
                        <p className="text-2xl font-bold">${doctor.fee}</p>
                        <p className="text-sm text-muted-foreground">Video consultation fee</p>
                      </div>
                      
                      <div className="space-y-3">
                        <Button 
                          className="w-full bg-primary hover:bg-primary/90" 
                          disabled={!doctor.isOnline}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          {doctor.isOnline ? "Start Video Call" : "Currently Offline"}
                        </Button>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" disabled={!doctor.isOnline}>
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </div>
                        
                        <Button variant="outline" className="w-full">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Later
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How Video Consultation Works</h2>
            <p className="text-lg text-muted-foreground">Simple steps to connect with your doctor</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Choose Doctor</h3>
              <p className="text-muted-foreground">Browse and select from our verified doctors based on specialty and availability</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Book Appointment</h3>
              <p className="text-muted-foreground">Select a convenient time slot or start an instant consultation if available</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Video Consultation</h3>
              <p className="text-muted-foreground">Connect with your doctor through secure video call and get professional advice</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}