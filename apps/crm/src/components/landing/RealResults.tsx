import { useState } from "react";
import { Button } from "@repo/ui/button";
import { CalendarCheck, Users, LineChart, Clock } from "lucide-react";
import { ArrowRight } from "lucide-react";

const AdvantageCard = ({
  stat,
  title,
  description,
  icon,
}: {
  stat: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) => {
  const IconComponent = icon;
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50 flex-shrink-0 w-64 md:w-80 h-80 md:h-96 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
            {IconComponent}
          </div>
          <h3 className="font-bold text-card-foreground text-lg items-center leading-tight">
            {title}
          </h3>
        </div>
        <div className="mt-4">
          <p className="text-5xl font-bold text-primary mb-2">
            {stat}
          </p>
        </div>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed pl-10">
        {description}
      </p>
    </div>
  );
};

const RealResults = () => {
  const scrollAdvantages = (direction: "left" | "right") => {
    const container = document.getElementById("advantages-container");
    if (container) {
      const scrollAmount = container.clientWidth / 2;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-10 overflow-hidden bg-white">
      {/* Section Header */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-gray-900 inline-block pb-4">
          Real Results
        </h2>
        
        <p className="mt-2 text-gray-600 max-w-2xl">
          See the real-world impact of using our CRM. These metrics represent actual improvements from our satisfied clients.
        </p>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div
          id="advantages-container"
          className="flex gap-4 md:gap-8 py-8 overflow-x-auto snap-x snap-mandatory no-scrollbar"
        >
          <AdvantageCard
            stat="40%"
            title="Increase in Bookings"
            description="Clients booking through our platform are more likely to commit and show up for their appointments."
            icon={<CalendarCheck />}
          />
          <AdvantageCard
            stat="25%"
            title="More Repeat Clients"
            description="Build lasting loyalty with detailed client profiles and personalized service experiences."
            icon={<Users />}
          />
          <AdvantageCard
            stat="15%"
            title="Higher Average Spend"
            description="Intelligently upsell services and products by understanding complete client history and preferences."
            icon={<LineChart />}
          />
          <AdvantageCard
            stat="50%"
            title="Less Admin Time"
            description="Automate reminders and administrative tasks so you can focus on your craft and clients."
            icon={<Clock />}
          />
        </div>
        <div className="flex justify-end mt-8">
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="icon"
              className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-full"
              onClick={() => scrollAdvantages("left")}
            >
              <ArrowRight className="h-4 w-4 transform rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-full"
              onClick={() => scrollAdvantages("right")}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RealResults;