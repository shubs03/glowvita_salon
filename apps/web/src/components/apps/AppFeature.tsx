import { Card } from "@repo/ui/card";
import { cn } from "@repo/ui/cn";

interface AppFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export const AppFeature = ({ 
  icon, 
  title, 
  description, 
  className 
}: AppFeatureProps) => (
  <Card className={cn(
    "bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50",
    className
  )}>
    <div className="flex items-center gap-4">
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
  </Card>
);