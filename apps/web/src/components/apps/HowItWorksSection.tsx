import { HowItWorksStep } from "./HowItWorksStep";
import { cn } from "@repo/ui/cn";

interface Step {
  iconSrc: string;
  title: string;
  description: string;
}

interface HowItWorksSectionProps {
  title: string;
  description: string;
  steps?: Step[];
  className?: string;
}

export const HowItWorksSection = ({ 
  title, 
  description,
  steps: customSteps,
  className 
}: HowItWorksSectionProps) => {
  const defaultSteps = [
    {
      iconSrc: "/icons/add-user 1.png",
      title: "1. Sign Up & Setup",
      description: "Create your account and set up your salon services, staff, and schedule in minutes.",
    },
    {
      iconSrc: "/icons/appointment (1) 2.png",
      title: "2. Client Bookings",
      description: "Clients book appointments 24/7 through the GlowVita app or your website, with automated reminders.",
    },
    {
      iconSrc: "/icons/Mask group.png",
      title: "3. Manage Operations",
      description: "Track appointments, manage staff schedules and handle payments seamlessly in one place.",
    },
    {
      iconSrc: "/icons/web-design 1.png",
      title: "4. Grow & Analyze",
      description: "Use analytics and marketing tools to grow your business and increase revenue.",
    },
  ];

  const stepsToDisplay = customSteps || defaultSteps;

  return (
    <section className={cn("py-24 overflow-hidden bg-white", className)}>
      <div className="px-6 lg:px-12 max-w-7xl mx-auto mb-20 text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 border-b-[3px] border-gray-900 inline-block pb-1 font-manrope">
          {title}
        </h2>
        
        <p className="mt-4 text-gray-500 max-w-2xl text-lg font-manrope">
          {description}
        </p>
      </div>

      <div className="px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {stepsToDisplay.map((step, index) => (
            <HowItWorksStep 
              key={index}
              iconSrc={step.iconSrc}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};