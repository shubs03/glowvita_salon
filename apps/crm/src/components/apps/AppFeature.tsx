import { ReactNode } from "react";

interface AppFeatureProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const AppFeature = ({ icon, title, description }: AppFeatureProps) => (
  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
    <div className="flex items-center gap-4">
      <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-card-foreground text-lg items-center leading-tight">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  </div>
);

export default AppFeature;