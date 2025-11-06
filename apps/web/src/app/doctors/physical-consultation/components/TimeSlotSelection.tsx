"use client";

import { useState, useMemo, useEffect } from 'react';
import { useGetBookedSlotsQuery } from '@repo/store/services/api';
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Calendar, Clock, MapPin, Star, User, Loader2, Lock } from "lucide-react";
import { cn } from '@repo/ui/cn';
import { ConsultationData } from '../page';
import { format, addDays } from 'date-fns';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface TimeSlotSelectionProps {
  data: ConsultationData;
  onUpdate: (updates: Partial<ConsultationData>) => void;
}

export default function TimeSlotSelection({ data, onUpdate }: TimeSlotSelectionProps) {
  const [selectedDate, setSelectedDate] = useState<string>(data.selectedDate || format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<{ doctorId: string; slotId: string } | null>(
    data.selectedDoctorId && data.selectedTime 
      ? { doctorId: data.selectedDoctorId, slotId: `slot-${data.selectedTime.replace(/[:\s]/g, '')}` } 
      : null
  );
  const [workingHours, setWorkingHours] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch booked slots for the selected date
  const { data: bookedSlotsData, isLoading: isLoadingBookedSlots } = useGetBookedSlotsQuery(
    { doctorId: data.selectedDoctorId, date: selectedDate },
    { skip: !data.selectedDoctorId || !selectedDate }
  );

  const bookedSlots = bookedSlotsData?.data?.bookedSlots || [];

  // Generate next 30 days for date selection
  const availableDates = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = addDays(new Date(), i);
      return format(date, 'yyyy-MM-dd');
    });
  }, []);

  // Fetch doctor working hours
  useEffect(() => {
    const fetchWorkingHours = async () => {
      if (!data.selectedDoctorId) {
        setError('No doctor selected');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/doctors/workinghours?doctorId=${data.selectedDoctorId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch working hours');
        }

        const hoursData = await response.json();
        console.log('Fetched working hours:', hoursData);
        setWorkingHours(hoursData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching working hours:', err);
        setError(err.message || 'Failed to load doctor schedule');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkingHours();
  }, [data.selectedDoctorId]);

  // Utility function to check if a time slot is in the past or currently in progress
  const isTimeSlotPastOrInProgress = (dateStr: string, timeString: string): boolean => {
    try {
      const now = new Date();
      const slotDate = new Date(dateStr);
      
      // Parse the time string (format: "HH:MM AM/PM")
      const timeMatch = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!timeMatch) return false;
      
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const meridiem = timeMatch[3].toUpperCase();
      
      // Convert to 24-hour format
      if (meridiem === 'PM' && hours !== 12) {
        hours += 12;
      } else if (meridiem === 'AM' && hours === 12) {
        hours = 0;
      }
      
      // Set the slot time
      slotDate.setHours(hours, minutes, 0, 0);
      
      // Calculate slot end time (consultation duration from working hours, default 20 minutes)
      const slotEndTime = new Date(slotDate.getTime() + 20 * 60 * 1000);
      
      // Check if slot has passed or is currently in progress
      // Hide if: current time >= slot start time (includes past and in-progress slots)
      return now >= slotDate;
    } catch (error) {
      console.error('Error checking time slot:', error);
      return false;
    }
  };

  // Generate time slots for a given date based on doctor's working hours
  // Each slot uses dynamic consultation duration with configurable gap (from API)
  const generateTimeSlotsForDate = useMemo(() => {
    if (!workingHours || !workingHours.workingHoursArray) {
      return {};
    }

    const slots: { [date: string]: TimeSlot[] } = {};
    
    // Get dynamic values from API, with defaults if not set
    const slotGap = workingHours.slotGap || 20;
    const consultationDuration = workingHours.consultationDuration || 20; // Dynamic consultation duration
    const totalSlotInterval = consultationDuration + slotGap; // Total time between slot starts

    availableDates.forEach(dateStr => {
      const date = new Date(dateStr);
      const dayName = format(date, 'EEEE'); // Monday, Tuesday, etc.

      // Find working hours for this day
      const dayWorkingHours = workingHours.workingHoursArray.find(
        (wh: any) => wh.day.toLowerCase() === dayName.toLowerCase()
      );

      if (!dayWorkingHours || !dayWorkingHours.isOpen || !dayWorkingHours.open || !dayWorkingHours.close) {
        slots[dateStr] = [];
        return;
      }

      // Parse start and end times
      const [startHour, startMinute] = dayWorkingHours.open.split(':').map(Number);
      const [endHour, endMinute] = dayWorkingHours.close.split(':').map(Number);

      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;

      const daySlots: TimeSlot[] = [];
      let currentTimeInMinutes = startTimeInMinutes;

      // Generate slots with proper spacing:
      // - Each slot uses consultationDuration (dynamic, e.g., 15, 20, 30 minutes)
      // - After consultation, there's a slotGap (buffer time)
      // - Next slot starts after: consultation duration + gap
      // Example with 20 min consultation + 10 min gap: 02:00 PM → 02:30 PM → 03:00 PM
      while (currentTimeInMinutes + consultationDuration <= endTimeInMinutes) {
        const slotHour = Math.floor(currentTimeInMinutes / 60);
        const slotMinute = currentTimeInMinutes % 60;

        // Convert to 12-hour format
        const isPM = slotHour >= 12;
        const displayHour = slotHour === 0 ? 12 : slotHour > 12 ? slotHour - 12 : slotHour;
        const timeString = `${displayHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;

        // Filter out past and in-progress time slots
        const isPastOrInProgress = isTimeSlotPastOrInProgress(dateStr, timeString);
        
        // Only add slot if it's not in the past or in progress
        if (!isPastOrInProgress) {
          // Check if this slot is already booked
          const isBooked = bookedSlots.includes(timeString);
          
          daySlots.push({
            id: `slot-${dateStr}-${currentTimeInMinutes}`,
            time: timeString,
            available: !isBooked // Mark as unavailable if booked
          });
        }

        // Move to next slot start: current + consultation duration + slot gap
        // This ensures proper spacing between consecutive bookings
        currentTimeInMinutes += totalSlotInterval;
      }

      slots[dateStr] = daySlots;
    });

    return slots;
  }, [workingHours, availableDates, bookedSlots]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleSlotSelect = (slotId: string, time: string) => {
    setSelectedSlot({ doctorId: data.selectedDoctorId!, slotId });
    
    onUpdate({
      selectedDate,
      selectedTime: time
    });
  };

  const getDoctorSchedule = () => {
    return generateTimeSlotsForDate[selectedDate] || [];
  };

  // Loading state
  if (isLoading || isLoadingBookedSlots) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {isLoadingBookedSlots ? "Checking slot availability..." : "Loading doctor's schedule..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-destructive">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-semibold mb-2">Failed to load schedule</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Select Time Slot</h2>
            <p className="text-muted-foreground">Choose a convenient date and time for your consultation</p>
          </div>
        </div>
      </div>

      {/* 2-Column Layout with improved spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Doctor Details */}
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5 text-primary" />
                Doctor Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{data.selectedDoctorName}</h3>
                  <p className="text-primary font-medium">{data.selectedDoctorSpecialty}</p>
                  {data.doctorRating && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{data.doctorRating}</span>
                      </div>
                      {data.doctorReviewCount && (
                        <span className="text-sm text-muted-foreground">({data.doctorReviewCount} reviews)</span>
                      )}
                    </div>
                  )}
                  {data.doctorClinic && (
                    <div className="flex items-center gap-1 mt-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{data.doctorClinic}</span>
                    </div>
                  )}
                  {data.consultationFee && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="font-bold text-lg">₹{data.consultationFee}</p>
                      <p className="text-sm text-muted-foreground">Consultation Fee</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Slot Preview */}
          {selectedSlot && data.selectedTime && (
            <Card className="h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="h-5 w-5 text-primary" />
                  Selected Appointment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        {formatDate(selectedDate)} at {data.selectedTime}
                      </p>
                      {data.doctorClinic && (
                        <p className="text-sm text-muted-foreground">
                          {data.doctorClinic}
                        </p>
                      )}
                    </div>
                    {data.consultationFee && (
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{data.consultationFee}</p>
                        <p className="text-xs text-muted-foreground">Total Fee</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Date Selection and Time Slots */}
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="h-5 w-5 text-primary" />
                Select Date & Time
              </CardTitle>
              <p className="text-sm text-muted-foreground">Choose a convenient date and time for your consultation</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div>
                <h4 className="font-medium mb-3">Available Dates</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableDates.slice(0, 6).map((date) => (
                    <Button
                      key={date}
                      variant={selectedDate === date ? "default" : "outline"}
                      onClick={() => setSelectedDate(date)}
                      className="p-3 h-auto flex flex-col items-center"
                    >
                      <span className="text-sm font-medium">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-xs">
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  Selected: {formatDate(selectedDate)}
                </p>
              </div>

              {/* Time Slots for Selected Date */}
              <div>
                <h4 className="font-medium mb-3">Available Time Slots</h4>
                {(() => {
                  const daySlots = getDoctorSchedule();
                  return daySlots.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Clock className="h-6 w-6 mx-auto mb-2" />
                      <p>No appointments available on this date</p>
                      <p className="text-xs mt-1">Doctor is not available on {format(new Date(selectedDate), 'EEEE')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {daySlots.map((slot) => {
                        const isAvailable = slot.available;
                        const isSelected = selectedSlot?.slotId === slot.id;

                        return (
                          <div key={slot.id} className="relative">
                            <Button
                              variant={isSelected ? "default" : isAvailable ? "outline" : "ghost"}
                              size="sm"
                              disabled={!isAvailable}
                              onClick={() => isAvailable && handleSlotSelect(slot.id, slot.time)}
                              className={cn(
                                "p-2 h-auto text-xs w-full",
                                !isAvailable && "opacity-50 cursor-not-allowed bg-muted"
                              )}
                            >
                              <div className="flex items-center gap-1 justify-center">
                                {!isAvailable && <Lock className="h-3 w-3" />}
                                {slot.time}
                              </div>
                            </Button>
                            {!isAvailable && (
                              <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded text-[10px] font-medium text-muted-foreground pointer-events-none">
                                Booked
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}