"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Bolt, Plus, Check, Scissors, Loader2, AlertCircle, Home, Heart, Users, X, Clock , List, User } from 'lucide-react';
import { cn } from '@repo/ui/cn';
import { ChevronRight } from 'lucide-react';
import { Service, WeddingPackage } from '@/hooks/useBookingData';
import { useParams } from 'next/navigation';
import { useGetPublicVendorStaffQuery } from '@repo/store/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/dialog';
import { Checkbox } from "@repo/ui/checkbox";
import { Label } from "@repo/ui/label";

const Breadcrumb = ({ currentStep, setCurrentStep, isWeddingPackage }: { 
  currentStep: number; 
  setCurrentStep: (step: number) => void; 
  isWeddingPackage?: boolean;
}) => {
  const steps = isWeddingPackage
    ? ['Select Package', 'Select Date & Time', 'Confirm Booking']
    : ['Services', 'Select Professional', 'Time Slot'];

  return (
    <nav className="flex items-center text-sm font-medium text-muted-foreground mb-4">
      {steps.map((step, index) => {
        // Map index to step number
        // Regular: 0->1, 1->2, 2->3
        // Wedding: 0->1, 1->3, 2->4
        const targetStep = isWeddingPackage
          ? (index === 0 ? 1 : index === 1 ? 3 : 4)
          : index + 1;

        return (
          <React.Fragment key={step}>
            <button
              onClick={() => currentStep > targetStep && setCurrentStep(targetStep)}
              className={cn(
                "transition-colors",
                currentStep > targetStep ? "hover:text-primary" : "cursor-default",
                currentStep === targetStep && "text-primary font-semibold"
              )}
            >
              {step}
            </button>
            {index < steps.length - 1 && <ChevronRight className="h-4 w-4 mx-2" />}
          </React.Fragment>
        );
      })}
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
  // Get vendor ID from URL params
  const params = useParams();
  const vendorId = params?.salonId as string;

  // Fetch staff data for the vendor to resolve staff IDs to names
  const { data: staffData, isLoading: isStaffLoading } = useGetPublicVendorStaffQuery(vendorId, {
    skip: !vendorId,
  });

  console.log('Raw Staff Data:', staffData);
  console.log('Staff Data Structure:', {
    hasData: !!staffData,
    hasDataProperty: !!(staffData as any)?.data,
    isArray: Array.isArray(staffData),
    isDataArray: Array.isArray((staffData as any)?.data),
    keys: staffData ? Object.keys(staffData) : [],
    firstItem: staffData ? (Array.isArray(staffData) ? staffData[0] : (staffData as any)?.data?.[0]) : null
  });

  // Create a staff lookup map for quick ID to name resolution
  const staffLookup = useMemo(() => {
    console.log('Creating staff lookup from:', staffData);
    
    if (!staffData) {
      console.log('No staff data available');
      return {};
    }
    
    const lookup: { [key: string]: string } = {};
    
    // Try multiple data structure patterns
    let staffArray: any[] = [];
    
    if (Array.isArray(staffData)) {
      staffArray = staffData;
    } else if ((staffData as any)?.data && Array.isArray((staffData as any).data)) {
      staffArray = (staffData as any).data;
    } else if ((staffData as any)?.staff && Array.isArray((staffData as any).staff)) {
      staffArray = (staffData as any).staff;
    }
    
    console.log('Staff Array to process:', staffArray, 'Length:', staffArray.length);
    
    if (staffArray.length > 0) {
      staffArray.forEach((staff: any, index: number) => {
        console.log(`Processing staff ${index}:`, staff);
        
        if (staff) {
          // Try all possible ID fields
          const staffId = staff._id || staff.id || staff.staffId;
          // Try all possible name fields
          const staffName = staff.name || staff.fullName || staff.staffName || staff.firstName 
            || (staff.firstName && staff.lastName ? `${staff.firstName} ${staff.lastName}` : null);
          
          console.log(`Staff ${index} - ID: ${staffId}, Name: ${staffName}`);
          
          if (staffId && staffName) {
            lookup[String(staffId)] = staffName;
          }
        }
      });
    }
    
    console.log('Final Staff Lookup Map:', lookup);
    return lookup;
  }, [staffData]);

  // Helper function to get staff name from ID with fallback
  const getStaffName = (staff: any): string => {
    console.log('Getting staff name for:', staff);
    
    // If staff is already a string, treat it as an ID and look it up
    if (typeof staff === 'string') {
      const resolvedName = staffLookup[staff];
      console.log(`Resolved ID "${staff}" to name:`, resolvedName);
      return resolvedName || staff || 'Staff Member';
    }
    
    // If staff is an object, try to extract information
    if (staff && typeof staff === 'object') {
      // First try to get the ID and look it up
      const staffId = staff._id || staff.id || staff.staffId;
      if (staffId && staffLookup[String(staffId)]) {
        console.log(`Found staff name in lookup for ID ${staffId}:`, staffLookup[String(staffId)]);
        return staffLookup[String(staffId)];
      }
      
      // Try to get name directly from the object
      const directName = staff.name || staff.fullName || staff.staffName || staff.firstName
        || (staff.firstName && staff.lastName ? `${staff.firstName} ${staff.lastName}` : null);
      
      if (directName) {
        console.log('Found staff name directly from object:', directName);
        return directName;
      }
    }
    
    console.log('Falling back to default Staff Member');
    return 'Staff Member';
  };

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

  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [currentServiceForAddons, setCurrentServiceForAddons] = useState<Service | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  // Use provided categories or fallback to default
  const displayCategories = categories?.length > 0 ? categories : defaultCategories;

  // Calculate services to display based on category
  const servicesToDisplay = activeCategory === "All"
    ? (services || [])
    : (servicesByCategory[activeCategory] || []);

  console.log('Step1_Services debug:', {
    servicesCount: services?.length,
    firstService: services?.[0],
    firstServiceAddons: services?.[0]?.addOns
  });

  // Use valid wedding packages
  const displayWeddingPackages = validWeddingPackages;

  // Handle service selection
  const handleSelectService = (service: Service) => {
    // Check if service is available for home or wedding (support both formats)
    const isHomeService = service.homeService?.available || service.serviceHomeService?.available;
    const isWeddingService = service.weddingService?.available || service.serviceWeddingService?.available;

    // ENFORCED MODE LOGIC
    if (bookingMode === 'home') {
      // If in Home Mode, can ONLY select home-available services
      if (!isHomeService) {
        console.warn("Cannot select salon-only service in Home booking mode");
        return;
      }
    }

    // Prepare service with option based on mode
    const serviceWithOption = {
      ...service,
      selectedServiceOption: bookingMode === 'home' ? ('home' as const) : ('salon' as const)
    };

    // Check if service has add-ons and is not already selected (to allow toggling off)
    // If it's already selected, we just toggle it off (remove it), no need to show add-ons modal again
    // Unless we want to allow editing add-ons? For now, standard behavior is remove.
    const isSelected = selectedServices.some(s => s.id === service.id);

    if (!isSelected && service.addOns && service.addOns.length > 0) {
      setCurrentServiceForAddons(serviceWithOption);
      setSelectedAddonIds([]); // Reset selected add-ons
      setIsAddonModalOpen(true);
    } else {
      // If no add-ons or already selected (deselecting), proceed normally
      onSelectService(serviceWithOption);
    }
  };

  const confirmAddonSelection = () => {
    if (currentServiceForAddons) {
      const selectedAddonsList = currentServiceForAddons.addOns?.filter(addon =>
        selectedAddonIds.includes(addon._id)
      ) || [];

      const originalService = services.find(s => s.id === currentServiceForAddons.id);
      const baseDurationString = originalService ? (originalService.duration) : (currentServiceForAddons.duration);
      const baseDuration = parseInt(String(baseDurationString).match(/\d+/)?.[0] || '0', 10);

      const totalAddonsDuration = selectedAddonsList.reduce((total, addon) => total + (addon.duration || 0), 0);

      const serviceWithAddons = {
        ...currentServiceForAddons,
        selectedAddons: selectedAddonsList,
        duration: `${baseDuration + totalAddonsDuration} min`,
      };

      onSelectService(serviceWithAddons);
      setIsAddonModalOpen(false);
      setCurrentServiceForAddons(null);
      setSelectedAddonIds([]);
    }
  };

  const skipAddonSelection = () => {
    if (currentServiceForAddons) {
      onSelectService({ ...currentServiceForAddons, selectedAddons: [] }); // Add without add-ons
      setIsAddonModalOpen(false);
      setCurrentServiceForAddons(null);
      setSelectedAddonIds([]);
    }
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddonIds(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
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
        <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} isWeddingPackage={!!selectedWeddingPackage} />
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
        <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} isWeddingPackage={!!selectedWeddingPackage} />
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
        <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} isWeddingPackage={!!selectedWeddingPackage} />
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
      <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} isWeddingPackage={!!selectedWeddingPackage} />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            {viewMode === 'services' ? <Scissors className="h-6 w-6" /> : <Heart className="h-6 w-6" />}
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
                ? "bg-white shadow-sm text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className="h-4 w-4" />
            Wedding Packages
            {displayWeddingPackages.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
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
          <div className="sticky top-0 z-10 pb-4 -mx-6 px-6">
            <div className="relative">
              <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
                {displayCategories.map((category: { name: string }) => (
                  <Button
                    key={category.name}
                    variant={activeCategory === category.name ? 'default' : 'outline'}
                    className={`rounded-full px-5 py-2 h-auto text-sm transition-all duration-200 ${activeCategory === category.name ? '' : 'hover:bg-primary/5 hover:border-primary/50'
                      }`}
                    onClick={() => setActiveCategory(category.name)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            
            </div>
          </div>


          {/* Booking Mode Switcher - Essential UX Element */}
          <div className="mb-6 bg-secondary/20 p-4 rounded-xl border border-border">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="bg-primary/20 p-1.5 rounded-full"><Scissors className="w-4 h-4 text-primary" /></span>
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
              <div className="mt-3 text-xs text-primary bg-primary/10 px-3 py-2 rounded-md border border-primary/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
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
                          isDisabled ? "bg-muted text-muted-foreground" : "bg-primary text-secondary"
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
                      {/* Swiggy-style Customisable Badge */}
                      {service.addOns && service.addOns.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          <Bolt className="h-3 w-3 mr-1" />
                          Customisable
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
                      'overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group relative',
                      'bg-card flex flex-col h-full',
                      isSelected
                        ? 'ring-2 ring-primary shadow-lg'
                        : 'shadow-sm hover:shadow-md border'
                    )}
                  >
                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground px-3 py-1 rounded-md text-xs font-semibold shadow-sm">
                        {discount}% OFF
                      </div>
                    )}

                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground rounded-full p-1.5 shadow-sm">
                        <Check className="h-4 w-4" />
                      </div>
                    )}

                    {/* Image Header */}
                    <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-muted">
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
                        <h4 className="font-bold text-lg sm:text-xl text-white mb-1.5 line-clamp-2">
                          {pkg.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/90 text-foreground">
                            <List className="h-3 w-3 mr-1" />
                            {pkg.services?.length || 0} Services
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/90 text-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {pkg.duration || 0}m
                          </span>
                          {pkg.staffCount && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/90 text-foreground">
                              <Users className="h-3 w-3 mr-1" />
                              {pkg.staffCount} Staff
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 space-y-3 flex-1">
                      {/* Description */}
                      {pkg.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">{pkg.description}</p>
                      )}

                      {/* Services Preview */}
                      {pkg.services && pkg.services.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-foreground">What's Included</p>
                          <div className="flex flex-wrap gap-1.5">
                            {pkg.services.slice(0, 3).map((service, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border">
                                <span className="line-clamp-1">{service.serviceName}</span>
                              </span>
                            ))}
                            {pkg.services.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                                +{pkg.services.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Staff Preview */}
                      {pkg.assignedStaff && pkg.assignedStaff.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-foreground">Expert Staff</p>
                          <div className="flex flex-wrap gap-1.5">
                            {pkg.assignedStaff.slice(0, 2).map((staff, idx) => {
                              const staffName = getStaffName(staff);

                              return (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                                  <User className="h-3 w-3 mr-1" />
                                  <span className="line-clamp-1">{staffName}</span>
                                </span>
                              );
                            })}
                            {pkg.assignedStaff.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                                +{pkg.assignedStaff.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Section */}
                    <div className="px-4 pb-4 space-y-3 mt-auto">
                      {/* Divider */}
                      <div className="border-t"></div>

                      {/* Pricing */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Package Price</p>
                          {pkg.discountedPrice && pkg.discountedPrice !== pkg.totalPrice ? (
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-xl sm:text-2xl text-foreground">
                                ₹{pkg.discountedPrice?.toLocaleString('en-IN')}
                              </span>
                              <span className="text-muted-foreground line-through text-sm">
                                ₹{pkg.totalPrice?.toLocaleString('en-IN')}
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-xl sm:text-2xl text-foreground">
                              ₹{pkg.totalPrice?.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPackageForDetails(pkg);
                          }}
                        >
                          Details
                        </Button>
                        {isSelected ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs"
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
                            size="sm"
                            variant="default"
                            className="flex-1 text-xs"
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
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <Heart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Wedding Packages Available</h3>
              <p className="text-muted-foreground">
                Check back later for our exclusive wedding packages
              </p>
            </div>
          )}
        </div>
      )}

      {/* Continue Button - Removed as per user request */}

      {/* Confirmation Dialog */}
      <Dialog open={packageToConfirm !== null} onOpenChange={(open) => !open && setPackageToConfirm(null)}>
        <DialogContent className="max-w-md">
          {packageToConfirm && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary" />
                  Confirm Package Selection
                </DialogTitle>
                <DialogDescription className="text-base pt-2">
                  Are you sure you want to select <span className="font-semibold">{packageToConfirm.name}</span>?
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-4">
                <div className="bg-muted border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Total Services:</span>
                    <span className="font-semibold">{packageToConfirm.services?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Duration:</span>
                    <span className="font-semibold">{packageToConfirm.duration || 0} minutes</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-base font-bold">Price:</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{(packageToConfirm.discountedPrice || packageToConfirm.totalPrice)?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">
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
                  className="flex-1"
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
              <div className="relative w-full h-40 sm:h-52 flex-shrink-0 overflow-hidden bg-muted">
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
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-white mb-2 line-clamp-2">
                    {selectedPackageForDetails.name}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/90 text-foreground">
                      <List className="h-3 w-3 mr-1" />
                      {selectedPackageForDetails.services?.length || 0} Services
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/90 text-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {selectedPackageForDetails.duration || 0} min
                    </span>
                    {selectedPackageForDetails.staffCount && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/90 text-foreground">
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
                  <div className="pb-4 border-b">
                    <h4 className="font-semibold text-sm mb-2">Description</h4>
                    <DialogDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {selectedPackageForDetails.description}
                    </DialogDescription>
                  </div>
                )}

                {/* Services List */}
                {selectedPackageForDetails.services && selectedPackageForDetails.services.length > 0 && (
                  <div className="pb-4 border-b">
                    <div className="flex items-center gap-2 mb-3">
                      <List className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-base">Included Services ({selectedPackageForDetails.services.length})</h4>
                    </div>
                    <div className="space-y-2">
                      {selectedPackageForDetails.services.map((service, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="leading-relaxed line-clamp-2">{service.serviceName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Staff List */}
                {selectedPackageForDetails.assignedStaff && selectedPackageForDetails.assignedStaff.length > 0 && (
                  <div className="pb-4 border-b">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-base">Expert Staff Members ({selectedPackageForDetails.assignedStaff.length})</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedPackageForDetails.assignedStaff.map((staff, idx) => {
                        const staffName = getStaffName(staff);

                        return (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="line-clamp-1">{staffName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pricing Section */}
                <div>
                  <h4 className="font-semibold text-base mb-3">Package Pricing</h4>
                  {selectedPackageForDetails.discountedPrice &&
                    selectedPackageForDetails.discountedPrice !== selectedPackageForDetails.totalPrice ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Original Price:</span>
                        <span className="text-muted-foreground line-through">
                          ₹{selectedPackageForDetails.totalPrice?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">You Save:</span>
                        <span className="font-semibold text-primary">
                          {Math.round(((selectedPackageForDetails.totalPrice - selectedPackageForDetails.discountedPrice) / selectedPackageForDetails.totalPrice) * 100)}% OFF
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="font-bold">Final Price:</span>
                        <span className="text-primary font-bold text-xl sm:text-2xl">
                          ₹{selectedPackageForDetails.discountedPrice?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-bold">Total Price:</span>
                      <span className="text-primary font-bold text-xl sm:text-2xl">
                        ₹{selectedPackageForDetails.totalPrice?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <DialogFooter className="border-t bg-muted/50 p-4 sm:p-5 gap-2 flex-shrink-0">
                <Button
                  size="default"
                  variant="outline"
                  onClick={() => setSelectedPackageForDetails(null)}
                  className="flex-1 sm:flex-none"
                >
                  Close
                </Button>
                {selectedWeddingPackage?.id === (selectedPackageForDetails.id || selectedPackageForDetails._id) ? (
                  <Button
                    size="default"
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    onClick={() => {
                      handleSelectWeddingPackage(null);
                      setSelectedPackageForDetails(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Deselect Package
                  </Button>
                ) : (
                  <Button
                    size="default"
                    variant="default"
                    className="flex-1 sm:flex-none"
                    onClick={() => {
                      handleSelectWeddingPackage(selectedPackageForDetails);
                      setSelectedPackageForDetails(null);
                    }}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Select Package
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add-ons Selection Modal */}
      <Dialog open={isAddonModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddonModalOpen(false);
          setCurrentServiceForAddons(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customize your service</DialogTitle>
            <DialogDescription>
              Would you like to add any extras to <strong>{currentServiceForAddons?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 max-h-[60vh] overflow-y-auto space-y-3">
            {currentServiceForAddons?.addOns?.map((addon) => (
              <div
                key={addon._id}
                className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  toggleAddon(addon._id);
                }}
              >
                <Checkbox
                  checked={selectedAddonIds.includes(addon._id)}
                  className="mt-1 pointer-events-none"
                />
                <div className="flex-1 grid gap-1 pointer-events-none">
                  <span className="font-medium">
                    {addon.name}
                  </span>
                  {addon.description && (
                    <p className="text-sm text-muted-foreground">
                      {addon.description}
                    </p>
                  )}
                </div>
                <div className="font-semibold text-primary pointer-events-none">
                  +₹{addon.price}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddonModalOpen(false);
                setCurrentServiceForAddons(null);
                setSelectedAddonIds([]);
              }}
              className="sm:order-1 border-destructive text-destructive hover:bg-destructive/10"
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={skipAddonSelection}
              className="sm:order-2"
            >
              Skip
            </Button>
            <Button
              onClick={confirmAddonSelection}
              className="sm:order-3"
            >
              Add with extras
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}