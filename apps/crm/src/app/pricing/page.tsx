"use client";

import Intro from './components/Intro';
import Pricing from './components/Pricing';
import FeatureCompare from './components/FeatureCompare';
import CTASection from './components/CTASection';

export default function PricingPage() {
  return (
    <div className="bg-background">
      <Intro />
      <Pricing />
      <FeatureCompare />
      <CTASection />
    </div>
  );
}