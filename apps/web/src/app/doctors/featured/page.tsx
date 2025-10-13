"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Star, Award, Stethoscope, User, Calendar, Video, MapPin, Clock, Medal } from 'lucide-react';
import Link from 'next/link';

interface FeaturedDoctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  videoConsultation: boolean;
  specialAchievements: string[];
  education: string[];
  clinicName: string;
  clinicAddress: string;
  profileImage?: string;
  availability: string[];
  specializations: string[];
  awards: string[];
  featuredReason: string;
}

const featuredDoctors: FeaturedDoctor[] = [
  {
    id: "DR-001",
    name: "Dr. Sarah Johnson",
    specialty: "Dermatology",
    experience: "8 years",
    rating: 4.9,
    reviewCount: 156,
    consultationFee: 200,
    videoConsultation: true,
    specialAchievements: ["Board Certified Dermatologist", "Acne Treatment Specialist", "Cosmetic Dermatology Expert"],
    education: ["MD from Harvard Medical School", "Dermatology Residency at Mayo Clinic"],
    clinicName: "Elite Skin Care Center",
    clinicAddress: "123 Medical Plaza, Downtown",
    availability: ["Monday-Friday", "Weekend Emergency"],
    specializations: ["Acne Treatment", "Anti-aging", "Skin Cancer Screening", "Cosmetic Procedures"],
    awards: ["Top Dermatologist 2023", "Patient Choice Award", "Excellence in Cosmetic Dermatology"],
    featuredReason: "Highest patient satisfaction in dermatology with 4.9/5 rating"
  },
  {
    id: "DR-002", 
    name: "Dr. Michael Chen",
    specialty: "Cardiology",
    experience: "15 years",
    rating: 4.8,
    reviewCount: 289,
    consultationFee: 300,
    videoConsultation: true,
    specialAchievements: ["Interventional Cardiologist", "Heart Disease Prevention Expert", "Clinical Research Leader"],
    education: ["MD from Johns Hopkins", "Cardiology Fellowship at Cleveland Clinic"],
    clinicName: "Heart & Vascular Institute",
    clinicAddress: "456 Health Center Blvd, Medical District",
    availability: ["Monday-Saturday", "24/7 Emergency"],
    specializations: ["Heart Disease", "Preventive Cardiology", "Interventional Procedures", "Heart Failure"],
    awards: ["Cardiology Excellence Award 2023", "Research Innovation Award", "Top Doctor Recognition"],
    featuredReason: "Leading cardiologist with breakthrough research in heart disease prevention"
  },
  {
    id: "DR-003",
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    experience: "12 years",
    rating: 4.9,
    reviewCount: 203,
    consultationFee: 180,
    videoConsultation: true,
    specialAchievements: ["Pediatric Board Certified", "Child Development Specialist", "Vaccination Expert"],
    education: ["MD from Stanford Medical School", "Pediatrics Residency at Children's Hospital"],
    clinicName: "Children's Health Center",
    clinicAddress: "789 Family Care Way, Pediatric District",
    availability: ["Monday-Friday", "Saturday Morning"],
    specializations: ["Child Development", "Vaccinations", "Pediatric Emergencies", "Adolescent Health"],
    awards: ["Best Pediatrician 2023", "Compassionate Care Award", "Child Advocacy Recognition"],
    featuredReason: "Exceptional care for children with specialized expertise in development"
  },
  {
    id: "DR-004",
    name: "Dr. Robert Kim",
    specialty: "Orthopedics",
    experience: "18 years",
    rating: 4.7,
    reviewCount: 334,
    consultationFee: 250,
    videoConsultation: false,
    specialAchievements: ["Sports Medicine Specialist", "Joint Replacement Expert", "Minimally Invasive Surgery"],
    education: ["MD from UCLA Medical School", "Orthopedic Surgery Residency at HSS"],
    clinicName: "Advanced Orthopedic Center",
    clinicAddress: "321 Sports Medicine Drive, Athletic District",
    availability: ["Monday-Friday", "Emergency On-call"],
    specializations: ["Sports Injuries", "Joint Replacement", "Spine Surgery", "Trauma Surgery"],
    awards: ["Orthopedic Surgeon of the Year", "Innovation in Surgery Award", "Patient Safety Excellence"],
    featuredReason: "Premier orthopedic surgeon specializing in advanced surgical techniques"
  }
];

