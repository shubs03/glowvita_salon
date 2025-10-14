"use client";

import Image from "next/image";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { ArrowRight, LucideIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@repo/ui/cn";
import Link from "next/link";

interface FeatureCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: LucideIcon;
  iconColor: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline";
  features: string[];
  actionText: string;
  actionLink: string;
  stats?: {
    value: string;
    label: string;
  }[];
}

export function FeatureCard({
  id,
  title,
  description,
  image,
  icon: Icon,
  iconColor,
  badge,
  badgeVariant = "default",
  features,
  actionText,
  actionLink,
  stats,
}: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  return (
    <div 
      className="group relative overflow-hidden rounded-md hover:shadow-lg border bg-card transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Upper Half: Image - Reduced height */}
      <div className="aspect-[3/2] relative w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          layout="fill"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {badge && (
          <Badge 
            variant={badgeVariant}
            className="absolute top-2 right-2 border-0 text-xs px-2 py-0.5 rounded-full font-medium"
          >
            {badge}
          </Badge>
        )}
      </div>

      {/* Lower Half: Details - More compact */}
      <div className="p-4 flex flex-col justify-between h-fit bg-card">
        <div>
          {/* Feature Header - More compact */}
          <div className="flex items-center gap-3 mb-3">
            {/* <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300",
              isHovered ? "scale-110" : "scale-100",
              `bg-${iconColor}/15`
            )}>
              <Icon className={cn("h-4 w-4", `text-${iconColor}`)} />
            </div> */}
            <div className="flex-1">
              <h3 className="text-base font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors line-clamp-1">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {description}
              </p>
            </div>
          </div>

          {/* Features List - Limit to 2 features for space */}
          <div className="space-y-1 mb-3">
            {features.slice(0, 2).map((feature, index) => (
              <p key={index} className="text-xs text-foreground flex items-start">
                <span className="text-primary mr-1 text-xs">•</span>
                <span className="line-clamp-1">{feature}</span>
              </p>
            ))}
          </div>
        </div>

        
          {/* Stats as tags */}
          {stats && stats.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {stats.map((stat, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary hover:bg-primary/15 border-0"
                >
                  {stat.value} {stat.label}
                </Badge>
              ))}
            </div>
          )}

        {/* Action Button - Smaller */}
        <Button
          asChild
          size="sm"
          className="w-full transition-all duration-200 text-xs"
          variant="outline"
        >
          <Link href={actionLink} className="flex items-center justify-center gap-1">
            {actionText}
            <ArrowRight className="h-3 w-3 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  );
}