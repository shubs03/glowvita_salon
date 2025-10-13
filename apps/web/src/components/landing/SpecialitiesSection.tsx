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

// Default export with sample data
export default function SpecialitiesSectionWithData() {
  const specialties: Specialty[] = [
    { id: "1", name: "Cardiology", icon: Heart, slug: "cardiology", category: "specialty" },
    { id: "2", name: "Neurology", icon: Brain, slug: "neurology", category: "specialty" },
    { id: "3", name: "Ophthalmology", icon: Eye, slug: "ophthalmology", category: "specialty" },
    { id: "4", name: "Orthopedics", icon: Bone, slug: "orthopedics", category: "specialty" },
    { id: "5", name: "Pediatrics", icon: Baby, slug: "pediatrics", category: "primary" },
    { id: "6", name: "General Medicine", icon: Stethoscope, slug: "general-medicine", category: "primary" },
    { id: "7", name: "Emergency Medicine", icon: Zap, slug: "emergency-medicine", category: "specialty" },
    { id: "8", name: "Family Medicine", icon: Users, slug: "family-medicine", category: "primary" },
    { id: "9", name: "Internal Medicine", icon: Activity, slug: "internal-medicine", category: "primary" },
    { id: "10", name: "Surgery", icon: Scissors, slug: "surgery", category: "specialty" },
    { id: "11", name: "Pharmacy", icon: Pill, slug: "pharmacy", category: "diagnostic" },
    { id: "12", name: "Preventive Care", icon: Shield, slug: "preventive-care", category: "primary" },
    { id: "13", name: "Mental Health", icon: HeartHandshake, slug: "mental-health", category: "specialty" },
    { id: "14", name: "Dental Care", icon: Smile, slug: "dental-care", category: "specialty" },
    { id: "15", name: "Physical Therapy", icon: Waves, slug: "physical-therapy", category: "specialty" },
    { id: "16", name: "Radiology", icon: Target, slug: "radiology", category: "diagnostic" },
    { id: "17", name: "Laboratory", icon: FlaskConical, slug: "laboratory", category: "diagnostic" },
    { id: "18", name: "Anesthesiology", icon: Gauge, slug: "anesthesiology", category: "specialty" },
    { id: "19", name: "Sleep Medicine", icon: Moon, slug: "sleep-medicine", category: "specialty" },
    { id: "20", name: "Dermatology", icon: Sparkles, slug: "dermatology", category: "specialty" },
    { id: "21", name: "Gynecology", icon: Flower2, slug: "gynecology", category: "specialty" },
    { id: "22", name: "Geriatrics", icon: UserCheck, slug: "geriatrics", category: "primary" },
    { id: "23", name: "Urgent Care", icon: Clock, slug: "urgent-care", category: "primary" },
    { id: "24", name: "Infectious Disease", icon: Thermometer, slug: "infectious-disease", category: "specialty" }
  ];

  return <SpecialitiesSection specialties={specialties} />;
}