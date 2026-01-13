"use client";

import { cn } from "@repo/ui/cn";
import {
  HeroSection,
  AppCTA,
  HowItWorks,
  PlatformFor,
  Testimonials,
  Offers,
  FAQ,
  AdvantageCard,
  VideoTestimonialSection,
  SecuritySection,
  Integrations,
  Blog,
  Services,
  BentoGrid,
  SalonsSection,
  FeaturedProductsSection,
  StatisticsSection,
} from "@/components/landing";

import { Award, Users, LineChart, Clock, ArrowRight, ShoppingCart, Star, Heart } from "lucide-react";
import { Button } from "@repo/ui/button";
import { useGetAdminProductCategoriesQuery, useGetVendorsQuery } from "@repo/store/services/api";
import { useState, useEffect } from "react";
import { NewProductCard } from "@/components/landing/NewProductCard";
import { Badge } from "@repo/ui/badge";
import HeroSection2 from "@/components/landing/HeroSection2";
import OffersSection2 from "@/components/landing/OffersSection2";
import WhyChooseUs from "@/components/landing/WhyChooseUs";
import Testimonials2 from "@/components/landing/Testimonials2";
import { SalonFilterProvider } from "@/components/landing/SalonFilterContext";
import WhereToGo from "@/components/landing/WhereToDo";
import DownloadApp from "@/components/landing/DownloadApp";




export default function HomePage() {
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

    const element = document.getElementById("platform-for");
    if (element) observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SalonFilterProvider>
      
      <main className="flex-grow">
        <HeroSection2 />
        <OffersSection2 />
        <WhereToGo maxSalons={6} showViewAllButton={true} />
        <WhyChooseUs/>
        <Testimonials2 />
        <DownloadApp />

        {/* <HeroSection /> */}
        {/* <PlatformFor /> */}
        {/* <SalonsSection /> */}
        {/* <Offers /> */}
        {/* <FeaturedProductsSection /> */}
        {/* <Services /> */}
        {/* <StatisticsSection /> */}
        {/* <VideoTestimonialSection /> */}
        {/* <Testimonials /> */}
        {/* <AppCTA /> */}
      </main>
      </SalonFilterProvider>
    </div>
  );
}