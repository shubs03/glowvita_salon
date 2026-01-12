import { ReactNode } from "react";

interface HowItWorksStepProps {
  icon: ReactNode;
  title: string;
  description: string;
  step: number;
}

const HowItWorksStep = ({
  icon,
  title,
  description,
  step,
}: HowItWorksStepProps) => (
  <div className="relative pl-16">
    <div className="absolute left-0 top-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary font-bold text-2xl border-2 border-primary/20">
      {step}
    </div>
    <div className="flex items-center gap-4 mb-2">
      {icon}
      <h4 className="text-2xl font-semibold">{title}</h4>
    </div>
    <p className="text-muted-foreground text-lg">{description}</p>
  </div>
);

export default HowItWorksStep;