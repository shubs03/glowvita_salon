
"use client";

import Image from 'next/image';
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { BrainCircuit, Bot, LineChart, Code } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    icon: <LineChart className="h-6 w-6" />,
    title: "Real-time data analytics",
    description: "Bring your ideas to life and make informed decisions.",
  },
  {
    icon: <Bot className="h-6 w-6" />,
    title: "AI-powered apps",
    description: "Boost workflow automation and improve efficiency.",
  },
  {
    icon: <BrainCircuit className="h-6 w-6" />,
    title: "End-to-end AI consulting",
    description: "Discover your business's potential with our AI consulting.",
  },
  {
    icon: <Code className="h-6 w-6" />,
    title: "ML model development",
    description: "Quickly develop tools and platforms for machine learning.",
  },
];

export function Services() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-secondary/30 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)] opacity-50"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 shadow-sm">
                Our Services
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                AI Services That Deliver Real Results
              </h2>
              <p className="text-lg text-muted-foreground max-w-lg">
                From consulting to implementation, our solutions are built to transform the way you work and drive tangible business outcomes.
              </p>
            </div>
            
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="group p-4 rounded-lg hover:bg-background/80 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110">
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4">
              <Button size="lg" asChild>
                <Link href="#">
                  Talk to an Expert
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Right Column: Image */}
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 group">
             <Image
                src="https://picsum.photos/seed/services-main/800/1000"
                alt="AI services illustration"
                layout="fill"
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                data-ai-hint="futuristic abstract technology"
              />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 text-white">
                <h3 className="text-2xl font-bold">Innovate with AI</h3>
                <p className="mt-2 opacity-80">Unlock new possibilities with our cutting-edge artificial intelligence solutions.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
