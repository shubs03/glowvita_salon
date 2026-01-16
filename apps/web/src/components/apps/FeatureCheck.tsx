import { Check } from "lucide-react";
import { cn } from "@repo/ui/cn";

interface FeatureCheckProps {
  children: React.ReactNode;
  className?: string;
}

export const FeatureCheck = ({ children, className }: FeatureCheckProps) => (
  <li className={cn("flex items-start gap-3", className)}>
    <Check className="h-5 w-5 mt-1 text-green-500 flex-shrink-0" />
    <span className="text-muted-foreground">{children}</span>
  </li>
);