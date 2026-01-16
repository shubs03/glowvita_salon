import React from 'react';
import { UserPlus, Users, TrendingUp, BarChart3 } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Sign Up & Setup",
      description: "Create your account and set up your salon services, staff, and schedule in minutes.",
    },
    {
      icon: Users,
      title: "Client Bookings",
      description: "Clients book appointments 24/7 through the GlowVita app or your website, with automated reminders.",
    },
    {
      icon: TrendingUp,
      title: "Manage Operations",
      description: "Track appointments, manage staff schedules, and handle payments seamlessly in one place.",
    },
    {
      icon: BarChart3,
      title: "Grow & Analyze",
      description: "Use analytics and marketing tools to grow your business and increase revenue.",
    },
  ];

  return (
    <section className="py-20 overflow-hidden bg-background">
      {/* Section Header */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          How It Works
        </h2>
        <p className="mt-3 text-muted-foreground max-w-2xl text-sm">
          Our simple 4-step process to transform your salon business with our CRM platform.
        </p>
      </div>

      {/* DNA Timeline */}
      <div className="px-6 lg:px-8 max-w-5xl mx-auto relative h-full">
        {/* Central Line */}
        <div className="absolute left-1/2 top-0 h-full w-0.5 bg-border transform -translate-x-1/2 hidden md:block"></div>
        
        {/* Top Dot */}
        <div className="absolute left-1/2 w-4 h-4 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2 hidden md:block z-20 top-0"></div>
        
        {/* Bottom Dot - positioned at the actual end of the line */}
        <div className="absolute left-1/2 w-4 h-4 bg-primary rounded-full transform -translate-x-1/2 translate-y-1/2 hidden md:block z-20 bottom-0"></div>

        {/* Steps */}
        <div className="space-y-2 md:space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLeft = index % 2 === 0;

            return (
              <div
                key={index}
                className={`relative flex items-center ${
                  isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                } flex-col`}
              >
                {/* Card */}
                <div className={`w-full md:w-[calc(50%-3rem)] ${isLeft ? 'md:pr-4' : 'md:pl-4'}`}>
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                        <Icon className="w-6 h-6" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg leading-tight mb-2">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Number Circle */}
                <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg border-4 border-background z-10">
                    {index + 1}
                  </div>
                </div>

                {/* Mobile Number (visible only on mobile) */}
                <div className="md:hidden w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg mb-4 mt-4">
                  {index + 1}
                </div>

                {/* Empty space for opposite side */}
                <div className="hidden md:block w-[calc(50%-3rem)]"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;