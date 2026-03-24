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
    <section className="pt-2 pb-16 px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-stretch">
          <div className="lg:pl-8 lg:order-1 order-1 flex flex-col justify-center">
            {/* Vendor CRM App Header with Lines */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-gray-400 flex-1"></div>
              <span className="text-[#51364d] tracking-widest text-sm md:text-base font-serif uppercase">
                Vendor CRM App
              </span>
              <div className="h-px bg-gray-400 flex-1"></div>
            </div>

            {/* Main Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-black mb-6 italic" style={{ fontFamily: "'Luxurious Roman', cursive" }}>
              {title.replace("Vendor CRM App (", "").replace(")", "")}
            </h2>
            
            {/* Description */}
            <p className="mb-10 text-gray-500 max-w-xl text-lg leading-relaxed">
              {description}
            </p>
            
            {/* Key Features List */}
            <div className="mb-12 space-y-0 text-lg text-black">
              {[
                { num: "01.", text: "Easy to use" },
                { num: "02.", text: "Real-time updates" },
                { num: "03.", text: "Secure payments" },
                { num: "04.", text: "24/7 support" },
              ].map((feature, index) => (
                <div key={index} className="flex gap-4 items-center py-4 border-b border-gray-300 max-w-md">
                  <span className="text-gray-400 min-w-8">{feature.num}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
            
            {/* Trust Indicators and Google Play */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-6 text-black">
              <div className="flex flex-col">
                <span className="font-serif text-3xl font-medium">4.9/5</span>
                <span className="text-sm text-gray-500">Rating</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-3xl font-medium">20k+</span>
                <span className="text-sm text-gray-500">Downloads</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-3xl font-medium">24/7</span>
                <span className="text-sm text-gray-500">Support</span>
              </div>
              
              <div className="ml-auto md:ml-4">
                <img 
                  src="/icons/Group 1000002487.png" 
                  alt="Get it on Google Play"
                  className="h-12 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                />
              </div>
            </div>
          </div>
          {/* Right Side Image */}
          <div className="flex justify-center lg:justify-end lg:order-2 order-2 mt-8 lg:mt-0 lg:pl-10 h-full min-h-[400px]">
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={images[0]?.src || "/icons/mobile-8560599_1920 (3) 1.png"}
                alt={images[0]?.hint || `${title} showcase`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppPromotionSection;