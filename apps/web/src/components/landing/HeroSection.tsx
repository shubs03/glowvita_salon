
"use client";

import { Search, MapPin, Star, Scissors, Sparkles, ArrowRight } from "lucide-react";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";

export function HeroSection() {
  return (
    <section className="relative py-24 md:py-36 bg-secondary/30 overflow-hidden">
      {/* Background gradient & image overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/80 to-primary/5" />
      </div>

      {/* Floating decorative elements */}
      <Sparkles className="absolute top-20 left-10 text-primary/40 w-12 h-12 animate-pulse-slow" />
      <Scissors className="absolute bottom-32 right-12 text-primary/30 w-14 h-14 animate-bounce-soft" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-headline tracking-tighter mb-6">
          <span className="bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            Find & Book
          </span>{" "}
          <span className="italic text-foreground">Your Next Look</span>
        </h1>

        {/* Sub-text */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
          Discover top-rated salons, spas, and barbershops near you. Effortlessly
          book appointments online, 24/7.
        </p>

        {/* Search Bar */}
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
            
            <Button
              size="lg"
              className="rounded-full w-full sm:w-auto px-8 h-12 text-base font-semibold group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Search{" "}
              <Search className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
            </Button>
          </div>
        </div>

        {/* Category quick links */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {["💇 Haircuts", "💅 Nails", "💆 Spa", "✂️ Barbershop"].map((cat) => (
            <button
              key={cat}
              className="px-5 py-2 rounded-full bg-background/50 border border-border/50 hover:bg-primary/10 text-sm font-medium transition hover:shadow-md backdrop-blur-sm"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-6 mt-10 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" /> 10k+ Bookings
          </div>
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-primary" /> Top-rated salons
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> 24/7 Online Booking
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-primary rounded-full animate-pulse-slow"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
