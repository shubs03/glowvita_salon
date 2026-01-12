import { Rocket, Users, LineChart } from "lucide-react";
import { ModernCard } from "@repo/ui/modern-card";
import { Check } from "lucide-react";

const BenefitItem = ({
  icon,
  title,
  children,
  features,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  features: string[];
}) => (
  <ModernCard variant="glassmorphism" hover padding="lg" className="h-full">
    <div className="flex items-start gap-4 mb-4">
      <div className="flex-shrink-0 bg-primary/10 h-12 w-12 flex items-center justify-center rounded-xl text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-foreground">
        {title}
      </h3>
    </div>
    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
      {children}
    </p>
    <ul className="space-y-3 text-sm">
      {features.map((feature, index) => (
        <li
          key={index}
          className="flex items-center gap-3 text-muted-foreground"
        >
          <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </ModernCard>
);

const WhyChooseUsCRM = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-background via-secondary/10 to-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <LineChart className="h-4 w-4" />
            Why Choose Us
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-headline mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            Why Choose Our CRM?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            We provide the tools to not just manage, but to grow your
            business with innovative features designed for modern salons.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <BenefitItem
            icon={<Rocket className="h-6 w-6 md:h-7 md:w-7" />}
            title="Boost Efficiency"
            features={[
              "Automated appointment reminders",
              "Quick client check-in & check-out",
              "Staff scheduling & payroll reports",
              "Centralized client communication logs",
            ]}
          >
            Reduce administrative tasks and paperwork by up to 40%. Focus on
            what you do best: making your clients look and feel amazing.
          </BenefitItem>
          <BenefitItem
            icon={<Users className="h-6 w-6 md:h-7 md:w-7" />}
            title="Enhance Client Loyalty"
            features={[
              "Detailed client profiles & history",
              "Personalized birthday & loyalty rewards",
              "Targeted marketing campaigns",
              "Post-visit feedback collection",
            ]}
          >
            Keep your clients coming back for more. Remember their
            preferences and provide a personalized, high-touch experience
            every time.
          </BenefitItem>
          <BenefitItem
            icon={<LineChart className="h-6 w-6 md:h-7 md:w-7" />}
            title="Increase Revenue"
            features={[
              "Service & product sales analytics",
              "Client spend tracking & segmentation",
              "Smart upselling suggestions",
              "Online booking to capture new clients 24/7",
            ]}
          >
            Make data-driven decisions. Identify your most popular services,
            understand client spending habits, and create effective
            marketing campaigns.
          </BenefitItem>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsCRM;