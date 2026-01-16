import { cn } from "@repo/ui/cn";
import { AppStoreButtons } from "./AppStoreButtons";

interface Feature {
  title: string;
}

interface ImageData {
  src: string;
  hint: string;
}

interface AppPromotionSectionProps {
  title: string;
  description: string;
  features: Feature[];
  images: ImageData[];
  className?: string;
}

export const AppPromotionSection = ({
  title,
  description,
  features,
  images,
  className,
}: AppPromotionSectionProps) => {
  return (
    <section className={cn("py-16 px-6 lg:px-8 bg-background", className)}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="lg:pl-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary mb-4 border-b-2 border-gray-900 pb-6">
              {title}
            </h2>
            <p className="mb-4 text-gray-600 max-w-2xl leading-relaxed">
              {description}
            </p>

            {/* Key Features */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              {features.slice(0, 4).map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  <span className="text-sm text-secondary-foreground">{feature.title}</span>
                </div>
              ))}
            </div>

            <AppStoreButtons />
          </div>

          {/* Right Phone Mockup */}
          <div className="flex justify-center lg:pl-28">
            <div className="relative">
              {/* Phone Frame */}
              <div className="relative w-64 h-[500px] bg-foreground rounded-[2.5rem] p-2 shadow-2xl">
                {/* Screen */}
                <div className="w-full h-full bg-background rounded-[2rem] overflow-hidden relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-foreground rounded-b-2xl z-10"></div>
                  
                  {/* Screen Content - Image */}
                  <img
                    src={images[0].src}
                    alt={images[0].hint}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};