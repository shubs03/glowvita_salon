
import { Search, MapPin, Star, Scissors, Sparkles, ShieldCheck, User } from "lucide-react";
import { Input } from "@repo/ui/input";
import { Button } from '@repo/ui/button';

export const HeroSection = () => {
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
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black font-headline tracking-tighter mb-6">
          <span className="bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            Find & Book
          </span>{" "}
          <span className="italic text-foreground">Your Next Look</span>
        </h1>

        {/* Sub-text */}
        <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
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

        {/* Category quick links */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <p className="text-sm text-muted-foreground font-medium mr-2">Popular:</p>
          {["Haircuts", "Nails", "Spa", "Barbershop"].map((cat) => (
            <button
              key={cat}
              className="px-4 py-1.5 rounded-full bg-secondary/20 hover:bg-primary/10 text-sm font-medium transition"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
