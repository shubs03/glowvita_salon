"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@repo/ui/cn';
import { User, Users, CheckCircle, ChevronRight, Loader2, AlertCircle, Star, StarHalf, Plus, X, Clock, Users2 } from 'lucide-react';
import { StaffMember, Service, ServiceStaffAssignment, isStaffCompatibleWithService } from '@/hooks/useBookingData';

// Default profile image shown when a staff member has no photo (or the photo fails to load).
// Place your actual asset at this path in /public, e.g. public/images/default-profile.png
const DEFAULT_PROFILE_IMAGE = '/images/admin.png';

// Renders a 5-star rating, filling full/half/empty stars based on a numeric rating (e.g. 4.5 -> 4 full + 1 half)
const StarRating = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: fullStars }).map((_, i) => (
                <Star key={`full-${i}`} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            ))}
            {hasHalfStar && (
                <StarHalf className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            )}
            {Array.from({ length: Math.max(emptyStars, 0) }).map((_, i) => (
                <Star key={`empty-${i}`} className="h-3.5 w-3.5 text-muted-foreground/30" />
            ))}
        </div>
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
    bookingMode?: 'salon' | 'home' | string;
}

export function Step2_MultiService({
    serviceStaffAssignments,
    onUpdateAssignment,
    currentStep,
    setCurrentStep,
    staff,
    isLoading,
    error,
    onNext,
    bookingMode
}: Step2MultiServiceProps): JSX.Element {

    // State to track which service is currently being assigned
    const [currentAssignmentIndex, setCurrentAssignmentIndex] = useState(0);
    const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
    // Tracks which staff photos failed to load, so we can fall back to the default profile image
    const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

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
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <Users className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-bold font-headline">Select Professionals</h2>
                    </div>
                    <p className="text-black">Choose your preferred stylist for each service.</p>
                </div>

                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-black">Loading staff members...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="w-full">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <Users className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-bold font-headline">Select Professionals</h2>
                    </div>
                    <p className="text-black">Choose your preferred stylist for each service.</p>
                </div>

                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-4">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                        <p className="text-black">Unable to load staff members. Please try again.</p>
                    </div>
                </div>
            </div>
        );
    }

    // No services selected
    if (serviceStaffAssignments.length === 0) {
        return (
            <div className="w-full">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <Users className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-bold font-headline">Select Professionals</h2>
                    </div>
                    <p className="text-black">Choose your preferred stylist for each service.</p>
                </div>

                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-4">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                        <p className="text-black">No services selected. Please go back and select services.</p>
                    </div>
                </div>
            </div>
        );
    }

    const currentAssignment = serviceStaffAssignments[currentAssignmentIndex];
    const selectedStaff = currentAssignment?.staff;

    return (
        <div className="w-full">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-1 cursor-pointer w-fit" onClick={() => setCurrentStep(currentStep - 1)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/back 1.png" alt="back" className="h-5 w-5" />
                    <h2 className="text-2xl font-bold font-headline">Select Professionals</h2>
                </div>
                <p className="text-black pl-7">Choose your preferred stylist for each service.</p>
            </div>

            {/* Progress indicator */}
            <div className="mb-6">
                <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-black mt-0.5">
                        Service {currentAssignmentIndex + 1} of {serviceStaffAssignments.length}
                    </span>
                    <div className="text-right">
                        <span className="text-sm font-medium text-primary block">
                            {currentAssignment?.service?.name}
                        </span>
                        {currentAssignment?.service?.selectedAddons && currentAssignment.service.selectedAddons.length > 0 && (
                            <span className="text-xs text-black block mt-0.5">
                                + {currentAssignment.service.selectedAddons.map(a => a.name).join(', ')}
                            </span>
                        )}
                    </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                    <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentAssignmentIndex + 1) / serviceStaffAssignments.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Vertical staff list */}
            <div className="flex flex-col gap-4 mb-8">
                {/* Any Professional Row */}
                <div
                    className={cn(
                        'group relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden',
                        !serviceStaffAssignments[currentAssignmentIndex]?.staff
                            ? 'border-primary shadow-lg'
                            : 'border-dashed border-border hover:border-primary/50 hover:bg-secondary/50'
                    )}
                    style={!serviceStaffAssignments[currentAssignmentIndex]?.staff ? { background: 'linear-gradient(90deg, #EBF3FD 0%, #FFFFFF 100%)' } : undefined}
                    onClick={() => handleSelectStaff(null)}
                >
                    {!serviceStaffAssignments[currentAssignmentIndex]?.staff && (
                        <span
                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl"
                            style={{ background: '#422A3C' }}
                        />
                    )}
                    <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden shadow-md">
                        <Image src="/images/profile (7) 1.png" alt="Any Professional" width={112} height={112} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <h3 className="font-semibold text-foreground">Any Professional</h3>
                        <p className="text-sm text-black">We'll assign an available expert.</p>
                    </div>
                    {!serviceStaffAssignments[currentAssignmentIndex]?.staff && (
                        <span
                            className="shrink-0 px-4 py-1.5 rounded-full text-white text-sm font-medium"
                            style={{ background: '#087326' }}
                        >
                            Selected
                        </span>
                    )}
                </div>

                {/* Staff Member Rows */}
                {filteredStaff && filteredStaff.length > 0 ? filteredStaff.map((staffMember: StaffMember) => {
                    // Check if this staff member is selected for the current service
                    const isCurrentStaffSelected = serviceStaffAssignments[currentAssignmentIndex]?.staff?.id === staffMember.id;
                    // Optional fields
                    const experience = staffMember.yearOfExperience;
                    const clients = staffMember.clientsServed;
                    const imageSrc = brokenImages[staffMember.id] || !staffMember.image
                        ? DEFAULT_PROFILE_IMAGE
                        : staffMember.image;

                    return (
                        <div
                            key={staffMember.id}
                            className={cn(
                                'group relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden',
                                isCurrentStaffSelected
                                    ? 'border-primary shadow-lg'
                                    : 'border-border/50 hover:border-primary/50 hover:bg-secondary/50'
                            )}
                            style={isCurrentStaffSelected ? { background: 'linear-gradient(90deg, #EBF3FD 0%, #FFFFFF 100%)' } : undefined}
                            onClick={() => handleSelectStaff(staffMember)}
                        >
                            {isCurrentStaffSelected && (
                                <span
                                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl"
                                    style={{ background: '#422A3C' }}
                                />
                            )}
                            <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden shadow-md">
                                <Image
                                    src={imageSrc}
                                    alt={staffMember.name}
                                    width={112}
                                    height={112}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint="professional staff portrait"
                                    onError={() => setBrokenImages(prev => ({ ...prev, [staffMember.id]: true }))}
                                />
                            </div>

                            <div className="flex-1 min-w-0 text-left">
                                <h3 className="font-semibold text-foreground">{staffMember.name}</h3>
                                <p className="text-sm text-black">{staffMember.role}</p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                    {staffMember.rating && (
                                        <div className="flex items-center gap-1">
                                            <StarRating rating={staffMember.rating} />
                                            <span className="text-xs text-black">
                                                {staffMember.rating}
                                                {(staffMember as any).reviewCount ? ` (${(staffMember as any).reviewCount} reviews)` : ''}
                                            </span>
                                        </div>
                                    )}
                                    {experience ? (
                                        <div className="flex items-center gap-1">
                                            <img src="/images/suitcase.png" alt="experience" className="h-3.5 w-3.5 object-contain" />
                                            <span className="text-sm text-black">({experience}) Years of experience</span>
                                        </div>
                                    ) : null}
                                    {clients ? (
                                        <div className="flex items-center gap-1">
                                            <img src="/images/customer 11.png" alt="customer" className="h-3.5 w-3.5 object-contain" />
                                            <span className="text-sm text-black">{clients} Clients</span>
                                        </div>
                                    ) : null}
                                </div>
                                {staffMember.specialties && staffMember.specialties.length > 0 && (
                                    <p className="text-xs text-black truncate mt-1">
                                        {staffMember.specialties.slice(0, 2).join(', ')}
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectStaff(staffMember);
                                }}
                                className={cn(
                                    'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                                    !isCurrentStaffSelected && 'border border-border text-foreground hover:border-primary/50 hover:bg-secondary/50'
                                )}
                                style={isCurrentStaffSelected ? { background: '#087326', color: '#fff' } : undefined}
                            >
                                {isCurrentStaffSelected ? 'Selected' : 'Select'}
                            </button>
                        </div>
                    );
                }) : (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-4">
                            <Users className="h-8 w-8 text-muted-foreground" />
                            <p className="text-black">No staff members available for this service. You can still book with any professional.</p>
                        </div>
                    </div>
                )}


            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-border">
                <button
                    onClick={handlePrevAssignment}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                >
                    <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                    {currentAssignmentIndex === 0 ? 'Back to Services' : 'Previous Service'}
                </button>

                <div className="flex items-center gap-2">
                    {serviceStaffAssignments.length > 1 && (
                        <span className="text-sm text-black hidden sm:inline">
                            {serviceStaffAssignments.filter(a => a.staff !== null).length} of {serviceStaffAssignments.length} assigned
                        </span>
                    )}
                    {currentAssignmentIndex !== serviceStaffAssignments.length - 1 && (
                        <button
                            onClick={handleNextAssignment}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 sm:ml-auto"
                        >
                            Next Service
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
