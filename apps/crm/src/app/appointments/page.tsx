"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@repo/ui/card";
import { ExportButtons } from "@/components/ExportButtons";
import { Appointment } from "../../../../../packages/types/src/appointment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { Plus } from "lucide-react";
import dynamic from 'next/dynamic';
import { useAppDispatch } from '@repo/store/hooks';
import { glowvitaApi } from '@repo/store/api';
import { startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';
import { AppointmentDetailCard } from './components/AppointmentDetailCard';

// Import new components
import AppointmentStatsCards from "./components/AppointmentStatsCards";
import AppointmentFiltersToolbar from "./components/AppointmentFiltersToolbar";
import AppointmentTable from "./components/AppointmentTable";
import AppointmentPaginationControls from "./components/AppointmentPaginationControls";
import AppointmentPaymentModal from "./components/AppointmentPaymentModal";
import AppointmentDeleteModal from "./components/AppointmentDeleteModal";

const NewAppointmentForm = dynamic(
  () => import("../calendar/components/NewAppointmentForm"),
  { ssr: false }
);

export default function AppointmentsPage() {
  const dispatch = useAppDispatch();

  // Hide body scrollbar when component mounts
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      // Restore scrollbar when component unmounts
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  // RTK Query hooks for appointments
  const {
    data: appointmentsData = [],
    isLoading,
    refetch,
  } = glowvitaApi.useGetAppointmentsQuery(
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
  const [deleteAppointment, { isLoading: isDeleting }] =
    glowvitaApi.useDeleteAppointmentMutation();
  const [collectPayment, { isLoading: isProcessingPayment }] =
    glowvitaApi.useCollectPaymentMutation();

  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | "view">("add");

  // Filter and paginate appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(
      (appt) =>
        (appt.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appt.service?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "all" ||
          appt.status === statusFilter ||
          (statusFilter === "completed without payment" &&
            appt.status === "completed without payment"))
    );
  }, [appointments, searchTerm, statusFilter]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredAppointments.slice(
    firstItemIndex,
    lastItemIndex
  );
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  // Modal handlers
  const handleOpenModal = (
    type: "add" | "edit" | "view",
    appointment?: Appointment
  ) => {
    setModalType(type);
    setSelectedAppointment(appointment || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleOpenDeleteModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleOpenPaymentModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedAppointment(null);
  };

  // Form submission handler
  const handleFormSubmit = async (appointmentData: Appointment) => {
    try {
      if (modalType === "edit" && selectedAppointment?._id) {
        // For updates, we need to separate the ID and exclude metadata fields
        const { _id, createdAt, updatedAt, ...updates } = appointmentData;

        // Call the update mutation with properly structured data
        await updateAppointment({
          _id: selectedAppointment._id, // Use the ID from selectedAppointment
          ...updates, // Spread the rest of the appointment data
        }).unwrap();

        toast.success("Appointment updated successfully");
      } else {
        // For new appointments, ensure we're not sending _id or other metadata fields
        const { _id, createdAt, updatedAt, ...newAppointment } =
          appointmentData;
        await createAppointment(newAppointment).unwrap();
        toast.success("Appointment created successfully");
      }

      // Refresh the appointments list
      refetch();
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving appointment:", error);
      toast.error(
        error?.data?.message || "Failed to save appointment. Please try again."
      );
    }
  };

  // Delete appointment handler
  const handleDeleteAppointment = async () => {
    if (!selectedAppointment?._id) return;

    try {
      await deleteAppointment(selectedAppointment._id).unwrap();
      toast.success("Appointment deleted successfully");
      handleCloseDeleteModal();
      // The RTK Query cache will be automatically updated due to the 'Appointments' tag invalidation
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Failed to delete appointment");
    }
  };

  // Payment collection handler
  const handleCollectPayment = async (
    amount: number,
    paymentMethod: string,
    notes: string,
    paymentAt: string
  ) => {
    if (!selectedAppointment?._id) return;

    const toastId = toast.loading("Processing payment...");
    try {
      // Call backend so it records payment history with paymentDate
      await collectPayment({
        appointmentId: selectedAppointment._id,
        amount: amount,
        paymentMethod: paymentMethod,
        notes: notes,
        paymentDate: new Date(paymentAt).toISOString(),
      }).unwrap();

      toast.success("Payment collected successfully", {
        description: `₹${amount.toFixed(2)} received via ${paymentMethod}`,
      });

      handleClosePaymentModal();
      refetch();
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment", {
        description:
          error?.data?.message || error.message || "Please try again.",
      });
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Enhanced Header Section matching marketplace design */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                Appointments
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                Manage your appointments and track scheduling
              </p>
            </div>
          </div>
        </div>

        {/* Appointment Stats Cards */}
        <AppointmentStatsCards appointments={appointments} />

        {/* Filters Toolbar */}
        <AppointmentFiltersToolbar
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          onAddAppointment={() => handleOpenModal('add')}
          exportData={filteredAppointments}
          exportFilename="appointments_export"
          exportTitle="Appointments Report"
          exportColumns={[
            { header: 'Client', key: 'clientName' },
            {
              header: 'Services',
              key: 'serviceName',
              transform: (val, item) => item.serviceItems?.length > 0
                ? item.serviceItems.map((s: any) => s.serviceName).join(', ')
                : val
            },
            {
              header: 'Staff',
              key: 'staffName',
              transform: (val, item) => item.serviceItems?.length > 0
                ? item.serviceItems.map((s: any) => s.staffName).join(', ')
                : val
            },
            {
              header: 'Date',
              key: 'date',
              transform: (val) => new Date(val).toLocaleDateString()
            },
            {
              header: 'Time',
              key: 'startTime',
              transform: (val, item) => `${val} - ${item.endTime}`
            },
            { header: 'Duration (min)', key: 'duration' },
            {
              header: 'Amount',
              key: 'totalAmount',
              transform: (val, item) => `₹${((item as any).finalAmount || val || 0).toFixed(2)}`
            },
            { header: 'Status', key: 'status' }
          ]}
        />

        {/* Appointments Table */}
        <div className="flex-1 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
              <AppointmentTable
                appointments={appointments}
                isLoading={isLoading}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                currentItems={currentItems}
                onOpenModal={handleOpenModal}
                onOpenPaymentModal={handleOpenPaymentModal}
                onOpenDeleteModal={handleOpenDeleteModal}
              />
            </CardContent>
          </Card>
        </div>

        {/* Pagination Controls */}
        <AppointmentPaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredAppointments.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1); // Reset to first page when changing items per page
          }}
        />

        {/* Appointment Form Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl w-[95vw] sm:w-full h-[90vh] max-h-[90vh] p-0 overflow-hidden flex flex-col">
            <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-background z-10">
              <DialogTitle className="text-lg sm:text-xl">
                {modalType === "add"
                  ? "New Appointment"
                  : modalType === "edit"
                    ? "Edit Appointment"
                    : "Appointment Details"}
              </DialogTitle>
              <DialogDescription>
                {modalType === "add"
                  ? "Create a new appointment"
                  : modalType === "edit"
                    ? "Edit appointment details"
                    : "View appointment details"}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 pb-6 -mt-1">
              {modalType === "view" && selectedAppointment ? (
                <div className="pr-1">
                  <AppointmentDetailCard
                    appointment={selectedAppointment}
                    onEdit={() => {
                      setModalType("edit");
                    }}
                    onDelete={() => {
                      setIsModalOpen(false);
                      handleOpenDeleteModal(selectedAppointment);
                    }}
                    onClose={() => setIsModalOpen(false)}
                  />
                </div>
              ) : (
                <NewAppointmentForm
                  defaultValues={
                    selectedAppointment
                      ? {
                        ...selectedAppointment,
                        status: selectedAppointment.status as
                          | "scheduled"
                          | "confirmed"
                          | "in_progress"
                          | "completed"
                          | "partially-completed"
                          | "completed without payment"
                          | "cancelled"
                          | "no_show"
                          | undefined,
                      }
                      : undefined
                  }
                  isEditing={modalType === "edit"}
                  onSubmit={handleFormSubmit}
                  onCancel={handleCloseModal}
                  onSuccess={handleCloseModal}
                  onDelete={
                    modalType === "edit" && selectedAppointment
                      ? () => {
                        setIsModalOpen(false);
                        handleOpenDeleteModal(selectedAppointment!);
                      }
                      : undefined
                  }
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <AppointmentDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onDelete={handleDeleteAppointment}
          selectedAppointment={selectedAppointment}
          isDeleting={isDeleting}
        />

        {/* Payment Collection Modal */}
        <AppointmentPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          onCollectPayment={handleCollectPayment}
          selectedAppointment={selectedAppointment}
          isProcessing={isProcessingPayment}
        />
      </div>
    </div>
  );
}
