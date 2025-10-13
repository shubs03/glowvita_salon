"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Calendar, Clock, Search, User, MapPin, Video, Phone, Star } from 'lucide-react';
import { cn } from '@repo/ui/cn';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  consultationType: 'In-person' | 'Video Call' | 'Both';
}

interface DoctorSchedule {
  doctorId: string;
  doctorName: string;
  specialty: string;
  profileImage?: string;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  clinic: string;
  address: string;
  schedule: {
    [date: string]: TimeSlot[];
  };
}

const sampleSchedules: DoctorSchedule[] = [
  {
    doctorId: "DR-001",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Dermatology",
    rating: 4.9,
    reviewCount: 156,
    consultationFee: 200,
    clinic: "Skin Care Clinic",
    address: "123 Medical Center, Downtown",
    schedule: {
      "2024-03-15": [
        { id: "slot-1", time: "09:00 AM", available: true, consultationType: "Both" },
        { id: "slot-2", time: "10:00 AM", available: false, consultationType: "In-person" },
        { id: "slot-3", time: "11:00 AM", available: true, consultationType: "Video Call" },
        { id: "slot-4", time: "02:00 PM", available: true, consultationType: "Both" },
        { id: "slot-5", time: "03:00 PM", available: true, consultationType: "In-person" },
        { id: "slot-6", time: "04:00 PM", available: false, consultationType: "Both" }
      ],
      "2024-03-16": [
        { id: "slot-7", time: "09:00 AM", available: true, consultationType: "Video Call" },
        { id: "slot-8", time: "10:30 AM", available: true, consultationType: "Both" },
        { id: "slot-9", time: "11:30 AM", available: false, consultationType: "In-person" },
        { id: "slot-10", time: "02:30 PM", available: true, consultationType: "Both" },
        { id: "slot-11", time: "04:00 PM", available: true, consultationType: "Video Call" }
      ],
      "2024-03-17": [
        { id: "slot-12", time: "10:00 AM", available: true, consultationType: "Both" },
        { id: "slot-13", time: "11:00 AM", available: true, consultationType: "In-person" },
        { id: "slot-14", time: "01:00 PM", available: false, consultationType: "Both" },
        { id: "slot-15", time: "03:00 PM", available: true, consultationType: "Video Call" }
      ]
    }
  },
  {
    doctorId: "DR-002",
    doctorName: "Dr. Michael Chen",
    specialty: "General Medicine",
    rating: 4.7,
    reviewCount: 234,
    consultationFee: 150,
    clinic: "Family Health Center",
    address: "456 Health St, Medical District",
    schedule: {
      "2024-03-15": [
        { id: "slot-16", time: "08:30 AM", available: true, consultationType: "Both" },
        { id: "slot-17", time: "09:30 AM", available: true, consultationType: "In-person" },
        { id: "slot-18", time: "10:30 AM", available: false, consultationType: "Video Call" },
        { id: "slot-19", time: "01:30 PM", available: true, consultationType: "Both" },
        { id: "slot-20", time: "03:30 PM", available: true, consultationType: "Both" }
      ],
      "2024-03-16": [
        { id: "slot-21", time: "09:00 AM", available: false, consultationType: "In-person" },
        { id: "slot-22", time: "11:00 AM", available: true, consultationType: "Both" },
        { id: "slot-23", time: "02:00 PM", available: true, consultationType: "Video Call" },
        { id: "slot-24", time: "04:30 PM", available: true, consultationType: "Both" }
      ]
    }
  }
];

