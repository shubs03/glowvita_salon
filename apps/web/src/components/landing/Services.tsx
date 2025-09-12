
"use client";

import { BrainCircuit, Bot, LineChart, Code, ArrowRight } from 'lucide-react';
import { cn } from '@repo/ui/cn';
import { ModernCard } from '@repo/ui/modern-card';

const services = [
  {
    icon: <LineChart className="h-6 w-6" />,
    title: "Real-Time Data Analytics",
    description: "Unlock actionable insights with our custom dashboards and visualization tools. We help you make informed decisions, faster.",
    className: "lg:col-span-2",
  },
  {
    icon: <Bot className="h-6 w-6" />,
    title: "AI-Powered Applications",
    description: "We build and integrate intelligent applications that automate workflows, enhance user experiences, and boost overall efficiency.",
    className: "lg:col-span-1",
  },
  {
    icon: <BrainCircuit className="h-6 w-6" />,
    title: "End-to-End AI Consulting",
    description: "From initial strategy and roadmap to full-scale implementation, our experts guide you through your AI transformation.",
    className: "lg:col-span-1",
  },
  {
    icon: <Code className="h-6 w-6" />,
    title: "ML Model Development",
    description: "Our data scientists develop, train, and deploy powerful, custom machine learning models tailored to solve your specific business challenges.",
    className: "lg:col-span-2",
  },
];

const ServiceCard = ({ icon, title, description, className }: { icon: React.ReactNode, title: string, description: string, className?: string }) => (
    <div className={cn("group", className)}>
        <ModernCard 
            variant="elevated" 
            hover 
            className="h-full flex flex-col p-6"
        >
            <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-5 shadow-md border border-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">{title}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm flex-grow">{description}</p>
            <div className="mt-6">
                <div className={cn(
                    "inline-flex items-center gap-2 text-sm font-medium text-primary transition-all duration-300",
                    "group-hover:bg-primary/10 group-hover:px-3 group-hover:py-1.5 group-hover:rounded-full"
                )}>
                    <span>Learn More</span>
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
            </div>
        </ModernCard>
    </div>
);

export function Services() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-secondary/30 [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)] opacity-30"></div>
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                AI Services That Deliver Real Results
            </h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
                From consulting to implementation, our solutions are built to transform the way you work.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
                <ServiceCard key={index} {...service} />
            ))}
        </div>
      </div>
    </section>
  );
}
