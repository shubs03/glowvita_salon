
"use client";
import { useEffect } from "react";
import HeroSection from "@/components/apps/HeroSection";
import FeaturesGridSection from "@/components/apps/FeaturesGridSection";
import HowItWorksSection from "@/components/apps/HowItWorksSection";
import TestimonialsSection from "@/components/apps/TestimonialsSection";
import FeatureComparisonSection from "@/components/apps/FeatureComparisonSection";
import AppPromotionSection from "@/components/apps/AppPromotionSection";
import CTACRM from "@/components/landing/CTACRM";
import OverviewPreview from "@/components/landing/OverviewPreview";
import RealResults from "@/components/landing/RealResults";

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
        <FeaturesGridSection />
        <TestimonialsSection />
        <FeatureComparisonSection />
        <HowItWorksSection />
        <OverviewPreview />
        <RealResults />
        <CTACRM />
      </main>
    </div>
  );
}
