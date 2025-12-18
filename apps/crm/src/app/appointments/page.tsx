"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Plus, Search, FileDown, Eye, Edit, Trash2, CalendarCheck, CalendarX, UserCheck, Clock, CheckCircle, User } from 'lucide-react';
import { Textarea } from '@repo/ui/textarea';
import { useAppDispatch } from '@repo/store/hooks';
import { glowvitaApi } from '@repo/store/api';
import { startOfDay, endOfDay } from 'date-fns';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { AppointmentDetailCard } from './components/AppointmentDetailCard';

const NewAppointmentForm = dynamic(
  () => import('../calendar/components/NewAppointmentForm'),
  { ssr: false }
);

type Appointment = {
  _id?: string;
  id?: string;
  client: string;
  clientName: string;
  clientPhone?: string;
  service: string;
  serviceName: string;
  serviceItems?: Array<{
    service: string;
    serviceName: string;
    staff: string;
    staffName: string;
    startTime: string;
    endTime: string;
    duration: number;
    amount: number;
    _id: string;
  }>;
  staff: string;
  staffName: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  duration: number;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  amount: number;
  discount: number;
  tax?: number;
  totalAmount: number;
  paymentStatus?: string;
  paymentMethod?: string;
  platformFee?: number;
  serviceTax?: number;
  discountAmount?: number;
  finalAmount?: number;
  payment?: {
    paid?: number;
    paymentMode?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
};

export default function AppointmentsPage() {
  const dispatch = useAppDispatch();
  
  // Hide body scrollbar when component mounts
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      // Restore scrollbar when component unmounts
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);
  
  // RTK Query hooks for appointments
  const { data: appointmentsData = [], isLoading, isError, refetch } = glowvitaApi.useGetAppointmentsQuery(
    {
      startDate: startOfDay(new Date()).toISOString(),
      endDate: endOfDay(new Date()).toISOString(),
    },
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  // RTK Query mutations
  const [createAppointment] = glowvitaApi.useCreateAppointmentMutation();
  const [updateAppointment] = glowvitaApi.useUpdateAppointmentMutation();
  const [deleteAppointment, { isLoading: isDeleting }] = glowvitaApi.useDeleteAppointmentMutation();
  // Use backend payments collect endpoint so each payment is recorded with timestamped history
  const [collectPayment] = glowvitaApi.useCollectPaymentMutation();
  
  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'cash',
    notes: ''
  });
  const [paymentAt, setPaymentAt] = useState<string>(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    // Format to yyyy-MM-ddTHH:mm for datetime-local input
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => 
      (appt.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       appt.service?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || appt.status === statusFilter)
    );
  }, [appointments, searchTerm, statusFilter]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredAppointments.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const handleOpenModal = (type: 'add' | 'edit' | 'view', appointment?: Appointment) => {
    setModalType(type);
    setSelectedAppointment(appointment || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleFormSubmit = async (appointmentData: Appointment) => {
    try {
      if (modalType === 'edit' && selectedAppointment?._id) {
        // For updates, we need to separate the ID and exclude metadata fields
        const { _id, createdAt, updatedAt, ...updates } = appointmentData;
        
        // Call the update mutation with properly structured data
        await updateAppointment({
          _id: selectedAppointment._id, // Use the ID from selectedAppointment
          ...updates                    // Spread the rest of the appointment data
        }).unwrap();
        
        toast.success('Appointment updated successfully');
      } else {
        // For new appointments, ensure we're not sending _id or other metadata fields
        const { _id, createdAt, updatedAt, ...newAppointment } = appointmentData;
        await createAppointment(newAppointment).unwrap();
        toast.success('Appointment created successfully');
      }
      
      // Refresh the appointments list
      refetch();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      toast.error(error?.data?.message || 'Failed to save appointment. Please try again.');
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment?._id) return;
    
    try {
      await deleteAppointment(selectedAppointment._id).unwrap();
      toast.success('Appointment deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedAppointment(null);
      // The RTK Query cache will be automatically updated due to the 'Appointments' tag invalidation
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
    }
  };

  // Handle payment collection
  const handleOpenPaymentModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    const totalAmount = (appointment as any).finalAmount || appointment.totalAmount || 0;
    const paidAmount = (appointment as any).amountPaid || appointment.payment?.paid || 0;
    const remainingAmount = Math.max(0, totalAmount - paidAmount);
    
    setPaymentData({
      amount: remainingAmount,
      paymentMethod: 'cash',
      notes: ''
    });
    setIsPaymentModalOpen(true);
    // Reset payment date to now when opening
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    setPaymentAt(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`);
  };

  const handleCollectPayment = async () => {
    if (!selectedAppointment?._id) return;
    const toastId = toast.loading('Processing payment...');
    try {
      // Call backend so it records payment history with paymentDate
      await collectPayment({
        appointmentId: selectedAppointment._id,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        notes: paymentData.notes,
        paymentDate: new Date(paymentAt).toISOString(),
      }).unwrap();

      toast.success('Payment collected successfully', {
        description: `₹${paymentData.amount.toFixed(2)} received via ${paymentData.paymentMethod}`
      });

      setIsPaymentModalOpen(false);
      setSelectedAppointment(null);
      refetch();
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment', {
        description: error?.data?.message || error.message || 'Please try again.'
      });
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 py-6 h-full flex flex-col">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Appointments</h1>
            <p className="text-gray-500">Manage your appointments</p>
          </div>

          {/* Appointment Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointments.length}</div>
                <p className="text-xs text-muted-foreground">All scheduled appointments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {appointments.filter(a => a.status === 'confirmed').length}
                </div>
                <p className="text-xs text-muted-foreground">Upcoming confirmed bookings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {appointments.filter(a => a.status === 'completed').length}
                </div>
                <p className="text-xs text-muted-foreground">Successfully completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                <CalendarX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {appointments.filter(a => a.status === 'cancelled').length}
                </div>
                <p className="text-xs text-muted-foreground">Cancelled by client or staff</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search appointments..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleOpenModal('add')} className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> New Appointment
            </Button>
          </div>

          {/* Appointments Table */}
          <div className="flex-1 flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Services</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Partial Payment</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              Loading appointments...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : currentItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                            {searchTerm || statusFilter !== 'all' ? 'No appointments found matching your criteria' : 'No appointments scheduled'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentItems.map((appointment) => {
                          const totalAmount = (appointment as any).finalAmount || appointment.totalAmount || 0;
                          // Use the new amountPaid field from the appointment, fallback to payment.paid for backward compatibility
                          const paidAmount = (appointment as any).amountPaid || appointment.payment?.paid || 0;
                          const remainingAmount = Math.max(0, totalAmount - paidAmount);
                          
                          console.log('=== APPOINTMENTS PAGE PAYMENT DEBUG ===');
                          console.log('Appointment ID:', appointment._id);
                          console.log('totalAmount:', totalAmount);
                          console.log('paidAmount (from appointment.amountPaid):', (appointment as any).amountPaid);
                          console.log('paidAmount (from appointment.payment?.paid):', appointment.payment?.paid);
                          console.log('paidAmount (final):', paidAmount);
                          console.log('remainingAmount:', remainingAmount);
                          console.log('Full appointment data:', appointment);
                          
                          return (
                          <TableRow key={appointment._id}>
                            <TableCell className="font-medium">
                              {appointment.clientName}
                              <div className="text-xs text-muted-foreground">
                                {appointment.clientPhone || 'No phone'}
                              </div>
                            </TableCell>
                            <TableCell>
                              {appointment.serviceItems?.length > 0 ? (
                                <div className="space-y-1">
                                  {appointment.serviceItems.map((item: any, idx: number) => (
                                    <div key={idx} className="text-sm">
                                      {item.serviceName}
                                      {appointment.serviceItems.length > 1 && ` (${item.duration} min)`}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm">
                                  {appointment.serviceName}
                                  {appointment.duration && ` (${appointment.duration} min)`}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {appointment.serviceItems?.length > 0 ? (
                                <div className="space-y-1">
                                  {appointment.serviceItems.map((item: any, idx: number) => (
                                    <div key={idx} className="text-sm">
                                      {item.staffName}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm">
                                  {appointment.staffName}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <CalendarCheck className="h-4 w-4 text-gray-500" />
                                {new Date(appointment.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="h-3 w-3" />
                                {appointment.startTime} - {appointment.endTime}
                              </div>
                            </TableCell>
                            <TableCell>{appointment.duration} min</TableCell>
                            <TableCell>₹{totalAmount.toFixed(2)}</TableCell>
                            <TableCell>
                              {paidAmount > 0 && remainingAmount > 0 ? (
                                <div className="flex flex-col text-xs">
                                  <span className="text-green-700 font-medium">Paid: ₹{paidAmount.toFixed(2)}</span>
                                  <span className="text-orange-700 font-medium">Remain: ₹{remainingAmount.toFixed(2)}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {(appointment as any).paymentMethod || appointment.payment?.paymentMethod || 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                ((appointment as any).paymentStatus || appointment.payment?.paymentStatus) === 'completed' 
                                  ? 'bg-green-100 text-green-800' :
                                ((appointment as any).paymentStatus || appointment.payment?.paymentStatus) === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {(() => {
                                  // Map the backend payment status to more user-friendly terms
                                  const status = (appointment as any).paymentStatus || appointment.payment?.paymentStatus || 'pending';
                                  const amountPaid = Number((appointment as any).amountPaid ?? 0) || 0;
                                  const totalAmount = Number((appointment as any).finalAmount ?? appointment.totalAmount ?? 0) || 0;
                                  
                                  switch (status) {
                                    case 'completed': return 'PAID';
                                    case 'pending': 
                                      if (amountPaid > 0 && totalAmount > 0) {
                                        return `PARTIAL (₹${amountPaid.toFixed(2)})`;
                                      }
                                      return 'UNPAID';
                                    default: return status.toUpperCase();
                                  }
                                })()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  appointment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                  appointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                  appointment.status === 'no_show' ? 'bg-orange-100 text-orange-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {formatStatus(appointment.status)}
                                </span>
                                {(() => {
                                  const totalAmount = Number((appointment as any).finalAmount ?? appointment.totalAmount ?? 0) || 0;
                                  const paidAmount = Number((appointment as any).amountPaid ?? appointment.payment?.paid ?? 0) || 0;
                                  const isPartial = totalAmount > 0 && paidAmount > 0 && paidAmount < totalAmount;
                                  return isPartial ? (
                                    <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wide">
                                      Partial
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {remainingAmount > 0 && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleOpenPaymentModal(appointment)}
                                    className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    title="Collect Payment"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleOpenModal('view', appointment)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleOpenModal('edit', appointment)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{Math.min(firstItemIndex + 1, filteredAppointments.length)}</span> to{' '}
              <span className="font-medium">
                {Math.min(lastItemIndex, filteredAppointments.length)}
              </span>{' '}
              of <span className="font-medium">{filteredAppointments.length}</span> appointments
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
              totalItems={filteredAppointments.length}
              className="mt-0"
            />
          </div>
        </div>
      </div>

      {/* Appointment Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full h-[90vh] max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="text-lg sm:text-xl">
              {modalType === 'add' ? 'New Appointment' : 
               modalType === 'edit' ? 'Edit Appointment' : 'Appointment Details'}
            </DialogTitle>
            <DialogDescription>
              {modalType === 'add' ? 'Create a new appointment' : 
               modalType === 'edit' ? 'Edit appointment details' : 'View appointment details'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 pb-6 -mt-1">
            {modalType === 'view' && selectedAppointment ? (
              <div className="pr-1">
                <AppointmentDetailCard
                  appointment={selectedAppointment}
                  onEdit={() => {
                    setModalType('edit');
                  }}
                  onDelete={() => {
                    setIsModalOpen(false);
                    setIsDeleteModalOpen(true);
                  }}
                  onClose={() => setIsModalOpen(false)}
                />
              </div>
            ) : (
              <NewAppointmentForm
                defaultValues={selectedAppointment || undefined}
                isEditing={modalType === 'edit'}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseModal}
                onSuccess={handleCloseModal}
                onDelete={modalType === 'edit' ? () => {
                  setIsModalOpen(false);
                  setIsDeleteModalOpen(true);
                } : undefined}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the appointment for <strong>{selectedAppointment?.clientName}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAppointment}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Collection Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
            <DialogDescription>
              Collect payment for <strong>{selectedAppointment?.clientName}</strong>'s appointment
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              {/* Payment Summary */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold">₹{((selectedAppointment as any).finalAmount || selectedAppointment.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Already Paid:</span>
                  <span className="font-semibold text-green-600">₹{(((selectedAppointment as any).amountPaid || selectedAppointment.payment?.paid || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="font-medium">Remaining:</span>
                  <span className="font-bold text-orange-600">₹{(Math.max(0, ((selectedAppointment as any).finalAmount || selectedAppointment.totalAmount || 0) - (((selectedAppointment as any).amountPaid || selectedAppointment.payment?.paid || 0)))).toFixed(2)}</span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Collecting Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="pl-7"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select 
                  value={paymentData.paymentMethod}
                  onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">💰 Cash</SelectItem>
                    <SelectItem value="card">💳 Card</SelectItem>
                    <SelectItem value="upi">📱 UPI</SelectItem>
                    <SelectItem value="netbanking">🏦 Net Banking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Payment reference or notes..."
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsPaymentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCollectPayment}
              disabled={paymentData.amount <= 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirm Payment ₹{paymentData.amount.toFixed(2)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}