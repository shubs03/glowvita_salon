"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Plus, Check, Scissors, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@repo/ui/cn';
import { ChevronRight } from 'lucide-react';
import { Service } from '@/hooks/useBookingData';

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

interface Step1ServicesProps {
    selectedServices: Service[];
    onSelectService: (service: Service) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    services: Service[];
    servicesByCategory: { [key: string]: Service[] };
    categories: { name: string }[];
    isLoading: boolean;
    error?: any;
    onServiceSelect?: (service: Service) => void;
}

export function Step1_Services({ 
    selectedServices, 
    onSelectService, 
    currentStep, 
    setCurrentStep,
    services,
    servicesByCategory,
    categories,
    isLoading,
    error,
    onServiceSelect
}: Step1ServicesProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  // Use provided categories or fallback to default
  const displayCategories = categories?.length > 0 ? categories : defaultCategories;
  
  // Calculate services to display based on category
  const servicesToDisplay = activeCategory === "All" 
    ? (services || [])
    : (servicesByCategory[activeCategory] || []);

  // Handle service selection
  const handleSelectService = (service: Service) => {
    console.log('Step1_Services - Service selected:', service);
    onSelectService(service);
    // Call the callback if provided
    if (onServiceSelect) {
      console.log('Step1_Services - Calling onServiceSelect callback with:', service);
      onServiceSelect(service);
    }
  };

  // Loading state
  if (isLoading) {
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
        
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
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
        
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-muted-foreground">Unable to load services. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  // No services available
  if (!services || services.length === 0) {
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
        
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Scissors className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No services available at this salon.</p>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="sticky top-0 z-10 py-4 bg-background/80 backdrop-blur-sm -mx-6 px-6">
            <div className="relative">
                <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
                    {displayCategories.map((category: { name: string }) => (
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
                <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            </div>
        </div>


        {/* Services List */}
        <div className="space-y-4 pt-4">
            {servicesToDisplay.map((service: Service) => {
                const isSelected = selectedServices.some(s => s.id === service.id);
                return (
                    <Card 
                        key={service.id} 
                        className={cn(
                            'p-4 flex flex-col sm:flex-row items-center gap-4 transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 hover:shadow-md',
                            isSelected ? 'border-primary bg-primary/5 shadow-lg' : 'border-transparent bg-secondary/30'
                        )}
                        onClick={() => handleSelectService(service)}
                    >
                        <div className="relative w-full sm:w-20 h-24 sm:h-20 rounded-md overflow-hidden flex-shrink-0">
                            <Image 
                                src={service.image || `https://picsum.photos/seed/${service.name}/200/200`} 
                                alt={service.name} 
                                layout="fill" 
                                className="object-cover" 
                                data-ai-hint="beauty service" 
                            />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="font-semibold">{service.name}</h3>
                            <p className="text-sm text-muted-foreground">{service.duration}</p>
                            {service.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                            )}
                        </div>
                        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-4 text-right">
                            <div className="text-right">
                                {service.discountedPrice !== null && service.discountedPrice !== undefined && service.discountedPrice !== service.price ? (
                                    <>
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-muted-foreground line-through text-sm">
                                                ₹{service.price}
                                            </span>
                                            <span className="font-bold text-lg text-primary">
                                                ₹{service.discountedPrice}
                                            </span>
                                        </div>
                                        <div className="text-xs text-green-600 font-medium">
                                          {Math.round(((parseFloat(service.price || '0') - parseFloat(service.discountedPrice || '0')) / parseFloat(service.price || '1')) * 100)}% OFF
                                        </div>
                                    </>
                                ) : (
                                    <span className="font-bold text-lg text-primary">
                                        ₹{service.price}
                                    </span>
                                )}
                            </div>
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

// Default categories as fallback
const defaultCategories = [
    { name: "All" },
    { name: "Hair" },
    { name: "Skin" },
    { name: "Nails" },
    { name: "Body" },
    { name: "Massage" },
    { name: "Waxing" },
    { name: "Facials" }
];