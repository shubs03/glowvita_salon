
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Separator } from '@repo/ui/separator';
import Image from 'next/image';

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Image src={salonInfo.image} alt={salonInfo.name} width={64} height={64} className="rounded-lg" data-ai-hint="salon exterior" />
        <div>
          <CardTitle>{salonInfo.name}</CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>⭐</span>
            <span>{salonInfo.rating} ({salonInfo.reviews} reviews)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedServices.length > 0 ? (
          <div className="space-y-2">
            {selectedServices.map((service, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.duration}</p>
                </div>
                <p className="font-medium">MYR {service.price}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Your selected services will appear here.
          </p>
        )}
        <Separator />
        <div className="flex justify-between font-semibold">
          <p>Total</p>
          <p>MYR {subtotal.toFixed(2)}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled={selectedServices.length === 0} onClick={onNextStep}>Continue</Button>
      </CardFooter>
    </Card>
  );
}
