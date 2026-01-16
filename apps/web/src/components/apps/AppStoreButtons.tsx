import { Download, ArrowRight } from "lucide-react";

interface AppStoreButtonsProps {
  onAppStoreClick?: () => void;
  onGooglePlayClick?: () => void;
  className?: string;
}

export const AppStoreButtons = ({ 
  onAppStoreClick, 
  onGooglePlayClick, 
  className 
}: AppStoreButtonsProps) => (
  <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${className || ''}`}>
    <button 
      onClick={onAppStoreClick}
      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center gap-2 shadow-sm"
    >
      <Download className="w-5 h-5" />
      Download App
    </button>
    
    <button 
      onClick={onGooglePlayClick}
      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center gap-2 shadow-sm"
    >
      Learn More
      <ArrowRight className="w-5 h-5" />
    </button>
  </div>
);