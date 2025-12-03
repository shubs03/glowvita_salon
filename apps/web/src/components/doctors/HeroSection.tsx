"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Search, Calendar, Stethoscope, MapPin } from "lucide-react";
import Link from "next/link";
import { useGetPublicDoctorsQuery } from '@repo/store/services/api';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function HeroSection() {
  const router = useRouter();
  const { data: doctorsData, isLoading, isError } = useGetPublicDoctorsQuery(undefined);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    if (doctorsData && doctorsData.length > 0) {
      // Extract all unique specialties from doctors
      const specialtiesSet = new Set<string>();
      doctorsData.forEach((doctor: any) => {
        // Add doctorType if it exists
        if (doctor.doctorType && doctor.doctorType.trim()) {
          specialtiesSet.add(doctor.doctorType.trim());
        }
        
        // Add specialties from specialties array if it exists
        if (doctor.specialties && doctor.specialties.length > 0) {
          doctor.specialties.forEach((specialty: string) => {
            if (specialty && specialty.trim()) {
              specialtiesSet.add(specialty.trim());
            }
          });
        }
      });
      
      // Convert to array
      const uniqueSpecialties = Array.from(specialtiesSet);
      setSpecialties(uniqueSpecialties);
    }
  }, [doctorsData]);

  // Duplicate specialties for seamless marquee effect
  const marqueeSpecialties = [...specialties, ...specialties];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/doctors/find-doctor?search=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push('/doctors/find-doctor');
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:20px_20px]" />
      <div className="container mx-auto px-4 py-16 lg:py-24 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-6">
            Find Your{" "}
            <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
              Perfect Doctor
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Connect with qualified doctors, book appointments instantly, and get expert medical care from the comfort of your home.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <form onSubmit={handleSearch}>
              <div className="bg-white rounded-md shadow-lg border border-border/50 overflow-hidden">
                <div className="flex items-center p-2">
                  <div className="flex items-center flex-1">
                    <Search className="h-5 w-5 text-muted-foreground mx-3" />
                    <Input
                      placeholder="Search doctors, specialties, or clinics"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base bg-transparent placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div className="p-1">
                    <Button type="submit" className="px-8 py-3 text-base rounded-md">
                      Search
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10 max-w-4xl mx-auto">
            <Button
              asChild
              size="lg"
              className="px-8 py-4 rounded-md font-semibold text-base bg-blue-500"
            >
              <Link href="/doctors/find-doctor" className="flex items-center gap-3">
                <Stethoscope className="h-4 w-4" />
                Browse Doctors
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-4 rounded-md font-semibold text-base border-2 border-primary/30 hover:border-primary/50 bg-transparent hover:bg-primary/5 text-primary transition-all duration-300"
            >
              <Link href="/doctors/find-doctor" className="flex items-center gap-3">
                <Stethoscope className="h-4 w-4" />
                Browse Specialities
              </Link>
            </Button>
          </div>

          {/* Popular Specialties - Scrolling Strip */}
          <div className="max-w-full mx-auto">
            <p className="text-sm font-medium text-muted-foreground mb-2 text-center">
              Explore top medical specialties and find the right experts for your healthcare needs instantly.
            </p>
            <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-background to-primary/5 rounded-2xl py-4">
              {/* Left fade effect */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none"></div>
              {/* Right fade effect */}
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none"></div>
              
              <div className="flex animate-marquee hover:pause-marquee">
                {isLoading ? (
                  // Show loading state with 14 placeholder items to match original
                  <>
                    {[...Array(14)].map((_, index) => (
                      <div key={`loading-${index}`} className="flex-shrink-0 mx-3">
                        <div className="px-6 py-3 bg-gradient-to-r from-white/80 to-white/60 border border-primary/15 rounded-full text-sm font-medium text-primary/90 whitespace-nowrap backdrop-blur-sm animate-pulse">
                          <div className="h-4 w-20 bg-primary/20 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : isError ? (
                  // Show error state with 14 placeholder items to match original
                  <>
                    {[...Array(14)].map((_, index) => (
                      <div key={`error-${index}`} className="flex-shrink-0 mx-3">
                        <div className="px-6 py-3 bg-gradient-to-r from-white/80 to-white/60 border border-primary/15 rounded-full text-sm font-medium text-primary/90 whitespace-nowrap backdrop-blur-sm">
                          <div className="h-4 w-20 bg-red-100 rounded text-red-500 text-xs flex items-center justify-center">
                            Error
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : marqueeSpecialties.length > 0 ? (
                  // Show actual specialties from doctors data without links
                  marqueeSpecialties.map((specialty, index) => (
                    <div
                      key={`${specialty}-${index}`}
                      className="flex-shrink-0 mx-3"
                    >
                      <div className="px-6 py-3 bg-gradient-to-r from-white/80 to-white/60 border border-primary/15 rounded-full text-sm font-medium text-primary/90 whitespace-nowrap backdrop-blur-sm cursor-pointer">
                        {specialty}
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback to original mock data if no specialties found without links
                  <>
                    {[
                      "General Medicine",
                      "Cardiology", 
                      "Dermatology",
                      "Pediatrics",
                      "Orthopedics",
                      "Neurology",
                      "Gynecology",
                      "Psychiatry",
                      "Ophthalmology",
                      "ENT",
                      "Oncology",
                      "Endocrinology",
                      "Gastroenterology",
                      "Pulmonology",
                    ].map((specialty, index) => (
                      <div
                        key={`${specialty}-${index}`}
                        className="flex-shrink-0 mx-1"
                      >
                        <div className="px-4 py-2 bg-gradient-to-r from-white/80 to-white/60 border border-primary/15 rounded-full text-sm font-medium text-primary/90 whitespace-nowrap backdrop-blur-sm cursor-pointer">
                          {specialty}
                        </div>
                      </div>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {[
                      "General Medicine",
                      "Cardiology", 
                      "Dermatology",
                      "Pediatrics",
                      "Orthopedics",
                      "Neurology",
                      "Gynecology",
                      "Psychiatry",
                      "Ophthalmology",
                      "ENT",
                      "Oncology",
                      "Endocrinology",
                      "Gastroenterology",
                      "Pulmonology",
                    ].map((specialty, index) => (
                      <div
                        key={`${specialty}-duplicate-${index}`}
                        className="flex-shrink-0 mx-3"
                      >
                        <div className="px-6 py-3 bg-gradient-to-r from-white/80 to-white/60 border border-primary/15 rounded-full text-sm font-medium text-primary/90 whitespace-nowrap backdrop-blur-sm cursor-pointer">
                          {specialty}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}