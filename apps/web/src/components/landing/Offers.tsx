
"use client";

import { Card, CardContent } from '@repo/ui/card';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Tag, Zap } from 'lucide-react';

const offers = [
  { title: "Cryo-Mist Facial", description: "Get 25% off our signature cryo-mist facial.", image: 'https://placehold.co/600x400.png', hint: 'futuristic facial treatment' },
  { title: "Zero-G Massage", description: "Experience weightlessness with our zero-gravity massage pods.", image: 'https://placehold.co/600x400.png', hint: 'floating massage pod' },
  { title: "Synth-Hair Weaving", description: "Get 20% off on your first synth-hair weaving session.", image: 'https://placehold.co/600x400.png', hint: 'glowing hair strands' },
  { title: "Neural-Link Manicure", description: "A manicure that syncs with your neural interface.", image: 'https://placehold.co/600x400.png', hint: 'glowing nails manicure' },
  { title: "Bio-Sculpt Pedi", description: "Advanced pedicure using organic sculpting gels.", image: 'https://placehold.co/600x400.png', hint: 'futuristic pedicure' },
  { title: "Chroma-Therapy Bath", description: "Immerse yourself in a light-therapy bath.", image: 'https://placehold.co/600x400.png', hint: 'colorful bath water' },
];

export function Offers() {
  return (
    <section className="py-20 bg-background relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#7e22ce,transparent)] opacity-20 -z-10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Limited-Time Offers</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Exclusive data-packets for premium services.</p>
        </div>
        
        <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]">
            <div className="flex w-fit animate-slide hover:[animation-play-state:paused]">
                {[...offers, ...offers].map((offer, index) => (
                    <div key={index} className="flex-shrink-0 mx-3" style={{ width: '288px' }}>
                        <Card className="relative group overflow-hidden rounded-xl h-40 w-full transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 transform hover:-translate-y-1 border border-border/50">
                           <Image
                                src={offer.image}
                                alt={offer.title}
                                layout="fill"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                data-ai-hint={offer.hint}
                            />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                            
                            <div className="absolute bottom-0 left-0 right-0 p-3 transition-opacity duration-300 group-hover:opacity-0">
                                <h3 className="font-bold text-base text-white truncate">{offer.title}</h3>
                            </div>

                            <div className="absolute inset-0 p-3 bg-black/50 backdrop-blur-sm text-foreground flex flex-col justify-center items-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out">
                                <h3 className="font-bold text-lg mb-1 text-white">{offer.title}</h3>
                                <p className="text-xs text-gray-300 mb-3 h-10 line-clamp-2">{offer.description}</p>
                                <Button variant="default" size="sm" className="group/btn bg-primary/90 hover:bg-primary transition-all duration-300 text-xs">
                                    <Zap className="mr-1.5 h-3.5 w-3.5 group-hover/btn:text-yellow-300 transition-colors" /> Activate
                                </Button>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </section>
  );
}
