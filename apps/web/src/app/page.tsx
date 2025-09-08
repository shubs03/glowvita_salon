
"use client";

import Link from 'next/link';
import { Button } from '@repo/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@repo/ui/card";
import {
  ArrowRight,
  Book,
  CalendarCheck,
  LineChart,
  Check,
  CheckCircle,
  MessageSquare,
  CreditCard,
  Scissors,
  HelpCircle,
  Rocket,
  LogIn,
  UserPlus,
  Users,
  Shield,
  Settings,
  Plus,
  Star,
  Phone,
  Download,
  Clock,
  PlayCircle,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Heart,
  Globe,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const FeatureItem = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex gap-4 items-start p-4 rounded transition-all duration-300 hover:bg-secondary">
    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full text-primary">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-muted-foreground">{children}</p>
    </div>
  </div>
);

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
  <div className="group relative p-6 md:p-8 bg-gradient-to-br from-background via-background to-primary/5 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden text-left border border-border/50 hover:border-primary/20">
    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
    <div className="flex items-start gap-4 mb-4 relative z-10">
      <div className="flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 h-12 w-12 md:h-14 md:w-14 flex items-center justify-center rounded-xl text-primary shadow-sm group-hover:shadow-md transition-shadow duration-300">
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
        {title}
      </h3>
    </div>
    <p className="text-muted-foreground text-sm mb-6 relative z-10 leading-relaxed">
      {children}
    </p>
    <ul className="space-y-3 text-sm relative z-10">
      {features.map((feature, index) => (
        <li
          key={index}
          className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
        >
          <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

const AdvantageCard = ({
  stat,
  title,
  description,
  icon,
}: {
  stat: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) => (
  <div className="flex-shrink-0 w-64 md:w-80 h-80 md:h-96 bg-gradient-to-br from-background via-background to-primary/5 rounded-lg shadow-xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-border/50">
    <div className="absolute -top-10 -right-10 text-primary/5 text-9xl md:text-[120px] group-hover:text-primary/10 transition-colors duration-500">
      {icon}
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <p className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary transition-all duration-300">
        {stat}
      </p>
      <h3 className="text-lg md:text-xl font-semibold mt-2 group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
    </div>
    <p className="text-muted-foreground text-sm md:text-base relative z-10 group-hover:text-foreground transition-colors duration-300">
      {description}
    </p>
  </div>
);

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
  <div
    className="shrink-0 snap-center overflow-hidden group"
    style={{ width: "300px" }}
  >
    <div className="flex h-[480px] flex-col items-start gap-3 overflow-hidden rounded-lg bg-gradient-to-br from-muted to-muted/80 p-8 text-muted-foreground shadow-lg group-hover:shadow-xl transition-all duration-300 border border-border/50">
      <div className="flex h-5 gap-2 text-yellow-400">
        {[...Array(rating)].map((_, i) => (
          <Star
            key={i}
            className="h-5 w-5 hover:scale-110 transition-transform duration-200"
            fill="currentColor"
          />
        ))}
        {[...Array(5 - rating)].map((_, i) => (
          <Star key={i + rating} className="h-5 w-5" />
        ))}
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="h-full overflow-hidden">
          <p className="text-[17px] leading-6 group-hover:text-foreground transition-colors duration-300">
            {review}
          </p>
        </div>
      </div>
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <p className="text-[17px] font-medium leading-[24px] text-foreground">
            {author}
          </p>
          <p className="truncate text-[15px] leading-[20px] text-muted-foreground">
            {role}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const VideoTestimonialCard = () => (
  <div className="h-[480px] w-[80vw] shrink-0 snap-center overflow-hidden laptop:w-[853px] group">
    <div className="relative size-full overflow-hidden rounded-lg shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
      <Image
        src="https://placehold.co/853x480.png"
        alt="Testimonial video poster"
        layout="fill"
        objectFit="cover"
        className="transition-transform duration-500 group-hover:scale-105"
        data-ai-hint="salon professional"
      />
      <div className="absolute inset-0 z-10 flex h-full max-w-full flex-col justify-end rounded-xl text-white bg-gradient-to-t from-black/70 via-black/20 to-transparent">
        <div className="mx-6 flex items-center justify-between gap-2 pb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex size-10 shrink-0 overflow-hidden rounded-full border-2 border-white/80">
              <Image
                src="https://placehold.co/40x40.png"
                alt="Chris Ward"
                width={40}
                height={40}
                data-ai-hint="portrait man"
              />
            </div>
            <div>
              <p className="text-[17px] font-medium">Chris Ward</p>
              <p className="text-[15px] opacity-80">Founder of HUCKLE</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-0 h-12 w-12 hover:scale-110 transition-all duration-200"
          >
            <PlayCircle className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const PlatformForCard = ({
  title,
  imageUrl,
  hint,
}: {
  title: string;
  imageUrl: string;
  hint: string;
}) => (
  <a
    className="relative inline-block h-40 w-64 md:h-[194px] md:w-[309px] shrink-0 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-2xl group border border-border/50"
    href="#"
  >
    <Image
      className="size-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
      src={imageUrl}
      alt={title}
      width={309}
      height={194}
      data-ai-hint={hint}
    />
    <div className="absolute inset-0 z-10 flex w-full flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent">
      <div className="flex flex-row items-center justify-between gap-2 p-3 md:p-4">
        <div className="text-base md:text-xl font-semibold leading-tight text-white">
          {title}
        </div>
        <Button
          size="icon"
          className="bg-white/20 p-1 backdrop-blur-sm text-white hover:bg-white/30 rounded-full opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 hover:scale-110 h-8 w-8 md:h-auto md:w-auto"
          aria-label={title}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </a>
);

const PlatformForMarquee = ({ rtl = false }: { rtl?: boolean }) => {
  const items = [
    {
      title: "Hair Salon",
      imageUrl: "https://placehold.co/309x194.png",
      hint: "hair salon",
    },
    {
      title: "Nail Salon",
      imageUrl: "https://placehold.co/309x194.png",
      hint: "nail salon",
    },
    {
      title: "Barbers",
      imageUrl: "https://placehold.co/309x194.png",
      hint: "barber shop",
    },
    {
      title: "Waxing Salon",
      imageUrl: "https://placehold.co/309x194.png",
      hint: "waxing salon",
    },
    {
      title: "Medspa",
      imageUrl: "https://placehold.co/309x194.png",
      hint: "spa",
    },
    {
      title: "Eyebrow Bar",
      imageUrl: "https://placehold.co/309x194.png",
      hint: "eyebrows",
    },
  ];
  return (
    <div className="w-full overflow-hidden">
      <div
        className={`flex w-fit items-start space-x-4 md:space-x-8 ${rtl ? "animate-slide-rtl" : "animate-slide"} hover:[animation-play-state:paused]`}
      >
        {[...items, ...items].map((item, index) => (
          <PlatformForCard
            key={`${item.title}-${index}`}
            title={item.title}
            imageUrl={item.imageUrl}
            hint={item.hint}
          />
        ))}
      </div>
    </div>
  );
};

export default function HomePage() {
  const scrollAdvantages = (direction: "left" | "right") => {
    const container = document.getElementById("advantages-container");
    if (container) {
      const scrollAmount = container.clientWidth / 2;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-secondary/30 via-background to-secondary/20 text-foreground">
      <main className="flex-grow">
        <section className="relative py-16 md:py-16 bg-background overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <div className="flex justify-center gap-4 md:gap-6 mb-8">
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-3 md:p-3 rounded-full text-primary shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-110 transform transition-transform duration-200">
                  <Scissors className="h-6 w-6 md:h-5 md:w-5" />
                </div>
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-3 md:p-3 rounded-full text-primary shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-110 transform transition-transform duration-200">
                  <CalendarCheck className="h-6 w-6 md:h-5 md:w-5" />
                </div>
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-3 md:p-3 rounded-full text-primary shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-110 transform transition-transform duration-200">
                  <LineChart className="h-6 w-6 md:h-5 md:w-5" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-headline tracking-tighter mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                Elevate Your Salon Business
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto mb-10 leading-relaxed">
                The all-in-one CRM designed for modern salons and stylists.
                Manage your clients, bookings, and payments seamlessly to unlock
                your salon's full potential.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-12 md:mb-16">
                <Button
                  size="lg"
                  className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  asChild
                >
                  <Link href="/auth/register">
                    Get Started Free{" "}
                    <Rocket className="ml-2 h-5 w-5 md:h-6 md:w-6 group-hover:scale-110 transition-transform duration-200" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50"
                  asChild
                >
                  <Link href="#">Learn More</Link>
                </Button>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-6">
                  Trusted by leading salons and stylists
                </p>
                <div className="flex justify-center items-center gap-6 md:gap-12 opacity-60 flex-wrap">
                  <div className="flex items-center gap-2 hover:opacity-100 transition-opacity duration-300">
                    <Users className="h-6 w-6 md:h-8 md:w-8" />
                    <span className="font-semibold text-sm md:text-base">Teams</span>
                  </div>
                  <div className="flex items-center gap-2 hover:opacity-100 transition-opacity duration-300">
                    <Shield className="h-6 w-6 md:h-8 md:w-8" />
                    <span className="font-semibold text-sm md:text-base">Secure</span>
                  </div>
                  <div className="flex items-center gap-2 hover:opacity-100 transition-opacity duration-300">
                    <Award className="h-6 w-6 md:h-8 md:w-8" />
                    <span className="font-semibold text-sm md:text-base">Award Winning</span>
                  </div>
                  <div className="flex items-center gap-2 hover:opacity-100 transition-opacity duration-300">
                    <Globe className="h-6 w-6 md:h-8 md:w-8" />
                    <span className="font-semibold text-sm md:text-base">Global</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 md:h-32 bg-gradient-to-t from-secondary/30 to-transparent"></div>
        </section>
        <section className="py-16 md:py-20 bg-gradient-to-br from-background via-secondary/10 to-background relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <TrendingUp className="h-4 w-4" />
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

        <section className="py-16 md:py-20 bg-gradient-to-br from-secondary/20 via-secondary/10 to-background relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="md:text-right space-y-4 md:space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 md:ml-auto">
                  <Settings className="h-4 w-4" />
                  Complete Solution
                </div>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold font-headline text-pretty bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text leading-tight">
                  Everything you need to run your business
                </h2>
                <p className="text-lg md:text-xl max-w-xl md:ml-auto text-muted-foreground leading-relaxed">
                  Our platform offers innovative features that bring
                  convenience, efficiency, and an improved experience for both
                  your team members and clients.
                </p>
              </div>
              <div className="space-y-6 md:space-y-8">
                <Card className="bg-gradient-to-br from-background to-primary/5 border-l-4 border-primary shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="relative z-10 pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                        <Settings className="h-5 w-5" />
                      </div>
                      Manage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-0">
                    <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                      Manage bookings, sales, clients, locations, and team
                      members. Analyse your business with advanced reporting and
                      analytics.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-background to-primary/5 border-l-4 border-primary shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="relative z-10 pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      Grow
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-0">
                    <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                      Win new clients on the world's largest beauty and wellness
                      marketplace. Keep them coming back with marketing
                      features.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-background to-primary/5 border-l-4 border-primary shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="relative z-10 pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      Get Paid
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-0">
                    <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                      Get paid fast with seamless payment processing. Reduce
                      no-shows with upfront payments and simplify checkout for
                      clients.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Award className="h-4 w-4" />
                Real Results
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-headline mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Unlock Your Potential
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
                See the real-world impact of using our CRM. These metrics
                represent actual improvements from our satisfied clients.
              </p>
            </div>
            <div
              id="advantages-container"
              className="flex gap-4 md:gap-8 pb-8 overflow-x-auto snap-x snap-mandatory no-scrollbar"
            >
              <AdvantageCard
                stat="40%"
                title="Increase in Bookings"
                description="Clients booking through our platform are more likely to commit and show up for their appointments."
                icon={<CalendarCheck />}
              />
              <AdvantageCard
                stat="25%"
                title="More Repeat Clients"
                description="Build lasting loyalty with detailed client profiles and personalized service experiences."
                icon={<Users />}
              />
              <AdvantageCard
                stat="15%"
                title="Higher Average Spend"
                description="Intelligently upsell services and products by understanding complete client history and preferences."
                icon={<LineChart />}
              />
              <AdvantageCard
                stat="50%"
                title="Less Admin Time"
                description="Automate reminders and administrative tasks so you can focus on your craft and clients."
                icon={<Clock />}
              />
            </div>
            <div className="flex justify-center mt-8">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-full"
                  onClick={() => scrollAdvantages("left")}
                >
                  <ArrowRight className="h-4 w-4 transform rotate-180" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-full"
                  onClick={() => scrollAdvantages("right")}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-gradient-to-br from-secondary/20 via-secondary/10 to-background relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Star className="h-4 w-4 fill-current" />
                Client Reviews
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-primary font-headline mb-6">
                Top-Rated by the Industry
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our dedication to building the best-in-class booking software
                and delivering exceptional customer experience continues to be
                recognized time and time again.
              </p>
            </div>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 md:w-20 bg-gradient-to-r from-secondary/20 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 md:w-20 bg-gradient-to-l from-secondary/20 to-transparent z-10 pointer-events-none"></div>
              <div
                className="flex snap-x snap-mandatory gap-6 md:gap-8 overflow-x-auto scroll-smooth px-5 pb-4"
                style={{ scrollbarWidth: "none" }}
              >
                <div className="flex gap-6 md:gap-8">
                  <VideoTestimonialCard />
                  <TestimonialCard
                    author="Pamela B"
                    role="Salon owner, NYC"
                    rating={5}
                    review="I work with booth renters at my top-rated salon in Manhattan. I love this CRM because it offers my clients a professional appointment booking experience with seamless online booking features, automated reminders, and the best payment processing rates."
                  />
                  <TestimonialCard
                    author="Alex E"
                    role="Hair stylist and owner"
                    rating={5}
                    review="This appointment scheduling software is very user friendly and it's incredibly powerful! I decided to give it a go and was utterly surprised as it had more functionality than previous software I was using. The marketplace has been incredible for our salon business too."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden">
          <div className="mx-auto max-w-[2000px] space-y-8 md:space-y-12 relative z-10">
            <div className="text-center space-y-4 px-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Globe className="h-4 w-4" />
                Universal Platform
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                A platform suitable for all
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Whether you're running a small boutique salon or managing
                multiple locations, our platform adapts to your unique business
                needs.
              </p>
            </div>

            <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
              <PlatformForMarquee />
            </div>
            <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
              <PlatformForMarquee rtl={true} />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-gradient-to-br from-secondary/20 via-secondary/10 to-background relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-5xl relative z-10">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Frequently Asked Questions
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Have questions? We've got answers. Here are the most common
                questions about our platform.
              </p>
            </div>
            <div className="space-y-4 md:space-y-6">
              <Card className="bg-gradient-to-br from-background to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg group border border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-4 text-lg md:text-xl group-hover:text-primary transition-colors duration-300">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                      <Shield className="h-5 w-5" />
                    </div>
                    Is my data secure?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    Yes, we use industry-standard encryption and security
                    practices to keep your business and client data safe. Your
                    data is encrypted both in transit and at rest, and we comply
                    with all major data protection regulations.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-background to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg group border border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-4 text-lg md:text-xl group-hover:text-primary transition-colors duration-300">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                      <Settings className="h-5 w-5" />
                    </div>
                    Can I use this on multiple devices?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    Absolutely. Our CRM is fully responsive and works
                    beautifully on desktops, tablets, and smartphones. Your data
                    syncs automatically across all devices, so you can manage
                    your salon from anywhere.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-background to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg group border border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-4 text-lg md:text-xl group-hover:text-primary transition-colors duration-300">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                      <Clock className="h-5 w-5" />
                    </div>
                    How quickly can I get started?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    You can be up and running in minutes! Our setup process is
                    designed to be simple and intuitive, and our support team is
                    available to help you migrate your existing data and train
                    your staff.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 text-center bg-gradient-to-br from-background via-primary/10 to-background relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <UserPlus className="h-4 w-4" />
                Get Started Today
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold font-headline mb-6 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
                Ready to Grow Your Business?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Join hundreds of successful salons worldwide. Transform your
                business today with our powerful, easy-to-use CRM platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-8">
                <Button
                  size="lg"
                  className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  asChild
                >
                  <Link href="/auth/register">
                    Sign Up Now{" "}
                    <UserPlus className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50"
                  asChild
                >
                  <Link href="#">
                    Schedule Demo <Phone className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>Free 7-day trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