export default function FeaturedDoctorsPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<FeaturedDoctor | null>(null);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Award className="h-8 w-8 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Featured Doctors</h1>
          <p className="text-gray-600 mt-2">Meet our top-rated medical professionals recognized for excellence</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Medal className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold">{featuredDoctors.length}</p>
              <p className="text-sm text-gray-600">Featured Doctors</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold">
                {(featuredDoctors.reduce((sum, doc) => sum + doc.rating, 0) / featuredDoctors.length).toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">Average Rating</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">
                {featuredDoctors.reduce((sum, doc) => sum + doc.reviewCount, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Stethoscope className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold">
                {Array.from(new Set(featuredDoctors.map(doc => doc.specialty))).length}
              </p>
              <p className="text-sm text-gray-600">Specialties</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Featured Doctors Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {featuredDoctors.map((doctor) => (
          <Card key={doctor.id} className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{doctor.name}</CardTitle>
                      <CardDescription className="text-base font-medium text-primary">
                        {doctor.specialty}
                      </CardDescription>
                      <p className="text-sm text-gray-600 mt-1">{doctor.experience} experience</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      <Award className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2">
                    {renderStars(doctor.rating)}
                    <span className="font-semibold">{doctor.rating}</span>
                    <span className="text-sm text-gray-600">({doctor.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Featured Reason */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                  <Medal className="h-4 w-4" />
                  Why Featured?
                </p>
                <p className="text-sm text-yellow-700 mt-1">{doctor.featuredReason}</p>
              </div>

              {/* Key Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Consultation Fee</p>
                  <p className="font-semibold text-green-600">${doctor.consultationFee}</p>
                </div>
                <div>
                  <p className="text-gray-600">Clinic</p>
                  <p className="font-semibold">{doctor.clinicName}</p>
                </div>
              </div>

              {/* Specializations */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Specializations</p>
                <div className="flex flex-wrap gap-1">
                  {doctor.specializations.slice(0, 3).map((spec) => (
                    <Badge key={spec} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                  {doctor.specializations.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{doctor.specializations.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Awards */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Recent Awards</p>
                <div className="space-y-1">
                  {doctor.awards.slice(0, 2).map((award) => (
                    <div key={award} className="flex items-center gap-2 text-xs text-gray-600">
                      <Award className="h-3 w-3 text-yellow-500" />
                      {award}
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {doctor.videoConsultation && (
                  <span className="flex items-center gap-1">
                    <Video className="h-4 w-4 text-green-600" />
                    Video Call
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  In-person
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {doctor.availability[0]}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" asChild>
                  <Link href={`/doctors/appointments?doctor=${doctor.id}`}>
                    Book Appointment
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/doctors/${doctor.id}`}>
                    View Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recognition Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            How Doctors Earn Featured Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">High Ratings</h3>
              <p className="text-sm text-gray-600">Maintain 4.7+ average rating from patients</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Patient Volume</h3>
              <p className="text-sm text-gray-600">Serve high number of satisfied patients</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Medal className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Credentials</h3>
              <p className="text-sm text-gray-600">Board certification and advanced training</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Stethoscope className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Innovation</h3>
              <p className="text-sm text-gray-600">Use of advanced techniques and research</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Can't Decide Which Doctor to Choose?</h2>
          <p className="text-gray-600 mb-6">
            Our featured doctors represent the best in their specialties. Book a consultation with any of them 
            for exceptional medical care and patient experience.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/doctors/appointments">
                Book with Featured Doctor
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/doctors">
                Browse All Doctors
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}