"use client";

import Link from "next/link";
import { Button } from "@repo/ui/button";
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
  <div className="group relative p-8 bg-gradient-to-br from-background via-background to-primary/5 rounded-md shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden text-left border border-border/50 hover:border-primary/20">
    {/* Animated background gradient */}
    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    {/* Top accent line */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>

    {/* Decorative corner elements */}
    <div className="absolute top-4 right-4 w-2 h-2 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="absolute bottom-4 left-4 w-1 h-8 bg-gradient-to-t from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <div className="flex items-start gap-4 mb-4 relative z-10">
      <div className="flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 h-14 w-14 flex items-center justify-center rounded-xl text-primary shadow-sm group-hover:shadow-md transition-shadow duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
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
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
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
  <div className="flex-shrink-0 w-80 h-96 bg-gradient-to-br from-background via-background to-primary/5 rounded-md shadow-xl p-8 flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-border/50">
    {/* Background decoration */}
    <div className="absolute -top-10 -right-10 text-primary/5 text-[120px] group-hover:text-primary/10 transition-colors duration-500">
      {icon}
    </div>

    {/* Animated gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    {/* Top corner decoration */}
    <div className="absolute top-0 right-0 w-16 h-16">
      <div className="absolute top-4 right-4 w-2 h-2 bg-primary/30 rounded-full"></div>
      <div className="absolute top-6 right-6 w-1 h-1 bg-primary/20 rounded-full"></div>
    </div>

    <div className="relative z-10">
      <p className="text-6xl font-bold bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary transition-all duration-300">
        {stat}
      </p>
      <h3 className="text-xl font-semibold mt-2 group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
    </div>
    <p className="text-muted-foreground relative z-10 group-hover:text-foreground transition-colors duration-300">
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
    <div className="flex h-[480px] flex-col items-start gap-3 overflow-hidden rounded-md bg-gradient-to-br from-muted to-muted/80 p-8 text-muted-foreground shadow-lg group-hover:shadow-xl transition-all duration-300 border border-border/50">
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
    <div className="relative size-full overflow-hidden rounded-md shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
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
    className="relative inline-block h-[194px] w-[309px] shrink-0 overflow-hidden rounded-md transition-all duration-300 hover:shadow-2xl group border border-border/50"
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
      <div className="flex flex-row items-center justify-between gap-2 p-4">
        <div className="text-[20px] font-semibold leading-[28px] text-white">
          {title}
        </div>
        <Button
          size="icon"
          className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-full opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 hover:scale-110"
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
        className={`flex w-fit items-start space-x-8 ${rtl ? "animate-slide-rtl" : "animate-slide"} hover:[animation-play-state:paused]`}
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

const AppPromotionSection = ({
  appName,
  title,
  description,
  features,
  appStoreUrl,
  googlePlayUrl,
  images,
  hints,
  reverse = false,
}) => (
  <section className="py-12 md:py-20 relative overflow-hidden">
    {/* Background decorations */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10"></div>
    <div className="absolute top-10 md:top-20 left-4 md:left-10 w-20 md:w-32 h-20 md:h-32 bg-primary/10 rounded-full blur-2xl md:blur-3xl"></div>
    <div className="absolute bottom-10 md:bottom-20 right-4 md:right-10 w-24 md:w-40 h-24 md:h-40 bg-secondary/15 rounded-full blur-2xl md:blur-3xl"></div>

    <div className="container mx-auto px-4 md:px-6 relative z-10">
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center ${
          reverse ? "lg:grid-flow-col-dense" : ""
        }`}
      >
        {/* Content Section */}
        <div
          className={`space-y-4 md:space-y-6 ${reverse ? "lg:col-start-2" : ""} order-2 lg:order-1`}
        >
          {/* App name badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium">
            <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
            {appName}
          </div>

          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text leading-tight">
            {title}
          </h2>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* Features */}
          <div className="space-y-3 md:space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 md:gap-4 p-2.5 md:p-3 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="bg-green-100 text-green-600 p-1 rounded-full group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                </div>
                <span className="text-sm md:text-base group-hover:text-foreground transition-colors duration-300">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
            <Button
              size="lg"
              className="group shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base h-12 md:h-14 px-6 md:px-8"
              asChild
            >
              <Link href={appStoreUrl}>
                <Download className="mr-2 h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform duration-200" />
                App Store
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base h-12 md:h-14 px-6 md:px-8"
              asChild
            >
              <Link href={googlePlayUrl}>
                <Download className="mr-2 h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform duration-200" />
                Google Play
              </Link>
            </Button>
          </div>
        </div>

        {/* Phone Cards Section */}
        <div
          className={`${reverse ? "lg:col-start-1" : ""} order-1 lg:order-2`}
        >
          <div className="relative flex justify-center items-end h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] px-4 md:px-8">
            {/* Background glow effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-2xl blur-2xl md:blur-3xl opacity-60"></div>

            {/* Left Phone Card */}
            <div className="relative w-[80px] sm:w-[100px] md:w-[140px] lg:w-[180px] h-[160px] sm:h-[200px] md:h-[280px] lg:h-[360px] mr-2 sm:mr-4 md:mr-6 lg:mr-8">
              <div
                className="w-full h-full bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl overflow-hidden group hover:scale-105 transition-all duration-500 cursor-pointer"
                style={{
                  clipPath:
                    "polygon(0 8%, 8% 0%, 92% 0%, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0% 92%)",
                }}
              >
                {/* Notch */}
                <div className="absolute top-2 md:top-3 left-1/2 transform -translate-x-1/2 w-6 md:w-8 h-0.5 md:h-1 bg-slate-600 rounded-full"></div>

                {/* Screen Content */}
                <div className="mt-4 md:mt-6 h-full p-1 md:p-2">
                  <div className="w-full h-full bg-slate-100 rounded-sm overflow-hidden relative">
                    <Image
                      src={images[0]}
                      alt={`${appName} screenshot 1`}
                      layout="fill"
                      objectFit="cover"
                      className="group-hover:scale-110 transition-transform duration-500"
                      data-ai-hint={hints[0]}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Phone Card (Main) */}
            <div className="relative w-[100px] sm:w-[130px] md:w-[180px] lg:w-[220px] h-[200px] sm:h-[260px] md:h-[360px] lg:h-[440px] z-10">
              <div
                className="w-full h-full bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl overflow-hidden group hover:scale-105 transition-all duration-500 cursor-pointer"
                style={{
                  clipPath:
                    "polygon(0 8%, 8% 0%, 92% 0%, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0% 92%)",
                }}
              >
                {/* Notch */}
                <div className="absolute top-2 md:top-4 left-1/2 transform -translate-x-1/2 w-8 md:w-12 h-0.5 md:h-1 bg-slate-600 rounded-full"></div>

                {/* Screen Content */}
                <div className="mt-4 md:mt-8 h-full p-1 md:p-2">
                  <div className="w-full h-full bg-slate-100 rounded-sm overflow-hidden relative">
                    <Image
                      src={images[1]}
                      alt={`${appName} screenshot 2`}
                      layout="fill"
                      objectFit="cover"
                      className="group-hover:scale-110 transition-transform duration-500"
                      data-ai-hint={hints[1]}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>

                {/* Enhanced glow for main card */}
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10"></div>
              </div>
            </div>

            {/* Right Phone Card */}
            <div className="relative w-[80px] sm:w-[100px] md:w-[140px] lg:w-[180px] h-[160px] sm:h-[200px] md:h-[280px] lg:h-[360px] ml-2 sm:ml-4 md:ml-6 lg:ml-8">
              <div
                className="w-full h-full bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl overflow-hidden group hover:scale-105 transition-all duration-500 cursor-pointer"
                style={{
                  clipPath:
                    "polygon(0 8%, 8% 0%, 92% 0%, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0% 92%)",
                }}
              >
                {/* Notch */}
                <div className="absolute top-2 md:top-3 left-1/2 transform -translate-x-1/2 w-6 md:w-8 h-0.5 md:h-1 bg-slate-600 rounded-full"></div>

                {/* Screen Content */}
                <div className="mt-4 md:mt-6 h-full p-1 md:p-2">
                  <div className="w-full h-full bg-slate-100 rounded-sm overflow-hidden relative">
                    <Image
                      src={images[2]}
                      alt={`${appName} screenshot 3`}
                      layout="fill"
                      objectFit="cover"
                      className="group-hover:scale-110 transition-transform duration-500"
                      data-ai-hint={hints[2]}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating accent elements */}
            <div className="absolute top-4 md:top-8 left-4 md:left-8 animate-pulse">
              <div className="bg-primary/15 backdrop-blur-sm rounded-full p-1.5 md:p-2">
                <Star className="h-3 w-3 md:h-4 md:w-4 text-primary" />
              </div>
            </div>
            <div className="absolute bottom-8 md:bottom-16 right-4 md:right-8 animate-pulse delay-1000">
              <div className="bg-secondary/15 backdrop-blur-sm rounded-full p-1.5 md:p-2">
                <Heart className="h-3 w-3 md:h-4 md:w-4 text-pink-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default function CrmHomePage() {
  const [advantageScroll, setAdvantageScroll] = useState(0);

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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-bold text-xl font-headline bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Vendor CRM
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" className="hover:bg-primary/10" asChild>
              <Link href="#">App Links</Link>
            </Button>
            <ThemeToggle />
            <Button variant="ghost" className="hover:bg-primary/10" asChild>
              <Link href="#">Support</Link>
            </Button>
            <Button variant="ghost" className="hover:bg-primary/10" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button
              className="shadow-lg hover:shadow-xl transition-shadow duration-300 group"
              asChild
            >
              <Link href="/login">
                Get Started{" "}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-10 md:py-14 bg-background overflow-hidden">
          {/* Enhanced background */}
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-primary/40 via-transparent to-secondary/40"></div>
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/15 rounded-full blur-3xl"></div>

          {/* Animated particles */}
          <div className="absolute top-1/4 left-1/4 animate-bounce delay-1000">
            <Sparkles className="h-6 w-6 text-primary/30" />
          </div>
          <div className="absolute top-1/3 right-1/3 animate-bounce delay-700">
            <Zap className="h-8 w-8 text-secondary/40" />
          </div>
          <div className="absolute bottom-1/3 left-1/3 animate-bounce delay-300">
            <Star className="h-5 w-5 text-primary/20" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <div className="flex justify-center gap-6 mb-8">
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-4 rounded-md text-primary shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-110 transform transition-transform duration-200">
                  <Scissors className="h-8 w-8" />
                </div>
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-4 rounded-md text-primary shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-110 transform transition-transform duration-200">
                  <CalendarCheck className="h-8 w-8" />
                </div>
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-4 rounded-md text-primary shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-110 transform transition-transform duration-200">
                  <LineChart className="h-8 w-8" />
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold font-headline tracking-tighter mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                Elevate Your Salon Business
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-10 leading-relaxed">
                The all-in-one CRM designed for modern salons and stylists.
                Manage your clients, bookings, and payments seamlessly to unlock
                your salon's full potential.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                <Button
                  size="lg"
                  className="text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  asChild
                >
                  <Link href="/dashboard">
                    Go to Dashboard{" "}
                    <Rocket className="ml-2 h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50"
                  asChild
                >
                  <Link href="#">Learn More</Link>
                </Button>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-6">
                  Trusted by leading salons and stylists
                </p>
                <div className="flex justify-center items-center gap-12 opacity-60">
                  <div className="flex items-center gap-2 hover:opacity-100 transition-opacity duration-300">
                    <Users className="h-8 w-8" />
                    <span className="font-semibold">Teams</span>
                  </div>
                  <div className="flex items-center gap-2 hover:opacity-100 transition-opacity duration-300">
                    <Shield className="h-8 w-8" />
                    <span className="font-semibold">Secure</span>
                  </div>
                  <div className="flex items-center gap-2 hover:opacity-100 transition-opacity duration-300">
                    <Award className="h-8 w-8" />
                    <span className="font-semibold">Award Winning</span>
                  </div>
                  <div className="flex items-center gap-2 hover:opacity-100 transition-opacity duration-300">
                    <Globe className="h-8 w-8" />
                    <span className="font-semibold">Global</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-secondary/30 to-transparent"></div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-gradient-to-br from-background via-secondary/10 to-background relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <TrendingUp className="h-4 w-4" />
                Why Choose Us
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold font-headline mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Why Choose Our CRM?
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
                We provide the tools to not just manage, but to grow your
                business with innovative features designed for modern salons.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <BenefitItem
                icon={<Rocket className="h-7 w-7" />}
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
                icon={<Users className="h-7 w-7" />}
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
                icon={<LineChart className="h-7 w-7" />}
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

        {/* Pricing Section */}
        <section className="py-20 bg-gradient-to-br from-secondary/20 via-secondary/10 to-background relative overflow-hidden">
          {/* Enhanced background decorations */}
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/15 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <CreditCard className="h-4 w-4" />
                Pricing Plans
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold font-headline mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Simple Plans for Every Stage
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
                Transparent pricing that scales as your business grows. No
                hidden fees, just pure value.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
              <Card className="flex flex-col text-left h-full bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-md group">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Basic Plan
                  </CardTitle>
                  <CardDescription className="text-base">
                    Perfect for new and growing salons.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-6">
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      ₹500
                    </p>
                    <span className="text-lg font-normal text-muted-foreground">
                      / 2 months
                    </span>
                  </div>
                  <ul className="space-y-4 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3 group-hover:text-foreground transition-colors duration-300">
                      <Check className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>
                        <span className="font-semibold text-foreground">
                          Core CRM Features:
                        </span>{" "}
                        Client profiles, appointment booking, and basic
                        reporting.
                      </span>
                    </li>
                    <li className="flex items-start gap-3 group-hover:text-foreground transition-colors duration-300">
                      <Check className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Up to 500 Active Clients</span>
                    </li>
                    <li className="flex items-start gap-3 group-hover:text-foreground transition-colors duration-300">
                      <Check className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Standard Email Support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button
                    className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300"
                    variant="outline"
                  >
                    Choose Basic Plan
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-2 border-primary flex flex-col shadow-2xl relative h-full bg-gradient-to-br from-background to-primary/5 backdrop-blur-sm rounded-md overflow-hidden group">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <Star className="h-4 w-4 fill-current" />
                    MOST POPULAR
                  </div>
                </div>
                <CardHeader className="text-left pt-8 pb-4 relative z-10">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Pro Plan
                  </CardTitle>
                  <CardDescription className="text-base">
                    For established salons ready to scale.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-6 relative z-10">
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      ₹1000
                    </p>
                    <span className="text-lg font-normal text-muted-foreground">
                      / 5 months
                    </span>
                  </div>
                  <ul className="space-y-4 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3 group-hover:text-foreground transition-colors duration-300">
                      <Check className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>
                        <span className="font-semibold text-foreground">
                          Everything in Basic, plus:
                        </span>
                      </span>
                    </li>
                    <li className="flex items-start gap-3 group-hover:text-foreground transition-colors duration-300">
                      <Check className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Unlimited Clients & Bookings</span>
                    </li>
                    <li className="flex items-start gap-3 group-hover:text-foreground transition-colors duration-300">
                      <Check className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Advanced Analytics & Reporting</span>
                    </li>
                    <li className="flex items-start gap-3 group-hover:text-foreground transition-colors duration-300">
                      <Check className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Email & SMS Marketing Tools</span>
                    </li>
                    <li className="flex items-start gap-3 group-hover:text-foreground transition-colors duration-300">
                      <Check className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Priority Phone & Email Support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="pt-4 relative z-10">
                  <Button className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                    Choose Pro Plan
                  </Button>
                </CardFooter>
              </Card>

              <Card className="flex flex-col text-left h-full bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-md group">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Free Trial
                  </CardTitle>
                  <CardDescription className="text-base">
                    Explore all Pro features, no credit card required.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-6">
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                      7
                    </p>
                    <span className="text-lg font-normal text-muted-foreground">
                      Days Free
                    </span>
                  </div>
                  <ul className="space-y-4 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3 group-hover:text-foreground transition-colors duration-300">
                      <Check className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Full access to all Pro Plan features.</span>
                    </li>
                    <li className="flex items-start gap-3 group-hover:text-foreground transition-colors duration-300">
                      <Check className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Onboard your team and clients.</span>
                    </li>
                    <li className="flex items-start gap-3 group-hover:text-foreground transition-colors duration-300">
                      <Check className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Experience the growth potential firsthand.</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button
                    className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300"
                    variant="outline"
                  >
                    Start Free Trial
                  </Button>
                </CardFooter>
              </Card>
            </div>
            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">
                Looking for more? Check out our{" "}
                <Link
                  href="#"
                  className="underline text-primary hover:text-primary/80 font-semibold"
                >
                  Enterprise solutions
                </Link>
                .
              </p>
              <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>30-day money back guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Everything you need section */}
        <section className="py-20 bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-10 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-secondary/15 rounded-full blur-2xl"></div>

          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="md:text-right space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 md:ml-auto">
                  <Settings className="h-4 w-4" />
                  Complete Solution
                </div>
                <h2 className="text-4xl md:text-6xl font-bold font-headline text-pretty bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text leading-tight">
                  Everything you need to run your business
                </h2>
                <p className="text-xl max-w-xl md:ml-auto text-muted-foreground leading-relaxed">
                  Our platform offers innovative features that bring
                  convenience, efficiency, and an improved experience for both
                  your team members and clients.
                </p>
              </div>
              <div className="space-y-8">
                <Card className="bg-gradient-to-br from-background to-primary/5 border-l-4 border-primary shadow-lg hover:shadow-xl transition-all duration-300 rounded-md group overflow-hidden">
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded">
                        <Settings className="h-5 w-5" />
                      </div>
                      Manage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-muted-foreground leading-relaxed">
                      Manage bookings, sales, clients, locations, and team
                      members. Analyse your business with advanced reporting and
                      analytics.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-background to-primary/5 border-l-4 border-primary shadow-lg hover:shadow-xl transition-all duration-300 rounded-md group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="bg-green-100 text-green-600 p-2 rounded">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      Grow
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-muted-foreground leading-relaxed">
                      Win new clients on the world's largest beauty and wellness
                      marketplace. Keep them coming back with marketing
                      features.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-background to-primary/5 border-l-4 border-primary shadow-lg hover:shadow-xl transition-all duration-300 rounded-md group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="bg-purple-100 text-purple-600 p-2 rounded">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      Get Paid
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-muted-foreground leading-relaxed">
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

        {/* Mobile App Promotion Sections */}
        <AppPromotionSection
          appName="For Your Clients"
          title="GlowVita Salon App"
          description="Empower your clients with a seamless booking experience that keeps them coming back for more."
          features={[
            "Book appointments 24/7 from anywhere",
            "Reschedule with ease and flexibility",
            "View past & upcoming bookings",
            "Receive exclusive offers and rewards",
          ]}
          appStoreUrl="#"
          googlePlayUrl="#"
          images={[
            "https://placehold.co/375x812.png",
            "https://placehold.co/375x812.png",
            "https://placehold.co/375x812.png",
          ]}
          hints={[
            "app booking screen",
            "app profile screen",
            "app services screen",
          ]}
        />

        <AppPromotionSection
          appName="For Your Business"
          title="Vendor CRM App"
          description="Take control of your salon operations with powerful mobile management tools designed for busy professionals."
          features={[
            "Manage your calendar on-the-go",
            "Access detailed client information instantly",
            "Track your performance metrics",
            "View comprehensive business reports",
          ]}
          appStoreUrl="#"
          googlePlayUrl="#"
          images={[
            "https://placehold.co/375x812.png",
            "https://placehold.co/375x812.png",
            "https://placehold.co/375x812.png",
          ]}
          hints={[
            "crm dashboard mobile",
            "crm calendar mobile",
            "crm analytics mobile",
          ]}
          reverse={true}
        />

        {/* CRM Advantages Section */}
        <section className="py-20 bg-gradient-to-br from-background via-secondary/10 to-background relative overflow-hidden">
          {/* Enhanced background */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/15 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Award className="h-4 w-4" />
                Real Results
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold font-headline mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Unlock Your Potential
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
                See the real-world impact of using our CRM. These metrics
                represent actual improvements from our satisfied clients.
              </p>
            </div>

            <div
              id="advantages-container"
              className="flex gap-8 pb-8 overflow-x-auto snap-x snap-mandatory no-scrollbar"
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

        {/* Top-rated by the industry Section */}
        <section className="py-20 bg-gradient-to-br from-secondary/20 via-secondary/10 to-background relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-10 right-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Star className="h-4 w-4 fill-current" />
                Client Reviews
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-primary font-headline mb-6">
                Top-Rated by the Industry
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Our dedication to building the best-in-class booking software
                and delivering exceptional customer experience continues to be
                recognized time and time again.
              </p>
            </div>
            <div className="relative">
              {/* Gradient masks for smooth scroll effect */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-secondary/20 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-secondary/20 to-transparent z-10 pointer-events-none"></div>

              <div
                className="flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth px-5 pb-4"
                style={{ scrollbarWidth: "none" }}
              >
                <div className="flex gap-8">
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
                  <TestimonialCard
                    author="Gayle S"
                    role="Business owner"
                    rating={5}
                    review="Coming from a much more complicated system, this was so wonderfully easy to figure out and implement. Customer service has always been so kind and responsive. It's a truly fantastic product, and hands down the best salon scheduling system I've seen."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform for all section */}
        <section className="py-20 bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-20 left-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-secondary/15 rounded-full blur-3xl"></div>

          <div className="mx-auto max-w-[2000px] space-y-12 relative z-10">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Globe className="h-4 w-4" />
                Universal Platform
              </div>
              <h2 className="px-5 text-4xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                A platform suitable for all
              </h2>
              <p className="px-5 text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
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

        {/* FAQ Section */}
        <section className="py-20 bg-gradient-to-br from-secondary/20 via-secondary/10 to-background relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-10 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-secondary/15 rounded-full blur-2xl"></div>

          <div className="container mx-auto px-4 max-w-5xl relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4 font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Have questions? We've got answers. Here are the most common
                questions about our platform.
              </p>
            </div>
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-background to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 rounded-md group border border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-4 text-xl group-hover:text-primary transition-colors duration-300">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded group-hover:scale-110 transition-transform duration-200">
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

              <Card className="bg-gradient-to-br from-background to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 rounded-md group border border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-4 text-xl group-hover:text-primary transition-colors duration-300">
                    <div className="bg-green-100 text-green-600 p-2 rounded group-hover:scale-110 transition-transform duration-200">
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

              <Card className="bg-gradient-to-br from-background to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 rounded-md group border border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-4 text-xl group-hover:text-primary transition-colors duration-300">
                    <div className="bg-purple-100 text-purple-600 p-2 rounded group-hover:scale-110 transition-transform duration-200">
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

        {/* Final CTA */}
        <section className="py-20 text-center bg-gradient-to-br from-background via-primary/10 to-background relative overflow-hidden">
          {/* Enhanced background decorations */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/25 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/15 rounded-full blur-3xl"></div>
          </div>

          {/* Floating decorative elements */}
          <div className="absolute top-1/4 left-1/4 animate-bounce delay-1000">
            <div className="bg-primary/20 backdrop-blur-sm rounded-full p-3">
              <Rocket className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="absolute top-1/3 right-1/4 animate-bounce delay-500">
            <div className="bg-secondary/20 backdrop-blur-sm rounded-full p-3">
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <div className="absolute bottom-1/3 left-1/3 animate-bounce delay-700">
            <div className="bg-primary/15 backdrop-blur-sm rounded-full p-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <UserPlus className="h-4 w-4" />
                Get Started Today
              </div>

              <h2 className="text-4xl lg:text-6xl font-bold font-headline mb-6 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
                Ready to Grow Your Business?
              </h2>

              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Join hundreds of successful salons worldwide. Transform your
                business today with our powerful, easy-to-use CRM platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
                <Button
                  size="lg"
                  className="text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  asChild
                >
                  <Link href="/login">
                    Sign Up Now{" "}
                    <UserPlus className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50"
                  asChild
                >
                  <Link href="#">
                    Schedule Demo <Phone className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Free 7-day trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-background via-secondary/10 to-background border-t border-border/50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="font-bold text-xl font-headline bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Vendor CRM
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Empowering salon owners with the tools they need to grow their
                business and delight their clients.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Product</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link
                  href="#"
                  className="block hover:text-primary transition-colors duration-200"
                >
                  Features
                </Link>
                <Link
                  href="#"
                  className="block hover:text-primary transition-colors duration-200"
                >
                  Pricing
                </Link>
                <Link
                  href="#"
                  className="block hover:text-primary transition-colors duration-200"
                >
                  Mobile Apps
                </Link>
                <Link
                  href="#"
                  className="block hover:text-primary transition-colors duration-200"
                >
                  Integrations
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Company</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link
                  href="#"
                  className="block hover:text-primary transition-colors duration-200"
                >
                  About Us
                </Link>
                <Link
                  href="#"
                  className="block hover:text-primary transition-colors duration-200"
                >
                  Careers
                </Link>
                <Link
                  href="#"
                  className="block hover:text-primary transition-colors duration-200"
                >
                  Blog
                </Link>
                <Link
                  href="#"
                  className="block hover:text-primary transition-colors duration-200"
                >
                  Press
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Support</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link
                  href="#"
                  className="block hover:text-primary transition-colors duration-200"
                >
                  Help Center
                </Link>
                <Link
                  href="#"
                  className="block hover:text-primary transition-colors duration-200"
                >
                  Contact Us
                </Link>
                <Link
                  href="#"
                  className="block hover:text-primary transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="#"
                  className="block hover:text-primary transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} Vendor CRM. All Rights Reserved.
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Made with love for salon owners</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
