import { CheckCircle, Download, Users, BarChart } from "lucide-react";
import { cn } from "@repo/ui/cn";

interface HowItWorksStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: number;
  className?: string;
}

export const HowItWorksStep = ({
  icon,
  title,
  description,
  step,
  className,
}: HowItWorksStepProps) => (
  <div className={cn("bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50 flex items-start gap-4", className)}>
    <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:bg-primary/20 transition-all duration-300">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-card-foreground text-lg items-center leading-tight">
        {title}
      </h4>
      <p className="text-muted-foreground text-sm leading-relaxed pl-16">
        {description}
      </p>
    </div>
  </div>
);