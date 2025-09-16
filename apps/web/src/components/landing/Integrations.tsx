
"use client";

import Image from 'next/image';
import { Badge } from '@repo/ui/badge';
import { ArrowRight } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { ModernCard } from '@repo/ui/modern-card';
import { cn } from '@repo/ui/cn';

const integrations = [
  { name: 'Zapier', category: 'Automation', logo: 'https://picsum.photos/seed/zapier/48/48', description: 'Connect your apps and automate workflows.' },
  { name: 'Slack', category: 'Communication', logo: 'https://picsum.photos/seed/slack/48/48', description: 'Bring team communication and collaboration into one place.' },
  { name: 'Shopify', category: 'E-commerce', logo: 'https://picsum.photos/seed/shopify/48/48', description: 'The all-in-one e-commerce platform to start and run a business.' },
  { name: 'Figma', category: 'Design', logo: 'https://picsum.photos/seed/figma/48/48', description: 'The collaborative interface design tool.' },
  { name: 'Tiktok', category: 'Social Media', logo: 'https://picsum.photos/seed/tiktok/48/48', description: 'The leading destination for short-form mobile video.' },
  { name: 'Google Suite', category: 'Productivity', logo: 'https://picsum.photos/seed/google/48/48', description: 'A package of cloud computing, productivity and collaboration tools.' },
];

export function Integrations() {
  return (
    <section className="py-20 md:py-[100px] bg-secondary/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto space-y-5 mb-10 md:mb-16 text-center">
          <Badge variant="secondary" className="bg-green-100 text-green-700 border border-green-200/80 shadow-sm">
            Integrations
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Link Up With Your Favorite Tools
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            We assist startups in standing out with exceptional messaging that effectively engages their audience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {integrations.map((integration, index) => (
            <a href="#" key={index} className="group block">
              <ModernCard 
                variant="glassmorphism" 
                hover
                className="h-full flex flex-col p-6 transition-all duration-300 ease-in-out group-hover:border-primary/40 group-hover:shadow-primary/10"
              >
                <div className="flex items-start gap-4 mb-4">
                  <figure className="transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                    <span className="size-14 overflow-hidden rounded-2xl flex items-center justify-center bg-background border border-border/50 shadow-md">
                      <Image src={integration.logo} alt={`${integration.name} logo`} width={48} height={48} data-ai-hint="brand logo" />
                    </span>
                  </figure>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                      {integration.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{integration.category}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground flex-grow mb-6">
                  {integration.description}
                </p>

                <div className="mt-auto">
                    <div className={cn(
                        "inline-flex items-center gap-2 text-sm font-medium text-primary transition-all duration-300",
                        "group-hover:bg-primary/10 group-hover:px-3 group-hover:py-1.5 group-hover:rounded-full"
                    )}>
                        <span>Get Started</span>
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                </div>
              </ModernCard>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
