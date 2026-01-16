import { cn } from "@repo/ui/cn";

import { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeaturesGridSectionProps {
  title: string;
  description: string;
  features: Feature[];
  className?: string;
}

export const FeaturesGridSection = ({ 
  title, 
  description, 
  features, 
  className 
}: FeaturesGridSectionProps) => {
  return (
    <section className={cn("py-10 overflow-hidden bg-white", className)}>
      {/* Section Header */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-gray-900 inline-block pb-4">
          {title}
        </h2>
        
        <p className="mt-2 text-gray-600 max-w-2xl">
          {description}
        </p>
      </div>

      {/* Features Grid */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-bold text-card-foreground text-lg items-center leading-tight">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed pl-16">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};