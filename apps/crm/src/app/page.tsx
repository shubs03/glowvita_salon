
"use client";

import Link from "next/link";
import { Button } from "@repo/ui/button";
import { PageContainer } from "@repo/ui/page-container";
import {
  ArrowRight,
  Book,
  CalendarCheck,
  LineChart,
  Check,
  CheckCircle,
  MessageSquare,
  CreditCard,
  Scissors,
  HelpCircle,
  Rocket,
  LogIn,
  UserPlus,
  Users,
  Shield,
  Settings,
  Plus,
  Star,
  Phone,
  Download,
  Clock,
  PlayCircle,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Heart,
  Globe,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import HeroSection from "@/components/landing/HeroSection";
import CoreFeatures from "@/components/landing/CoreFeatures";
import WhyChooseUsCRM from "@/components/landing/WhyChooseUsCRM";
import CompleteSolution from "@/components/landing/CompleteSolution";
import RealResults from "@/components/landing/RealResults";
import ClientReviews from "@/components/landing/ClientReviews";
import UniversalPlatform from "@/components/landing/UniversalPlatform";
import FAQSection from "@/components/landing/FAQSection";
import GetStartedToday from "@/components/landing/GetStartedToday";
import HowItWorks from "@/components/landing/HowItWorks";
import TestimonialsCRM from "@/components/landing/TestimonialsCRM";
import OverviewPreview from "@/components/landing/OverviewPreview";
import CTACRM from "@/components/landing/CTACRM";

export default function CrmHomePage() {
  useEffect(() => {
    // Handle smooth scrolling when page loads with hash
    if (window.location.hash) {
      const hash = window.location.hash.substring(1); // Remove # symbol
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
        {/* <ClientReviews /> */}
        {/* <UniversalPlatform /> */}
        {/* <FAQSection /> */}
        {/* <GetStartedToday /> */}
        <CTACRM />
      </main>
    </div>
  );
}
