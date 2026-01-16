
import React from "react";
import ContactForm from "./components/ContactForm";
import SupportApproach from "./components/SupportApproach";
import IntroductionSection from "./components/IntroductionSection";
import StatsSection from "./components/StatsSection";
import PurposeVisionSection from "./components/PurposeVisionSection";
import SupportFeaturesSection from "./components/SupportFeaturesSection";
import CallToActionSection from "./components/CallToActionSection";

const SupportPage = () => {
  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <main className="flex-grow">
        <IntroductionSection />
        <StatsSection />
        <ContactForm />
        <PurposeVisionSection />
        <SupportFeaturesSection />
        <SupportApproach />
        <CallToActionSection />
      </main>
    </div>
  );
};

export default SupportPage;
