"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Plus, Check, Scissors, Loader2, AlertCircle, Home, Heart, Users, X } from 'lucide-react';
import { cn } from '@repo/ui/cn';
import { ChevronRight } from 'lucide-react';
import { Service, WeddingPackage } from '@/hooks/useBookingData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/dialog';

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
    weddingPackages?: WeddingPackage[];
    onWeddingPackageSelect?: (pkg: WeddingPackage | null) => void;
    selectedWeddingPackage?: WeddingPackage | null;
    bookingMode: 'salon' | 'home';
    setBookingMode: (mode: 'salon' | 'home') => void;
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
    onServiceSelect,
    weddingPackages = [],
    onWeddingPackageSelect,
    selectedWeddingPackage,
    bookingMode,
    setBookingMode
}: Step1ServicesProps) {
    // Ensure weddingPackages is always an array and filter out nulls
    const safeWeddingPackages = Array.isArray(weddingPackages) ? weddingPackages.filter(Boolean) : [];
    
    // Additional check to ensure we have valid wedding packages
    // Relaxed validation: Allow packages that have EITHER id OR _id, and a name
    const validWeddingPackages = safeWeddingPackages.filter(pkg => 
      (pkg.id || pkg._id) && pkg.name
    );
    const [activeCategory, setActiveCategory] = useState("All");
    // Removed: showHomeServiceModal, selectedHomeService state - no longer needed with strictly enforced mode
    // Replaced: internal bookingMode with prop
    // const [bookingMode, setBookingMode] = useState<'salon' | 'home'>('salon');
    
    // Use provided categories or fallback to default
    const displayCategories = categories?.length > 0 ? categories : defaultCategories;
  
  // Calculate services to display based on category
  const servicesToDisplay = activeCategory === "All" 
    ? (services || [])
    : (servicesByCategory[activeCategory] || []);
  
  // Use valid wedding packages
  const displayWeddingPackages = validWeddingPackages;
  
  // Debug logging
  console.log('Step1_Services - displayWeddingPackages:', displayWeddingPackages);
  // ... logging continues ...

  // Handle service selection
  const handleSelectService = (service: Service) => {
    
    // Check if service is available for home or wedding (support both formats)
    const isHomeService = service.homeService?.available || service.serviceHomeService?.available;
    const isWeddingService = service.weddingService?.available || service.serviceWeddingService?.available;
    
    // Check if service is already selected
    const isSelected = selectedServices.some(s => s.id === service.id);
    
    // ENFORCED MODE LOGIC
    if (bookingMode === 'home') {
      // If in Home Mode, can ONLY select home-available services
      if (!isHomeService) {
        // Show warning/toast and prevent selection
        // Since we don't have toast imported here, we could use an alert or just return
        // Ideally we should disable these buttons in UI, but as a safety check:
        console.warn("Cannot select salon-only service in Home booking mode");
        return;
      }
      
      // Auto-assign 'home' option
      const serviceWithOption = {
        ...service,
        selectedServiceOption: 'home' as const
      };
      
      onSelectService(serviceWithOption);
      
    } else {
      // Salon Mode (Default)
      // Auto-assign 'salon' option
      const serviceWithOption = {
        ...service,
        selectedServiceOption: 'salon' as const
      };
      
      onSelectService(serviceWithOption);
    }
  };

  // Removed: handleHomeServiceOptionSelect, handleModalCancel - no longer needed
  
  // Handle wedding package selection
  const handleSelectWeddingPackage = (pkg: WeddingPackage) => {
    // ... same logic for packages ...
    const isCurrentlySelected = selectedWeddingPackage?.id === (pkg.id || pkg._id);
    
    if (onWeddingPackageSelect) {
      if (isCurrentlySelected) {
        onWeddingPackageSelect(null); 
      } else {
        onWeddingPackageSelect(pkg); 
      }
      // No auto-nav
    }
  };

  console.log("wedding Packages", weddingPackages)
  console.log("wedding Packages length", weddingPackages?.length)
  console.log("wedding Packages type", typeof weddingPackages)
  console.log("wedding Packages is array", Array.isArray(weddingPackages))
  
  // Log when component renders
  console.log('Step1_Services - Component rendered with weddingPackages:', weddingPackages);
  console.log('Step1_Services - weddingPackages type:', typeof weddingPackages);
  console.log('Step1_Services - weddingPackages is array:', Array.isArray(weddingPackages));
  console.log('Step1_Services - weddingPackages content:', weddingPackages);
  console.log('Step1_Services - safeWeddingPackages:', safeWeddingPackages);
  console.log('Step1_Services - safeWeddingPackages length:', safeWeddingPackages?.length);
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

  // No services or packages available
  console.log('Step1_Services - Checking if no services or packages available:', { 
    servicesLength: services?.length, 
    weddingPackagesLength: safeWeddingPackages?.length,
    servicesEmpty: !services || services.length === 0,
    weddingPackagesEmpty: !safeWeddingPackages || safeWeddingPackages.length === 0
  });
  
  // Show available services or packages
  const hasServices = services && services.length > 0;
  const hasWeddingPackages = validWeddingPackages && validWeddingPackages.length > 0;
  
  console.log('Step1_Services - hasServices:', hasServices);
  console.log('Step1_Services - hasWeddingPackages:', hasWeddingPackages);
  console.log('Step1_Services - services:', services);
  console.log('Step1_Services - services length:', services?.length);
  console.log('Step1_Services - services type:', typeof services);
  console.log('Step1_Services - services is array:', Array.isArray(services));
  
  // Log the final condition
  const showNoServicesMessage = !hasServices && !hasWeddingPackages;
  console.log('Step1_Services - showNoServicesMessage:', showNoServicesMessage);
  console.log('Step1_Services - Condition breakdown:', { 
    notHasServices: !hasServices, 
    notHasWeddingPackages: !hasWeddingPackages,
    andResult: !hasServices && !hasWeddingPackages
  });
  
  if (!hasServices && !hasWeddingPackages) {
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
            <p className="text-muted-foreground">No services or wedding packages available at this salon.</p>
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


        {/* Booking Mode Switcher - Essential UX Element */}
        <div className="mb-6 bg-secondary/20 p-4 rounded-xl border border-border">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
             <div className="mb-2 sm:mb-0">
               <h3 className="font-bold text-lg flex items-center gap-2">
                 <span className="bg-primary/20 p-1.5 rounded-full"><Scissors className="w-4 h-4 text-primary"/></span>
                 How would you like to book?
               </h3>
               <p className="text-sm text-muted-foreground mt-1">Select your preferred service location type</p>
             </div>
             
             <div className="bg-background rounded-lg p-1 flex gap-1 border shadow-sm w-full sm:w-auto">
               <button
                 onClick={() => {
                    // Start fresh if switching modes? Or keep compatible services?
                    // For safety, let's keep it simple: switching mode is allowed, 
                    // incompatible services will need to be deselected manually or we can filter them out.
                    // For now, simple state switch.
                    setBookingMode('salon');
                 }}
                 className={cn(
                   "flex-1 sm:flex-none px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2",
                   bookingMode === 'salon' 
                     ? "bg-primary text-primary-foreground shadow-sm" 
                     : "text-muted-foreground hover:bg-secondary/50"
                 )}
               >
                 <Scissors className="w-4 h-4" />
                 Visit Salon
               </button>
               <button
                 onClick={() => setBookingMode('home')}
                 className={cn(
                   "flex-1 sm:flex-none px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2",
                   bookingMode === 'home'
                     ? "bg-primary text-primary-foreground shadow-sm"
                     : "text-muted-foreground hover:bg-secondary/50"
                 )}
               >
                 <Home className="w-4 h-4" />
                 Home Service
               </button>
             </div>
          </div>
          
          {bookingMode === 'home' && (
             <div className="mt-3 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-100 flex items-start gap-2">
               <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
               <span>You are browsing services available for <strong>Home Visit</strong>. Salon-only services are disabled.</span>
             </div>
          )}
        </div>


        {/* Wedding Packages Section - Always show when packages exist */}
        {(displayWeddingPackages && displayWeddingPackages.length > 0) && (
          <div>
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-rose-500" />
                Wedding Packages
              </h3>
              <p className="text-muted-foreground mb-4">
                Choose from our specially curated wedding packages or customize your own
              </p>
              {displayWeddingPackages && displayWeddingPackages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayWeddingPackages.map((pkg, index) => {
                    console.log(`Step1_Services - Rendering wedding package ${index}:`, pkg);
                    console.log(`Step1_Services - Package ${index} keys:`, Object.keys(pkg));
                    console.log(`Step1_Services - Package ${index} services:`, pkg.services);
                    console.log(`Step1_Services - Package ${index} services length:`, pkg.services?.length);
                    
                    // Check if package has valid data
                    const hasId = pkg && (pkg.id || pkg._id);
                    const hasName = pkg && pkg.name;
                    const isValidPackage = hasId && hasName;
                    console.log(`Step1_Services - Package ${index} isValid:`, isValidPackage);
                    console.log(`Step1_Services - Package ${index} hasId:`, hasId);
                    console.log(`Step1_Services - Package ${index} hasName:`, hasName);
                    console.log(`Step1_Services - Package ${index} id:`, pkg.id);
                    console.log(`Step1_Services - Package ${index} _id:`, pkg._id);
                    console.log(`Step1_Services - Package ${index} name:`, pkg.name);
                    
                    if (!isValidPackage) {
                      console.log(`Step1_Services - Skipping invalid package ${index}`);
                      return null;
                    }
                    
                    return (
                      <Card 
                        key={pkg.id || pkg._id}
                        className={cn(
                          'p-4 cursor-pointer border-2 transition-all duration-300 hover:shadow-md',
                          selectedWeddingPackage?.id === (pkg.id || pkg._id) ? 'border-primary bg-primary/5 shadow-lg' : 'border-transparent bg-secondary/30'
                        )}
                        onClick={() => handleSelectWeddingPackage(pkg)}
                      >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                          <Image 
                            src={pkg.image || `https://placehold.co/200x200/png?text=Package`} 
                            alt={pkg.name} 
                            fill 
                            className="object-cover" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://placehold.co/200x200/png?text=Package`;
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{pkg.name}</h4>
                          <p className="text-sm text-muted-foreground">{pkg.services?.length || 0} services</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{pkg.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {pkg.services?.slice(0, 3).map((service, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                            {service.serviceName}
                          </span>
                        ))}
                        {pkg.services?.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                            +{pkg.services.length - 3} more
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-right">
                          {pkg.discountedPrice !== null && pkg.discountedPrice !== undefined && pkg.discountedPrice !== pkg.totalPrice ? (
                            <>
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-muted-foreground line-through text-sm">
                                  ₹{pkg.totalPrice}
                                </span>
                                <span className="font-bold text-lg text-primary">
                                  ₹{pkg.discountedPrice}
                                </span>
                              </div>
                              <div className="text-xs text-green-600 font-medium">
                                {Math.round(((pkg.totalPrice - pkg.discountedPrice) / pkg.totalPrice) * 100)}% OFF
                              </div>
                            </>
                          ) : (
                            <span className="font-bold text-lg text-primary">
                              ₹{pkg.totalPrice}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            variant={selectedWeddingPackage?.id === (pkg.id || pkg._id) ? "default" : "secondary"}
                            className="shadow-sm transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectWeddingPackage(pkg);
                            }}
                          >
                            {selectedWeddingPackage?.id === (pkg.id || pkg._id) ? (
                              <>
                                <X className="h-4 w-4 mr-2" />
                                Deselect
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Select
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-rose-200 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No wedding packages available at this time.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Services List */}
        <div className="space-y-4 pt-4">
            {servicesToDisplay.map((service: Service) => {
                const isSelected = selectedServices.some(s => s.id === service.id);
                // Check if service is available for home or wedding (support both formats)
                const isHomeService = service.homeService?.available || service.serviceHomeService?.available;
                const isWeddingService = service.weddingService?.available || service.serviceWeddingService?.available;
                
                // UX: Calculate if disabled based on mode
                // Disabled if: Mode is HOME AND Not available at home
                const isDisabled = bookingMode === 'home' && !isHomeService;

                return (
                    <Card 
                        key={service.id} 
                        className={cn(
                            'p-4 flex flex-col sm:flex-row items-center gap-4 transition-all duration-300 border-2',
                            isDisabled ? 'opacity-50 grayscale cursor-not-allowed bg-muted' : 'cursor-pointer hover:border-primary/50 hover:shadow-md',
                            isSelected ? 'border-primary bg-primary/5 shadow-lg' : 'border-transparent bg-secondary/30'
                        )}
                        onClick={() => !isDisabled && handleSelectService(service)}
                    >
                        {/* Image Section */}
                        <div className="relative w-full sm:w-20 h-24 sm:h-20 rounded-md overflow-hidden flex-shrink-0">
                          <Image 
                            src={service.image || `https://picsum.photos/seed/${service.name}/200/200.png`} 
                            alt={service.name} 
                            fill
                            className="object-cover" 
                            data-ai-hint="beauty service" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://picsum.photos/seed/${service.name}/200/200.png`;
                            }}
                          />
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="font-semibold">{service.name}</h3>
                            <p className="text-sm text-muted-foreground">{service.duration}</p>
                            
                            {/* Visual cue for why it's disabled */}
                            {isDisabled && (
                                <p className="text-xs text-destructive font-medium mt-1 flex items-center justify-center sm:justify-start gap-1">
                                    <AlertCircle className="w-3 h-3" /> Salon Only
                                </p>
                            )}

                            {/* Show service type badges */}
                            <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                              {isHomeService && (
                                <span className={cn(
                                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                    isDisabled ? "bg-muted text-muted-foreground" : "bg-blue-100 text-blue-800"
                                )}>
                                  <Home className="h-3 w-3 mr-1" />
                                  Home Service
                                </span>
                              )}
                              {isWeddingService && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                                  <Heart className="h-3 w-3 mr-1" />
                                  Wedding Service
                                </span>
                              )}
                              {service.isAddon && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Addon
                                </span>
                              )}
                            </div>
                        </div>
                        
                        {/* Price & Action Button */}
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
                                disabled={isDisabled}
                                className={cn("w-28 shadow-sm transition-all", isDisabled && "opacity-50")}
                            >
                                {isSelected ? (
                                    <><Check className="h-4 w-4 mr-2" /> Selected</>
                                ) : (
                                    <><Plus className="h-4 w-4 mr-2" /> Add</>
                                )}
                            </Button>
                        </div>

                    </Card>
                );
            })}
        </div>

        {/* Home Service Selection Modal */}
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