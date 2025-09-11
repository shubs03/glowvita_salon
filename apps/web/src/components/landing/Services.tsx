
"use client";

import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { BrainCircuit, Bot, LineChart, Code } from 'lucide-react';

const services = [
  {
    icon: <LineChart className="h-12 w-12 text-secondary dark:text-accent" />,
    title: "Real-time data analytics and visualization.",
    description: "Speed up your journey with real-time data analytics to bring your ideas to life and make informed decisions.",
    colSpan: "lg:col-span-7",
  },
  {
    icon: <Bot className="h-12 w-12 text-secondary dark:text-accent" />,
    title: "AI-powered apps.",
    description: "Use AI applications to boost workflow automation and improve efficiency.",
    colSpan: "lg:col-span-5",
  },
  {
    icon: <BrainCircuit className="h-12 w-12 text-secondary dark:text-accent" />,
    title: "End-to-end AI consulting.",
    description: "Discover your business's potential with our AI consulting services.",
    colSpan: "lg:col-span-5",
  },
  {
    icon: <Code className="h-12 w-12 text-secondary dark:text-accent" />,
    title: "Machine learning model development.",
    description: "Quickly develop tools, platforms, and educational applications for machine learning model creation.",
    colSpan: "lg:col-span-7",
  },
];

export function Services() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-cover bg-top bg-no-repeat" style={{ backgroundImage: "url('/images/home-page-18/hero-bg.png')" }}>
      <div className="container mx-auto px-4">
        <div className="text-center space-y-5 max-w-3xl mx-auto mb-14">
          <Badge variant="secondary" className="bg-green-100 text-green-700">Services</Badge>
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">
              AI services that deliver real results.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From consulting to implementation, our solutions are built to transform the way you work.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-8 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <div key={index} className={`col-span-12 md:col-span-6 ${service.colSpan}`}>
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 space-y-6 h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-full">
                  {service.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{service.title}</h3>
                  <p className="text-muted-foreground max-w-md">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-center mt-14">
          <Button size="lg" variant="secondary">
            Talk to an expert
          </Button>
        </div>
      </div>
    </section>
  );
}
