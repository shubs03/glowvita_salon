
"use client";

import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/card";
import {
  Bell,
  CheckCircle,
  CalendarCheck,
  Download,
  Shield,
  BarChart,
  Users,
  Star,
  ArrowRight,
  BookOpen,
  Video,
  MessageSquare,
  Phone,
  LifeBuoy,
  Settings,
  Clock,
  Check,
  Award,
  UserPlus,
  PlayCircle,
  Sparkles,
  Zap,
  TrendingUp,
  Heart,
  Globe,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@repo/ui/cn";

const FeatureCheck = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <Check className="h-5 w-5 mt-1 text-green-500 flex-shrink-0" />
    <span className="text-muted-foreground">{children}</span>
  </li>
);

const AppFeature = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <Card className="text-left p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-secondary/50 hover:bg-background border border-transparent hover:border-primary/20">
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-lg mb-1">{title}</h4>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  </Card>
);

const AppStoreButtons = () => (
  <div className="flex justify-center flex-col sm:flex-row gap-4 mt-8">
    <Button
      size="lg"
      className="w-full sm:w-auto bg-black hover:bg-black/80 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
    >
      <Download className="mr-2 h-5 w-5" /> Download on the App Store
    </Button>
    <Button
      size="lg"
      variant="outline"
      className="w-full sm:w-auto rounded-full shadow-lg hover:shadow-xl transition-all"
    >
      <Download className="mr-2 h-5 w-5" /> Get it on Google Play
    </Button>
  </div>
);

const PhoneMockup = ({
  imageUrl,
  alt,
  hint,
  className,
}: {
  imageUrl: string;
  alt: string;
  hint: string;
  className?: string;
}) => (
  <div
    className={cn(
      "relative w-full aspect-[9/19] bg-slate-400 rounded-xl shadow-2xl overflow-hidden group hover:scale-105 transition-all duration-500 cursor-pointer p-2 border border-slate-400",
      className
    )}
  >
    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-slate-400 rounded-full z-20"></div>
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <Image
        src={imageUrl}
        className="group-hover:scale-110 transition-transform duration-500"
        alt={alt}
        layout="fill"
        objectFit="cover"
        data-ai-hint={hint}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  </div>
);

const AppPromotionSection = ({
  title,
  description,
  features,
  images,
  reverse = false,
}: {
  title: string;
  description: string;
  features: { title: string; description: string; icon: React.ReactNode }[];
  images: { src: string; hint: string }[];
  reverse?: boolean;
}) => {
  return (
    <section className="py-32 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900/50 dark:via-background dark:to-purple-900/20 opacity-30"></div>
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div
          className={cn("text-center md:text-left", reverse && "md:order-2")}
        >
          <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4 leading-tight">
            {title}
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">{description}</p>
          <div className="space-y-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-lg">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-base">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <AppStoreButtons />
        </div>
        <div
          className={cn(
            "relative h-[450px] flex items-center justify-center mt-12 md:mt-0",
            reverse && "md:order-1"
          )}
        >
          <div className="absolute w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-30 -translate-x-1/4 -translate-y-1/4"></div>
          <div className="absolute w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30 translate-x-1/4 translate-y-1/4"></div>
          <div className="relative flex justify-center items-center h-full w-full">
            <div
              className="absolute w-56 md:w-64 h-auto"
              style={{
                zIndex: 10,
                transform: "rotate(-10deg) translateX(-40%) translateY(5%)",
              }}
            >
              <PhoneMockup
                imageUrl={images[0].src}
                alt={`${title} screenshot 1`}
                hint={images[0].hint}
              />
            </div>
            <div
              className="absolute w-56 md:w-64 h-auto"
              style={{ zIndex: 20, transform: "rotate(0deg)" }}
            >
              <PhoneMockup
                imageUrl={images[1].src}
                alt={`${title} screenshot 2`}
                hint={images[1].hint}
              />
            </div>
            <div
              className="absolute w-56 md:w-64 h-auto"
              style={{
                zIndex: 10,
                transform: "rotate(10deg) translateX(40%) translateY(5%)",
              }}
            >
              <PhoneMockup
                imageUrl={images[2].src}
                alt={`${title} screenshot 3`}
                hint={images[2].hint}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({
  review,
  author,
  role,
  rating,
}: {
  review: string;
  author: string;
  role: string;
  rating: number;
}) => (
  <Card className="w-[320px] h-[320px] shrink-0 snap-center p-8 flex flex-col justify-between bg-background rounded-lg shadow-lg border border-border/50 hover:border-primary/20 hover:shadow-xl transition-all duration-300">
    <div>
      <div className="flex items-center gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
        ))}
        {[...Array(5 - rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-gray-300" />
        ))}
      </div>
      <p className="text-muted-foreground leading-relaxed">"{review}"</p>
    </div>
    <div>
      <p className="font-semibold text-foreground">{author}</p>
      <p className="text-sm text-muted-foreground">{role}</p>
    </div>
  </Card>
);

