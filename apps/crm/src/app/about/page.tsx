import FinalCTASection from "@/components/apps/FinalCTASection";
import AudienceSection from "./components/AudienceSection";
import FeaturesSection from "./components/FeatureSection";
import IntroductionSection from "./components/Intro";
import PhilosophySection from "./components/PhilosophySection";
import PurposeVisionSection from "./components/PurposeVisionSection";
import StatsSection from "./components/StatsSection";
import AppPromotionSection from "@/components/apps/AppPromotionSection";

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <main className="flex-grow">
        <IntroductionSection />
        <StatsSection />
        <PurposeVisionSection />
        <FeaturesSection />
        <AudienceSection />
        <PhilosophySection />
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
      </main>
    </div>
  );
};
export default AboutPage;
