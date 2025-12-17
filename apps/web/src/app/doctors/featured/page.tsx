"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Star, Award, User } from 'lucide-react';
import Link from 'next/link';
import { useGetPublicDoctorsQuery } from '@repo/store/services/api';

interface Doctor {
  _id: string;
  id?: string;
  name: string;
  specialty?: string;
  experience?: number;
  rating?: number;
  consultationFee?: number;
  clinicName?: string;
  profileImage?: string;
  specialties?: string[];
  totalReviews?: number;
}

// Function to sort doctors by rating and review count
const getTopRatedDoctors = (doctors: any[]): Doctor[] => {
  // Transform and sort doctors by rating (descending) and totalReviews (descending)
  const transformedDoctors = doctors.map((doc: any) => ({
    _id: doc._id,
    id: doc.id || doc._id,
    name: doc.name,
    specialty: doc.doctorType || (doc.specialties && doc.specialties[0]),
    experience: typeof doc.experience === 'string' ? parseInt(doc.experience) : doc.experience,
    rating: doc.rating,
    consultationFee: doc.consultationFee,
    clinicName: doc.clinicName,
    profileImage: doc.profileImage,
    specialties: doc.specialties,
    totalReviews: doc.totalReviews
  }));

  // Sort by rating first, then by total reviews for tie-breaking
  return transformedDoctors
    .sort((a, b) => {
      // First sort by rating (higher rating first)
      if (b.rating !== a.rating) {
        return (b.rating || 0) - (a.rating || 0);
      }
      // If ratings are equal, sort by total reviews (more reviews first)
      return (b.totalReviews || 0) - (a.totalReviews || 0);
    })
    .slice(0, 2); // Take only top 2
};

export default function FeaturedDoctorsPage() {
  // Fetch real doctor data instead of using static data
  const { data: doctorsData, isLoading, isError } = useGetPublicDoctorsQuery(undefined);
  
  // Get top 2 doctors based on ratings and review counts
  const featuredDoctors: Doctor[] = doctorsData 
    ? getTopRatedDoctors(doctorsData)
    : [];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading featured doctors...</p>
        </div>
      </div>
    );
  }

  if (isError || featuredDoctors.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-10">
          <div className="bg-gray-100 text-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <span className="text-2xl font-bold">!</span>
          </div>
          <p className="mt-4 text-gray-600">No featured doctors available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Award className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Doctors</h1>
          <p className="text-gray-600 mt-1">Meet our top-rated medical professionals</p>
        </div>
      </div>

      {/* Featured Doctors Grid - Simplified Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {featuredDoctors.map((doctor) => (
          <Card key={doctor.id} className="group relative overflow-hidden rounded-md hover:shadow-lg border bg-white transition-all duration-300 hover:-translate-y-1">
            {/* Upper Half: Doctor Image - Reduced size */}
            <div className="aspect-[3/2] relative w-full overflow-hidden bg-gray-50" style={{ maxHeight: '180px' }}>
              {doctor.profileImage ? (
                <img
                  src={doctor.profileImage}
                  alt={doctor.name}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-10 w-10 text-gray-400" />
                </div>
              )}
              
              {/* Rating Badge */}
              <Badge 
                variant="default"
                className="absolute top-2 left-2 bg-blue-500 text-white border-0 text-xs px-2 py-0.5 rounded-full font-medium"
              >
                <Star className="h-3 w-3 mr-1 fill-white" />
                {doctor.rating?.toFixed(1)}
              </Badge>
              
              {/* Featured Badge */}
              <Badge className="absolute top-2 right-2 bg-blue-100 text-blue-800 border-blue-300 text-xs px-2 py-0.5 rounded-full font-medium">
                <Award className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>

            {/* Lower Half: Details */}
            <div className="p-4 flex flex-col justify-between h-fit bg-white">
              <div>
                {/* Doctor Header */}
                <div className="mb-3">
                  <h3 className="text-base font-bold text-gray-900 mb-0.5 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {doctor.name}
                  </h3>
                  <p className="text-xs text-blue-600 font-semibold line-clamp-1 mb-1">
                    {doctor.experience} years experience • {doctor.specialty}
                  </p>
                  {doctor.clinicName && (
                    <p className="text-xs text-gray-600 line-clamp-1">
                      {doctor.clinicName}
                    </p>
                  )}
                  {doctor.totalReviews && (
                    <p className="text-[10px] text-gray-500 mt-1">
                      {doctor.totalReviews} reviews
                    </p>
                  )}
                </div>

                {/* Specialties Badges - Limited to 2 */}
                {doctor.specialties && doctor.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {doctor.specialties.slice(0, 2).map((specialty, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border-0"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  asChild
                  size="sm"
                  className="text-xs"
                  variant="outline"
                >
                  <Link href={`/doctors/${doctor.id}`}>
                    View Profile
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="text-xs bg-blue-600 hover:bg-blue-700"
                >
                  <Link href={`/doctors/appointments?doctor=${doctor.id}`}>
                    Book Now
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Simple Info Section */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Why Our Doctors Are Featured</h2>
        <p className="text-gray-600 text-sm">
          Our featured doctors are selected based on their high patient ratings, extensive experience, 
          and proven track record of delivering exceptional care.
        </p>
      </div>
    </div>
  );
}