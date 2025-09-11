"use client";

import Image from 'next/image';
import { Badge } from '@repo/ui/badge';
import { Card, CardContent } from '@repo/ui/card';
import { Button } from '@repo/ui/button';

const features = [
  {
    title: "Web Security",
    description: "Safeguard websites from cyber threats, malware, and unauthorized access.",
    image: "https://picsum.photos/seed/websec/402/300",
    hint: "server security"
  },
  {
    title: "Software Analytics",
    description: "Ensure your applications and systems are always up-to-date and secure.",
    image: "https://picsum.photos/seed/softan/402/300",
    hint: "data analytics chart"
  },
  {
    title: "Payment Security",
    description: "End-to-end encryption and fraud prevention for online transactions.",
    image: "https://picsum.photos/seed/paysec/402/300",
    hint: "secure payment"
  }
];

export function KeyFeatures() {
  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-5 mb-12 md:mb-16">
          <Badge variant="secondary" className="bg-primary/10 text-primary">More features</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold font-headline">Managing your money has never been easier</h2>
        </div>
        <div className="mb-12 sm:mb-16 md:mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index}>
                <div className="space-y-4">
                  <div className="border border-border/50 bg-secondary/30 p-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <figure className="w-full aspect-[4/3] rounded-lg overflow-hidden">
                      <Image 
                        src={feature.image} 
                        alt={feature.title} 
                        width={402}
                        height={300}
                        data-ai-hint={feature.hint}
                        className="w-full h-full object-cover" 
                      />
                    </figure>
                  </div>
                  <div className="space-y-1 pl-2.5">
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center">
          <Button size="lg">Explore all features</Button>
        </div>
      </div>
    </section>
  );
}
