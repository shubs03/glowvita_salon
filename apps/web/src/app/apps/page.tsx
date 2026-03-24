"use client";

import { PageContainer } from "@repo/ui/page-container";
// Import section components
import { HeroSection } from "../../components/apps/HeroSection";
import { FeaturesGridSection } from "../../components/apps/FeaturesGridSection";
import { TestimonialsSection } from "../../components/apps/TestimonialsSection";
import { HowItWorksSection } from "../../components/apps/HowItWorksSection";
import { SecuritySection } from "../../components/apps/SecuritySection";
import { FeatureComparisonSection } from "../../components/apps/FeatureComparisonSection";
import { FaqSection } from "../../components/apps/FaqSection";
import { AppPromotionSection } from "../../components/apps/AppPromotionSection";
import { FinalCtaSection } from "../../components/apps/FinalCtaSection";

// Import icons
import {
  Bell,
  CheckCircle,
  CalendarCheck,
  Download,
  Shield,
  BarChart,
  Users,
  Star,
  ArrowRight,
  BookOpen,
  Video,
  MessageSquare,
  Phone,
  LifeBuoy,
  Settings,
  Clock,
  Award,
  UserPlus,
  PlayCircle,
} from "lucide-react";
import { cn } from "@repo/ui/cn";

export default function AppsPage() {
  return (
    <PageContainer padding="none">
      {/* Section 1: Hero */}
      <HeroSection
        title="Your Business, In Your Pocket"
        description="Manage your salon and connect with your clients on the go with our powerful, intuitive mobile apps."
        subTitle="From managing appointments to connecting with clients, everything you need for your salon business is right here in one place."
        backgroundImage="/appbackimage.png"
        ctaButtons={[
          {
            text: "Join GlowVita Today",
            href: "/login",
            variant: "primary",
          },
        ]}
      />

      {/* Section 2: App Features */}
      <FeaturesGridSection 
        title="App Features"
        description="Powerful tools designed to streamline your salon business and enhance customer relationships."
      />

      {/* Section 3: Main App Promotion */}
      <AppPromotionSection
        title="Download the GlowVita App"
        description="Discover and book top-rated salons, spas, and wellness experiences instantly with GlowVita."
        features={[
          {
            title: "Instant booking",
          },
          {
            title: "Verified professionals",
          },
          {
            title: "Secure payments",
          },
          {
            title: "Real-time updates",
          },
        ]}
        images={[
          {
            src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600",
            hint: "GlowVita App Screen",
          },
        ]}
      />

      <TestimonialsSection
        title="Here is what our Clients are saying About us"
        testimonials={[
          {
            name: "Olivia Cameron",
            role: "Nail Artist & Owner",
            review: "Finally, a CRM that truly understands the beauty industry. Before this, we were juggling appointment books, WhatsApp messages and spreadsheets. Now everything — bookings, client history, payments, and staff schedules — is in one place. The analytics help us see which services are most popular and which days are busiest, so we can plan better. It has completely changed the way we run our salon, and honestly, we can't imagine going back to our old system.",
            date: "May 8, 2020",
            imageSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
          },
          {
            name: "Sarah Johnson",
            role: "Salon Director, Glow Loft",
            review: "GlowVita transformed how I manage my salon bookings. The interface is intuitive and the real-time updates have virtually eliminated double-bookings. Our customer engagement features have increased our revenue by 40% in just six months.",
            date: "October 14, 2021",
            imageSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop"
          },
          {
            name: "Michael Chen",
            role: "Creative Partner, Style Studio",
            review: "As a professional, I love how easy it is to manage my chair and communicate with clients. The automated reminders are a lifesaver, and the reporting tools help me track my growth perfectly. This app makes finding and keeping trusted professionals effortless.",
            date: "February 22, 2023",
            imageSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
          }
        ]}
      />

      <FeatureComparisonSection
        title="VENDOR APP FEATURES"
        description="Everything your vendor business needs — beautifully unified in one app."
      />

      <HowItWorksSection
        title="How It Works"
        description="Our simple 4-step process to transform your salon business with our CRM platform."
      />

    </PageContainer>
  );
}
