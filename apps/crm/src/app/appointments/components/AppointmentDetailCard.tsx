import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Calendar, Clock, Scissors, User, DollarSign, Info, X, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Appointment, ServiceItem } from '../../../../../../packages/types/src/appointment';

interface AppointmentDetailCardProps {
  appointment: Appointment;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function AppointmentDetailCard({ appointment, onEdit, onDelete, onClose }: AppointmentDetailCardProps) {
  const statusColors = {
    scheduled: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-800',
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Compute payment-related values consistently with list and modal
  const totalAmount = (appointment as any).finalAmount ?? appointment.totalAmount ?? appointment.amount ?? 0;
  const paidAmount = (appointment as any).amountPaid ?? (appointment as any).payment?.paid ?? 0;
  const remainingAmount = Math.max(0, Number(totalAmount) - Number(paidAmount));
  const discountAmount = (appointment as any).discountAmount ?? appointment.discount ?? 0;
  const serviceTax = (appointment as any).serviceTax ?? 0;
  const platformFee = (appointment as any).platformFee ?? 0;
  const paymentMethod = (appointment as any).paymentMethod ?? (appointment as any).payment?.paymentMethod ?? null;
  const paymentStatus = (appointment as any).paymentStatus ?? (appointment as any).payment?.paymentStatus ?? null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{appointment.clientName}</h3>
          <p className="text-sm text-gray-500">Appointment Details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          <Button variant="outline" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {format(new Date(appointment.date), 'MMMM d, yyyy')}
            </div>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              {appointment.startTime} - {appointment.endTime} ({appointment.duration} min)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <User className="h-4 w-4 mr-2" />
              {appointment.serviceItems?.length ? 'Services & Staff' : 'Service & Staff'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointment.serviceItems?.length ? (
              <div className="space-y-4">
                {appointment.serviceItems.map((item: ServiceItem, index: number) => (
                  <div key={item._id || index} className="border-b pb-3 last:border-b-0 last:pb-0 last:mb-0">
                    <div className="flex items-center text-sm">
                      <Scissors className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{item.serviceName}</div>
                        <div className="text-gray-600 text-xs mt-1">
                          {item.startTime} - {item.endTime} • {item.duration} min
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm mt-2 ml-6">
                      <User className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700">{item.staffName}</span>
                    </div>
                    <div className="text-right text-sm font-medium mt-1">
                      ₹{item.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center text-sm">
                  <Scissors className="h-4 w-4 mr-2 text-gray-400" />
                  {appointment.serviceName}
                </div>
                <div className="flex items-center text-sm mt-2">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  {appointment.staffName}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span>Amount:</span>
              <span>₹{Number(appointment.amount ?? totalAmount).toFixed(2)}</span>
            </div>
            {Number(discountAmount) > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Discount:</span>
                <span>-₹{Number(discountAmount).toFixed(2)}</span>
              </div>
            )}
            {Number(serviceTax) > 0 && (
              <div className="flex justify-between text-sm text-gray-700">
                <span>Service Tax:</span>
                <span>₹{Number(serviceTax).toFixed(2)}</span>
              </div>
            )}
            {Number(platformFee) > 0 && (
              <div className="flex justify-between text-sm text-gray-700">
                <span>Platform Fee:</span>
                <span>₹{Number(platformFee).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium mt-1 pt-2 border-t">
              <span>Total:</span>
              <span>₹{Number(totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span>Already Paid:</span>
              <span className="text-green-700 font-medium">₹{Number(paidAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>Remaining:</span>
              <span className="text-orange-700 font-semibold">₹{Number(remainingAmount).toFixed(2)}</span>
            </div>
            {(paymentMethod || paymentStatus) && (
              <div className="flex items-center justify-between text-xs text-gray-600 mt-3">
                <span>Method: {paymentMethod ?? '—'}</span>
                <span>Status: {paymentStatus ? String(paymentStatus).toUpperCase() : '—'}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Status & Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={`mb-3 ${statusColors[appointment.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                }`}
            >
              {formatStatus(appointment.status)}
            </Badge>
            {appointment.notes && (
              <div className="mt-2 text-sm bg-gray-50 p-3 rounded-md">
                <p className="font-medium text-gray-700 mb-1">Notes:</p>
                <p className="text-gray-600">
                  {appointment.notes.includes('Appointment cancelled:')
                    ? appointment.notes.split('Appointment cancelled:')[1].trim()
                    : appointment.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}