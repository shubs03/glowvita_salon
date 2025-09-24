
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Calendar, Clock, Scissors, User, DollarSign, Info, Edit, Link as LinkIcon, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@repo/ui/separator';
import { cn } from "@repo/ui/cn";

export const AppointmentDetails = ({ appointment, onCancelClick }) => {
    if (!appointment) return (
        <div className="sticky top-24">
            <Card className="min-h-[500px] flex items-center justify-center bg-secondary/30 border-2 border-dashed">
                <div className="text-center text-muted-foreground">
                    <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="font-semibold">Select an appointment</p>
                    <p className="text-sm">Details will be shown here.</p>
                </div>
            </Card>
        </div>
    );

    const statusConfig = {
        Completed: { color: 'bg-green-100 text-green-800' },
        Confirmed: { color: 'bg-blue-100 text-blue-800' },
        Cancelled: { color: 'bg-red-100 text-red-800' },
    };
    
    const isAppointmentCancellable = (appointmentDate: string) => {
        const now = new Date();
        const apptDate = new Date(appointmentDate);
        const hoursDifference = (apptDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursDifference > 24;
    };

    return (
        <Card className="sticky top-24 shadow-lg border-border/50">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-bold">{appointment.service}</CardTitle>
                        <CardDescription className="mt-1">{appointment.salon.name}</CardDescription>
                    </div>
                    <Badge className={cn("text-sm py-1 px-3 rounded-full", statusConfig[appointment.status]?.color)}>
                        {appointment.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-secondary/50 p-4 rounded-lg border">
                    <h4 className="font-semibold text-sm mb-3 text-muted-foreground">APPOINTMENT DETAILS</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">Date</p>
                                <p className="text-sm text-muted-foreground">{new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">Time</p>
                                <p className="text-sm text-muted-foreground">{new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">Professional</p>
                                <p className="text-sm text-muted-foreground">{appointment.staff}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Scissors className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">Duration</p>
                                <p className="text-sm text-muted-foreground">{appointment.duration} minutes</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg border">
                    <h4 className="font-semibold text-sm mb-3 text-muted-foreground">BOOKING SUMMARY</h4>
                    <div className="text-sm space-y-2">
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Service Cost</span>
                            <span>₹{appointment.price.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Taxes & Fees</span>
                            <span>₹{(appointment.price * 0.05).toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                            <span>Total</span>
                            <span className="text-primary">₹{(appointment.price * 1.05).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground">QUICK ACTIONS</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="justify-start gap-2"><Calendar className="h-4 w-4"/> Add to Calendar</Button>
                        <Button variant="outline" className="justify-start gap-2"><MapPin className="h-4 w-4"/> Get Directions</Button>
                        <Button variant="outline" className="justify-start gap-2" disabled={!isAppointmentCancellable(appointment.date)} onClick={() => onCancelClick(appointment)}>
                            <Edit className="h-4 w-4"/> Manage Appointment
                        </Button>
                         <Button variant="outline" className="justify-start gap-2"><LinkIcon className="h-4 w-4"/> Salon Details</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
