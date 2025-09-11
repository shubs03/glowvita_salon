
"use client";

import Image from 'next/image';
import { Badge } from '@repo/ui/badge';
import { ArrowRight } from 'lucide-react';

const integrations = [
  { name: 'Zapier', category: 'Communication', logo: 'https://picsum.photos/seed/zapier/48/48' },
  { name: 'Snapchat', category: 'Messaging app', logo: 'https://picsum.photos/seed/snapchat/48/48' },
  { name: 'Shopify', category: 'e-commerce', logo: 'https://picsum.photos/seed/shopify/48/48' },
  { name: 'Figma', category: 'Design tool', logo: 'https://picsum.photos/seed/figma/48/48' },
  { name: 'Slack', category: 'Communication', logo: 'https://picsum.photos/seed/slack/48/48' },
  { name: 'Tiktok', category: 'Video feed', logo: 'https://picsum.photos/seed/tiktok/48/48' },
];

export function Integrations() {
  return (
    <section className="py-20 md:py-[100px] bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="relative z-10 rounded-[25px] border border-border/50 bg-background/50 sm:py-[100px] py-[50px]">
          <div className="space-y-5 text-center sm:mb-[70px] mb-[50px]">
            <Badge variant="secondary" className="bg-green-100 text-green-700">Integrations</Badge>
            <div className="space-y-3">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Link up with your favorite tools.
              </h2>
              <p className="text-muted-foreground max-w-[582px] mx-auto">
                We assist startups in standing out with exceptional messaging that effectively engages their audience.
              </p>
            </div>
          </div>
          <div className="lg:max-w-[852px] md:max-w-[700px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:px-0 px-6">
            {integrations.map((integration, index) => (
              <a href="#" key={index} className="group">
                <div className="cursor-pointer sm:p-8 p-4 sm:rounded-2xl rounded-xl bg-background/80 flex items-center justify-between gap-4 hover:scale-[1.02] hover:shadow-xl transition-all duration-500 ease-in-out">
                  <div className="flex items-center gap-4">
                    <figure className="transition-transform duration-500 group-hover:rotate-12 group-hover:scale-[1.03%]">
                      <span className="size-14 overflow-hidden rounded-full flex items-center justify-center bg-white border">
                        <Image src={integration.logo} alt={`${integration.name} logo`} width={48} height={48} data-ai-hint="brand logo" />
                      </span>
                    </figure>
                    <div className="transform transition-transform duration-500 group-hover:translate-x-1.5">
                      <p className="text-lg font-semibold text-foreground">{integration.name}</p>
                      <p className="text-muted-foreground">{integration.category}</p>
                    </div>
                  </div>
                  <div>
                    <div className="sm:size-14 relative overflow-hidden size-10 rounded-full bg-secondary group-hover:bg-primary flex items-center justify-center transition-all duration-[600ms] ease-in-out">
                      <ArrowRight className="size-5 sm:size-6 text-foreground group-hover:text-primary-foreground transition-colors duration-700" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
