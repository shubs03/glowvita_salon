import React from "react";
import { ArrowRight } from "lucide-react";

const PurposeVisionSection = () => {
  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      <div className="mb-8 pl-1">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1C] relative inline-block pb-3 mb-2">
          Our Support Promise
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#302131] to-transparent"></div>
        </h2>
        <p className="text-muted-foreground text-[14px] max-w-2xl mt-1">
          Dedicated to helping your salon business succeed
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:bg-primary/20 transition-all duration-300">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                1
              </div>
            </div>
            <h3 className="font-bold text-card-foreground text-xl items-center leading-tight">
              Getting Started
            </h3>
          </div>
          <p className="text-muted-foreground text-base leading-relaxed pl-16">
            New to GlowVita CRM? We offer comprehensive onboarding resources to help you set up your salon management system.
            From adding your services to configuring staff schedules, our guides will walk you through every step.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:bg-primary/20 transition-all duration-300">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                2
              </div>
            </div>
            <h3 className="font-bold text-card-foreground text-xl items-center leading-tight">
              Ongoing Support
            </h3>
          </div>
          <p className="text-muted-foreground text-base leading-relaxed pl-16 mb-8">
            As your business grows, we're here to support you. Our team provides continuous assistance with advanced features,
            troubleshooting, and optimization strategies to maximize your CRM investment.
          </p>
          <div className="pl-16">
            <a
              href="/support/contact"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-sm hover:shadow-md group"
            >
              Contact Support
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PurposeVisionSection;