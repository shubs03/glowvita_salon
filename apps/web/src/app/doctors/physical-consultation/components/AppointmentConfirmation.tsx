"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Home, 
  Eye 
} from "lucide-react";
import { ConsultationData } from '../page';

interface AppointmentConfirmationProps {
  data: ConsultationData;
}

export default function AppointmentConfirmation({ data }: AppointmentConfirmationProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="p-3 sm:p-4 bg-green-500/10 rounded-full text-green-500">
            <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14" />
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3 px-2">
          Appointment Confirmed!
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-2 max-w-2xl mx-auto">
          Your consultation has been successfully booked
        </p>
        <div className="mt-3 sm:mt-4 inline-block">
          <Badge className="bg-green-500/10 text-green-700 border-green-500/20 text-xs sm:text-sm py-1 px-3">
            ID: {data.appointmentId}
          </Badge>
        </div>
      </div>

      {/* 2-Column Layout with improved spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 xl:gap-8">
        {/* Left Column - Appointment Details */}
        <div className="space-y-4 sm:space-y-5">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 px-4 sm:px-5 md:px-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                <Calendar className="h-5 w-5 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span>Appointment Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-5 md:px-6">
              <div className="p-4 sm:p-5 md:p-6 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-primary text-sm sm:text-base md:text-lg">
                      {data.selectedDoctorName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'DR'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base md:text-lg line-clamp-1">
                      {data.selectedDoctorName}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                      {data.selectedDoctorSpecialty}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">Date</p>
                      <p className="font-medium text-sm sm:text-base">{data.selectedDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">Time</p>
                      <p className="font-medium text-sm sm:text-base">{data.selectedTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 sm:gap-3">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">Location</p>
                      <p className="font-medium text-sm sm:text-base">Main Clinic, 123 Medical Center, Downtown</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 sm:p-4 md:p-5 bg-muted/30 rounded-lg gap-2">
                <span className="font-medium text-sm sm:text-base">Consultation Fee</span>
                <span className="font-bold text-lg sm:text-xl md:text-2xl">₹{data.consultationFee}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Patient Information */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 px-4 sm:px-5 md:px-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                <User className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Patient Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-5 md:px-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Name</p>
                  <p className="font-medium text-sm sm:text-base">{data.patientName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 sm:gap-3">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-sm sm:text-base">+91 {data.phoneNumber}</p>
                </div>
              </div>
              
              {data.email && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-sm sm:text-base break-all">{data.email}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-2 sm:gap-3">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Reason</p>
                  <p className="font-medium text-sm sm:text-base">{data.reason}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Additional Information */}
        <div className="space-y-4 sm:space-y-5">
          {/* Next Steps */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 px-4 sm:px-5 md:px-6">
              <CardTitle className="text-base sm:text-lg md:text-xl">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 md:px-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-xs sm:text-sm md:text-base">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm sm:text-base">Prepare</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Arrive 15 minutes early with valid ID
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-xs sm:text-sm md:text-base">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm sm:text-base">Confirmation</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      You'll receive confirmation via selected channels
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-xs sm:text-sm md:text-base">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm sm:text-base">Attend</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Visit clinic at your scheduled time
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Notification Preferences */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 px-4 sm:px-5 md:px-6">
              <CardTitle className="text-base sm:text-lg md:text-xl">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 md:px-6">
              <div className="flex flex-wrap gap-2">
                {data.whatsappNotifications && (
                  <Badge className="bg-green-500/10 text-green-700 border-green-500/20 text-xs sm:text-sm px-2 py-1">
                    WhatsApp
                  </Badge>
                )}
                {data.smsNotifications && (
                  <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20 text-xs sm:text-sm px-2 py-1">
                    SMS
                  </Badge>
                )}
                {data.emailNotifications && (
                  <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/20 text-xs sm:text-sm px-2 py-1">
                    Email
                  </Badge>
                )}
                {!data.whatsappNotifications && !data.smsNotifications && !data.emailNotifications && (
                  <Badge variant="outline" className="text-xs sm:text-sm px-2 py-1">None</Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3">
                You'll receive appointment reminders through these channels
              </p>
            </CardContent>
          </Card>
          
          {/* Important Notes */}
          <Card className="border-yellow-500/30 shadow-sm">
            <CardHeader className="pb-3 px-4 sm:px-5 md:px-6">
              <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></span>
                <span>Important Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 md:px-6">
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0"></div>
                  <span className="flex-1">Reschedule at least 2 hours in advance</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0"></div>
                  <span className="flex-1">For emergencies, call our helpline immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0"></div>
                  <span className="flex-1">Bring all relevant medical documents and records</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}