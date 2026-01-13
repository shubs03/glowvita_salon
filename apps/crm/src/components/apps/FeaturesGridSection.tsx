import { Shield, BarChart, Users, BookOpen, Video, MessageSquare } from "lucide-react";
import AppFeature from "./AppFeature";

const FeaturesGridSection = () => {
  return (
    <section className="py-10 overflow-hidden bg-white">
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-gray-900 inline-block pb-4">
          App Features
        </h2>
        
        <p className="mt-2 text-gray-600 max-w-2xl">
          Powerful tools designed to streamline your salon business and enhance customer relationships.
        </p>
      </div>

      <div className="px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AppFeature
            icon={<Shield size={24} />}
            title="Secure Payments"
            description="Process payments securely with our integrated system, supporting multiple payment methods."
          />
          <AppFeature
            icon={<BarChart size={24} />}
            title="Business Analytics"
            description="Track your performance with insightful dashboards and detailed reports on sales, clients, and staff."
          />
          <AppFeature
            icon={<Users size={24} />}
            title="Client Management"
            description="Keep detailed records of all your clients, their history, preferences, and notes."
          />
          <AppFeature
            icon={<BookOpen size={24} />}
            title="Service Catalog"
            description="Easily manage and showcase your services with detailed descriptions and pricing."
          />
          <AppFeature
            icon={<Video size={24} />}
            title="Video Consultations"
            description="Offer virtual consultations directly through the app for added convenience and revenue."
          />
          <AppFeature
            icon={<MessageSquare size={24} />}
            title="In-App Messaging"
            description="Communicate directly with your clients for appointment updates and follow-ups."
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesGridSection;