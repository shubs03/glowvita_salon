
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
    
    const stepLabels = ["Select Staff", "Find a Time", "Confirm Booking", "Finish"];
    const buttonText = stepLabels[currentStep - 1] || "Continue";

  return (
    <Card className="shadow-2xl shadow-primary/10 border-border/50 sticky top-24 bg-gradient-to-br from-background to-secondary/20 rounded-2xl">
      <CardHeader className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image src={salonInfo.image} alt={salonInfo.name} width={64} height={64} className="rounded-xl shadow-lg border-2 border-background" data-ai-hint="salon exterior" />
            <div className="absolute -bottom-1 -right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-background"></div>
          </div>
          <div>
            <CardTitle className="font-bold text-lg">{salonInfo.name}</CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span>{salonInfo.rating} ({salonInfo.reviews} reviews)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="h-4 w-4"/>
              <span className="text-sm">Wednesday, 28 Aug 2024</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="h-4 w-4"/>
              <span className="text-sm">11:30 AM</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
              <User className="h-4 w-4"/>
              <span className="text-sm">Kamil</span>
          </div>
        </div>
        <Separator className="bg-border/50"/>
        
        {selectedServices.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Selected Services</h4>
            {selectedServices.map((service, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex-1">
                  <p className="font-medium text-foreground line-clamp-1">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.duration}</p>
                </div>
                <p className="font-semibold text-foreground">MYR {service.price}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-center py-8 text-muted-foreground bg-secondary/30 rounded-lg">
            <Scissors className="mx-auto h-8 w-8 mb-2"/>
            <p>Your selected services will appear here.</p>
          </div>
        )}
        <Separator className="bg-border/50"/>

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
        <Separator className="bg-border/50"/>
        <div className="flex justify-between font-bold text-lg">
          <p>Total Payable</p>
          <p>MYR {total.toFixed(2)}</p>
        </div>
      </CardContent>
      <CardFooter className="p-6">
        <Button 
          className="w-full h-14 text-lg group bg-primary hover:bg-primary/90" 
          size="lg" 
          disabled={(selectedServices.length === 0 && currentStep === 1) || currentStep === 4} 
          onClick={onNextStep}
        >
            {buttonText}
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
