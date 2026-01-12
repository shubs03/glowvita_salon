import { Check } from "lucide-react";

interface FeatureCheckProps {
  children: React.ReactNode;
}

const FeatureCheck = ({ children }: FeatureCheckProps) => (
  <li className="flex items-start gap-3">
    <Check className="h-5 w-5 mt-1 text-green-500 flex-shrink-0" />
    <span className="text-muted-foreground">{children}</span>
  </li>
);

export default FeatureCheck;