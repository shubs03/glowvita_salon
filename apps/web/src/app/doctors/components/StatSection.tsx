"use client";

import { Users, Clock, Star, Calendar } from "lucide-react";

export function StatSection() {
  const stats = [
    {
      icon: Users,
      value: "50,000+",
      label: "Happy Patients",
      description: "Trusted by patients worldwide"
    },
    {
      icon: Clock,
      value: "24/7",
      label: "Available",
      description: "Round-the-clock medical support"
    },
    {
      icon: Star,
      value: "4.9/5",
      label: "Average Rating",
      description: "Based on patient reviews"
    },
    {
      icon: Calendar,
      value: "100,000+",
      label: "Consultations",
      description: "Successful online consultations"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-4">
            Trusted by Millions
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Join thousands of satisfied patients who have experienced quality healthcare through our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative p-6 rounded-md transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-400/10 to-blue-400/5 border border-blue-400/10 hover:border-blue-400/20 text-center cursor-pointer"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 bg-blue-400/15">
                    <IconComponent className="h-6 w-6 text-blue-400" />
                  </div>
                  
                  <div className="text-3xl lg:text-4xl font-bold mb-2 transition-all duration-300 group-hover:scale-105 text-blue-400">
                    {stat.value}
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {stat.label}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {stat.description}
                  </p>

                  {/* Subtle underline animation */}
                  <div className="h-0.5 w-0 bg-blue-400 mt-4 transition-all duration-300 rounded-full group-hover:w-12" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Mini Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-blue-400 mb-1">500+</div>
            <div className="text-sm text-muted-foreground">Certified Doctors</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-blue-400 mb-1">50+</div>
            <div className="text-sm text-muted-foreground">Medical Specialties</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-blue-400 mb-1">15 min</div>
            <div className="text-sm text-muted-foreground">Average Wait Time</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-blue-400 mb-1">99.9%</div>
            <div className="text-sm text-muted-foreground">Platform Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
}