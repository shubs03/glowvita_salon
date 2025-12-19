"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Plus, Check, Scissors, Loader2, AlertCircle, Home, Heart, Users, X, Clock, List, User } from 'lucide-react';
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
    const [viewMode, setViewMode] = useState<'services' | 'packages'>('services');
    const [selectedPackageForDetails, setSelectedPackageForDetails] = useState<WeddingPackage | null>(null);
    const [packageToConfirm, setPackageToConfirm] = useState<WeddingPackage | null>(null);
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
  
  // Handle wedding package selection with confirmation
  const handleSelectWeddingPackage = (pkg: WeddingPackage | null) => {
    const isCurrentlySelected = selectedWeddingPackage?.id === (pkg?.id || pkg?._id);
    
    if (onWeddingPackageSelect) {
      if (isCurrentlySelected || pkg === null) {
        // Deselect without confirmation
        onWeddingPackageSelect(null); 
      } else {
        // Show confirmation dialog before selecting
        setPackageToConfirm(pkg);
      }
    }
  };
  
  // Confirm package selection
  const confirmPackageSelection = () => {
    if (packageToConfirm && onWeddingPackageSelect) {
      onWeddingPackageSelect(packageToConfirm);
    }
    setPackageToConfirm(null);
  };
  
  // Check availability before any returns
  const hasServices = services && services.length > 0;
  const hasWeddingPackages = validWeddingPackages && validWeddingPackages.length > 0;
  
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

  // No services or packages available - check after loading/error states
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
                    {viewMode === 'services' ? <Scissors className="h-6 w-6" /> : <Heart className="h-6 w-6 text-rose-600" />}
                </div>
                <h2 className="text-3xl font-bold font-headline">
                  {viewMode === 'services' ? 'Select Your Services' : 'Choose Wedding Package'}
                </h2>
            </div>
            <p className="text-muted-foreground">
              {viewMode === 'services' 
                ? 'Choose one or more services you\'d like to book.' 
                : 'Select from our specially curated wedding packages'}
            </p>
        </div>
        
        {/* View Mode Tabs */}
        {hasWeddingPackages && (
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg w-fit">
            <button
              onClick={() => setViewMode('services')}
              className={cn(
                "px-6 py-3 rounded-md font-medium transition-all flex items-center gap-2",
                viewMode === 'services'
                  ? "bg-white shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Scissors className="h-4 w-4" />
              Individual Services
            </button>
            <button
              onClick={() => setViewMode('packages')}
              className={cn(
                "px-6 py-3 rounded-md font-medium transition-all flex items-center gap-2",
                viewMode === 'packages'
                  ? "bg-white shadow-sm text-rose-600"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Heart className="h-4 w-4" />
              Wedding Packages
              {displayWeddingPackages.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-xs font-semibold">
                  {displayWeddingPackages.length}
                </span>
              )}
            </button>
          </div>
        )}
        
        {/* Services View */}
        {viewMode === 'services' && (
          <>
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
        </>
        )}

        {/* Wedding Packages View */}
        {viewMode === 'packages' && (displayWeddingPackages && displayWeddingPackages.length > 0) && (
          <div className="pb-6">
              {displayWeddingPackages && displayWeddingPackages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-5">
                  {displayWeddingPackages.map((pkg, index) => {
                    const hasId = pkg && (pkg.id || pkg._id);
                    const hasName = pkg && pkg.name;
                    const isValidPackage = hasId && hasName;
                    
                    if (!isValidPackage) return null;
                    
                    const isSelected = selectedWeddingPackage?.id === (pkg.id || pkg._id);
                    const discount = pkg.discountedPrice && pkg.discountedPrice !== pkg.totalPrice 
                      ? Math.round(((pkg.totalPrice - pkg.discountedPrice) / pkg.totalPrice) * 100) 
                      : 0;
                    
                    return (
                      <Card 
                        key={pkg.id || pkg._id}
                        className={cn(
                          'overflow-hidden transition-all duration-500 hover:-translate-y-1 cursor-pointer group relative',
                          'bg-gradient-to-br from-white via-white to-rose-50/30',
                          isSelected
                            ? 'ring-2 ring-rose-500 shadow-2xl shadow-rose-200/50 scale-[1.01]' 
                            : 'shadow-md hover:shadow-xl border border-gray-100'
                        )}
                      >
                        {/* Discount Badge */}
                        {discount > 0 && (
                          <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                            {discount}% OFF
                          </div>
                        )}
                        
                        {/* Selected Badge */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 z-10 bg-rose-600 text-white rounded-full p-1.5 shadow-xl animate-in zoom-in duration-300">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                        
                        {/* Image Header */}
                        <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-rose-100 to-pink-100">
                          <Image 
                            src={pkg.image || `https://picsum.photos/seed/${pkg.name}/800/600`} 
                            alt={pkg.name} 
                            fill 
                            className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://picsum.photos/seed/${pkg.name}/800/600`;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          
                          {/* Title Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                            <h4 className="font-bold text-lg sm:text-xl text-white mb-1.5 drop-shadow-2xl line-clamp-2">
                              {pkg.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-white/95 text-gray-800 backdrop-blur-md shadow-lg">
                                <List className="h-3 w-3 mr-1" />
                                {pkg.services?.length || 0} Services
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-white/95 text-gray-800 backdrop-blur-md shadow-lg">
                                <Clock className="h-3 w-3 mr-1" />
                                {pkg.duration || 0}m
                              </span>
                              {pkg.staffCount && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-white/95 text-gray-800 backdrop-blur-md shadow-lg">
                                  <Users className="h-3 w-3 mr-1" />
                                  {pkg.staffCount} Staff
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Content Section */}
                        <div className="p-4 space-y-3">
                          {/* Description */}
                          {pkg.description && (
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">{pkg.description}</p>
                          )}
                          
                          {/* Services Preview */}
                          {pkg.services && pkg.services.length > 0 && (
                            <div className="space-y-1.5">
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">What's Included</p>
                              <div className="flex flex-wrap gap-1.5">
                                {pkg.services.slice(0, 3).map((service, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border border-rose-200/50 shadow-sm">
                                    {service.serviceName}
                                  </span>
                                ))}
                                {pkg.services.length > 3 && (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 shadow-sm">
                                    +{pkg.services.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Staff Preview */}
                          {pkg.assignedStaff && pkg.assignedStaff.length > 0 && (
                            <div className="space-y-1.5">
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expert Staff</p>
                              <div className="flex flex-wrap gap-1.5">
                                {pkg.assignedStaff.slice(0, 2).map((staff, idx) => {
                                  const staffName = typeof staff === 'string' 
                                    ? staff 
                                    : (staff?.name || staff?.firstName || `Staff ${idx + 1}`);
                                  
                                  return (
                                    <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border border-purple-200/50 shadow-sm">
                                      <User className="h-3 w-3 mr-1.5" />
                                      {staffName}
                                    </span>
                                  );
                                })}
                                {pkg.assignedStaff.length > 2 && (
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 shadow-sm">
                                    +{pkg.assignedStaff.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Footer Section */}
                        <div className="px-4 pb-4 space-y-3">
                          {/* Divider */}
                          <div className="border-t border-gray-200"></div>
                          
                          {/* Pricing */}
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5 font-medium">Package Price</p>
                              {pkg.discountedPrice && pkg.discountedPrice !== pkg.totalPrice ? (
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-gray-400 line-through text-sm">
                                      ₹{pkg.totalPrice?.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                  <span className="font-bold text-2xl sm:text-3xl text-rose-600 block">
                                    ₹{pkg.discountedPrice?.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-bold text-2xl sm:text-3xl text-gray-900 block">
                                  ₹{pkg.totalPrice?.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button 
                              size="default"
                              variant="outline"
                              className="flex-1 text-xs sm:text-sm border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPackageForDetails(pkg);
                              }}
                            >
                              Details
                            </Button>
                            {isSelected ? (
                              <Button 
                                size="default"
                                variant="outline"
                                className="flex-1 text-xs sm:text-sm border-2 border-rose-400 text-rose-600 hover:bg-rose-50 hover:border-rose-500 transition-all font-semibold"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectWeddingPackage(null);
                                }}
                              >
                                <X className="h-3.5 w-3.5 mr-1" />
                                Remove
                              </Button>
                            ) : (
                              <Button 
                                size="default"
                                className="flex-1 text-xs sm:text-sm bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all font-semibold"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectWeddingPackage(pkg);
                                }}
                              >
                                <Heart className="h-3.5 w-3.5 mr-1" />
                                Select
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 mb-6">
                    <Heart className="h-10 w-10 text-rose-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Wedding Packages Available</h3>
                  <p className="text-gray-500">
                    Check back later for our exclusive wedding packages
                  </p>
                </div>
              )}
            </div>
        )}

        {/* Continue Button */}
        <div className="mt-8 flex justify-end sticky bottom-0 bg-white/80 backdrop-blur-sm py-4 border-t">
          {viewMode === 'services' && selectedServices.length > 0 && (
            <Button
              size="lg"
              onClick={() => setCurrentStep(2)}
            >
              Continue
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          )}
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={packageToConfirm !== null} onOpenChange={(open) => !open && setPackageToConfirm(null)}>
          <DialogContent className="max-w-md">
            {packageToConfirm && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <Heart className="h-6 w-6 text-rose-600" />
                    Confirm Package Selection
                  </DialogTitle>
                  <DialogDescription className="text-base pt-2">
                    Are you sure you want to select <span className="font-semibold text-gray-900">{packageToConfirm.name}</span>?
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-3 py-4">
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Total Services:</span>
                      <span className="font-semibold text-gray-900">{packageToConfirm.services?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Duration:</span>
                      <span className="font-semibold text-gray-900">{packageToConfirm.duration || 0} minutes</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-rose-200">
                      <span className="text-base font-bold text-gray-900">Price:</span>
                      <span className="text-2xl font-bold text-rose-600">
                        ₹{(packageToConfirm.discountedPrice || packageToConfirm.totalPrice)?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 text-center">
                    You can change your selection anytime before confirming the booking.
                  </p>
                </div>
                
                <DialogFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setPackageToConfirm(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={confirmPackageSelection}
                    className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirm
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Package Details Modal - Enhanced & Responsive */}
        <Dialog open={selectedPackageForDetails !== null} onOpenChange={(open) => !open && setSelectedPackageForDetails(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 gap-0">
            {selectedPackageForDetails && (
              <div className="flex flex-col h-full max-h-[90vh]">
                {/* Header with Image */}
                <div className="relative w-full h-40 sm:h-52 flex-shrink-0 overflow-hidden bg-gradient-to-br from-rose-100 to-pink-100">
                  <Image 
                    src={selectedPackageForDetails.image || `https://picsum.photos/seed/${selectedPackageForDetails.name}/1200/600`} 
                    alt={selectedPackageForDetails.name} 
                    fill 
                    className="object-cover" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://picsum.photos/seed/${selectedPackageForDetails.name}/1200/600`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Title & Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-white drop-shadow-2xl mb-2">
                      {selectedPackageForDetails.name}
                    </DialogTitle>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-gray-800 backdrop-blur-md shadow-lg">
                        <List className="h-3 w-3 mr-1" />
                        {selectedPackageForDetails.services?.length || 0} Services
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-gray-800 backdrop-blur-md shadow-lg">
                        <Clock className="h-3 w-3 mr-1" />
                        {selectedPackageForDetails.duration || 0} min
                      </span>
                      {selectedPackageForDetails.staffCount && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-gray-800 backdrop-blur-md shadow-lg">
                          <Users className="h-3 w-3 mr-1" />
                          {selectedPackageForDetails.staffCount} Staff
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
                  {/* Description */}
                  {selectedPackageForDetails.description && (
                    <div className="bg-gradient-to-br from-rose-50/50 to-pink-50/50 border border-rose-100 rounded-xl p-4">
                      <DialogDescription className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        {selectedPackageForDetails.description}
                      </DialogDescription>
                    </div>
                  )}
                  
                  {/* Services List */}
                  {selectedPackageForDetails.services && selectedPackageForDetails.services.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-rose-100 rounded-lg">
                          <List className="h-5 w-5 text-rose-600" />
                        </div>
                        <h4 className="font-bold text-lg sm:text-xl text-gray-900">Included Services</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedPackageForDetails.services.map((service, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-sm sm:text-base font-medium text-gray-800 leading-relaxed">{service.serviceName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Staff List */}
                  {selectedPackageForDetails.assignedStaff && selectedPackageForDetails.assignedStaff.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <h4 className="font-bold text-lg sm:text-xl text-gray-900">Expert Staff Members</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedPackageForDetails.assignedStaff.map((staff, idx) => {
                          const staffName = typeof staff === 'string' 
                            ? staff 
                            : (staff?.name || staff?.firstName || `Staff ${idx + 1}`);
                          
                          return (
                            <div key={idx} className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                                <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                              </div>
                              <span className="text-sm sm:text-base font-semibold text-gray-800">{staffName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Pricing Section */}
                  <div className="bg-gradient-to-br from-rose-100 via-pink-100 to-rose-100 border-2 border-rose-300 rounded-2xl p-5 sm:p-6 shadow-lg">
                    <h4 className="font-bold text-lg sm:text-xl mb-4 text-gray-900 flex items-center gap-2">
                      <span className="text-2xl">💰</span>
                      Package Pricing
                    </h4>
                    {selectedPackageForDetails.discountedPrice && 
                     selectedPackageForDetails.discountedPrice !== selectedPackageForDetails.totalPrice ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm sm:text-base">
                          <span className="text-gray-700 font-medium">Original Price:</span>
                          <span className="text-gray-500 line-through text-lg sm:text-xl">
                            ₹{selectedPackageForDetails.totalPrice?.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm sm:text-base">
                          <span className="text-gray-700 font-medium">You Save:</span>
                          <span className="text-green-600 font-bold text-lg sm:text-xl flex items-center gap-2">
                            <span className="bg-green-100 px-3 py-1 rounded-full text-sm">
                              {Math.round(((selectedPackageForDetails.totalPrice - selectedPackageForDetails.discountedPrice) / selectedPackageForDetails.totalPrice) * 100)}% OFF
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t-2 border-rose-400">
                          <span className="text-gray-900 font-bold text-base sm:text-lg">Final Price:</span>
                          <span className="text-rose-600 font-bold text-2xl sm:text-3xl lg:text-4xl">
                            ₹{selectedPackageForDetails.discountedPrice?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 font-bold text-base sm:text-lg">Total Price:</span>
                        <span className="text-rose-600 font-bold text-2xl sm:text-3xl lg:text-4xl">
                          ₹{selectedPackageForDetails.totalPrice?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Footer Actions */}
                <DialogFooter className="border-t bg-gray-50/80 backdrop-blur-sm p-4 sm:p-6 gap-2 sm:gap-3 flex-shrink-0">
                  <Button 
                    size="lg"
                    variant="outline" 
                    onClick={() => setSelectedPackageForDetails(null)}
                    className="flex-1 sm:flex-none border-2 font-semibold"
                  >
                    Close
                  </Button>
                  {selectedWeddingPackage?.id === (selectedPackageForDetails.id || selectedPackageForDetails._id) ? (
                    <Button 
                      size="lg"
                      variant="outline"
                      className="flex-1 sm:flex-none border-2 border-rose-400 text-rose-600 hover:bg-rose-50 font-semibold"
                      onClick={() => {
                        handleSelectWeddingPackage(null);
                        setSelectedPackageForDetails(null);
                      }}
                    >
                      <X className="h-5 w-5 mr-2" />
                      Deselect Package
                    </Button>
                  ) : (
                    <Button 
                      size="lg"
                      className="flex-1 sm:flex-none bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-lg font-semibold"
                      onClick={() => {
                        handleSelectWeddingPackage(selectedPackageForDetails);
                        setSelectedPackageForDetails(null);
                      }}
                    >
                      <Heart className="h-5 w-5 mr-2" />
                      Select Package
                    </Button>
                  )}
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
    </div>
  );
}