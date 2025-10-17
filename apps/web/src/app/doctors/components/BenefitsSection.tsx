"use client";

import { Shield, Clock, Video, FileText, Phone, Award, Zap, Heart } from "lucide-react";

export function BenefitsSection() {
  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description: "No more waiting rooms or travel time. Get expert medical advice from anywhere."
    },
    {
      icon: Shield,
      title: "100% Secure",
      description: "End-to-end encryption ensures your medical information stays private and protected."
    },
    {
      icon: Video,
      title: "HD Video Quality",
      description: "Crystal clear video consultations with reliable connection for accurate diagnosis."
    },
    {
      icon: FileText,
      title: "Digital Prescriptions",
      description: "Receive digital prescriptions instantly and access your medical records anytime."
    },
    {
      icon: Phone,
      title: "24/7 Support",
      description: "Round-the-clock customer support and emergency medical assistance available."
    },
    {
      icon: Award,
      title: "Certified Doctors",
      description: "All our doctors are board-certified and verified medical professionals."
    },
    {
      icon: Zap,
      title: "Instant Consultation",
      description: "Connect with available doctors within minutes for urgent medical needs."
    },
    {
      icon: Heart,
      title: "Affordable Care",
      description: "Quality healthcare at transparent pricing with no hidden fees or charges."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-4">
            Why Choose Our Platform
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Experience the future of healthcare with our comprehensive online consultation platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="group relative p-6 rounded-md transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-400/10 to-blue-400/5 border border-blue-400/10 hover:border-blue-400/20 cursor-pointer"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 bg-blue-400/15">
                    <IconComponent className="h-8 w-8 text-blue-400" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-blue-400 transition-colors">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>

                  {/* Subtle underline animation */}
                  <div className="h-0.5 w-0 bg-blue-400 mt-4 transition-all duration-300 rounded-full group-hover:w-8" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Experience Better Healthcare?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of patients who have made the smart choice for their health
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-400/10 border border-blue-400/20 rounded-md">
                <Shield className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium text-blue-700">HIPAA Compliant</span>
              </div>
              <div className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-400/10 border border-blue-400/20 rounded-md">
                <Award className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium text-blue-700">Licensed Doctors</span>
              </div>
              <div className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-400/10 border border-blue-400/20 rounded-md">
                <Clock className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium text-blue-700">Available 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}