"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Minus, Plus, Check, X, Heart, Scissors } from 'lucide-react';
import { cn } from '@repo/ui/cn';
import { Service, WeddingPackage as WeddingPackageType } from '@/hooks/useBookingData';
import { ChevronRight } from 'lucide-react';

const Breadcrumb = ({ currentStep, setCurrentStep }: { currentStep: number; setCurrentStep: (step: number) => void; }) => {
    const steps = ['Packages', 'Customize Package', 'Select Professional', 'Time Slot'];
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

interface WeddingPackageCustomizerProps {
    weddingPackage: WeddingPackageType;
    allServices: Service[];
    onPackageUpdate: (updatedPackage: WeddingPackageType, selectedServices: Service[]) => void;
    onBack: () => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
}

export function Step1_WeddingPackageCustomizer({ 
    weddingPackage, 
    allServices, 
    onPackageUpdate,
    onBack,
    currentStep,
    setCurrentStep
}: WeddingPackageCustomizerProps) {
    // Initialize selected services with package services
    const [selectedServices, setSelectedServices] = useState<Service[]>(() => {
        return weddingPackage.services.map(pkgService => {
            const service = allServices.find(s => s.id === pkgService.serviceId);
            if (service) {
                // Add quantity information to the service
                return {
                    ...service,
                    quantity: pkgService.quantity || 1
                };
            }
            return service;
        }).filter(Boolean) as Service[];
    });

    // Initialize service quantities
    const [serviceQuantities, setServiceQuantities] = useState<Record<string, number>>(() => {
        const quantities: Record<string, number> = {};
        weddingPackage.services.forEach(pkgService => {
            quantities[pkgService.serviceId] = pkgService.quantity || 1;
        });
        return quantities;
    });

    // Calculate total price based on selected services and quantities
    const calculateTotalPrice = () => {
        return selectedServices.reduce((total, service) => {
            const quantity = serviceQuantities[service.id] || 1;
            const price = service.discountedPrice !== null && service.discountedPrice !== undefined 
                ? parseFloat(service.discountedPrice) 
                : parseFloat(service.price);
            return total + (price * quantity);
        }, 0);
    };

    // Calculate total duration based on selected services and quantities
    const calculateTotalDuration = () => {
        return selectedServices.reduce((total, service) => {
            const quantity = serviceQuantities[service.id] || 1;
            // Extract minutes from duration string (e.g., "30 min" -> 30)
            const durationMatch = service.duration.match(/(\d+)\s*(min|hour|hours)/);
            let minutes = 0;
            if (durationMatch) {
                const value = parseInt(durationMatch[1]);
                const unit = durationMatch[2];
                minutes = unit === 'min' ? value : value * 60;
            }
            return total + (minutes * quantity);
        }, 0);
    };

    const totalPrice = calculateTotalPrice();
    const totalDuration = calculateTotalDuration();

    // Handle adding a service to the package
    const handleAddService = (service: Service) => {
        if (!selectedServices.some(s => s.id === service.id)) {
            setSelectedServices(prev => [...prev, { ...service, quantity: 1 }]);
            setServiceQuantities(prev => ({ ...prev, [service.id]: 1 }));
        }
    };

    // Handle removing a service from the package
    const handleRemoveService = (serviceId: string) => {
        setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
        setServiceQuantities(prev => {
            const newQuantities = { ...prev };
            delete newQuantities[serviceId];
            return newQuantities;
        });
    };

    // Handle quantity change
    const handleQuantityChange = (serviceId: string, delta: number) => {
        setServiceQuantities(prev => {
            const currentQuantity = prev[serviceId] || 1;
            const newQuantity = Math.max(1, currentQuantity + delta);
            return { ...prev, [serviceId]: newQuantity };
        });
    };

    // Handle confirm customization
    const handleConfirmCustomization = () => {
        // Create updated package with selected services
        const updatedPackage: WeddingPackageType = {
            ...weddingPackage,
            services: selectedServices.map(service => ({
                serviceId: service.id,
                serviceName: service.name,
                quantity: serviceQuantities[service.id] || 1,
                staffRequired: true // Default to true for wedding services
            })),
            totalPrice: totalPrice,
            duration: totalDuration,
            discountedPrice: weddingPackage.discountedPrice && totalPrice < weddingPackage.totalPrice 
                ? totalPrice 
                : weddingPackage.discountedPrice
        };
        
        // Create updated services array with quantity information
        const updatedServices = selectedServices.map(service => ({
            ...service,
            quantity: serviceQuantities[service.id] || 1
        }));
        
        onPackageUpdate(updatedPackage, updatedServices);
        // Move to next step after customization
        setTimeout(() => {
            setCurrentStep(3);
        }, 100);
    };

    // Group services by category for the add services section
    const servicesByCategory: Record<string, Service[]> = {};
    allServices.forEach(service => {
        if (!servicesByCategory[service.category]) {
            servicesByCategory[service.category] = [];
        }
        servicesByCategory[service.category].push(service);
    });

    const categories = Object.keys(servicesByCategory);

    return (
        <div className="w-full">
            <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} />
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                        <Heart className="h-6 w-6" />
                    </div>
                    <h2 className="text-3xl font-bold font-headline">Customize Your Wedding Package</h2>
                </div>
                <p className="text-muted-foreground">Modify your package by adding or removing services</p>
            </div>

            {/* Package Header */}
            <Card className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative w-full md:w-32 h-32 rounded-md overflow-hidden flex-shrink-0">
                        <Image 
                            src={weddingPackage.image || `https://placehold.co/200x200/png?text=${encodeURIComponent(weddingPackage.name)}`} 
                            alt={weddingPackage.name} 
                            fill 
                            className="object-cover" 
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://placehold.co/200x200/png?text=Package`;
                            }}
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-rose-800">{weddingPackage.name}</h3>
                        <p className="text-muted-foreground mt-1">{weddingPackage.description}</p>
                        <div className="flex flex-wrap gap-4 mt-3">
                            <div className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-sm font-medium">
                                {selectedServices.length} Services
                            </div>
                            <div className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-sm font-medium">
                                {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                            </div>
                            <div className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-sm font-medium">
                                ₹{totalPrice.toFixed(2)}
                            </div>
                            {weddingPackage.discountedPrice !== null && weddingPackage.discountedPrice !== undefined && (
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                    You save ₹{(weddingPackage.totalPrice - totalPrice).toFixed(2)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Selected Services */}
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Scissors className="h-5 w-5 mr-2 text-primary" />
                    Package Services
                </h3>
                {selectedServices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No services selected. Add services from below.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedServices.map((service) => {
                            const quantity = serviceQuantities[service.id] || 1;
                            // Use the enhanced service information if available
                            const isHomeService = service.homeService?.available || service.serviceHomeService?.available;
                            const isWeddingService = service.weddingService?.available || service.serviceWeddingService?.available;
                            const isAddon = service.isAddon || service.serviceIsAddon;
                            
                            return (
                                <Card key={service.id} className="p-4 flex flex-col sm:flex-row items-center gap-4 border-primary/20">
                                    <div className="relative w-full sm:w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                        <Image 
                                            src={service.image || `https://picsum.photos/seed/${service.name}/200/200.png`} 
                                            alt={service.name} 
                                            fill 
                                            className="object-cover" 
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = `https://picsum.photos/seed/${service.name}/200/200.png`;
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <h4 className="font-semibold">{service.name}</h4>
                                        <p className="text-sm text-muted-foreground">{service.duration}</p>
                                        {/* Show service type badges */}
                                        <div className="flex gap-1 mt-1 justify-center sm:justify-start">
                                            {isHomeService && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Home
                                                </span>
                                            )}
                                            {isWeddingService && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                                                    Wedding
                                                </span>
                                            )}
                                            {isAddon && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    Addon
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center border rounded-lg">
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleQuantityChange(service.id, -1)}
                                                disabled={quantity <= 1}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="px-2 text-sm font-medium">{quantity}</span>
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleQuantityChange(service.id, 1)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleRemoveService(service.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">
                                            ₹{((service.discountedPrice !== null && service.discountedPrice !== undefined 
                                                ? parseFloat(service.discountedPrice) 
                                                : parseFloat(service.price)) * quantity).toFixed(2)}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Services */}
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Add More Services</h3>
                {categories.map((category) => (
                    <div key={category} className="mb-6">
                        <h4 className="text-lg font-semibold mb-3 text-muted-foreground">{category}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {servicesByCategory[category]
                                .filter(service => !selectedServices.some(s => s.id === service.id))
                                .map((service) => {
                                    // Use the enhanced service information if available
                                    const isHomeService = service.homeService?.available || service.serviceHomeService?.available;
                                    const isWeddingService = service.weddingService?.available || service.serviceWeddingService?.available;
                                    const isAddon = service.isAddon || service.serviceIsAddon;
                                    
                                    return (
                                        <Card 
                                            key={service.id} 
                                            className="p-3 flex items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
                                            onClick={() => handleAddService(service)}
                                        >
                                            <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                                <Image 
                                                    src={service.image || `https://picsum.photos/seed/${service.name}/200/200.png`} 
                                                    alt={service.name} 
                                                    fill 
                                                    className="object-cover" 
                                                    onError={(e) => {
                                                      const target = e.target as HTMLImageElement;
                                                      target.src = `https://picsum.photos/seed/${service.name}/200/200.png`;
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-medium text-sm">{service.name}</h5>
                                                <p className="text-xs text-muted-foreground">{service.duration}</p>
                                                {/* Show service type badges */}
                                                <div className="flex gap-1 mt-1">
                                                    {isHomeService && (
                                                        <span className="inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            H
                                                        </span>
                                                    )}
                                                    {isWeddingService && (
                                                        <span className="inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                                                            W
                                                        </span>
                                                    )}
                                                    {isAddon && (
                                                        <span className="inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                            A
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold">
                                                    ₹{service.discountedPrice !== null && service.discountedPrice !== undefined 
                                                        ? service.discountedPrice 
                                                        : service.price}
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 mt-1">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </Card>
                                    );
                                })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
                <Button variant="outline" onClick={onBack}>
                    Back to Packages
                </Button>
                <Button onClick={handleConfirmCustomization} disabled={selectedServices.length === 0}>
                    Confirm Package <Check className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}