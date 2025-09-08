
"use client";

import { Card, CardContent } from '@repo/ui/card';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Tag } from 'lucide-react';

const offers = [
  { title: "First Visit Discount", description: "Get 25% off your first service with us. A warm welcome to our salon family!", image: 'https://placehold.co/600x400.png', hint: 'discount offer' },
  { title: "Weekday Happy Hour", description: "Book between 11 AM and 3 PM on weekdays and get 15% off any service.", image: 'https://placehold.co/600x400.png', hint: 'salon clock' },
  { title: "Student Special", description: "Students get a flat 20% discount on all services. Just show your valid student ID!", image: 'https://placehold.co/600x400.png', hint: 'happy students' },
  { title: "Refer a Friend", description: "Bring a friend and you both get 30% off your services. Sharing is caring!", image: 'https://placehold.co/600x400.png', hint: 'friends smiling' },
];

export function Offers() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Special Offers</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Take advantage of our exclusive deals and promotions to enjoy our services for less.</p>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 md:w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 md:w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
          <div 
            className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-8 px-5"
            style={{ scrollbarWidth: "none" }}
          >
            {offers.map((offer, index) => (
              <div key={index} className="snap-center shrink-0 w-80">
                <Card className="overflow-hidden group hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={offer.image}
                      alt={offer.title}
                      layout="fill"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      data-ai-hint={offer.hint}
                    />
                  </div>
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold mb-2">{offer.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-grow">{offer.description}</p>
                    <Button variant="outline" className="w-full mt-auto group/btn">
                      <Tag className="mr-2 h-4 w-4 group-hover/btn:text-primary transition-colors" /> Claim Offer
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
