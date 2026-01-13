import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Dialog, DialogContent } from "@repo/ui/dialog";
import { Calendar, Clock, Scissors, User, DollarSign, Info, X, Edit, Trash2, FileText, Printer, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Appointment, ServiceItem } from '@repo/types';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useGetVendorProfileQuery } from '@repo/store/services/api';
import { AppointmentInvoice } from '@/components/AppointmentInvoice';

interface AppointmentDetailCardProps {
  appointment: Appointment;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function AppointmentDetailCard({ appointment, onEdit, onDelete, onClose }: AppointmentDetailCardProps) {
  const [showInvoice, setShowInvoice] = useState(false);
  const { data: vendorProfile, isLoading: isVendorLoading } = useGetVendorProfileQuery({});

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

  // Calculate totals for services and add-ons
  const { totalBaseAmount, totalAddOnsAmount } = useMemo(() => {
    if (appointment.serviceItems && appointment.serviceItems.length > 0) {
      const base = appointment.serviceItems.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
      const addOns = appointment.serviceItems.reduce((sum: number, item: any) => {
        const itemAddOns = Array.isArray(item.addOns) ? item.addOns : [];
        return sum + itemAddOns.reduce((aSum: number, a: any) => aSum + (Number(a.price) || 0), 0);
      }, 0);
      return { totalBaseAmount: base, totalAddOnsAmount: addOns };
    }
    return {
      totalBaseAmount: Number(appointment.amount) || 0,
      totalAddOnsAmount: Number((appointment as any).addOnsAmount) || 0
    };
  }, [appointment]);

  // Invoice Data Memo (Consistently calculated as in AppointmentDetailView)
  const invoiceData = useMemo(() => {
    if (!appointment) return null;

    return {
      invoiceNumber: (() => {
        const dateStr = appointment.date instanceof Date
          ? appointment.date.toISOString().split('T')[0].replace(/-/g, '')
          : String(appointment.date).split('T')[0].replace(/-/g, '');
        const salonName = vendorProfile?.data?.businessName?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 10) || 'SALON';
        const uniqueId = (appointment as any)._id ? (appointment as any)._id.substring((appointment as any)._id.length - 6).toUpperCase() : '000';
        return `INV-${dateStr}-${salonName}-${uniqueId}`;
      })(),
      date: appointment.date instanceof Date ? appointment.date.toLocaleDateString() : String(appointment.date).split('T')[0],
      time: appointment.startTime,
      client: {
        fullName: appointment.clientName,
        phone: (appointment as any).client?.phone || (appointment as any).clientPhone || ''
      },
      status: appointment.status,
      items: appointment.serviceItems?.length ? (appointment.serviceItems as any[]).map(item => ({
        name: item.serviceName,
        price: item.amount,
        quantity: 1,
        totalPrice: item.amount,
        discount: 0,
        staff: item.staffName
      })) : [{
        name: appointment.serviceName,
        price: appointment.amount,
        quantity: 1,
        totalPrice: appointment.amount,
        discount: appointment.discount || 0,
        staff: appointment.staffName
      }],
      subtotal: Number(totalBaseAmount + totalAddOnsAmount),
      originalSubtotal: Number(totalBaseAmount + totalAddOnsAmount),
      discount: Number(discountAmount),
      tax: Number(serviceTax),
      platformFee: Number(platformFee),
      total: Number(totalAmount),
      balance: Number(remainingAmount),
      paymentMethod: paymentMethod
    };
  }, [appointment, totalAmount, remainingAmount, vendorProfile, discountAmount, serviceTax, platformFee, paymentMethod]);

