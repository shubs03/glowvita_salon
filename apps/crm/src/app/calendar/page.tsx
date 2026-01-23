"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@repo/ui/dialog";
import { Label } from "@repo/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import {
  ChevronLeft,
  Plus,
  Clock,
  User,
  Calendar as CalendarIcon,
  Clock3,
  X,
  CalendarDays,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronDown,
  Scissors,
  Loader2,
  Power,
  BarChart3,
} from "lucide-react";
import NewAppointmentForm, {
  Appointment,
} from "./components/NewAppointmentForm";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { cn } from "@repo/ui/cn";
import { useSelector, useDispatch } from "react-redux";
import { useAppDispatch } from "@repo/store/hooks";
import {
  selectSelectedAppointment,
  setSelectedAppointment,
} from "@repo/store/slices/appointmentSlice";
import AddBlockTime from "@/components/AddBlockTime";
import {
  reset,
  selectBlockedTimes,
  selectBlockedTimesByStaffAndDate,
  selectBlockTimeStatus,
  selectBlockTimeError,
  fetchBlockTimes,
  removeBlockTime,
} from "@repo/store/slices/blockTimeSlice";
import { glowvitaApi } from "@repo/store/api";
import { startOfDay, endOfDay, isSameDay } from "date-fns";
import { useCrmAuth } from "@/hooks/useCrmAuth";

// Define valid statuses from the AppointmentModel
const validStatuses = ["confirmed", "cancelled"];
const staffMembers = ["All Staff"];

// Import components
import AppointmentListSection from "./components/AppointmentListSection";
import AppointmentStatistics from "./components/AppointmentStatistics";

interface CancelAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (reason: string) => Promise<void>;
  isSubmitting: boolean;
  selectedAppointment: any;
}

