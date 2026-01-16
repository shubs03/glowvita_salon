import { CheckCircle } from "lucide-react";
import { cn } from "@repo/ui/cn";

interface FeatureComparison {
  feature: string;
  clientApp: boolean;
  vendorApp: boolean;
}

interface FeatureComparisonSectionProps {
  title: string;
  description: string;
  comparisons: FeatureComparison[];
  className?: string;
}

export const FeatureComparisonSection = ({ 
  title, 
  description, 
  comparisons, 
  className 
}: FeatureComparisonSectionProps) => {
  return (
    <section className={cn("py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background", className)}>
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          {title}
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">
          {description}
        </p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium text-foreground">Feature</th>
              <th className="py-3 px-4 text-center text-sm font-medium text-foreground">Client App</th>
              <th className="py-3 px-4 text-center text-sm font-medium text-foreground">Vendor App</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {comparisons.map((comparison, i) => (
              <tr key={i} className={`${i % 2 === 0 ? 'bg-card' : 'bg-background'} hover:bg-accent`}>
                <td className="py-3 px-4 text-sm">{comparison.feature}</td>
                <td className="py-3 px-4 text-center text-sm">
                  {comparison.clientApp ? (
                    <CheckCircle className="text-green-500 mx-auto" />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center text-sm">
                  {comparison.vendorApp ? (
                    <CheckCircle className="text-green-500 mx-auto" />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};