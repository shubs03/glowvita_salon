"use client";

import React from "react";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import {
  ArrowRight,
  Sparkles,
  Star,
  Play,
  Calendar,
  Users,
  Shield,
  Check,
  Award,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@repo/ui/cn";
import { BentoGrid } from "./BentoGrid";
import { SalonsSection } from "./SalonsSection";

const categories = [
  "Hair Styling",
  "Nail Art",
  "Skincare",
  "Massages",
  "Makeup",
  "Barbering",
  "Waxing",
  "Tanning",
  "Eyebrows & Lashes",
  "Day Spa",
];

const floatingElements = [
  { icon: Calendar, delay: 0, position: "top-20 left-20" },
  { icon: Users, delay: 2, position: "top-32 right-32" },
  { icon: Sparkles, delay: 1, position: "bottom-32 right-20" },
];

const platformStats = [
  { number: "50K+", label: "Active Salons", icon: Users },
  { number: "2M+", label: "Bookings Monthly", icon: Calendar },
  { number: "99.9%", label: "Uptime", icon: Shield },
  { number: "4.9/5", label: "Rating", icon: Star },
];

const trustBadges = [
  { text: "SOC 2 Compliant", icon: Shield },
  { text: "GDPR Ready", icon: Check },
  { text: "ISO 27001", icon: Award },
  { text: "256-bit SSL", icon: Shield },
];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-background via-primary/3 to-secondary/5 text-center py-20 md:py-32 lg:py-40 overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent"></div>

        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] animate-pulse"></div>

        {/* Floating Orbs */}
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Main Title with Typewriter Effect */}
        <div
          className={`transition-all duration-1000 delay-200 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold font-headline tracking-tighter mb-6 leading-none">
            <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-gradient-x">
              Transform Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient-x">
              Salon Experience
            </span>
          </h1>
        </div>

        {/* Enhanced Subtitle */}
        <div
          className={`transition-all duration-1000 delay-400 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto mb-10 leading-relaxed font-medium">
            The revolutionary platform that empowers{" "}
            <span className="text-primary font-semibold">modern salons</span>{" "}
            and <span className="text-primary font-semibold">stylists</span> to
            unlock their full potential with seamless client management, smart
            bookings, and instant payments.
          </p>
        </div>

        {/* Enhanced CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-600 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <Button
            size="lg"
            className="text-base rounded-full md:text-base shadow-xl hover:shadow-2xl transition-all duration-300 group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary border-0 relative overflow-hidden"
            asChild
          >
            <Link href="/auth/register">
              <span className="relative z-10 flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-base md:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 bg-background/50 hover:bg-background backdrop-blur-sm group relative overflow-hidden"
            asChild
          >
            <Link href="#">
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Watch Demo
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </Button>
        </div>

        {/* Platform Stats */}
        <div
          className={`mt-20 transition-all duration-1000 delay-800 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {platformStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Indicators */}
        <div
          className={`mt-16 transition-all duration-1000 delay-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <p className="text-sm text-muted-foreground mb-6 font-medium">
            Trusted by salon professionals worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
            {trustBadges.map((badge, index) => {
              const IconComponent = badge.icon;
              return (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-4 py-2 bg-background/50 hover:bg-background/80 border border-border/50 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  <IconComponent className="h-4 w-4 mr-2 text-primary" />
                  {badge.text}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Salons Section */}
        <SalonsSection />
      </div>

      {/* Enhanced Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none"></div>

      {/* Scroll Indicator */}
      {/*  */}
    </section>
  );
}
