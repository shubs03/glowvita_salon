import React from "react";
import { ArrowRight } from "lucide-react";
import { NEXT_PUBLIC_CRM_URL } from "@repo/config/config";

const PurposeVisionSection = () => {
  return (
    <section className="py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-6 md:mb-8 lg:mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-2 md:pb-4">
          Our Purpose & Vision
        </h2>
        <p className="text-muted-foreground mt-2 md:mt-3 text-sm md:text-base max-w-2xl">
          Understanding our foundation and envisioning our future
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-stretch">
        {/* Left Column - Purpose */}
        <div className="bg-card border border-border rounded-xl md:rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4 md:mb-6">
            <div className="bg-primary/10 text-primary p-2 sm:p-3 rounded-xl md:rounded-2xl flex-shrink-0 group-hover:bg-primary/20 transition-all duration-300">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                1
              </div>
            </div>
            <h3 className="font-bold text-card-foreground text-lg sm:text-xl items-center leading-tight">
              Our Purpose
            </h3>
          </div>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed pl-0 sm:pl-10 md:pl-16">
            We believe everyone deserves access to exceptional beauty and
            wellness services. GlowVita was created to bridge the gap between
            talented professionals and customers seeking transformative
            experiences, making premium self-care simple, trusted, and
            effortlessly within reach.
          </p>
        </div>

        {/* Right Column - Future Vision */}
        <div className="bg-card border border-border rounded-xl md:rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4 md:mb-6">
            <div className="bg-primary/10 text-primary p-2 sm:p-3 rounded-xl md:rounded-2xl flex-shrink-0 group-hover:bg-primary/20 transition-all duration-300">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                2
              </div>
            </div>
            <h3 className="font-bold text-card-foreground text-lg sm:text-xl items-center leading-tight">
              Our Vision
            </h3>
          </div>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed pl-0 sm:pl-10 md:pl-16 mb-4 md:mb-6">
            We're constantly evolving to bring you better experiences,
            innovative features, and deeper connections with the beauty and
            wellness community you trust. Our journey is just beginning, and
            we're excited to have you with us.
          </p>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed pl-0 sm:pl-10 md:pl-16 mb-6 md:mb-8">
            Join us in shaping the future of beauty and wellness services.
          </p>

          <div className="pl-0 sm:pl-10 md:pl-16">
            <a
              href={`${NEXT_PUBLIC_CRM_URL}/login`} target="_blank"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3 sm:px-6 sm:py-3.5 md:px-8 md:py-4 rounded-lg md:rounded-xl font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 shadow-sm hover:shadow-md group w-full sm:w-auto"
            >
              Get Started Today
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PurposeVisionSection;
