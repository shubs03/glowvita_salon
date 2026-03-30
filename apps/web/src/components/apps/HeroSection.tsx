import { cn } from '@repo/ui/cn';

interface HeroSectionProps {
  title: string;
  description?: string;
  subTitle?: string;
  ctaButtons?: {
    text: string;
    href: string;
    variant: 'primary' | 'secondary';
  }[];
  className?: string;
  backgroundImage?: string;
}

export const HeroSection = ({ 
  title, 
  description,
  subTitle,
  ctaButtons,
  className,
  backgroundImage
}: HeroSectionProps) => {
  return (
    <section 
      className={cn(
        "relative w-full overflow-hidden flex items-center justify-center mx-auto",
        !backgroundImage && "bg-gradient-to-b from-background via-muted/20 to-background",
        className
      )}
      style={{
        width: '100%',
        maxWidth: '1537px',
        height: '603px',
        marginTop: '0px',
        opacity: 1,
        transform: 'rotate(0deg)',
        ...(backgroundImage ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {})
      }}
    >
      {/* Background Overlay */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-0" />
      )}
      
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Brand Mark */}
        <div className="mb-8">
          <p className={cn(
            "text-xs sm:text-sm font-medium tracking-[0.2em] uppercase",
            backgroundImage ? "text-white/70" : "text-primary/60"
          )}>
            MOBILE APPS
          </p>
        </div>
        
        <h1 
          className={cn(
            "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-8 leading-tight tracking-tight",
            !backgroundImage && "text-foreground"
          )}
          style={{ fontFamily: 'Manrope, sans-serif', color: '#FFFFFF' }}
        >
          {title}
        </h1>

        {description && (
          <p 
            className={cn(
              "text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-light mb-6",
              !backgroundImage && "text-muted-foreground"
            )}
            style={{ fontFamily: 'Manrope, sans-serif', color: '#FFFFFF' }}
          >
            {description}
          </p>
        )}
        
        {subTitle && (
          <p 
            className={cn(
              "text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light mb-8",
              !backgroundImage && "text-muted-foreground/80"
            )}
            style={{ fontFamily: 'Manrope, sans-serif', color: '#FFFFFF' }}
          >
            {subTitle}
          </p>
        )}
        
        {ctaButtons && ctaButtons.length > 0 && (
          <div className="gap-4 flex flex-wrap justify-center mt-8">
            {ctaButtons.map((button, index) => (
              <a 
                key={index}
                href={button.href}
                className={cn(
                  "px-6 py-3 rounded-md font-medium transition-all shadow-lg",
                  button.variant === 'primary' 
                    ? "bg-primary text-white hover:opacity-90 active:scale-95"
                    : cn(
                        "bg-transparent border",
                        backgroundImage 
                          ? "border-white/30 text-white hover:bg-white/10" 
                          : "border-primary text-primary hover:bg-primary/5"
                      )
                )}
              >
                {button.text}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};