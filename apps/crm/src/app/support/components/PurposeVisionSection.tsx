import React from "react";

const PurposeVisionSection = () => {
  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          Our Support Promise
        </h2>
        <p className="text-muted-foreground mt-3 text-sm max-w-2xl">
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
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300">
                <path d="m7 17 4-4-4-4"></path>
                <path d="m11 13 4 4 4-4"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PurposeVisionSection;