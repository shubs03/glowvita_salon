"use client";

import Link from "next/link";

export function SpecialtiesSection() {
  const specialties = [
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
    "Urology",
    "Rheumatology",
    "Nephrology",
    "Anesthesiology"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-4">
            Medical Specialties
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Connect with specialists across various medical fields for expert consultations
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-background to-primary/5 rounded-2xl py-6">
          {/* Left fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none"></div>
          {/* Right fade effect */}
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none"></div>
          
          {/* Forward scrolling row */}
          <div className="flex animate-marquee hover:pause-marquee mb-4">
            {specialties.concat(specialties).map((specialty, index) => (
              <Link
                key={`forward-${specialty}-${index}`}
                href={`/doctors/specialties/${specialty.toLowerCase().replace(/\s+/g, '-')}`}
                className="group flex-shrink-0 mx-2"
              >
                <div className="px-6 py-3 bg-gradient-to-r from-white/80 to-white/60 hover:from-primary/10 hover:to-primary/5 border border-primary/15 hover:border-primary/25 rounded-full text-sm font-medium text-primary/90 hover:text-primary transition-all duration-300 cursor-pointer group-hover:shadow-lg group-hover:scale-105 whitespace-nowrap backdrop-blur-sm">
                  {specialty}
                </div>
              </Link>
            ))}
          </div>

          {/* Reverse scrolling row */}
          <div className="flex animate-marquee-reverse hover:pause-marquee">
            {specialties.slice().reverse().concat(specialties.slice().reverse()).map((specialty, index) => (
              <Link
                key={`reverse-${specialty}-${index}`}
                href={`/doctors/specialties/${specialty.toLowerCase().replace(/\s+/g, '-')}`}
                className="group flex-shrink-0 mx-2"
              >
                <div className="px-6 py-3 bg-gradient-to-r from-blue-50/80 to-blue-50/60 hover:from-blue-100/10 hover:to-blue-100/5 border border-blue-500/15 hover:border-blue-500/25 rounded-full text-sm font-medium text-blue-600/90 hover:text-blue-600 transition-all duration-300 cursor-pointer group-hover:shadow-lg group-hover:scale-105 whitespace-nowrap backdrop-blur-sm">
                  {specialty}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-4">
            Can't find your specialty? Browse all available options
          </p>
          <Link 
            href="/doctors/specialties" 
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-primary hover:text-primary/80 border border-primary/20 hover:border-primary/30 rounded-md transition-all duration-300 hover:bg-primary/5"
          >
            View All Specialties
          </Link>
        </div>
      </div>
    </section>
  );
}