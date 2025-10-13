"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Calendar, Clock, User, MapPin, Search, Filter, Stethoscope, Star, Phone, Mail, Video } from 'lucide-react';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { cn } from '@repo/ui/cn';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviewCount: number;
  availability: string[];
  clinicName: string;
  clinicAddress: string;
  consultationFee: number;
  profileImage?: string;
  phone: string;
  email: string;
  videoConsultation: boolean;
}

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'In-person' | 'Video Call';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  fee: number;
  clinic: string;
  address: string;
  notes?: string;
}

const sampleDoctors: Doctor[] = [
  {
    id: "DR-001",
    name: "Dr. Sarah Johnson",
    specialty: "Dermatology",
    experience: "8 years",
    rating: 4.9,
    reviewCount: 156,
    availability: ["Morning", "Afternoon"],
    clinicName: "Skin Care Clinic",
    clinicAddress: "123 Medical Center, Downtown",
    consultationFee: 200,
    phone: "+1 (555) 123-4567",
    email: "dr.sarah@clinic.com",
    videoConsultation: true,
    profileImage: "/placeholder-doctor.jpg"
  },
  {
    id: "DR-002",
    name: "Dr. Michael Chen",
    specialty: "General Medicine",
    experience: "12 years",
    rating: 4.8,
    reviewCount: 234,
    availability: ["Morning", "Evening"],
    clinicName: "Family Health Center",
    clinicAddress: "456 Health St, Medical District",
    consultationFee: 150,
    phone: "+1 (555) 234-5678",
    email: "dr.chen@family.com",
    videoConsultation: true,
    profileImage: "/placeholder-doctor.jpg"
  }
];

const sampleAppointments: Appointment[] = [
  {
    id: "APT-001",
    doctorId: "DR-001",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Dermatology",
    date: "2024-03-15",
    time: "10:00 AM",
    type: "In-person",
    status: "Scheduled",
    fee: 200,
    clinic: "Skin Care Clinic",
    address: "123 Medical Center, Downtown",
    notes: "Skin consultation for acne treatment"
  },
  {
    id: "APT-002",
    doctorId: "DR-002",
    doctorName: "Dr. Michael Chen",
    specialty: "General Medicine",
    date: "2024-03-20",
    time: "02:30 PM",
    type: "Video Call",
    status: "Scheduled",
    fee: 150,
    clinic: "Family Health Center",
    address: "456 Health St, Medical District",
    notes: "Follow-up consultation"
  }
];

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(sampleAppointments);
  const [doctors, setDoctors] = useState<Doctor[]>(sampleDoctors);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('all');
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    type: 'In-person' as 'In-person' | 'Video Call',
    notes: ''
  });

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
      const matchesTimeSlot = selectedTimeSlot === 'all' || doctor.availability.includes(selectedTimeSlot);
      
      return matchesSearch && matchesSpecialty && matchesTimeSlot;
    });
  }, [doctors, searchTerm, selectedSpecialty, selectedTimeSlot]);

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingDialog(true);
  };

  const handleSubmitBooking = () => {
    if (selectedDoctor && bookingData.date && bookingData.time) {
      const newAppointment: Appointment = {
        id: `APT-${Date.now()}`,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: bookingData.date,
        time: bookingData.time,
        type: bookingData.type,
        status: 'Scheduled',
        fee: selectedDoctor.consultationFee,
        clinic: selectedDoctor.clinicName,
        address: selectedDoctor.clinicAddress,
        notes: bookingData.notes
      };
      
      setAppointments([...appointments, newAppointment]);
      setShowBookingDialog(false);
      setBookingData({ date: '', time: '', type: 'In-person', notes: '' });
      setSelectedDoctor(null);
    }
  };

  const specialties = Array.from(new Set(doctors.map(doctor => doctor.specialty)));
  const timeSlots = ['Morning', 'Afternoon', 'Evening'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-600 mt-2">Schedule a consultation with our qualified doctors</p>
        </div>

        {/* Search and Filters */}
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
          <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Time Slot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Times</SelectItem>
              {timeSlots.map(slot => (
                <SelectItem key={slot} value={slot}>{slot}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Current Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Your Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No appointments scheduled yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{appointment.doctorName}</h3>
                          <Badge variant="outline">{appointment.specialty}</Badge>
                          <Badge variant={appointment.status === 'Scheduled' ? 'default' : 'secondary'}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {appointment.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {appointment.time}
                          </span>
                          <span className="flex items-center gap-1">
                            {appointment.type === 'Video Call' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                            {appointment.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{appointment.clinic} - ${appointment.fee}</p>
                        {appointment.notes && (
                          <p className="text-sm italic text-gray-500">{appointment.notes}</p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Doctors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Available Doctors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{doctor.name}</h3>
                        <p className="text-sm text-gray-600">{doctor.specialty}</p>
                        <p className="text-xs text-gray-500">{doctor.experience} experience</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{doctor.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({doctor.reviewCount} reviews)</span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">${doctor.consultationFee} consultation</p>
                      <p className="text-sm text-gray-600">{doctor.clinicName}</p>
                      <div className="flex flex-wrap gap-1">
                        {doctor.availability.map(slot => (
                          <Badge key={slot} variant="outline" className="text-xs">
                            {slot}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleBookAppointment(doctor)}
                        className="flex-1"
                        size="sm"
                      >
                        Book Appointment
                      </Button>
                      {doctor.videoConsultation && (
                        <Button variant="outline" size="sm">
                          <Video className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              Schedule a consultation with {selectedDoctor?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Preferred Date</Label>
              <Input
                id="date"
                type="date"
                value={bookingData.date}
                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Preferred Time</Label>
              <Select value={bookingData.time} onValueChange={(value) => setBookingData({ ...bookingData, time: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                  <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                  <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                  <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                  <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                  <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Consultation Type</Label>
              <Select value={bookingData.type} onValueChange={(value: 'In-person' | 'Video Call') => setBookingData({ ...bookingData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In-person">In-person</SelectItem>
                  {selectedDoctor?.videoConsultation && (
                    <SelectItem value="Video Call">Video Call</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Describe your symptoms or reason for visit..."
                value={bookingData.notes}
                onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitBooking}>
              Book Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}