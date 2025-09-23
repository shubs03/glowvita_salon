
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Separator } from '@repo/ui/separator';
import Image from 'next/image';
import { ArrowRight, Tag, Info, Scissors, User, Calendar, Clock, MapPin, Star, ChevronUp, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { cn } from '@repo/ui/cn';

const salonInfo = {
  name: "Pedal Barbers",
  rating: "4.9",
  reviews: 328,
  address: "13-1, Persiaran Eserina, Shah Alam, Selangor",
  image: "https://picsum.photos/seed/pedalbarber/400/400"
};

interface BookingSummaryProps {
    selectedServices: any[];
    selectedStaff: any;
    selectedDate: Date;
    selectedTime: string | null;
    onNextStep: () => void;
    currentStep: number;
    isMobileFooter?: boolean;
}

export function BookingSummary({ 
  selectedServices, 
  selectedStaff, 
  selectedDate, 
  selectedTime, 
  onNextStep, 
  currentStep,
  isMobileFooter = false
}: BookingSummaryProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const subtotal = selectedServices.reduce((acc, service) => acc + parseFloat(service.price), 0);
    const serviceTax = subtotal * 0.06; // Example 6% tax
    const total = subtotal + serviceTax;
    
    const stepDetails = [
      { step: 1, label: 'Select Staff', enabled: selectedServices.length > 0 },
      { step: 2, label: 'Find a Time', enabled: !!selectedStaff },
      { step: 3, label: 'Confirm Booking', enabled: !!selectedTime },
      { step: 4, label: 'Finish', enabled: false }, // Final step
    ];
    
    const nextStepInfo = stepDetails.find(s => s.step === currentStep);
    const buttonLabel = currentStep === 3 ? 'Confirm Booking' : nextStepInfo?.label || 'Continue';

    if (isMobileFooter) {
        return (
            <div className={cn(
                "bg-background/80 backdrop-blur-sm border-t transition-all duration-300",
                isExpanded ? "h-96" : "h-24"
            )}>
                <div className="p-4 flex flex-col h-full">
                    {isExpanded && (
                         <div className="overflow-y-auto no-scrollbar flex-grow space-y-3 pb-4">
                            <div className="flex items-center gap-4">
                                <Image src={salonInfo.image} alt={salonInfo.name} width={48} height={48} className="rounded-lg shadow-md" data-ai-hint="salon exterior" />
                                <div>
                                    <h4 className="font-bold text-base">{salonInfo.name}</h4>
                                    <p className="text-sm text-muted-foreground">{salonInfo.address}</p>
                                </div>
                            </div>
                            <Separator />
                            {selectedServices.map(service => (
                                <div key={service.name} className="flex justify-between items-center text-sm">
                                    <span className="line-clamp-2">{service.name}</span>
                                    <span className="font-medium">₹{service.price}</span>
                                </div>
                            ))}
                            {selectedStaff && <p className="text-sm">With: <span className="font-medium">{selectedStaff.name}</span></p>}
                            {selectedTime && <p className="text-sm">On: <span className="font-medium">{format(selectedDate, 'MMM d')} at {selectedTime}</span></p>}
                         </div>
                    )}
                    <div className="flex items-center justify-between mt-auto">
                        <div>
                             <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-1">
                                <span className="text-lg font-bold">₹{total.toFixed(2)}</span>
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                            </button>
                            <p className="text-xs text-muted-foreground">Total (incl. tax)</p>
                        </div>
                        <Button 
                            className="w-40 h-12" 
                            size="lg" 
                            disabled={!nextStepInfo?.enabled} 
                            onClick={onNextStep}
                        >
                            {buttonLabel}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

  return (
    <Card className="shadow-2xl shadow-primary/10 border-border/50 bg-background rounded-2xl flex flex-col max-h-[calc(100vh-8rem)]">
      <CardHeader className="p-6 border-b flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image src={salonInfo.image} alt={salonInfo.name} width={64} height={64} className="rounded-lg shadow-md border-2 border-background" data-ai-hint="salon exterior" />
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
      <CardContent className="p-6 space-y-4 flex-grow overflow-y-auto no-scrollbar">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2"><Info className="h-4 w-4" />Your Booking Details</h4>
          
          <div className="p-3 bg-secondary/50 rounded-md">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md"><Scissors className="h-4 w-4 text-primary" /></div>
                <div>
                    <p className="text-xs text-muted-foreground">Services</p>
                    <p className="font-medium text-sm">
                        {selectedServices.length > 0 ? selectedServices.map(s => s.name).join(', ') : 'No services selected'}
                    </p>
                </div>
            </div>
          </div>
          
          <div className="p-3 bg-secondary/50 rounded-md">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md"><User className="h-4 w-4 text-primary" /></div>
                <div>
                    <p className="text-xs text-muted-foreground">Professional</p>
                    <p className="font-medium text-sm">{selectedStaff?.name || 'Any Professional'}</p>
                </div>
            </div>
          </div>
          
          <div className="p-3 bg-secondary/50 rounded-md">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md"><Calendar className="h-4 w-4 text-primary" /></div>
                <div>
                    <p className="text-xs text-muted-foreground">Date & Time</p>
                    <p className="font-medium text-sm">
                        {format(selectedDate, 'EEEE, MMM d')}
                        {selectedTime ? ` at ${selectedTime}` : ', no time selected'}
                    </p>
                </div>
            </div>
          </div>
        </div>
        
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
      <CardFooter className="p-6 flex-shrink-0">
        <Button 
          className="w-full h-12 text-base group" 
          size="lg" 
          disabled={!nextStepInfo?.enabled} 
          onClick={onNextStep}
        >
            {buttonLabel}
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
