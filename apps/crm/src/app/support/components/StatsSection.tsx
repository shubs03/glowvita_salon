import React from "react";

const StatsSection = () => {
  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-card border border-[#422A3C] rounded-3xl rounded-tl-none rounded-br-none p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50 text-center">
          <div className="text-3xl md:text-4xl font-bold italic text-foreground mb-2 font-['Metal']">
            24/7
          </div>
          <p className="text-muted-foreground text-sm">
            Support Available
          </p>
        </div>
        <div className="bg-card border border-[#422A3C] rounded-3xl rounded-tl-none rounded-br-none p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50 text-center">
          <div className="text-3xl md:text-4xl font-bold italic text-foreground mb-2 font-['Metal']">
            &lt; 2min
          </div>
          <p className="text-muted-foreground text-sm">
            Average Response Time
          </p>
        </div>
        <div className="bg-card border border-[#422A3C] rounded-3xl rounded-tl-none rounded-br-none p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50 text-center">
          <div className="text-3xl md:text-4xl font-bold italic text-foreground mb-2 font-['Metal']">
            98%
          </div>
          <p className="text-muted-foreground text-sm">
            Satisfaction Rate
          </p>
        </div>
        <div className="bg-card border border-[#422A3C] rounded-3xl rounded-tl-none rounded-br-none p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50 text-center">
          <div className="text-3xl md:text-4xl font-bold italic text-foreground mb-2 font-['Metal']">
            1000+
          </div>
          <p className="text-muted-foreground text-sm">
            Help Articles
          </p>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;