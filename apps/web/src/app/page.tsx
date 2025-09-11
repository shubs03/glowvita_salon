
"use client";
import {
  HeroSection,
  AppCTA,
  FeaturedSalons,
  HowItWorks,
  PlatformFor,
  Testimonials,
  Offers,
  FAQ,
  AdvantageCard,
  VideoTestimonialSection,
  SecuritySection,
  FeaturedProducts,
  Integrations,
  KeyFeatures,
} from "@/components/landing";
import { Award, Users, LineChart, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@repo/ui/button';

export default function HomePage() {

  const scrollAdvantages = (direction: "left" | "right") => {
    const container = document.getElementById("advantages-container");
    if (container) {
      const scrollAmount = container.clientWidth / 2;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow">
        <HeroSection />
        
        <PlatformFor />
        <FeaturedSalons />
        <Offers />
        <HowItWorks />
        <FeaturedProducts />
        
        <section className="py-16 md:py-20 bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Award className="h-4 w-4" />
                Real Results
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-headline mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Unlock Your Potential
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
                See the real-world impact of using our CRM. These metrics
                represent actual improvements from our satisfied clients.
              </p>
            </div>
            <div
              id="advantages-container"
              className="flex gap-4 md:gap-8 pb-8 overflow-x-auto snap-x snap-mandatory no-scrollbar"
            >
              <AdvantageCard
                stat="40%"
                title="Increase in Bookings"
                description="Clients booking through our platform are more likely to commit and show up for their appointments."
                icon={<Users />}
              />
              <AdvantageCard
                stat="25%"
                title="More Repeat Clients"
                description="Build lasting loyalty with detailed client profiles and personalized service experiences."
                icon={<Users />}
              />
              <AdvantageCard
                stat="15%"
                title="Higher Average Spend"
                description="Intelligently upsell services and products by understanding complete client history and preferences."
                icon={<LineChart />}
              />
              <AdvantageCard
                stat="50%"
                title="Less Admin Time"
                description="Automate reminders and administrative tasks so you can focus on your craft and clients."
                icon={<Clock />}
              />
            </div>
            <div className="flex justify-center mt-8">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-full"
                  onClick={() => scrollAdvantages("left")}
                >
                  <ArrowRight className="h-4 w-4 transform rotate-180" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-full"
                  onClick={() => scrollAdvantages("right")}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <VideoTestimonialSection />
        <Testimonials />
        <SecuritySection />
        <Integrations />
        <FAQ />
        <KeyFeatures />
        <AppCTA />

      </main>
    </div>
  );
}