const HowItWorksStep = ({
  icon,
  title,
  description,
  step,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: number;
}) => (
  <div className="relative pl-16">
    <div className="absolute left-0 top-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary font-bold text-2xl border-2 border-primary/20">
      {step}
    </div>
    <div className="flex items-center gap-4 mb-2">
      {icon}
      <h4 className="text-2xl font-semibold">{title}</h4>
    </div>
    <p className="text-muted-foreground text-lg">{description}</p>
  </div>
);

export default function AppsPage() {
  return (
    <div className="bg-background">
      {/* Section 1: Hero */}
      <section className="py-20 md:py-28 text-center bg-secondary/50 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900/50 dark:via-background dark:to-purple-900/20 opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">
            Your Business, In Your Pocket
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Manage your salon and connect with your clients on the go with our
            powerful, intuitive mobile apps.
          </p>
        </div>
      </section>

      {/* Section 2: GlowVita Salon App */}
      <AppPromotionSection
        title="GlowVita Salon App (For Your Clients)"
        description="Empower your clients with a seamless booking experience. Our client-facing app makes it easy for them to discover, book, and manage their appointments."
        features={[
          {
            icon: <CalendarCheck size={20} />,
            title: "24/7 Online Booking",
            description:
              "Accept bookings anytime, anywhere, reducing phone calls and manual entries.",
          },
          {
            icon: <Star size={20} />,
            title: "Discover & Rate",
            description:
              "Allow clients to discover new services, read reviews, and leave their own feedback.",
          },
          {
            icon: <Bell size={20} />,
            title: "Automated Reminders",
            description:
              "Reduce no-shows with automated appointment reminders and notifications.",
          },
        ]}
        images={[
          {
            src: "https://placehold.co/375x812.png",
            hint: "app booking screen",
          },
          {
            src: "https://placehold.co/375x812.png",
            hint: "app services list",
          },
          { src: "https://placehold.co/375x812.png", hint: "app profile page" },
        ]}
      />

      {/* Section 3: CRM App */}
      <AppPromotionSection
        title="Vendor CRM App (For Your Business)"
        description="Manage your entire salon from the palm of your hand. Our vendor app gives you the power to run your business from anywhere, at any time."
        features={[
          {
            icon: <BarChart size={20} />,
            title: "Business Dashboard",
            description:
              "Track sales, appointments, and client growth with an at-a-glance dashboard.",
          },
          {
            icon: <BookOpen size={20} />,
            title: "Calendar Management",
            description:
              "Effortlessly manage your team's schedule and view upcoming appointments.",
          },
          {
            icon: <Users size={20} />,
            title: "Client Database",
            description:
              "Access client information, booking history, and personal notes on the go.",
          },
        ]}
        images={[
          {
            src: "https://placehold.co/375x812.png",
            hint: "app dashboard screen",
          },
          {
            src: "https://placehold.co/375x812.png",
            hint: "app calendar view",
          },
          {
            src: "https://placehold.co/375x812.png",
            hint: "app analytics chart",
          },
        ]}
        reverse={true}
      />

      {/* Section 4: Features Grid */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold font-headline">
              Powerful Features in Both Apps
            </h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Built to help you succeed, from day one.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
      
      {/* Final CTA */}
      <section className="py-20 text-center bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-4xl lg:text-6xl font-bold font-headline mb-6 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
            Ready to Go Mobile?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Download the apps and take your business to the next level. Empower
            your team and delight your clients.
          </p>
          <AppStoreButtons />
        </div>
      </section>
    </div>
  );
}

