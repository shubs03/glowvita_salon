import { Search, MapPin, Star, Scissors, Sparkles, ShieldCheck, User } from "lucide-react";
import { Input } from "@repo/ui/input";
import { Button } from '@repo/ui/button';

const HeroSection = () => {
  return (
    <section className="relative py-24 md:py-36 bg-secondary/30 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/80 to-primary/5" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        {/* Promo banner */}
        <div className="mb-6 inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium">
          Flat 20% OFF on First Booking
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-headline tracking-tight mb-6">
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
          <div className="relative bg-background rounded-full p-2 shadow-2xl border border-border/50 flex flex-col sm:flex-row items-center gap-2">
            {/* Service search */}
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for services or salons"
                className="h-12 text-base pl-12 rounded-full sm:rounded-none sm:rounded-l-full border-0 focus-visible:ring-0 bg-transparent w-full"
              />
            </div>

            <div className="hidden sm:block w-px h-6 bg-border"></div>

            {/* Location search */}
            <div className="relative flex-grow w-full">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Near me"
                className="h-12 text-base pl-12 rounded-full sm:rounded-none sm:rounded-r-full border-0 focus-visible:ring-0 bg-transparent w-full"
              />
            </div>

            {/* CTA button */}
            <Button
              size="lg"
              className="rounded-full w-full sm:w-auto px-8 h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg transition-all duration-300"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Quick appointment + Hygiene badge */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full text-sm font-medium shadow">
            <ShieldCheck className="w-4 h-4 text-primary" /> Book in 2 Minutes – No Waiting
          </div>
          <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full text-sm font-medium shadow">
            <ShieldCheck className="w-4 h-4 text-primary" /> 100% Hygiene Certified
          </div>
        </div>

        {/* Top Cities */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {["Mumbai", "Pune", "Delhi", "Bangalore"].map((city) => (
            <button
              key={city}
              className="px-5 py-2 rounded-full bg-secondary/20 hover:bg-primary/10 text-sm font-medium transition"
            >
              {city}
            </button>
          ))}
        </div>

        {/* Featured Stylist */}
        <div className="mt-10 flex justify-center">
          <div className="bg-background border border-border/50 rounded-2xl p-5 flex items-center gap-4 shadow-lg max-w-sm">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Stylist of the Month</p>
              <p className="text-muted-foreground text-sm">
                Riya Sharma – Bridal & Hair Expert
              </p>
            </div>
          </div>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-6 mt-10 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" /> 10k+ Bookings
          </div>
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-primary" /> 500+ Partner Salons
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> 24/7 Online Booking
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;