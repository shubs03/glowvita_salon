import React from "react";
import { Award, Star, TrendingUp } from "lucide-react";

const AwardsSection = () => {
  const awards = [
    {
      icon: Award,
      title: "Best Salon Software 2023",
      description:
        "Winner of the Best Salon Software award in the Tech Innovators Magazine 2023.",
    },
    {
      icon: Star,
      title: "Customer's Choice Award",
      description: "Winner of the Customer's Choice Award in Beauty Tech Reviews 2023.",
    },
    {
      icon: TrendingUp,
      title: "Fastest Growing Platform",
      description: "Winner of the Fastest Growing Platform award in Startup Weekly 2023.",
    },
  ];

  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          Awards & Recognition
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">
          These awards are a testament to our commitment to excellence and our dedication to providing the best salon software solutions to our customers.

        </p>
      </div>

      {/* Awards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {awards.map((award, index) => {
          const Icon = award.icon;
          return (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50"
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:bg-primary/20 transition-all duration-300">
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-card-foreground text-lg items-center leading-tight">
                  {award.title}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed pl-16">
                {award.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AwardsSection;
