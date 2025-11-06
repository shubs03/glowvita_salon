"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@repo/ui/cn';
import { User, Users, CheckCircle, ChevronRight, Loader2, AlertCircle, Star, Plus, X } from 'lucide-react';
import { StaffMember, Service, ServiceStaffAssignment, isStaffCompatibleWithService } from '@/hooks/useBookingData';

const Breadcrumb = ({ currentStep, setCurrentStep }: { currentStep: number; setCurrentStep: (step: number) => void; }) => {
    const steps = ['Services', 'Select Professionals', 'Time Slot'];
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

interface Step2MultiServiceProps {
    serviceStaffAssignments: ServiceStaffAssignment[];
    onUpdateAssignment: (serviceId: string, staff: StaffMember | null) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    staff: StaffMember[];
    isLoading: boolean;
    error?: any;
    onNext: () => void;
}

export function Step2_MultiService({ 
    serviceStaffAssignments,
    onUpdateAssignment,
    currentStep,
    setCurrentStep,
    staff,
    isLoading,
    error,
    onNext
}: Step2MultiServiceProps): JSX.Element {

    // State to track which service is currently being assigned
    const [currentAssignmentIndex, setCurrentAssignmentIndex] = useState(0);
    const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);

    // Filter staff based on current service
    useEffect(() => {
        if (serviceStaffAssignments.length > 0 && currentAssignmentIndex < serviceStaffAssignments.length) {
            const currentService = serviceStaffAssignments[currentAssignmentIndex].service;
            
            // If no staff data, return empty array
            if (!staff || staff.length === 0) {
                setFilteredStaff([]);
                return;
            }
            
            // If no service is selected, show all staff
            if (!currentService) {
                setFilteredStaff(staff);
                return;
            }
            
            // If the service doesn't have a staff array, show all staff
            if (!currentService.staff || currentService.staff.length === 0) {
                setFilteredStaff(staff);
                return;
            }
            
            // Filter staff based on the service's staff array
            // The staff array in the service can contain either staff IDs or staff names
            const serviceStaff = staff.filter((staffMember: StaffMember) => {
                // Check if staff member ID is in the service's staff array
                const isIdMatch = currentService.staff?.includes(staffMember.id);
                // Check if staff member name is in the service's staff array
                const isNameMatch = currentService.staff?.includes(staffMember.name);
                const result = isIdMatch || isNameMatch;
                return result;
            });
            // Preserve selection state from previous assignments
            const updatedStaff = serviceStaff.map(staffMember => {
                const assignment = serviceStaffAssignments.find(a => 
                  a.service.id === currentService.id && a.staff?.id === staffMember.id
                );
                return {
                  ...staffMember,
                  selected: !!assignment
                };
            });
            setFilteredStaff(updatedStaff);
        }
    }, [staff, serviceStaffAssignments, currentAssignmentIndex]);

    // Handle staff selection
    const handleSelectStaff = (staff: StaffMember | null) => {
        console.log('Step2_MultiService - Staff selected:', staff);
        if (serviceStaffAssignments.length > 0 && currentAssignmentIndex < serviceStaffAssignments.length) {
            const serviceId = serviceStaffAssignments[currentAssignmentIndex].service.id;
            // Ensure we're updating the correct assignment and not creating duplicates
            onUpdateAssignment(serviceId, staff);
            
            // Update filteredStaff state to reflect the selection visually
            const selectedStaffId = staff ? staff.id : null;
            setFilteredStaff(prev => prev.map(member => ({
                ...member,
                selected: member.id === selectedStaffId
            })));
        }
    };

    // Move to next service assignment
    const handleNextAssignment = () => {
        if (currentAssignmentIndex < serviceStaffAssignments.length - 1) {
            setCurrentAssignmentIndex(currentAssignmentIndex + 1);
        } else {
            // All assignments completed, move to next step
            onNext();
        }
    };

    // Move to previous service assignment
    const handlePrevAssignment = () => {
        if (currentAssignmentIndex > 0) {
            setCurrentAssignmentIndex(currentAssignmentIndex - 1);
        } else {
            // Go back to step 1
            setCurrentStep(1);
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
                            <Users className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-bold font-headline">Select Professionals</h2>
                    </div>
                    <p className="text-muted-foreground">Choose your preferred stylist for each service.</p>
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
                        <h2 className="text-3xl font-bold font-headline">Select Professionals</h2>
                    </div>
                    <p className="text-muted-foreground">Choose your preferred stylist for each service.</p>
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

    // No services selected
    if (serviceStaffAssignments.length === 0) {
        return (
            <div className="w-full">
                <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} />
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <Users className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-bold font-headline">Select Professionals</h2>
                    </div>
                    <p className="text-muted-foreground">Choose your preferred stylist for each service.</p>
                </div>
                
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-4">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                        <p className="text-muted-foreground">No services selected. Please go back and select services.</p>
                    </div>
                </div>
            </div>
        );
    }

    const currentAssignment = serviceStaffAssignments[currentAssignmentIndex];
    const selectedStaff = currentAssignment?.staff;

    return (
        <div className="w-full">
            <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} />
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                        <Users className="h-6 w-6" />
                    </div>
                    <h2 className="text-3xl font-bold font-headline">Select Professionals</h2>
                </div>
                <p className="text-muted-foreground">Choose your preferred stylist for each service.</p>
            </div>

            {/* Progress indicator */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                        Service {currentAssignmentIndex + 1} of {serviceStaffAssignments.length}
                    </span>
                    <span className="text-sm font-medium text-primary">
                        {currentAssignment?.service?.name}
                    </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${((currentAssignmentIndex + 1) / serviceStaffAssignments.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {/* Any Professional Card */}
                <div 
                    className={cn(
                        'group relative aspect-square p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 rounded-2xl border-2',
                        !serviceStaffAssignments[currentAssignmentIndex]?.staff ? 'border-primary bg-primary/5 shadow-lg' : 'border-dashed border-border hover:border-primary/50 hover:bg-secondary/50'
                    )}
                    onClick={() => handleSelectStaff(null)}
                >
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4 border-2 border-dashed border-border group-hover:border-primary/50 transition-colors">
                        <Users className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="font-semibold text-foreground">Any Professional</h3>
                    <p className="text-sm text-muted-foreground">We'll assign an available expert.</p>
                    {!serviceStaffAssignments[currentAssignmentIndex]?.staff && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                    )}
                </div>
                {/* Staff Member Cards */}
                {filteredStaff && filteredStaff.length > 0 ? filteredStaff.map((staffMember: StaffMember) => {
                  // Check if this staff member is selected for the current service
                  const isCurrentStaffSelected = serviceStaffAssignments[currentAssignmentIndex]?.staff?.id === staffMember.id;
                  
                  return (
                    <div 
                        key={staffMember.id}
                        className={cn(
                            'group relative aspect-square p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 rounded-2xl border-2 overflow-hidden',
                            isCurrentStaffSelected ? 'border-primary bg-primary/5 shadow-lg' : 'border-border/50 hover:border-primary/50 hover:bg-secondary/50'
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
                        {isCurrentStaffSelected && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                                <CheckCircle className="h-4 w-4" />
                            </div>
                        )}
                    </div>
                  );
                }) : (
                    <div className="col-span-full flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-4">
                            <Users className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No staff members available for this service. You can still book with any professional.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between">
                <button
                    onClick={handlePrevAssignment}
                    className="px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                    {currentAssignmentIndex === 0 ? 'Back to Services' : 'Previous Service'}
                </button>
                <button
                    onClick={handleNextAssignment}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
                >
                    {currentAssignmentIndex === serviceStaffAssignments.length - 1 ? 'Select Time Slot' : 'Next Service'}
                </button>
            </div>
        </div>
    );
}