  const handleDownloadPdf = async () => {
    const toastId = toast.loading('Generating PDF...');
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('invoice-content');

      if (!element) throw new Error('Invoice element not found');

      const clone = element.cloneNode(true) as HTMLElement;
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      container.style.backgroundColor = 'white';
      container.appendChild(clone);
      document.body.appendChild(container);

      const buttons = clone.querySelector('[data-html2canvas-ignore="true"]');
      if (buttons) (buttons as HTMLElement).style.display = 'none';

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Invoice_${(appointment as any)._id?.substring((appointment as any)._id.length - 6).toUpperCase() || 'INV'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(clone).save();
      document.body.removeChild(container);
      toast.success('Invoice downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download invoice', { description: error?.message || 'Please try again.' });
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handlePrintPdf = async () => {
    const toastId = toast.loading('Preparing print preview...');
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('invoice-content');

      if (!element) throw new Error('Invoice element not found');

      const clone = element.cloneNode(true) as HTMLElement;
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      container.style.backgroundColor = 'white';
      container.appendChild(clone);
      document.body.appendChild(container);

      const buttons = clone.querySelector('[data-html2canvas-ignore="true"]');
      if (buttons) (buttons as HTMLElement).style.display = 'none';

      const opt = {
        margin: [10, 10, 10, 10],
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const pdfBlob = await html2pdf().set(opt).from(clone).output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(url, '_blank');

      if (printWindow) {
        printWindow.focus();
      } else {
        toast.error('Pop-up blocked. Please allow pop-ups to view print preview.');
      }

      document.body.removeChild(container);
    } catch (error: any) {
      console.error('Error printing PDF:', error);
      toast.error('Failed to prepare print preview', { description: error?.message || 'Please try again.' });
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{appointment.clientName}</h3>
          <p className="text-sm text-gray-500">Appointment Details</p>
        </div>
        <div className="flex gap-2">
          {(appointment.status === 'completed' || appointment.status === 'completed without payment') && (
            <Button
              variant="outline"
              onClick={() => setShowInvoice(true)}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Invoice
            </Button>
          )}
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

      <div className="grid gap-4 md:grid-cols-2 items-stretch">
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-lg font-medium">
              {format(new Date(appointment.date), 'MMMM d, yyyy')}
            </div>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              {appointment.startTime} - {appointment.endTime} ({appointment.duration} min)
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Status & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
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

        <Card className="flex flex-col h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <User className="h-4 w-4 mr-2" />
              {appointment.serviceItems?.length ? 'Services & Staff' : 'Service & Staff'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
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

                    {/* Add-ons for current service */}
                    {Array.isArray(item.addOns) && item.addOns.length > 0 && (
                      <div className="mt-2 pl-6 space-y-1">
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Add-ons</div>
                        {item.addOns.map((addOn: any, aIdx: number) => (
                          <div key={aIdx} className="flex justify-between items-center text-xs text-gray-600">
                            <span>+ {addOn.name}</span>
                            <span>₹{Number(addOn.price || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
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

        <Card className="flex flex-col h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex justify-between text-sm">
              <span>Service Amount:</span>
              <span>₹{Number(totalBaseAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Add-on Amount:</span>
              <span>₹{Number(totalAddOnsAmount).toFixed(2)}</span>
            </div>
            {Number(discountAmount) > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Discount:</span>
                <span>-₹{Number(discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-700">
              <span>Service Tax:</span>
              <span>₹{Number(serviceTax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Platform Fee:</span>
              <span>₹{Number(platformFee).toFixed(2)}</span>
            </div>
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

      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full p-0">
          <div className="sticky top-0 z-10 flex justify-end gap-2 p-4 bg-background border-b shadow-sm print:hidden">
            <Button size="sm" variant="outline" onClick={handlePrintPdf}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowInvoice(false)} title="Close Invoice">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
          <div className="p-6">
            {isVendorLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              showInvoice && vendorProfile && invoiceData && (
                <AppointmentInvoice
                  invoiceData={invoiceData as any}
                  vendorName={vendorProfile?.data?.businessName || 'Salon'}
                  vendorProfile={vendorProfile || {}}
                  taxRate={0}
                  isOrderSaved={true}
                  onEmailClick={() => console.log('Email clicked')}
                  onRebookClick={() => console.log('Rebook clicked')}
                />
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}