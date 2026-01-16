import React from "react";
import { ArrowRight } from "lucide-react";

const PurposeVisionSection = () => {
  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          Our Purpose & Vision
        </h2>
        <p className="text-muted-foreground mt-3 text-sm max-w-2xl">
          Empowering salon businesses with modern management solutions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Purpose */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:bg-primary/20 transition-all duration-300">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                1
              </div>
            </div>
            <h3 className="font-bold text-card-foreground text-xl items-center leading-tight">
              Our Business Mission
            </h3>
          </div>

          <p className="text-muted-foreground text-base leading-relaxed pl-16">
            We believe every salon business deserves powerful tools to thrive.
            GlowVita CRM was created to bridge the gap between salon
            management challenges and efficient business operations, making
            appointment scheduling, customer management, and revenue growth
            simple, reliable, and effortlessly achievable.
          </p>
        </div>

        {/* Right Column - Future Vision */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:bg-primary/20 transition-all duration-300">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                2
              </div>
            </div>
            <h3 className="font-bold text-card-foreground text-xl items-center leading-tight">
              Our Business Vision
            </h3>
          </div>

          <p className="text-muted-foreground text-base leading-relaxed pl-16 mb-8">
            We're constantly evolving to bring you better business tools,
            innovative management features, and deeper insights into your
            customer base and revenue trends. Our journey is just beginning,
            and we're excited to grow with you.
          </p>

          <p className="text-muted-foreground text-base leading-relaxed pl-16 mb-8">
            Partner with us to transform how you manage your salon business.
          </p>

          <div className="pl-16">
            <a
              href="/login" target="_blank"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-sm hover:shadow-md group"
            >
              Manage Your Business Today
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PurposeVisionSection;
