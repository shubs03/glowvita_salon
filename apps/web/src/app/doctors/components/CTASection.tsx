"use client";

import { Button } from "@repo/ui/button";
import { Calendar, Video, ArrowRight, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Start Your Health Journey Today
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Connect with top medical professionals and get the personalized care you deserve. Quality healthcare is just a click away.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10">
            <Button
              size="lg"
              variant="secondary"
              className="px-10 py-4 text-base rounded-md bg-white text-primary hover:bg-white/90 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href="/doctors/consultations/instant" className="flex items-center gap-3">
                <Video className="h-5 w-5" />
                Start Instant Consultation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="px-10 py-4 text-base border-2 border-white text-white hover:bg-white hover:text-primary font-semibold transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href="/doctors/appointments" className="flex items-center gap-3">
                <Calendar className="h-5 w-5" />
                Schedule Appointment
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-3">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">24/7 Available</h3>
              <p className="text-sm text-white/80">
                Round-the-clock medical support whenever you need it
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-3">
                <Video className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">HD Video Quality</h3>
              <p className="text-sm text-white/80">
                Crystal clear consultations with reliable connections
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-3">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Instant Support</h3>
              <p className="text-sm text-white/80">
                Get help from our support team anytime you need assistance
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-white/90">
            <div className="text-center">
              <div className="text-2xl font-bold">50,000+</div>
              <div className="text-sm">Happy Patients</div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-white/30"></div>
            <div className="text-center">
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm">Expert Doctors</div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-white/30"></div>
            <div className="text-center">
              <div className="text-2xl font-bold">4.9/5</div>
              <div className="text-sm">Patient Rating</div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-white/30"></div>
            <div className="text-center">
              <div className="text-2xl font-bold">15 min</div>
              <div className="text-sm">Avg Response</div>
            </div>
          </div>

          <p className="text-sm text-white/70 mt-6">
            Trusted by millions for their healthcare needs • HIPAA Compliant • Licensed Doctors
          </p>
        </div>
      </div>
    </section>
  );
}