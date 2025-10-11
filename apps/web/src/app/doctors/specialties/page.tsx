"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Input } from '@repo/ui/input';
import { Search, Stethoscope, Heart, Brain, Eye, Bone, Baby, Users, Star, Clock } from 'lucide-react';
import Link from 'next/link';

interface Specialty {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  doctorCount: number;
  averageRating: number;
  averageConsultationFee: number;
  commonConditions: string[];
  featured: boolean;
}

const specialties: Specialty[] = [
  {
    id: "dermatology",
    name: "Dermatology",
    description: "Skin, hair, and nail conditions. Treatment for acne, eczema, psoriasis, skin cancer screening.",
    icon: Heart,
    doctorCount: 15,
    averageRating: 4.8,
    averageConsultationFee: 200,
    commonConditions: ["Acne", "Eczema", "Psoriasis", "Skin Cancer", "Hair Loss"],
    featured: true
  },
  {
    id: "cardiology",
    name: "Cardiology",
    description: "Heart and cardiovascular system disorders. Heart disease, hypertension, arrhythmias.",
    icon: Heart,
    doctorCount: 12,
    averageRating: 4.9,
    averageConsultationFee: 300,
    commonConditions: ["Heart Disease", "Hypertension", "Arrhythmia", "Chest Pain", "Heart Attack"],
    featured: true
  },
  {
    id: "neurology",
    name: "Neurology",
    description: "Brain and nervous system disorders. Migraines, epilepsy, stroke, Parkinson's disease.",
    icon: Brain,
    doctorCount: 8,
    averageRating: 4.7,
    averageConsultationFee: 350,
    commonConditions: ["Migraines", "Epilepsy", "Stroke", "Parkinson's", "Memory Loss"],
    featured: true
  },
  {
    id: "ophthalmology",
    name: "Ophthalmology",
    description: "Eye and vision disorders. Cataracts, glaucoma, retinal diseases, vision correction.",
    icon: Eye,
    doctorCount: 10,
    averageRating: 4.6,
    averageConsultationFee: 180,
    commonConditions: ["Cataracts", "Glaucoma", "Macular Degeneration", "Dry Eyes", "Vision Problems"],
    featured: false
  },
  {
    id: "orthopedics",
    name: "Orthopedics",
    description: "Bones, joints, muscles, and ligaments. Sports injuries, arthritis, fractures.",
    icon: Bone,
    doctorCount: 18,
    averageRating: 4.5,
    averageConsultationFee: 250,
    commonConditions: ["Arthritis", "Sports Injuries", "Fractures", "Back Pain", "Joint Pain"],
    featured: false
  },
  {
    id: "pediatrics",
    name: "Pediatrics",
    description: "Medical care for infants, children, and adolescents. Growth, development, vaccinations.",
    icon: Baby,
    doctorCount: 14,
    averageRating: 4.8,
    averageConsultationFee: 150,
    commonConditions: ["Vaccinations", "Growth Issues", "Infections", "Allergies", "Behavioral Issues"],
    featured: false
  },
  {
    id: "general-medicine",
    name: "General Medicine",
    description: "Primary healthcare and preventive medicine. Routine checkups, common illnesses.",
    icon: Stethoscope,
    doctorCount: 25,
    averageRating: 4.7,
    averageConsultationFee: 120,
    commonConditions: ["Cold & Flu", "Diabetes", "High Blood Pressure", "Routine Checkup", "Preventive Care"],
    featured: true
  },
  {
    id: "psychiatry",
    name: "Psychiatry",
    description: "Mental health disorders. Depression, anxiety, ADHD, bipolar disorder, therapy.",
    icon: Brain,
    doctorCount: 9,
    averageRating: 4.6,
    averageConsultationFee: 200,
    commonConditions: ["Depression", "Anxiety", "ADHD", "Bipolar Disorder", "PTSD"],
    featured: false
  }
];

export default function DoctorSpecialtiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const filteredSpecialties = useMemo(() => {
    let filtered = specialties.filter(specialty => {
      const matchesSearch = specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          specialty.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          specialty.commonConditions.some(condition => 
                            condition.toLowerCase().includes(searchTerm.toLowerCase())
                          );
      return matchesSearch;
    });

    if (showFeaturedOnly) {
      filtered = filtered.filter(specialty => specialty.featured);
    }

    return filtered;
  }, [specialties, searchTerm, showFeaturedOnly]);

  const featuredSpecialties = specialties.filter(s => s.featured);
  const totalDoctors = specialties.reduce((sum, s) => sum + s.doctorCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Specialties</h1>
          <p className="text-gray-600 mt-2">Find doctors by their area of expertise</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{specialties.length}</p>
                  <p className="text-sm text-gray-600">Specialties Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalDoctors}</p>
                  <p className="text-sm text-gray-600">Qualified Doctors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">4.7</p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search specialties or conditions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={showFeaturedOnly ? "default" : "outline"}
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            >
              Featured Only
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Specialties */}
      {!showFeaturedOnly && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Featured Specialties
            </CardTitle>
            <CardDescription>
              Our most popular medical specialties with top-rated doctors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredSpecialties.map((specialty) => {
                const IconComponent = specialty.icon;
                return (
                  <Card key={specialty.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{specialty.name}</h3>
                          <p className="text-sm text-gray-600">{specialty.doctorCount} doctors</p>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{specialty.averageRating}</span>
                        </div>
                        <Button size="sm" className="w-full" asChild>
                          <Link href={`/doctors?specialty=${specialty.id}`}>
                            Find Doctors
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Specialties */}
      <Card>
        <CardHeader>
          <CardTitle>All Medical Specialties</CardTitle>
          <CardDescription>
            Browse all available specialties and find the right doctor for your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredSpecialties.map((specialty) => {
              const IconComponent = specialty.icon;
              return (
                <Card key={specialty.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              {specialty.name}
                              {specialty.featured && (
                                <Badge variant="secondary" className="text-xs">Featured</Badge>
                              )}
                            </h3>
                            <p className="text-gray-600 mt-1">{specialty.description}</p>
                          </div>
                          <Button asChild>
                            <Link href={`/doctors?specialty=${specialty.id}`}>
                              Find Doctors
                            </Link>
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {specialty.doctorCount} doctors
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {specialty.averageRating} rating
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            From ${specialty.averageConsultationFee}
                          </span>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-2">Common conditions treated:</p>
                          <div className="flex flex-wrap gap-1">
                            {specialty.commonConditions.map((condition) => (
                              <Badge key={condition} variant="outline" className="text-xs">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {filteredSpecialties.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No specialties found matching your search</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}