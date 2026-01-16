
"use client";

import Link from 'next/link';
import Intro from './components/Intro';
import Pricing from './components/Pricing';
import FeatureCompare from './components/FeatureCompare';
import CTASection from '../salons/components/CTASection';

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
