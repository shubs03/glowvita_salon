"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Label } from "@repo/ui/label";
import { Switch } from "@repo/ui/switch";
import { Badge } from "@repo/ui/badge";
import { Phone, Mail, MessageCircle, AlertCircle } from "lucide-react";
import { ConsultationData } from '../page';

interface NotificationConfirmationProps {
  data: ConsultationData;
  onUpdate: (updates: Partial<ConsultationData>) => void;
}

export default function NotificationConfirmation({ data, onUpdate }: NotificationConfirmationProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Notification Preferences</h2>
            <p className="text-muted-foreground">Choose how you'd like to receive appointment reminders</p>
          </div>
        </div>
      </div>

      {/* 2-Column Layout with improved spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Notification Options */}
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageCircle className="h-5 w-5 text-primary" />
                Communication Preferences
              </CardTitle>
              <p className="text-sm text-muted-foreground">Select your preferred notification channels</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* WhatsApp Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-full">
                    <MessageCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <Label className="font-medium">WhatsApp Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive appointment reminders via WhatsApp</p>
                  </div>
                </div>
                <Switch
                  checked={data.whatsappNotifications}
                  onCheckedChange={(checked) => onUpdate({ whatsappNotifications: checked })}
                />
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-full">
                    <Phone className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <Label className="font-medium">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive text messages about your appointment</p>
                  </div>
                </div>
                <Switch
                  checked={data.smsNotifications}
                  onCheckedChange={(checked) => onUpdate({ smsNotifications: checked })}
                />
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-full">
                    <Mail className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <Label className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email confirmations and reminders</p>
                  </div>
                </div>
                <Switch
                  checked={data.emailNotifications}
                  onCheckedChange={(checked) => onUpdate({ emailNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-primary" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="mt-1 w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Please arrive 15 minutes before your scheduled appointment time</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Bring a valid ID and any previous medical records if applicable</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>If you need to reschedule, please notify us at least 2 hours in advance</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>In case of emergency, please call our helpline immediately</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Appointment Summary */}
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-bold text-primary">
                      {data.selectedDoctorName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'DR'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{data.selectedDoctorName}</h3>
                    <p className="text-sm text-muted-foreground">{data.selectedDoctorSpecialty}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{data.selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{data.selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clinic</span>
                    <span className="font-medium">Main Clinic</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consultation Fee</span>
                    <span className="font-bold text-lg">₹{data.consultationFee}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Notification Preferences</h4>
                <div className="flex flex-wrap gap-2">
                  {data.whatsappNotifications && (
                    <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                      WhatsApp
                    </Badge>
                  )}
                  {data.smsNotifications && (
                    <Badge variant="outline" className="text-xs border-blue-500 text-blue-700">
                      SMS
                    </Badge>
                  )}
                  {data.emailNotifications && (
                    <Badge variant="outline" className="text-xs border-purple-500 text-purple-700">
                      Email
                    </Badge>
                  )}
                  {!data.whatsappNotifications && !data.smsNotifications && !data.emailNotifications && (
                    <Badge variant="outline" className="text-xs">
                      No Notifications
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Patient Information Summary */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{data.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">+91 {data.phoneNumber}</span>
              </div>
              {data.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{data.email}</span>
                </div>
              )}
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-1">Reason for Consultation:</p>
                <p className="text-sm">{data.reason}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}