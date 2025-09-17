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
import { Plus, Search, FileDown, Eye, Edit, Trash2, CalendarCheck, CalendarX, UserCheck, Clock } from 'lucide-react';
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
  _id: string;
  id?: string;
  client: string;
  clientName: string;
  service: string;
  serviceName: string;
  staff: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  amount: number;
  discount: number;
  totalAmount: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
};

export default function AppointmentsPage() {
  const dispatch = useAppDispatch();
  
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
        await updateAppointment({
          id: selectedAppointment._id,
          ...appointmentData
        }).unwrap();
      } else {
        await createAppointment(appointmentData).unwrap();
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving appointment:', error);
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
    <div className="container mx-auto px-4 py-6">
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
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {appointments.filter(a => a.status === 'in_progress').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
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
      <Card>
        <CardContent className="p-0">
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
              {currentItems.map((appointment) => (
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
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      appointment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {formatStatus(appointment.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenModal('view', appointment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenModal('edit', appointment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between px-2">
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

      {/* Appointment Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalType === 'add' ? 'New Appointment' : 
               modalType === 'edit' ? '' : 'Appointment Details'}
            </DialogTitle>
            <DialogDescription>
              {modalType === 'add' ? 'Create a new appointment' : 
               modalType === 'edit' ? '' : 'View appointment details'}
            </DialogDescription>
          </DialogHeader>
          
          {modalType === 'view' && selectedAppointment ? (
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

          {modalType !== 'view' && (
            <DialogFooter className="sm:justify-between">
              {/* {modalType === 'edit' && (
                <Button 
                  variant="destructive" 
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsDeleteModalOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              )} */}
              {/* <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button type="submit" form="appointment-form">
                  {modalType === 'add' ? 'Create Appointment' : 'Save Changes'}
                </Button>
              </div> */}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the appointment for {selectedAppointment?.clientName}.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
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
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
