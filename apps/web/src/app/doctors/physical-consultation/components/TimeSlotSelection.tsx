"use client";

import { useState, useMemo } from 'react';
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Calendar, Clock, MapPin, Star, User } from "lucide-react";
import { cn } from '@repo/ui/cn';
import { ConsultationData } from '../page';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  clinic: string;
  address: string;
  schedule: {
    [date: string]: TimeSlot[];
  };
}

interface TimeSlotSelectionProps {
  data: ConsultationData;
  onUpdate: (updates: Partial<ConsultationData>) => void;
}

// Sample data for doctors and their schedules
const sampleDoctors: Doctor[] = [
  {
    id: "DR-001",
    name: "Dr. Sarah Johnson",
    specialty: "Dermatology",
    rating: 4.9,
    reviewCount: 156,
    consultationFee: 200,
    clinic: "Skin Care Clinic",
    address: "123 Medical Center, Downtown",
    schedule: {
      "2024-03-15": [
        { id: "slot-1", time: "09:00 AM", available: true },
        { id: "slot-2", time: "10:00 AM", available: false },
        { id: "slot-3", time: "11:00 AM", available: true },
        { id: "slot-4", time: "02:00 PM", available: true },
        { id: "slot-5", time: "03:00 PM", available: true },
        { id: "slot-6", time: "04:00 PM", available: false }
      ],
      "2024-03-16": [
        { id: "slot-7", time: "09:00 AM", available: true },
        { id: "slot-8", time: "10:30 AM", available: true },
        { id: "slot-9", time: "11:30 AM", available: false },
        { id: "slot-10", time: "02:30 PM", available: true },
        { id: "slot-11", time: "04:00 PM", available: true }
      ],
      "2024-03-17": [
        { id: "slot-12", time: "10:00 AM", available: true },
        { id: "slot-13", time: "11:00 AM", available: true },
        { id: "slot-14", time: "01:00 PM", available: false },
        { id: "slot-15", time: "03:00 PM", available: true }
      ]
    }
  },
  {
    id: "DR-002",
    name: "Dr. Michael Chen",
    specialty: "General Medicine",
    rating: 4.7,
    reviewCount: 234,
    consultationFee: 150,
    clinic: "Family Health Center",
    address: "456 Health St, Medical District",
    schedule: {
      "2024-03-15": [
        { id: "slot-16", time: "08:30 AM", available: true },
        { id: "slot-17", time: "09:30 AM", available: true },
        { id: "slot-18", time: "10:30 AM", available: false },
        { id: "slot-19", time: "01:30 PM", available: true },
        { id: "slot-20", time: "03:30 PM", available: true }
      ],
      "2024-03-16": [
        { id: "slot-21", time: "09:00 AM", available: false },
        { id: "slot-22", time: "11:00 AM", available: true },
        { id: "slot-23", time: "02:00 PM", available: true },
        { id: "slot-24", time: "04:30 PM", available: true }
      ]
    }
  }
];

export default function TimeSlotSelection({ data, onUpdate }: TimeSlotSelectionProps) {
  const [selectedDate, setSelectedDate] = useState<string>(data.selectedDate || '2024-03-15');
  const [selectedSlot, setSelectedSlot] = useState<{ doctorId: string; slotId: string } | null>(
    data.selectedDoctorId && data.selectedTime 
      ? { doctorId: data.selectedDoctorId, slotId: `slot-${data.selectedTime.replace(':', '')}` } 
      : null
  );

  // Find the selected doctor from sample data
  const selectedDoctor = sampleDoctors.find(doctor => doctor.id === data.selectedDoctorId) || sampleDoctors[0];

  const availableDates = ['2024-03-15', '2024-03-16', '2024-03-17', '2024-03-18', '2024-03-19'];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleSlotSelect = (doctorId: string, slotId: string, time: string) => {
    setSelectedSlot({ doctorId, slotId });
    
    // Find the selected doctor
    const doctor = sampleDoctors.find(d => d.id === doctorId);
    if (doctor) {
      onUpdate({
        selectedDate,
        selectedTime: time,
        selectedDoctorId: doctorId,
        selectedDoctorName: doctor.name,
        selectedDoctorSpecialty: doctor.specialty,
        consultationFee: doctor.consultationFee
      });
    }
  };

  const getDoctorSchedule = (doctor: Doctor) => {
    return doctor.schedule[selectedDate] || [];
  };

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
                  <h3 className="text-xl font-semibold">{selectedDoctor.name}</h3>
                  <p className="text-primary font-medium">{selectedDoctor.specialty}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{selectedDoctor.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({selectedDoctor.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{selectedDoctor.clinic}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="font-bold text-lg">₹{selectedDoctor.consultationFee}</p>
                    <p className="text-sm text-muted-foreground">Consultation Fee</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Slot Preview */}
          {selectedSlot && (
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
                      <p className="text-sm text-muted-foreground">
                        {selectedDoctor.clinic}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{data.consultationFee}</p>
                      <p className="text-xs text-muted-foreground">Total Fee</p>
                    </div>
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
                  {availableDates.map((date) => (
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

              {/* Time Slots for Selected Doctor */}
              <div>
                <h4 className="font-medium mb-3">Available Time Slots</h4>
                {(() => {
                  const daySlots = getDoctorSchedule(selectedDoctor);
                  return daySlots.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Clock className="h-6 w-6 mx-auto mb-2" />
                      <p>No appointments available on this date</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {daySlots.map((slot) => {
                        const isAvailable = slot.available;
                        const isSelected = selectedSlot?.doctorId === selectedDoctor.id && 
                                         selectedSlot?.slotId === slot.id;

                        return (
                          <Button
                            key={slot.id}
                            variant={isSelected ? "default" : isAvailable ? "outline" : "ghost"}
                            size="sm"
                            disabled={!isAvailable}
                            onClick={() => isAvailable && handleSlotSelect(selectedDoctor.id, slot.id, slot.time)}
                            className={cn(
                              "p-2 h-auto text-xs",
                              !isAvailable && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {slot.time}
                          </Button>
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