const CancelAppointmentDialog: React.FC<CancelAppointmentDialogProps> = ({
  open,
  onOpenChange,
  onCancel,
  isSubmitting,
  selectedAppointment,
}) => {
  const [reason, setReason] = useState("");

  const handleSubmit = async () => {
    if (!reason) return;
    await onCancel(reason);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this appointment? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="cancelReason" className="text-sm font-medium">
              Reason
            </label>
            <textarea
              id="cancelReason"
              className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter the reason for cancellation"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
          >
            {isSubmitting ? "Cancelling..." : "Cancel Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<"month" | "time">("month");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlockTimeModalOpen, setIsBlockTimeModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState("All Staff");
  const [selectedDateForBlock, setSelectedDateForBlock] = useState<Date | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isBlockingTime, setIsBlockingTime] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [isClinicAvailable, setIsClinicAvailable] = useState(true);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { role } = useCrmAuth();

  // Fetch blocked times when component mounts
  useEffect(() => {
    dispatch(fetchBlockTimes());
  }, [dispatch]);

  // RTK Query hooks for appointments with proper cache invalidation
  const {
    data: appointmentsData,
    isLoading: isLoadingAppointments,
    refetch,
  } = glowvitaApi.useGetAppointmentsQuery(
    {
      startDate: startOfDay(new Date()).toISOString(),
      endDate: endOfDay(
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      ).toISOString(),
    },
    {
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );

  const { data: staffData = [], isLoading: isLoadingStaff } =
    glowvitaApi.useGetStaffQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });

  const selectedStaffId = useMemo(() => {
    if (!selectedStaff || selectedStaff === "All Staff") return null;
    return (
      staffData.find((staff: any) => staff.fullName === selectedStaff)?._id ||
      null
    );
  }, [selectedStaff, staffData]);

  const [createAppointment, { isLoading: isCreating }] =
    glowvitaApi.useCreateAppointmentMutation();
  const [updateAppointment, { isLoading: isUpdating }] =
    glowvitaApi.useUpdateAppointmentMutation();
  const [deleteAppointment, { isLoading: isDeleting }] =
    glowvitaApi.useDeleteAppointmentMutation();
  const [updateAppointmentStatus] =
    glowvitaApi.useUpdateAppointmentStatusMutation();

  const selectedAppointment = useSelector(selectSelectedAppointment);
  const blockedTimes = useSelector((state) =>
    (selectBlockedTimesByStaffAndDate as any)(state, {
      staffId: selectedStaff === "All Staff" ? undefined : selectedStaffId,
      date: currentDate,
    })
  );

  const blockTimeStatus = useSelector(selectBlockTimeStatus);
  const blockTimeError = useSelector(selectBlockTimeError);
  const today = new Date();

  // Handle block time success/error
  useEffect(() => {
    if (blockTimeStatus === "succeeded" && isBlockingTime) {
      toast.success("Time blocked successfully");
      setIsBlockingTime(false);
      setIsBlockTimeModalOpen(false);
    } else if (blockTimeStatus === "failed" && isBlockingTime) {
      toast.error(blockTimeError || "Failed to block time");
      setIsBlockingTime(false);
    }
  }, [blockTimeStatus, blockTimeError, isBlockingTime]);

  // Transform API data
  const appointments: Appointment[] = useMemo(() => {
    if (!appointmentsData || !Array.isArray(appointmentsData)) return [];
    return appointmentsData.map((appt: any) => ({
      id: appt._id || appt.id,
      client: appt.client || appt.clientName,
      clientName: appt.clientName || appt.client,
      service: appt.service,
      serviceName: appt.serviceName,
      staff: appt.staff,
      staffName: appt.staffName,
      date: new Date(appt.date),
      startTime: appt.startTime,
      endTime: appt.endTime,
      duration: appt.duration,
      notes: appt.notes || "",
      status: appt.status || "scheduled",
      paymentStatus: appt.paymentStatus || "pending",
      amount: appt.amount || 0,
      discount: appt.discount || 0,
      tax: appt.tax || 0,
      totalAmount: appt.totalAmount || appt.amount || 0,
      finalAmount: appt.finalAmount || appt.totalAmount || appt.amount || 0,
      mode: appt.mode, // Only include if it exists in backend
      // Multi-service appointment fields
      isMultiService: appt.isMultiService || false,
      serviceItems: appt.serviceItems || [],
      payment: appt.payment,
    }));
  }, [appointmentsData]);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [currentDate]);

  const firstDayOfMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month, 1).getDay();
  }, [currentDate]);

  const todaysAppointments = useMemo(() => {
    return appointments
      .filter(
        (a) =>
          isSameDay(a.date, today) &&
          (selectedStaff === "All Staff" || a.staffName === selectedStaff)
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, selectedStaff, today]);

  const selectedDateAppointments = useMemo(() => {
    return appointments
      .filter(
        (a) =>
          isSameDay(a.date, selectedDate) &&
          (selectedStaff === "All Staff" || a.staffName === selectedStaff)
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, selectedDate, selectedStaff]);

  const handlePrev = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNext = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    if (window.event && (window.event as KeyboardEvent).ctrlKey) {
      handleOpenBlockTimeModal(clickedDate);
      return;
    }
    const year = clickedDate.getFullYear();
    const month = String(clickedDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const dateString = `${year}-${month}-${dayStr}`;
    router.push(`/calendar/${dateString}`);
  };

  const handleNewAppointment = useCallback(() => {
    // For doctors, toggle clinic availability instead of opening appointment form
    if (role === "doctor") {
      const newAvailability = !isClinicAvailable;
      setIsClinicAvailable(newAvailability);
      toast.success(`Clinic is now ${newAvailability ? "OPEN" : "CLOSED"}`);
      return;
    }

    // For vendors/staff, open the appointment form
    dispatch(setSelectedAppointment(null));
    setIsEditing(false);
    setIsModalOpen(true);
  }, [dispatch, role, isClinicAvailable]);

  const handleOpenBlockTimeModal = useCallback(
    (date: Date) => {
      setSelectedDateForBlock(date);
      dispatch(reset());
      setIsBlockTimeModalOpen(true);
    },
    [dispatch]
  );

  const handleCloseBlockTimeModal = useCallback(() => {
    setIsBlockTimeModalOpen(false);
    setSelectedDateForBlock(null);
  }, []);

  const handleEditAppointment = useCallback(
    (appointment: Appointment) => {
      dispatch(setSelectedAppointment(appointment));
      setIsEditing(true);
      setIsModalOpen(true);
    },
    [dispatch]
  );

  const handleFormSubmit = useCallback(
    async (appointmentData: Appointment) => {
      try {
        console.log("📝 Form submission - received data:", appointmentData);

        // Prepare the appointment data
        let dataToSubmit = { ...appointmentData };

        // If creating a new appointment, ensure the date is properly formatted
        if (!isEditing) {
          // For new appointments, preserve the date from the form data
          // The form should already have the correct date set
          console.log(
            "📝 Creating new appointment with date:",
            dataToSubmit.date
          );
        }

        if (isEditing && selectedAppointment) {
          // If editing a cancelled appointment, reset status to confirmed
          const currentStatus =
            selectedAppointment.status || selectedAppointment.status;
          if (currentStatus === "cancelled" || currentStatus === "missed") {
            dataToSubmit.status = "confirmed";
          }

          // For updates, use the original ID
          const updateData = {
            ...dataToSubmit,
            id: selectedAppointment.id || selectedAppointment._id,
            _id: selectedAppointment._id || selectedAppointment.id,
          };
          console.log("📝 Updating appointment with data:", updateData);
          await updateAppointment(updateData).unwrap();
          toast.success("Appointment updated successfully");
        } else {
          // For new appointments
          console.log("📝 Creating appointment with data:", dataToSubmit);
          await createAppointment(dataToSubmit).unwrap();
          toast.success("Appointment created successfully");
        }

        // Close modal and reset state
        setIsModalOpen(false);
        setIsEditing(false);
        dispatch(setSelectedAppointment(null));

        // Refresh the appointments list
        await refetch();
      } catch (error: any) {
        console.error("Error saving appointment:", error);
        toast.error(
          `Failed to ${isEditing ? "update" : "create"} appointment: ${
            error?.data?.message || error.message || "Unknown error"
          }`
        );
      }
    },
    [
      createAppointment,
      updateAppointment,
      dispatch,
      isEditing,
      selectedAppointment,
      refetch,
    ]
  );

  const handleDeleteAppointment = useCallback(
    async (id: string) => {
      if (window.confirm("Are you sure you want to delete this appointment?")) {
        try {
          await deleteAppointment(id).unwrap();
          setIsModalOpen(false);
          setIsEditing(false);
          dispatch(setSelectedAppointment(null));
          toast.success("Appointment deleted successfully");
          await refetch();
        } catch (error: any) {
          console.error("Failed to delete appointment:", error);
          toast.error(
            `Failed to delete appointment: ${error?.data?.message || error.message || "Unknown error"}`
          );
        }
      }
    },
    [deleteAppointment, dispatch, refetch]
  );

  const handleCancelAppointment = async (reason: string) => {
    if (!selectedAppointmentId) {
      toast.error("No appointment selected");
      return;
    }

    try {
      setIsCancelling(true);

      await updateAppointmentStatus({
        id: selectedAppointmentId,
        status: "cancelled",
        cancellationReason: reason,
      }).unwrap();

      toast.success("Appointment cancelled successfully");
      setShowCancelDialog(false);
      setCancelReason("");
      setSelectedAppointmentId(null);
      await refetch();
    } catch (error: any) {
      console.error("Error cancelling appointment:", error);
      toast.error(error?.data?.message || "Failed to cancel appointment");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleUpdateAppointmentStatus = async (
    id: string,
    status: string,
    reason: string = ""
  ) => {
    try {
      await updateAppointmentStatus({
        id,
        status,
        cancellationReason: status === "cancelled" ? reason : undefined,
      }).unwrap();
      toast.success("Appointment status updated successfully");
      await refetch();
    } catch (error: any) {
      console.error("Failed to update appointment:", error);
      toast.error(
        `Failed to update status: ${error?.data?.message || error.message || "Unknown error"}`
      );
      throw error;
    }
  };

  const confirmCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }
    if (!selectedAppointmentId) {
      toast.error("No appointment selected");
      return;
    }
    try {
      await handleUpdateAppointmentStatus(
        selectedAppointmentId,
        "cancelled",
        cancelReason
      );
      setShowCancelDialog(false);
      setCancelReason("");
      setSelectedAppointmentId(null);
    } catch (error: any) {
      console.error("Failed to cancel appointment:", error);
      toast.error(
        `Failed to cancel appointment: ${error?.data?.message || error.message || "Unknown error"}`
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "scheduled":
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      case "missed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    dispatch(setSelectedAppointment(null));
  };

  interface AppointmentMenuProps {
    appointment: Appointment;
    onView: () => void;
    onEdit: () => void;
    onDelete?: () => void;
    onCancel?: () => void;
  }

  const AppointmentMenu: React.FC<AppointmentMenuProps> = ({
    appointment,
    onView,
    onEdit,
    onDelete,
    onCancel,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setShowStatusMenu(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleStatusChange = async (status: string) => {
      if (status === "cancelled") {
        setSelectedAppointmentId((appointment.id || appointment._id) ?? null);
        dispatch(setSelectedAppointment(appointment));
        setShowCancelDialog(true);
        setShowStatusMenu(false);
        setIsOpen(false);
        return;
      }

      try {
        setIsUpdatingStatus(true);
        const appointmentId = appointment._id || appointment.id;
        await updateAppointmentStatus({
          id: appointmentId,
          status,
        }).unwrap();
        toast.success(`Appointment marked as ${status}`);
        setShowStatusMenu(false);
        setIsOpen(false);
      } catch (error) {
        console.error("Error updating status:", error);
        toast.error("Failed to update appointment status");
      } finally {
        setIsUpdatingStatus(false);
      }
    };

    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
            setShowStatusMenu(false);
          }}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </button>

              {appointment.status !== "completed" &&
                appointment.status !== "completed without payment" &&
                appointment.status !== "cancelled" && (
                  <div className="relative">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowStatusMenu(!showStatusMenu);
                      }}
                    >
                      <div className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-blue-500" />
                        <span>Change Status</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${showStatusMenu ? "rotate-180" : ""}`}
                      />
                    </button>

                    {showStatusMenu && (
                      <div className="absolute left-0 right-0 mt-1 w-full bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-30">
                        <div className="py-1">
                          {["confirmed", "cancelled"].map((status) => (
                            <button
                              key={status}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(status);
                              }}
                              disabled={isUpdatingStatus}
                              className={cn(
                                "w-full text-left px-4 py-2 text-sm flex items-center transition-colors",
                                status === "cancelled" || status === "no-show"
                                  ? "text-red-600 hover:bg-red-50"
                                  : status === "completed"
                                    ? "text-green-600 hover:bg-green-50"
                                    : status === "confirmed"
                                      ? "text-blue-600 hover:bg-blue-50"
                                      : "text-yellow-600 hover:bg-yellow-50",
                                isUpdatingStatus &&
                                  "opacity-50 cursor-not-allowed"
                              )}
                            >
                              {status === "cancelled" ? (
                                <XCircle className="mr-2 h-4 w-4" />
                              ) : (
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                              )}
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                              {isUpdatingStatus &&
                                status === appointment.status && (
                                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {appointment.status !== "completed" &&
                appointment.status !== "completed without payment" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Reschedule/Edit Appointment
                  </button>
                )}
            </div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const checkAndMarkMissedAppointments = async () => {
      if (!appointmentsData || !Array.isArray(appointmentsData)) return;

      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeInMinutes = currentHours * 60 + currentMinutes;

      const appointmentsToUpdate = appointmentsData.filter(
        (appointment: any) => {
          // Skip if already marked as completed, cancelled, or missed
          // Also skip 'partially-completed' as it indicates a payment has started
          if (
            [
              "completed",
              "cancelled",
              "missed",
              "partially-completed",
            ].includes(appointment.status)
          ) {
            return false;
          }

          const appointmentDate = new Date(appointment.date);
          const isToday = isSameDay(appointmentDate, now);

          if (isToday && appointment.startTime) {
            const [hours, minutes] = appointment.startTime
              .split(":")
              .map(Number);
            const startTimeInMinutes = hours * 60 + minutes;

            // Check if more than 30 minutes past start time
            if (currentTimeInMinutes > startTimeInMinutes + 30) {
              return true;
            }
          }

          appointmentDate.setHours(0, 0, 0, 0);
          const startOfToday = new Date(now);
          startOfToday.setHours(0, 0, 0, 0);

          // Check if appointment date is before today
          return appointmentDate < startOfToday;
        }
      );

      // Update all eligible appointments in parallel
      if (appointmentsToUpdate.length > 0) {
        try {
          await Promise.all(
            appointmentsToUpdate.map((appointment: any) => {
              const apptDate = new Date(appointment.date);
              const isToday = isSameDay(apptDate, now);

              return updateAppointmentStatus({
                id: appointment._id || appointment.id,
                status: isToday ? "cancelled" : "missed",
                cancellationReason: isToday
                  ? "Automatically cancelled - 30 minutes past start time without completion"
                  : "Automatically marked as missed - appointment date has passed",
              }).unwrap();
            })
          );
          // Refetch to update the UI
          refetch();
        } catch (error) {
          console.error("Error updating appointment statuses:", error);
        }
      }
    };

    // Run the check when the component mounts and when appointments data changes
    checkAndMarkMissedAppointments();
  }, [appointmentsData, updateAppointmentStatus, refetch]);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
              Bookings Calendar
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
              Manage your appointments and schedule.
            </p>
          </div>
        </div>
      </div>
      
      {/* Filters and Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-6">
        <div className="flex gap-2">
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="w-full sm:w-[180px] h-12">
              <SelectValue placeholder="Select Staff" />
            </SelectTrigger>
            <SelectContent>
              {staffMembers.map((staff) => (
                <SelectItem key={staff} value={staff}>
                  {staff}
                </SelectItem>
              ))}
              {staffData.map((staff: any) => (
                <SelectItem key={staff.fullName} value={staff.fullName}>
                  {staff.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {role === "doctor" ? (
            <Button
              onClick={handleNewAppointment}
              className={cn(
                "transition-colors h-10 px-4 flex-1 sm:flex-none",
                isClinicAvailable
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              )}
            >
              <Power className="mr-2 h-4 w-4" />
              {isClinicAvailable ? "Clinic ON" : "Clinic OFF"}
            </Button>
          ) : (
            <Button
              onClick={handleNewAppointment}
              className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90 flex-1"
              disabled={isCreating}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          )}
          <Button
            onClick={() => handleOpenBlockTimeModal(new Date())}
            className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90 flex-1"
          >
            <Clock3 className="mr-2 h-4 w-4" /> Block Time
          </Button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - All Appointments (Primary) */}
        <div className="flex-1 flex flex-col min-h-0">
          <AppointmentListSection
            appointments={appointments}
            currentDate={currentDate}
            isLoadingAppointments={isLoadingAppointments}
            handleEditAppointment={handleEditAppointment}
            handleDeleteAppointment={handleDeleteAppointment}
          />
        </div>

        {/* Right Column - Calendar and Stats (Sticky) */}
        <div className="lg:w-[380px] flex-shrink-0 lg:sticky lg:top-6 lg:self-start">
          <div className="space-y-6">
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePrev}
                        className="h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h2 className="text-lg font-semibold min-w-[180px] text-center">
                        {currentDate.toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        })}
                      </h2>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNext}
                        className="h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentDate(new Date())}
                      className="h-8 px-3 text-sm"
                    >
                      Today
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingAppointments ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="text-gray-500">Loading appointments...</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-7 border-t border-l border-gray-200">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day, index) => (
                        <div
                          key={`day-${index}`}
                          className="text-center font-medium p-2 bg-muted text-xs h-15 flex items-center justify-center"
                        >
                          {day}
                        </div>
                      )
                    )}
                    {Array(firstDayOfMonth)
                      .fill(null)
                      .map((_, i) => (
                        <div
                          key={`blank-${i}`}
                          className="h-10 border-r border-b bg-muted/30"
                        ></div>
                      ))}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                      (day) => {
                        const date = new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          day
                        );
                        const isToday = isSameDay(today, date);
                        const isSelected = isSameDay(selectedDate, date);
                        const appointmentsForDay = appointments.filter(
                          (a) =>
                            isSameDay(a.date, date) &&
                            (selectedStaff === "All Staff" ||
                              a.staffName === selectedStaff)
                        );

                        return (
                          <div
                            key={day}
                            className={cn(
                              "h-10 border-r border-b border-gray-200 p-2 flex flex-col items-center cursor-pointer transition-colors",
                              isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                            )}
                            onClick={() => handleDayClick(day)}
                          >
                            <div
                              className={cn(
                                "flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full",
                                isToday
                                  ? "bg-blue-600 text-white"
                                  : isSelected
                                    ? "bg-blue-100 text-blue-700"
                                    : "text-gray-700"
                              )}
                            >
                              {day}
                            </div>
                            {/* Removed appointment dots - keeping only the date number */}
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            <AppointmentStatistics appointments={appointments} />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Appointment" : "New Appointment"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update the appointment details"
                  : "Create a new appointment"}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <NewAppointmentForm
                defaultDate={
                  selectedAppointment?.date
                    ? new Date(selectedAppointment.date)
                    : new Date()
                }
                defaultValues={selectedAppointment || undefined}
                isEditing={isEditing}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setIsModalOpen(false);
                  setIsEditing(false);
                  dispatch(setSelectedAppointment(null));
                }}
                onSuccess={() => {
                  setIsModalOpen(false);
                  setIsEditing(false);
                  dispatch(setSelectedAppointment(null));
                }}
                onDelete={
                  isEditing
                    ? async (id) => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this appointment?"
                          )
                        ) {
                          try {
                            await deleteAppointment(id).unwrap();
                            toast.success("Appointment deleted successfully");
                            setIsModalOpen(false);
                            setIsEditing(false);
                            dispatch(setSelectedAppointment(null));
                            await refetch();
                          } catch (error) {
                            console.error("Error deleting appointment:", error);
                            toast.error("Failed to delete appointment");
                          }
                        }
                      }
                    : undefined
                }
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog
        open={isBlockTimeModalOpen}
        onOpenChange={setIsBlockTimeModalOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Block Time</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <AddBlockTime
              open={isBlockTimeModalOpen}
              onClose={handleCloseBlockTimeModal}
              initialDate={selectedDateForBlock?.toISOString().split("T")[0]}
              staffMembers={staffData}
              defaultStaffId={selectedStaffId}
            />
          </div>
        </DialogContent>
      </Dialog>

      <CancelAppointmentDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onCancel={(reason) => handleCancelAppointment(reason)}
        isSubmitting={isCancelling}
        selectedAppointment={selectedAppointment}
      />
    </div>
    </div>
  );
}
