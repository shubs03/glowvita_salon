"use client";

import {
  HeroSection,
  SpecialtiesSection,
  CommonHealthConcernsSection,
  OurDoctorsSection,
  StatSection,
  BenefitsSection,
  TestimonialsSection,
  FAQSection,
  CTASection,
  DownloadAppSection
} from "../components";

export default function ConsultPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Specialties Section with Marquee */}
      <SpecialtiesSection />

      {/* Common Health Concerns Section */}
      <CommonHealthConcernsSection />

      {/* Our Doctors Section */}
      <OurDoctorsSection />

      {/* Stats Section */}
      <StatSection />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <CTASection />

      {/* Download App Section */}
      <DownloadAppSection />
    </div>
  );
}