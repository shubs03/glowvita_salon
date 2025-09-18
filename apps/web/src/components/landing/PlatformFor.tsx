"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@repo/ui/cn";
import { Sparkles, ArrowRight } from "lucide-react";
import { Badge } from '@repo/ui/badge';

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
    className="relative inline-block h-48 w-72 md:h-56 md:w-80 shrink-0 overflow-hidden rounded-lg transition-all duration-500 hover:shadow-2xl hover:shadow-primary/25 group border-2 border-border/30 hover:border-primary/50 hover-lift bg-gradient-to-br from-background to-primary/5"
    href="#"
  >
    <Image
      className="size-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 filter group-hover:brightness-110"
      src={imageUrl}
      alt={title}
      width={320}
      height={224}
      data-ai-hint={hint}
    />

    {/* Shimmer Effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

    <div className="rounded-md absolute inset-0 z-10 flex w-full flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent">
      <div className="rounded-md flex flex-row items-center justify-between gap-2 p-4 md:p-6">
        <div className="text-base md:text-base font-bold leading-tight text-white group-hover:text-primary transition-colors duration-300">
          {title}
        </div>
        <ArrowRight className="h-5s w-5 text-white/70 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </div>

    {/* Hover overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
  </a>
);

const PlatformForMarquee = ({ rtl = false }: { rtl?: boolean }) => {
  const items = [
    {
      title: "Hair Salons",
      imageUrl: "https://placehold.co/320x224.png",
      hint: "modern hair salon interior",
    },
    {
      title: "Nail Studios",
      imageUrl: "https://placehold.co/320x224.png",
      hint: "elegant nail salon",
    },
    {
      title: "Barber Shops",
      imageUrl: "https://placehold.co/320x224.png",
      hint: "contemporary barber shop",
    },
    {
      title: "Beauty Spas",
      imageUrl: "https://placehold.co/320x224.png",
      hint: "luxury spa treatment room",
    },
    {
      title: "Wellness Centers",
      imageUrl: "https://placehold.co/320x224.png",
      hint: "modern wellness center",
    },
    {
      title: "Bridal Boutiques",
      imageUrl: "https://placehold.co/320x224.png",
      hint: "bridal makeup studio",
    },
  ];
  return (
    <div className="w-full overflow-hidden">
      <div
        className={`pt-5 flex w-fit items-start space-x-6 md:space-x-8 ${rtl ? "animate-slide-rtl" : "animate-slide"} hover:[animation-play-state:paused]`}
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

export function PlatformFor() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("platform-for");
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="platform-for"
      className="py-20 md:py-28 bg-gradient-to-br from-secondary/20 via-primary/15 to-primary/10 relative overflow-hidden"
    >
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,white,transparent_70%)] opacity-20"></div>
      <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-primary/15 to-transparent rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-secondary/15 to-transparent rounded-full blur-3xl animate-float-delayed"></div>

      <div className="mx-auto max-w-[2000px] space-y-12 md:space-y-16 relative z-10">
        <div
          className={cn(
            "text-center space-y-6 px-4 transition-all duration-1000",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Trusted by Top Salons
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            From intimate boutique salons to large wellness centers, our
            platform scales with your ambitions and adapts to your unique
            business requirements.
          </p>
        </div>

        <div
          className={cn(
            "space-y-8 transition-all duration-1000 delay-300",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
            <PlatformForMarquee />
          </div>
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
            <PlatformForMarquee rtl={true} />
          </div>
        </div>
      </div>
    </section>
  );
}
