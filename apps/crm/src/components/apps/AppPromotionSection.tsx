import { cn } from "@repo/ui/cn";
import { ReactNode } from "react";
import PhoneMockup from "./PhoneMockup";

interface AppPromotionSectionProps {
  title: string;
  description: string;
  images: { src: string; hint: string }[];
  reverse?: boolean;
}

const AppPromotionSection = ({
  title,
  description,
  images,
  reverse = false,
}: AppPromotionSectionProps) => {
  return (
    <section className="py-16 px-6 lg:px-8 bg-background">
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
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <span className="text-sm text-secondary-foreground">Easy to use</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <span className="text-sm text-secondary-foreground">Real-time updates</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <span className="text-sm text-secondary-foreground">Secure payments</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <span className="text-sm text-secondary-foreground">24/7 support</span>
              </div>
            </div>
            
            {/* Google Play Button */}
            <div className="flex flex-wrap gap-4">
              <a
                href="#"
                className="bg-foreground hover:bg-foreground/90 text-background px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl group"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <p className="text-xs opacity-90">Get it on</p>
                  <p className="text-lg font-semibold">Google Play</p>
                </div>
              </a>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-6 flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-primary">4.9/5</span>
                <span>Rating</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-primary">100K+</span>
                <span>Downloads</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-primary">24/7</span>
                <span>Support</span>
              </div>
            </div>
          </div>
          
          {/* Phone Mockup */}
          <div className="flex justify-center lg:pl-28">
            <div className="relative">
              {/* Phone Frame */}
              <div className="relative w-64 h-[500px] bg-foreground rounded-[2.5rem] p-2 shadow-2xl">
                {/* Screen */}
                <div className="w-full h-full bg-background rounded-[2rem] overflow-hidden relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-foreground rounded-b-2xl z-10"></div>
                  
                  {/* Screen Content - First Image */}
                  <img
                    src={images[0].src}
                    alt={`${title} screenshot 1`}
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

export default AppPromotionSection;