"use client";

import { cn } from "@repo/ui/cn";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  Heart,
  Brain,
  Eye,
  Bone,
  Baby,
  Stethoscope,
  Zap,
  Users,
  Activity,
  Scissors,
  Pill,
  Shield,
  HeartHandshake,
  Smile,
  Waves,
  Target,
  FlaskConical,
  Gauge,
  Moon,
  Sparkles,
  Flower2,
  UserCheck,
  Clock,
  Thermometer
} from "lucide-react";
import { useGetPublicDoctorsQuery } from '@repo/store/services/api';
import { useState, useEffect } from 'react';

interface Specialty {
  id: string;
  name: string;
  icon: LucideIcon;
  slug: string;
  category?: "primary" | "specialty" | "diagnostic";
}

interface SpecialitiesProps {
  specialties: Specialty[];
}

function SpecialtyItem({ specialty }: { specialty: Specialty }) {
  const Icon = specialty.icon;
  
  return (
    <Link 
      href={`/specialties/${specialty.slug}`}
      className="group relative block"
    >
      <div className={cn(
        "flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300",
        "hover:bg-primary/5 hover:scale-105 cursor-pointer",
        "transform-gpu will-change-transform"
      )}>
        {/* Icon */}
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all duration-300",
          "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-110"
        )}>
          <Icon className="h-6 w-6" />
        </div>
        
        {/* Specialty Name */}
        <h3 className={cn(
          "font-semibold text-foreground transition-all duration-300",
          "group-hover:text-primary text-sm leading-tight"
        )}>
          {specialty.name}
        </h3>
        
        {/* Subtle underline animation */}
        <div className={cn(
          "h-0.5 w-0 bg-primary mt-2 transition-all duration-300 rounded-full",
          "group-hover:w-8"
        )} />
      </div>
    </Link>
  );
}

export function SpecialitiesSection({ specialties }: SpecialitiesProps) {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-4">
            Find Specialists by Category
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Connect with expert doctors across all medical specialties for comprehensive healthcare
          </p>
        </div>

        {/* Interactive Specialties Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
          {specialties.map((specialty) => (
            <SpecialtyItem
              key={specialty.id}
              specialty={specialty}
            />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">
            Can't find your specialty? Browse our complete directory
          </p>
          <Link 
            href="/specialties" 
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground",
              "rounded-md font-medium transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
            )}
          >
            View All Specialties
            <Target className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Default export with dynamic data from doctors
export default function SpecialitiesSectionWithData() {
  const { data: doctorsData, isLoading, isError } = useGetPublicDoctorsQuery(undefined);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  
  useEffect(() => {
    if (doctorsData && doctorsData.length > 0) {
      // Extract all unique specialties from doctors
      const specialtiesSet = new Set<string>();
      doctorsData.forEach((doctor : any) => {
        if (doctor.specialties && doctor.specialties.length > 0) {
          doctor.specialties.forEach((specialty : any) => {
            if (specialty && specialty.trim()) {
              specialtiesSet.add(specialty.trim());
            }
          });
        } else if (doctor.doctorType && doctor.doctorType.trim()) {
          specialtiesSet.add(doctor.doctorType.trim());
        }
      });
      
      // Convert to array and create specialty objects
      const uniqueSpecialties = Array.from(specialtiesSet);
      const specialtyObjects: Specialty[] = uniqueSpecialties.map((name, index) => ({
        id: `specialty-${index}`,
        name,
        icon: getSpecialtyIcon(name),
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        category: "specialty"
      }));
      
      setSpecialties(specialtyObjects);
    }
  }, [doctorsData]);
  
  // Function to get appropriate icon for specialty
  const getSpecialtyIcon = (specialtyName: string): LucideIcon => {
    const name = specialtyName.toLowerCase();
    
    // Map specialties to appropriate icons
    if (name.includes('cardio')) return Heart;
    if (name.includes('neuro')) return Brain;
    if (name.includes('eye') || name.includes('ophthal')) return Eye;
    if (name.includes('bone') || name.includes('orthoped')) return Bone;
    if (name.includes('baby') || name.includes('pediat')) return Baby;
    if (name.includes('general') || name.includes('family') || name.includes('internal')) return Stethoscope;
    if (name.includes('emergency')) return Zap;
    if (name.includes('surgery')) return Scissors;
    if (name.includes('pharm')) return Pill;
    if (name.includes('prevent')) return Shield;
    if (name.includes('mental') || name.includes('psych')) return HeartHandshake;
    if (name.includes('dental')) return Smile;
    if (name.includes('physical') || name.includes('therapy')) return Waves;
    if (name.includes('radio')) return Target;
    if (name.includes('laborat')) return FlaskConical;
    if (name.includes('anesthes')) return Gauge;
    if (name.includes('sleep')) return Moon;
    if (name.includes('dermat') || name.includes('skin')) return Sparkles;
    if (name.includes('gynae') || name.includes('women')) return Flower2;
    if (name.includes('geriat')) return UserCheck;
    if (name.includes('urgent') || name.includes('care')) return Clock;
    if (name.includes('infect')) return Thermometer;
    
    // Default icon
    return Stethoscope;
  };

  if (isLoading) {
    // Return loading state with skeleton items
    return (
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <div className="h-12 bg-muted rounded-lg w-1/2 mx-auto mb-4"></div>
            <div className="h-6 bg-muted rounded-lg w-1/3 mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="flex flex-col items-center p-6 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-muted mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    // Return error state
    return (
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <div className="text-red-500 mb-4">Error loading specialties</div>
          </div>
        </div>
      </section>
    );
  }

  return <SpecialitiesSection specialties={specialties} />;
}