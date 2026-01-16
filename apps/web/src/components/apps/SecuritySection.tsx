import { Shield } from "lucide-react";
import { FeatureCheck } from "./FeatureCheck";
import { cn } from "@repo/ui/cn";

interface SecurityFeature {
  title: string;
  description: string;
}

interface SecuritySectionProps {
  title: string;
  description: string;
  features: SecurityFeature[];
  className?: string;
}

export const SecuritySection = ({ 
  title, 
  description, 
  features, 
  className 
}: SecuritySectionProps) => {
  return (
    <section className={cn("py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4 mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground mt-3 text-sm mb-6">
            {description}
          </p>
          <ul className="space-y-3">
            {features.map((feature, i) => (
              <FeatureCheck key={i}>
                <strong>{feature.title}:</strong> {feature.description}
              </FeatureCheck>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 rounded-full blur-3xl opacity-40"></div>
            <Shield className="relative z-10 h-48 w-48 text-green-500 drop-shadow-lg" />
          </div>
        </div>
      </div>
    </section>
  );
};