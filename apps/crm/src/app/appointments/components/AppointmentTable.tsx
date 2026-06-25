import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Button } from "@repo/ui/button";
import { CalendarCheck, Clock, Eye, Edit, Trash2 } from 'lucide-react';
import { Appointment } from '@repo/types';

interface AppointmentTableProps {
  appointments: Appointment[];
  isLoading: boolean;
  searchTerm: string;
  statusFilter: string;
  currentItems: Appointment[];
  onOpenModal: (type: 'add' | 'edit' | 'view', appointment?: Appointment) => void;
  onOpenPaymentModal: (appointment: Appointment) => void;
  onOpenDeleteModal: (appointment: Appointment) => void;
}

const AppointmentTable = ({
  appointments,
  isLoading,
  searchTerm,
  statusFilter,
  currentItems,
  onOpenModal,
  onOpenPaymentModal,
  onOpenDeleteModal
}: AppointmentTableProps) => {
  // Format status for display
  const formatStatus = (status: string) => {
    // Handle the special case for 'completed without payment'
    if (status === 'completed without payment') {
      return 'Completed Without Payment';
    }
    return status.split(/[-_]/).map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Format services display with count when multiple services exist
  const formatServicesDisplay = (appointment: Appointment) => {
    if (appointment.serviceItems && appointment.serviceItems.length > 0) {
      if (appointment.serviceItems.length === 1) {
        // Single service - show the service name
        return appointment.serviceItems[0].serviceName;
      } else {
        // Multiple services - show first service name + count
        const firstName = appointment.serviceItems[0].serviceName;
        const additionalCount = appointment.serviceItems.length - 1;
        return `${firstName} +${additionalCount}`;
      }
    } else {
      // Fallback to single service name
      return appointment.serviceName || 'N/A';
    }
  };

  // Format staff display with count when multiple staff exist
  const formatStaffDisplay = (appointment: Appointment) => {
    if (appointment.serviceItems && appointment.serviceItems.length > 0) {
      if (appointment.serviceItems.length === 1) {
        // Single staff - show the staff name
        return appointment.serviceItems[0].staffName;
      } else {
        // Multiple staff - show first staff name + count
        const firstStaff = appointment.serviceItems[0].staffName;
        const additionalCount = appointment.serviceItems.length - 1;
        return `${firstStaff} +${additionalCount}`;
      }
    } else {
      // Fallback to single staff name
      return appointment.staffName || 'N/A';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
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
                <TableCell colSpan={12} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Loading appointments...
                  </div>
                </TableCell>
              </TableRow>
            ) : currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' ? 'No appointments found matching your criteria' : 'No appointments scheduled'}
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((appointment) => {
                const totalAmount = (appointment as any).finalAmount ?? appointment.totalAmount ?? (appointment as any).amount ?? 0;
                const paidAmount = (appointment as any).amountPaid ?? appointment.payment?.paid ?? 0;
                const remainingAmount = Math.max(0, Number(totalAmount) - Number(paidAmount));

                // Check if appointment is in the future (after today)
                const isFutureAppointment = new Date(new Date(appointment.date).setHours(0, 0, 0, 0)) > new Date(new Date().setHours(0, 0, 0, 0));

                return (
                  <TableRow key={appointment._id}>
                    <TableCell className="font-medium">
                      {appointment.clientName}
                      <div className="text-xs text-muted-foreground">
                        {appointment.clientPhone || 'No phone'}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatServicesDisplay(appointment)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatStaffDisplay(appointment)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarCheck className="h-4 w-4 text-gray-500" />
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3" />
                        {(() => {
                          if (appointment.serviceItems && appointment.serviceItems.length > 0) {
                            const firstItem = appointment.serviceItems[0];
                            const lastItem = appointment.serviceItems[appointment.serviceItems.length - 1];
                            if (firstItem.startTime && lastItem.endTime) {
                              return `${firstItem.startTime} - ${lastItem.endTime}`;
                            }
                          }
                          return `${appointment.startTime} - ${appointment.endTime}`;
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        if (appointment.serviceItems && appointment.serviceItems.length > 0) {
                          const total = appointment.serviceItems.reduce((sum, item) => sum + (Number(item.duration) || 0), 0);
                          return `${total} min`;
                        }
                        return `${appointment.duration} min`;
                      })()}
                    </TableCell>
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${((appointment as any).paymentStatus || appointment.payment?.paymentStatus) === 'completed'
                        ? 'bg-green-100 text-green-800' :
                        ((appointment as any).paymentStatus || appointment.payment?.paymentStatus) === 'pending'
                          ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {(() => {
                          // Map the backend payment status to more user-friendly terms
                          const status = (appointment as any).paymentStatus || appointment.payment?.paymentStatus || 'pending';
                          const amountPaid = Number((appointment as any).amountPaid ?? 0) || 0;
                          const totalAmountNum = Number((appointment as any).finalAmount ?? appointment.totalAmount ?? 0) || 0;

                          switch (status) {
                            case 'completed': return 'PAID';
                            case 'pending':
                              if (amountPaid > 0 && totalAmountNum > 0) {
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'completed without payment' ? 'bg-orange-100 text-orange-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              appointment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                appointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                  appointment.status === 'no_show' ? 'bg-orange-100 text-orange-800' :
                                    appointment.status === 'partially-completed' ? 'bg-indigo-100 text-indigo-800' :
                                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                          }`}>
                          {formatStatus(appointment.status)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {remainingAmount > 0 &&
                          appointment.status !== 'cancelled' &&
                          ((appointment as any).paymentStatus || appointment.payment?.paymentStatus) !== 'completed' && (
<<<<<<< HEAD
                            <div className="relative group/tip">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onOpenPaymentModal(appointment)}
                                className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </Button>
                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-foreground px-2 py-0.5 text-[10px] font-medium text-background opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50">
                                Collect Payment
                              </span>
                            </div>
=======
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onOpenPaymentModal(appointment)}
                              className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              title={isFutureAppointment ? "Cannot collect payment before appointment date" : "Collect Payment"}
                              disabled={isFutureAppointment}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </Button>
>>>>>>> 890575206c9edb6f59bbcfe018217c5ec6b79988
                          )}
                        <div className="relative group/tip">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenModal('view', appointment)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-foreground px-2 py-0.5 text-[10px] font-medium text-background opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50">
                            View
                          </span>
                        </div>
                        {(appointment.status !== 'completed' && appointment.status !== 'completed without payment') && !(
                          ((appointment as any).mode === 'online' || (appointment as any).payment?.bookingSource === 'web') &&
                          ((appointment as any).paymentStatus === 'completed' || (appointment as any).paymentStatus === 'paid' || (appointment as any).payment?.paymentStatus === 'completed' || (appointment as any).payment?.paymentStatus === 'paid')
                        ) && !appointment.isWeddingService && !appointment.isHomeService && (
                            <div className="relative group/tip">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onOpenModal('edit', appointment)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-foreground px-2 py-0.5 text-[10px] font-medium text-background opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50">
                                Edit
                              </span>
                            </div>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AppointmentTable;