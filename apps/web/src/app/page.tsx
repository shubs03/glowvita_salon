
"use client";
import {
  HeroSection,
  AppCTA,
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
  Blog,
  Services,
  BentoGrid,
  SalonsSection,
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
        <SalonsSection />
        <Offers />
        {/* <BentoGrid/> */}
        <PlatformFor />
        {/* <HowItWorks /> */}
        <FeaturedProducts />
        <Services />
        
        <section className="py-20 md:py-28 bg-gradient-to-br from-background via-primary/8 to-secondary/8 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,white,transparent_70%)] opacity-20"></div>
            <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-primary/15 to-transparent rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-secondary/15 to-transparent rounded-full blur-3xl animate-float-delayed"></div>
            
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Unlock Your Salon's Full Potential
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                See the real-world impact of using our comprehensive salon management platform. These metrics represent actual improvements from our satisfied clients across the globe.
              </p>
            </div>
            
            <div
              id="advantages-container"
              className="flex gap-6 md:gap-8 pb-8 overflow-x-auto snap-x snap-mandatory no-scrollbar"
            >
              <AdvantageCard
                stat="40%"
                title="Increase in Bookings"
                description="Clients booking through our platform are more likely to commit and show up for their appointments with automated reminders and seamless experience."
                icon={<Users />}
              />
              <AdvantageCard
                stat="25%"
                title="More Repeat Clients"
                description="Build lasting loyalty with detailed client profiles, service history, and personalized experiences that keep customers coming back."
                icon={<Users />}
              />
              <AdvantageCard
                stat="15%"
                title="Higher Average Spend"
                description="Intelligently upsell services and products by understanding complete client history, preferences, and targeted recommendations."
                icon={<LineChart />}
              />
              <AdvantageCard
                stat="50%"
                title="Less Admin Time"
                description="Automate appointment reminders, payment processing, and administrative tasks so you can focus on your craft and clients."
                icon={<Clock />}
              />
              <AdvantageCard
                stat="50%"
                title="Less Admin Time"
                description="Automate appointment reminders, payment processing, and administrative tasks so you can focus on your craft and clients."
                icon={<Clock />}
              />
            </div>
            
            <div className="flex justify-start mt-12">
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-full bg-background hover:bg-primary hover:text-white border-2 hover:border-primary group"
                  onClick={() => scrollAdvantages("left")}
                >
                  <ArrowRight className="h-4 w-4 transform rotate-180 group-hover:scale-110 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-full bg-background hover:bg-primary hover:text-white border-2 hover:border-primary group"
                  onClick={() => scrollAdvantages("right")}
                >
                  <ArrowRight className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <VideoTestimonialSection />
        <Testimonials />
        {/* <SecuritySection /> */}
        {/* <Integrations /> */}
        {/* <Blog /> */}
        <FAQ />
        <AppCTA />

      </main>
    </div>
  );
}
