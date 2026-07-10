"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Plus, Check, Scissors, Loader2, AlertCircle, Heart, Users, X, Clock, List, User } from 'lucide-react';
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
    ? { 1: 'Select Package', 3: 'Select Date & Time', 4: 'Confirm Booking' }
    : { 1: 'Services', 2: 'Select Professional', 3: 'Time Slot' };

  const currentStepName = (steps as any)[currentStep] || 'Booking';

  return (
    <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mb-6 shadow-sm">
      <nav className="flex items-center text-xs sm:text-sm font-medium text-muted-foreground flex-wrap gap-y-2">
        {Object.values(steps).map((step, index) => {
          const targetStep = isWeddingPackage
            ? (index === 0 ? 1 : index === 1 ? 3 : 4)
            : index + 1;

          return (
            <React.Fragment key={step as string}>
              <button
                onClick={() => currentStep > targetStep && setCurrentStep(targetStep)}
                className={cn(
                  "transition-colors",
                  currentStep > targetStep ? "hover:text-primary" : "cursor-default",
                  currentStep === targetStep && "text-primary font-bold bg-white px-2 py-0.5 rounded-md shadow-sm border border-primary/10"
                )}
              >
                {step as string}
              </button>
              {index < Object.keys(steps).length - 1 && <ChevronRight className="h-4 w-4 mx-1 sm:mx-2 text-muted-foreground/50" />}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
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
  weddingPackageMode?: 'default' | 'customized' | null;
  bookingMode: 'salon' | 'home';
  setBookingMode: (mode: 'salon' | 'home') => void;
  /** Which tab to show on first render. Defaults to 'services'. Pass 'packages' when navigating from a wedding package Book button. */
  initialViewMode?: 'services' | 'packages';
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
  weddingPackageMode,
  bookingMode,
  setBookingMode,
  initialViewMode = 'services',
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
  const [viewMode, setViewMode] = useState<'services' | 'packages'>(initialViewMode);

  // Sync viewMode with initialViewMode prop updates
  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);

  // Sync viewMode with selectedWeddingPackage prop updates
  useEffect(() => {
    if (selectedWeddingPackage) {
      setViewMode('packages');
    }
  }, [selectedWeddingPackage]);
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
    const isCurrentlySelected = !!selectedWeddingPackage &&
      (selectedWeddingPackage.id === (pkg?.id || pkg?._id) || selectedWeddingPackage._id === (pkg?.id || pkg?._id));

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
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1 cursor-pointer w-fit" onClick={() => window.history.back()}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/back 1.png" alt="back" className="h-5 w-5" />
          <h2 className="text-2xl font-bold font-headline text-black">
            {viewMode === 'services' ? 'Select Your Services' : 'Choose Wedding Package'}
          </h2>
        </div>
        <p className="text-sm text-black pl-7">
          {viewMode === 'services'
            ? 'Choose one or more services you\'d like to book.'
            : 'Select from our specially curated wedding packages'}
        </p>
      </div>

      {/* View Mode Tabs */}
      {hasWeddingPackages && (
        <div className="flex gap-2 md:gap-4 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setViewMode('services')}
            className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-2 text-[11px] md:text-sm font-medium whitespace-nowrap transition-colors"
            style={{
              background: viewMode === 'services' ? '#422A3C' : '#ffffff',
              color: viewMode === 'services' ? '#ffffff' : '#374151',
              border: '1px solid #00000082',
              borderRadius: '0.375rem'
            }}
          >
            <Image src="/images/customer (2) 1.png" alt="Individual" width={14} height={14} className={viewMode === 'services' ? 'brightness-0 invert' : ''} />
            Individual Services
          </button>
          <button
            onClick={() => setViewMode('packages')}
            className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-2 text-[11px] md:text-sm font-medium whitespace-nowrap transition-colors"
            style={{
              background: viewMode === 'packages' ? '#422A3C' : '#ffffff',
              color: viewMode === 'packages' ? '#ffffff' : '#374151',
              border: '1px solid #00000082',
              borderRadius: '0.375rem'
            }}
          >
            <Image src="/images/like (1) 1.png" alt="Wedding" width={14} height={14} className={viewMode === 'packages' ? 'brightness-0 invert' : ''} />
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
          {/* Booking Mode Switcher - FIRST */}
          <div className="mb-4 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ background: '#EBF3FD' }}>
            <div className="flex items-center gap-3">
              <Image src="/images/calendar (6) 1.png" alt="Calendar" width={24} height={24} />
              <div>
                <h3 className="font-semibold text-black text-sm md:text-base">How would you like to book?</h3>
                <p className="text-xs md:text-sm text-black">Select your preferred services location type</p>
              </div>
            </div>

            <div className="flex bg-white rounded-md p-1 shadow-sm border border-gray-100">
              <button
                onClick={() => setBookingMode('salon')}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  background: bookingMode === 'salon' ? '#422A3C' : 'transparent',
                  color: bookingMode === 'salon' ? '#ffffff' : '#000000'
                }}
              >
                <Image src="/images/scissors (1) 1.png" alt="Salon" width={16} height={16} className={bookingMode === 'salon' ? 'brightness-0 invert' : ''} />
                Visit Salon
              </button>
              <button
                onClick={() => setBookingMode('home')}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  background: bookingMode === 'home' ? '#422A3C' : 'transparent',
                  color: bookingMode === 'home' ? '#ffffff' : '#000000'
                }}
              >
                <Image src="/images/home (2) 1.png" alt="Home" width={16} height={16} className={bookingMode === 'home' ? 'brightness-0 invert' : ''} />
                Home Service
              </button>
            </div>
          </div>

          {/* Category Dropdown - AFTER booking mode switcher */}
          {displayCategories.length > 1 && (
            <div className="mb-4 w-full max-w-[550px]">
              <Select value={activeCategory} onValueChange={setActiveCategory}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {displayCategories.map((category: { name: string }) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Services List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {servicesToDisplay
              .filter((service: Service) => {
                // In home mode, hide salon-only services entirely
                if (bookingMode === 'home') {
                  const isHomeService = service.homeService?.available || service.serviceHomeService?.available;
                  return !!isHomeService;
                }
                return true; // Visit Salon: show all
              })
              .map((service: Service) => {
                const isSelected = selectedServices.some(s => s.id === service.id);

                return (
                  <div
                    key={service.id}
                    className={cn(
                      'flex p-3 rounded-xl transition-shadow relative cursor-pointer hover:shadow-md',
                      isSelected ? 'ring-2 shadow-md' : ''
                    )}
                    style={{ border: isSelected ? '1px solid #087326' : '1px solid #00000080', background: 'linear-gradient(90deg, #EBF3FD 0%, #FFFFFF 100%)' }}
                    onClick={() => handleSelectService(service)}
                  >
                    {/* Selected Badge Removed */}

                    {/* Image Section */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 mr-3">
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
                    <div className="flex flex-col flex-1 py-1">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h4 className="font-medium text-black text-sm sm:text-base pr-2">{service.name}</h4>
                        {service.discountedPrice && parseFloat(String(service.discountedPrice)) < parseFloat(String(service.price)) && (
                          <span className="shrink-0 bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                            Save {Math.round(((parseFloat(String(service.price)) - parseFloat(String(service.discountedPrice))) / parseFloat(String(service.price))) * 100)}%
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Image src="/images/clock (2) 4.png" alt="Time" width={14} height={14} />
                        <span className="text-xs text-black">{service.duration} mins</span>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5">
                          <Image src="/images/rupee (2) 1.png" alt="Price" width={14} height={14} />
                          <span className="text-xs sm:text-sm text-black font-medium">
                            {service.discountedPrice && parseFloat(String(service.discountedPrice)) < parseFloat(String(service.price)) ? (
                              <>
                                <span className="line-through text-black mr-1">{service.price}/-</span>
                                {service.discountedPrice}/-
                              </>
                            ) : (
                              `${service.price}/-`
                            )}
                          </span>
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleSelectService(service); }}
                          className={cn(
                            'border h-7 md:h-8 px-2.5 md:px-4 text-[11px] md:text-sm font-medium flex justify-center items-center gap-1 transition-colors rounded-none rounded-tr-xl rounded-bl-xl whitespace-nowrap',
                            isSelected ? 'bg-[#087326]/10 border-[#087326] text-[#087326]' : 'hover:bg-gray-50'
                          )}
                          style={isSelected ? { color: '#087326', borderColor: '#087326', backgroundColor: 'rgba(8, 115, 38, 0.1)' } : { borderColor: '#422A3C', color: '#422A3C' }}
                        >
                          {isSelected ? <><Image src="/images/check 1.png" alt="Selected" width={14} height={14} /> <span className="hidden sm:inline">Selected</span></> : <><Plus className="w-3 h-3 md:w-4 md:h-4" /> Add</>}
                        </button>
                      </div>
                    </div>
                  </div>
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

                const isSelected = !!selectedWeddingPackage &&
                  (selectedWeddingPackage.id === (pkg.id || pkg._id) || selectedWeddingPackage._id === (pkg.id || pkg._id));
                const isCustomized = isSelected && weddingPackageMode === 'customized' && selectedWeddingPackage;

                const displayServicesCount = isCustomized ? (selectedWeddingPackage.services?.length || 0) : (pkg.services?.length || 0);
                const displayDuration = isCustomized ? (selectedWeddingPackage.duration || 0) : (pkg.duration || 0);
                const displayTotalPrice = isCustomized ? (selectedWeddingPackage.totalPrice || 0) : (pkg.totalPrice || 0);
                const displayDiscountedPrice = isCustomized ? (selectedWeddingPackage.discountedPrice || null) : (pkg.discountedPrice || null);

                const discount = displayDiscountedPrice && displayDiscountedPrice !== displayTotalPrice
                  ? Math.round(((displayTotalPrice - displayDiscountedPrice) / displayTotalPrice) * 100)
                  : 0;

                return (
                  <Card
                    key={pkg.id || pkg._id}
                    className={cn(
                      'overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group relative',
                      'bg-card flex flex-col h-full rounded-tl-lg rounded-tr-[24px] rounded-bl-[24px] rounded-br-lg',
                      isSelected
                        ? 'ring-2 ring-primary shadow-lg'
                        : 'shadow-sm hover:shadow-md border'
                    )}
                  >
                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute top-0 left-0 z-10 bg-[#3a2b38] text-white px-3 py-2 rounded-br-2xl rounded-tl-lg text-xs font-bold shadow-sm flex flex-col items-center leading-tight">
                        <span>{discount}%</span>
                        <span>OFF</span>
                      </div>
                    )}

                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 z-10 bg-primary text-primary-foreground rounded-full p-1.5 shadow-sm">
                        <Check className="h-4 w-4" />
                      </div>
                    )}

                    {/* Image Header */}
                    <div className="relative w-full h-40 sm:h-44 overflow-hidden bg-muted">
                      <Image
                        src={pkg.image || '/images/wedding package placeholder.png'}
                        alt={pkg.name}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/wedding package placeholder.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Tags Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-white text-[11px] font-bold text-gray-900 shadow-sm">
                          <img src="/images/menu (1) 1.png" alt="Services" className="h-3 w-3 mr-1" />
                          {displayServicesCount} Services
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded bg-white text-[11px] font-bold text-gray-900 shadow-sm">
                          <img src="/images/clock (10) 4.png" alt="Duration" className="h-3 w-3 mr-1" />
                          {displayDuration >= 60
                            ? `${Math.floor(displayDuration / 60)}hr ${displayDuration % 60 > 0 ? (displayDuration % 60) + 'min' : ''}`
                            : `${displayDuration} min`}
                        </span>
                        {pkg.staffCount && (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-white text-[11px] font-bold text-gray-900 shadow-sm">
                            <img src="/images/group (4) 1.png" alt="Staff" className="h-3 w-3 mr-1" />
                            {pkg.staffCount} Staff
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-3 flex-1 flex flex-col">
                      {/* Title */}
                      <h4 className="font-bold text-base text-foreground mb-1 line-clamp-1">
                        {pkg.name}
                      </h4>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 mb-2">
                        {displayDiscountedPrice && displayDiscountedPrice !== displayTotalPrice ? (
                          <>
                            <span className="font-bold text-lg" style={{ color: "#422A3C" }}>
                              ₹ {displayDiscountedPrice?.toLocaleString('en-IN')}/-
                            </span>
                            <span className="text-muted-foreground line-through text-sm">
                              ₹ {displayTotalPrice?.toLocaleString('en-IN')}/-
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-lg" style={{ color: "#422A3C" }}>
                            ₹ {displayTotalPrice?.toLocaleString('en-IN')}/-
                          </span>
                        )}
                      </div>

                      {/* Services Preview */}
                      {(isCustomized ? selectedWeddingPackage.services : pkg.services) && (isCustomized ? selectedWeddingPackage.services : pkg.services).length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-bold text-foreground mb-1">What's Included</p>
                          <p className="text-sm text-foreground/80 truncate">
                            • {(isCustomized ? selectedWeddingPackage.services : pkg.services).map((s: any) => s.serviceName || s.name).join(', ')}
                          </p>
                        </div>
                      )}

                      {/* Staff Preview */}
                      {pkg.assignedStaff && pkg.assignedStaff.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-bold text-foreground mb-1">Expert Staff</p>
                          <p className="text-sm text-foreground/80 truncate">
                            {pkg.assignedStaff.map((staff: any) => `• ${getStaffName(staff)}`).join('   ')}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-auto pt-1">
                        <Button
                          variant="outline"
                          className="flex-[1] min-w-0 rounded-md border-gray-300 font-bold hover:bg-gray-50 text-xs py-1.5 whitespace-nowrap"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPackageForDetails(pkg);
                          }}
                        >
                          Details
                        </Button>
                        <button
                          className={`flex-[2] min-w-0 rounded-tl-md rounded-tr-[14px] rounded-bl-[14px] rounded-br-md text-xs font-bold px-3 py-1.5 transition-colors border whitespace-nowrap ${isSelected
                              ? 'bg-[#422A3C] text-white border-[#422A3C]'
                              : 'bg-transparent text-[#422A3C] border-[#422A3C] hover:bg-[#422A3C]/5'
                            }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isSelected) handleSelectWeddingPackage(null);
                            else handleSelectWeddingPackage(pkg);
                          }}
                        >
                          {isSelected ? 'Remove' : 'Select Package'}
                        </button>
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
                  src={selectedPackageForDetails.image || '/images/wedding package placeholder.png'}
                  alt={selectedPackageForDetails.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/wedding package placeholder.png';
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