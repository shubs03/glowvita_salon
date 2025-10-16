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
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-green-500/10 rounded-full text-green-500">
            <CheckCircle className="h-12 w-12" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Appointment Confirmed!</h2>
        <p className="text-lg text-muted-foreground">
          Your physical consultation has been successfully booked
        </p>
        <Badge className="mt-4 bg-green-500/10 text-green-700 border-green-500/20 text-base py-1">
          Appointment ID: {data.appointmentId}
        </Badge>
      </div>

      {/* 2-Column Layout with improved spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Appointment Details */}
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="h-5 w-5 text-primary" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="p-5 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-bold text-primary">
                      {data.selectedDoctorName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'DR'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{data.selectedDoctorName}</h3>
                    <p className="text-muted-foreground">{data.selectedDoctorSpecialty}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{data.selectedDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">{data.selectedTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">Main Clinic, 123 Medical Center, Downtown</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                <span className="font-medium">Consultation Fee</span>
                <span className="font-bold text-xl">₹{data.consultationFee}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Patient Information */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5 text-primary" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{data.patientName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">+91 {data.phoneNumber}</p>
                </div>
              </div>
              
              {data.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{data.email}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Reason for Consultation</p>
                  <p className="font-medium">{data.reason}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Next Steps & Actions */}
        <div className="space-y-6">
          {/* Next Steps */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Prepare for Your Visit</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Arrive 15 minutes early with a valid ID and any relevant medical records
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Receive Confirmation</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      You'll receive a confirmation message via your selected notification channels
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Attend Your Appointment</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Visit the clinic at the scheduled time for your consultation
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Notification Preferences */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.whatsappNotifications && (
                  <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                    WhatsApp Notifications
                  </Badge>
                )}
                {data.smsNotifications && (
                  <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                    SMS Notifications
                  </Badge>
                )}
                {data.emailNotifications && (
                  <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/20">
                    Email Notifications
                  </Badge>
                )}
                {!data.whatsappNotifications && !data.smsNotifications && !data.emailNotifications && (
                  <Badge variant="outline">No Notifications</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                You'll receive reminders about your appointment through these channels.
              </p>
            </CardContent>
          </Card>
          
          {/* Important Notes */}
          <Card className="border-yellow-500/30 h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                  <span>If you need to reschedule, please contact us at least 2 hours in advance</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                  <span>In case of emergency, call our helpline immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                  <span>Please bring all relevant medical documents and medications</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}