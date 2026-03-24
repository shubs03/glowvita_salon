
"use client";
import { useEffect } from "react";
import HeroSection from "@/components/landing/HeroSection";
import CoreFeatures from "@/components/landing/CoreFeatures";
import OverviewPreview from "@/components/landing/OverviewPreview";

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
        <OverviewPreview />
      </main>
    </div>
  );
}
