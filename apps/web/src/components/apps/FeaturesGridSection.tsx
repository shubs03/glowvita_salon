import { cn } from "@repo/ui/cn";
import { AppFeature } from "./AppFeature";

interface Feature {
  iconSrc: string;
  title: string;
  description: string;
}

interface FeaturesGridSectionProps {
  title: string;
  description: string;
  features?: Feature[];
  className?: string;
}

export const FeaturesGridSection = ({ 
  title, 
  description, 
  features: customFeatures, 
  className 
}: FeaturesGridSectionProps) => {
  const defaultFeatures = [
    {
      iconSrc: "/icons/creadit-card.png",
      title: "Secure Payments",
      description: "Process payments securely with our integrated system, supporting multiple payment methods."
    },
    {
      iconSrc: "/icons/online-analytical 1.png",
      title: "Business Analytics",
      description: "Track your performance with insightful dashboards and detailed reports on sales, clients, and staff."
    },
    {
      iconSrc: "/icons/service.png",
      title: "Client Management",
      description: "Keep detailed records of all your clients, their history, preferences and notes."
    },
    {
      iconSrc: "/icons/catalogue.png",
      title: "Service Catalog",
      description: "Easily manage and showcase your services with detailed descriptions and pricing."
    },
    {
      iconSrc: "/icons/video-camera 1.png",
      title: "Video Consultations",
      description: "Offer virtual consultations directly through the app for added convenience and revenue."
    },
    {
      iconSrc: "/icons/speech-bubble.png",
      title: "In-App Messaging",
      description: "Communicate directly with your clients for appointment updates and follow-ups."
    }
  ];

  const featuresToDisplay = customFeatures || defaultFeatures;

  return (
    <section className={cn("py-24 overflow-hidden bg-white", className)}>
      {/* Section Header */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-24">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 border-b-[4px] border-gray-900 inline-block pb-1 font-manrope">
          {title}
        </h2>
        
        <p className="mt-6 text-gray-500 max-w-2xl text-lg font-manrope">
          {description}
        </p>
      </div>

      {/* Features Grid */}
      <div className="px-8 lg:px-12 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
          {featuresToDisplay.map((feature, index) => (
            <AppFeature
              key={index}
              iconSrc={feature.iconSrc}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};