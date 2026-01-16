import { cn } from '@repo/ui/cn';

interface HeroSectionProps {
  title: string;
  ctaButtons?: {
    text: string;
    href: string;
    variant: 'primary' | 'secondary';
  }[];
  className?: string;
}

export const HeroSection = ({ 
  title, 
  ctaButtons,
  className 
}: HeroSectionProps) => {
  return (
    <section className={cn("relative w-full py-10 md:py-14 px-6 lg:px-8 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden", className)}>
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Brand Mark */}
        <div className="mb-8">
          <p className="text-primary/60 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase">
            Welcome to GlowVita CRM
          </p>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground mb-8 leading-tight tracking-tight">
          {title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-light mb-6">
          GlowVita CRM is your comprehensive business management platform for
          running your salon operations. Manage appointments, track customer
          relationships, handle payments, and grow your business—all in one
          powerful solution.
        </p>
        
        <p className="text-sm sm:text-base text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto font-light mb-6">
          From appointment scheduling to customer analytics, managing your
          salon business has never been more efficient.
        </p>
        
        {ctaButtons && ctaButtons.length > 0 && (
          <div className="gap-4 flex flex-wrap justify-center mt-8">
            {ctaButtons.map((button, index) => (
              <a 
                key={index}
                href={button.href}
                className={cn(
                  "px-6 py-3 rounded-md font-medium transition-all",
                  button.variant === 'primary' 
                    ? "bg-primary text-white hover:opacity-90"
                    : "bg-transparent border border-primary text-primary hover:bg-primary/5"
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