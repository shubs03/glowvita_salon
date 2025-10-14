"use client";

import { Shield, Clock, Video, FileText, Phone, Award, Zap, Heart } from "lucide-react";

export function BenefitsSection() {
  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description: "No more waiting rooms or travel time. Get expert medical advice from anywhere.",
      color: "blue",
      gradient: "from-blue-500/10 to-blue-500/5"
    },
    {
      icon: Shield,
      title: "100% Secure",
      description: "End-to-end encryption ensures your medical information stays private and protected.",
      color: "green",
      gradient: "from-green-500/10 to-green-500/5"
    },
    {
      icon: Video,
      title: "HD Video Quality",
      description: "Crystal clear video consultations with reliable connection for accurate diagnosis.",
      color: "purple",
      gradient: "from-purple-500/10 to-purple-500/5"
    },
    {
      icon: FileText,
      title: "Digital Prescriptions",
      description: "Receive digital prescriptions instantly and access your medical records anytime.",
      color: "orange",
      gradient: "from-orange-500/10 to-orange-500/5"
    },
    {
      icon: Phone,
      title: "24/7 Support",
      description: "Round-the-clock customer support and emergency medical assistance available.",
      color: "red",
      gradient: "from-red-500/10 to-red-500/5"
    },
    {
      icon: Award,
      title: "Certified Doctors",
      description: "All our doctors are board-certified and verified medical professionals.",
      color: "yellow",
      gradient: "from-yellow-500/10 to-yellow-500/5"
    },
    {
      icon: Zap,
      title: "Instant Consultation",
      description: "Connect with available doctors within minutes for urgent medical needs.",
      color: "indigo",
      gradient: "from-indigo-500/10 to-indigo-500/5"
    },
    {
      icon: Heart,
      title: "Affordable Care",
      description: "Quality healthcare at transparent pricing with no hidden fees or charges.",
      color: "pink",
      gradient: "from-pink-500/10 to-pink-500/5"
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
                className={`group relative p-6 rounded-md transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${benefit.gradient} border hover:border-opacity-40 cursor-pointer`}
                style={{
                  borderColor: `${benefit.color === 'blue' ? 'rgb(59 130 246 / 0.1)' : 
                    benefit.color === 'green' ? 'rgb(34 197 94 / 0.1)' : 
                    benefit.color === 'purple' ? 'rgb(168 85 247 / 0.1)' :
                    benefit.color === 'orange' ? 'rgb(249 115 22 / 0.1)' :
                    benefit.color === 'red' ? 'rgb(239 68 68 / 0.1)' :
                    benefit.color === 'yellow' ? 'rgb(234 179 8 / 0.1)' :
                    benefit.color === 'indigo' ? 'rgb(99 102 241 / 0.1)' :
                    'rgb(236 72 153 / 0.1)'}`
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110`}
                       style={{
                         backgroundColor: `${benefit.color === 'blue' ? 'rgb(59 130 246 / 0.15)' : 
                           benefit.color === 'green' ? 'rgb(34 197 94 / 0.15)' : 
                           benefit.color === 'purple' ? 'rgb(168 85 247 / 0.15)' :
                           benefit.color === 'orange' ? 'rgb(249 115 22 / 0.15)' :
                           benefit.color === 'red' ? 'rgb(239 68 68 / 0.15)' :
                           benefit.color === 'yellow' ? 'rgb(234 179 8 / 0.15)' :
                           benefit.color === 'indigo' ? 'rgb(99 102 241 / 0.15)' :
                           'rgb(236 72 153 / 0.15)'}`
                       }}
                  >
                    <IconComponent className={`h-8 w-8`}
                                   style={{
                                     color: `${benefit.color === 'blue' ? 'rgb(59 130 246)' : 
                                       benefit.color === 'green' ? 'rgb(34 197 94)' : 
                                       benefit.color === 'purple' ? 'rgb(168 85 247)' :
                                       benefit.color === 'orange' ? 'rgb(249 115 22)' :
                                       benefit.color === 'red' ? 'rgb(239 68 68)' :
                                       benefit.color === 'yellow' ? 'rgb(234 179 8)' :
                                       benefit.color === 'indigo' ? 'rgb(99 102 241)' :
                                       'rgb(236 72 153)'}`
                                   }} />
                  </div>
                  
                  <h3 className={`text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors`}>
                    {benefit.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>

                  {/* Subtle underline animation */}
                  <div className={`h-0.5 w-0 bg-primary mt-4 transition-all duration-300 rounded-full group-hover:w-8`} />
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
              <div className="flex items-center justify-center gap-2 px-6 py-3 bg-white/50 border border-primary/10 rounded-md">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center justify-center gap-2 px-6 py-3 bg-white/50 border border-primary/10 rounded-md">
                <Award className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Licensed Doctors</span>
              </div>
              <div className="flex items-center justify-center gap-2 px-6 py-3 bg-white/50 border border-primary/10 rounded-md">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium">Available 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}