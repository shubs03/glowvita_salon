"use client";
import { PageContainer } from "@repo/ui/page-container";
import DownloadApp from "@/components/landing/DownloadApp";
import CTASection from "../salons/components/CTASection";
import PurposeVisionSection from "./components/PurposeVisionSection";
import AudienceSection from "./components/AudienceSection";
import PhilosophySection from "./components/PhilosophySection";
import IntroductionSection from "./components/Intro";
import WhyChooseUs from "@/components/landing/WhyChooseUs";

export default function AboutPage() {
  return (
<PageContainer padding="none">
      <IntroductionSection/>
      <PurposeVisionSection/>
      <WhyChooseUs/>
      <AudienceSection/>
      <PhilosophySection/>
      <DownloadApp />
      <CTASection />
    </PageContainer>
  );
}
