
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Separator } from '@repo/ui/separator';
import Image from 'next/image';
import { ArrowRight, Tag, Info, Scissors, User, Calendar, Clock, MapPin, Star, CheckCircle } from 'lucide-react';

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
    currentStep: number;
}

export function BookingSummary({ selectedServices, onNextStep, currentStep }: BookingSummaryProps) {
    const subtotal = selectedServices.reduce((acc, service) => acc + parseFloat(service.price), 0);
    const serviceTax = subtotal * 0.06; // Example 6% tax
    const total = subtotal + serviceTax;
    
    const stepDetails = [
      { step: 1, label: 'Select Staff', enabled: selectedServices.length > 0 },
      { step: 2, label: 'Find a Time', enabled: true }, // Assuming staff is selected
      { step: 3, label: 'Confirm Booking', enabled: true }, // Assuming time is selected
      { step: 4, label: 'Finish', enabled: false },
    ];
    
    const nextStepInfo = stepDetails.find(s => s.step === currentStep);

  return (
    <Card className="shadow-lg border-border/50 bg-background rounded-xl">
      <CardHeader className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image src={salonInfo.image} alt={salonInfo.name} width={64} height={64} className="rounded-lg shadow-md border-2 border-background" data-ai-hint="salon exterior" />
          </div>
          <div>
            <CardTitle className="font-semibold text-lg">{salonInfo.name}</CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span>{salonInfo.rating} ({salonInfo.reviews} reviews)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {selectedServices.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Your selections</h4>
            {selectedServices.map((service, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.duration}</p>
                </div>
                <p className="font-semibold text-foreground">₹{service.price}</p>
              </div>
            ))}
          </div>
        )}
        
        <Separator className="my-4" />

        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <p className="text-muted-foreground">Subtotal</p>
                <p className="font-medium">₹{subtotal.toFixed(2)}</p>
            </div>
             <div className="flex justify-between">
                <p className="text-muted-foreground">Taxes & Fees</p>
                <p className="font-medium">₹{serviceTax.toFixed(2)}</p>
            </div>
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between font-bold text-lg">
          <p>Total</p>
          <p>₹{total.toFixed(2)}</p>
        </div>
      </CardContent>
      <CardFooter className="p-6">
        <Button 
          className="w-full h-12 text-base group" 
          size="lg" 
          disabled={!nextStepInfo?.enabled} 
          onClick={onNextStep}
        >
            {nextStepInfo?.label || "Continue"}
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
