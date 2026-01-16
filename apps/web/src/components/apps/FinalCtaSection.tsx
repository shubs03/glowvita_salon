import { AppStoreButtons } from "./AppStoreButtons";
import { cn } from "@repo/ui/cn";

interface FinalCtaSectionProps {
  title: string;
  description: string;
  className?: string;
}

export const FinalCtaSection = ({ 
  title, 
  description, 
  className 
}: FinalCtaSectionProps) => {
  return (
    <section className={cn("py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background", className)}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4 mx-auto">
          {title}
        </h2>
        <p className="text-muted-foreground mt-3 text-sm mb-8 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
        <AppStoreButtons />
      </div>
    </section>
  );
};