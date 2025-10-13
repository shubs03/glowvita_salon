"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Search, Calendar, Stethoscope, MapPin } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
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
            <div className="bg-white rounded-md shadow-lg border border-border/50 overflow-hidden">
              <div className="flex items-center p-2">
                <div className="flex items-center flex-1">
                  <Search className="h-5 w-5 text-muted-foreground mx-3" />
                  <Input
                    placeholder="Search doctors, specialties, or clinics"
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base bg-transparent placeholder:text-muted-foreground/60"
                  />
                </div>
                <div className="p-1">
                  <Button className="px-8 py-3 text-base rounded-md">
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10 max-w-4xl mx-auto">
            <Button
              asChild
              size="lg"
              className="px-8 py-4 rounded-md font-semibold text-base bg-blue-500"
            >
              <Link href="/doctors/appointments" className="flex items-center gap-3">
                <Calendar className="h-4 w-4" />
                Book Appointment
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-4 rounded-md font-semibold text-base border-2 border-primary/30 hover:border-primary/50 bg-transparent hover:bg-primary/5 text-primary transition-all duration-300"
            >
              <Link href="/doctors/specialties" className="flex items-center gap-3">
                <Stethoscope className="h-4 w-4" />
                Browse Specialties
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
                  <Link
                    key={`${specialty}-${index}`}
                    href={`/doctors/specialties/${specialty.toLowerCase().replace(/\s+/g, '-')}`}
                    className="group flex-shrink-0 mx-1"
                  >
                    <div className="px-4 py-2 bg-gradient-to-r from-white/80 to-white/60 hover:from-primary/10 hover:to-primary/5 border border-primary/15 hover:border-primary/25 rounded-full text-sm font-medium text-primary/90 hover:text-primary transition-all duration-300 cursor-pointer whitespace-nowrap backdrop-blur-sm">
                      {specialty}
                    </div>
                  </Link>
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
                  <Link
                    key={`${specialty}-duplicate-${index}`}
                    href={`/doctors/specialties/${specialty.toLowerCase().replace(/\s+/g, '-')}`}
                    className="group flex-shrink-0 mx-3"
                  >
                    <div className="px-6 py-3 bg-gradient-to-r from-white/80 to-white/60 hover:from-primary/10 hover:to-primary/5 border border-primary/15 hover:border-primary/25 rounded-full text-sm font-medium text-primary/90 hover:text-primary transition-all duration-300 cursor-pointer group-hover:shadow-lg group-hover:scale-105 whitespace-nowrap backdrop-blur-sm">
                      {specialty}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}