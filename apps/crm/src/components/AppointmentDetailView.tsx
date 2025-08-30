"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { X, Phone, Mail, MapPin, Clock, Calendar, User, Scissors, DollarSign, UserCheck, CreditCard, Wallet, Smartphone, History, CalendarPlus, ClipboardList } from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Badge } from "@repo/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import NewAppointmentForm, { type AppointmentFormData } from "../app/calendar/components/NewAppointmentForm";

interface PaymentDetails {
  amount: number;
  paid: number;
  discount?: {
    amount: number;
    code?: string;
    description: string;
  };
  tax: number;
  total: number;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
}

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  staffName: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  payment?: PaymentDetails;
}

interface AppointmentDetailViewProps {
  appointment: Appointment;
  onClose: () => void;
  onStatusChange?: (status: string) => void;
  onCollectPayment?: (paymentData: { amount: number; paymentMethod: string; notes?: string }) => void;
}

interface ClientAppointment {
  id: string;
  date: Date;
  service: string;
  status: 'pending' | 'completed' | 'cancelled' | 'missed';
  staffName: string;
  amount: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
  payment?: PaymentDetails;
}

export function AppointmentDetailView({
  appointment,
  onClose,
  onStatusChange,
  onCollectPayment,
}: AppointmentDetailViewProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [clientHistory, setClientHistory] = useState<ClientAppointment[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeHistoryFilter, setActiveHistoryFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled' | 'missed'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [isCollectingPayment, setIsCollectingPayment] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentData, setPaymentData] = useState({
    amount: (appointment.payment?.total || 0) - (appointment.payment?.paid || 0),
    paymentMethod: 'cash',
    notes: ''
  });

  // Prepare default values for rescheduling
  const getDefaultRescheduleValues = (appt = appointment) => ({
    clientName: appt.clientName,
    service: appt.service,
    staffName: appt.staffName,
    date: appt.date instanceof Date ? appt.date : parseISO(appt.date as string),
    startTime: appt.startTime,
    endTime: appt.endTime,
    notes: appt.notes || ''
  });
  
  const defaultRescheduleValues = getDefaultRescheduleValues();
  const [editedAppointment, setEditedAppointment] = useState(appointment);
  
  // Default payment details if not provided
  const payment = {
    amount: 0,
    paid: 0,
    tax: 0,
    total: 0,
    paymentStatus: 'pending' as const,
    ...appointment.payment
  };

  // Fetch client history when the component mounts or filter changes
  useEffect(() => {
    const fetchClientHistory = async () => {
      setIsLoadingHistory(true);
      try {
        // Simulate API call with mock data
        // In a real app, you would fetch this from your backend with proper filtering
        const allHistory: ClientAppointment[] = [
          {
            id: '1',
            date: new Date(), // Today
            service: 'Haircut & Styling',
            status: 'pending',
            staffName: 'Jane Smith',
            amount: 75.00,
            startTime: '14:00',
            endTime: '15:00',
            notes: 'Regular trim and style'
          },
          {
            id: '2',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            service: 'Hair Color',
            status: 'completed',
            staffName: 'John Doe',
            amount: 120.00,
            startTime: '11:00',
            endTime: '13:00',
            notes: 'Full color with highlights'
          },
          {
            id: '3',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (missed)
            service: 'Manicure',
            status: 'missed',
            staffName: 'Sarah Johnson',
            amount: 45.00,
            startTime: '15:00',
            endTime: '16:00',
            notes: 'Client didn\'t show up'
          },
          {
            id: '4',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            service: 'Facial',
            status: 'cancelled',
            staffName: 'Emily Wilson',
            amount: 85.00,
            startTime: '12:00',
            endTime: '13:00',
            notes: 'Client called to cancel'
          },
        ];

        // Filter based on active filter
        const filteredHistory = activeHistoryFilter === 'all' 
          ? allHistory 
          : allHistory.filter(appt => appt.status === activeHistoryFilter);

        setClientHistory(filteredHistory);
      } catch (error) {
        console.error('Error fetching client history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchClientHistory();
  }, [appointment.clientName, activeHistoryFilter]);

  // Function to update appointment status
  const updateAppointmentStatus = (appointmentId: string, newStatus: 'pending' | 'completed' | 'cancelled' | 'missed') => {
    setClientHistory(prevHistory => 
      prevHistory.map(appt => 
        appt.id === appointmentId 
          ? { ...appt, status: newStatus } 
          : appt
      )
    );
    
    // In a real app, you would also update the backend here
    console.log(`Updated appointment ${appointmentId} status to ${newStatus}`);
  };

  // Ensure total is calculated if not provided
  if (!payment.total) {
    payment.total = payment.amount + payment.tax - (payment.discount?.amount || 0);
  }
  
  const remainingAmount = Math.max(0, payment.total - payment.paid);
  
  const statusColors = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const handlePaymentSubmit = () => {
    if (onCollectPayment) {
      onCollectPayment({
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        notes: paymentData.notes
      });
      setIsCollectingPayment(false);
    }
  };

  // Format date for display
  const formatAppointmentDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'missed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!appointment) return null;

  return (
    <>
      <Dialog open={!!appointment} onOpenChange={(open) => !open && onClose?.()}>
        <DialogContent className="sm:max-w-[800px] max-w-[95vw] max-h-[90vh] h-auto overflow-y-auto p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-xl font-semibold text-foreground">Appointment Details</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {appointment.clientName} • {format(new Date(appointment.date), 'MMM d, yyyy')} • {appointment.startTime}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="h-8 w-8 -mt-2 -mr-2 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            </DialogHeader>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-6 py-0 h-12">
              <TabsTrigger 
                value="details" 
                className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                <User className="mr-2 h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                <History className="mr-2 h-4 w-4" />
                Client History
                {clientHistory.length > 0 && (
                  <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {clientHistory.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="p-6 pt-4 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-3">
              <div className="w-full flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => setIsCollectingPayment(!isCollectingPayment)}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  {isCollectingPayment ? 'Hide Payment' : 'Collect Payment'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => setIsRescheduling(true)}
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Reschedule
                </Button>
              </div>
              {onStatusChange && (
                <div className="w-full sm:w-auto">
                  <Select onValueChange={onStatusChange} value={appointment.status}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Mark as Confirmed</SelectItem>
                      <SelectItem value="pending">Mark as Pending</SelectItem>
                      <SelectItem value="completed">Mark as Completed</SelectItem>
                      <SelectItem value="cancelled">Cancel Appointment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Payment Collection Form */}
            {isCollectingPayment && (
              <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-muted-foreground/30">
                <h3 className="font-medium mb-3 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Collect Payment
                </h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Amount Due</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="number" 
                          value={paymentData.amount}
                          onChange={(e) => setPaymentData(prev => ({
                            ...prev,
                            amount: parseFloat(e.target.value) || 0
                          }))}
                          className="pl-9"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Payment Method</label>
                      <Select 
                        value={paymentData.paymentMethod}
                        onValueChange={(value) => setPaymentData(prev => ({
                          ...prev,
                          paymentMethod: value
                        }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">
                            <div className="flex items-center">
                              <Wallet className="w-4 h-4 mr-2" />
                              Cash
                            </div>
                          </SelectItem>
                          <SelectItem value="card">
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 mr-2" />
                              Credit/Debit Card
                            </div>
                          </SelectItem>
                          <SelectItem value="upi">
                            <div className="flex items-center">
                              <Smartphone className="w-4 h-4 mr-2" />
                              UPI
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Notes (Optional)</label>
                    <Input 
                      placeholder="Payment reference or notes"
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData(prev => ({
                        ...prev,
                        notes: e.target.value
                      }))}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCollectingPayment(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handlePaymentSubmit}
                      disabled={paymentData.amount <= 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Process Payment
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Client & Service Info */}
            <div className="bg-gradient-to-br from-background/50 to-muted/20 p-3 sm:p-4 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div className="bg-background p-3 rounded-lg border shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</p>
                        <p className="text-lg font-semibold text-foreground">{appointment.clientName}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-background p-3 rounded-lg border shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Scissors className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</p>
                        <p className="text-lg font-semibold text-foreground">{appointment.service}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-background p-3 rounded-lg border shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <UserCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Staff</p>
                        <p className="text-lg font-semibold text-foreground">{appointment.staffName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="bg-background p-3 rounded-lg border shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date & Time</p>
                        <div className="space-y-1">
                          <p className="text-lg font-semibold text-foreground">
                            {format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')}
                          </p>
                          <div className="flex items-center text-foreground/80">
                            <Clock className="h-4 w-4 mr-1.5 text-muted-foreground" />
                            <span>{appointment.startTime} - {appointment.endTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-background p-3 rounded-lg border shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        appointment.status === 'confirmed' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        appointment.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        appointment.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' : 
                        'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                          appointment.status === 'confirmed' ? 'text-blue-600 dark:text-blue-400' :
                          appointment.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                          appointment.status === 'completed' ? 'text-green-600 dark:text-green-400' : 
                          'text-red-600 dark:text-red-400'
                        }`}>
                          <div className={`h-2.5 w-2.5 rounded-full ${
                            appointment.status === 'confirmed' ? 'bg-blue-500' :
                            appointment.status === 'pending' ? 'bg-yellow-500' :
                            appointment.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Appointment Status</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold text-foreground capitalize">
                            {appointment.status.replace(/-/g, ' ')}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`px-2 py-0.5 text-xs font-medium ${
                              appointment.status === 'confirmed' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200' :
                              appointment.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200' :
                              appointment.status === 'completed' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' :
                              'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                            } border-0`}
                          >
                            {appointment.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div className="bg-background p-3 rounded-lg border shadow-sm">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-600 dark:text-cyan-400">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <line x1="10" y1="9" x2="8" y2="9"></line>
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                          <p className="text-foreground/90">{appointment.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Payment Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Amount:</span>
                  <span>${payment.amount.toFixed(2)}</span>
                </div>
                
                {payment.discount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({payment.discount.description}):</span>
                    <span>-${payment.discount.amount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>${payment.tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-dashed my-2"></div>
                
                <div className="flex justify-between font-medium">
                  <span>Total Amount:</span>
                  <span>${payment.total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid Amount:</span>
                  <span>${payment.paid.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between font-medium">
                  <span>Remaining:</span>
                  <span className={remainingAmount > 0 ? 'text-amber-600' : 'text-green-600'}>
                    ${Math.max(0, remainingAmount).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-muted-foreground">Payment Status:</span>
                  <Badge 
                    variant={payment.paymentStatus === 'paid' ? 'default' : 
                            payment.paymentStatus === 'partial' ? 'secondary' : 
                            payment.paymentStatus === 'refunded' ? 'secondary' : 'outline'}
                    className="capitalize"
                  >
                    {payment.paymentStatus}
                  </Badge>
                </div>
                
                {remainingAmount > 0 && (
                  <div className="mt-4">
                    {!showPaymentForm ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 w-full sm:w-auto"
                        onClick={() => {
                          setShowPaymentForm(true);
                          setPaymentAmount(remainingAmount);
                        }}
                      >
                        <DollarSign className="h-4 w-4" />
                        Collect Payment
                      </Button>
                    ) : (
                      <div className="space-y-4 w-full">
                        <div className="grid gap-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                              <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Amount
                              </label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  value={paymentAmount}
                                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                  max={remainingAmount}
                                  min={1}
                                  className="w-full pl-8"
                                  placeholder="0.00"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Remaining: ${remainingAmount.toFixed(2)}
                              </p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Payment Method
                              </label>
                              <Select 
                                value={paymentMethod} 
                                onValueChange={setPaymentMethod}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cash">💵 Cash</SelectItem>
                                  <SelectItem value="debit">💳 Debit Card</SelectItem>
                                  <SelectItem value="credit">💳 Credit Card</SelectItem>
                                  <SelectItem value="upi">📱 UPI</SelectItem>
                                  <SelectItem value="netbanking">🏦 Net Banking</SelectItem>
                                  <SelectItem value="wallet">👛 Wallet</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Selected Method Preview */}
                          <div className="mt-2 p-2 bg-muted/10 text-sm rounded border">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Selected:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {{
                                    cash: '💵',
                                    debit: '💳',
                                    credit: '💳',
                                    upi: '📱',
                                    netbanking: '🏦',
                                    wallet: '👛'
                                  }[paymentMethod]}
                                </span>
                                <span className="font-medium capitalize">
                                  {paymentMethod.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setShowPaymentForm(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="button" 
                            size="sm" 
                            className="w-full gap-2"
                            onClick={() => {
                              if (onCollectPayment) {
                                onCollectPayment({
                                  amount: paymentAmount,
                                  paymentMethod: paymentMethod,
                                  notes: ''
                                });
                              }
                              setShowPaymentForm(false);
                            }}
                            disabled={!paymentAmount || paymentAmount <= 0}
                          >
                            <DollarSign className="h-4 w-4" />
                            Record Payment (${paymentAmount.toFixed(2)})
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <div className="flex flex-wrap gap-2">
                {/* Invoice Button */}
                <Button 
                  variant="outline"
                  className="gap-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  onClick={() => {
                    // TODO: Implement invoice generation
                    console.log('Generate invoice for', appointment.id);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <rect width="8" height="2" x="8" y="12" rx="1"></rect>
                    <rect width="8" height="2" x="8" y="16" rx="1"></rect>
                    <path d="M10 6h1v4"></path>
                    <path d="M14 6h1v4"></path>
                  </svg>
                  Invoice
                </Button>

                {/* Collect Payment Button */}
                {remainingAmount > 0 && (
                  <Button 
                    variant="outline"
                    className="gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                    onClick={() => {
                      setPaymentAmount(remainingAmount);
                      setShowPaymentForm(true);
                    }}
                  >
                    <DollarSign className="h-4 w-4" />
                    Collect Payment
                  </Button>
                )}

              </div>
              </div>
            </TabsContent>

            {/* Client History Tab */}
            <TabsContent value="history" className="p-0">
              {/* History Filter Tabs */}
              <div className="border-b px-6">
                <div className="flex space-x-1 overflow-x-auto py-2">
                  {['all', 'pending', 'completed', 'cancelled', 'missed'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveHistoryFilter(filter as any)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
                        activeHistoryFilter === filter
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      {filter !== 'all' && (
                        <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-primary/10">
                          {clientHistory.filter(a => a.status === filter).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {isLoadingHistory ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : clientHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <History className="h-12 w-12 text-muted-foreground mb-4" />
                    <h4 className="text-lg font-medium text-foreground">
                      No {activeHistoryFilter === 'all' ? '' : activeHistoryFilter} appointments found
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      {activeHistoryFilter === 'all'
                        ? `${appointment.clientName} doesn't have any appointments in our records.`
                        : `No ${activeHistoryFilter} appointments found for ${appointment.clientName}.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientHistory.map((appt) => (
                      <Card 
                        key={appt.id} 
                        className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50"
                        onClick={() => setSelectedAppointment({
                          ...appt,
                          date: appt.date,
                          payment: {
                            amount: appt.amount,
                            paid: appt.amount,
                            tax: 0,
                            total: appt.amount,
                            paymentStatus: 'paid' as const
                          }
                        })}
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base font-medium text-foreground">
                                {appt.service}
                              </CardTitle>
                              <CardDescription className="text-sm">
                                {formatAppointmentDate(appt.date)} • {appt.staffName}
                              </CardDescription>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`ml-2 ${getStatusBadgeClass(appt.status)}`}
                            >
                              {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                              <span className="font-medium">${appt.amount?.toFixed(2) || '0.00'}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(appt.date), { addSuffix: true })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduling} onOpenChange={setIsRescheduling}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Update the appointment details below
            </p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            <NewAppointmentForm
              defaultValues={selectedAppointment ? getDefaultRescheduleValues(selectedAppointment) : defaultRescheduleValues}
              onSubmit={(data) => {
                console.log('New appointment data:', data);
                // Here you would typically save the new appointment
                // and update the UI accordingly
                setIsRescheduling(false);
              }}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setIsRescheduling(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // Form submission would be handled by the NewAppointmentForm component
                setIsRescheduling(false);
              }}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Appointment Details Dialog */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="border-b p-6 pb-4">
              <div className="flex justify-between items-start">
                <DialogTitle className="text-xl">Appointment Details</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedAppointment(null)}
                  className="h-8 w-8 -mt-2 -mr-2 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            </DialogHeader>

            <div className="p-6 pt-4 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="w-full flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => {
                      // Close the current dialog and open the reschedule form with the selected appointment's details
                      setSelectedAppointment(null);
                      setIsRescheduling(true);
                    }}
                  >
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Book Again
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => {
                      // Open payment collection dialog
                      setPaymentData({
                        amount: selectedAppointment.payment?.total || 0,
                        paymentMethod: 'cash',
                        notes: ''
                      });
                      setIsCollectingPayment(true);
                    }}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Collect Payment
                  </Button>
                </div>
                <div className="w-full sm:w-auto">
                  <Select 
                    value={selectedAppointment.status} 
                    onValueChange={(value) => {
                      // Update the selected appointment status
                      const updatedAppointment = {
                        ...selectedAppointment,
                        status: value as 'confirmed' | 'pending' | 'completed' | 'cancelled'
                      };
                      setSelectedAppointment(updatedAppointment);
                      
                      // Call the onStatusChange prop if it exists
                      if (onStatusChange) {
                        onStatusChange(value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Mark as Confirmed</SelectItem>
                      <SelectItem value="pending">Mark as Pending</SelectItem>
                      <SelectItem value="completed">Mark as Completed</SelectItem>
                      <SelectItem value="cancelled">Mark as Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-4">
                <h3 className="font-medium mb-4 flex items-center text-foreground">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Appointment Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Service</h4>
                    <p className="text-foreground">{selectedAppointment.service}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
                    <p className="text-foreground">
                      {format(new Date(selectedAppointment.date), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Time</h4>
                    <p className="text-foreground">
                      {selectedAppointment.startTime} - {selectedAppointment.endTime}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Staff</h4>
                    <p className="text-foreground">{selectedAppointment.staffName}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={getStatusBadgeClass(selectedAppointment.status)}
                      >
                        {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                      </Badge>
                      {selectedAppointment.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            updateAppointmentStatus(selectedAppointment.id, 'completed');
                            setSelectedAppointment({
                              ...selectedAppointment,
                              status: 'completed'
                            });
                          }}
                          className="h-7 text-xs"
                        >
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  </div>
                  {selectedAppointment.notes && (
                    <div className="space-y-2 col-span-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                      <p className="text-foreground">{selectedAppointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-card rounded-lg border p-4">
                <h3 className="font-medium mb-4 flex items-center text-foreground">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Service Amount</span>
                    <span className="font-medium">${selectedAppointment.payment?.amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  {selectedAppointment.payment?.tax && selectedAppointment.payment.tax > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${selectedAppointment.payment.tax.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedAppointment.payment?.discount && selectedAppointment.payment.discount.amount > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">
                        Discount {selectedAppointment.payment.discount.code ? `(${selectedAppointment.payment.discount.code})` : ''}
                      </span>
                      <span className="text-green-600">-${selectedAppointment.payment.discount.amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 mt-2">
                    <div className="flex justify-between py-1 font-semibold">
                      <span>Total</span>
                      <span>${selectedAppointment.payment?.total?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between py-1 text-sm text-muted-foreground">
                      <span>Payment Status</span>
                      <Badge 
                        variant={selectedAppointment.payment?.paymentStatus === 'paid' ? 'default' : 'secondary'}
                        className={selectedAppointment.payment?.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                      >
                        {selectedAppointment.payment?.paymentStatus?.charAt(0).toUpperCase() + selectedAppointment.payment?.paymentStatus?.slice(1) || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Payment Collection Dialog */}
      <Dialog open={isCollectingPayment} onOpenChange={setIsCollectingPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="number" 
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({
                    ...prev,
                    amount: parseFloat(e.target.value) || 0
                  }))}
                  className="pl-9"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select 
                value={paymentData.paymentMethod}
                onValueChange={(value) => setPaymentData(prev => ({
                  ...prev,
                  paymentMethod: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="netbanking">Net Banking</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Input 
                placeholder="Add any payment notes"
                value={paymentData.notes}
                onChange={(e) => setPaymentData(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
              />
            </div>
            
            <div className="pt-2">
              <Button 
                className="w-full"
                onClick={handlePaymentSubmit}
              >
                Process Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}