"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { Dialog, DialogContent } from '@repo/ui/dialog';
import { Clock, Check } from 'lucide-react';
import { Service, WeddingPackage as WeddingPackageType, StaffMember } from '@/hooks/useBookingData';

interface WeddingPackageCustomizerProps {
    weddingPackage: WeddingPackageType;
    allServices: Service[];
    allStaff?: StaffMember[];
    onPackageUpdate: (updatedPackage: WeddingPackageType, selectedServices: Service[]) => void;
    onLiveUpdate?: (services: Service[]) => void;
    onBack: () => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
}

export function Step1_WeddingPackageCustomizer({
    weddingPackage,
    allServices,
    allStaff,
    onPackageUpdate,
    onLiveUpdate,
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
            const price = parseFloat(service.price);
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

    // Calculate package discount percentage — use stored discountPercent if available for precision
    const discountPercent = weddingPackage.totalPrice && weddingPackage.discountedPrice
        ? ((weddingPackage as any).discountPercent != null
            ? (weddingPackage as any).discountPercent / 100
            : Math.round(((weddingPackage.totalPrice - weddingPackage.discountedPrice) / weddingPackage.totalPrice) * 100) / 100)
        : 0;
    const calculatedDiscountedPrice = totalPrice * (1 - discountPercent);
    const savings = totalPrice - calculatedDiscountedPrice;

    // Live update parent when services or quantities change
    useEffect(() => {
        if (onLiveUpdate) {
            const updatedServices = selectedServices.map(service => ({
                ...service,
                quantity: serviceQuantities[service.id] || 1
            }));
            onLiveUpdate(updatedServices);
        }
    }, [selectedServices, serviceQuantities, onLiveUpdate]);

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

    // Toggle service state
    const handleToggleService = (service: Service) => {
        const isSelected = selectedServices.some(s => s.id === service.id);
        if (isSelected) {
            handleRemoveService(service.id);
        } else {
            handleAddService(service);
        }
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
            discountedPrice: calculatedDiscountedPrice
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

    // Get original services to identify optional/added-on services
    const originalServiceIds = React.useMemo(() => {
        return new Set(weddingPackage.services.map(s => s.serviceId));
    }, [weddingPackage.services]);

    // Group services into categories
    const groupedServices = React.useMemo(() => {
        const makeup: Service[] = [];
        const hair: Service[] = [];
        const mehendi: Service[] = [];
        // All services NOT in the original package go to "Add more services"
        const optional: Service[] = [];

        allServices.forEach(service => {
            const inPackage = originalServiceIds.has(service.id);

            if (inPackage) {
                const cat = service.category.toLowerCase();
                const name = service.name.toLowerCase();

                if (cat.includes('makeup') || name.includes('makeup') || cat.includes('bridal') || name.includes('bridal')) {
                    makeup.push(service);
                } else if (cat.includes('hair') || name.includes('hair') || cat.includes('style') || name.includes('style')) {
                    hair.push(service);
                } else if (cat.includes('mehendi') || name.includes('mehendi') || cat.includes('henna') || name.includes('henna')) {
                    mehendi.push(service);
                } else {
                    makeup.push(service); // Default fallback
                }
            } else {
                // ALL non-package salon services go in "Add more services"
                optional.push(service);
            }
        });

        return { makeup, hair, mehendi, optional };
    }, [allServices, originalServiceIds]);

    // Format duration value
    const formatDuration = (mins: number) => {
        const hrs = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        if (hrs > 0) {
            return `${hrs}hrs ${remainingMins > 0 ? `${remainingMins}mins` : ''}`;
        }
        return `${remainingMins}mins`;
    };

    // Staff list formatted — purely dynamic, no static fallback
    const staffList = React.useMemo(() => {
        if (!weddingPackage.assignedStaff || weddingPackage.assignedStaff.length === 0) return [];

        return weddingPackage.assignedStaff.map(s => {
            if (!s) return '';

            // Case 1: s is an object with a name field
            if (typeof s === 'object') {
                if (s.name) return s.name;
                const id = s._id || (s as any).id;
                if (id) {
                    const found = allStaff?.find(staff => staff.id === id || (staff as any)._id === id);
                    if (found) return found.name;
                }
                return '';
            }

            // Case 2: s is a string — try to look it up as an ID first
            const found = allStaff?.find(staff => staff.id === s || (staff as any)._id === s);
            if (found) return found.name;

            // Filter out raw MongoDB ObjectId hex strings that weren't resolved
            if (/^[0-9a-fA-F]{24}$/.test(s)) return '';

            // Otherwise treat as a plain name string
            return s;
        }).filter(Boolean) as string[];
    }, [weddingPackage.assignedStaff, allStaff]);

    // Render a single service line item
    const renderServiceItem = (service: Service) => {
        const isChecked = selectedServices.some(s => s.id === service.id);
        return (
            <div
                key={service.id}
                onClick={() => handleToggleService(service)}
                className="flex justify-between items-center py-2 md:py-2.5 cursor-pointer select-none hover:bg-gray-50/50 px-2 rounded-md transition-colors"
            >
                <div className="flex items-center gap-3">
                    {/* Custom always-visible checkbox box — only the tick is hidden on uncheck */}
                    <div
                        className="h-4 w-4 flex-shrink-0 rounded-sm border-2 flex items-center justify-center transition-colors"
                        style={{
                            borderColor: isChecked ? '#3C2434' : '#d1d5db',
                            backgroundColor: isChecked ? '#3C2434' : 'transparent'
                        }}
                    >
                        {isChecked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-sm md:text-[15px] font-normal text-gray-800">
                        {service.name}
                    </span>
                </div>
                <span className="text-sm md:text-[15px] font-normal text-gray-600">
                    ₹ {Number(service.price).toLocaleString('en-IN')}/-
                </span>
            </div>
        );
    };

    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) onBack(); }}>
            <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl p-0 overflow-hidden bg-white border-none rounded-2xl sm:rounded-2xl shadow-2xl z-[100]">
                <div className="flex flex-col max-h-[92vh] md:max-h-[95vh] overflow-hidden">
                    {/* Header: Light blue background with service time and staff info */}
                    <div className="bg-[#EBF3FC] p-5 md:p-6 pr-16 md:pr-20 flex justify-between items-start border-b border-gray-100 flex-shrink-0">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">{weddingPackage.name}</h2>
                            <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-500 font-medium mt-1.5">
                                <Clock className="h-4 w-4 text-rose-500" />
                                <span>Service Time: {formatDuration(totalDuration)}</span>
                            </div>
                        </div>

                        {staffList.length > 0 && (
                            <div className="flex gap-3 md:gap-4 items-start text-xs md:text-sm">
                                <span className="text-gray-900 font-bold">Staff</span>
                                <ul className="text-gray-500 space-y-0.5">
                                    {staffList.map((name, index) => (
                                        <li key={index} className="flex items-center gap-1.5">
                                            <span className="w-1 h-1 bg-gray-400 rounded-full inline-block"></span>
                                            <span>{name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Scrollable service list */}
                    <div className="flex-1 overflow-y-auto px-5 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
                        {/* Bridal Makeup */}
                        {groupedServices.makeup.length > 0 && (
                            <div>
                                <h3 className="text-[15px] md:text-base font-bold text-gray-950 mb-2 md:mb-3">Bridal Makeup</h3>
                                <div className="divide-y divide-gray-50">
                                    {groupedServices.makeup.map(renderServiceItem)}
                                </div>
                            </div>
                        )}

                        {/* Hair Styling */}
                        {groupedServices.hair.length > 0 && (
                            <div>
                                <h3 className="text-[15px] md:text-base font-bold text-gray-950 mb-2 md:mb-3">Hair Styling</h3>
                                <div className="divide-y divide-gray-50">
                                    {groupedServices.hair.map(renderServiceItem)}
                                </div>
                            </div>
                        )}

                        {/* Mehendi */}
                        {groupedServices.mehendi.length > 0 && (
                            <div>
                                <h3 className="text-[15px] md:text-base font-bold text-gray-950 mb-2 md:mb-3">Mehendi</h3>
                                <div className="divide-y divide-gray-50">
                                    {groupedServices.mehendi.map(renderServiceItem)}
                                </div>
                            </div>
                        )}

                        {/* + Add more services */}
                        {groupedServices.optional.length > 0 && (
                            <div>
                                <h3 className="text-base md:text-lg font-bold text-gray-950 mb-2 md:mb-3">+ Add more services</h3>
                                <div className="divide-y divide-gray-50">
                                    {groupedServices.optional.map(renderServiceItem)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Savings Banner */}
                    {savings > 0 && (
                        <div className="bg-[#0C5412] text-white text-center py-2.5 font-semibold text-xs md:text-sm flex-shrink-0">
                            You are saving ₹ {Math.round(savings).toLocaleString('en-IN')} in this package
                        </div>
                    )}

                    {/* Footer: Price and confirm package button */}
                    <div className="p-4 md:p-6 bg-white border-t border-gray-100 flex justify-between items-center flex-shrink-0">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl md:text-2xl font-bold text-gray-900">
                                ₹ {Math.round(calculatedDiscountedPrice).toLocaleString('en-IN')}/-
                            </span>
                            {savings > 0 && (
                                <span className="text-xs md:text-sm text-gray-400 line-through">
                                    ₹ {Math.round(totalPrice).toLocaleString('en-IN')}/-
                                </span>
                            )}
                        </div>

                        <Button
                            onClick={handleConfirmCustomization}
                            disabled={selectedServices.length === 0}
                            className="bg-[#3C2434] hover:bg-[#2C1824] text-white font-semibold px-6 md:px-8 h-10 md:h-12 text-sm md:text-[15px] rounded-xl shadow-md transition-colors"
                        >
                            Confirm Package
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}