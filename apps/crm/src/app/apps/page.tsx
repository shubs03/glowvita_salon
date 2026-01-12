"use client";

import HeroSection from "@/components/apps/HeroSection";
import AppPromotionSection from "@/components/apps/AppPromotionSection";
import FeaturesGridSection from "@/components/apps/FeaturesGridSection";
import TestimonialsSection from "@/components/apps/TestimonialsSection";
import FeatureComparisonSection from "@/components/apps/FeatureComparisonSection";
import HowItWorksSection from "@/components/apps/HowItWorksSection";
import SecuritySection from "@/components/apps/SecuritySection";
import FinalCTASection from "@/components/apps/FinalCTASection";
import AppFeature from "@/components/apps/AppFeature";
import TestimonialCard from "@/components/apps/TestimonialCard";
import FeatureCheck from "@/components/apps/FeatureCheck";
import AppStoreButtons from "@/components/apps/AppStoreButtons";
import { Card, CardContent } from "@repo/ui/card";
import { cn } from "@repo/ui/cn";
import {
  Bell,
  CalendarCheck,
  Shield,
  BarChart,
  Users,
  Star,
  BookOpen,
  Video,
  MessageSquare,
  Phone,
  CheckCircle,
  Download,
  ArrowRight,
  LifeBuoy,
  Settings,
  Clock,
  Award,
  UserPlus,
  PlayCircle,
} from "lucide-react";
import HowItWorksStep from "@/components/apps/HowItWorksStep";
import HowItWorks from "@/components/landing/HowItWorks";

export default function AppsPage() {
  return (
    <div className="bg-background">
      <HeroSection />
      <FeaturesGridSection />
      <TestimonialsSection />
      <FeatureComparisonSection />
      <HowItWorks />
      <SecuritySection />
      <AppPromotionSection
        title="Vendor CRM App (For Your Business)"
        description="Manage your entire salon from the palm of your hand. Our vendor app gives you the power to run your business from anywhere, at any time."
        images={[
          {
            src: "https://placehold.co/375x812.png",
            hint: "app dashboard screen",
          },
          {
            src: "https://placehold.co/375x812.png",
            hint: "app calendar view",
          },
          {
            src: "https://placehold.co/375x812.png",
            hint: "app analytics chart",
          },
        ]}
        reverse={true}
      />
      <FinalCTASection />
    </div>
  );
}
