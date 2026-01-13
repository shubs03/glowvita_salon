import React from "react";
import { PlayCircle, Phone, ArrowRight } from "lucide-react";

const SupportFeaturesSection = () => {
  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          Support Resources
        </h2>
        <p className="text-muted-foreground mt-3 text-sm max-w-2xl">
          Comprehensive tools to help you succeed
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50 text-center">
          <div className="mx-auto bg-primary/10 text-primary p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <PlayCircle className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-card-foreground text-xl mb-2">Video Tutorials</h3>
          <p className="text-muted-foreground mb-4">
            Watch step-by-step video guides demonstrating how to use various features of GlowVita CRM effectively.
          </p>
          <a href="/support/tutorials" className="text-primary hover:underline font-medium inline-flex items-center gap-2">
            Watch Tutorials
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50 text-center">
          <div className="mx-auto bg-primary/10 text-primary p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Phone className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-card-foreground text-xl mb-2">Phone Support</h3>
          <p className="text-muted-foreground mb-4">
            Connect with our support team via phone for immediate assistance with any questions or issues.
          </p>
          <a href="/support/phone" className="text-primary hover:underline font-medium inline-flex items-center gap-2">
            Call Now
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default SupportFeaturesSection;