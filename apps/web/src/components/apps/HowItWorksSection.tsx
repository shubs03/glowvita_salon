import { HowItWorksStep } from "./HowItWorksStep";
import { Download, Users, BarChart } from "lucide-react";
import { cn } from "@repo/ui/cn";

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: number;
}

interface HowItWorksSectionProps {
  title: string;
  steps: Step[];
  className?: string;
}

export const HowItWorksSection = ({ 
  title, 
  steps, 
  className 
}: HowItWorksSectionProps) => {
  return (
    <section className={cn("py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background", className)}>
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          {title}
        </h2>
      </div>
      <div className="space-y-6">
        {steps.map((step, i) => (
          <HowItWorksStep 
            key={i}
            icon={step.icon}
            title={step.title}
            description={step.description}
            step={step.step}
          />
        ))}
      </div>
    </section>
  );
};