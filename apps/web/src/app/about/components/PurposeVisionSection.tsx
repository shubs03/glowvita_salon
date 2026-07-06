import React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { NEXT_PUBLIC_CRM_URL } from "@repo/config/config";

const PurposeVisionSection = () => {
  return (
    <section className="pt-8 md:pt-12 lg:pt-16 pb-4 md:pb-6 lg:pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-2 md:mb-4 inline-block">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-primary whitespace-nowrap pb-2 md:pb-4">
          Our Purpose & Vision
        </h2>
        <div
          className="h-[2px] w-full"
          style={{
            background: "linear-gradient(90deg, #000000 0%, #FFFFFF 100%)",
          }}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center w-full mt-2">
        {/* Left Column - Purpose */}
        <div className="bg-card rounded-xl md:rounded-2xl p-5 sm:p-6 md:p-8 hover:shadow-md transition-all duration-300 group hover:border-primary/50 flex flex-col border border-border justify-center">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="bg-primary/10 p-2 sm:p-3 rounded-xl md:rounded-2xl flex-shrink-0 transition-all duration-300 mt-1">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[#422A3C] rounded-full flex items-center justify-center text-white text-sm font-bold">
                1
              </div>
            </div>
            <div className="flex-1">
              <p
                className="text-muted-foreground"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "26px",
                  textAlign: "justify",
                }}
              >
                We believe everyone deserves access to exceptional beauty and
                wellness services. GlowVita was created to bridge the gap between
                talented professionals and customers seeking transformative
                experiences, making premium self-care simple, trusted, and
                effortlessly within reach.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Vision */}
        <div className="bg-card rounded-xl md:rounded-2xl p-5 sm:p-6 md:p-8 hover:shadow-md transition-all duration-300 group hover:border-primary/50 flex flex-col border border-border">
          <div className="flex items-start gap-4 sm:gap-6 flex-1">
            <div className="bg-primary/10 p-2 sm:p-3 rounded-xl md:rounded-2xl flex-shrink-0 transition-all duration-300 mt-1">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[#422A3C] rounded-full flex items-center justify-center text-white text-sm font-bold">
                2
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <p
                className="text-muted-foreground mb-4"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "26px",
                  textAlign: "justify",
                }}
              >
                We're constantly evolving to bring you better experiences,
                innovative features, and deeper connections with the beauty and
                wellness community you trust. Our journey is just beginning, and
                we're excited to have you with us.
              </p>
              <p
                className="text-muted-foreground mb-6"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "26px",
                  textAlign: "justify",
                }}
              >
                Join us in shaping the future of beauty and wellness services.
              </p>
              <div className="mt-4 flex justify-center">
                <a
                  href={`${NEXT_PUBLIC_CRM_URL || "https://partners.glowvitasalon.com"}/login`}
                  className="inline-flex items-center justify-center gap-2 bg-[#422A3C] hover:bg-[#422A3C]/90 text-white font-medium text-sm transition-all duration-300 shadow-sm hover:shadow-md group px-6 py-2.5 rounded-md"
                >
                  Get Started Today
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PurposeVisionSection;
