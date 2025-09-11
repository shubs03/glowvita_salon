
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { BrainCircuit, Bot, LineChart, Code, ArrowRight } from 'lucide-react';
import { cn } from '@repo/ui/cn';

const services = [
  {
    icon: <LineChart className="h-8 w-8" />,
    title: "Real-Time Data Analytics",
    description: "Bring your ideas to life and make informed decisions with powerful, real-time data analytics and visualization.",
    className: "lg:col-span-2",
  },
  {
    icon: <Bot className="h-8 w-8" />,
    title: "AI-Powered Applications",
    description: "Boost your workflow automation and improve efficiency.",
    className: "lg:col-span-1",
  },
  {
    icon: <BrainCircuit className="h-8 w-8" />,
    title: "End-to-End AI Consulting",
    description: "From strategy to implementation, our AI experts will help you discover your business's full potential.",
    className: "lg:col-span-1",
  },
  {
    icon: <Code className="h-8 w-8" />,
    title: "ML Model Development",
    description: "Quickly develop, train, and deploy powerful machine learning models for any use case.",
    className: "lg:col-span-2",
  },
];

const ServiceCard = ({ icon, title, description, className }: { icon: React.ReactNode, title: string, description: string, className?: string }) => (
    <div className={cn("group relative rounded-2xl bg-gradient-to-br from-background via-background to-secondary/20 p-8 shadow-lg border border-border/50 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-primary/10 overflow-hidden", className)}>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
            <div className="bg-primary/10 text-primary w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md border border-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">{description}</p>
            <a href="#" className="font-semibold text-primary inline-flex items-center group/link">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1" />
            </a>
        </div>
    </div>
);

export function Services() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-secondary/30 [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)] opacity-30"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12 md:mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            AI Services That Deliver Real Results
          </h2>
          <p className="text-lg text-muted-foreground">
            From consulting to implementation, our solutions are built to transform the way you work and drive tangible business outcomes.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {services.map((service, index) => (
                <ServiceCard key={index} {...service} />
            ))}
        </div>
      </div>
    </section>
  );
}
