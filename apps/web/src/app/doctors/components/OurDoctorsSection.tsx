"use client";

import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Star, MapPin, Clock, Video, Calendar, Award } from "lucide-react";
import Link from "next/link";

export function OurDoctorsSection() {
  const doctors = [
    {
      id: "dr-sarah-johnson",
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      experience: "15+ years",
      rating: 4.9,
      reviews: 1250,
      image: "https://placehold.co/300x300/3B82F6/FFFFFF?text=Dr+Sarah",
      location: "New York, NY",
      languages: ["English", "Spanish"],
      education: "Harvard Medical School",
      isAvailable: true,
      nextSlot: "Today 2:00 PM",
      consultationFee: 150,
      badges: ["Top Rated", "Available Today"]
    },
    {
      id: "dr-michael-chen",
      name: "Dr. Michael Chen",
      specialty: "Dermatologist",
      experience: "12+ years",
      rating: 4.8,
      reviews: 980,
      image: "https://placehold.co/300x300/3B82F6/FFFFFF?text=Dr+Michael",
      location: "Los Angeles, CA",
      languages: ["English", "Mandarin"],
      education: "Stanford Medical School",
      isAvailable: true,
      nextSlot: "Tomorrow 10:00 AM",
      consultationFee: 120,
      badges: ["Verified", "Specialist"]
    },
    {
      id: "dr-emily-rodriguez",
      name: "Dr. Emily Rodriguez",
      specialty: "Pediatrician",
      experience: "10+ years",
      rating: 4.9,
      reviews: 756,
      image: "https://placehold.co/300x300/3B82F6/FFFFFF?text=Dr+Emily",
      location: "Chicago, IL",
      languages: ["English", "Spanish"],
      education: "Johns Hopkins University",
      isAvailable: false,
      nextSlot: "Dec 16, 9:00 AM",
      consultationFee: 100,
      badges: ["Child Specialist", "Verified"]
    },
    {
      id: "dr-james-wilson",
      name: "Dr. James Wilson",
      specialty: "Neurologist",
      experience: "18+ years",
      rating: 4.7,
      reviews: 1420,
      image: "https://placehold.co/300x300/3B82F6/FFFFFF?text=Dr+James",
      location: "Boston, MA",
      languages: ["English", "French"],
      education: "Yale School of Medicine",
      isAvailable: true,
      nextSlot: "Today 4:30 PM",
      consultationFee: 180,
      badges: ["Expert", "Available Today"]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-4">
            Our Expert Doctors
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Connect with board-certified doctors who are available for immediate consultation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="group relative bg-gradient-to-br from-blue-400/10 to-blue-400/5 rounded-md border border-blue-400/10 hover:border-blue-400/20 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Doctor Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Availability Indicator */}
                <div className="absolute top-3 right-3">
                  <div className={`w-3 h-3 rounded-full ${doctor.isAvailable ? 'bg-blue-400' : 'bg-blue-500'} border-2 border-white shadow-sm`} />
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {doctor.badges.slice(0, 2).map((badge) => (
                    <Badge
                      key={badge}
                      variant={badge.includes("Available") ? "default" : "secondary"}
                      className="text-xs px-2 py-1"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Doctor Info */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-blue-400 transition-colors">
                    {doctor.name}
                  </h3>
                  <p className="text-sm font-medium text-blue-400 mb-1">
                    {doctor.specialty}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {doctor.experience} • {doctor.education}
                  </p>
                </div>

                {/* Rating and Location */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-blue-400 text-blue-400" />
                    <span className="text-sm font-medium">{doctor.rating}</span>
                    <span className="text-xs text-muted-foreground">({doctor.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{doctor.location}</span>
                  </div>
                </div>

                {/* Languages */}
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Languages:</p>
                  <div className="flex gap-1">
                    {doctor.languages.map((lang) => (
                      <span
                        key={lang}
                        className="text-xs px-2 py-1 bg-blue-400/10 text-blue-700 rounded-full"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Next Available Slot */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Next available:</span>
                    <span className={`font-medium ${doctor.isAvailable ? 'text-blue-400' : 'text-blue-600'}`}>
                      {doctor.nextSlot}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Consultation fee: <span className="font-medium text-foreground">${doctor.consultationFee}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    asChild
                    size="sm"
                    className="flex-1 text-xs"
                    disabled={!doctor.isAvailable}
                  >
                    <Link href={`/doctors/consultations/instant/${doctor.id}`}>
                      <Video className="h-3 w-3 mr-1" />
                      Consult Now
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs border-blue-400/20 hover:border-blue-400/40 hover:bg-blue-400/10 text-blue-400"
                  >
                    <Link href={`/doctors/consultations/schedule/${doctor.id}`}>
                      <Calendar className="h-3 w-3 mr-1" />
                      Schedule
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Browse our complete directory of verified medical professionals
          </p>
          <Button
            asChild
            variant="outline"
            className="px-8 py-3 border-blue-400/20 hover:border-blue-400/40 hover:bg-blue-400/10 text-blue-400"
          >
            <Link href="/doctors" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              View All Doctors
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}