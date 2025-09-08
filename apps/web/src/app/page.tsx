
"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Search, MapPin } from "lucide-react";
import { AppCTA } from "@/components/landing/AppCTA";
import { FeaturedSalons } from "@/components/landing/FeaturedSalons";
import { HowItWorks } from "@/components/landing/HowItWorks";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
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

        <FeaturedSalons />
        <HowItWorks />
        <AppCTA />

      </main>
    </div>
  );
}
