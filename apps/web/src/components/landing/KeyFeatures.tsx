
"use client";

import Image from 'next/image';
import { Badge } from '@repo/ui/badge';
import { Card, CardContent } from '@repo/ui/card';
import { Button } from '@repo/ui/button';

const features = [
  {
    title: "Big data consulting",
    description: "Utilize comprehensive data security frameworks to effectively safeguard sensitive information from unauthorized access and breaches.",
    images: [
        { src: "https://picsum.photos/seed/timeIncrease/233/300", alt: "Time Increase", hint: "data chart graph" },
        { src: "https://picsum.photos/seed/controlCard/350/200", alt: "Control Card", hint: "dashboard interface" }
    ],
    layout: "normal"
  },
  {
    title: "Machine learning & AI",
    description: "Utilize advanced predictive analytics to proactively identify potential threats before they escalate by analyzing patterns and trends in data.",
    images: [
        { src: "https://picsum.photos/seed/revenue/326/317", alt: "Revenue", hint: "financial chart" },
        { src: "https://picsum.photos/seed/balance/255/178", alt: "Balance", hint: "mobile banking app" }
    ],
    layout: "reversed"
  },
  {
    title: "Business analysis",
    description: "Continuously monitor for vulnerabilities and implement proactive measures to prevent cyber attacks before they can occur.",
    images: [
        { src: "https://picsum.photos/seed/earning/350/345", alt: "Earning", hint: "investment dashboard" },
        { src: "https://picsum.photos/seed/dailyPayment/286/190", alt: "Daily Payment", hint: "payment confirmation screen" }
    ],
    layout: "normal"
  },
   {
    title: "Data Visualization",
    description: "Utilize advanced predictive analytics to proactively identify potential threats before they escalate. by analyzing patterns and trends in data.",
    images: [
        { src: "https://picsum.photos/seed/revenueGreen/408/300", alt: "Revenue Green", hint: "green data chart" },
        { src: "https://picsum.photos/seed/currencyRate/225/200", alt: "Currency Rate", hint: "currency exchange interface" }
    ],
    layout: "reversed"
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
        
        <div className="space-y-[42px]">
          {features.map((feature, index) => (
            <div key={index} className="p-7 lg:p-[42px] rounded-[20px] border border-border/50 bg-secondary/30">
              <div className={`grid grid-cols-12 items-center xl:gap-[100px] lg:gap-20 gap-y-10`}>
                <div className={`col-span-12 lg:col-span-6 ${feature.layout === 'reversed' ? 'lg:order-2' : ''}`}>
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h3 className="text-2xl lg:text-3xl font-semibold">{feature.title}</h3>
                      <p className="max-w-[493px] w-full text-muted-foreground">{feature.description}</p>
                    </div>
                    <div>
                      <Button variant="outline">Read more</Button>
                    </div>
                  </div>
                </div>
                <div className={`col-span-12 lg:col-span-6 ${feature.layout === 'reversed' ? 'lg:order-1' : ''}`}>
                   <div className={`flex items-center gap-8 ${feature.layout === 'reversed' ? 'justify-start' : 'justify-end'}`}>
                    <figure className="max-w-[233px] w-full rounded-2xl overflow-hidden shadow-lg">
                      <Image 
                        src={feature.images[0].src} 
                        alt={feature.images[0].alt} 
                        width={233}
                        height={300}
                        data-ai-hint={feature.images[0].hint}
                        className="w-full h-full object-cover" 
                      />
                    </figure>
                    <figure className="max-w-[350px] w-full rounded-[20px] overflow-hidden shadow-lg">
                      <Image 
                        src={feature.images[1].src} 
                        alt={feature.images[1].alt} 
                        width={350}
                        height={200}
                        data-ai-hint={feature.images[1].hint}
                        className="w-full h-full object-cover" 
                      />
                    </figure>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12 sm:mt-16 md:mt-20">
          <Button size="lg">Explore all features</Button>
        </div>
      </div>
    </section>
  );
}
