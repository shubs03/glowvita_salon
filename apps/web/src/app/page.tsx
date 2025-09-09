
"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Search, MapPin, ArrowRight, Award, Check, Clock, LineChart, Users } from "lucide-react";
import { AppCTA } from "@/components/landing/AppCTA";
import { FeaturedSalons } from "@/components/landing/FeaturedSalons";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PlatformFor } from "@/components/landing/PlatformFor";
import { Testimonials } from "@/components/landing/Testimonials";
import { Offers } from "@/components/landing/Offers";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { AdvantageCard, VideoTestimonialSection, SecuritySection } from "@/components/landing/NewSections";

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
        <section className="relative py-20 md:py-32 bg-secondary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 -z-10"></div>
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent -z-10"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-headline tracking-tighter mb-6 bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent">
                Find & Book Your Next Look
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                Discover top-rated salons, spas, and barbershops near you. Effortlessly book appointments online, 24/7.
              </p>
              
              <div className="max-w-3xl mx-auto">
                <div className="relative bg-background rounded-full p-2 shadow-2xl shadow-primary/10 border border-border/50 flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative flex-grow w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="Search for services or salons"
                      className="h-12 text-base pl-12 rounded-full sm:rounded-none sm:rounded-l-full border-0 focus-visible:ring-0 bg-transparent w-full"
                    />
                  </div>
                  <div className="hidden sm:block w-px h-6 bg-border"></div>
                  <div className="relative flex-grow w-full">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="Near me"
                      className="h-12 text-base pl-12 rounded-full sm:rounded-none sm:rounded-r-full border-0 focus-visible:ring-0 bg-transparent w-full"
                    />
                  </div>
                  <Button size="lg" className="rounded-full w-full sm:w-auto px-8 h-12 text-base font-semibold group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
                    Search <Search className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <PlatformFor />
        <FeaturedSalons />
        <Offers />
        
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

        <HowItWorks />
        <VideoTestimonialSection />
        <Testimonials />
        <Pricing />
        <SecuritySection />
        <FAQ />
        <AppCTA />

      </main>
    </div>
  );
}
