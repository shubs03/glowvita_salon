"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Search, Video, MessageCircle, Calendar, Shield, Clock } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:20px_20px]" />
      <div className="container mx-auto px-4 py-16 lg:py-24 relative">
        <div className="max-w-5xl mx-auto text-center">
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-6">
            Expert Medical{" "}
            <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
              Consultations
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Get professional medical advice from certified doctors through secure video consultations. Available 24/7 for your convenience.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="bg-white rounded-md shadow-lg border border-border/50 overflow-hidden">
              <div className="flex items-center p-2">
                <div className="flex items-center flex-1">
                  <Search className="h-5 w-5 text-muted-foreground mx-3" />
                  <Input
                    placeholder="Search doctors for consultation"
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base bg-transparent placeholder:text-muted-foreground/60"
                  />
                </div>
                <div className="p-1">
                  <Button className="px-8 py-3 text-base rounded-md">
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10 max-w-4xl mx-auto">
            <Button
              asChild
              size="lg"
              className="px-8 py-4 rounded-md font-semibold text-base bg-primary hover:bg-primary/90"
            >
              <Link href="/doctors/consultations/instant" className="flex items-center gap-3">
                <Video className="h-4 w-4" />
                Start Instant Consultation
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-4 rounded-md font-semibold text-base border-2 border-primary/30 hover:border-primary/50 bg-transparent hover:bg-primary/5 text-primary transition-all duration-300"
            >
              <Link href="/doctors/consultations/schedule" className="flex items-center gap-3">
                <Calendar className="h-4 w-4" />
                Schedule Consultation
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>100% Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-blue-500" />
              <span>HD Video Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>Available 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-purple-500" />
              <span>Chat Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}