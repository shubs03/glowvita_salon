
"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@repo/ui/cn';
import { User, Users, CheckCircle, ChevronRight } from 'lucide-react';

const staffMembers = [
    { id: '1', name: 'Jessica Miller', role: 'Lead Stylist', image: 'https://picsum.photos/seed/staff1/400/400', hint: 'female stylist portrait' },
    { id: '2', name: 'Michael Chen', role: 'Massage Therapist', image: 'https://picsum.photos/seed/staff2/400/400', hint: 'male therapist portrait' },
    { id: '3', name: 'Emily White', role: 'Esthetician', image: 'https://picsum.photos/seed/staff3/400/400', hint: 'female esthetician portrait' },
];

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

export function Step2_Staff({ selectedStaff, onSelectStaff, currentStep, setCurrentStep }: { selectedStaff: any, onSelectStaff: (staff: any) => void; currentStep: number; setCurrentStep: (step: number) => void; }) => {

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
                    selectedStaff?.id === 'any' ? 'border-primary bg-primary/5 shadow-lg' : 'border-dashed border-border hover:border-primary/50 hover:bg-secondary/50'
                )}
                onClick={() => onSelectStaff({ id: 'any', name: 'Any Professional' })}
            >
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4 border-2 border-dashed border-border group-hover:border-primary/50 transition-colors">
                    <Users className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground">Any Professional</h3>
                <p className="text-sm text-muted-foreground">We'll assign an available expert.</p>
                {selectedStaff?.id === 'any' && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4" />
                    </div>
                )}
            </div>
            {/* Staff Member Cards */}
            {staffMembers.map(staff => (
                <div 
                    key={staff.id}
                    className={cn(
                        'group relative aspect-square p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 rounded-2xl border-2 overflow-hidden',
                        selectedStaff?.id === staff.id ? 'border-primary bg-primary/5 shadow-lg' : 'border-border/50 hover:border-primary/50 hover:bg-secondary/50'
                    )}
                    onClick={() => onSelectStaff(staff)}
                >
                    <div className="relative w-24 h-24 rounded-full mb-4 overflow-hidden shadow-md">
                        <Image 
                            src={staff.image} 
                            alt={staff.name} 
                            width={120} 
                            height={120} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={staff.hint}
                        />
                    </div>
                    <h3 className="font-semibold text-foreground">{staff.name}</h3>
                    <p className="text-sm text-muted-foreground">{staff.role}</p>
                    {selectedStaff?.id === staff.id && (
                         <div className="absolute top-3 right-3 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
}