export default function DoctorSchedulePage() {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>(sampleSchedules);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('2024-03-15');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [consultationType, setConsultationType] = useState('all');
  const [selectedSlot, setSelectedSlot] = useState<{ doctorId: string; slotId: string } | null>(null);

  const availableDates = ['2024-03-15', '2024-03-16', '2024-03-17', '2024-03-18', '2024-03-19'];
  const specialties = Array.from(new Set(schedules.map(s => s.specialty)));

  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      const matchesSearch = schedule.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          schedule.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = selectedSpecialty === 'all' || schedule.specialty === selectedSpecialty;
      
      return matchesSearch && matchesSpecialty;
    });
  }, [schedules, searchTerm, selectedSpecialty]);

  const handleSlotSelect = (doctorId: string, slotId: string) => {
    setSelectedSlot({ doctorId, slotId });
  };

  const getSlotIcon = (type: string) => {
    switch (type) {
      case 'Video Call':
        return <Video className="h-3 w-3" />;
      case 'In-person':
        return <MapPin className="h-3 w-3" />;
      default:
        return <Phone className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTotalAvailableSlots = (schedule: DoctorSchedule) => {
    const slots = schedule.schedule[selectedDate] || [];
    return slots.filter(slot => {
      const available = slot.available;
      const typeMatch = consultationType === 'all' || 
                       slot.consultationType === consultationType || 
                       slot.consultationType === 'Both';
      return available && typeMatch;
    }).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Availability</h1>
          <p className="text-gray-600 mt-2">Check available time slots and book your appointment</p>
        </div>

        {/* Date Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
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
            <p className="text-sm text-gray-600 mt-2">
              Selected: {formatDate(selectedDate)}
            </p>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search doctors by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {specialties.map(specialty => (
                <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={consultationType} onValueChange={setConsultationType}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="In-person">In-person Only</SelectItem>
              <SelectItem value="Video Call">Video Call Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Schedule Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {filteredSchedules.reduce((total, schedule) => total + getTotalAvailableSlots(schedule), 0)}
                </p>
                <p className="text-sm text-gray-600">Available Slots</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredSchedules.length}</p>
                <p className="text-sm text-gray-600">Doctors Available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Video className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {filteredSchedules.reduce((total, schedule) => {
                    const slots = schedule.schedule[selectedDate] || [];
                    return total + slots.filter(slot => 
                      slot.available && (slot.consultationType === 'Video Call' || slot.consultationType === 'Both')
                    ).length;
                  }, 0)}
                </p>
                <p className="text-sm text-gray-600">Video Consultations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Schedules */}
      <div className="space-y-4">
        {filteredSchedules.map((schedule) => {
          const daySlots = schedule.schedule[selectedDate] || [];
          const availableSlots = daySlots.filter(slot => {
            const available = slot.available;
            const typeMatch = consultationType === 'all' || 
                             slot.consultationType === consultationType || 
                             slot.consultationType === 'Both';
            return available && typeMatch;
          });

          return (
            <Card key={schedule.doctorId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Doctor Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{schedule.doctorName}</h3>
                        <p className="text-gray-600">{schedule.specialty}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{schedule.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500">({schedule.reviewCount} reviews)</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{schedule.clinic}</p>
                        <p className="text-sm font-medium text-green-600">${schedule.consultationFee} consultation</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {availableSlots.length} slots available
                    </Badge>
                  </div>

                  {/* Time Slots */}
                  {daySlots.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No appointments available on this date</p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-medium mb-3">Available Time Slots</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {daySlots.map((slot) => {
                          const isAvailable = slot.available;
                          const typeMatch = consultationType === 'all' || 
                                           slot.consultationType === consultationType || 
                                           slot.consultationType === 'Both';
                          const isSelectable = isAvailable && typeMatch;
                          const isSelected = selectedSlot?.doctorId === schedule.doctorId && 
                                           selectedSlot?.slotId === slot.id;

                          return (
                            <Button
                              key={slot.id}
                              variant={isSelected ? "default" : isSelectable ? "outline" : "ghost"}
                              size="sm"
                              disabled={!isSelectable}
                              onClick={() => isSelectable && handleSlotSelect(schedule.doctorId, slot.id)}
                              className={cn(
                                "flex flex-col items-center p-3 h-auto",
                                !isSelectable && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <span className="text-xs font-medium">{slot.time}</span>
                              <div className="flex items-center gap-1 mt-1">
                                {getSlotIcon(slot.consultationType)}
                                <span className="text-xs">
                                  {slot.consultationType === 'Both' ? 'Both' : 
                                   slot.consultationType === 'Video Call' ? 'Video' : 'In-person'}
                                </span>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {availableSlots.length > 0 && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1"
                        disabled={!selectedSlot || selectedSlot.doctorId !== schedule.doctorId}
                      >
                        Book Selected Slot
                      </Button>
                      <Button variant="outline">
                        View Profile
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredSchedules.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or select a different date.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span>Video Call</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>In-person</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>Both Options</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}