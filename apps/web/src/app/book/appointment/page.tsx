"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, X, Scissors, User, Calendar, Clock, MapPin, Star, Wallet, CreditCard, Hourglass, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@repo/ui/card";
import { Separator } from "@repo/ui/separator";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Mock data for demonstration
interface SalonData {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  address: string;
  image: string;
  description: string;
}

interface Service {
  id: string;
  name: string;
  duration: string;
  price: number;
  image: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  image: string;
  rating: number;
}

const salonData: SalonData = {
  id: "1",
  name: "GlowVita Elite Spa",
  rating: 4.9,
  reviews: 250,
  address: "123 Luxury Ave, Suite 100, Beverly Hills, CA 90210",
  image: "https://picsum.photos/seed/salon1/800/600",
  description: "An oasis of tranquility and relaxation, offering a wide range of beauty and wellness services."
};

const services: Service[] = [
  { id: "1", name: "Signature Facial", duration: "60 min", price: 150, image: "https://picsum.photos/seed/facial/200/200" },
  { id: "2", name: "Deep Tissue Massage", duration: "90 min", price: 120, image: "https://picsum.photos/seed/massage/200/200" },
  { id: "3", name: "Manicure & Pedicure", duration: "75 min", price: 80, image: "https://picsum.photos/seed/manicure/200/200" },
  { id: "4", name: "Hair Styling", duration: "45 min", price: 75, image: "https://picsum.photos/seed/haircut/200/200" },
  { id: "5", name: "Keratin Treatment", duration: "120 min", price: 250, image: "https://picsum.photos/seed/keratin/200/200" },
  { id: "6", name: "HydraFacial", duration: "75 min", price: 180, image: "https://picsum.photos/seed/hydra/200/200" },
];

const staffMembers: StaffMember[] = [
  { id: "1", name: "Jessica Miller", role: "Lead Stylist", image: "https://picsum.photos/seed/staff1/400/400", rating: 4.9 },
  { id: "2", name: "Michael Chen", role: "Massage Therapist", image: "https://picsum.photos/seed/staff2/400/400", rating: 4.8 },
  { id: "3", name: "Emily White", role: "Esthetician", image: "https://picsum.photos/seed/staff3/400/400", rating: 4.7 },
];

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
];

