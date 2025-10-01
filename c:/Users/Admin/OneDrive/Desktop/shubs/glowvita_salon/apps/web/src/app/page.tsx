
"use client";

import { cn } from "@repo/ui/cn";
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
  Integrations,
  Blog,
  Services,
  SalonsSection,
} from "@/components/landing";

// import { FeaturedProducts } from "@/components/landing/FeaturedProducts";
import { NewProductCard } from "@/components/landing/NewProductCard";

import { Award, Users, LineChart, Clock, ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { useGetAdminProductCategoriesQuery } from "@repo/store/api";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);

  const { data: ProductCategoryData } =
    useGetAdminProductCategoriesQuery(undefined);
  console.log("Product Category Data : ", ProductCategoryData);

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

  // Mock products data for NewProductCard
  const [products, setProducts] = useState([
    {
      id: "1",
      name: "Radiant Glow Serum",
      price: 45.99,
      image: "https://placehold.co/320x224.png",
      hint: "Brightening vitamin C serum",
      rating: 4.8,
      reviewCount: 324,
      vendorName: "Aura Cosmetics",
      isNew: true,
      description:
        "A powerful vitamin C serum that brightens and evens skin tone",
      category: "skincare",
    },
    {
      id: "2",
      name: "Luxury Face Cream",
      price: 78.5,
      image: "https://placehold.co/320x224.png",
      hint: "Anti-aging moisturizer",
      rating: 4.9,
      reviewCount: 567,
      vendorName: "Serenity Skincare",
      description: "Rich anti-aging cream with peptides and hyaluronic acid",
      category: "skincare",
    },
    {
      id: "3",
      name: "Matte Lipstick Set",
      price: 32.0,
      image: "https://placehold.co/320x224.png",
      hint: "Long-lasting matte lipsticks",
      rating: 4.7,
      reviewCount: 892,
      vendorName: "Chroma Beauty",
      isNew: true,
      description: "Set of 6 long-lasting matte lipsticks in trending shades",
      category: "cosmetics",
    },
    {
      id: "4",
      name: "Gentle Cleansing Oil",
      price: 28.75,
      image: "https://placehold.co/320x224.png",
      hint: "Removes makeup effortlessly",
      rating: 4.6,
      reviewCount: 445,
      vendorName: "Earthly Essentials",
      description: "Natural cleansing oil that removes makeup and impurities",
      category: "facecare",
    },
    {
      id: "5",
      name: "Body Butter Trio",
      price: 56.99,
      image: "https://placehold.co/320x224.png",
      hint: "Nourishing body care set",
      rating: 4.8,
      reviewCount: 234,
      vendorName: "Earthly Essentials",
      description: "Set of 3 rich body butters with natural ingredients",
      category: "bodycare",
    },
    {
      id: "6",
      name: "Eye Shadow Palette",
      price: 42.25,
      image: "https://placehold.co/320x224.png",
      hint: "12 versatile shades",
      rating: 4.9,
      reviewCount: 678,
      vendorName: "Chroma Beauty",
      description: "Professional eyeshadow palette with 12 blendable shades",
      category: "cosmetics",
    },
  ]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("platform-for");
    if (element) observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow">
        <HeroSection />
        <SalonsSection />
        <Offers />
        {/* <BentoGrid/> */}
        <PlatformFor />
        {/* <HowItWorks /> */}
        {/* <FeaturedProducts /> */}
        {/* Replace FeaturedProducts with NewProductCard grid */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div
              className={cn(
                "text-center space-y-6transition-all duration-1000 lg:py-16 md:py-16 py-8",
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              )}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent pb-3">
                A Platform for Every Style
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Whether you're running a small boutique salon or managing
                multiple locations, our platform scales with your ambitions and
                adapts to your unique business needs.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {products.map((product) => (
                <NewProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </section>
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
                See the real-world impact of using our comprehensive salon
                management platform. These metrics represent actual improvements
                from our satisfied clients across the globe.
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
