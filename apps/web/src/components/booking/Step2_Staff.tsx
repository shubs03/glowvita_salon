"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@repo/ui/cn';
import { User, Users, CheckCircle, ChevronRight, Loader2, AlertCircle, Star } from 'lucide-react';
import { StaffMember, Service } from '@/hooks/useBookingData';

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

interface Step2StaffProps {
    selectedStaff: StaffMember | null;
    onSelectStaff: (staff: StaffMember | null) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    staff: StaffMember[];
    isLoading: boolean;
    error?: any;
    selectedService?: Service | null; // Add selected service prop
    onStaffSelect?: (staff: StaffMember | null) => void; // Add callback for staff selection
}

export function Step2_Staff({ 
    selectedStaff, 
    onSelectStaff, 
    currentStep, 
    setCurrentStep,
    staff,
    isLoading,
    error,
    selectedService,
    onStaffSelect
}: Step2StaffProps): JSX.Element {

    // Log what we receive as props
    console.log('Step2_Staff - Props received:', { selectedStaff, currentStep, staff, isLoading, error, selectedService });

    // Filter staff based on selected service
    const filteredStaff = useMemo(() => {
        console.log('Step2_Staff - Selected Service:', selectedService);
        console.log('Step2_Staff - All Staff:', staff);
        
        // If no service is selected, show all staff
        if (!selectedService) {
            console.log('Step2_Staff - No service selected, returning all staff');
            return staff;
        }
        
        // If the service doesn't have a staff array, show all staff
        if (!selectedService.staff || selectedService.staff.length === 0) {
            console.log('Step2_Staff - Service has no staff array, returning all staff');
            return staff;
        }
        
        // Filter staff based on the service's staff array
        // The staff array in the service can contain either staff IDs or staff names
        const serviceStaff = staff.filter(staffMember => {
            // Check if staff member ID is in the service's staff array
            const isIdMatch = selectedService.staff?.includes(staffMember.id);
            // Check if staff member name is in the service's staff array
            const isNameMatch = selectedService.staff?.includes(staffMember.name);
            const result = isIdMatch || isNameMatch;
            console.log(`Step2_Staff - Checking staff ${staffMember.name} (${staffMember.id}): ID match: ${isIdMatch}, Name match: ${isNameMatch}, Result: ${result}`);
            return result;
        });
        
        console.log('Step2_Staff - Filtered staff based on service:', serviceStaff);
        return serviceStaff;
    }, [staff, selectedService]);

    // Handle staff selection with automatic navigation to Step 3
    const handleSelectStaff = (staff: StaffMember | null) => {
        console.log('Step2_Staff - Staff selected:', staff);
        onSelectStaff(staff);
        // Call the callback if provided
        if (onStaffSelect) {
            console.log('Step2_Staff - Calling onStaffSelect callback with:', staff);
            onStaffSelect(staff);
        }
        // Automatically navigate to Step 3
        setCurrentStep(3);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="w-full">
                <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} />
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <Users className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-bold font-headline">Select a Professional</h2>
                    </div>
                    <p className="text-muted-foreground">Choose your preferred stylist or select any professional.</p>
                </div>
                
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading staff members...</p>
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
                            <Users className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-bold font-headline">Select a Professional</h2>
                    </div>
                    <p className="text-muted-foreground">Choose your preferred stylist or select any professional.</p>
                </div>
                
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-4">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                        <p className="text-muted-foreground">Unable to load staff members. Please try again.</p>
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
                    <Users className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold font-headline">Select a Professional</h2>
            </div>
            <p className="text-muted-foreground">Choose your preferred stylist or select any professional.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Any Professional Card */}
            <div 
                className={cn(
                    'group relative aspect-square p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 rounded-2xl border-2',
                    !selectedStaff ? 'border-primary bg-primary/5 shadow-lg' : 'border-dashed border-border hover:border-primary/50 hover:bg-secondary/50'
                )}
                onClick={() => handleSelectStaff(null)}
            >
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4 border-2 border-dashed border-border group-hover:border-primary/50 transition-colors">
                    <Users className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground">Any Professional</h3>
                <p className="text-sm text-muted-foreground">We'll assign an available expert.</p>
                {!selectedStaff && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4" />
                    </div>
                )}
            </div>
            {/* Staff Member Cards */}
            {filteredStaff && filteredStaff.length > 0 ? filteredStaff.map((staffMember: StaffMember) => (
                <div 
                    key={staffMember.id}
                    className={cn(
                        'group relative aspect-square p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 rounded-2xl border-2 overflow-hidden',
                        selectedStaff?.id === staffMember.id ? 'border-primary bg-primary/5 shadow-lg' : 'border-border/50 hover:border-primary/50 hover:bg-secondary/50'
                    )}
                    onClick={() => handleSelectStaff(staffMember)}
                >
                    <div className="relative w-24 h-24 rounded-full mb-4 overflow-hidden shadow-md">
                        <Image 
                            src={staffMember.image || `https://picsum.photos/seed/${staffMember.name}/400/400`} 
                            alt={staffMember.name} 
                            width={120} 
                            height={120} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint="professional staff portrait"
                        />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">{staffMember.name}</h3>
                    <p className="text-xs text-muted-foreground">{staffMember.role}</p>
                    {staffMember.rating && (
                        <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-muted-foreground">{staffMember.rating}</span>
                        </div>
                    )}
                    {staffMember.specialties && staffMember.specialties.length > 0 && (
                        <div className="mt-1">
                            <p className="text-xs text-muted-foreground truncate">
                                {staffMember.specialties.slice(0, 2).join(', ')}
                            </p>
                        </div>
                    )}
                    {selectedStaff?.id === staffMember.id && (
                         <div className="absolute top-3 right-3 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                    )}
                </div>
            )) : (
                <div className="col-span-full flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-4">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No staff members available for this service. You can still book with any professional.</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}