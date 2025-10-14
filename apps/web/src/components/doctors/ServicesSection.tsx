"use client";

import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import {
  Video,
  ArrowRight,
  MapPin,
} from "lucide-react";
import Link from "next/link";

export const ServicesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-4">
            Healthcare Services
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Connect with qualified doctors and access medical care with just a
            few clicks
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Video Consultation */}
          <Link 
            href="/doctors/consultations"
            className="block bg-gradient-to-br from-primary/5 to-primary/10 rounded-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group cursor-pointer"
          >
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
              <img
                src="https://placehold.co/600x400/3B82F6/FFFFFF?text=Video+Consultation"
                alt="Video Consultation"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0"></div>
              <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground border-0 text-xs px-3 py-1 rounded-full font-medium">
                24/7
              </Badge>
            </div>

            {/* Content Section */}
            <div className="p-6">
              {/* Service Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/15 rounded-md flex items-center justify-center group-hover:bg-primary/25 transition-colors duration-300">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                    Video Consultation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with certified doctors instantly through secure
                    video calls
                  </p>
                </div>
              </div>

              {/* Action Indicator */}
              <div className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded transition-all duration-200 group-hover:shadow-md">
                Start Video Consultation
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </Link>

          {/* Find Doctor Near Me */}
          <Link 
            href="/doctors/nearby"
            className="block rounded-md border overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group cursor-pointer"
          >
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
              <img
                src="https://placehold.co/600x400/3B82F6/FFFFFF?text=Find+Local+Doctors"
                alt="Find Local Doctors"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground border-0 text-xs px-3 py-1 rounded-full font-medium">
                LOCAL
              </Badge>
            </div>

            {/* Content Section */}
            <div className="p-6">
              {/* Service Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/15 rounded-md flex items-center justify-center group-hover:bg-primary/25 transition-colors duration-300">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                    Find Doctor Near Me
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Discover qualified doctors in your area with real-time
                    availability
                  </p>
                </div>
              </div>

              {/* Action Indicator */}
              <div className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded transition-all duration-200 group-hover:shadow-md">
                Find Local Doctors
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};