export default function BookAppointmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

  // Navigation functions
  const goToNextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const goToPrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  // Service selection
  const toggleService = (service: Service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  // Calculate total price
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const tax = totalPrice * 0.08; // 8% tax
  const finalTotal = totalPrice + tax;

  // Step components
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <ServiceSelectionStep services={services} selectedServices={selectedServices} toggleService={toggleService} />;
      case 2:
        return <StaffSelectionStep staffMembers={staffMembers} selectedStaff={selectedStaff} setSelectedStaff={setSelectedStaff} />;
      case 3:
        return <DateTimeSelectionStep
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          timeSlots={timeSlots}
        />;
      case 4:
        return <ConfirmationStep
          salon={salonData}
          selectedServices={selectedServices}
          selectedStaff={selectedStaff}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          totalPrice={totalPrice}
          tax={tax}
          finalTotal={finalTotal}
          onConfirm={() => setIsBookingConfirmed(true)}
        />;
      default:
        return null;
    }
  };

  // Progress bar
  const progressPercentage = (step / 4) * 100;

  if (isBookingConfirmed) {
    return <BookingConfirmationScreen salon={salonData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={goToPrevStep} className="flex items-center gap-2">
            <ChevronLeft className="h-5 w-5" />
            {step === 1 ? 'Back' : 'Back'}
          </Button>

          <div className="font-bold text-xl font-headline bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            GlowVita
          </div>

          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-6">
                {renderStepContent()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                {step > 1 && (
                  <Button variant="outline" onClick={goToPrevStep} className="px-6">
                    Previous
                  </Button>
                )}
                <Button
                  onClick={goToNextStep}
                  className="ml-auto px-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  disabled={step === 1 && selectedServices.length === 0}
                >
                  {step === 4 ? 'Confirm Booking' : 'Continue'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <BookingSummary
                salon={salonData}
                selectedServices={selectedServices}
                selectedStaff={selectedStaff}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                totalPrice={totalPrice}
                tax={tax}
                finalTotal={finalTotal}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Service Selection Step
const ServiceSelectionStep = ({
  services,
  selectedServices,
  toggleService
}: {
  services: Service[];
  selectedServices: Service[];
  toggleService: (service: Service) => void;
}) => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline mb-2">Select Your Services</h1>
        <p className="text-muted-foreground">Choose one or more services you'd like to book</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(service => {
          const isSelected = selectedServices.some(s => s.id === service.id);
          return (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all duration-300 border-2 ${isSelected
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-border hover:border-primary/50 hover:shadow-md'
                }`}
              onClick={() => toggleService(service)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.duration}</p>
                    <p className="font-bold text-primary mt-1">₹{service.price}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Staff Selection Step
const StaffSelectionStep = ({
  staffMembers,
  selectedStaff,
  setSelectedStaff
}: {
  staffMembers: StaffMember[];
  selectedStaff: StaffMember | null;
  setSelectedStaff: (staff: StaffMember | null) => void;
}) => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline mb-2">Select a Professional</h1>
        <p className="text-muted-foreground">Choose your preferred stylist or select any professional</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Any Professional Option */}
        <Card
          className={`cursor-pointer transition-all duration-300 border-2 ${!selectedStaff
              ? 'border-primary bg-primary/5 shadow-lg'
              : 'border-border hover:border-primary/50 hover:shadow-md'
            }`}
          onClick={() => setSelectedStaff(null)}
        >
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">Any Professional</h3>
            <p className="text-sm text-muted-foreground">We'll assign an available expert</p>
            {!selectedStaff && (
              <div className="mt-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center mx-auto">
                <CheckCircle className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staff Members */}
        {staffMembers.map(staff => (
          <Card
            key={staff.id}
            className={`cursor-pointer transition-all duration-300 border-2 ${selectedStaff?.id === staff.id
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-border hover:border-primary/50 hover:shadow-md'
              }`}
            onClick={() => setSelectedStaff(staff)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4">
                  <Image
                    src={staff.image}
                    alt={staff.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-semibold text-lg">{staff.name}</h3>
                <p className="text-sm text-muted-foreground">{staff.role}</p>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm ml-1">{staff.rating}</span>
                </div>
                {selectedStaff?.id === staff.id && (
                  <div className="mt-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Date & Time Selection Step
const DateTimeSelectionStep = ({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  timeSlots
}: {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
  timeSlots: string[];
}) => {
  // Generate next 30 days
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline mb-2">Select Date & Time</h1>
        <p className="text-muted-foreground">Choose a date and time slot that works for you</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Select Date
        </h2>
        <div className="flex overflow-x-auto pb-4 gap-2 sm:gap-3 scrollbar-hide">
          <div className="flex gap-2 sm:gap-3 w-max">
            {dates.map((date, index) => {
              const isSelected = selectedDate.toDateString() === date.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-300 transform hover:scale-105 flex-shrink-0 ${isSelected
                      ? 'border-primary bg-primary/10 shadow-lg ring-2 ring-primary/30'
                      : 'border-border hover:border-primary/50 hover:shadow-md hover:bg-primary/5'
                    } ${isToday ? 'ring-2 ring-accent' : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <CardContent className="p-2 text-center min-w-[70px] sm:min-w-[80px]">
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">{format(date, 'EEE')}</p>
                    <p className={`text-lg sm:text-xl font-bold my-1 ${isToday ? 'text-primary' : ''}`}>
                      {format(date, 'd')}
                    </p>
                    <p className="text-xs text-muted-foreground">{format(date, 'MMM')}</p>
                    {isToday && (
                      <span className="text-[8px] sm:text-xs font-bold text-accent bg-accent/20 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                        TODAY
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Select Time
        </h2>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {timeSlots.map(time => (
            <Button
              key={time}
              variant={selectedTime === time ? 'default' : 'outline'}
              className={`h-12 rounded-lg transition-all duration-200 transform hover:scale-105 ${selectedTime === time
                  ? 'bg-primary hover:bg-primary/90 shadow-lg'
                  : 'hover:bg-primary/10 border-2 border-primary/30'
                }`}
              onClick={() => setSelectedTime(time)}
            >
              <span className="text-sm font-medium">{time}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Confirmation Step
const ConfirmationStep = ({
  salon,
  selectedServices,
  selectedStaff,
  selectedDate,
  selectedTime,
  totalPrice,
  tax,
  finalTotal,
  onConfirm
}: {
  salon: typeof salonData;
  selectedServices: typeof services;
  selectedStaff: typeof staffMembers[0] | null;
  selectedDate: Date;
  selectedTime: string | null;
  totalPrice: number;
  tax: number;
  finalTotal: number;
  onConfirm: () => void;
}) => {
  return (
    <div>
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-headline mb-2">Review Your Booking</h1>
        <p className="text-muted-foreground">Please review your appointment details before confirming</p>
      </div>

      <div className="space-y-6">
        {/* Salon Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-primary" />
              Salon Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={salon.image}
                  alt={salon.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg">{salon.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>{salon.rating} ({salon.reviews} reviews)</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{salon.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-primary" />
              Selected Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedServices.map(service => (
              <div key={service.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                <div>
                  <h4 className="font-medium">{service.name}</h4>
                  <p className="text-sm text-muted-foreground">{service.duration}</p>
                </div>
                <p className="font-semibold">₹{service.price}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Professional</span>
              <span className="font-medium">{selectedStaff?.name || 'Any Professional'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (8%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">₹{finalTotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button
          onClick={onConfirm}
          className="w-full py-6 text-lg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        >
          Confirm & Pay
        </Button>
      </div>
    </div>
  );
};

// Booking Summary Sidebar
const BookingSummary = ({
  salon,
  selectedServices,
  selectedStaff,
  selectedDate,
  selectedTime,
  totalPrice,
  tax,
  finalTotal
}: {
  salon: typeof salonData;
  selectedServices: typeof services;
  selectedStaff: typeof staffMembers[0] | null;
  selectedDate: Date;
  selectedTime: string | null;
  totalPrice: number;
  tax: number;
  finalTotal: number;
}) => {
  return (
    <Card className="sticky top-24 shadow-lg border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary" />
          Booking Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Salon Info */}
        <div className="flex items-start gap-3">
          <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
            <Image
              src={salon.image}
              alt={salon.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-sm">{salon.name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span>{salon.rating}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Services Summary */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Services</h4>
          {selectedServices.length > 0 ? (
            <div className="space-y-2">
              {selectedServices.map(service => (
                <div key={service.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground line-clamp-1">{service.name}</span>
                  <span>₹{service.price}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No services selected</p>
          )}
        </div>

        <Separator />

        {/* Appointment Details */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Appointment</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Professional</span>
              <span>{selectedStaff?.name || 'Any Professional'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{format(selectedDate, 'MMM d')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span>{selectedTime || 'Not selected'}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Payment Summary */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Payment</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-border/50">
              <span>Total</span>
              <span className="text-primary">₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Booking Confirmation Screen
const BookingConfirmationScreen = ({ salon }: { salon: typeof salonData }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-border/50">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>

          <h1 className="text-3xl font-bold font-headline mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-6">
            Your appointment at {salon.name} has been successfully booked.
          </p>

          <div className="bg-secondary/50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold mb-2">Next Steps</h3>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <span>You'll receive a confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <span>Arrive 10 minutes before your appointment</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <span>Bring this confirmation for check-in</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="flex-1"
            >
              Back to Home
            </Button>
            <Button
              onClick={() => router.push('/my-appointments')}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              View Booking
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};