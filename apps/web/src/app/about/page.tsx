"use client";
import { PageContainer } from "@repo/ui/page-container";
import DownloadApp from "@/components/landing/DownloadApp";

import PurposeVisionSection from "./components/PurposeVisionSection";
import AudienceSection from "./components/AudienceSection";
import PhilosophySection from "./components/PhilosophySection";
import HeroSection from "./components/HeroSection";
import WhyChooseUs from "@/components/landing/WhyChooseUs";

export default function AboutPage() {
  return (
    <PageContainer padding="none">
      <HeroSection />
      <PurposeVisionSection />
      <WhyChooseUs />
      <AudienceSection />
      <PhilosophySection />
      <DownloadApp />

    </PageContainer>
  );
}
