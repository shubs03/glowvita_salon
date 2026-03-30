import { cn } from "@repo/ui/cn";

interface AppFeatureProps {
  iconSrc: string;
  title: string;
  description: string;
  className?: string;
}

export const AppFeature = ({ 
  iconSrc, 
  title, 
  description, 
  className 
}: AppFeatureProps) => (
  <div className={cn(
    "relative pt-12 pb-8 px-6 bg-[#f4faff] rounded-[24px] shadow-sm flex flex-col items-center text-center mt-10 transition-all duration-300 hover:shadow-md group",
    className
  )}>
    {/* Icon Container */}
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-[6px] border-white transition-transform duration-300 group-hover:-translate-y-1">
      <img src={iconSrc} alt={title} className="w-12 h-12 object-contain" />
    </div>
    
    {/* Content */}
    <div className="mt-4">
      <h3 className="font-bold text-gray-900 text-xl mb-4 font-manrope">
        {title}
      </h3>
      <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-[280px] mx-auto font-manrope">
        {description}
      </p>
    </div>
  </div>
);