
"use client";

import { Card, CardContent } from '@repo/ui/card';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Tag, Zap } from 'lucide-react';

const offers = [
  { title: "Cryo-Mist Facial", description: "Get 25% off our signature cryo-mist facial. Rejuvenate your skin cells instantly.", image: 'https://placehold.co/600x400.png', hint: 'futuristic facial treatment' },
  { title: "Zero-G Massage", description: "Experience weightlessness with our zero-gravity massage pods. Limited time offer.", image: 'https://placehold.co/600x400.png', hint: 'floating massage pod' },
  { title: "Synth-Hair Weaving", description: "Get a free consultation and 20% off on your first synth-hair weaving session.", image: 'https://placehold.co/600x400.png', hint: 'glowing hair strands' },
  { title: "Neural-Link Manicure", description: "A manicure that syncs with your neural interface for custom light patterns.", image: 'https://placehold.co/600x400.png', hint: 'glowing nails manicure' },
];

export function Offers() {
  return (
    <section className="py-20 bg-background relative">
      <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Transmission Offers</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Limited-time data-packets for exclusive services.</p>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 md:w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 md:w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
          <div 
            className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-8 px-5 no-scrollbar"
          >
            {offers.map((offer, index) => (
              <div key={index} className="snap-center shrink-0 w-80">
                <Card className="overflow-hidden group hover:shadow-2xl transition-shadow duration-500 h-full flex flex-col bg-background/50 backdrop-blur-xl border border-border/50 hover:border-primary/30">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={offer.image}
                      alt={offer.title}
                      layout="fill"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      data-ai-hint={offer.hint}
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  </div>
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-grow">{offer.description}</p>
                    <Button variant="outline" className="w-full mt-auto group/btn bg-transparent border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                      <Zap className="mr-2 h-4 w-4 group-hover/btn:text-yellow-300 transition-colors" /> Activate Offer
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
