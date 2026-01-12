import { Download, Users, BarChart } from "lucide-react";
import { cn } from "@repo/ui/cn";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <Download className="h-7 w-7" />,
      title: "Download & Setup",
      description:
        "Get your salon listed and set up your services, staff, and schedule in minutes.",
    },
    {
      icon: <Users className="h-7 w-7" />,
      title: "Clients Book Online",
      description:
        "Clients find your salon and book appointments 24/7 through the GlowVita app or your website.",
    },
    {
      icon: <BarChart className="h-7 w-7" />,
      title: "Manage & Grow",
      description:
        "Use the CRM app to manage bookings, process payments, and grow your business with marketing tools.",
    },
  ];

  return (
    <section className="py-10 overflow-hidden bg-white">
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-gray-900 inline-block pb-4">
          How It Works
        </h2>
        
        <p className="mt-2 text-gray-600 max-w-2xl">
          A simple and intuitive process for both you and your clients.
        </p>
      </div>

      <div className="px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative pl-16">
              <div className="absolute left-0 top-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary font-bold text-2xl border-2 border-primary/20">
                {index + 1}
              </div>
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0">
                  {step.icon}
                </div>
                <h3 className="font-bold text-card-foreground text-lg items-center leading-tight">
                  {step.title}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed pl-16">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;