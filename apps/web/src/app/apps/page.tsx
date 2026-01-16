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
      />

      {/* Section 2: Main App Promotion */}
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
        title="What Our Customers Say"
        description="Hear from the people who matter most to us."
        testimonials={[{
          review: "GlowVita transformed how I manage my salon bookings. The interface is intuitive and the customer engagement features have increased our revenue by 40%.",
          author: "Sarah Johnson",
          location: "New York, NY",
          rating: 5
        }, {
          review: "As a customer, I love how easy it is to book appointments and discover new beauty services. The app makes finding trusted professionals effortless.",
          author: "Michael Chen",
          location: "Los Angeles, CA",
          rating: 5
        }, {
          review: "The marketing tools helped my small spa reach new customers. Our bookings doubled within two months of using GlowVita.",
          author: "Emma Rodriguez",
          location: "Miami, FL",
          rating: 4
        }, {
          review: "Outstanding platform for both service providers and clients. The payment processing is seamless and the customer support is responsive.",
          author: "David Thompson",
          location: "Chicago, IL",
          rating: 5
        }]}
      />

    </PageContainer>
  );
}
