"use client";

import React from "react";
import {
  Star,
  Users,
  TrendingUp,
  Sparkles,
  Heart,
  Calendar,
  MapPin,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@repo/ui/cn";

const keyFeatures = [
  {
    icon: Sparkles,
    title: "Luxe Hair Studio",
    location: "Manhattan, NY",
    rating: 4.9,
    clients: "500+",
    specialty: "Premium Hair Styling",
    description:
      "Upscale salon specializing in color correction and luxury treatments",
    growth: "+40% bookings",
    image: "https://placehold.co/400x200/6366f1/ffffff?text=Luxe+Hair+Studio",
  },
  {
    icon: Heart,
    title: "Bella Vista Spa",
    location: "Beverly Hills, CA",
    rating: 5.0,
    clients: "300+",
    specialty: "Full-Service Day Spa",
    description:
      "Award-winning spa with 15 treatment rooms and wellness packages",
    growth: "+60% revenue",
    image: "https://placehold.co/400x200/10b981/ffffff?text=Bella+Vista+Spa",
  },
  {
    icon: Users,
    title: "Modern Cuts Barbershop",
    location: "Austin, TX (3 locations)",
    rating: 4.8,
    clients: "800+",
    specialty: "Traditional & Modern Cuts",
    description:
      "Local barbershop chain known for precision cuts and beard styling",
    growth: "+25% client retention",
    image: "https://placehold.co/400x200/475569/ffffff?text=Modern+Cuts",
  },
  {
    icon: Star,
    title: "Glamour Nails & Beauty",
    location: "Miami, FL",
    rating: 4.9,
    clients: "450+",
    specialty: "Nail Art & Extensions",
    description:
      "Trendy nail salon featuring custom designs and gel treatments",
    growth: "+35% revenue",
    image: "https://placehold.co/400x200/ec4899/ffffff?text=Glamour+Nails",
  },
  {
    icon: Calendar,
    title: "Serenity Wellness Center",
    location: "Portland, OR",
    rating: 4.7,
    clients: "600+",
    specialty: "Massage & Wellness",
    description:
      "Holistic wellness center offering massage, yoga, and beauty services",
    growth: "+50% class bookings",
    image: "https://placehold.co/400x200/059669/ffffff?text=Serenity+Wellness",
  },
  {
    icon: TrendingUp,
    title: "Radiant Skin Clinic",
    location: "Seattle, WA",
    rating: 4.9,
    clients: "350+",
    specialty: "Medical Aesthetics",
    description:
      "Advanced skincare clinic with dermatologist-approved treatments",
    growth: "+45% new clients",
    image: "https://placehold.co/400x200/f97316/ffffff?text=Radiant+Skin",
  },
];

export function SalonsSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("salons-section");
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="salons-section"
      className="py-20 md:py-28 bg-gradient-to-br from-background via-primary/3 to-secondary/5 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,hsl(var(--primary))_0%,transparent_50%)] opacity-10"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,white,transparent_70%)] opacity-20"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Key Features Section */}
        <div
          className={`transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div
            className={cn(
              "text-center mb-16 transition-all duration-1000",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            )}
          >
            <h2 className="text-4xl md:text-6xl font-bold font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-6">
              Success Stories from Our Partners
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover how leading beauty businesses have transformed their
              operations and achieved remarkable growth with GlowVita's
              comprehensive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {keyFeatures.map((salon, index) => {
              const IconComponent = salon.icon;
              return (
                <div
                  key={index}
                  className="group rounded-md bg-background/30 hover:bg-background/50 border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg backdrop-blur-sm hover:-translate-y-1 overflow-hidden max-w-sm mx-auto"
                >
                  {/* Salon Image Header */}
                  <div className="relative h-52 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <Image
                      src={salon.image}
                      alt={salon.title}
                      fill
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Wj2he"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Star className="h-3 w-3 fill-yellow-300 text-yellow-300" />
                      <span className="font-semibold text-white text-xs">
                        {salon.rating}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    {/* Specialty Badge */}
                    <div className="block px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2 w-fit">
                      {salon.specialty}
                    </div>

                    {/* Salon Title & Location */}
                    <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-300 text-left">
                      {salon.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      <span>{salon.location}</span>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed text-xs mb-3 text-left">
                      {salon.description}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-primary" />
                        <span className="text-muted-foreground">
                          {salon.clients} clients
                        </span>
                      </div>
                      <div className="text-green-600 font-medium">
                        {salon.growth}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Benefits */}
        <div
          className={`mt-24 transition-all duration-1000 delay-200 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Salon Owners Choose{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                GlowVita
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-300">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Boost Efficiency
              </h3>
              <p className="text-muted-foreground">
                Automate repetitive tasks and streamline operations to save up
                to 10 hours per week
              </p>
            </div>

            <div className="text-center group">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-300">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Enhance Client Experience
              </h3>
              <p className="text-muted-foreground">
                Provide seamless booking, personalized service, and memorable
                experiences that keep clients coming back
              </p>
            </div>

            <div className="text-center group">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-300">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Increase Revenue
              </h3>
              <p className="text-muted-foreground">
                Smart analytics and automated marketing help salon owners
                increase revenue by an average of 30%
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
