import React from "react";

const AwardsSection = () => {
  const awards = [
    {
      image: "/images/medal.png",
      title: "Best Salon Software 2026",
      description:
        "Winner of the Best Salon Software award in the Tech Innovators Magazine 2026.",
    },
    {
      image: "/images/trophy.png",
      title: "Customer's Choice Award",
      description: "Winner of the Customer's Choice Award in Beauty Tech Reviews 2026.",
    },
    {
      image: "/images/MonthlySpend.png",
      title: "Fastest Growing Platform",
      description: "Winner of the Fastest Growing Platform award in Startup Weekly 2026.",
    },
  ];

  return (
    <section className="py-10 container mx-auto px-4 sm:px-6 lg:px-8 bg-background">
      {/* Section Header */}
      <div className="mb-8">
        <h2
          className="relative inline-block text-2xl md:text-3xl font-serif font-bold pb-3"
          style={{ color: "#252B42" }}
        >
          Awards & Recognition
          <span
            className="absolute left-0 bottom-0 h-[3px] w-full rounded-full"
            style={{
              background:
                "linear-gradient(to right, #252B42 0%, #252B42 40%, transparent 100%)",
            }}
          />
        </h2>
        <div className="overflow-x-auto mt-3">
          <p className="text-gray-500 text-base leading-relaxed whitespace-nowrap">
            These awards are a testament to our commitment to excellence and our dedication to providing the best salon software solutions to our customers.
          </p>
        </div>
      </div>

      {/* Awards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {awards.map((award, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-3xl p-6 hover:shadow-md transition-all duration-300 group hover:border-primary/50"
          >
            <div className="flex items-start gap-6">
              <div
                className="p-2 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-all duration-300"
                style={{ backgroundColor: "#EBF3FD" }}
              >
                <img
                  src={award.image}
                  alt={award.title}
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-card-foreground text-lg leading-tight">
                  {award.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mt-1">
                  {award.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AwardsSection;