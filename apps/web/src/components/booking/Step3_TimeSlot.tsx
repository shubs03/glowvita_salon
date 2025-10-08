
"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '@repo/ui/button';
import { Label } from '@repo/ui/label';
import { addDays, format, isSameDay, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Users, Clock, Loader2, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { cn } from '@repo/ui/cn';
import { StaffMember, WorkingHours } from '@/hooks/useBookingData';

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

interface Step3TimeSlotProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    selectedTime: string | null;
    onSelectTime: (time: string | null) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    selectedStaff: StaffMember | null;
    onSelectStaff: (staff: StaffMember | null) => void;
    staff: StaffMember[];
    workingHours: WorkingHours[];
    isLoading: boolean;
    error?: any;
}

// Helper function to generate time slots based on working hours
const generateTimeSlots = (startTime: string, endTime: string, interval: number = 30): string[] => {
    const slots: string[] = [];
    const start = new Date(`2023-01-01 ${startTime}`);
    const end = new Date(`2023-01-01 ${endTime}`);
    
    let current = new Date(start);
    while (current < end) {
        slots.push(format(current, 'HH:mm'));
        current.setMinutes(current.getMinutes() + interval);
    }
    
    return slots;
};

// Helper function to get day name from date
const getDayName = (date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[getDay(date)];
};

export function Step3_TimeSlot({
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  currentStep,
  setCurrentStep,
  selectedStaff,
  onSelectStaff,
  staff,
  workingHours,
  isLoading,
  error
}: Step3TimeSlotProps) {
  const dateScrollerRef = useRef<HTMLDivElement>(null);




  // Generate available dates (next 60 days)
  const dates = useMemo(() => Array.from({ length: 60 }, (_, i) => addDays(new Date(), i)), []);
  
  const currentMonthYear = useMemo(() => format(selectedDate, 'MMMM yyyy'), [selectedDate]);


  // Generate available time slots based on working hours for selected date
  const availableTimeSlots = useMemo(() => {
    console.log('Step3_TimeSlot - Working Hours Details:', {
      selectedDate: format(selectedDate, 'EEEE, MMM d, yyyy'),
      workingHours: workingHours
    });
    
    if (!workingHours || workingHours.length === 0) {
      // Fallback to default time slots if no working hours data
      return ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "16:00", "16:30", "17:00"];
    }

    const dayName = getDayName(selectedDate);
    
    const dayWorkingHours = workingHours.find(wh => 
      wh.dayOfWeek.toLowerCase() === dayName.toLowerCase()
    );

    if (!dayWorkingHours || !dayWorkingHours.isAvailable) {
      return [];
    }

    const slots = generateTimeSlots(dayWorkingHours.startTime, dayWorkingHours.endTime);
    
    return slots;
  }, [selectedDate, workingHours]);

  // Check if a date is available based on working hours
  const isDateAvailable = (date: Date): boolean => {
    if (!workingHours || workingHours.length === 0) return true;
    
    const dayName = getDayName(date);
    const dayWorkingHours = workingHours.find(wh => 
      wh.dayOfWeek.toLowerCase() === dayName.toLowerCase()
    );
    
    return dayWorkingHours?.isAvailable || false;
  };

  const handleDateScroll = (direction: 'left' | 'right') => {
    if (dateScrollerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      dateScrollerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Scroll the selected date into view
    const selectedDateElement = document.getElementById(`date-${format(selectedDate, 'yyyy-MM-dd')}`);
    if (selectedDateElement && dateScrollerRef.current) {
        const container = dateScrollerRef.current;
        const scrollLeft = selectedDateElement.offsetLeft - container.offsetLeft - (container.offsetWidth / 2) + (selectedDateElement.offsetWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [selectedDate]);

  useEffect(() => {
    // Clear selected time if it's not available for the new date
    if (selectedTime && !availableTimeSlots.includes(selectedTime)) {
      onSelectTime(null);
    }
  }, [selectedDate, availableTimeSlots, selectedTime, onSelectTime]);

  const allProfessionals = [{ id: 'any', name: 'Any Professional' }, ...(staff || [])];

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full">
        <Breadcrumb currentStep={currentStep} setCurrentStep={setCurrentStep} />
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Calendar className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold font-headline">Select a Date & Time</h2>
          </div>
          <p className="text-muted-foreground">Choose a date and time slot that works for you.</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading available time slots...</p>
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
              <Calendar className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold font-headline">Select a Date & Time</h2>
          </div>
          <p className="text-muted-foreground">Choose a date and time slot that works for you.</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-muted-foreground">Unable to load time slots. Please try again.</p>
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
                    <Calendar className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold font-headline">Select a Date & Time</h2>
            </div>
            <p className="text-muted-foreground">Choose a date and time slot that works for you.</p>
        </div>

        {/* Staff Selector */}
        <div className="mb-6 max-w-sm">
            <Label htmlFor="staff-select" className="text-sm font-medium">Professional</Label>
            <Select 
                value={selectedStaff?.id || 'any'} 
                onValueChange={(staffId) => {
                    const foundStaff = allProfessionals.find(s => s.id === staffId);
                    if (foundStaff?.id === 'any') {
                        onSelectStaff(null);
                    } else {
                        onSelectStaff(foundStaff as StaffMember || null);
                    }
                }}
            >
                <SelectTrigger id="staff-select" className="mt-1">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <SelectValue />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {allProfessionals.map((professionalItem: any) => (
                        <SelectItem key={professionalItem.id} value={professionalItem.id}>
                            {professionalItem.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        
        {/* Date Scroller with Month and Navigation */}
        <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{currentMonthYear}</h3>
            <div className="flex gap-1">
                 <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDateScroll('left')}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                 <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDateScroll('right')}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
        <div id="date-scroller" ref={dateScrollerRef} className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
            {dates.map((date: Date) => {
                const isAvailable = isDateAvailable(date);
                return (
                    <Button
                        key={date.toISOString()}
                        id={`date-${format(date, 'yyyy-MM-dd')}`}
                        variant={isSameDay(date, selectedDate) ? 'default' : 'outline'}
                        className={cn(
                            "flex flex-col h-auto px-4 py-2 flex-shrink-0 rounded-xl shadow-sm",
                            !isAvailable && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => isAvailable && onSelectDate(date)}
                        disabled={!isAvailable}
                    >
                        <span className="font-semibold">{format(date, 'EEE')}</span>
                        <span className="text-2xl font-bold my-1">{format(date, 'd')}</span>
                        <span className="text-xs">{format(date, 'MMM')}</span>
                    </Button>
                );
            })}
        </div>

        {/* Time Slots */}
        <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
                 <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <Clock className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg">Available Slots for {format(selectedDate, 'MMMM d')}</h3>
            </div>
            <div className="max-h-64 overflow-y-auto pr-2 no-scrollbar">
                {availableTimeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {availableTimeSlots.map((time: string) => (
                            <Button
                                key={time}
                                variant={selectedTime === time ? 'default' : 'outline'}
                                className="h-12 text-base font-semibold rounded-lg shadow-sm"
                                onClick={() => onSelectTime(time)}
                            >
                                {time}
                            </Button>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center gap-2">
                            <Clock className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No available time slots for this date.</p>
                            <p className="text-sm text-muted-foreground">Please select a different date.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
