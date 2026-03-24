import { cn } from "@repo/ui/cn";

interface HowItWorksStepProps {
  iconSrc: string;
  title: string;
  description: string;
  className?: string;
}

export const HowItWorksStep = ({
  iconSrc,
  title,
  description,
  className,
}: HowItWorksStepProps) => (
  <div className={cn("flex flex-col items-center text-center group", className)}>
    {/* Visual Element Container */}
    <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
      {/* Background Frame (Balloon/Circle with line) */}
      <img 
        src="/icons/Group 1000002468.png" 
        alt="Background frame"
        className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
      />
      
      {/* Hexagon Icon */}
      <div 
        className="absolute top-[18%] left-1/2 -translate-x-1/2 flex items-center justify-center w-[72px] h-[82px] bg-[#53435c] shadow-lg transition-transform duration-500 group-hover:scale-110"
        style={{ 
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        }}
      >
        <img 
          src={iconSrc} 
          alt={title} 
          className="w-10 h-10 object-contain brightness-0 invert" 
        />
      </div>
    </div>

    {/* Text Content */}
    <div className="max-w-[280px]">
      <h3 className="font-bold text-gray-900 text-xl mb-4 font-manrope">
        {title}
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed font-manrope">
        {description}
      </p>
    </div>
  </div>
);