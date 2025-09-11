
"use client";

import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Card } from '@repo/ui/card';

const features = [
  {
    title: "Big data consulting",
    description: "Utilize comprehensive data security frameworks to effectively safeguard sensitive information from unauthorized access and breaches.",
    images: [
      { src: "https://picsum.photos/seed/kf1a/233/300", alt: "time increase", hint: "data chart" },
      { src: "https://picsum.photos/seed/kf1b/350/250", alt: "control card", hint: "dashboard interface" }
    ],
    trustedBy: false
  },
  {
    title: "Machine learning & AI",
    description: "Utilize advanced predictive analytics to proactively identify potential threats before they escalate by analyzing patterns and trends in data.",
    images: [
      { src: "https://picsum.photos/seed/kf2a/326/317", alt: "revenue", hint: "financial graph" },
      { src: "https://picsum.photos/seed/kf2b/255/178", alt: "balance", hint: "abstract data" }
    ],
    trustedBy: false
  },
  {
    title: "Business analysis",
    description: "Continuously monitor for vulnerabilities and implement proactive measures to prevent cyber attacks before they can occur.",
    images: [
      { src: "https://picsum.photos/seed/kf3a/350/345", alt: "earning", hint: "business meeting" },
      { src: "https://picsum.photos/seed/kf3b/286/190", alt: "daily payment", hint: "mobile payment" }
    ],
    trustedBy: true
  },
  {
    title: "Data visualization",
    description: "Utilize advanced predictive analytics to proactively identify potential threats before they escalate by analyzing patterns and trends in data.",
    images: [
      { src: "https://picsum.photos/seed/kf4a/408/300", alt: "revenue green", hint: "data visualization" },
      { src: "https://picsum.photos/seed/kf4b/225/200", alt: "currency rate", hint: "stock market chart" }
    ],
    trustedBy: false
  }
];

export function KeyFeatures() {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="bg-green-100 text-green-700 mb-4">Services</Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Enterprise-grade security & intelligence</h2>
        </div>

        <div className="space-y-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 lg:p-12 rounded-2xl border bg-background overflow-hidden">
              <div className={`grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-20`}>
                <div className={`space-y-6 ${index % 2 !== 0 ? 'lg:order-2' : ''}`}>
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  <Button>Read More</Button>
                </div>
                
                <div className={`lg:col-span-1 ${index % 2 !== 0 ? 'lg:order-1' : ''}`}>
                  {index === 0 && (
                    <div className="flex items-center gap-8">
                      <figure className="w-[233px] rounded-2xl overflow-hidden shadow-lg">
                        <Image src={feature.images[0].src} alt={feature.images[0].alt} width={233} height={300} data-ai-hint={feature.images[0].hint} className="w-full" />
                      </figure>
                      <figure className="w-[350px] rounded-2xl overflow-hidden shadow-lg mt-8">
                        <Image src={feature.images[1].src} alt={feature.images[1].alt} width={350} height={250} data-ai-hint={feature.images[1].hint} className="w-full" />
                      </figure>
                    </div>
                  )}
                   {index === 1 && (
                     <div className="flex items-center gap-8">
                        <figure className="w-[326px] h-[317px] rounded-2xl overflow-hidden shadow-lg">
                            <Image src={feature.images[0].src} alt={feature.images[0].alt} width={326} height={317} data-ai-hint={feature.images[0].hint} className="w-full h-full object-cover" />
                        </figure>
                        <figure className="w-[255px] h-[178px] rounded-2xl overflow-hidden shadow-lg">
                           <Image src={feature.images[1].src} alt={feature.images[1].alt} width={255} height={178} data-ai-hint={feature.images[1].hint} className="w-full h-full object-cover" />
                        </figure>
                    </div>
                  )}
                  {index === 2 && (
                    <div className="flex items-start gap-8">
                        <figure className="w-[350px] h-[345px] rounded-2xl overflow-hidden shadow-lg">
                           <Image src={feature.images[0].src} alt={feature.images[0].alt} width={350} height={345} data-ai-hint={feature.images[0].hint} className="w-full h-full object-cover" />
                        </figure>
                        <div className="space-y-8">
                            <figure className="w-[286px] h-[190px] rounded-2xl overflow-hidden shadow-lg">
                                <Image src={feature.images[1].src} alt={feature.images[1].alt} width={286} height={190} data-ai-hint={feature.images[1].hint} className="w-full h-full object-cover" />
                            </figure>
                            <div>
                                <div className="flex -space-x-3.5 cursor-pointer mb-4">
                                  <Image className="inline-block size-11 rounded-full ring-4 ring-background" src="https://picsum.photos/seed/avatar1/44/44" alt="Avatar 1" width={44} height={44} data-ai-hint="person" />
                                  <Image className="inline-block size-11 rounded-full ring-4 ring-background" src="https://picsum.photos/seed/avatar2/44/44" alt="Avatar 2" width={44} height={44} data-ai-hint="person" />
                                  <Image className="inline-block size-11 rounded-full ring-4 ring-background" src="https://picsum.photos/seed/avatar3/44/44" alt="Avatar 3" width={44} height={44} data-ai-hint="person" />
                                   <div className="inline-flex items-center justify-center size-11 bg-primary text-primary-foreground rounded-full ring-4 ring-background font-medium text-xs">
                                        99+
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Trusted by 20k+</p>
                                    <p className="text-sm text-muted-foreground">Customers across the globe</p>
                                </div>
                            </div>
                        </div>
                    </div>
                  )}
                  {index === 3 && (
                    <div className="flex items-start -space-x-20">
                        <figure className="w-[408px] rounded-2xl overflow-hidden shadow-lg">
                             <Image src={feature.images[0].src} alt={feature.images[0].alt} width={408} height={300} data-ai-hint={feature.images[0].hint} className="w-full h-full object-cover" />
                        </figure>
                        <figure className="w-[225px] rounded-2xl overflow-hidden shadow-lg mt-4">
                           <Image src={feature.images[1].src} alt={feature.images[1].alt} width={225} height={200} data-ai-hint={feature.images[1].hint} className="w-full h-full object-cover" />
                        </figure>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
