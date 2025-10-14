"use client";

import { Button } from "@repo/ui/button";
import { Smartphone, Download, Apple, Play, Star, Shield, Zap, Clock } from "lucide-react";
import Link from "next/link";

export function DownloadAppSection() {
  const appFeatures = [
    {
      icon: Zap,
      title: "Instant Access",
      description: "Connect with doctors in seconds"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "End-to-end encrypted consultations"
    },
    {
      icon: Clock,
      title: "24/7 Available",
      description: "Healthcare whenever you need it"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="mb-8">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-6">
                Download Our{" "}
                <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
                  Mobile App
                </span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Get instant access to healthcare professionals anytime, anywhere. Our mobile app makes it easier than ever to manage your health on the go.
              </p>
            </div>

            {/* App Features */}
            <div className="space-y-6 mb-8">
              {appFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={feature.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="px-8 py-4 rounded-md font-semibold text-base bg-black hover:bg-black/90 text-white"
                asChild
              >
                <Link href="#" className="flex items-center gap-3">
                  <Apple className="h-6 w-6" />
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-sm font-bold">App Store</div>
                  </div>
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 rounded-md font-semibold text-base border-2 border-primary/30 hover:border-primary/50 bg-transparent hover:bg-primary/5 text-foreground"
                asChild
              >
                <Link href="#" className="flex items-center gap-3">
                  <Play className="h-6 w-6 text-green-600" />
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="text-sm font-bold">Google Play</div>
                  </div>
                </Link>
              </Button>
            </div>

            {/* App Stats */}
            <div className="flex flex-col sm:flex-row gap-6 mt-8 pt-8 border-t border-border/30">
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-1 justify-center sm:justify-start mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">4.8/5</span> • 25,000+ reviews
                </div>
              </div>
              
              <div className="text-center sm:text-left">
                <div className="text-lg font-bold text-foreground">1M+</div>
                <div className="text-sm text-muted-foreground">App Downloads</div>
              </div>
              
              <div className="text-center sm:text-left">
                <div className="text-lg font-bold text-foreground">#1</div>
                <div className="text-sm text-muted-foreground">Health App</div>
              </div>
            </div>
          </div>

          {/* Right Content - Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Phone Frame */}
              <div className="relative w-64 h-[520px] bg-black rounded-[3rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Screen Content */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-500/10">
                    {/* Status Bar */}
                    <div className="h-10 bg-black/5 flex items-center justify-between px-6 text-xs">
                      <span className="font-medium">9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-2 bg-black/20 rounded-sm"></div>
                        <div className="w-2 h-2 bg-black/20 rounded-full"></div>
                        <div className="w-6 h-2 bg-black/20 rounded-sm"></div>
                      </div>
                    </div>

                    {/* App Header */}
                    <div className="px-6 py-4 bg-primary text-white">
                      <h3 className="text-lg font-bold">GlowVita Health</h3>
                      <p className="text-sm text-white/80">Your health companion</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="p-6 space-y-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <Smartphone className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Instant Consultation</div>
                            <div className="text-xs text-muted-foreground">Available now</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <Download className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Schedule Appointment</div>
                            <div className="text-xs text-muted-foreground">Book for later</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Health Records</div>
                            <div className="text-xs text-muted-foreground">Secure access</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around">
                      <div className="w-6 h-6 bg-primary rounded"></div>
                      <div className="w-6 h-6 bg-gray-300 rounded"></div>
                      <div className="w-6 h-6 bg-gray-300 rounded"></div>
                      <div className="w-6 h-6 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Download className="h-8 w-8 text-white" />
              </div>

              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-2xl border border-primary/10">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to Experience Healthcare Differently?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join millions who have already made the switch to convenient, quality healthcare through our mobile app.
          </p>
          <Button
            size="lg"
            className="px-10 py-4 text-base rounded-md font-semibold"
            asChild
          >
            <Link href="/doctors/consultations/instant" className="flex items-center gap-3">
              Start Free Consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}