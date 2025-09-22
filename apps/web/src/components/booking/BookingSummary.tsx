
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Separator } from '@repo/ui/separator';
import Image from 'next/image';
import { ArrowRight, Tag } from 'lucide-react';

const salonInfo = {
  name: "Pedal Barbers",
  rating: "4.9",
  reviews: 328,
  address: "13-1, Persiaran Eserina, Shah Alam, Selangor",
  image: "https://picsum.photos/seed/pedalbarber/400/400"
};

interface BookingSummaryProps {
    selectedServices: any[];
    onNextStep: () => void;
}

export function BookingSummary({ selectedServices, onNextStep }: BookingSummaryProps) {
    const subtotal = selectedServices.reduce((acc, service) => acc + parseFloat(service.price), 0);
    const serviceTax = subtotal * 0.06; // Example 6% tax
    const total = subtotal + serviceTax;

  return (
    <Card className="shadow-lg border-border/50 sticky top-24">
      <CardHeader className="flex flex-row items-center gap-4">
        <Image src={salonInfo.image} alt={salonInfo.name} width={64} height={64} className="rounded-lg shadow-md" data-ai-hint="salon exterior" />
        <div>
          <CardTitle className="font-bold">{salonInfo.name}</CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <span className="text-yellow-400">⭐</span>
            <span>{salonInfo.rating} ({salonInfo.reviews} reviews)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="font-semibold text-lg">Your Booking</h3>
        {selectedServices.length > 0 ? (
          <div className="space-y-3">
            {selectedServices.map((service, index) => (
              <div key={index} className="flex justify-between items-center text-sm p-3 rounded-md bg-secondary/50">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.duration}</p>
                </div>
                <p className="font-semibold">MYR {service.price}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8 bg-secondary/30 rounded-md">
            Select services to see your booking summary.
          </p>
        )}
        <Separator />
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <p className="text-muted-foreground">Subtotal</p>
                <p>MYR {subtotal.toFixed(2)}</p>
            </div>
             <div className="flex justify-between">
                <p className="text-muted-foreground">Service Tax (6%)</p>
                <p>MYR {serviceTax.toFixed(2)}</p>
            </div>
             <div className="flex justify-between items-center text-green-600">
                <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    <p className="font-semibold">Discount Applied</p>
                </div>
                <p className="font-semibold">-MYR 0.00</p>
            </div>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <p>Total</p>
          <p>MYR {total.toFixed(2)}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full h-12 text-base group" size="lg" disabled={selectedServices.length === 0} onClick={onNextStep}>
            Continue
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
