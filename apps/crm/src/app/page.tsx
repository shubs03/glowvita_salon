
"use client";
import { useEffect } from "react";
import HeroSection from "@/components/landing/HeroSection";
import CoreFeatures from "@/components/landing/CoreFeatures";
import RealResults from "@/components/landing/RealResults";
import HowItWorks from "@/components/landing/HowItWorks";
import TestimonialsCRM from "@/components/landing/TestimonialsCRM";
import OverviewPreview from "@/components/landing/OverviewPreview";
import CTACRM from "@/components/landing/CTACRM";

export default function CrmHomePage() {
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <main className="flex-grow">
        <HeroSection />
        <CoreFeatures />
        <HowItWorks />
        <OverviewPreview />
        <TestimonialsCRM />
        <RealResults />
        <CTACRM />
      </main>
    </div>
  );
}
