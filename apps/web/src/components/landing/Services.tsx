
"use client";

import { BrainCircuit, Bot, LineChart, Code, Check, ArrowRight } from 'lucide-react';
import { cn } from '@repo/ui/cn';

const services = [
  {
    icon: <LineChart className="h-6 w-6" />,
    title: "Real-Time Data Analytics",
    description: "Unlock actionable insights from your data with our custom dashboards and visualization tools. We help you make informed decisions, faster.",
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
    description: "From initial strategy and roadmap to full-scale implementation, our experts guide you through every step of your AI transformation journey.",
    className: "lg:col-span-1",
  },
  {
    icon: <Code className="h-6 w-6" />,
    title: "ML Model Development",
    description: "Our data scientists develop, train, and deploy powerful, custom machine learning models tailored to solve your specific business challenges.",
    className: "lg:col-span-2",
  },
];

const ServiceCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="group relative rounded-xl bg-gradient-to-br from-background via-background to-secondary/20 p-6 shadow-lg border border-border/50 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-primary/10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
            <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-5 shadow-md border border-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">{title}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
        </div>
    </div>
);

export function Services() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-secondary/30 [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)] opacity-30"></div>
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                <h2 className="text-3xl lg:text-5xl font-bold font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  AI Services That Deliver Real Results
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  From strategy and consulting to custom model development and implementation, our end-to-end AI solutions are engineered to transform your operations and deliver measurable business growth.
                </p>
                <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center"><Check className="h-3.5 w-3.5 text-primary" /></div>
                        <span>Custom AI Strategy & Roadmapping</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center"><Check className="h-3.5 w-3.5 text-primary" /></div>
                        <span>Predictive Analytics & Data Science</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center"><Check className="h-3.5 w-3.5 text-primary" /></div>
                        <span>Generative AI & LLM Integration</span>
                    </li>
                </ul>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {services.map((service, index) => (
                    <ServiceCard key={index} {...service} />
                ))}
            </div>
        </div>
      </div>
    </section>
  );
}
