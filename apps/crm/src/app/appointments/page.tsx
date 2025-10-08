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
  service: string;
  serviceName: string;
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
  
  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');

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
        const { _id, createdAt, updatedAt, __v, ...updates } = appointmentData;
        
        // Call the update mutation with properly structured data
        await updateAppointment({
          _id: selectedAppointment._id, // Use the ID from selectedAppointment
          ...updates                    // Spread the rest of the appointment data
        }).unwrap();
        
        toast.success('Appointment updated successfully');
      } else {
        // For new appointments, ensure we're not sending _id or other metadata fields
        const { _id, createdAt, updatedAt, __v, ...newAppointment } = appointmentData;
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
                        <TableHead>Service</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              Loading appointments...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : currentItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            {searchTerm || statusFilter !== 'all' ? 'No appointments found matching your criteria' : 'No appointments scheduled'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentItems.map((appointment) => (
                          <TableRow key={appointment._id}>
                            <TableCell className="font-medium">{appointment.clientName}</TableCell>
                            <TableCell>{appointment.serviceName}</TableCell>
                            <TableCell>{appointment.staffName}</TableCell>
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
                            <TableCell>${appointment.totalAmount?.toFixed(2)}</TableCell>
                            <TableCell>
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
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
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
                        ))
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
    </div>
  );
}