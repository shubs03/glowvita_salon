"use client";

import { Users, Clock, Star, Calendar } from "lucide-react";

export function StatSection() {
  const stats = [
    {
      icon: Users,
      value: "50,000+",
      label: "Happy Patients",
      description: "Trusted by patients worldwide",
      color: "blue",
      gradient: "from-blue-500/10 to-blue-500/5"
    },
    {
      icon: Clock,
      value: "24/7",
      label: "Available",
      description: "Round-the-clock medical support",
      color: "green",
      gradient: "from-green-500/10 to-green-500/5"
    },
    {
      icon: Star,
      value: "4.9/5",
      label: "Average Rating",
      description: "Based on patient reviews",
      color: "yellow",
      gradient: "from-yellow-500/10 to-yellow-500/5"
    },
    {
      icon: Calendar,
      value: "100,000+",
      label: "Consultations",
      description: "Successful online consultations",
      color: "purple",
      gradient: "from-purple-500/10 to-purple-500/5"
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
                className={`group relative p-8 rounded-md transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${stat.gradient} border hover:border-opacity-40 text-center cursor-pointer`}
                style={{
                  borderColor: `${stat.color === 'blue' ? 'rgb(59 130 246 / 0.1)' : 
                    stat.color === 'green' ? 'rgb(34 197 94 / 0.1)' : 
                    stat.color === 'yellow' ? 'rgb(234 179 8 / 0.1)' :
                    'rgb(168 85 247 / 0.1)'}`
                }}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110`}
                       style={{
                         backgroundColor: `${stat.color === 'blue' ? 'rgb(59 130 246 / 0.15)' : 
                           stat.color === 'green' ? 'rgb(34 197 94 / 0.15)' : 
                           stat.color === 'yellow' ? 'rgb(234 179 8 / 0.15)' :
                           'rgb(168 85 247 / 0.15)'}`
                       }}
                  >
                    <IconComponent className={`h-8 w-8`}
                                   style={{
                                     color: `${stat.color === 'blue' ? 'rgb(59 130 246)' : 
                                       stat.color === 'green' ? 'rgb(34 197 94)' : 
                                       stat.color === 'yellow' ? 'rgb(234 179 8)' :
                                       'rgb(168 85 247)'}`
                                   }} />
                  </div>
                  
                  <div className={`text-4xl lg:text-5xl font-bold mb-2 transition-all duration-300 group-hover:scale-105`}
                       style={{
                         color: `${stat.color === 'blue' ? 'rgb(37 99 235)' : 
                           stat.color === 'green' ? 'rgb(21 128 61)' : 
                           stat.color === 'yellow' ? 'rgb(161 98 7)' :
                           'rgb(124 58 237)'}`
                       }}
                  >
                    {stat.value}
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {stat.label}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {stat.description}
                  </p>

                  {/* Subtle underline animation */}
                  <div className={`h-0.5 w-0 bg-primary mt-4 transition-all duration-300 rounded-full group-hover:w-12`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Mini Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary mb-1">500+</div>
            <div className="text-sm text-muted-foreground">Certified Doctors</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-primary mb-1">50+</div>
            <div className="text-sm text-muted-foreground">Medical Specialties</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-primary mb-1">15 min</div>
            <div className="text-sm text-muted-foreground">Average Wait Time</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-primary mb-1">99.9%</div>
            <div className="text-sm text-muted-foreground">Platform Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
}