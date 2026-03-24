import AppFeature from "./AppFeature";

const FeaturesGridSection = () => {
  const features = [
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

  return (
    <section className="py-12 overflow-hidden bg-white">
      <div className="max-w-[1537px] mx-auto px-6 lg:px-24 mb-12 text-left">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 border-b-[4px] border-gray-900 inline-block pb-1 font-manrope leading-tight">
          App Features
        </h2>
        
        <p className="mt-6 text-gray-500 max-w-2xl text-lg font-manrope">
          Powerful tools designed to streamline your salon business and enhance customer relationships.
        </p>
      </div>

      <div className="max-w-[1537px] mx-auto px-6 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
          {features.map((feature, index) => (
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

export default FeaturesGridSection;