
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Plus, Check, Scissors } from 'lucide-react';
import { cn } from '@repo/ui/cn';
import { ChevronRight } from 'lucide-react';

const serviceCategories = [
    { name: "All" },
    { name: "Hair" },
    { name: "Skin" },
    { name: "Nails" },
    { name: "Body" },
    { name: "Massage" },
    { name: "Waxing" },
    { name: "Facials" }
];

const services = {
    "Hair": [
        { name: "Signature Haircut", duration: "60 min", price: "120.00", image: 'https://picsum.photos/seed/haircut/200/200' },
        { name: "Color & Highlights", duration: "120 min", price: "250.00", image: 'https://picsum.photos/seed/haircolor/200/200' },
        { name: "Keratin Treatment", duration: "90 min", price: "180.00", image: 'https://picsum.photos/seed/keratin/200/200' }
    ],
    "Skin": [
        { name: "GlowVita Facial", duration: "75 min", price: "150.00", image: 'https://picsum.photos/seed/facial/200/200' },
        { name: "HydraFacial", duration: "60 min", price: "180.00", image: 'https://picsum.photos/seed/hydra/200/200' }
    ],
    "Nails": [
        { name: "Classic Manicure", duration: "45 min", price: "60.00", image: 'https://picsum.photos/seed/manicure/200/200' },
        { name: "Gel Pedicure", duration: "60 min", price: "80.00", image: 'https://picsum.photos/seed/pedicure/200/200' }
    ],
    "Body": [
        { name: "Deep Tissue Massage", duration: "90 min", price: "200.00", image: 'https://picsum.photos/seed/massage/200/200' }
    ],
    "Massage": [
        { name: "Swedish Massage", duration: "60 min", price: "180.00", image: 'https://picsum.photos/seed/swedish/200/200' }
    ],
    "Waxing": [
        { name: "Full Body Wax", duration: "120 min", price: "300.00", image: 'https://picsum.photos/seed/waxing/200/200' }
    ],
    "Facials": [
        { name: "Anti-Aging Facial", duration: "75 min", price: "160.00", image: 'https://picsum.photos/seed/antiaging/200/200' }
    ]
};

const allServices = Object.values(services).flat();

const Breadcrumb = ({ currentStep, setCurrentStep }: { currentStep: number; setCurrentStep: (step: number) => void; }) => {
    const steps = ['Services', 'Select Professional', 'Time Slot'];
    return (
        <nav className="flex items-center text-sm font-medium text-muted-foreground mb-4">
            {steps.map((step, index) => (
                <React.Fragment key={step}>
                    <button
                        onClick={() => currentStep > index + 1 && setCurrentStep(index + 1)}
                        className={cn(
                            "transition-colors",
                            currentStep > index + 1 ? "hover:text-primary" : "cursor-default",
                            currentStep === index + 1 && "text-primary font-semibold"
                        )}
                    >
                        {step}
                    </button>
                    {index < steps.length - 1 && <ChevronRight className="h-4 w-4 mx-2" />}
                </React.Fragment>
            ))}
        </nav>
    );
};

export function Step1_Services({ selectedServices, onSelectService, currentStep, setCurrentStep }: { selectedServices: any[], onSelectService: (service: any) => void; currentStep: number; setCurrentStep: (step: number) => void; }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const servicesToDisplay = activeCategory === "All" ? allServices : (services[activeCategory] || []);

  return (
    <div className="w-full">
        <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} />
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <Scissors className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold font-headline">Select Your Services</h2>
            </div>
            <p className="text-muted-foreground">Choose one or more services you'd like to book.</p>
        </div>
        
        {/* Tab-like navigation for categories */}
        <div className="relative mb-8">
            <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
                {serviceCategories.map(category => (
                    <Button 
                        key={category.name}
                        variant={activeCategory === category.name ? 'default' : 'outline'}
                        className={`rounded-full px-5 py-2 h-auto text-sm transition-all duration-200 ${
                            activeCategory === category.name ? 'shadow-lg' : 'hover:bg-primary/5 hover:border-primary/50'
                        }`}
                        onClick={() => setActiveCategory(category.name)}
                    >
                        {category.name}
                    </Button>
                ))}
            </div>
            <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>

        {/* Services List */}
        <div className="space-y-4">
            {servicesToDisplay.map(service => {
                const isSelected = selectedServices.some(s => s.name === service.name);
                return (
                    <Card 
                        key={service.name} 
                        className={cn(
                            'p-4 flex flex-col sm:flex-row items-center gap-4 transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 hover:shadow-md',
                            isSelected ? 'border-primary bg-primary/5 shadow-lg' : 'border-transparent bg-secondary/30'
                        )}
                        onClick={() => onSelectService(service)}
                    >
                        <div className="relative w-full sm:w-20 h-24 sm:h-20 rounded-md overflow-hidden flex-shrink-0">
                            <Image src={service.image} alt={service.name} layout="fill" className="object-cover" data-ai-hint="beauty service" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="font-semibold">{service.name}</h3>
                            <p className="text-sm text-muted-foreground">{service.duration}</p>
                        </div>
                        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-4 text-right">
                            <span className="font-bold text-lg text-primary">₹{service.price}</span>
                            <Button 
                                size="sm"
                                variant={isSelected ? "default" : "secondary"}
                                className="w-28 shadow-sm transition-all"
                            >
                                {isSelected ? <Check className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                {isSelected ? 'Selected' : 'Add'}
                            </Button>
                        </div>
                    </Card>
                );
            })}
        </div>
    </div>
  );
}
